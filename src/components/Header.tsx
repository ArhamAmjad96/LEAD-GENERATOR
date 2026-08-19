"use client";

import React from "react";
import { Zap, Bell } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="h-16 sm:h-20 border-b border-[#e2e8f0] bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
      {/* Mobile Brand / Desktop Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center neu-raised-sm shadow-md">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">LeadForge</span>
            <span className="text-[10px] text-sky-600 font-bold block leading-tight">B2B Leads</span>
          </div>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block">
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight">B2B Website Lead Generator</h1>
          <p className="text-xs text-slate-500 font-medium">Discover and qualify local businesses without modern websites</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl neu-inset-sm text-[11px] sm:text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800 hidden xs:inline sm:inline">Apify Engine Active</span>
          <span className="font-bold text-slate-800 xs:hidden sm:hidden">Active</span>
        </div>

        <button 
          className="p-2 sm:p-2.5 neu-btn rounded-xl text-slate-600 hover:text-slate-900 transition-all relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#e2e8f0]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-[11px] sm:text-xs font-bold text-white neu-raised-sm">
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
