"use client";

import React, { useState, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ExplorerBadge from "@/components/badges/ExplorerBadge";
import {
  Star,
  MapPin,
  Calendar,
  Car,
  Compass,
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  Gift,
  Eye,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const destinationId = rawId as Id<"destinations">;
  const router = useRouter();

  const { currentUser, isWishlisted, toggleWishlist } = useUser();
  const [isPending, startTransition] = useTransition();

  // Queries
  const destination = useQuery(api.destinations.getDestinationById, { id: destinationId });
  const reviews = useQuery(api.reviews.getReviewsForDestination, { destinationId });

  // Mutations
  const addReviewMutation = useMutation(api.reviews.addReview);

  // States
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  if (destination === undefined || reviews === undefined) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <Compass className="h-10 w-10 text-earth-terracotta animate-spin mx-auto" />
            <p className="text-sm font-semibold tracking-wider uppercase text-earth-clay/60">
              Loading Chronicle Details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (destination === null) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-8 text-center space-y-6 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-earth-forest">Chronicle Not Found</h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              The destination guide you are looking for does not exist or has been archived.
            </p>
            <div className="pt-4">
              <Link
                href="/destinations"
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Back to Chronicles
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Combine main photo and gallery photos
  const allPhotos = [...(destination.photos || []), ...(destination.photoGallery || [])].filter(Boolean);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.id === "loading") {
      setReviewError("You must be logged in to write a review.");
      return;
    }
    if (!reviewText.trim()) {
      setReviewError("Please fill out the review text.");
      return;
    }

    setReviewError("");
    setReviewSuccess(false);

    startTransition(async () => {
      try {
        await addReviewMutation({
          rating: reviewRating,
          text: reviewText,
          author: currentUser.id as Id<"users">,
          destinationId: destinationId,
        });

        setReviewSuccess(true);
        setReviewText("");
        setReviewRating(5);
      } catch (err: any) {
        setReviewError(err.message || "Failed to post review. Please try again.");
      }
    });
  };

  const renderTierBadge = (tier: "Bronze" | "Silver" | "Gold" | "Platinum") => {
    return <ExplorerBadge tier={tier} size={20} showTooltip showLabel />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <title>{destination.title} Guide | SafarNama Chronicles</title>
      <meta name="description" content={destination.description} />
      <Navbar />

      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumbs and navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/destinations"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-earth-clay hover:text-earth-terracotta uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Chronicles</span>
            </Link>
            
            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(destination.id)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-earth-clay/10 bg-white hover:border-earth-terracotta/30 text-xs font-semibold text-earth-charcoal uppercase tracking-wider cursor-pointer transition-all shadow-sm"
            >
              <Heart
                className={`h-4 w-4 transition-transform duration-200 active:scale-75 ${
                  isWishlisted(destination.id) ? "fill-red-500 text-red-500" : "text-earth-clay/60"
                }`}
              />
              <span>{isWishlisted(destination.id) ? "Saved" : "Save Guide"}</span>
            </button>
          </div>

          {/* 1. Hero Content Card */}
          <section className="bg-white border border-earth-clay/5 shadow-xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Large Image Showcase */}
            <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto min-h-[300px] lg:min-h-[450px] bg-stone-100">
              {allPhotos.length > 0 ? (
                <>
                  <img
                    src={allPhotos[activePhotoIndex]}
                    alt={`${destination.title} view`}
                    className="w-full h-full object-cover transition-all duration-500 animate-in fade-in"
                  />
                  {allPhotos.length > 1 && (
                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between z-10">
                      <button
                        onClick={() => setActivePhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                        className="p-2 bg-white/90 hover:bg-white text-earth-charcoal rounded-full shadow-md cursor-pointer border border-earth-clay/10 transition-transform active:scale-95"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 bg-earth-forest text-earth-sand text-[10px] font-bold tracking-widest uppercase">
                        {activePhotoIndex + 1} / {allPhotos.length}
                      </span>
                      <button
                        onClick={() => setActivePhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))}
                        className="p-2 bg-white/90 hover:bg-white text-earth-charcoal rounded-full shadow-md cursor-pointer border border-earth-clay/10 transition-transform active:scale-95"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-earth-clay/40 space-y-2">
                  <Camera className="h-12 w-12 stroke-[1.5]" />
                  <span className="text-xs uppercase tracking-wider font-semibold">No photos available</span>
                </div>
              )}
              
              <span className="absolute top-4 left-4 bg-earth-sand text-earth-forest px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider border border-earth-clay/15 z-10">
                {destination.category}
              </span>
            </div>

            {/* Quick Details Panel */}
            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-1 text-xs text-earth-clay font-sans font-medium uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                  <span>{destination.location}</span>
                </div>

                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-earth-forest leading-tight">
                  {destination.title}
                </h1>

                <div className="flex items-center space-x-3 pt-2">
                  <div className="flex items-center text-earth-saffron bg-earth-saffron/5 px-2.5 py-1 border border-earth-saffron/20 font-bold text-sm">
                    <Star className="h-4 w-4 fill-current mr-1 shrink-0" />
                    <span>{destination.rating}</span>
                  </div>
                  <span className="text-xs text-earth-clay/80 font-sans font-light">
                    Based on {destination.reviewCount || 0} community reviews
                  </span>
                </div>

                <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light pt-2">
                  {destination.description}
                </p>
              </div>

              {/* Author footer info */}
              <div className="pt-6 border-t border-earth-clay/5 flex items-center justify-between text-[10px] font-sans uppercase tracking-wider text-earth-clay/60">
                <span>Verified Official Guide</span>
                <span>Curated by: <span className="font-bold text-earth-forest">{destination.addedBy}</span></span>
              </div>
            </div>
          </section>

          {/* Thumbnail Gallery Row */}
          {allPhotos.length > 1 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {allPhotos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-20 h-16 overflow-hidden border transition-all cursor-pointer ${
                    activePhotoIndex === idx ? "border-earth-terracotta ring-1 ring-earth-terracotta" : "border-earth-clay/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 2. Core Information & Guidelines Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            
            {/* LEFT COLUMN: GUIDELINES & TIPS */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Detailed Description Section */}
              <div className="bg-white border border-earth-clay/5 p-6 md:p-8 space-y-4 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-earth-forest">
                  Explore the Region
                </h2>
                <p className="font-sans text-sm text-earth-charcoal/80 leading-relaxed font-light">
                  {destination.description}
                </p>
                <div className="text-xs text-earth-charcoal/65 leading-relaxed font-light mt-4 pt-4 border-t border-dashed border-earth-clay/10">
                  This official chronicle has been verified by the SafarNama Editorial Team. Our contributors regularly inspect route conditions and coordinates to offer authentic, offbeat trails across India.
                </div>
              </div>

              {/* Admin Tips and Advice */}
              {destination.tips && destination.tips.length > 0 && (
                <div className="bg-earth-terracotta/5 border-l-4 border-earth-terracotta p-6 md:p-8 space-y-4 shadow-sm">
                  <h3 className="font-serif text-lg font-bold text-earth-clay flex items-center space-x-2">
                    <Compass className="h-5 w-5 text-earth-terracotta shrink-0" />
                    <span>Travel Advice & Local Tips</span>
                  </h3>
                  <ul className="space-y-3 font-sans text-sm text-earth-charcoal/80 font-light list-disc pl-5 leading-relaxed">
                    {destination.tips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: LOGISTICS & GEOGRAPHY */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Logistics cards */}
              <div className="bg-white border border-earth-clay/5 p-6 md:p-8 space-y-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-earth-forest">
                  Logistical Details
                </h3>

                {/* Best time to visit */}
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-earth-terracotta/5 border border-earth-terracotta/10 text-earth-terracotta shrink-0 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-sans text-xs font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Best Time to Visit
                    </span>
                    <p className="font-sans text-xs text-earth-charcoal/70 font-light leading-relaxed">
                      {destination.bestTimeToVisit || "October to March (Recommended dry season)"}
                    </p>
                  </div>
                </div>

                {/* How to reach */}
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-earth-forest/5 border border-earth-forest/10 text-earth-forest shrink-0 mt-0.5">
                    <Car className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-sans text-xs font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      How to Reach
                    </span>
                    <p className="font-sans text-xs text-earth-charcoal/70 font-light leading-relaxed">
                      {destination.howToReach || `Located in ${destination.location}. Accessible by regional highways, local transport, or taxi from nearest rail heads.`}
                    </p>
                  </div>
                </div>

                {/* Nearby attractions */}
                {destination.nearbyAttractions && destination.nearbyAttractions.length > 0 && (
                  <div className="flex items-start space-x-4 pt-2 border-t border-earth-clay/5">
                    <div className="p-2.5 bg-earth-saffron/5 border border-earth-saffron/10 text-earth-saffron shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <span className="block font-sans text-xs font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Nearby Attractions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {destination.nearbyAttractions.map((attraction: string, idx: number) => (
                          <span
                            key={idx}
                            className="inline-block px-2.5 py-1 bg-earth-sand border border-earth-clay/10 text-[10px] text-earth-charcoal/80 font-medium"
                          >
                            {attraction}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Geographic Map Embed */}
              {destination.geo && (
                <div className="bg-white border border-earth-clay/5 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Geographic Location Grid
                    </span>
                    <span className="text-[10px] text-earth-clay font-medium font-mono bg-earth-sand px-1.5 py-0.5 border border-earth-clay/5">
                      Lat: {destination.geo.lat}, Lng: {destination.geo.lng}
                    </span>
                  </div>
                  
                  {/* Google Maps Embed iframe */}
                  <div className="relative aspect-video overflow-hidden border border-earth-clay/10 bg-stone-100">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${destination.geo.lat},${destination.geo.lng}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* 3. Community Review Thread Section */}
          <section className="pt-8 border-t border-earth-clay/10 space-y-8">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-earth-terracotta" />
              <h2 className="font-serif text-2xl font-bold text-earth-forest">
                Community Chronicles
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* REVIEWS LIST FEED */}
              <div className="lg:col-span-7 space-y-6">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <article
                        key={review.id}
                        className="bg-white border border-earth-clay/5 p-6 shadow-sm space-y-4 animate-in fade-in"
                      >
                        {/* Reviewer Meta info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-full bg-earth-terracotta/10 border border-earth-terracotta/10 flex items-center justify-center font-bold text-xs text-earth-terracotta font-sans shrink-0 uppercase">
                              {review.authorAvatar ? (
                                <img
                                  src={review.authorAvatar}
                                  alt={review.authorName}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                review.authorName.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="font-sans text-xs font-bold text-earth-charcoal">
                                  {review.authorName}
                                </span>
                                {review.authorVerified && (
                                  <ShieldCheck className="h-3 w-3 text-blue-500 fill-blue-50 ml-1 shrink-0" />
                                )}
                                {renderTierBadge(review.authorTier as any)}
                              </div>
                              <span className="text-[10px] text-earth-clay/60 font-sans font-light">
                                Reviewed {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          {/* Review Stars */}
                          <div className="flex items-center space-x-0.5 text-earth-saffron">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? "fill-current" : "text-stone-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review Content */}
                        <p className="font-sans text-xs text-earth-charcoal/80 leading-relaxed font-light">
                          {review.text}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-white">
                    <p className="font-sans text-xs text-earth-charcoal/60 font-light">
                      No chronicles written for this destination yet. Be the first to share your experience!
                    </p>
                  </div>
                )}
              </div>

              {/* WRITE A REVIEW FORM */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-earth-clay/10 p-6 md:p-8 shadow-md space-y-6">
                  <div>
                    <h3 className="font-serif text-base font-bold text-earth-forest">
                      Log Your Chronicle
                    </h3>
                    <p className="text-xs text-earth-charcoal/60 font-light mt-1">
                      Share your experience, trekking difficulties, or transportation tips to guide fellow travelers.
                    </p>
                  </div>

                  {currentUser && currentUser.id !== "loading" ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-sans">
                      
                      {reviewSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          <span>Review successfully submitted! (+30 PTS)</span>
                        </div>
                      )}

                      {reviewError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-650 shrink-0" />
                          <span>{reviewError}</span>
                        </div>
                      )}

                      {/* Interactive Rating Picker */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                          Your Rating
                        </label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              key={stars}
                              type="button"
                              onClick={() => setReviewRating(stars)}
                              className="p-1 text-earth-saffron hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  stars <= reviewRating ? "fill-current" : "text-stone-200"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                          Review Details
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Describe accessibility constraints, weather conditions, local vendor guidance..."
                          className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm rounded-none disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isPending ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            <Gift className="h-4 w-4" />
                            <span>Submit & Claim +30 PTS</span>
                          </>
                        )}
                      </button>

                    </form>
                  ) : (
                    <div className="p-4 bg-earth-sand/20 border border-earth-clay/10 text-center space-y-3">
                      <p className="text-xs text-earth-charcoal/70 leading-relaxed font-light">
                        Please sign in to write reviews and earn travel reward points.
                      </p>
                      <Link
                        href="/signin"
                        className="inline-block px-5 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
