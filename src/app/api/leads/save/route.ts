import { NextRequest, NextResponse } from "next/server";
import { saveOrUpdateLead, bulkSaveLeads } from "@/lib/db";
import { Lead } from "@/types/lead";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, leads, campaignId } = body;

    if (Array.isArray(leads) && leads.length > 0) {
      const result = bulkSaveLeads(leads, campaignId);
      return NextResponse.json({
        success: true,
        savedCount: result.saved,
        leads: result.leads,
      });
    }

    if (lead && lead.businessName) {
      const saved = saveOrUpdateLead(lead as Lead, campaignId);
      return NextResponse.json({
        success: true,
        lead: saved,
      });
    }

    return NextResponse.json(
      { error: "Invalid lead payload. Expected 'lead' or 'leads' array." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/leads/save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save lead(s) to CRM." },
      { status: 500 }
    );
  }
}
