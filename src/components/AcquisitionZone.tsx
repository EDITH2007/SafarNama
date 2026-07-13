"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Compass, ShieldCheck, Gift, X, Heart } from "lucide-react";
import { CATEGORIES } from "../app/data/mockData";
import { useUser } from "./UserContext";

interface AcquisitionZoneProps {
  searchQuery: string;
}

export default function AcquisitionZone({ searchQuery }: AcquisitionZoneProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const { hiddenGems, destinations, submitGem, toggleWishlist, isWishlisted, isAuthenticated } = useUser();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("Offbeat");
  const [photoUrl, setPhotoUrl] = useState("");

  const isValidImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    return /^https?:\/\/.+/i.test(trimmed) || /^data:image\/.+/i.test(trimmed);
  };
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  // Filter curated destinations
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

  // Sort curated destinations by rating descending
  const sortedDestinations = [...filteredDestinations].sort((a, b) => b.rating - a.rating);
  const landingDestinations = sortedDestinations.slice(0, 3);

  // Filter and sort hidden gems
  // 1. Only show approved ones in the public feed
  // 2. Gold-tier submissions get priority placement (placed at the top)
  const approvedGems = hiddenGems.filter((gem) => gem.status === "approved");

  const filteredGems = approvedGems.filter((gem) => {
    const matchesCategory =
      activeCategory === "All" || gem.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      gem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const tierPriority = { Gold: 3, Silver: 2, Bronze: 1 };

  const prioritizedGems = [...filteredGems].sort((a, b) => {
    const prioA = tierPriority[a.submitterTier] || 1;
    const prioB = tierPriority[b.submitterTier] || 1;
    return prioB - prioA; // Higher tier first
  });

  const landingGems = prioritizedGems.slice(0, 3);

  const spotlightGem = approvedGems[0];

  const handleSubmitSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !state || !photoUrl) return;
    if (!isValidImageUrl(photoUrl)) return;

    submitGem({
      title,
      description,
      location,
      state,
      category,
      photo: photoUrl,
    });

    setShowSuccessMsg(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setShowSuccessMsg(false);
      setTitle("");
      setDescription("");
      setLocation("");
      setState("");
      setPhotoUrl("");
      setCategory("Offbeat");
    }, 4000);
  };

  // Helper to color tier label
  const getTierColorClass = (tier: "Bronze" | "Silver" | "Gold") => {
    switch (tier) {
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
    <div className="bg-earth-sand py-24 space-y-32">
      {/* 1. Curated Destinations Section */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-earth-forest">
            Official Chronicles
          </h2>
          <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
            Curated and verified guides designed by our team to help you navigate India's most iconic regions.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-b border-earth-clay/10 pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 font-sans text-xs font-semibold uppercase tracking-widest border transition-all duration-200 rounded-none ${
                  activeCategory === cat
                    ? "bg-earth-forest border-earth-forest text-earth-sand"
                    : "border-earth-clay/20 text-earth-charcoal/70 hover:border-earth-charcoal hover:text-earth-charcoal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingDestinations.map((dest) => (
              <article
                key={dest.id}
                className="group flex flex-col bg-white border border-earth-clay/5 hover:shadow-xl hover:border-earth-clay/10 transition-all duration-300 relative"
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
          <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-white">
            <p className="font-sans text-sm text-earth-charcoal/60 font-light">
              No matching destinations found for your query. Try clearing filters or searching for something else.
            </p>
          </div>
        )}

        <div className="flex justify-center pt-12">
          <Link
            href="/destinations"
            className="px-8 py-3.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none shadow-md"
          >
            View All Destinations
          </Link>
        </div>
      </section>

      {/* 2. Hidden Gems Section (Visually Distinct) */}
      <section id="hidden-gems" className="bg-earth-forest py-24 text-earth-sand scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-xl">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-saffron bg-white/5 px-3 py-1 border border-white/10 inline-block">
                SafarNama Exclusive
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
                Hidden Gems of the Subcontinent
              </h2>
              <p className="font-sans text-sm text-earth-sand/75 leading-relaxed font-light">
                Secret spots submitted by real travelers and verified by local experts. Discover the trails untouched by commercial tourism.
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push("/signin");
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="px-6 py-3.5 bg-earth-terracotta text-earth-sand rounded-none font-sans text-xs font-bold uppercase tracking-widest hover:bg-earth-saffron hover:text-earth-forest transition-all duration-300 cursor-pointer shadow-md"
              >
                Submit a Spot (+100 pts)
              </button>
            </div>
          </div>

          {/* Gems Grid */}
          {prioritizedGems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {landingGems.map((gem) => (
                <article
                  key={gem.id}
                  className="group flex flex-col bg-[#142B1B] border border-white/5 hover:border-earth-saffron/30 hover:shadow-[0_0_30px_rgba(214,158,46,0.05)] transition-all duration-300 relative"
                >
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
                      <span>+{gem.pointsAwarded} pts awarded</span>
                    </span>
                    
                    {/* Heart button for wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
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

                    {/* If Gold submitter, show a badge on the image as well */}
                    {gem.submitterTier === "Gold" && (
                      <span className="absolute top-14 right-4 bg-earth-saffron text-earth-forest px-2.5 py-1 font-sans text-[9px] font-bold uppercase tracking-widest shadow-md z-10">
                        Gold Priority
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
                        <div className="h-7 w-7 rounded-none bg-earth-saffron/10 border border-earth-saffron/20 flex items-center justify-center text-[10px] font-bold text-earth-saffron font-sans">
                          {gem.submittedBy.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                        </div>
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
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-white/10 bg-white/5">
              <p className="font-sans text-sm text-earth-sand/60 font-light">
                No matching spots found for your query. Try clearing filters or searching for something else.
              </p>
            </div>
          )}

          <div className="flex justify-center pt-12">
            <Link
              href="/hidden-gems"
              className="px-8 py-3.5 bg-earth-terracotta hover:bg-earth-saffron hover:text-earth-forest text-earth-sand font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none shadow-md"
            >
              View All Hidden Gems
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Discovered by Our Travelers (Spotlight) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-earth-clay/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
          {/* Spotlight Image */}
          <div className="w-full md:w-1/2 aspect-[16/10] overflow-hidden bg-stone-100 shrink-0">
            <img
              src={spotlightGem ? spotlightGem.photo : "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80"}
              alt={spotlightGem ? spotlightGem.title : "Phugtal Monastery"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Spotlight Details */}
          <div className="space-y-6 flex-1">
            <div className="flex items-center space-x-2 text-earth-terracotta font-sans text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-500 fill-blue-50" />
              <span>Recently Verified Discovery</span>
            </div>

            <h3 className="font-serif text-3xl font-bold text-earth-forest leading-tight">
              {spotlightGem ? spotlightGem.title : "Phugtal Cave Monastery: A Cliffside Sanctuary in Ladakh"}
            </h3>

            <p className="font-sans text-sm text-earth-charcoal/80 leading-relaxed font-light">
              "{spotlightGem ? spotlightGem.description : "We had to trek 2 days through the rugged Lunak valley to reach this 12th-century cave. It hangs over the gorge like a honeycomb of mud bricks. SafarNama's verification gave us the trust to embark on this journey safely."}"
            </p>

            {/* Quote block author */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="h-10 w-10 bg-earth-terracotta/5 border border-earth-terracotta/20 flex items-center justify-center font-bold text-earth-terracotta font-sans">
                {spotlightGem ? spotlightGem.submittedBy.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "TN"}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h4 className="font-sans text-sm font-semibold text-earth-charcoal">
                    {spotlightGem ? spotlightGem.submittedBy : "Tenzing Norgay"}
                  </h4>
                  {(spotlightGem ? spotlightGem.submitterVerified : true) && (
                    <ShieldCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                  )}
                </div>
                <p className="font-sans text-xs text-earth-clay">
                  SafarNama {spotlightGem ? spotlightGem.submitterTier : "Gold"} Explorer • Verified {spotlightGem ? spotlightGem.createdAt : "June 2026"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-earth-clay/10 flex flex-wrap gap-6 text-xs font-sans text-earth-clay">
              <div>
                <span className="font-bold text-earth-charcoal">Points Earned:</span> {spotlightGem ? (spotlightGem.pointsAwarded || 100) : 100} PTS
              </div>
              <div>
                <span className="font-bold text-earth-charcoal">Category:</span> {spotlightGem ? spotlightGem.category : "Offbeat"}
              </div>
              <div>
                <span className="font-bold text-earth-charcoal">Verified By:</span> Admin Review Queue
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Submit Spot Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-earth-clay/10 max-w-lg w-full p-8 space-y-6 relative rounded-none animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-earth-charcoal/60 hover:text-earth-charcoal cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-earth-forest flex items-center space-x-2">
                <Compass className="h-6 w-6 text-earth-terracotta" />
                <span>Submit a Hidden Gem</span>
              </h3>
              <p className="font-sans text-xs text-earth-charcoal/70 font-light">
                Discoveries will be sent to the moderation queue. On admin approval, you will earn <span className="font-bold text-earth-terracotta">100 points</span>.
              </p>
            </div>

            {showSuccessMsg ? (
              <div className="p-6 bg-earth-forest/10 border border-earth-forest text-earth-forest text-center space-y-4">
                <Gift className="h-10 w-10 text-earth-saffron mx-auto animate-bounce" />
                <h4 className="font-serif text-lg font-bold">Spot Submitted!</h4>
                <p className="font-sans text-xs font-light">
                  Your submission is now <span className="font-bold uppercase tracking-wider text-earth-terracotta bg-earth-terracotta/5 px-2 py-0.5 border border-earth-terracotta/10">Pending</span>. Go to your Dashboard's Admin Control Panel to approve it and instantly claim your +100 points!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSpot} className="space-y-4 font-sans">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-earth-charcoal uppercase tracking-wider">
                    Spot Name
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Athirappilly Waterfalls"
                    className="w-full p-2.5 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-earth-charcoal uppercase tracking-wider">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Thrissur, Kerala"
                      className="w-full p-2.5 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-earth-charcoal uppercase tracking-wider">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Kerala"
                      className="w-full p-2.5 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none"
                    />
                  </div>
                </div>

                {/* Category & Photo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-earth-charcoal uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 bg-white border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-earth-charcoal uppercase tracking-wider">
                      Photo URL
                    </label>
                    <input
                      type="text"
                      required
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="e.g., https://images.unsplash.com/photo-1626590212990-2e40026e6cb5?auto=format&fit=crop&w=800&q=80"
                      className="w-full p-2.5 bg-earth-sand/30 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none text-earth-charcoal"
                    />
                    
                    {/* Live Validation Warning */}
                    {photoUrl && !isValidImageUrl(photoUrl) && (
                      <p className="text-red-655 text-[10px] font-semibold animate-pulse mt-1">
                        ⚠️ Please enter a valid image URL starting with http:// or https://.
                      </p>
                    )}

                    {/* Live Image Preview */}
                    {photoUrl && isValidImageUrl(photoUrl) && (
                      <div className="mt-2 space-y-1 animate-in fade-in duration-200">
                        <span className="text-[9px] font-bold text-earth-forest uppercase tracking-wider block">✓ Image URL Validated</span>
                        <div className="h-20 w-32 overflow-hidden border border-earth-clay/15 bg-white shadow-sm relative">
                          <img
                            src={photoUrl}
                            alt="Live spot preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-earth-charcoal uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what makes this spot a hidden gem, how to reach, or best time to visit..."
                    className="w-full p-2.5 bg-earth-sand/30 border border-earth-clay/20 text-sm focus:outline-none focus:border-earth-terracotta rounded-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-earth-clay/20 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-earth-sand rounded-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!title || !description || !location || !state || !photoUrl || !isValidImageUrl(photoUrl)}
                    className="px-6 py-2.5 bg-earth-terracotta hover:bg-earth-forest disabled:bg-earth-clay/35 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all duration-200"
                  >
                    Submit Discovery
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
