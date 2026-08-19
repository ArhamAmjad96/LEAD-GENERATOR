"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Layers,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Phone,
  Globe,
  Star,
  MessageSquare,
  RotateCcw,
  Zap,
} from "lucide-react";
import { LeadSearchParams, LeadFilterParams } from "@/types/lead";

interface LeadFinderFormProps {
  isLoading: boolean;
  onSearch: (params: LeadSearchParams) => void;
  filters: LeadFilterParams;
  onFiltersChange: (filters: LeadFilterParams) => void;
  onResetFilters: () => void;
}

export const LeadFinderForm: React.FC<LeadFinderFormProps> = ({
  isLoading,
  onSearch,
  filters,
  onFiltersChange,
  onResetFilters,
}) => {
  const [category, setCategory] = useState<string>("Dentist");
  const [location, setLocation] = useState<string>("Islamabad, Pakistan");
  const [limit, setLimit] = useState<number>(20);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !location.trim()) return;
    onSearch({
      category: category.trim(),
      location: location.trim(),
      limit,
      ...filters,
    });
  };

  const sampleCategories = ["Dentist", "Plumber", "Real Estate Agency", "Gym & Fitness", "Roofing Contractor"];
  const sampleLocations = ["Islamabad, Pakistan", "Lahore, Pakistan", "Austin, TX", "London, UK"];

  const hasNonDefaultFilters =
    !filters.phoneRequired ||
    !filters.includeNoWebsite ||
    !filters.includeHasWebsite ||
    filters.minRating > 0 ||
    filters.minReviews > 0 ||
    filters.minScore > 0;

  return (
    <div className="neu-raised-lg rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between pb-4 sm:pb-5 border-b border-[#e2e8f0] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-inset flex items-center justify-center text-sky-600 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-wide">Find Local Businesses on Google Maps</h2>
            <p className="text-xs text-slate-500 font-medium">Discover and qualify targeted business leads with verified contact details</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            hasNonDefaultFilters
              ? "neu-inset text-sky-700 border border-sky-300"
              : "neu-btn text-slate-700 hover:text-slate-900"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasNonDefaultFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Main Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Business Category Field */}
          <div className="md:col-span-5 space-y-1.5 sm:space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Business Category / Niche
            </label>
            <div className="relative">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Dentist, Lawyer, HVAC..."
                required
                className="w-full neu-inset rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-semibold"
              />
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium self-center mr-1">Suggestions:</span>
              {sampleCategories.slice(0, 3).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className="text-[11px] px-2.5 py-1 rounded-xl neu-btn text-slate-700 hover:text-sky-600 transition-all cursor-pointer font-bold"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Location Field */}
          <div className="md:col-span-4 space-y-1.5 sm:space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              City / Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Islamabad, Pakistan"
                required
                className="w-full neu-inset rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-semibold"
              />
              <MapPin className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5" />
            </div>
            {/* Quick city presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium self-center mr-1">Popular:</span>
              {sampleLocations.slice(0, 2).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocation(item)}
                  className="text-[11px] px-2.5 py-1 rounded-xl neu-btn text-slate-700 hover:text-sky-600 transition-all cursor-pointer font-bold"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Leads Dropdown */}
          <div className="md:col-span-3 space-y-1.5 sm:space-y-2">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Number of Leads
            </label>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full neu-inset rounded-2xl pl-10 pr-8 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all appearance-none cursor-pointer font-semibold bg-transparent"
              >
                <option value={10}>10 leads</option>
                <option value={20}>20 leads</option>
                <option value={50}>50 leads</option>
                <option value={100}>100 leads</option>
                <option value={200}>200 leads</option>
              </select>
              <Layers className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <div className="absolute right-3.5 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-600"></div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium pt-1">Recommended: 20-50</p>
          </div>
        </div>

        {/* Advanced Qualification Filters */}
        {showFilters && (
          <div className="p-4 sm:p-5 rounded-2xl neu-inset space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                Qualification & Opportunity Filters
              </span>
              {hasNonDefaultFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {/* Phone Filter */}
              <div className="p-3 rounded-xl neu-raised-sm flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    Phone
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Public phone required</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.phoneRequired}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, phoneRequired: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 neu-inset rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600 peer-checked:after:bg-white"></div>
                </label>
              </div>

              {/* Website Status Checkboxes */}
              <div className="p-3 rounded-xl neu-raised-sm space-y-1.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  Website Status
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-800 pt-0.5 font-semibold">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.includeNoWebsite}
                      onChange={(e) =>
                        onFiltersChange({ ...filters, includeNoWebsite: e.target.checked })
                      }
                      className="rounded border-slate-300 bg-white text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    <span>No Web</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.includeHasWebsite}
                      onChange={(e) =>
                        onFiltersChange({ ...filters, includeHasWebsite: e.target.checked })
                      }
                      className="rounded border-slate-300 bg-white text-sky-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Has Web</span>
                  </label>
                </div>
              </div>

              {/* Minimum Score */}
              <div className="p-3 rounded-xl neu-raised-sm space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Min Opportunity
                </label>
                <select
                  value={filters.minScore}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, minScore: Number(e.target.value) })
                  }
                  className="w-full neu-inset rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none cursor-pointer font-semibold bg-transparent"
                >
                  <option value={0}>Any Score</option>
                  <option value={6}>6+ (All Opportunities)</option>
                  <option value={7}>7+ (Weak Web+)</option>
                  <option value={8}>8+ (Very Weak+)</option>
                  <option value={9}>9+ (Social / Broken+)</option>
                  <option value={10}>10 (No Website Only)</option>
                </select>
              </div>

              {/* Minimum Rating */}
              <div className="p-3 rounded-xl neu-raised-sm space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, minRating: Number(e.target.value) })
                  }
                  className="w-full neu-inset rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none cursor-pointer font-semibold bg-transparent"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3.0}>3.0+ Stars</option>
                  <option value={4.0}>4.0+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>

              {/* Minimum Reviews */}
              <div className="p-3 rounded-xl neu-raised-sm space-y-1.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  Minimum Reviews
                </label>
                <select
                  value={filters.minReviews}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, minReviews: Number(e.target.value) })
                  }
                  className="w-full neu-inset rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none cursor-pointer font-semibold bg-transparent"
                >
                  <option value={0}>Any Reviews</option>
                  <option value={10}>10+ Reviews</option>
                  <option value={25}>25+ Reviews</option>
                  <option value={50}>50+ Reviews</option>
                  <option value={100}>100+ Reviews</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3.5 rounded-2xl neu-btn-primary text-white font-extrabold text-sm flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer tracking-wide shadow-lg shadow-sky-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Auditing & Qualifying Leads...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>FIND LEADS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
