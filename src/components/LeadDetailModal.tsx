"use client";

import React, { useState, useEffect } from "react";
import { Lead, LeadStatus, AIAnalysis } from "@/types/lead";
import { ScoreBadge } from "./ScoreBadge";
import { WebsiteStatusBadge } from "./StatusBadge";
import { normalizePhoneNumber } from "@/lib/apify";
import {
  X,
  Phone,
  Globe,
  MapPin,
  Star,
  ExternalLink,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  MessageCircle,
  Calendar,
  FileText,
  Bookmark,
  Check,
  Sparkles,
  Bot,
  Copy,
  Zap,
  Target,
  AlertTriangle,
} from "lucide-react";

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated?: (updated: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onLeadUpdated,
}) => {
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
      setStatus(lead.status || "new");
      setFollowUpDate(lead.followUpAt ? lead.followUpAt.split("T")[0] : "");
      setIsSaved(Boolean(lead.savedAt));
      setAiAnalysis(lead.aiAnalysis || null);
      setCopiedPitch(false);
    }
  }, [lead]);

  if (!lead) return null;

  const audit = lead.audit;
  const normalizedDigits = normalizePhoneNumber(lead.phone)?.replace(/\D/g, "");
  const whatsappUrl = normalizedDigits ? `https://wa.me/${normalizedDigits}` : null;

  const handleSaveToCRM = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            ...lead,
            status,
            notes,
            followUpAt: followUpDate || null,
            aiAnalysis,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        if (data.lead) onLeadUpdated?.(data.lead);
      }
    } catch (err) {
      console.error("Failed to save to CRM:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/leads/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead }),
      });

      const data = await res.json();
      if (data.success && data.aiAnalysis) {
        setAiAnalysis(data.aiAnalysis);
        if (isSaved) {
          onLeadUpdated?.({ ...lead, aiAnalysis: data.aiAnalysis });
        }
      }
    } catch (err) {
      console.error("Failed to generate AI analysis:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopyScript = () => {
    if (!aiAnalysis) return;
    const text = `WHY CONTACT:\n${aiAnalysis.whyContact}\n\nPITCH ANGLE:\n${aiAnalysis.pitchAngle}\n\nCOLD-CALL SCRIPT:\n${aiAnalysis.coldCallScript}`;
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    if (isSaved) {
      try {
        await fetch(`/api/leads/${lead.id}`, {
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
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="neu-raised-lg w-full max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] sm:max-h-[92vh] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-sky-600 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">{lead.businessName}</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">{lead.category || "Local Business"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 neu-btn rounded-xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1 bg-white">
          {/* Opportunity Score Highlight */}
          <div className="p-4 sm:p-5 rounded-2xl neu-raised-sm space-y-2 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Website Sales Opportunity
              </span>
              <ScoreBadge score={lead.score} />
            </div>
            {lead.leadReason && (
              <p className="text-xs text-slate-700 leading-relaxed pt-1 font-semibold">
                {lead.leadReason}
              </p>
            )}
          </div>

          {/* Quick Action Bar (CALL, WHATSAPP, WEBSITE, MAPS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                onClick={() => handleStatusChange("contacted")}
                className="p-3 rounded-2xl neu-btn text-sky-600 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm min-h-[44px]"
              >
                <Phone className="w-4 h-4" />
                CALL
              </a>
            ) : (
              <button
                disabled
                className="p-3 rounded-2xl neu-inset opacity-40 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]"
              >
                <Phone className="w-4 h-4" />
                CALL
              </button>
            )}

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleStatusChange("contacted")}
                className="p-3 rounded-2xl neu-btn text-emerald-600 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                WHATSAPP
              </a>
            ) : (
              <button
                disabled
                className="p-3 rounded-2xl neu-inset opacity-40 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                WHATSAPP
              </button>
            )}

            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl neu-btn text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm min-h-[44px]"
              >
                <Globe className="w-4 h-4 text-indigo-600" />
                WEBSITE
              </a>
            ) : (
              <button
                disabled
                className="p-3 rounded-2xl neu-inset opacity-40 text-slate-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]"
              >
                <Globe className="w-4 h-4" />
                NO WEB
              </button>
            )}

            {lead.googleMapsUrl ? (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl neu-btn text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm min-h-[44px]"
              >
                <MapPin className="w-4 h-4 text-sky-600" />
                MAPS
              </a>
            ) : null}
          </div>

          {/* AI Sales Pitch & Analysis Section */}
          <div className="p-4 sm:p-6 rounded-2xl neu-raised-sm space-y-3.5 sm:space-y-4 border border-sky-200 bg-sky-50/40">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-sky-600 bg-white shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    AI Sales Pitch & Cold-Call Strategy
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Tailored angle based on reviews and web footprint</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full xs:w-auto">
                {aiAnalysis && (
                  <button
                    onClick={handleCopyScript}
                    className="flex-1 xs:flex-initial text-xs px-3 py-1.5 rounded-xl neu-btn text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold"
                    title="Copy pitch"
                  >
                    {copiedPitch ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-sky-600" />}
                    <span>{copiedPitch ? "Copied" : "Copy"}</span>
                  </button>
                )}
                <button
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="flex-1 xs:flex-initial text-xs font-extrabold px-3.5 py-1.5 rounded-xl neu-btn-primary text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3 h-3 ${isGeneratingAI ? "animate-spin" : ""}`} />
                  <span>{isGeneratingAI ? "Analyzing..." : aiAnalysis ? "Regenerate" : "Generate AI Pitch"}</span>
                </button>
              </div>
            </div>

            {aiAnalysis ? (
              <div className="space-y-3 pt-2 text-xs">
                {/* Why Contact Them */}
                <div className="p-3.5 sm:p-4 rounded-xl neu-inset space-y-1 bg-white">
                  <span className="font-extrabold text-sky-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-sky-600" />
                    Why Contact Them
                  </span>
                  <p className="text-slate-800 leading-relaxed font-semibold">{aiAnalysis.whyContact}</p>
                </div>

                {/* Pitch Angle */}
                <div className="p-3.5 sm:p-4 rounded-xl neu-inset space-y-1 bg-white">
                  <span className="font-extrabold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    Suggested Pitch Angle
                  </span>
                  <p className="text-slate-900 font-bold italic leading-relaxed">{aiAnalysis.pitchAngle}</p>
                </div>

                {/* Website Weaknesses */}
                {aiAnalysis.websiteWeaknesses && aiAnalysis.websiteWeaknesses.length > 0 && (
                  <div className="p-3.5 sm:p-4 rounded-xl neu-inset space-y-2 bg-white">
                    <span className="font-extrabold text-amber-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Identified Weaknesses & Opportunities
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 font-semibold">
                      {aiAnalysis.websiteWeaknesses.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cold Call / WhatsApp Script */}
                <div className="p-3.5 sm:p-4 rounded-xl neu-inset space-y-2 bg-white">
                  <span className="font-extrabold text-sky-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3 text-sky-600" />
                    Word-for-Word Cold-Call / WhatsApp Script
                  </span>
                  <p className="text-slate-900 font-mono text-[11px] leading-relaxed whitespace-pre-wrap neu-raised-sm p-3 rounded-xl border border-sky-200">
                    {aiAnalysis.coldCallScript}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl neu-inset text-center bg-white">
                <p className="text-xs text-slate-600 font-semibold">
                  Tap <strong className="text-sky-600 font-bold">Generate AI Pitch</strong> to produce tailored opening scripts, pitch angles, and sales arguments.
                </p>
              </div>
            )}
          </div>

          {/* CRM Outreach Management Panel */}
          <div className="p-4 sm:p-6 rounded-2xl neu-raised-sm space-y-3.5 sm:space-y-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Sales CRM & Outreach Pipeline
              </span>
              <button
                onClick={handleSaveToCRM}
                disabled={isSaving}
                className="text-xs font-bold px-3 py-1.5 rounded-xl neu-btn-primary text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaved ? <Check className="w-3 h-3 text-white" /> : <Bookmark className="w-3 h-3 text-white" />}
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-bold">Lead Status</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none cursor-pointer font-bold bg-transparent"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="closed">Closed / Won</option>
                </select>
              </div>

              {/* Follow-up Date */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-sky-600" />
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none cursor-pointer font-bold bg-transparent"
                />
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 font-bold">Sales Notes / Call Log</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Spoke to clinic receptionist. Requested follow up with demo website."
                rows={2}
                className="w-full neu-inset rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold bg-transparent"
              />
            </div>
          </div>

          {/* Business Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 sm:p-4 rounded-2xl neu-inset space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                <Phone className="w-3.5 h-3.5 text-sky-600" /> Phone Number
              </span>
              <p className="text-slate-900 font-extrabold text-sm">
                {lead.phone || "Not available"}
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl neu-inset space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                <Globe className="w-3.5 h-3.5 text-sky-600" /> Website Status
              </span>
              <div className="pt-0.5">
                <WebsiteStatusBadge status={lead.websiteStatus} websiteUrl={lead.website} />
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl neu-inset space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Google Rating
              </span>
              <p className="text-slate-900 font-extrabold text-sm">
                {lead.rating ? `${lead.rating} ★ (${lead.reviewCount || 0} reviews)` : "No ratings"}
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl neu-inset space-y-1">
              <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-sky-600" /> Location
              </span>
              <p className="text-slate-900 font-bold truncate">
                {lead.address || "Location unavailable"}
              </p>
            </div>
          </div>

          {/* Website Audit Breakdown (If website exists) */}
          {lead.website && (
            <div className="p-4 sm:p-5 rounded-2xl neu-raised-sm space-y-3 border border-[#e2e8f0]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  Website Audit Breakdown
                </span>
                {audit && audit.responseTimeMs !== null && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {audit.responseTimeMs}ms
                  </span>
                )}
              </div>

              {audit ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl neu-inset">
                    {audit.reachable ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className={audit.reachable ? "text-slate-800" : "text-rose-600"}>
                      {audit.reachable ? `Reachable (${audit.statusCode || 200})` : "Unreachable"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl neu-inset">
                    {audit.https ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className={audit.https ? "text-slate-800" : "text-amber-600"}>
                      {audit.https ? "SSL / HTTPS Secure" : "Missing HTTPS"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl neu-inset">
                    {audit.mobileViewport ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span className={audit.mobileViewport ? "text-slate-800" : "text-rose-600"}>
                      {audit.mobileViewport ? "Mobile Viewport Tag" : "Not Mobile Responsive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl neu-inset">
                    {audit.whatsappAvailable ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={audit.whatsappAvailable ? "text-slate-800" : "text-slate-500"}>
                      {audit.whatsappAvailable ? "WhatsApp Click-to-Chat" : "No WhatsApp Link"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic font-medium">No automated audit performed for this link.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
