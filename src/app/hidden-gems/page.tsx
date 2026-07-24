"use client";

import { useState } from "react";
import { MapPin, Search, Heart, ShieldCheck, Gift, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";
import { CATEGORIES } from "@/app/data/mockData";
import Link from "next/link";
import ExplorerBadge from "@/components/badges/ExplorerBadge";

export default function HiddenGemsPage() {
  const { hiddenGems, toggleWishlist, isWishlisted } = useUser();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Only show approved/verified ones in the public feed
  const approvedGems = hiddenGems.filter((gem) => gem.status === "verified" || gem.status === "approved");

  const filteredGems = approvedGems.filter((gem) => {
    const gemCats = gem.category.split(",").map((c) => c.trim());
    const matchesCategory =
      activeCategory === "All" || gemCats.includes(activeCategory);
    const matchesSearch =
      !searchQuery ||
      gem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tierPriority = { Platinum: 4, Gold: 3, Silver: 2, Bronze: 1 };

  const prioritizedGems = [...filteredGems].sort((a, b) => {
    const prioA = tierPriority[a.submitterTier as keyof typeof tierPriority] || 1;
    const prioB = tierPriority[b.submitterTier as keyof typeof tierPriority] || 1;
    return prioB - prioA; // Higher tier first
  });

  const getTierColorClass = (tier: "Bronze" | "Silver" | "Gold" | "Platinum") => {
    switch (tier) {
      case "Platinum":
        return "text-sky-400";
      case "Gold":
        return "text-earth-saffron";
      case "Silver":
        return "text-slate-300";
      case "Bronze":
      default:
        return "text-[#bf9d88]";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-earth-forest text-earth-sand font-sans">
      <title>Hidden Gems | SafarNama</title>
      <meta name="description" content="Discover India's untouched, secret travel destinations submitted by real travelers." />
      <Navbar />

      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-saffron bg-white/5 px-3 py-1 border border-white/10 inline-block">
              SafarNama Exclusive
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
              Hidden Gems of the Subcontinent
            </h1>
            <p className="font-sans text-sm text-earth-sand/75 leading-relaxed font-light">
              Secret spots submitted by real travelers and verified by local experts. Discover the trails untouched by commercial tourism.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 font-sans text-xs font-semibold uppercase tracking-widest border transition-all duration-200 rounded-none cursor-pointer ${
                    activeCategory === cat
                      ? "bg-earth-terracotta border-earth-terracotta text-white shadow-sm"
                      : "border-white/20 text-earth-sand/75 hover:border-white hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 flex items-center bg-[#142B1B] border border-white/10 px-3.5 py-2 shadow-sm focus-within:border-earth-saffron transition-colors">
              <Search className="h-4 w-4 text-earth-sand/40 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hidden gems..."
                className="bg-transparent text-sm w-full font-sans focus:outline-none placeholder-earth-sand/30 text-white"
              />
            </div>
          </div>

          {/* Grid Layout */}
          {prioritizedGems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {prioritizedGems.map((gem) => (
                <article
                  key={gem.id}
                  className="group flex flex-col bg-[#142B1B] border border-white/5 hover:border-earth-saffron/30 hover:shadow-[0_0_30px_rgba(214,158,46,0.05)] transition-all duration-300 relative"
                >
                  <Link href={`/hidden-gems/${gem.id}`} className="flex flex-col h-full flex-grow">
                    {/* Photo */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-850">
                      <img
                        src={gem.photo}
                        alt={gem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Points Tag */}
                      <span className="absolute top-4 left-4 bg-earth-terracotta text-white px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-md z-10">
                        <Gift className="h-3 w-3 shrink-0" />
                        <span>+{gem.pointsAwarded || 100} pts awarded</span>
                      </span>

                      {/* Verified Safar Gem Badge */}
                      {(gem.status === "verified" || gem.status === "approved") && (
                        <span className="absolute top-4 right-14 bg-earth-forest border border-white/20 text-white px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-widest flex items-center space-x-1 shadow-md z-10">
                          <Check className="h-3 w-3 text-earth-saffron shrink-0" />
                          <span>Verified Safar Gem</span>
                        </span>
                      )}
                      
                      {/* If Gold/Platinum submitter, show a badge on the image as well */}
                      {(gem.submitterTier === "Gold" || gem.submitterTier === "Platinum") && (
                        <span className={`absolute top-14 left-4 ${gem.submitterTier === "Platinum" ? "bg-sky-400 text-slate-900" : "bg-earth-saffron text-earth-forest"} px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-widest shadow-md z-10`}>
                          {gem.submitterTier} Priority
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <span className="flex items-center space-x-1 text-xs text-earth-saffron/90 font-sans font-medium">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{gem.location}</span>
                        </span>

                        <h3 className="font-serif text-xl font-bold text-white group-hover:text-earth-saffron transition-colors">
                          {gem.title}
                        </h3>
                        <p className="font-sans text-sm text-earth-sand/70 line-clamp-3 leading-relaxed font-light">
                          {gem.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        {/* Submitter details */}
                        <div className="flex items-center space-x-2">
                          <ExplorerBadge tier={gem.submitterTier} size={28} showTooltip />
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-sans font-medium text-white">{gem.submittedBy}</span>
                              {gem.submitterVerified && (
                                <ShieldCheck className="h-3.5 w-3.5 text-blue-400 fill-[#142B1B] shrink-0" />
                              )}
                            </div>
                            <span className={`text-[9px] font-sans tracking-widest uppercase font-bold ${getTierColorClass(gem.submitterTier)}`}>
                              {gem.submitterTier} Explorer
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-sans text-earth-sand/40">
                          {gem.createdAt}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Heart button for wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(gem.id);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-earth-charcoal rounded-full transition-all shadow-md z-20 cursor-pointer border border-earth-clay/10"
                    title={isWishlisted(gem.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                  >
                    <Heart
                      className={`h-4 w-4 transition-transform duration-200 active:scale-75 ${
                        isWishlisted(gem.id)
                          ? "fill-red-500 text-red-500"
                          : "text-earth-clay/60 hover:text-red-500"
                      }`}
                    />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-white/10 bg-white/5">
              <p className="font-sans text-sm text-earth-sand/60 font-light">
                No matching spots found for your query. Try clearing filters or searching for something else.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
