"use client";

import React, { useState, useMemo } from "react";
import { LeadFinderForm } from "@/components/LeadFinderForm";
import { LeadTable } from "@/components/LeadTable";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { Lead, LeadSearchParams, LeadFilterParams, LeadSearchMetrics } from "@/types/lead";
import { Sparkles, CheckCircle, Search, ShieldCheck } from "lucide-react";

const DEFAULT_FILTERS: LeadFilterParams = {
  phoneRequired: true,
  includeNoWebsite: true,
  includeHasWebsite: true,
  minRating: 0,
  minReviews: 0,
  minScore: 0,
};

export default function LeadFinderPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadSearchMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchParams, setSearchParams] = useState<LeadSearchParams | null>(null);
  const [filters, setFilters] = useState<LeadFilterParams>(DEFAULT_FILTERS);

  // Search handler connecting to Apify backend with server-side audit & opportunity scoring
  const handleSearch = async (params: LeadSearchParams) => {
    setIsLoading(true);
    setError(null);
    setSearchParams(params);

    try {
      const response = await fetch("/api/leads/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: Failed to fetch leads.`);
      }

      setAllLeads(data.leads || []);
      setMetrics(data.metrics || null);
      setHasSearched(true);
    } catch (err: any) {
      console.error("Lead search failed:", err);
      setError(err.message || "Failed to search leads. Please try again.");
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side reactive filter view for instant feedback
  const displayedLeads = useMemo(() => {
    const filtered = allLeads.filter((lead) => {
      // 1. Phone requirement
      if (filters.phoneRequired && !lead.phone) {
        return false;
      }

      // 2. Website filters
      const hasWeb = lead.websiteStatus !== "none";
      if (!hasWeb && !filters.includeNoWebsite) {
        return false;
      }
      if (hasWeb && !filters.includeHasWebsite) {
        return false;
      }

      // 3. Min rating
      if (filters.minRating > 0) {
        if (lead.rating === null || lead.rating < filters.minRating) {
          return false;
        }
      }

      // 4. Min reviews
      if (filters.minReviews > 0) {
        const count = lead.reviewCount || 0;
        if (count < filters.minReviews) {
          return false;
        }
      }

      // 5. Min score
      if (filters.minScore > 0) {
        if (lead.score < filters.minScore) {
          return false;
        }
      }

      return true;
    });

    // Best Opportunities First (Descending score, then review count)
    return filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
  }, [allLeads, filters]);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleRetry = () => {
    if (searchParams) {
      handleSearch(searchParams);
    } else {
      handleSearch({
        category: "Dentist",
        location: "Islamabad, Pakistan",
        limit: 20,
        ...filters,
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset-sm text-sky-700 text-xs font-bold mb-2.5 bg-white">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Lead Qualification & Opportunity Scoring Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find High-Value Web Development Prospects
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-medium">
            Automated website availability checks, HTTPS audit, mobile readiness, and deterministic 1–10 sales opportunity scoring.
          </p>
        </div>

        {hasSearched && !error && (
          <div className="flex items-center gap-3.5 neu-raised-sm p-4 rounded-2xl bg-white">
            <div className="text-right">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Qualified Leads</p>
              <p className="text-xl font-extrabold text-sky-600">{displayedLeads.length} leads</p>
            </div>
            <div className="w-11 h-11 rounded-2xl neu-inset flex items-center justify-center text-sky-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Search Filter Form */}
      <LeadFinderForm
        isLoading={isLoading}
        onSearch={handleSearch}
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Leads Result Area */}
      <LeadTable
        leads={displayedLeads}
        isLoading={isLoading}
        error={error}
        hasSearched={hasSearched}
        metrics={metrics}
        onRetry={handleRetry}
        onSelectLead={(lead) => setSelectedLead(lead)}
      />

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  );
}
