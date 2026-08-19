"use client";

import React from "react";
import { Sparkles, MapPin, Database, Bell } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="h-20 border-b border-[#e2e8f0] bg-white px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight">B2B Website Lead Generator</h1>
          <p className="text-xs text-slate-500 font-medium">Discover and qualify local businesses without modern websites</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-inset-sm text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800">Apify Engine Active</span>
        </div>

        <button 
          className="p-2.5 neu-btn rounded-xl text-slate-600 hover:text-slate-900 transition-all relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-[#e2e8f0]">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white neu-raised-sm">
            AG
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900">Admin User</p>
            <p className="text-[10px] text-slate-500 font-semibold">Website Agency</p>
          </div>
        </div>
      </div>
    </header>
  );
};
