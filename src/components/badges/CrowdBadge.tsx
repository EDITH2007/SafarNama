"use client";

import React, { useState } from "react";
import { Users, Info, Flame, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

export type CrowdLevel = "low" | "moderate" | "high" | "overcrowded";

export interface CrowdBadgeProps {
  crowdLevel?: CrowdLevel | string;
  bestTimeToVisit?: string;
  crowdSourceNote?: string;
  reportCount?: number;
  variant?: "pill" | "badge" | "full" | "meter";
  size?: "sm" | "md" | "lg";
  className?: string;
  showNoteTooltip?: boolean;
}

export const CROWD_CONFIG: Record<
  CrowdLevel,
  {
    label: string;
    shortLabel: string;
    description: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
    iconColor: string;
    meterPercentage: number;
    gradient: string;
  }
> = {
  low: {
    label: "Low Crowd • Peaceful",
    shortLabel: "Low Crowd",
    description: "Serene & secluded. Ideal for unhurried exploration and peaceful photography.",
    bgClass: "bg-emerald-50/90 hover:bg-emerald-100/90",
    textClass: "text-emerald-800",
    borderClass: "border-emerald-300/80",
    dotClass: "bg-emerald-500 animate-pulse",
    iconColor: "#059669",
    meterPercentage: 25,
    gradient: "from-emerald-400 to-teal-500",
  },
  moderate: {
    label: "Moderate Volume",
    shortLabel: "Moderate",
    description: "Manageable visitor traffic. Best enjoyed early morning or late afternoon.",
    bgClass: "bg-amber-50/90 hover:bg-amber-100/90",
    textClass: "text-amber-850",
    borderClass: "border-amber-300/80",
    dotClass: "bg-amber-500",
    iconColor: "#d97706",
    meterPercentage: 55,
    gradient: "from-amber-400 to-yellow-500",
  },
  high: {
    label: "High Footfall",
    shortLabel: "High Crowd",
    description: "Busy tourist volume during peak hours. Expect queues at popular viewpoints.",
    bgClass: "bg-orange-50/90 hover:bg-orange-100/90",
    textClass: "text-orange-900",
    borderClass: "border-orange-300/80",
    dotClass: "bg-orange-500",
    iconColor: "#ea580c",
    meterPercentage: 80,
    gradient: "from-orange-400 to-amber-600",
  },
  overcrowded: {
    label: "Overcrowded",
    shortLabel: "Overcrowded",
    description: "Peak congestion warning! Consider visiting off-peak or check our Hidden Gem alternatives.",
    bgClass: "bg-rose-50/95 hover:bg-rose-100/95",
    textClass: "text-rose-950 font-bold",
    borderClass: "border-rose-300/90",
    dotClass: "bg-rose-600 animate-ping",
    iconColor: "#dc2626",
    meterPercentage: 98,
    gradient: "from-rose-500 to-red-600",
  },
};

export default function CrowdBadge({
  crowdLevel = "low",
  bestTimeToVisit,
  crowdSourceNote,
  reportCount,
  variant = "pill",
  size = "md",
  className = "",
  showNoteTooltip = true,
}: CrowdBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Normalize crowd level string
  const normalizedLevel = (
    (crowdLevel || "low").toLowerCase().trim()
  ) as CrowdLevel;
  const config = CROWD_CONFIG[normalizedLevel] || CROWD_CONFIG.low;

  // Custom Gauge Dial SVG
  const renderGaugeIcon = (gaugeSize: number = 18) => {
    let needleAngle = -45; // low
    if (normalizedLevel === "moderate") needleAngle = 0;
    if (normalizedLevel === "high") needleAngle = 45;
    if (normalizedLevel === "overcrowded") needleAngle = 85;

    return (
      <svg
        width={gaugeSize}
        height={gaugeSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300"
      >
        {/* Outer Semi-circle Gauge Track */}
        <path
          d="M3.5 15.5A9.5 9.5 0 1 1 20.5 15.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Active Arc Highlight */}
        <path
          d="M3.5 15.5A9.5 9.5 0 0 1 12 6"
          stroke={config.iconColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Needle pivot */}
        <circle cx="12" cy="15.5" r="2.5" fill={config.iconColor} />
        {/* Needle hand */}
        <line
          x1="12"
          y1="15.5"
          x2="12"
          y2="8"
          stroke={config.iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${needleAngle}, 12, 15.5)`}
          className="transition-transform duration-500 ease-out"
        />
      </svg>
    );
  };

  if (variant === "pill") {
    return (
      <div className={`relative inline-block ${className}`}>
        <span
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider border shadow-xs transition-all cursor-pointer ${config.bgClass} ${config.textClass} ${config.borderClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
          {renderGaugeIcon(15)}
          <span>{config.shortLabel}</span>
        </span>

        {/* Hover Tooltip Popup */}
        {showNoteTooltip && showTooltip && (
          <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-earth-forest text-earth-sand text-xs shadow-xl border border-earth-clay/20 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-earth-sand/15 pb-1.5 mb-1.5 font-bold uppercase tracking-wider text-[10px] text-earth-saffron">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Crowd Level: {config.shortLabel}
              </span>
              <span className="text-[9px] text-earth-sand/60">Community Data</span>
            </div>
            <p className="font-sans font-light text-[11px] leading-relaxed text-earth-sand/90">
              {crowdSourceNote || config.description}
            </p>
            {bestTimeToVisit && (
              <div className="mt-2 pt-1.5 border-t border-earth-sand/10 text-[10px] text-earth-saffron/90 font-medium">
                💡 Best time: {bestTimeToVisit}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 border shadow-sm ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}>
        {renderGaugeIcon(18)}
        <div className="flex flex-col">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest leading-none">
            Crowd Meter
          </span>
          <span className="text-xs font-sans font-bold leading-tight">
            {config.label}
          </span>
        </div>
      </div>
    );
  }

  if (variant === "meter" || variant === "full") {
    return (
      <div className={`p-4 md:p-5 bg-white border border-earth-clay/10 shadow-md space-y-3 font-sans ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 border ${config.bgClass} ${config.borderClass}`}>
              {renderGaugeIcon(22)}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-earth-clay/70 block">
                Seasonal Crowd Meter
              </span>
              <span className={`text-base font-serif font-bold ${config.textClass}`}>
                {config.label}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-earth-forest bg-earth-sand px-2 py-0.5 border border-earth-clay/15">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Verified Community Data
            </span>
            {reportCount && reportCount > 0 && (
              <span className="block text-[10px] text-earth-clay/60 font-light mt-0.5">
                Based on {reportCount} Explorer reports
              </span>
            )}
          </div>
        </div>

        {/* Visual Multi-Segment Crowd Progress Meter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-earth-clay uppercase tracking-wider">
            <span className={normalizedLevel === "low" ? "text-emerald-700 font-bold" : ""}>Quiet</span>
            <span className={normalizedLevel === "moderate" ? "text-amber-700 font-bold" : ""}>Moderate</span>
            <span className={normalizedLevel === "high" ? "text-orange-700 font-bold" : ""}>High</span>
            <span className={normalizedLevel === "overcrowded" ? "text-rose-700 font-bold" : ""}>Overcrowded</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-earth-clay/15 relative">
            <div
              style={{ width: `${config.meterPercentage}%` }}
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out rounded-full`}
            />
          </div>
        </div>

        {/* Explanation Note */}
        {(crowdSourceNote || config.description) && (
          <div className="p-3 bg-earth-sand/30 border-l-2 border-earth-terracotta text-xs text-earth-charcoal/80 font-light leading-relaxed">
            <p><span className="font-semibold text-earth-forest">Crowd Analysis:</span> {crowdSourceNote || config.description}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
