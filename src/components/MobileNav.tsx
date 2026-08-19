"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  Target,
} from "lucide-react";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { id: "lead-finder", label: "Finder", icon: Search, href: "/", active: pathname === "/" },
    { id: "my-leads", label: "CRM", icon: Users, href: "/my-leads", active: pathname === "/my-leads" },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard" },
    { id: "campaigns", label: "Campaigns", icon: Target, href: "/campaigns", active: pathname === "/campaigns" },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.active;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-w-[64px] cursor-pointer ${
              isActive
                ? "neu-inset text-sky-600 font-extrabold shadow-inner"
                : "text-slate-500 hover:text-slate-900 font-semibold"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-sky-600 scale-110" : "text-slate-500"} transition-transform`} />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
