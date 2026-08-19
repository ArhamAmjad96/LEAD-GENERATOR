import { NextRequest, NextResponse } from "next/server";
import { getCampaignsList, createNewCampaign, deleteCampaignById } from "@/lib/db";

export async function GET() {
  try {
    const campaigns = getCampaignsList();
    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch campaigns." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, targetCategory, targetLocation } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
    }

    const campaign = createNewCampaign(name, description, targetCategory, targetLocation);
    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create campaign." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required." }, { status: 400 });
    }

    const deleted = deleteCampaignById(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error("DELETE /api/campaigns error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete campaign." },
      { status: 500 }
    );
  }
}
