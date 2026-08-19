import { WebsiteAuditResult } from "@/types/lead";

/**
 * Safely audits a website URL server-side with strict 5s timeout
 */
export async function auditWebsite(url: string): Promise<WebsiteAuditResult> {
  const startTime = Date.now();
  const isHttps = url.toLowerCase().startsWith("https://");

  const defaultFailedAudit: WebsiteAuditResult = {
    reachable: false,
    https: isHttps,
    statusCode: null,
    mobileViewport: false,
    pageTitle: false,
    metaDescription: false,
    phoneVisible: false,
    whatsappAvailable: false,
    contactCTA: false,
    bookingCTA: false,
    responseTimeMs: null,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LeadForgeAudit/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (!response.ok && response.status >= 400) {
      return {
        ...defaultFailedAudit,
        statusCode: response.status,
        responseTimeMs,
      };
    }

    const html = await response.text();
    const htmlLower = html.toLowerCase();

    // Check Mobile Viewport tag
    const mobileViewport =
      htmlLower.includes('name="viewport"') ||
      htmlLower.includes("name='viewport'") ||
      htmlLower.includes("name=viewport");

    // Check Title tag
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = Boolean(titleMatch && titleMatch[1].trim().length > 0);

    // Check Meta Description
    const metaDescription =
      htmlLower.includes('name="description"') ||
      htmlLower.includes("name='description'");

    // Check WhatsApp availability
    const whatsappAvailable =
      htmlLower.includes("wa.me/") ||
      htmlLower.includes("api.whatsapp.com") ||
      htmlLower.includes("whatsapp:") ||
      htmlLower.includes("whatsapp.com/send");

    // Check Phone number patterns
    const phoneVisible =
      htmlLower.includes("tel:") ||
      /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(html);

    // Check Contact CTA links
    const contactCTA =
      htmlLower.includes("mailto:") ||
      htmlLower.includes("/contact") ||
      htmlLower.includes("contact-us") ||
      htmlLower.includes("get in touch") ||
      htmlLower.includes("contact us");

    // Check Booking CTA
    const bookingCTA =
      htmlLower.includes("book appointment") ||
      htmlLower.includes("schedule appointment") ||
      htmlLower.includes("/book") ||
      htmlLower.includes("online booking") ||
      htmlLower.includes("reserve");

    return {
      reachable: true,
      https: response.url ? response.url.startsWith("https://") : isHttps,
      statusCode: response.status,
      mobileViewport,
      pageTitle,
      metaDescription,
      phoneVisible,
      whatsappAvailable,
      contactCTA,
      bookingCTA,
      responseTimeMs,
    };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    return {
      ...defaultFailedAudit,
      responseTimeMs: elapsed,
    };
  }
}
