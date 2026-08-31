"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ExplorerBadge from "./badges/ExplorerBadge";
import {
  Compass,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Award,
} from "lucide-react";

interface DashboardGuidesTabProps {
  onNavigateToProfile?: () => void;
}

export default function DashboardGuidesTab({ onNavigateToProfile }: DashboardGuidesTabProps) {
  const [selectedDestination, setSelectedDestination] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const rawGuides = useQuery((api as any).guides.listGuides, {
    destination: selectedDestination,
    language: selectedLanguage,
    search: searchQuery,
  });

  const destinationsList = ["All", "Manali", "Hampi", "Munnar", "Spiti Valley", "Ladakh", "Gokarna"];
  const languagesList = ["All", "English", "Hindi", "Malayalam", "Kannada", "Pahari", "Tibetan", "Tamil", "Telugu"];

  const guides = useMemo(() => {
    return rawGuides || [];
  }, [rawGuides]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Title */}
      <div className="space-y-1 border-b border-earth-clay/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-earth-forest">
            Local Guides & Explorer Marketplace
          </h2>
          <p className="font-sans text-xs text-earth-charcoal/70 font-light">
            Book verified Gold & Platinum community explorers for authentic local guided tours, treks, and experiences.
          </p>
        </div>

        <Link
          href="/guides"
          className="px-4 py-2 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider hover:bg-earth-terracotta transition-colors inline-flex items-center space-x-1.5 self-start md:self-auto shrink-0"
        >
          <span>Explore Public Marketplace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Become a Guide Callout Banner */}
      <div className="bg-earth-sand/50 border border-earth-clay/20 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-earth-forest text-earth-saffron rounded-full flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-serif text-sm font-bold text-earth-forest">
              Are you a Gold Explorer or Higher?
            </h3>
            <p className="text-xs text-earth-charcoal/70 font-light">
              Turn on Guide Mode in your Profile settings to start offering local experiences and earning points!
            </p>
          </div>
        </div>

        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="px-4 py-2 border border-earth-forest text-earth-forest hover:bg-earth-forest hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
          >
            Go to Guide Mode Settings
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-earth-clay/15 p-4 md:p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="dash-guide-search" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
              Search Name or Location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-clay" />
              <input
                id="dash-guide-search"
                name="dashGuideSearch"
                type="text"
                placeholder="e.g. Tenzing, Hampi, Trek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta"
              />
            </div>
          </div>

          {/* Destination Filter */}
          <div>
            <label htmlFor="dash-guide-dest-filter" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
              Filter by Destination
            </label>
            <select
              id="dash-guide-dest-filter"
              name="dashGuideDestFilter"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta cursor-pointer"
            >
              {destinationsList.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Destinations" : d}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label htmlFor="dash-guide-lang-filter" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
              Filter by Language
            </label>
            <select
              id="dash-guide-lang-filter"
              name="dashGuideLangFilter"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta cursor-pointer"
            >
              {languagesList.map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All Languages" : l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Guide Cards Grid */}
      {rawGuides === undefined ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-white border border-earth-clay/10 animate-pulse" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="bg-white border border-earth-clay/15 p-12 text-center space-y-4">
          <Compass className="h-10 w-10 text-earth-terracotta mx-auto" />
          <h3 className="font-serif text-lg font-bold text-earth-forest">No Local Guides Found</h3>
          <p className="text-xs text-earth-charcoal/70">
            No active guides match your selected search criteria.
          </p>
          <button
            onClick={() => {
              setSelectedDestination("All");
              setSelectedLanguage("All");
              setSearchQuery("");
            }}
            className="px-5 py-2 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide: any) => (
            <div
              key={guide._id}
              className="bg-white border border-earth-clay/20 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-earth-forest text-white font-serif font-bold text-base flex items-center justify-center border-2 border-earth-sand shrink-0 shadow-inner">
                      {guide.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h3 className="font-serif text-base font-bold text-earth-forest">
                          {guide.name}
                        </h3>
                        {guide.isVerified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-50 shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-earth-charcoal/70 flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-earth-terracotta shrink-0" />
                        <span>{guide.homeTown}</span>
                      </span>
                    </div>
                  </div>

                  <ExplorerBadge tier={guide.tier} size={40} showTooltip />
                </div>

                {/* Rating & Exp */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-earth-clay/10">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-bold text-earth-forest">{guide.rating}</span>
                    <span className="text-[10px] text-earth-charcoal/60">({guide.reviewCount})</span>
                  </div>
                  <span className="text-[10px] font-bold text-earth-terracotta uppercase tracking-wider bg-earth-sand/50 px-2 py-0.5 border border-earth-clay/15">
                    {guide.guideProfile?.yearsExperience} Yrs Exp
                  </span>
                </div>

                <p className="text-xs text-earth-charcoal/80 font-light line-clamp-2">
                  "{guide.guideProfile?.bio}"
                </p>

                {/* Destinations */}
                <div className="flex flex-wrap gap-1">
                  {guide.guideProfile?.destinationsCovered?.slice(0, 3).map((d: string) => (
                    <span key={d} className="px-2 py-0.5 bg-earth-sand/60 text-earth-forest text-[10px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-earth-sand/20 border-t border-earth-clay/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-earth-charcoal/60 block">
                    Daily Rate
                  </span>
                  <span className="font-serif text-base font-bold text-earth-forest">
                    ₹{guide.guideProfile?.pricePerDayINR.toLocaleString("en-IN")}
                  </span>
                </div>

                <Link
                  href={`/guides/${guide._id}`}
                  className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1"
                >
                  <span>Book Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
