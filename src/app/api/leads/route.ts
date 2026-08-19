import { NextRequest, NextResponse } from "next/server";
import { getSavedLeads } from "@/lib/db";
import { LeadStatus } from "@/types/lead";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "all") as LeadStatus | "all";
    const campaignId = searchParams.get("campaignId") || "all";
    const search = searchParams.get("search") || "";

    const leads = getSavedLeads({ status, campaignId, search });

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch CRM leads." },
      { status: 500 }
    );
  }
}
