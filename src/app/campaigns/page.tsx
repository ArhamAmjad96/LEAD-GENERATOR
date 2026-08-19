"use client";

import React, { useState, useEffect } from "react";
import { Campaign, Lead } from "@/types/lead";
import { exportLeadsToCSV, exportLeadsToExcel } from "@/lib/export";
import {
  Target,
  Plus,
  Trash2,
  Download,
  Users,
  CheckCircle2,
  PhoneCall,
  Clock,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [targetCategory, setTargetCategory] = useState<string>("Dentist");
  const [targetLocation, setTargetLocation] = useState<string>("Islamabad, Pakistan");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        fetch("/api/campaigns"),
        fetch("/api/leads"),
      ]);
      const cData = await cRes.json();
      const lData = await lRes.json();
      if (cData.success) setCampaigns(cData.campaigns || []);
      if (lData.success) setLeads(lData.leads || []);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          targetCategory: targetCategory.trim(),
          targetLocation: targetLocation.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) => [...prev, data.campaign]);
        setShowCreateModal(false);
        setName("");
        setDescription("");
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  };

  const handleExportCampaign = (campaignId: string, campaignName: string, format: "csv" | "excel") => {
    const campaignLeads = leads.filter((l) => l.campaignId === campaignId);
    if (campaignLeads.length === 0) {
      alert("This campaign currently has no saved leads to export.");
      return;
    }
    const safeName = campaignName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (format === "csv") {
      exportLeadsToCSV(campaignLeads, `campaign_${safeName}`);
    } else {
      exportLeadsToExcel(campaignLeads, `campaign_${safeName}`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset-sm text-sky-700 text-xs font-bold mb-2.5 bg-white">
            <Target className="w-4 h-4 text-sky-600" />
            <span>Targeted Outreach Campaigns</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sales Campaigns
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
            Organize qualified leads by niche and geography, monitor conversion pipelines, and export campaign lists.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-2xl neu-btn-primary text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer tracking-wide shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center bg-white">
          <p className="text-sm text-slate-500 font-bold">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="neu-raised-lg rounded-3xl p-12 text-center bg-white border border-[#e2e8f0]">
          <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Campaigns Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-medium">
            Create your first sales campaign to group scraped businesses and track your cold calling conversions.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl neu-btn text-slate-800 text-xs font-bold cursor-pointer"
          >
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="neu-raised-lg rounded-3xl p-6 space-y-5 bg-white border border-[#e2e8f0] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{camp.name}</h3>
                    {camp.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">
                        {camp.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCampaign(camp.id)}
                    className="p-1.5 rounded-xl neu-btn text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {(camp.targetCategory || camp.targetLocation) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {camp.targetCategory && (
                      <span className="px-2.5 py-1 rounded-lg text-xs neu-inset-sm text-slate-700 font-semibold">
                        {camp.targetCategory}
                      </span>
                    )}
                    {camp.targetLocation && (
                      <span className="px-2.5 py-1 rounded-lg text-xs neu-inset-sm text-slate-700 font-semibold">
                        {camp.targetLocation}
                      </span>
                    )}
                  </div>
                )}

                {/* Pipeline Stats Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#e2e8f0] text-center">
                  <div className="p-2.5 rounded-2xl neu-inset bg-white">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Leads</p>
                    <p className="text-base font-extrabold text-sky-600 mt-0.5">{camp.leadsCount || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-2xl neu-inset bg-white">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Calls</p>
                    <p className="text-base font-extrabold text-blue-600 mt-0.5">{camp.contactedCount || 0}</p>
                  </div>
                  <div className="p-2.5 rounded-2xl neu-inset bg-white">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Closed</p>
                    <p className="text-base font-extrabold text-emerald-600 mt-0.5">{camp.closedCount || 0}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(camp.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCampaign(camp.id, camp.name, "csv")}
                    className="px-3 py-1.5 rounded-xl neu-btn text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleExportCampaign(camp.id, camp.name, "excel")}
                    className="px-3 py-1.5 rounded-xl neu-btn text-sky-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Export Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Excel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-raised-lg w-full max-w-md rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 bg-white shadow-2xl">
            <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-sky-600">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Create Sales Campaign</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl neu-btn text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 sm:p-8 space-y-4 bg-white">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Islamabad Dentists — August Outreach"
                  required
                  className="w-full neu-inset rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Target Niche / Category
                </label>
                <input
                  type="text"
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  placeholder="e.g. Dentist, Real Estate"
                  className="w-full neu-inset rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Target City / Location
                </label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  placeholder="e.g. Islamabad, Pakistan"
                  className="w-full neu-inset rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Description / Strategy Notes
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Targeting dentists with >50 reviews and no active website for new WordPress/Next.js pitches."
                  rows={3}
                  className="w-full neu-inset rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-semibold"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-2xl neu-btn text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl neu-btn-primary text-white text-xs font-extrabold cursor-pointer tracking-wide"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
