"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  activeCrowdLevel?: string;
  onSelectCrowdLevel?: (crowdLevel: string) => void;
  variant?: "light" | "dark";
  defaultVisibleCount?: number;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
  activeCrowdLevel = "All",
  onSelectCrowdLevel,
  variant = "light",
  defaultVisibleCount = 6,
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const CROWD_OPTIONS = [
    { id: "All", label: "All Crowds" },
    { id: "low", label: "🟢 Low Crowd" },
    { id: "moderate", label: "🟡 Moderate" },
    { id: "high", label: "🟠 High Crowd" },
    { id: "overcrowded", label: "🔴 Overcrowded" },
  ];

  // Filter out any duplicates while preserving order
  const uniqueCategories = useMemo(() => Array.from(new Set(categories)), [categories]);

  // Compute visible categories and hidden overflow categories
  const { visibleCategories, hiddenCategories } = useMemo(() => {
    const defaultVisible = uniqueCategories.slice(0, defaultVisibleCount);
    
    // If active category is outside the default visible set, surface it in the visible row!
    if (activeCategory && !defaultVisible.includes(activeCategory)) {
      const visible = [...defaultVisible.slice(0, Math.max(1, defaultVisibleCount - 1)), activeCategory];
      const hidden = uniqueCategories.filter((cat) => !visible.includes(cat));
      return { visibleCategories: visible, hiddenCategories: hidden };
    }

    const hidden = uniqueCategories.slice(defaultVisibleCount);
    return { visibleCategories: defaultVisible, hiddenCategories: hidden };
  }, [uniqueCategories, activeCategory, defaultVisibleCount]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = variant === "dark";

  // Base pill styles
  const activeStyle = isDark
    ? "bg-earth-terracotta border-earth-terracotta text-white shadow-sm font-bold"
    : "bg-earth-forest border-earth-forest text-earth-sand shadow-sm font-bold";

  const inactiveStyle = isDark
    ? "bg-[#142B1B] border-white/20 text-earth-sand/75 hover:border-white hover:text-white"
    : "bg-white border-earth-clay/20 text-earth-charcoal/75 hover:border-earth-charcoal hover:text-earth-charcoal";

  const viewMoreActiveStyle = isDark
    ? "bg-earth-saffron/20 border-earth-saffron text-earth-saffron font-bold ring-1 ring-earth-saffron/50"
    : "bg-earth-terracotta/15 border-earth-terracotta text-earth-terracotta font-bold ring-1 ring-earth-terracotta/50";

  const viewMoreInactiveStyle = isDark
    ? "bg-white/5 border-white/20 text-earth-saffron hover:bg-white/10 hover:border-earth-saffron"
    : "bg-earth-sand border-earth-clay/25 text-earth-terracotta hover:bg-earth-clay/10 hover:border-earth-terracotta";

  return (
    <div className="w-full space-y-3 relative" ref={containerRef}>
      {/* Main Single Horizontal Row Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        <div className="flex items-center gap-2 shrink-0">
          {visibleCategories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 font-sans text-xs uppercase tracking-widest border transition-all duration-200 rounded-none cursor-pointer whitespace-nowrap ${
                  isActive ? activeStyle : inactiveStyle
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* View More / View Less Pill */}
        {hiddenCategories.length > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 font-sans text-xs uppercase tracking-widest border transition-all duration-200 rounded-none cursor-pointer shrink-0 flex items-center space-x-1.5 whitespace-nowrap ${
              isExpanded ? viewMoreActiveStyle : viewMoreInactiveStyle
            }`}
          >
            <span>
              {isExpanded
                ? "View Less"
                : `View More (+${hiddenCategories.length})`}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            )}
          </button>
        )}
      </div>

      {/* Optional Crowd Filter Row */}
      {onSelectCrowdLevel && (
        <div className="flex items-center gap-2 pt-1 border-t border-earth-clay/10 overflow-x-auto no-scrollbar">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-earth-clay/70 shrink-0 mr-1">
            Crowd Filter:
          </span>
          {CROWD_OPTIONS.map((opt) => {
            const isActive = activeCrowdLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectCrowdLevel(opt.id)}
                className={`px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wider border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-earth-terracotta border-earth-terracotta text-white shadow-xs"
                    : isDark
                    ? "bg-white/5 border-white/10 text-earth-sand/70 hover:border-white/30"
                    : "bg-white border-earth-clay/15 text-earth-charcoal/70 hover:border-earth-terracotta"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded categories drawer / panel */}
      {isExpanded && hiddenCategories.length > 0 && (
        <div
          className={`p-4 border transition-all duration-300 animate-in fade-in slide-in-from-top-2 z-30 ${
            isDark
              ? "bg-[#0d1d12] border-white/15 shadow-2xl"
              : "bg-white border-earth-clay/15 shadow-xl"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {hiddenCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat);
                    setIsExpanded(false);
                  }}
                  className={`px-3.5 py-1.5 font-sans text-xs uppercase tracking-wider border transition-all duration-200 rounded-none cursor-pointer flex items-center space-x-1 ${
                    isActive ? activeStyle : inactiveStyle
                  }`}
                >
                  {isActive && <Check className="h-3 w-3 shrink-0" />}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
