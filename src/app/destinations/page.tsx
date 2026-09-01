"use client";

import { useState } from "react";
import { Star, MapPin, Search, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";
import { CATEGORIES, getCrowdData } from "@/app/data/mockData";
import dynamic from "next/dynamic";

import CategoryFilter from "@/components/CategoryFilter";
import CrowdBadge from "@/components/badges/CrowdBadge";

const DestinationMap = dynamic(() => import("@/components/DestinationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[480px] rounded-2xl bg-white border border-earth-clay/10 shadow-lg flex items-center justify-center font-sans text-earth-charcoal/50 animate-pulse">
      Loading interactive map...
    </div>
  ),
});

export default function DestinationsPage() {
  const { destinations, toggleWishlist, isWishlisted } = useUser();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCrowdLevel, setActiveCrowdLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDestinationId, setActiveDestinationId] = useState<string | null>(null);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesCategory =
      activeCategory === "All" || dest.category === activeCategory;

    const crowdData = getCrowdData(dest);
    const matchesCrowd =
      activeCrowdLevel === "All" ||
      crowdData.crowdLevel === activeCrowdLevel;

    const matchesSearch =
      !searchQuery ||
      dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCrowd && matchesSearch;
  });

  const sortedDestinations = [...filteredDestinations].sort((a, b) => b.rating - a.rating);

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <title>Official Chronicles | SafarNama</title>
      <meta name="description" content="Explore SafarNama's curated and verified travel guides for India's most iconic regions." />
      <Navbar />

      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-terracotta bg-earth-terracotta/5 px-4 py-1.5 border border-earth-terracotta/10 inline-block">
              Explore India
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-earth-forest">
              Official Chronicles
            </h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              Curated and verified guides designed by our team to help you navigate India's most iconic regions — with community & seasonal Crowd Meters.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-earth-clay/10">
            {/* Category and Crowd Filter Tabs */}
            <div className="flex-1 min-w-0">
              <CategoryFilter
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                activeCrowdLevel={activeCrowdLevel}
                onSelectCrowdLevel={setActiveCrowdLevel}
                variant="light"
              />
            </div>

            {/* Search Input */}
            <div className="w-full lg:w-72 flex items-center bg-white border border-earth-clay/20 px-3.5 py-2 shadow-sm focus-within:border-earth-terracotta transition-colors shrink-0">
              <Search className="h-4 w-4 text-earth-clay/60 mr-2 shrink-0" />
              <input
                id="destinations-search"
                name="destinationsSearch"
                type="text"
                aria-label="Search chronicles"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chronicles..."
                className="bg-transparent text-sm w-full font-sans focus:outline-none placeholder-earth-clay/50 text-earth-charcoal"
              />
            </div>
          </div>

          {/* Side-by-Side Layout (Map sticky on Left, Cards scrollable on Right on Desktop; Stacked on Mobile) */}
          <div className="flex flex-col lg:flex-row items-start gap-8 relative">
            {/* Left Column: Interactive Exploration Map (Sticky on Desktop) */}
            <div className="w-full lg:w-5/12 lg:sticky lg:top-24 z-10 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl md:text-2xl font-bold text-earth-forest">
                  Interactive Exploration Route
                </h2>
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-earth-terracotta bg-earth-terracotta/5 px-3 py-1 border border-earth-terracotta/10">
                  {sortedDestinations.length} Destination{sortedDestinations.length !== 1 ? "s" : ""} on Map
                </span>
              </div>
              <DestinationMap
                destinations={sortedDestinations}
                activeDestinationId={activeDestinationId}
              />
            </div>

            {/* Right Column: Destination Cards (2 per row on desktop, scrollable) */}
            <div className="w-full lg:w-7/12 min-w-0 isolate">
              {sortedDestinations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {sortedDestinations.map((dest) => {
                    const crowdData = getCrowdData(dest);
                    const isOvercrowded = crowdData.crowdLevel === "overcrowded" || crowdData.crowdLevel === "high";

                    return (
                      <article
                        key={dest.id}
                        id={`dest-card-${dest.id}`}
                        onMouseEnter={() => setActiveDestinationId(dest.id)}
                        onMouseLeave={() => setActiveDestinationId(null)}
                        className={`group flex flex-col bg-white border transition-all duration-200 relative overflow-hidden ${
                          activeDestinationId === dest.id
                            ? "ring-2 ring-earth-terracotta border-transparent shadow-xl z-10"
                            : "border-earth-clay/10 hover:border-earth-clay/30 hover:shadow-lg z-0"
                        }`}
                      >
                        {/* Photo */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                          <Link href={`/destinations/${dest.id}`} className="block w-full h-full">
                            <img
                              src={dest.photos[0]}
                              alt={dest.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          </Link>

                          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                            <span className="bg-earth-sand/95 backdrop-blur-xs text-earth-forest px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider border border-earth-clay/15 shadow-xs">
                              {dest.category}
                            </span>

                            {/* Crowd Meter Badge */}
                            <CrowdBadge
                              crowdLevel={crowdData.crowdLevel}
                              bestTimeToVisit={crowdData.bestTimeToVisit || dest.bestTimeToVisit}
                              crowdSourceNote={crowdData.crowdSourceNote}
                              variant="pill"
                            />
                          </div>

                          {/* Heart button for wishlist */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(dest.id);
                            }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-earth-charcoal rounded-full transition-all shadow-md z-20 cursor-pointer border border-earth-clay/10"
                            title={isWishlisted(dest.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            <Heart
                              className={`h-4 w-4 transition-transform duration-200 active:scale-75 ${
                                isWishlisted(dest.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-earth-clay/60 hover:text-red-500"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-earth-clay/80 font-sans font-medium">
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                                <span className="truncate max-w-[130px]">{dest.location}</span>
                              </span>
                              <span className="flex items-center space-x-1 text-earth-saffron shrink-0">
                                <Star className="h-3.5 w-3.5 fill-current shrink-0" />
                                <span>{dest.rating}</span>
                              </span>
                            </div>

                            <Link href={`/destinations/${dest.id}`} className="block">
                              <h3 className="font-serif text-lg font-bold text-earth-charcoal group-hover:text-earth-terracotta transition-colors line-clamp-1">
                                {dest.title}
                              </h3>
                            </Link>
                            <p className="font-sans text-xs text-earth-charcoal/70 line-clamp-2 leading-relaxed font-light">
                              {dest.description}
                            </p>

                            {/* Overcrowded recommendation callout link */}
                            {isOvercrowded && (
                              <div className="pt-1">
                                <Link
                                  href={`/destinations/${dest.id}#try-this-instead`}
                                  className="inline-flex items-center space-x-1 text-[9px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 border border-rose-200 hover:bg-rose-100 transition-colors"
                                >
                                  <Sparkles className="h-3 w-3 text-rose-600 shrink-0" />
                                  <span>Quiet Gems →</span>
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-earth-clay/10 flex items-center justify-between">
                            <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-earth-clay/60">
                              Verified Guide
                            </span>
                            <Link href={`/destinations/${dest.id}`} className="font-sans text-xs font-semibold text-earth-terracotta group-hover:translate-x-1 transition-transform duration-200 uppercase tracking-widest flex items-center space-x-1">
                              <span>Read Route</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 border border-dashed border-earth-clay/20 bg-white">
                  <p className="font-sans text-sm text-earth-charcoal/60 font-light">
                    No matching destinations found for your query. Try clearing filters or searching for something else.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
