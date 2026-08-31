"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExplorerBadge from "@/components/badges/ExplorerBadge";
import {
  Compass,
  Search,
  MapPin,
  Globe,
  Star,
  Award,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  UserCheck,
} from "lucide-react";

export default function GuidesPage() {
  const [selectedDestination, setSelectedDestination] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Query guides from Convex
  const rawGuides = useQuery((api as any).guides.listGuides, {
    destination: selectedDestination,
    language: selectedLanguage,
    search: searchQuery,
  });

  // Extract unique destinations and languages for filters
  const destinationsList = ["All", "Manali", "Hampi", "Munnar", "Spiti Valley", "Ladakh", "Gokarna"];
  const languagesList = ["All", "English", "Hindi", "Malayalam", "Kannada", "Pahari", "Tibetan", "Tamil", "Telugu"];

  const guides = useMemo(() => {
    if (!rawGuides) return [];
    if (selectedTier === "All") return rawGuides;
    return rawGuides.filter((g: any) => g.tier === selectedTier);
  }, [rawGuides, selectedTier]);

  return (
    <div className="min-h-screen flex flex-col bg-earth-sand/30 font-sans text-earth-charcoal">
      <Navbar />

      {/* Hero Header */}
      <div className="relative bg-earth-forest text-white py-16 md:py-24 px-4 overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-earth-saffron/20 border border-earth-saffron/40 text-earth-saffron text-xs font-bold uppercase tracking-widest rounded-none">
            <UserCheck className="h-4 w-4" />
            <span>Community-First Guide Marketplace</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight leading-tight text-earth-sand">
            Hire a Local Explorer Guide
          </h1>

          <p className="font-sans text-sm md:text-base text-earth-sand/80 max-w-2xl font-light leading-relaxed">
            Our local guides are NOT anonymous third-party freelancers. They are SafarNama’s highest-ranked Gold & Platinum Explorers — verified local experts who submit hidden gems, write community stories, and lead authentic offbeat journeys.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-earth-sand/90 font-medium">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-earth-saffron" />
              <span>Verified Explorer Trust Signal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-earth-saffron" />
              <span>Gold & Platinum Tier Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-earth-saffron" />
              <span>Fixed & Custom Itineraries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
        <div className="bg-white border border-earth-clay/20 shadow-lg p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label htmlFor="guides-page-search" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
                Search Guides or Locations
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-clay" />
                <input
                  id="guides-page-search"
                  name="guidesPageSearch"
                  type="text"
                  placeholder="e.g. Tenzing, Hampi, Trek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta transition-colors"
                />
              </div>
            </div>

            {/* Destination Filter */}
            <div>
              <label htmlFor="guides-page-dest" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
                Destination
              </label>
              <select
                id="guides-page-dest"
                name="guidesPageDest"
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta transition-colors cursor-pointer"
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
              <label htmlFor="guides-page-lang" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
                Language Spoken
              </label>
              <select
                id="guides-page-lang"
                name="guidesPageLang"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta transition-colors cursor-pointer"
              >
                {languagesList.map((l) => (
                  <option key={l} value={l}>
                    {l === "All" ? "All Languages" : l}
                  </option>
                ))}
              </select>
            </div>

            {/* Explorer Tier Filter */}
            <div>
              <label htmlFor="guides-page-tier" className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/70 mb-1">
                Explorer Rank Level
              </label>
              <select
                id="guides-page-tier"
                name="guidesPageTier"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta transition-colors cursor-pointer"
              >
                <option value="All">All Explorer Levels</option>
                <option value="Platinum">Platinum Explorer</option>
                <option value="Gold">Gold Explorer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Guides Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-earth-clay/15 pb-4 gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-earth-forest">
              Verified Explorer Guides ({guides.length})
            </h2>
            <p className="font-sans text-xs text-earth-charcoal/70 font-light">
              Book curated day tours, multi-day trekking packages, or request custom tailor-made itineraries.
            </p>
          </div>
        </div>

        {rawGuides === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white border border-earth-clay/10 animate-pulse p-6" />
            ))}
          </div>
        ) : guides.length === 0 ? (
          <div className="bg-white border border-earth-clay/15 p-12 text-center space-y-4 my-8">
            <div className="h-16 w-16 bg-earth-sand rounded-full flex items-center justify-center mx-auto text-earth-terracotta">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-earth-forest">No Guides Found</h3>
            <p className="text-xs text-earth-charcoal/70 max-w-md mx-auto">
              No local guides match your search filter right now. Try clearing filters to see all available community guides.
            </p>
            <button
              onClick={() => {
                setSelectedDestination("All");
                setSelectedLanguage("All");
                setSelectedTier("All");
                setSearchQuery("");
              }}
              className="px-6 py-2.5 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide: any) => (
              <div
                key={guide._id}
                className="bg-white border border-earth-clay/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top Header */}
                  <div className="p-6 border-b border-earth-clay/10 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="h-14 w-14 bg-earth-forest text-white font-serif font-bold text-lg flex items-center justify-center border-2 border-earth-sand shrink-0 shadow-inner">
                          {guide.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-serif text-lg font-bold text-earth-forest group-hover:text-earth-terracotta transition-colors">
                              {guide.name}
                            </h3>
                            {guide.isVerified && (
                              <ShieldCheck className="h-4 w-4 text-blue-500 fill-blue-50 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-earth-charcoal/70 flex items-center space-x-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-earth-terracotta shrink-0" />
                            <span>{guide.homeTown}</span>
                          </p>
                        </div>
                      </div>

                      {/* Explorer Badge Medallion */}
                      <ExplorerBadge tier={guide.tier} size={48} showTooltip />
                    </div>

                    {/* Stats Pill Row */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-earth-clay/10 text-earth-charcoal/80">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span className="font-bold text-earth-forest">{guide.rating}</span>
                        <span className="text-[10px] text-earth-charcoal/60">({guide.reviewCount} reviews)</span>
                      </div>
                      <div className="text-[10px] font-bold text-earth-terracotta uppercase tracking-wider bg-earth-sand/50 px-2 py-0.5 border border-earth-clay/15">
                        {guide.guideProfile?.yearsExperience} Yrs Experience
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Bio snippet */}
                    <p className="text-xs text-earth-charcoal/80 font-light leading-relaxed line-clamp-3">
                      "{guide.guideProfile?.bio}"
                    </p>

                    {/* Destinations Covered */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-earth-forest/70 block">
                        Destinations Covered:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {guide.guideProfile?.destinationsCovered?.map((dest: string) => (
                          <span
                            key={dest}
                            className="px-2 py-0.5 bg-earth-sand/60 text-earth-forest text-[10px] font-medium border border-earth-clay/15"
                          >
                            {dest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-earth-forest/70 block">
                        Languages:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {guide.guideProfile?.languagesSpoken?.map((lang: string) => (
                          <span
                            key={lang}
                            className="px-2 py-0.5 bg-white text-earth-charcoal/80 text-[10px] border border-earth-clay/20"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Pricing & CTA */}
                <div className="p-6 bg-earth-sand/20 border-t border-earth-clay/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/60 block">
                      Daily Guide Rate
                    </span>
                    <span className="font-serif text-lg font-bold text-earth-forest">
                      ₹{guide.guideProfile?.pricePerDayINR.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-sans font-normal text-earth-charcoal/70">/ day</span>
                    </span>
                  </div>

                  <Link
                    href={`/guides/${guide._id}`}
                    className="px-4 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5 group-hover:translate-x-0.5 duration-200"
                  >
                    <span>View & Book</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
