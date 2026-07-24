"use client";

import React from "react";

export type ExplorerTier = "bronze" | "silver" | "gold" | "platinum" | "Bronze" | "Silver" | "Gold" | "Platinum";

interface ExplorerBadgeProps {
  tier: ExplorerTier;
  size?: number; // size in px, default 44
  showLabel?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export default function ExplorerBadge({
  tier,
  size = 44,
  showLabel = false,
  className = "",
  showTooltip = true,
}: ExplorerBadgeProps) {
  // Normalize tier name
  const normalizedTier = (tier || "bronze").toLowerCase() as "bronze" | "silver" | "gold" | "platinum";

  // Label configuration
  const labels: Record<typeof normalizedTier, string> = {
    bronze: "Bronze Explorer",
    silver: "Silver Explorer",
    gold: "Gold Explorer",
    platinum: "Platinum Explorer",
  };

  const labelText = labels[normalizedTier];

  // Render SVG medallion based on normalized tier
  const renderMedallion = () => {
    switch (normalizedTier) {
      case "platinum":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none filter drop-shadow-sm transition-transform duration-300 hover:scale-110 cursor-help"
          >
            <defs>
              {/* Premium Shimmering Platinum Gradient */}
              <linearGradient id="platGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#e0f2fe" />
                <stop offset="70%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="platBorder" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
              {/* Glowing Ice-Blue Drop Shadow */}
              <filter id="platGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0ea5e9" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Outer Circle with Glow Filter */}
            <circle cx="50" cy="50" r="45" fill="url(#platGrad)" stroke="url(#platBorder)" strokeWidth="3" filter="url(#platGlow)" />
            
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="37" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
            <circle cx="50" cy="50" r="34" fill="#0c4a6e" fillOpacity="0.15" />

            {/* Sparkles / Crown Mountain Icon */}
            <g transform="translate(26, 26) scale(2)" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Twin Peaks */}
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" strokeWidth="1.8" />
              {/* Star on top peak */}
              <path d="M8 0.5 L8 2.5 M7 1.5 L9 1.5" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Sparkle right */}
              <path d="M18 4 L18 6 M17 5 L19 5" stroke="#38bdf8" strokeWidth="1.5" />
            </g>

            {/* Inner center shine */}
            <circle cx="35" cy="35" r="8" fill="#ffffff" opacity="0.3" filter="blur(2px)" />
            {showTooltip && <title>{labelText}</title>}
          </svg>
        );

      case "gold":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none filter drop-shadow-sm transition-transform duration-300 hover:scale-110 cursor-help"
          >
            <defs>
              {/* Rich Yellow-Amber Gold Gradient */}
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
              <linearGradient id="goldBorder" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ca8a04" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              {/* Subtle Gold-Amber Glow */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor="#ca8a04" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Outer Circle with Glow Filter */}
            <circle cx="50" cy="50" r="45" fill="url(#goldGrad)" stroke="url(#goldBorder)" strokeWidth="3" filter="url(#goldGlow)" />
            
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="37" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.9" />
            <circle cx="50" cy="50" r="34" fill="#713f12" fillOpacity="0.1" />

            {/* Mountain Peak Icon (Conquering the Heights) */}
            <g transform="translate(26, 26) scale(2)" stroke="#713f12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </g>

            {/* Inner center shine */}
            <circle cx="35" cy="35" r="7" fill="#ffffff" opacity="0.25" filter="blur(2px)" />
            {showTooltip && <title>{labelText}</title>}
          </svg>
        );

      case "silver":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none filter drop-shadow-sm transition-transform duration-300 hover:scale-110 cursor-help"
          >
            <defs>
              {/* Sleek Gray-Steel Silver Gradient */}
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="35%" stopColor="#cbd5e1" />
                <stop offset="75%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="silverBorder" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              {/* Subtle Silver Glow */}
              <filter id="silverGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#64748b" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Outer Circle with Glow Filter */}
            <circle cx="50" cy="50" r="45" fill="url(#silverGrad)" stroke="url(#silverBorder)" strokeWidth="3" filter="url(#silverGlow)" />
            
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="37" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
            <circle cx="50" cy="50" r="34" fill="#1e293b" fillOpacity="0.08" />

            {/* Compass Icon (Finding the Way) */}
            <g transform="translate(26, 26) scale(2)" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#475569" fillOpacity="0.1" />
            </g>

            {/* Inner center shine */}
            <circle cx="35" cy="35" r="6" fill="#ffffff" opacity="0.2" filter="blur(2px)" />
            {showTooltip && <title>{labelText}</title>}
          </svg>
        );

      case "bronze":
      default:
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="select-none filter drop-shadow-sm transition-transform duration-300 hover:scale-110 cursor-help"
          >
            <defs>
              {/* Rich Copper/Amber Bronze Gradient */}
              <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="35%" stopColor="#fed7aa" />
                <stop offset="70%" stopColor="#d69e2e" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
              <linearGradient id="bronzeBorder" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7c2d12" />
                <stop offset="50%" stopColor="#ffedd5" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
              {/* Subtle Bronze Glow */}
              <filter id="bronzeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c2d12" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Outer Circle with Glow Filter */}
            <circle cx="50" cy="50" r="45" fill="url(#bronzeGrad)" stroke="url(#bronzeBorder)" strokeWidth="3" filter="url(#bronzeGlow)" />
            
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="37" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
            <circle cx="50" cy="50" r="34" fill="#431407" fillOpacity="0.08" />

            {/* Footprint Icon (Taking the First Steps) */}
            <g transform="translate(26, 26) scale(2)" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7.07l.06-1.01C6.24 4.09 7.97 3 9.5 3c1.38 0 2.5 1.12 2.5 2.5v2.9c0 1.2.6 2.3 1.6 3l1.9 1.35c.9.65 1.5 1.7 1.5 2.85V16c0 2.2-1.8 4-4 4s-4-1.8-4-4zM16 21v-2.38c0-2.12 1.88-3.77 2-6.55l.06-1.01c.18-1.97 1.91-3.06 3.44-3.06 1.38 0 2.5 1.12 2.5 2.5v2.9c0 1.2.6 2.3 1.6 3l1.9 1.35c.9.65 1.5 1.7 1.5 2.85V21c0 2.2-1.8 4-4 4s-4-1.8-4-4z" />
            </g>

            {/* Inner center shine */}
            <circle cx="35" cy="35" r="5" fill="#ffffff" opacity="0.15" filter="blur(2px)" />
            {showTooltip && <title>{labelText}</title>}
          </svg>
        );
    }
  };

  // Color classes for label rendering
  const labelColorClasses: Record<typeof normalizedTier, string> = {
    bronze: "text-orange-850 border-orange-200 bg-orange-50/50",
    silver: "text-slate-700 border-slate-200 bg-slate-50/50",
    gold: "text-amber-800 border-amber-200 bg-amber-50/50",
    platinum: "text-sky-800 border-sky-200 bg-sky-50/50",
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {renderMedallion()}
      {showLabel && (
        <span
          className={`px-2.5 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider border rounded-none shadow-sm ${labelColorClasses[normalizedTier]}`}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}
