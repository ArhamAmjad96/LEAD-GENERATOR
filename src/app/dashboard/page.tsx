"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lead, Campaign } from "@/types/lead";
import { ScoreBadge } from "@/components/ScoreBadge";
import { WebsiteStatusBadge } from "@/components/StatusBadge";
import { normalizePhoneNumber } from "@/lib/apify";
import {
  LayoutDashboard,
  Users,
  Target,
  Search,
  PhoneCall,
  MessageCircle,
  TrendingUp,
  Award,
  Zap,
  Building,
  ArrowRight,
  Globe,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [lRes, cRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/campaigns"),
        ]);
        const lData = await lRes.json();
        const cData = await cRes.json();
        if (lData.success) setLeads(lData.leads || []);
        if (cData.success) setCampaigns(cData.campaigns || []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalLeads = leads.length;
  const noWebsiteLeads = leads.filter((l) => l.websiteStatus === "none").length;
  const highOppLeads = leads.filter((l) => l.score >= 9).length;
  const contactedLeads = leads.filter((l) => l.status === "contacted" || l.status === "follow_up").length;
  const interestedLeads = leads.filter((l) => l.status === "interested").length;
  const closedLeads = leads.filter((l) => l.status === "closed").length;
  const winRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset-sm text-sky-700 text-xs font-bold mb-2 bg-white">
            <LayoutDashboard className="w-4 h-4 text-sky-600" />
            <span>Executive Performance Dashboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Overview & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
            Real-time pipeline metrics, opportunity breakdown, and sales performance.
          </p>
        </div>

        <Link
          href="/"
          className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl neu-btn-primary text-white text-xs font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-fit cursor-pointer tracking-wide shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>Find New Leads</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="p-4 sm:p-6 rounded-3xl neu-raised bg-white space-y-1.5 sm:space-y-2 border border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">Total Leads</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-inset flex items-center justify-center text-sky-600">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{totalLeads}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">In CRM pipeline</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl neu-raised bg-white space-y-1.5 sm:space-y-2 border border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-emerald-600 uppercase tracking-wider font-extrabold">High Opp</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-inset flex items-center justify-center text-emerald-600">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">{highOppLeads}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">{noWebsiteLeads} no website</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl neu-raised bg-white space-y-1.5 sm:space-y-2 border border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-sky-600 uppercase tracking-wider font-extrabold">Contacted</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-inset flex items-center justify-center text-sky-600">
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 tracking-tight">{contactedLeads}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">{interestedLeads} interested</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl neu-raised bg-white space-y-1.5 sm:space-y-2 border border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-purple-600 uppercase tracking-wider font-extrabold">Closed</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neu-inset flex items-center justify-center text-purple-600">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 tracking-tight">{closedLeads}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">{winRate}% win rate</p>
        </div>
      </div>

      {/* Opportunity Breakdown & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Opportunity Breakdown */}
        <div className="lg:col-span-2 p-4 sm:p-8 rounded-3xl neu-raised-lg bg-white space-y-4 sm:space-y-5 border border-[#e2e8f0]">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide">Lead Opportunity Breakdown</h3>
          <div className="space-y-3.5 sm:space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-emerald-700">No Website (10/10)</span>
                <span className="text-slate-900 font-extrabold">{noWebsiteLeads} leads</span>
              </div>
              <div className="w-full h-3.5 neu-inset rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all shadow-sm"
                  style={{ width: `${totalLeads > 0 ? (noWebsiteLeads / totalLeads) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-sky-700">Social / Broken Website (9/10)</span>
                <span className="text-slate-900 font-extrabold">
                  {leads.filter((l) => l.score === 9).length} leads
                </span>
              </div>
              <div className="w-full h-3.5 neu-inset rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full transition-all shadow-sm"
                  style={{ width: `${totalLeads > 0 ? (leads.filter((l) => l.score === 9).length / totalLeads) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-amber-700">Weak Websites (7–8/10)</span>
                <span className="text-slate-900 font-extrabold">
                  {leads.filter((l) => l.score === 7 || l.score === 8).length} leads
                </span>
              </div>
              <div className="w-full h-3.5 neu-inset rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all shadow-sm"
                  style={{ width: `${totalLeads > 0 ? (leads.filter((l) => l.score === 7 || l.score === 8).length / totalLeads) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Campaigns Card */}
        <div className="p-4 sm:p-8 rounded-3xl neu-raised-lg bg-white space-y-4 flex flex-col justify-between border border-[#e2e8f0]">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-wide">Active Campaigns</h3>
              <Link href="/campaigns" className="text-xs text-sky-600 hover:underline font-bold">
                View All
              </Link>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {campaigns.slice(0, 3).map((camp) => (
                <div key={camp.id} className="p-3 sm:p-3.5 rounded-2xl neu-inset space-y-0.5">
                  <p className="text-xs font-bold text-slate-900">{camp.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{camp.leadsCount || 0} leads assigned</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/my-leads"
            className="w-full py-2.5 sm:py-3 rounded-2xl neu-btn text-slate-800 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
          >
            <span>Open Sales CRM</span>
            <ArrowRight className="w-4 h-4 text-sky-600" />
          </Link>
        </div>
      </div>

      {/* Recent CRM Leads (Responsive Mobile Cards + Desktop Table) */}
      <div className="neu-raised-lg rounded-3xl overflow-hidden space-y-3 sm:space-y-4 p-4 sm:p-8 bg-white border border-[#e2e8f0]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wide">Recent Opportunities</h3>
          <Link href="/my-leads" className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-bold">
            <span>Manage all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {leads.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 font-medium">No leads saved yet. Use Lead Finder to discover prospects.</p>
        ) : (
          <div>
            {/* MOBILE VIEW (< md) */}
            <div className="md:hidden divide-y divide-[#e2e8f0]">
              {leads.slice(0, 4).map((lead) => {
                const normalizedDigits = normalizePhoneNumber(lead.phone)?.replace(/\D/g, "");
                const whatsappUrl = normalizedDigits ? `https://wa.me/${normalizedDigits}` : null;

                return (
                  <div key={lead.id} className="py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{lead.businessName}</span>
                      <ScoreBadge score={lead.score} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="capitalize px-2 py-0.5 rounded-md neu-inset-sm font-bold text-slate-700">
                        {lead.status || "new"}
                      </span>
                      <div className="flex items-center gap-2">
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="p-1.5 rounded-lg neu-btn text-sky-600">
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {whatsappUrl && (
                          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg neu-btn text-emerald-600">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#f1f4f9] text-[10px] uppercase tracking-widest text-slate-600 border-b border-[#e2e8f0] font-extrabold">
                  <tr>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Business</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Website</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right pr-4">Outreach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {leads.slice(0, 5).map((lead) => {
                    const normalizedDigits = normalizePhoneNumber(lead.phone)?.replace(/\D/g, "");
                    const whatsappUrl = normalizedDigits ? `https://wa.me/${normalizedDigits}` : null;

                    return (
                      <tr key={lead.id} className="hover:bg-[#f8fafc] transition-all">
                        <td className="py-3.5 px-4">
                          <ScoreBadge score={lead.score} />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{lead.businessName}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{lead.phone || "N/A"}</td>
                        <td className="py-3.5 px-4">
                          <WebsiteStatusBadge status={lead.websiteStatus} websiteUrl={lead.website} />
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-1 rounded-lg neu-inset-sm text-[10px] text-slate-800 font-extrabold">
                            {lead.status || "new"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-2">
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-1.5 rounded-xl neu-btn text-sky-600"
                                title="Call"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-xl neu-btn text-emerald-600"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
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
      </div>
    </div>
  );
}
