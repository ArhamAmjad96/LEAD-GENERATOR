"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface GeoapifySuggestion {
  city?: string;
  state?: string;
  country?: string;
  formatted?: string;
}

interface GeoapifyResult {
  city?: string;
  state?: string;
  country?: string;
  formatted?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "e.g. Islamabad, Pakistan",
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [skipNextFetch, setSkipNextFetch] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  // Fetch suggestions from Geoapify
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!apiKey) {
        console.warn("[LocationAutocomplete] NEXT_PUBLIC_GEOAPIFY_API_KEY is not set. Autocomplete disabled.");
        return;
      }

      if (query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&type=city&filter=countrycode:pk&limit=5&format=json&apiKey=${apiKey}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Geoapify returned ${res.status}`);

        const data = await res.json();
        const results: GeoapifyResult[] = data.results || [];

        const mapped: GeoapifySuggestion[] = results.map((r) => ({
          city: r.city,
          state: r.state,
          country: r.country,
          formatted: r.formatted,
        }));

        setSuggestions(mapped);
        setIsOpen(mapped.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        console.error("[LocationAutocomplete] Geoapify fetch failed:", err);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );

  // Debounced input handler
  useEffect(() => {
    if (skipNextFetch) {
      setSkipNextFetch(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions, skipNextFetch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format display for a suggestion
  const formatDisplay = (s: GeoapifySuggestion): { primary: string; secondary: string } => {
    const primary = s.city || s.formatted?.split(",")[0] || "Unknown";
    const parts: string[] = [];
    if (s.state && s.state !== primary) parts.push(s.state);
    if (s.country) parts.push(s.country);
    const secondary = parts.join(", ");
    return { primary, secondary };
  };

  // Build the human-readable location string
  const buildLocationString = (s: GeoapifySuggestion): string => {
    const parts: string[] = [];
    if (s.city) parts.push(s.city);
    if (s.state && s.state !== s.city) parts.push(s.state);
    if (s.country) parts.push(s.country);
    return parts.length > 0 ? parts.join(", ") : s.formatted || "";
  };

  const handleSelect = (suggestion: GeoapifySuggestion) => {
    const locationStr = buildLocationString(suggestion);
    setSkipNextFetch(true);
    onChange(locationStr);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full neu-inset rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all font-semibold"
      />
      <MapPin className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5 pointer-events-none" />

      {/* Loading indicator */}
      {isLoading && (
        <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin absolute right-3.5 top-3.5 pointer-events-none" />
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 rounded-2xl neu-raised-sm overflow-hidden border border-[#e2e8f0] shadow-lg bg-white max-h-[240px] overflow-y-auto">
          {suggestions.map((suggestion, idx) => {
            const { primary, secondary } = formatDisplay(suggestion);
            const isActive = idx === activeIndex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-sky-50 border-l-2 border-sky-500"
                    : "hover:bg-[#f8fafc] border-l-2 border-transparent"
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${isActive ? "text-sky-700" : "text-slate-900"}`}>
                    {primary}
                  </p>
                  {secondary && (
                    <p className="text-[10px] text-slate-500 font-medium truncate">{secondary}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
