import React from "react";
import { WebsiteStatus } from "@/types/lead";
import { Globe, AlertTriangle, Share2, CheckCircle2, ExternalLink } from "lucide-react";

interface WebsiteStatusBadgeProps {
  status?: WebsiteStatus;
  websiteUrl?: string | null;
}

export const WebsiteStatusBadge: React.FC<WebsiteStatusBadgeProps> = ({
  status = "none",
  websiteUrl,
}) => {
  switch (status) {
    case "none":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-400 neu-inset-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400"></span>
          No Website
        </span>
      );

    case "social_only":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 neu-inset-sm">
          <Share2 className="w-3 h-3 text-cyan-400" />
          Social Page
        </span>
      );

    case "unreachable":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 neu-inset-sm">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Unreachable / Down
        </span>
      );

    case "website":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 neu-inset-sm max-w-[150px] truncate">
          <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{websiteUrl ? websiteUrl.replace(/^https?:\/\/(www\.)?/, "") : "Website"}</span>
        </span>
      );
  }
};
