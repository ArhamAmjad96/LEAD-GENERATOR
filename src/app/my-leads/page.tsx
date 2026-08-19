"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Lead, LeadStatus, Campaign } from "@/types/lead";
import { ScoreBadge } from "@/components/ScoreBadge";
import { WebsiteStatusBadge } from "@/components/StatusBadge";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { exportLeadsToCSV, exportLeadsToExcel } from "@/lib/export";
import { normalizePhoneNumber } from "@/lib/apify";
import {
  Users,
  Search,
  Download,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  Star,
  Eye,
  Trash2,
  Calendar,
  FileText,
  Check,
  Copy,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>("");

  const fetchLeadsAndCampaigns = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, campRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/campaigns"),
      ]);

      const leadsData = await leadsRes.json();
      const campData = await campRes.json();

      if (leadsData.success) {
        setLeads(leadsData.leads || []);
      }
      if (campData.success) {
        setCampaigns(campData.campaigns || []);
      }
    } catch (error) {
      console.error("Failed to load CRM data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsAndCampaigns();
  }, []);

  // Update lead status in CRM
  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          lastContactedAt:
            newStatus === "contacted" || newStatus === "follow_up"
              ? new Date().toISOString()
              : undefined,
        }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  status: newStatus,
                  lastContactedAt:
                    newStatus === "contacted" || newStatus === "follow_up"
                      ? new Date().toISOString()
                      : l.lastContactedAt,
                }
              : l
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Save notes
  const handleSaveNotes = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: noteDraft }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, notes: noteDraft } : l))
        );
        setEditingNotesId(null);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // Set follow-up date
  const handleSetFollowUp = async (leadId: string, dateStr: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpAt: dateStr || null }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, followUpAt: dateStr || null } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update follow-up date:", err);
    }
  };

  // Delete lead
  const handleDeleteLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this lead from CRM?")) return;

    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        if (selectedLead?.id === leadId) setSelectedLead(null);
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Leads View
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== "all" && (lead.status || "new") !== statusFilter) {
        return false;
      }
      if (campaignFilter !== "all" && lead.campaignId !== campaignFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = lead.businessName.toLowerCase().includes(q);
        const matchesPhone = lead.phone?.toLowerCase().includes(q);
        const matchesCategory = lead.category?.toLowerCase().includes(q);
        const matchesNotes = lead.notes?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCategory && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [leads, statusFilter, campaignFilter, searchQuery]);

  // Counts for Tabs
  const statusCounts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter((l) => (l.status || "new") === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      follow_up: leads.filter((l) => l.status === "follow_up").length,
      interested: leads.filter((l) => l.status === "interested").length,
      not_interested: leads.filter((l) => l.status === "not_interested").length,
      closed: leads.filter((l) => l.status === "closed").length,
    };
  }, [leads]);

  const tabs: { id: LeadStatus | "all"; label: string; count: number }[] = [
    { id: "all", label: "All Leads", count: statusCounts.all },
    { id: "new", label: "New", count: statusCounts.new },
    { id: "contacted", label: "Contacted", count: statusCounts.contacted },
    { id: "follow_up", label: "Follow Up", count: statusCounts.follow_up },
    { id: "interested", label: "Interested", count: statusCounts.interested },
    { id: "not_interested", label: "Not Interested", count: statusCounts.not_interested },
    { id: "closed", label: "Closed / Won", count: statusCounts.closed },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset-sm text-sky-700 text-xs font-bold mb-2.5 bg-white">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Sales Outreach CRM</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Leads & Pipeline
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
            Track client communications, call numbers, launch WhatsApp chats, take notes, and schedule follow-ups.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportLeadsToCSV(filteredLeads, "myleads_crm")}
            disabled={filteredLeads.length === 0}
            className="px-4 py-2.5 rounded-2xl neu-btn text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            Export CSV
          </button>
          <button
            onClick={() => exportLeadsToExcel(filteredLeads, "myleads_crm")}
            disabled={filteredLeads.length === 0}
            className="px-5 py-2.5 rounded-2xl neu-btn-primary text-white text-xs font-extrabold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* CRM Filter Controls */}
      <div className="neu-raised-lg rounded-3xl p-6 space-y-5 bg-white border border-[#e2e8f0]">
        {/* Status Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 border-b border-[#e2e8f0] scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer ${
                statusFilter === tab.id
                  ? "neu-tab-active text-sky-700 shadow-inner"
                  : "neu-btn text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  statusFilter === tab.id
                    ? "bg-sky-100 text-sky-800"
                    : "neu-inset-sm text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Campaign Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, notes..."
              className="w-full neu-inset rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold"
            />
            <Search className="w-3.5 h-3.5 text-sky-600 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {campaigns.length > 0 && (
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="neu-inset rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none cursor-pointer font-bold bg-transparent"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={fetchLeadsAndCampaigns}
              className="p-2.5 rounded-2xl neu-btn text-slate-600 hover:text-sky-600 transition-all cursor-pointer"
              title="Refresh Leads"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* CRM Leads Table */}
      {isLoading ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center bg-white">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-bold">Loading saved leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center bg-white">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Saved Leads Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4 font-medium">
            {leads.length === 0
              ? "You haven't saved any leads to your CRM yet. Head over to Lead Finder to discover and save prospects."
              : "No leads matched your active status or search filters."}
          </p>
        </div>
      ) : (
        <div className="neu-raised-lg rounded-3xl overflow-hidden shadow-md bg-white border border-[#e2e8f0]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-[#f1f4f9] text-[10px] uppercase tracking-widest text-slate-600 border-b border-[#e2e8f0] font-extrabold">
                <tr>
                  <th scope="col" className="py-4 px-4 sm:px-6">Score</th>
                  <th scope="col" className="py-4 px-4">Business</th>
                  <th scope="col" className="py-4 px-4">Direct Contact</th>
                  <th scope="col" className="py-4 px-4">Website</th>
                  <th scope="col" className="py-4 px-4">Status</th>
                  <th scope="col" className="py-4 px-4">Notes</th>
                  <th scope="col" className="py-4 px-4">Follow-up</th>
                  <th scope="col" className="py-4 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredLeads.map((lead) => {
                  const normalizedDigits = normalizePhoneNumber(lead.phone)?.replace(/\D/g, "");
                  const whatsappUrl = normalizedDigits ? `https://wa.me/${normalizedDigits}` : null;
                  const isEditingNote = editingNotesId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-[#f8fafc] transition-all group cursor-pointer"
                    >
                      {/* Score */}
                      <td className="py-4 px-4 sm:px-6 align-middle whitespace-nowrap">
                        <ScoreBadge score={lead.score} />
                      </td>

                      {/* Business Name */}
                      <td className="py-4 px-4 align-middle">
                        <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {lead.businessName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                          <span>{lead.category || "Business"}</span>
                          {lead.rating && (
                            <span className="text-amber-500 font-extrabold">
                              ★ {lead.rating}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone & Direct Outreach Actions */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {lead.phone ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                              <span>{lead.phone}</span>
                              <button
                                onClick={(e) => handleCopyPhone(lead.id, lead.phone!, e)}
                                className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer"
                                title="Copy Phone"
                              >
                                {copiedId === lead.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${lead.phone}`}
                                onClick={() => handleUpdateStatus(lead.id, "contacted")}
                                className="px-2.5 py-1 rounded-lg neu-btn text-sky-600 text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                                title="Call directly"
                              >
                                <Phone className="w-2.5 h-2.5" /> Call
                              </a>
                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleUpdateStatus(lead.id, "contacted")}
                                  className="px-2.5 py-1 rounded-lg neu-btn text-emerald-600 text-[10px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                                  title="Open WhatsApp Chat"
                                >
                                  <MessageCircle className="w-2.5 h-2.5" /> WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">No phone</span>
                        )}
                      </td>

                      {/* Website */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap">
                        <WebsiteStatusBadge status={lead.websiteStatus} websiteUrl={lead.website} />
                      </td>

                      {/* CRM Status Select */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status || "new"}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                            lead.status === "interested"
                              ? "neu-inset text-emerald-700 border-emerald-300 bg-emerald-50"
                              : lead.status === "closed"
                              ? "neu-inset text-purple-700 border-purple-300 bg-purple-50"
                              : lead.status === "contacted"
                              ? "neu-inset text-blue-700 border-blue-300 bg-blue-50"
                              : lead.status === "follow_up"
                              ? "neu-inset text-amber-700 border-amber-300 bg-amber-50"
                              : lead.status === "not_interested"
                              ? "neu-inset text-slate-500 border-slate-300"
                              : "neu-inset text-sky-700 border-sky-300 bg-sky-50"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="follow_up">Follow Up</option>
                          <option value="interested">Interested</option>
                          <option value="not_interested">Not Interested</option>
                          <option value="closed">Closed / Won</option>
                        </select>
                      </td>

                      {/* Notes Column */}
                      <td className="py-4 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                        {isEditingNote ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Add note..."
                              className="neu-inset rounded-xl px-2.5 py-1.5 text-xs text-slate-900 w-36 focus:outline-none font-semibold"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveNotes(lead.id)}
                              className="p-1.5 rounded-xl neu-btn text-sky-600 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setNoteDraft(lead.notes || "");
                            }}
                            className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer max-w-[140px] truncate flex items-center gap-1 font-semibold"
                            title="Click to edit notes"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{lead.notes || "Click to add note..."}</span>
                          </div>
                        )}
                      </td>

                      {/* Follow-up Date */}
                      <td className="py-4 px-4 align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 text-xs text-slate-800 font-bold">
                          <input
                            type="date"
                            value={lead.followUpAt ? lead.followUpAt.split("T")[0] : ""}
                            onChange={(e) => handleSetFollowUp(lead.id, e.target.value)}
                            className="neu-inset rounded-xl px-2.5 py-1 text-xs text-slate-900 focus:outline-none cursor-pointer font-semibold bg-transparent"
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right pr-6 align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 rounded-xl neu-btn text-sky-600 hover:text-sky-700 transition-all cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteLead(lead.id, e)}
                            className="p-2 rounded-xl neu-btn text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Detail Drawer */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
