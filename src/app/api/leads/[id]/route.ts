import { NextRequest, NextResponse } from "next/server";
import { updateLeadDetails, deleteSavedLead } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateLeadDetails(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lead." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteSavedLead(id);

    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Lead removed from CRM." });
  } catch (error: any) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete lead." },
      { status: 500 }
    );
  }
}
