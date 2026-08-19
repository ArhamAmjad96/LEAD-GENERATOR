import { WebsiteStatus, WebsiteAuditResult } from "@/types/lead";

export interface ScoreCalculationResult {
  score: number;
  reason: string;
  websiteStatus: WebsiteStatus;
}

/**
 * Deterministic lead scoring (1-10) based on website presence and audit results
 */
export function calculateOpportunityScore(
  initialStatus: WebsiteStatus,
  audit: WebsiteAuditResult | null
): ScoreCalculationResult {
  // 1. No Website
  if (initialStatus === "none") {
    return {
      score: 10,
      reason: "No dedicated website found",
      websiteStatus: "none",
    };
  }

  // 2. Social Media Only
  if (initialStatus === "social_only") {
    return {
      score: 9,
      reason: "Social page only (no dedicated website)",
      websiteStatus: "social_only",
    };
  }

  // 3. If audit failed or unreachable
  if (audit && !audit.reachable) {
    return {
      score: 9,
      reason: "Website is down, broken, or unreachable",
      websiteStatus: "unreachable",
    };
  }

  // If no audit available, default to 6
  if (!audit) {
    return {
      score: 6,
      reason: "Website available",
      websiteStatus: "website",
    };
  }

  // 4. Audit Scoring Calculation for Active Websites
  // We evaluate positive factors:
  // - HTTPS (+15)
  // - Mobile viewport (+25)
  // - Page title (+10)
  // - Meta description (+10)
  // - Phone visible (+10)
  // - Contact CTA (+15)
  // - WhatsApp available (+10)
  // - Booking CTA (+10)
  // - Fast response time (< 1000ms: +15, < 2500ms: +5)
  let qualityPoints = 0;
  if (audit.https) qualityPoints += 15;
  if (audit.mobileViewport) qualityPoints += 25;
  if (audit.pageTitle) qualityPoints += 10;
  if (audit.metaDescription) qualityPoints += 10;
  if (audit.phoneVisible) qualityPoints += 10;
  if (audit.contactCTA) qualityPoints += 15;
  if (audit.whatsappAvailable) qualityPoints += 10;
  if (audit.bookingCTA) qualityPoints += 10;

  if (audit.responseTimeMs !== null) {
    if (audit.responseTimeMs < 1000) qualityPoints += 15;
    else if (audit.responseTimeMs < 2500) qualityPoints += 5;
  }

  // Score mapping:
  // Quality < 35  -> Lead Score 8 (Very weak website opportunity)
  // Quality 35-55 -> Lead Score 7 (Weak website opportunity)
  // Quality 55-75 -> Lead Score 6 (Average website)
  // Quality 75-90 -> Lead Score 4 (Good website)
  // Quality > 90  -> Lead Score 2 (Strong website)
  if (qualityPoints < 35) {
    const missingItems = [];
    if (!audit.https) missingItems.push("missing SSL/HTTPS");
    if (!audit.mobileViewport) missingItems.push("not mobile responsive");
    return {
      score: 8,
      reason: `Very weak website — ${missingItems.join(", ") || "lacks modern essentials"}`,
      websiteStatus: "website",
    };
  }

  if (qualityPoints < 55) {
    const missingItems = [];
    if (!audit.mobileViewport) missingItems.push("missing mobile viewport");
    if (!audit.contactCTA) missingItems.push("no clear contact CTA");
    return {
      score: 7,
      reason: `Weak website — ${missingItems.join(", ") || "lacks conversion elements"}`,
      websiteStatus: "website",
    };
  }

  if (qualityPoints < 75) {
    return {
      score: 6,
      reason: "Average website — functional but lacks modern booking/conversion channels",
      websiteStatus: "website",
    };
  }

  if (qualityPoints < 90) {
    return {
      score: 4,
      reason: "Good website — mobile-friendly and fast with contact options",
      websiteStatus: "website",
    };
  }

  return {
    score: 2,
    reason: "Strong website — fast, secure, mobile-friendly with active conversion funnels",
    websiteStatus: "website",
  };
}
