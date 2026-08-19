"use client";

import React, { useState } from "react";
import { Lead, LeadSearchMetrics } from "@/types/lead";
import { ScoreBadge } from "./ScoreBadge";
import { WebsiteStatusBadge } from "./StatusBadge";
import { exportLeadsToCSV, exportLeadsToExcel } from "@/lib/export";
import { normalizePhoneNumber } from "@/lib/apify";
import {
  ExternalLink,
  MapPin,
  Phone,
  Star,
  Globe,
  Eye,
  AlertCircle,
  Copy,
  Check,
  Building2,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Download,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  metrics?: LeadSearchMetrics | null;
  onRetry?: () => void;
  onSelectLead?: (lead: Lead) => void;
  onSaveLead?: (lead: Lead) => void;
  onSaveAllLeads?: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  error,
  hasSearched,
  metrics,
  onRetry,
  onSelectLead,
  onSaveLead,
  onSaveAllLeads,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSingleLead = async (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead }),
      });
      if (res.ok) {
        setSavedIds((prev) => new Set(prev).add(lead.id));
        onSaveLead?.(lead);
      }
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  };

  const handleSaveAll = async () => {
    if (leads.length === 0) return;
    setIsSavingAll(true);
    try {
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads }),
      });
      if (res.ok) {
        const newSet = new Set(savedIds);
        leads.forEach((l) => newSet.add(l.id));
        setSavedIds(newSet);
        onSaveAllLeads?.();
      }
    } catch (err) {
      console.error("Failed to bulk save leads:", err);
    } finally {
      setIsSavingAll(false);
    }
  };

  // 1. Loading State (Skeleton)
  if (isLoading) {
    return (
      <div className="neu-raised-lg rounded-3xl p-6 sm:p-8 space-y-4 bg-white">
        <div className="flex items-center justify-between animate-pulse pb-4 border-b border-[#e2e8f0]">
          <div className="h-5 w-48 neu-inset rounded-lg"></div>
          <div className="h-5 w-24 neu-inset rounded-lg"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 neu-inset rounded-2xl animate-pulse flex items-center px-4 justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-6 bg-slate-300 rounded"></div>
                <div className="space-y-2">
                  <div className="w-40 h-4 bg-slate-300 rounded"></div>
                  <div className="w-24 h-3 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="w-28 h-4 bg-slate-300 rounded hidden sm:block"></div>
              <div className="w-24 h-4 bg-slate-300 rounded hidden md:block"></div>
              <div className="w-16 h-8 bg-slate-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="neu-raised-lg rounded-3xl p-8 text-center border border-rose-200 bg-white">
        <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center mx-auto mb-4 text-rose-500">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Failed to Retrieve Leads</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-medium">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl neu-btn text-slate-800 text-sm font-bold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-sky-600" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  // 3. Initial Empty State (Before search)
  if (!hasSearched) {
    return (
      <div className="neu-inset rounded-3xl p-12 text-center bg-[#f8fafc]">
        <div className="w-16 h-16 rounded-3xl neu-raised flex items-center justify-center mx-auto mb-4 text-sky-600">
          <Building2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 mb-1">Ready to Discover Leads</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
          Enter a business category and city above, adjust filters, and click <strong className="text-sky-600 font-bold">FIND LEADS</strong> to view qualified potential clients.
        </p>
      </div>
    );
  }

  // 4. No Results Found State
  if (leads.length === 0) {
    return (
      <div className="neu-raised-lg rounded-3xl p-12 text-center bg-white">
        <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">No Qualified Leads Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">
          {metrics && metrics.discoveredCount > 0
            ? `Discovered ${metrics.discoveredCount} businesses, but none met all active filters. Try lowering minimum rating or review requirements.`
            : "No businesses matched your search criteria on Google Maps. Try a broader category or different location."}
        </p>
      </div>
    );
  }

  // 5. Results Table
  return (
    <div className="neu-raised-lg rounded-3xl overflow-hidden bg-white shadow-md">
      {/* Table Top Bar with Export & Bulk Actions */}
      <div className="p-5 sm:px-8 sm:py-5 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4 bg-[#f8fafc]">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide">Discovered Leads</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {metrics && metrics.discoveredCount > 0 ? (
              <>
                <span className="font-bold text-sky-600">{leads.length} qualified leads</span> from{" "}
                <span className="text-slate-700 font-bold">{metrics.discoveredCount} discovered businesses</span>
              </>
            ) : (
              <>
                <span className="font-bold text-sky-600">{leads.length} qualified leads</span>
              </>
            )}
          </p>
        </div>

        {/* Export & Save All Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="px-3.5 py-2 rounded-xl neu-btn text-sky-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Bookmark className="w-3.5 h-3.5 text-sky-600" />
            <span>{isSavingAll ? "Saving..." : "Save All to CRM"}</span>
          </button>

          <button
            onClick={() => exportLeadsToCSV(leads, "lead_finder_results")}
            className="px-3.5 py-2 rounded-xl neu-btn text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Export filtered leads to CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportLeadsToExcel(leads, "lead_finder_results")}
            className="px-3.5 py-2 rounded-xl neu-btn text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Export filtered leads to native Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-[#f1f4f9] text-[10px] uppercase tracking-widest text-slate-600 border-b border-[#e2e8f0] font-extrabold">
            <tr>
              <th scope="col" className="py-4 px-4 sm:px-6">Score</th>
              <th scope="col" className="py-4 px-4">Business</th>
              <th scope="col" className="py-4 px-4 hidden md:table-cell">Category</th>
              <th scope="col" className="py-4 px-4">Phone</th>
              <th scope="col" className="py-4 px-4">Website</th>
              <th scope="col" className="py-4 px-4 hidden lg:table-cell">Rating</th>
              <th scope="col" className="py-4 px-4 hidden xl:table-cell">Location</th>
              <th scope="col" className="py-4 px-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {leads.map((lead) => {
              const isSaved = savedIds.has(lead.id);
              const normalizedDigits = normalizePhoneNumber(lead.phone)?.replace(/\D/g, "");
              const whatsappUrl = normalizedDigits ? `https://wa.me/${normalizedDigits}` : null;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead?.(lead)}
                  className="hover:bg-[#f8fafc] transition-all group cursor-pointer"
                >
                  {/* Score */}
                  <td className="py-4 px-4 sm:px-6 align-middle whitespace-nowrap">
                    <ScoreBadge score={lead.score} />
                  </td>

                  {/* Business */}
                  <td className="py-4 px-4 align-middle">
                    <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {lead.businessName}
                    </div>
                    {lead.leadReason && (
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate font-medium">
                        {lead.leadReason}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 align-middle hidden md:table-cell whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs neu-inset-sm text-slate-700 font-semibold">
                      {lead.category || "General"}
                    </span>
                  </td>

                  {/* Phone & Quick Outreach Actions */}
                  <td className="py-4 px-4 align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {lead.phone ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                          <span>{lead.phone}</span>
                          <button
                            onClick={(e) => handleCopyPhone(lead.id, lead.phone!, e)}
                            title="Copy phone"
                            className="p-1 hover:text-sky-600 transition-colors text-slate-400 cursor-pointer"
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
                            className="p-1.5 rounded-lg neu-btn text-sky-600 text-[10px] inline-flex items-center gap-1 cursor-pointer font-bold"
                            title="Call"
                          >
                            <Phone className="w-2.5 h-2.5" />
                          </a>
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg neu-btn text-emerald-600 text-[10px] inline-flex items-center gap-1 cursor-pointer font-bold"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-2.5 h-2.5" />
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

                  {/* Rating & Reviews */}
                  <td className="py-4 px-4 align-middle hidden lg:table-cell whitespace-nowrap">
                    {lead.rating ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="flex items-center gap-1 font-extrabold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {lead.rating}
                        </span>
                        <span className="text-slate-500 font-semibold">
                          ({lead.reviewCount || 0})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">No reviews</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 align-middle hidden xl:table-cell text-xs text-slate-500 font-medium max-w-[200px] truncate">
                    {lead.address || "Location unavailable"}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right pr-6 align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {/* Save to CRM button */}
                      <button
                        onClick={(e) => handleSaveSingleLead(lead, e)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isSaved
                            ? "neu-inset text-emerald-600 border border-emerald-300"
                            : "neu-btn text-slate-600 hover:text-sky-600"
                        }`}
                        title={isSaved ? "Saved in CRM" : "Save to CRM"}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl neu-btn text-slate-600 hover:text-sky-600 transition-all inline-flex items-center text-xs cursor-pointer"
                          title="Open Maps"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl neu-btn text-slate-600 hover:text-sky-600 transition-all inline-flex items-center text-xs cursor-pointer"
                          title="Open Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          disabled
                          className="p-2 rounded-xl neu-inset opacity-40 text-slate-400 cursor-not-allowed inline-flex items-center text-xs"
                          title="No website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectLead?.(lead)}
                        className="p-2 rounded-xl neu-btn text-sky-600 hover:text-sky-700 transition-all inline-flex items-center text-xs cursor-pointer"
                        title="View Lead Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
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
  );
};
