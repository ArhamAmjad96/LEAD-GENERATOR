import { NextRequest, NextResponse } from "next/server";
import { searchGoogleMapsLeads } from "@/lib/apify";
import { LeadFilterParams } from "@/types/lead";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      category,
      location,
      limit = 20,
      phoneRequired = true,
      includeNoWebsite = true,
      includeHasWebsite = true,
      minRating = 0,
      minReviews = 0,
      minScore = 0,
    } = body;

    // 1. Validate Input
    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { error: "Business category is required (e.g. Dentist, Real Estate, Plumber)." },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json(
        { error: "Location is required (e.g. Islamabad, Pakistan or Austin, TX)." },
        { status: 400 }
      );
    }

    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 200);

    const filters: LeadFilterParams = {
      phoneRequired: Boolean(phoneRequired),
      includeNoWebsite: Boolean(includeNoWebsite),
      includeHasWebsite: Boolean(includeHasWebsite),
      minRating: Number(minRating) || 0,
      minReviews: Number(minReviews) || 0,
      minScore: Number(minScore) || 0,
    };

    // 2. Execute Scraper + Availability Audit + Opportunity Scoring
    const result = await searchGoogleMapsLeads(
      category.trim(),
      location.trim(),
      parsedLimit,
      filters
    );

    // 3. Return Clean JSON with Metrics
    return NextResponse.json({
      success: true,
      category: category.trim(),
      location: location.trim(),
      limit: parsedLimit,
      runId: result.runId,
      datasetId: result.datasetId,
      status: result.status,
      metrics: result.metrics,
      leads: result.leads,
    });
  } catch (error: any) {
    console.error("[API /api/leads/search error]:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred while searching leads.",
      },
      { status: 500 }
    );
  }
}
