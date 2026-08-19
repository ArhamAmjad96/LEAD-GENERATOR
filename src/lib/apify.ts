import { Lead, WebsiteStatus, LeadFilterParams, LeadSearchMetrics } from "@/types/lead";
import { auditWebsite } from "./audit";
import { calculateOpportunityScore } from "./scoring";

export interface ApifyRawPlace {
  title?: string;
  name?: string;
  categoryName?: string;
  categories?: string[];
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  url?: string;
  address?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  totalScore?: number;
  rating?: number;
  reviewsCount?: number;
  userRatingsTotal?: number;
  placeId?: string;
  id?: string;
  cid?: string;
  isPermanentlyClosed?: boolean;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
  location?: {
    lat?: number;
    lng?: number;
  };
}

export interface ApifySearchEngineResult {
  success: boolean;
  runId: string;
  datasetId: string;
  status: string;
  metrics: LeadSearchMetrics;
  leads: Lead[];
}

/**
 * Normalizes phone numbers for accurate comparison (digits + leading plus)
 */
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) return null;
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Normalizes string by trimming, lowercasing, and collapsing whitespace
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Checks website URL to determine initial status:
 * 'none' | 'social_only' | 'website'
 */
export function detectWebsiteStatus(website: string | null): WebsiteStatus {
  if (!website || website.trim() === "") {
    return "none";
  }

  const socialDomains = [
    "facebook.com",
    "fb.com",
    "instagram.com",
    "tiktok.com",
    "linkedin.com",
    "twitter.com",
    "x.com",
    "youtube.com",
    "pinterest.com",
  ];

  try {
    const urlLower = website.toLowerCase();
    const isSocial = socialDomains.some((domain) => urlLower.includes(domain));
    if (isSocial) {
      return "social_only";
    }
  } catch {
    // URL parsing fallback
  }

  return "website";
}

/**
 * Normalizes raw Apify Google Maps Place item into clean Lead structure
 */
export function normalizeApifyLead(raw: ApifyRawPlace, index: number): Lead | null {
  const businessName = (raw.title || raw.name || "").trim();
  if (!businessName || businessName.length < 2) {
    return null;
  }

  const category =
    raw.categoryName ||
    (Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories[0] : null);

  const phone = (raw.phone || raw.phoneUnformatted || null)?.trim() || null;
  const rawWebsite = (raw.website || null)?.trim() || null;
  const website = rawWebsite && rawWebsite.startsWith("http")
    ? rawWebsite
    : rawWebsite
    ? `https://${rawWebsite}`
    : null;

  const address = (raw.address || raw.street || null)?.trim() || null;
  const rating = raw.totalScore ?? raw.rating ?? null;
  const reviewCount = raw.reviewsCount ?? raw.userRatingsTotal ?? null;

  let googleMapsUrl: string | null = raw.url || null;
  if (!googleMapsUrl && raw.placeId) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}&query_place_id=${raw.placeId}`;
  } else if (!googleMapsUrl && raw.cid) {
    googleMapsUrl = `https://maps.google.com/?cid=${raw.cid}`;
  }

  const id = raw.placeId || raw.id || `lead-${Date.now()}-${index}`;
  const websiteStatus = detectWebsiteStatus(website);

  return {
    id,
    businessName,
    category: category || null,
    phone,
    website,
    address,
    rating: typeof rating === "number" ? Math.round(rating * 10) / 10 : null,
    reviewCount: typeof reviewCount === "number" ? reviewCount : null,
    googleMapsUrl,
    score: websiteStatus === "none" ? 10 : websiteStatus === "social_only" ? 9 : 6,
    leadReason: websiteStatus === "none" ? "No dedicated website found" : websiteStatus === "social_only" ? "Social page only (no dedicated website)" : "Website available",
    websiteStatus,
    status: "new",
    audit: null,
  };
}

/**
 * Cleans, deduplicates, audits websites, and applies scoring and filters
 */
export async function processAndFilterLeads(
  rawPlaces: ApifyRawPlace[],
  filters: LeadFilterParams
): Promise<{ leads: Lead[]; metrics: LeadSearchMetrics }> {
  const discoveredCount = rawPlaces.length;
  let closedRemoved = 0;
  let duplicatesRemoved = 0;
  let noPhoneRemoved = 0;

  const seenPlaceIds = new Set<string>();
  const seenPhones = new Set<string>();
  const seenNameAndAddress = new Set<string>();

  const preQualifiedLeads: Lead[] = [];

  // Step 1: Clean & Deduplicate
  for (let i = 0; i < rawPlaces.length; i++) {
    const raw = rawPlaces[i];

    // Filter out closed businesses
    if (raw.isPermanentlyClosed || raw.permanentlyClosed || raw.temporarilyClosed) {
      closedRemoved++;
      continue;
    }

    // Normalize
    const lead = normalizeApifyLead(raw, i);
    if (!lead) {
      continue;
    }

    // Deduplication check
    const placeIdKey = raw.placeId ? `id:${raw.placeId}` : raw.cid ? `cid:${raw.cid}` : null;
    const phoneNorm = normalizePhoneNumber(lead.phone);
    const phoneKey = phoneNorm ? `phone:${phoneNorm}` : null;
    const nameNorm = normalizeString(lead.businessName);
    const addrNorm = normalizeString(lead.address);
    const nameAddrKey = nameNorm && addrNorm ? `nameaddr:${nameNorm}|${addrNorm}` : null;

    let isDuplicate = false;
    if (placeIdKey && seenPlaceIds.has(placeIdKey)) {
      isDuplicate = true;
    } else if (phoneKey && seenPhones.has(phoneKey)) {
      isDuplicate = true;
    } else if (nameAddrKey && seenNameAndAddress.has(nameAddrKey)) {
      isDuplicate = true;
    }

    if (isDuplicate) {
      duplicatesRemoved++;
      continue;
    }

    if (placeIdKey) seenPlaceIds.add(placeIdKey);
    if (phoneKey) seenPhones.add(phoneKey);
    if (nameAddrKey) seenNameAndAddress.add(nameAddrKey);

    // Phone filter
    if (filters.phoneRequired && !lead.phone) {
      noPhoneRemoved++;
      continue;
    }

    preQualifiedLeads.push(lead);
  }

  // Step 2: Concurrently audit websites for leads with active URLs
  const auditedLeads = await Promise.all(
    preQualifiedLeads.map(async (lead) => {
      if (lead.website && lead.websiteStatus === "website") {
        try {
          const auditResult = await auditWebsite(lead.website);
          const scoreInfo = calculateOpportunityScore(lead.websiteStatus, auditResult);
          return {
            ...lead,
            audit: auditResult,
            score: scoreInfo.score,
            leadReason: scoreInfo.reason,
            websiteStatus: scoreInfo.websiteStatus,
          };
        } catch {
          const scoreInfo = calculateOpportunityScore(lead.websiteStatus, null);
          return {
            ...lead,
            score: scoreInfo.score,
            leadReason: scoreInfo.reason,
          };
        }
      } else {
        const scoreInfo = calculateOpportunityScore(lead.websiteStatus || "none", null);
        return {
          ...lead,
          score: scoreInfo.score,
          leadReason: scoreInfo.reason,
          websiteStatus: scoreInfo.websiteStatus,
        };
      }
    })
  );

  // Step 3: Apply User Filters
  const finalFiltered = auditedLeads.filter((lead) => {
    // Website filter
    const hasWeb = lead.websiteStatus !== "none";
    if (!hasWeb && !filters.includeNoWebsite) {
      return false;
    }
    if (hasWeb && !filters.includeHasWebsite) {
      return false;
    }

    // Rating filter
    if (filters.minRating > 0) {
      if (lead.rating === null || lead.rating < filters.minRating) {
        return false;
      }
    }

    // Reviews filter
    if (filters.minReviews > 0) {
      const count = lead.reviewCount || 0;
      if (count < filters.minReviews) {
        return false;
      }
    }

    // Score filter
    if (filters.minScore > 0) {
      if (lead.score < filters.minScore) {
        return false;
      }
    }

    return true;
  });

  // Step 4: Sort Best Opportunities First (Score Descending: 10 down to 1, then Reviews descending)
  finalFiltered.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  });

  return {
    leads: finalFiltered,
    metrics: {
      discoveredCount,
      qualifiedCount: finalFiltered.length,
      duplicatesRemoved,
      noPhoneRemoved,
      closedRemoved,
    },
  };
}

/**
 * Executes the Apify Google Maps Scraper Actor (compass/crawler-google-places) with full qualification
 */
export async function searchGoogleMapsLeads(
  category: string,
  location: string,
  limit: number = 20,
  filters: LeadFilterParams = {
    phoneRequired: true,
    includeNoWebsite: true,
    includeHasWebsite: true,
    minRating: 0,
    minReviews: 0,
    minScore: 0,
  }
): Promise<ApifySearchEngineResult> {
  const token = process.env.APIFY_TOKEN?.trim();

  console.log(`\n========================================`);
  console.log(`[APIFY SCRAPER ENGINE] Initializing Qualification Engine`);
  console.log(`[APIFY SCRAPER ENGINE] APIFY_TOKEN configured: ${Boolean(token)}`);

  if (!token) {
    console.error(`[APIFY SCRAPER ENGINE ERROR] APIFY_TOKEN is missing from environment.`);
    throw new Error(
      "APIFY_TOKEN is missing. Please add APIFY_TOKEN to your .env.local file to fetch live Google Maps data."
    );
  }

  const actorId = "compass~crawler-google-places";
  const targetLimit = Math.min(Math.max(limit, 1), 200);

  const actorInput = {
    searchStringsArray: [category],
    locationQuery: location,
    maxCrawledPlacesPerSearch: targetLimit,
    language: "en",
    skipClosedPlaces: true,
  };

  console.log(`[APIFY SCRAPER ENGINE] Target Actor: compass/crawler-google-places`);
  console.log(`[APIFY SCRAPER ENGINE] Actor Input:`, JSON.stringify(actorInput, null, 2));

  // 1. Start the Actor Run
  const startUrl = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`;
  const startRes = await fetch(startUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actorInput),
  });

  if (!startRes.ok) {
    const errText = await startRes.text();
    console.error(`[APIFY SCRAPER ENGINE ERROR] Failed to start Actor (${startRes.status}):`, errText);
    throw new Error(`Apify Actor start failed (${startRes.status}): ${errText}`);
  }

  const startData = await startRes.json();
  const runId: string = startData.data?.id;
  const defaultDatasetId: string = startData.data?.defaultDatasetId;
  let currentStatus: string = startData.data?.status || "READY";

  console.log(`[APIFY SCRAPER ENGINE] Actor Started Successfully!`);
  console.log(`[APIFY SCRAPER ENGINE] Run ID: ${runId}`);
  console.log(`[APIFY SCRAPER ENGINE] Default Dataset ID: ${defaultDatasetId}`);
  console.log(`[APIFY SCRAPER ENGINE] Initial Run Status: ${currentStatus}`);

  if (!runId || !defaultDatasetId) {
    throw new Error("Invalid run response from Apify API (missing runId or defaultDatasetId).");
  }

  // 2. Poll for Actor Completion safely (poll every 2.5s, up to 120s)
  const maxAttempts = 48;
  let attempts = 0;
  let isFinished = false;

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const pollUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`;
    const pollRes = await fetch(pollUrl);

    if (!pollRes.ok) continue;

    const pollData = await pollRes.json();
    currentStatus = pollData.data?.status || "UNKNOWN";
    console.log(`[APIFY SCRAPER ENGINE] Polling [${attempts}/${maxAttempts}] - Current Status: ${currentStatus}`);

    if (currentStatus === "SUCCEEDED") {
      isFinished = true;
      break;
    } else if (
      currentStatus === "FAILED" ||
      currentStatus === "ABORTED" ||
      currentStatus === "TIMED-OUT"
    ) {
      console.error(`[APIFY SCRAPER ENGINE ERROR] Actor run ended with failure status: ${currentStatus}`);
      throw new Error(`Apify Google Maps scraping run ended with status: ${currentStatus}`);
    }
  }

  if (!isFinished) {
    console.error(`[APIFY SCRAPER ENGINE ERROR] Actor run polling timed out after 120 seconds.`);
    throw new Error("Apify scraping run timed out waiting for completion. Try requesting fewer leads.");
  }

  // 3. Fetch dataset items
  const datasetUrl = `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${token}&clean=true`;
  const datasetRes = await fetch(datasetUrl);

  if (!datasetRes.ok) {
    const errText = await datasetRes.text();
    console.error(`[APIFY SCRAPER ENGINE ERROR] Failed to retrieve dataset items:`, errText);
    throw new Error(`Failed to retrieve dataset items from Apify: ${errText}`);
  }

  const rawItems: ApifyRawPlace[] = await datasetRes.json();
  const rawList = Array.isArray(rawItems) ? rawItems : [];
  console.log(`[APIFY SCRAPER ENGINE] Retrieved ${rawList.length} raw dataset items from Apify.`);

  // 4. Process, Audit Websites, Deduplicate, Score & Sort
  const { leads, metrics } = await processAndFilterLeads(rawList, filters);

  console.log(`[APIFY SCRAPER ENGINE] Qualification & Audit Summary:`);
  console.log(`  - Discovered (Raw): ${metrics.discoveredCount}`);
  console.log(`  - Closed Businesses Removed: ${metrics.closedRemoved}`);
  console.log(`  - Duplicates Removed: ${metrics.duplicatesRemoved}`);
  console.log(`  - No Phone Removed: ${metrics.noPhoneRemoved}`);
  console.log(`  - Final Qualified Leads: ${metrics.qualifiedCount}`);
  console.log(`========================================\n`);

  return {
    success: true,
    runId,
    datasetId: defaultDatasetId,
    status: currentStatus,
    metrics,
    leads,
  };
}
