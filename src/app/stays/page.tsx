"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Hotel,
  Search,
  Filter,
  Star,
  MapPin,
  ShieldCheck,
  Compass,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";
import { useCurrency } from "@/components/CurrencyContext";

function StaysContent() {
  const searchParams = useSearchParams();
  const initialDestinationId = searchParams.get("destinationId") || "All";

  const { stays, destinations, hiddenGems } = useUser();
  const { formatPrice } = useCurrency();

  // Filters state
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedDestId, setSelectedDestId] = useState<string>(initialDestinationId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000);

  // Combine destinations & gems for location dropdown
  const allLocations = useMemo(() => {
    const list: { id: string; title: string; location: string }[] = [];
    destinations.forEach((d) => {
      list.push({ id: d.id || (d as any)._id, title: d.title, location: d.location });
    });
    hiddenGems.forEach((g) => {
      list.push({ id: g.id || (g as any)._id, title: g.title, location: g.location });
    });
    return list;
  }, [destinations, hiddenGems]);

  // Filter logic
  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      // Type filter
      if (selectedType !== "All" && stay.type !== selectedType) {
        return false;
      }
      // Destination filter
      if (selectedDestId !== "All" && stay.destinationId !== selectedDestId) {
        return false;
      }
      // Price filter
      if (stay.pricePerNightINR > maxPriceFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = stay.name.toLowerCase().includes(q);
        const matchesDesc = stay.description.toLowerCase().includes(q);
        const matchesHost = stay.hostName.toLowerCase().includes(q);
        const matchesAmenities = stay.amenities.some((a) => a.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesHost && !matchesAmenities) {
          return false;
        }
      }
      return true;
    });
  }, [stays, selectedType, selectedDestId, maxPriceFilter, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb / Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-earth-clay/15 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs text-earth-clay mb-2 font-medium">
                <Link href="/dashboard" className="hover:text-earth-terracotta transition-colors">
                  Explore
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-earth-forest font-bold">Stays Marketplace</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-earth-forest tracking-tight">
                Destination-Native Stays & Homestays
              </h1>
              <p className="font-sans text-xs sm:text-sm text-earth-charcoal/70 font-light mt-1 max-w-2xl">
                Discover verified hotels, authentic local homestays, and eco-villas paired directly with SafarNama chronicles & hidden gems.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 border border-earth-clay/20 bg-white text-earth-forest hover:border-earth-terracotta font-sans text-xs font-bold uppercase tracking-wider transition-all self-start md:self-auto shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Filter Bar Controls */}
          <div className="bg-white border border-earth-clay/15 p-4 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Text Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-clay/60" />
                <input
                  id="stays-search"
                  name="staysSearch"
                  type="text"
                  aria-label="Search stays, amenities, host or features"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stays, amenities, host or features..."
                  className="w-full pl-9 pr-4 py-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta font-sans"
                />
              </div>

              {/* Destination Filter Dropdown */}
              <div className="flex items-center space-x-2 shrink-0">
                <MapPin className="w-4 h-4 text-earth-terracotta shrink-0" />
                <select
                  id="stays-dest-filter"
                  name="staysDestFilter"
                  aria-label="Filter stays by destination"
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs font-bold text-earth-forest focus:outline-none focus:border-earth-terracotta cursor-pointer max-w-[220px]"
                >
                  <option value="All">All Destinations & Gems</option>
                  {allLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      📍 {loc.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter Slider */}
              <div className="flex items-center space-x-3 shrink-0 bg-earth-sand/20 px-3 py-2 border border-earth-clay/15">
                <SlidersHorizontal className="w-4 h-4 text-earth-clay shrink-0" />
                <div className="flex flex-col">
                  <label htmlFor="stays-price-range" className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                    Max Rate: <strong className="text-earth-forest font-mono">{formatPrice(maxPriceFilter)}</strong>
                  </label>
                  <input
                    id="stays-price-range"
                    name="staysPriceRange"
                    type="range"
                    min={1500}
                    max={12000}
                    step={500}
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-32 accent-earth-terracotta cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Stay Type Tabs */}
            <div className="flex items-center space-x-2 border-t border-earth-clay/10 pt-3 overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-earth-clay mr-2 tracking-wider shrink-0">
                Stay Type:
              </span>
              {[
                { id: "All", label: "All Types" },
                { id: "homestay", label: "Homestays" },
                { id: "hotel", label: "Hotels & Resorts" },
                { id: "airbnb-style", label: "Airbnb-Style / Cottages" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === type.id
                      ? "bg-earth-terracotta text-white shadow-sm"
                      : "bg-earth-sand/30 text-earth-charcoal/80 hover:bg-earth-sand/80 border border-earth-clay/10"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-earth-clay font-medium">
            <span>
              Showing <strong className="text-earth-forest">{filteredStays.length}</strong> {filteredStays.length === 1 ? "stay" : "stays"} available
            </span>
            {(selectedType !== "All" || selectedDestId !== "All" || searchQuery !== "" || maxPriceFilter < 10000) && (
              <button
                onClick={() => {
                  setSelectedType("All");
                  setSelectedDestId("All");
                  setSearchQuery("");
                  setMaxPriceFilter(10000);
                }}
                className="text-earth-terracotta hover:underline font-bold text-xs cursor-pointer"
              >
                Reset Filters ✕
              </button>
            )}
          </div>

          {/* Stays Grid Display */}
          {filteredStays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStays.map((stay, idx) => (
                <motion.div
                  key={stay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white border border-earth-clay/15 hover:border-earth-terracotta/40 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* Stay Cover Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      <img
                        src={stay.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                        alt={stay.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20">
                        {stay.type}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-earth-forest text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{stay.rating}</span>
                        <span className="text-stone-400 text-[10px]">({stay.reviewCount})</span>
                      </div>
                    </div>

                    {/* Stay Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-serif text-xl font-bold text-earth-forest group-hover:text-earth-terracotta transition-colors line-clamp-1">
                          {stay.name}
                        </h3>
                        <p className="font-sans text-xs text-earth-charcoal/75 leading-relaxed line-clamp-2 font-light">
                          {stay.description}
                        </p>
                      </div>

                      {/* Host Verification */}
                      <div className="flex items-center justify-between pt-3 border-t border-earth-clay/10 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-earth-sand border border-earth-clay/20 flex items-center justify-center font-serif text-xs font-bold text-earth-forest">
                            {stay.hostName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-earth-clay uppercase font-bold">Host</span>
                            <span className="text-xs font-semibold text-earth-charcoal truncate max-w-[120px]">
                              {stay.hostName}
                            </span>
                          </div>
                        </div>

                        {stay.hostVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200" title="Verified Host">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified Host
                          </span>
                        )}
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1.5">
                        {stay.amenities.map((amenity, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-earth-sand/40 text-earth-charcoal/80 px-2 py-0.5 rounded border border-earth-clay/10"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Footer & Action */}
                  <div className="p-6 pt-0 border-t border-earth-clay/10 mt-4 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-earth-clay block">Per Night Rate</span>
                      <span className="font-serif text-xl font-bold text-earth-forest font-mono">
                        {formatPrice(stay.pricePerNightINR)}
                      </span>
                    </div>

                    <Link
                      href={`/stays/${stay.id}`}
                      className="px-4 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      View & Book
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-earth-clay/20 bg-white space-y-4 p-8">
              <Hotel className="w-12 h-12 text-earth-clay/30 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-earth-forest">No Stays Found Matching Filters</h3>
              <p className="font-sans text-xs text-earth-charcoal/60 max-w-md mx-auto font-light">
                Try widening your price range or clearing destination search filters to view available stays.
              </p>
              <button
                onClick={() => {
                  setSelectedType("All");
                  setSelectedDestId("All");
                  setSearchQuery("");
                  setMaxPriceFilter(10000);
                }}
                className="px-5 py-2 bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function StaysBrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-earth-sand items-center justify-center">
          <Compass className="w-10 h-10 text-earth-terracotta animate-spin" />
        </div>
      }
    >
      <StaysContent />
    </Suspense>
  );
}
