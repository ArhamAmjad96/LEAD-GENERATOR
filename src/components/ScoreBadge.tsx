import React from "react";

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeStyle = "neu-badge-low text-slate-400";

  if (score === 10) {
    badgeStyle = "neu-badge-10 text-emerald-400";
  } else if (score === 9) {
    badgeStyle = "neu-badge-9 text-cyan-300";
  } else if (score >= 7) {
    badgeStyle = "neu-badge-7-8 text-amber-300";
  } else if (score >= 5) {
    badgeStyle = "neu-badge-low text-blue-400";
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-lg text-xs tracking-wide transition-all ${badgeStyle}`}
      >
        {score} / 10
      </span>
    </div>
  );
};
