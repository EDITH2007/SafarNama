"use client";

import { useState } from "react";
import { Star, MapPin, Search, Heart } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";
import { CATEGORIES } from "@/app/data/mockData";
import dynamic from "next/dynamic";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDestinationId, setActiveDestinationId] = useState<string | null>(null);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesCategory =
      activeCategory === "All" || dest.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
              Curated and verified guides designed by our team to help you navigate India's most iconic regions.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-earth-clay/10">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 font-sans text-xs font-semibold uppercase tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
                    activeCategory === cat
                      ? "bg-earth-forest border-earth-forest text-earth-sand shadow-sm"
                      : "border-earth-clay/20 text-earth-charcoal/70 hover:border-earth-charcoal hover:text-earth-charcoal"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 flex items-center bg-white border border-earth-clay/20 px-3.5 py-2 shadow-sm focus-within:border-earth-terracotta transition-colors">
              <Search className="h-4 w-4 text-earth-clay/60 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chronicles..."
                className="bg-transparent text-sm w-full font-sans focus:outline-none placeholder-earth-clay/50 text-earth-charcoal"
              />
            </div>
          </div>

          {/* Map Component Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-earth-forest">
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

          {/* Grid Layout */}
          {sortedDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sortedDestinations.map((dest) => (
                <article
                  key={dest.id}
                  id={`dest-card-${dest.id}`}
                  onMouseEnter={() => setActiveDestinationId(dest.id)}
                  onMouseLeave={() => setActiveDestinationId(null)}
                  className={`group flex flex-col bg-white border hover:shadow-xl hover:border-earth-clay/10 transition-all duration-300 relative ${
                    activeDestinationId === dest.id
                      ? "ring-2 ring-earth-terracotta border-transparent shadow-xl scale-[1.01]"
                      : "border-earth-clay/5"
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
                    <span className="absolute top-4 left-4 bg-earth-sand text-earth-forest px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider border border-earth-clay/15 z-10">
                      {dest.category}
                    </span>
                    
                    {/* Heart button for wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(dest.id);
                      }}
                      className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-earth-charcoal rounded-full transition-all shadow-md z-20 cursor-pointer border border-earth-clay/10"
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
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-earth-clay/80 font-sans font-medium">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                          <span>{dest.location}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-earth-saffron">
                          <Star className="h-3.5 w-3.5 fill-current shrink-0" />
                          <span>{dest.rating}</span>
                        </span>
                      </div>

                      <Link href={`/destinations/${dest.id}`} className="block">
                        <h3 className="font-serif text-xl font-bold text-earth-charcoal group-hover:text-earth-terracotta transition-colors">
                          {dest.title}
                        </h3>
                      </Link>
                      <p className="font-sans text-sm text-earth-charcoal/70 line-clamp-3 leading-relaxed font-light">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-earth-clay/5 flex items-center justify-between">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-earth-clay/20 bg-white">
              <p className="font-sans text-sm text-earth-charcoal/60 font-light">
                No matching destinations found for your query. Try clearing filters or searching for something else.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
