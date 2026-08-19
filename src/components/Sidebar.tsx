"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  Target,
  Sparkles,
  Zap,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard" },
    { id: "lead-finder", label: "Lead Finder", icon: Search, href: "/", active: pathname === "/" },
    { id: "my-leads", label: "My Leads (CRM)", icon: Users, href: "/my-leads", active: pathname === "/my-leads" },
    { id: "campaigns", label: "Campaigns", icon: Target, href: "/campaigns", active: pathname === "/campaigns" },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-[#e2e8f0] flex-col h-screen shrink-0 select-none shadow-sm z-20">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center gap-3.5 border-b border-[#e2e8f0] bg-white">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center neu-raised-sm shadow-md">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 block">LeadForge</span>
          <span className="text-[11px] text-sky-600 font-bold block">B2B Website Leads</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto bg-white">
        <div className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "neu-inset text-sky-600 border border-sky-300 font-extrabold"
                  : "neu-btn text-slate-600 hover:text-slate-900 mb-2"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-sky-500 shadow-sm shadow-sky-400"></span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="p-4 border-t border-[#e2e8f0] bg-white">
        <div className="p-4 rounded-2xl neu-inset">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-900">Pure White UI</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Clean daylight tactile interface with instant sales tools.
          </p>
        </div>
      </div>
    </aside>
  );
};
