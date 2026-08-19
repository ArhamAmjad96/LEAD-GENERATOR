import OpenAI from "openai";
import { Lead, AIAnalysis } from "@/types/lead";

/**
 * Intelligent deterministic sales pitch generator (fallback or fast mode)
 */
export function generateDeterministicPitch(lead: Lead): AIAnalysis {
  const reviews = lead.reviewCount || 0;
  const rating = lead.rating ? `${lead.rating}★` : "high ratings";
  const name = lead.businessName;
  const category = lead.category || "business";
  const status = lead.websiteStatus || "none";

  let whyContact = "";
  let pitchAngle = "";
  let websiteWeaknesses: string[] = [];
  let coldCallScript = "";

  if (status === "none") {
    whyContact = `The business has established local credibility on Google (${rating} with ${reviews} reviews) but operates with zero dedicated website presence.`;
    pitchAngle = `"You already have ${reviews > 0 ? `more than ${reviews} Google reviews` : "great credibility on Google"}, so customers clearly trust your ${category}. I noticed you're currently relying entirely on Google Maps rather than having your own dedicated website to capture and convert traffic."`;
    websiteWeaknesses = [
      "No dedicated website domain to capture high-intent search traffic",
      "Missing automated direct booking / contact funnel",
      "Losing potential clients to competitors with professional web pages",
      "Cannot showcase full service menu or case studies",
    ];
    coldCallScript = `"Hi, I'm calling for ${name}. I was looking at your Google profile and saw your impressive ${rating} reputation with ${reviews} reviews. However, I noticed you don't have a dedicated website for clients to book directly. We build modern, fast websites specifically for ${category}s that convert your strong Google reputation into predictable new client inquiries. Would you be open to a quick 5-minute preview this week?"`;
  } else if (status === "social_only") {
    whyContact = `The business actively uses social media (${lead.website}) but lacks a professional website domain for search authority and automated customer conversion.`;
    pitchAngle = `"Your social media presence is great, but directing Google and ad traffic to a Facebook/Instagram page causes high drop-offs compared to a dedicated, high-speed landing page with instant booking."`;
    websiteWeaknesses = [
      "Social media pages have high bounce rates for commercial searches",
      "Cannot track Google Ads conversion pixels effectively",
      "Missing dedicated custom email address and domain authority",
    ];
    coldCallScript = `"Hi! I noticed ${name} has great ratings on Google and an active social profile. However, sending searchers to a social page loses high-ticket customers who want instant booking. We specialize in building dedicated, high-converting websites for ${category}s. Could I send over a 2-minute demo of what your site could look like?"`;
  } else if (status === "unreachable") {
    whyContact = `The business has an active Google Maps profile, but its configured website URL is currently down or unreachable, actively burning customer trust.`;
    pitchAngle = `"Your website listed on Google Maps is currently down or throwing connection errors, which means potential customers searching for your ${category} are bouncing to competitors."`;
    websiteWeaknesses = [
      "Website domain is broken, throwing HTTP errors or timing out",
      "Active loss of prospective customers searching Google Maps",
      "Damages Google organic SEO rankings",
    ];
    coldCallScript = `"Hi, this is a quick courtesy call for ${name}. I noticed on your Google Maps listing that your website is currently not loading and showing an error. We help local businesses fix and revamp their web infrastructure. Would you like us to send a quick fix report?"`;
  } else {
    // Active website with potential weaknesses from audit
    const audit = lead.audit;
    const isMobileIssue = audit && !audit.mobileViewport;
    const isHttpsIssue = audit && !audit.https;
    const isSlow = audit && audit.responseTimeMs && audit.responseTimeMs > 2000;

    whyContact = `The business is established with ${reviews} Google reviews, but its existing website lacks modern mobile responsiveness and direct conversion funnels.`;
    pitchAngle = `"Your clinic has a strong reputation, but your current website is missing ${isMobileIssue ? "mobile optimization" : isHttpsIssue ? "SSL security" : "clear instant-booking funnels"}, causing mobile visitors to drop off."`;
    websiteWeaknesses = [
      isMobileIssue ? "Not optimized for mobile smartphones (missing viewport)" : "Dated layout structure",
      isHttpsIssue ? "Missing HTTPS SSL security certificate" : "Lacks direct WhatsApp click-to-chat integration",
      isSlow ? `Slow response time (${audit?.responseTimeMs}ms)` : "No automated booking CTA",
    ];
    coldCallScript = `"Hi! I'm calling for ${name}. You have a stellar ${rating} rating on Google. I took a look at your website and noticed a few conversion bottlenecks on mobile that are likely costing you bookings. We help local businesses redesign their websites into high-converting booking machines. Would you be open to seeing a quick 3-point audit?"`;
  }

  return {
    whyContact,
    pitchAngle,
    websiteWeaknesses,
    coldCallScript,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Analyzes a lead with OpenAI GPT model or falls back to intelligent deterministic copywriting
 */
export async function analyzeLeadWithAI(lead: Lead): Promise<AIAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    console.log("[AI ENGINE] OPENAI_API_KEY not provided — using deterministic sales generator");
    return generateDeterministicPitch(lead);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `You are a world-class B2B website sales consultant and cold calling expert.
Analyze this local business lead scraped from Google Maps and create a punchy, actionable sales outreach pitch to sell them a modern website redesign or new website.

BUSINESS DATA:
- Business Name: ${lead.businessName}
- Category: ${lead.category || "Local Business"}
- Location: ${lead.address || lead.city || "Local area"}
- Phone: ${lead.phone || "N/A"}
- Google Rating: ${lead.rating || "N/A"} (${lead.reviewCount || 0} reviews)
- Website Status: ${lead.websiteStatus}
- Website URL: ${lead.website || "None"}
- Audit Info: ${JSON.stringify(lead.audit || {})}
- Lead Opportunity Score: ${lead.score}/10

INSTRUCTIONS:
1. Only use provided business information. Do not invent facts, revenue, or fake staff names.
2. Return a strict JSON object with these exact keys:
   - "whyContact": A concise paragraph explaining why this business is a high-value website sales lead.
   - "pitchAngle": A direct opening quote/value proposition focusing on their Google reputation vs missing/weak website.
   - "websiteWeaknesses": An array of 3-4 specific technical/conversion weaknesses.
   - "coldCallScript": A natural 30-second conversational opening script for cold calling or WhatsApp outreach.

JSON:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        whyContact: parsed.whyContact || "",
        pitchAngle: parsed.pitchAngle || "",
        websiteWeaknesses: Array.isArray(parsed.websiteWeaknesses) ? parsed.websiteWeaknesses : [],
        coldCallScript: parsed.coldCallScript || "",
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("[AI ENGINE ERROR] OpenAI call failed, falling back to deterministic generator:", error);
  }

  return generateDeterministicPitch(lead);
}
