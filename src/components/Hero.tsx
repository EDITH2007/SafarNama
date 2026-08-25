"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search, MapPin, Sparkles, Compass } from "lucide-react";
import { useUser } from "./UserContext";

// Dynamically import ThreeParticles with SSR disabled to prevent hydration issues
const ThreeParticles = dynamic(() => import("./ThreeParticles"), { ssr: false });

interface HeroProps {
  onSearch: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { destinations, hiddenGems } = useUser();

  const approvedGems = useMemo(() => {
    return hiddenGems.filter((g: any) => g.status === "approved" || g.status === "verified");
  }, [hiddenGems]);

  const trendingTags = useMemo(() => {
    // Combine official destinations and approved hidden gems
    const all = [
      ...destinations.map((d: any) => ({ title: d.title, time: d._creationTime || d.createdAt || 0 })),
      ...approvedGems.map((g: any) => ({ title: g.title, time: g.approvedAt || g._creationTime || 0 }))
    ];

    // Sort by creation date descending (newest first)
    all.sort((a, b) => b.time - a.time);

    // Get unique titles
    const unique: string[] = [];
    for (const item of all) {
      if (!unique.includes(item.title)) {
        unique.push(item.title);
      }
      if (unique.length >= 4) break;
    }

    // Fallback if empty (e.g. while database is loading or empty)
    if (unique.length === 0) {
      return ["Munnar Tea Hills", "Ruins of Hampi", "Gandikota Grand Canyon", "Phugtal Monastery"];
    }
    return unique;
  }, [destinations, approvedGems]);

  // Combined live search results for both destinations AND hidden gems
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matchedDestinations = destinations
      .filter((d: any) =>
        d.title.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      )
      .map((d: any) => ({
        id: d.id,
        title: d.title,
        location: d.location,
        category: d.category,
        type: "Official" as const,
        link: `/destinations/${d.id}`,
        photo: d.photos?.[0] || "",
      }));

    const matchedGems = approvedGems
      .filter((g: any) =>
        g.title.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      )
      .map((g: any) => ({
        id: g.id,
        title: g.title,
        location: g.location,
        category: g.category,
        type: "Hidden Gem" as const,
        link: `/hidden-gems/${g.id}`,
        photo: g.photo || "",
      }));

    return [...matchedDestinations, ...matchedGems];
  }, [query, destinations, approvedGems]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsFocused(false);

    // Determine whether to scroll to hidden gems or destinations based on results
    const q = query.trim().toLowerCase();
    const matchesOfficial = destinations.some((d: any) =>
      d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
    const matchesGem = approvedGems.some((g: any) =>
      g.title.toLowerCase().includes(q) || g.location.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );

    let targetId = "destinations";
    if (!matchesOfficial && matchesGem) {
      targetId = "hidden-gems";
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    onSearch(tag);
    setIsFocused(false);

    const q = tag.toLowerCase();
    const matchesOfficial = destinations.some((d: any) =>
      d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
    );
    const matchesGem = approvedGems.some((g: any) =>
      g.title.toLowerCase().includes(q) || g.location.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );

    let targetId = "destinations";
    if (!matchesOfficial && matchesGem) {
      targetId = "hidden-gems";
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 px-4 isolate">
      {/* 3D background */}
      <ThreeParticles />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 select-none">
        <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-saffron bg-earth-sand/10 px-4 py-1.5 border border-earth-saffron/20 inline-block">
          India's Premier Discovery Network
        </span>

        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-earth-sand leading-tight">
          Discover the Unseen <br />
          <span className="text-earth-saffron">Subcontinent</span>
        </h1>

        <p className="font-sans text-lg md:text-xl text-earth-sand/80 max-w-2xl mx-auto font-light leading-relaxed">
          A community-driven chronicle of hidden gems, regional cultures, and authentic itineraries curated by local explorers.
        </p>

        {/* Search Bar Container */}
        <div className="relative max-w-2xl mx-auto" ref={dropdownRef}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-0.5 bg-earth-sand shadow-2xl p-1.5 border border-earth-clay/10 transition-all duration-300"
          >
            <div className="flex-1 flex items-center px-4 py-3 space-x-2 text-earth-charcoal">
              <Search className="h-5 w-5 text-earth-clay/60 shrink-0" />
              <input
                type="text"
                value={query}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsFocused(true);
                }}
                placeholder="Search destinations or hidden gems (e.g. Munnar, Hampi, Phugtal)..."
                className="bg-transparent text-sm w-full font-sans focus:outline-none placeholder-earth-clay/50 text-earth-charcoal"
              />
            </div>
            <div className="h-full w-[1px] bg-earth-clay/10 hidden sm:block self-center mx-2" />
            <button
              type="submit"
              className="px-8 py-3.5 bg-earth-terracotta hover:bg-earth-forest text-earth-sand font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none shrink-0 cursor-pointer"
            >
              Explore
            </button>
          </form>

          {/* Live Search Results Dropdown */}
          {isFocused && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-earth-clay/20 shadow-2xl z-50 max-h-96 overflow-y-auto rounded-none text-left divide-y divide-earth-clay/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 bg-earth-sand/40 flex justify-between items-center text-[10px] font-sans font-bold uppercase tracking-widest text-earth-clay">
                <span>Search Results ({searchResults.length})</span>
                <span>Press Enter to filter page</span>
              </div>

              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.link}
                    onClick={() => setIsFocused(false)}
                    className="p-3.5 flex items-center justify-between hover:bg-earth-sand/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.title}
                          className="h-10 w-12 object-cover shrink-0 border border-earth-clay/10"
                        />
                      ) : (
                        <div className="h-10 w-12 bg-earth-sand flex items-center justify-center shrink-0 border border-earth-clay/10">
                          <Compass className="h-5 w-5 text-earth-clay/40" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-sm font-bold text-earth-charcoal group-hover:text-earth-terracotta transition-colors truncate">
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-xs text-earth-clay/70 font-sans font-light truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-earth-terracotta" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tag badge distinguishing Official vs Hidden Gem */}
                    <div className="ml-3 shrink-0">
                      {item.type === "Official" ? (
                        <span className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-widest bg-earth-terracotta text-white rounded-none border border-earth-terracotta">
                          Official
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-widest bg-earth-forest text-earth-saffron rounded-none border border-earth-saffron/30 flex items-center space-x-1">
                          <Sparkles className="h-2.5 w-2.5 fill-current shrink-0" />
                          <span>Hidden Gem</span>
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-xs font-sans text-earth-clay/70 font-light">
                  No destinations or hidden gems found matching &quot;{query}&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Short suggestion pills & AI Planner Quick CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-earth-sand/70 text-xs font-sans tracking-wide">
          <Link
            href="/dashboard?tab=planner"
            className="px-3.5 py-1 bg-earth-terracotta hover:bg-earth-saffron hover:text-earth-forest text-white font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 shadow-md border border-earth-terracotta"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Craft Custom Itinerary</span>
          </Link>
          <span className="flex items-center space-x-1"><MapPin className="h-3 w-3 text-earth-saffron" /> <span>Trending:</span></span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSelectTag(tag)}
              className="px-3 py-1 bg-white/5 border border-white/10 hover:border-earth-saffron hover:text-earth-saffron transition-all duration-200 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow overlay at bottom to transition smoothly to light sand background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-earth-sand to-transparent pointer-events-none" />
    </section>
  );
}

