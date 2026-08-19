import { NextRequest, NextResponse } from "next/server";
import { analyzeLeadWithAI } from "@/lib/openai";
import { updateLeadDetails } from "@/lib/db";
import { Lead } from "@/types/lead";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead } = body;

    if (!lead || !lead.businessName) {
      return NextResponse.json(
        { error: "Invalid lead payload. Business name required." },
        { status: 400 }
      );
    }

    const aiAnalysis = await analyzeLeadWithAI(lead as Lead);

    // If lead has an ID in CRM, persist the AI analysis
    if (lead.id) {
      updateLeadDetails(lead.id, { aiAnalysis });
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      aiAnalysis,
    });
  } catch (error: any) {
    console.error("POST /api/leads/ai error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI analysis." },
      { status: 500 }
    );
  }
}
