"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExplorerBadge from "@/components/badges/ExplorerBadge";
import {
  MapPin,
  Globe,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  Check,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  PackageCheck,
  Send,
  X,
} from "lucide-react";

export default function GuideProfilePage() {
  const params = useParams();
  const router = useRouter();
  const guideIdStr = params.id as string;

  // Modals state
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingErrorMsg, setBookingErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Booking Form State
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [numTravelers, setNumTravelers] = useState<number>(2);
  const [customDetails, setCustomDetails] = useState<string>("");
  const [customDestination, setCustomDestination] = useState<string>("");

  // Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Queries & Mutations
  let guideId: any = null;
  try {
    guideId = guideIdStr as Id<"users">;
  } catch {
    guideId = null;
  }

  const guide = useQuery((api as any).guides.getGuide, guideId ? { guideId } : "skip");
  const createBookingMutation = useMutation((api as any).guides.createBooking);
  const addReviewMutation = useMutation((api as any).guides.addGuideReview);

  if (guide === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-earth-sand/30 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="h-10 w-10 border-4 border-earth-forest border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col bg-earth-sand/30 font-sans">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold text-earth-forest">Guide Not Found</h2>
          <p className="text-xs text-earth-charcoal/70">
            The guide profile you are trying to view does not exist or is currently inactive.
          </p>
          <Link
            href="/guides"
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Guides</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle Fixed Package Booking Submit
  const handleBookFixedPackage = async () => {
    if (!selectedPackage) return;
    setIsSubmitting(true);
    setBookingErrorMsg(null);
    try {
      const calculatedTotal = selectedPackage.priceINR * numTravelers;
      await createBookingMutation({
        guideId: guide._id,
        packageId: selectedPackage._id,
        startDate,
        numTravelers,
        totalPriceINR: calculatedTotal,
      });

      setBookingSuccessMsg(
        `Successfully booked "${selectedPackage.title}"! Your request has been sent to ${guide.name}. You can track it in your Dashboard.`
      );
      setSelectedPackage(null);
    } catch (err: any) {
      setBookingErrorMsg(err.message || "Failed to book package. Please ensure you are signed in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Custom Package Request Submit
  const handleBookCustomPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingErrorMsg(null);
    try {
      const estimatedPrice = (guide.guideProfile?.pricePerDayINR || 2500) * numTravelers;
      await createBookingMutation({
        guideId: guide._id,
        customRequestDetails: `Destination: ${customDestination || "Flexible"}. Details: ${customDetails}`,
        startDate,
        numTravelers,
        totalPriceINR: estimatedPrice,
      });

      setBookingSuccessMsg(
        `Custom package request sent to ${guide.name}! They will review and confirm your details soon.`
      );
      setIsCustomModalOpen(false);
      setCustomDetails("");
      setCustomDestination("");
    } catch (err: any) {
      setBookingErrorMsg(err.message || "Failed to submit request. Please ensure you are signed in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Review Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      await addReviewMutation({
        guideId: guide._id,
        rating: reviewRating,
        text: reviewText,
      });
      setReviewSuccessMsg("Thank you! Your review for this local guide has been submitted.");
      setReviewText("");
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-earth-sand/30 font-sans text-earth-charcoal">
      <Navbar />

      {/* Back Link Header */}
      <div className="bg-earth-sand/50 border-b border-earth-clay/10 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/guides"
            className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-earth-forest hover:text-earth-terracotta transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Guides Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {bookingSuccessMsg && (
        <div className="bg-emerald-600 text-white p-4 px-6 text-center text-xs font-bold font-sans flex items-center justify-center space-x-2 animate-in fade-in">
          <PackageCheck className="h-5 w-5" />
          <span>{bookingSuccessMsg}</span>
          <button
            onClick={() => router.push("/dashboard")}
            className="ml-4 px-3 py-1 bg-white text-emerald-800 text-[10px] uppercase tracking-wider font-extrabold hover:bg-emerald-50"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Profile Header Hero Card */}
        <div className="bg-white border border-earth-clay/20 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-earth-clay/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="h-20 w-20 bg-earth-forest text-white font-serif font-bold text-2xl flex items-center justify-center border-4 border-earth-sand shadow-inner shrink-0">
                {guide.avatar}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-earth-forest">
                    {guide.name}
                  </h1>
                  {guide.isVerified && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5 fill-blue-500 text-white" />
                      <span>Verified Explorer</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-earth-charcoal/70 font-light">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-earth-terracotta" />
                    <span>{guide.homeTown}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-earth-forest" />
                    <span>{guide.guideProfile?.yearsExperience} Years Experience</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-amber-600 font-medium">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{guide.rating} ({guide.reviewCount} reviews)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Explorer Medallion & Daily Rate Pill */}
            <div className="flex items-center space-x-6 bg-earth-sand/30 p-4 border border-earth-clay/15">
              <ExplorerBadge tier={guide.tier} size={56} showTooltip />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/60 block">
                  Daily Rate
                </span>
                <span className="font-serif text-xl font-bold text-earth-forest">
                  ₹{guide.guideProfile?.pricePerDayINR.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-sans font-normal text-earth-charcoal/70">/ day</span>
                </span>
              </div>
            </div>
          </div>

          {/* Guide Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Bio */}
            <div className="md:col-span-2 space-y-2">
              <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider">
                About Your Local Guide
              </h3>
              <p className="text-earth-charcoal/80 leading-relaxed font-light bg-earth-sand/20 p-4 border border-earth-clay/10">
                "{guide.guideProfile?.bio}"
              </p>
            </div>

            {/* Languages & Coverage */}
            <div className="space-y-4 bg-earth-sand/30 p-4 border border-earth-clay/15">
              <div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-earth-forest block mb-1.5">
                  Languages Spoken:
                </span>
                <div className="flex flex-wrap gap-1">
                  {guide.guideProfile?.languagesSpoken?.map((lang: string) => (
                    <span key={lang} className="px-2 py-0.5 bg-white border border-earth-clay/20 text-[10px]">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[10px] uppercase tracking-wider text-earth-forest block mb-1.5">
                  Destinations & Regions Covered:
                </span>
                <div className="flex flex-wrap gap-1">
                  {guide.guideProfile?.destinationsCovered?.map((dest: string) => (
                    <span key={dest} className="px-2 py-0.5 bg-earth-forest text-white text-[10px]">
                      {dest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Packages Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-earth-clay/15 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-earth-forest">
                Fixed Guided Packages ({guide.packages.length})
              </h2>
              <p className="text-xs text-earth-charcoal/70 font-light">
                Handcrafted itineraries led personally by {guide.name}.
              </p>
            </div>

            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-4 py-2 border border-earth-forest bg-white text-earth-forest hover:bg-earth-forest hover:text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-earth-terracotta" />
              <span>Request Custom Package</span>
            </button>
          </div>

          {guide.packages.length === 0 ? (
            <div className="bg-white border border-earth-clay/15 p-8 text-center space-y-3">
              <p className="text-xs text-earth-charcoal/70">
                This guide currently offers custom tailored packages upon request.
              </p>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-6 py-2.5 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider"
              >
                Request a Custom Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guide.packages.map((pkg: any) => (
                <div
                  key={pkg._id}
                  className="bg-white border border-earth-clay/20 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-earth-terracotta/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-lg font-bold text-earth-forest">
                        {pkg.title}
                      </h3>
                      <span className="px-2.5 py-1 bg-earth-sand text-earth-forest font-bold text-xs border border-earth-clay/15 shrink-0">
                        {pkg.durationDays} Day{pkg.durationDays > 1 ? "s" : ""}
                      </span>
                    </div>

                    <p className="text-xs text-earth-charcoal/80 font-light leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Includes Checklist */}
                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/60 block">
                        What's Included:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {pkg.includes.map((inc: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-xs text-earth-charcoal/80">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px] font-light">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-earth-clay/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/60 block">
                        Package Price
                      </span>
                      <span className="font-serif text-xl font-bold text-earth-forest">
                        ₹{pkg.priceINR.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="px-5 py-2.5 bg-earth-terracotta hover:bg-earth-saffron text-white hover:text-earth-forest font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Package CTA Banner */}
        <div className="bg-earth-forest text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl font-bold text-earth-sand">
              Want a Tailor-Made Custom Experience?
            </h3>
            <p className="text-xs text-earth-sand/80 font-light max-w-xl">
              Have specific dates, group requirements, or offbeat interests? Send {guide.name} a custom request and get a personalized itinerary.
            </p>
          </div>

          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="px-6 py-3 bg-earth-terracotta hover:bg-earth-saffron hover:text-earth-forest text-white text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
          >
            Request Custom Package
          </button>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="border-b border-earth-clay/15 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-earth-forest">
              Explorer Reviews ({guide.reviews.length})
            </h2>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>{guide.rating} Average Rating</span>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="bg-white border border-earth-clay/15 p-6 space-y-4">
            <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider">
              Leave a Review for {guide.name}
            </h3>

            {reviewSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {reviewSuccessMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold uppercase tracking-wider text-earth-charcoal">
                  Rating:
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-500"
                            : "text-earth-clay/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Share your experience booking with this local guide..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider hover:bg-earth-terracotta transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {guide.reviews.length === 0 ? (
              <p className="text-xs text-earth-charcoal/60 py-4 italic">
                No reviews submitted yet. Be the first traveler to review {guide.name}!
              </p>
            ) : (
              guide.reviews.map((rev: any) => (
                <div key={rev._id} className="bg-white border border-earth-clay/15 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-earth-terracotta/10 text-earth-terracotta font-bold text-xs flex items-center justify-center border border-earth-terracotta/20">
                        {rev.authorAvatar}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-earth-forest">{rev.authorName}</span>
                        <div className="flex items-center space-x-1">
                          <ExplorerBadge tier={rev.authorTier} size={16} showTooltip />
                          <span className="text-[10px] text-earth-charcoal/60">{rev.authorTier} Explorer</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < rev.rating ? "fill-amber-400 text-amber-500" : "text-earth-clay/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-earth-charcoal/80 font-light leading-relaxed pl-11">
                    "{rev.text}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Direct Booking Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-earth-clay/20 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 right-4 text-earth-clay hover:text-earth-charcoal p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-earth-sand text-earth-forest font-bold text-[10px] uppercase tracking-wider">
                <PackageCheck className="h-3.5 w-3.5 text-earth-terracotta" />
                <span>Demo Booking Flow</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-earth-forest">
                Book "{selectedPackage.title}"
              </h3>
              <p className="text-xs text-earth-charcoal/70">
                Guide: <span className="font-bold">{guide.name}</span> • Duration: {selectedPackage.durationDays} Day(s)
              </p>
            </div>

            {/* Hackathon Demo Callout */}
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium leading-relaxed flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Hackathon Demo Note:</strong> Booking immediately records a request in the database. No credit card or real payment is processed.
              </span>
            </div>

            {bookingErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                {bookingErrorMsg}
              </div>
            )}

            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Select Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Number of Travelers
                </label>
                <select
                  value={numTravelers}
                  onChange={(e) => setNumTravelers(Number(e.target.value))}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} Traveler{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-earth-sand/30 border border-earth-clay/15 space-y-1.5">
                <div className="flex justify-between text-xs text-earth-charcoal/70">
                  <span>Package Rate per Traveler:</span>
                  <span>₹{selectedPackage.priceINR.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-serif text-base font-bold text-earth-forest pt-1 border-t border-earth-clay/10">
                  <span>Total Calculated Amount:</span>
                  <span>₹{(selectedPackage.priceINR * numTravelers).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                className="px-4 py-2.5 border border-earth-clay/30 text-earth-charcoal text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookFixedPackage}
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {isSubmitting ? "Processing..." : "Confirm Booking (Demo)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Request Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-earth-clay/20 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute top-4 right-4 text-earth-clay hover:text-earth-charcoal p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-earth-sand text-earth-forest font-bold text-[10px] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-earth-terracotta" />
                <span>Custom Tailored Request</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-earth-forest">
                Request Custom Package from {guide.name}
              </h3>
            </div>

            {bookingErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                {bookingErrorMsg}
              </div>
            )}

            <form onSubmit={handleBookCustomPackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Target Destination / Region
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Munnar, Hampi, Spiti Valley..."
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                    Travelers Count
                  </label>
                  <select
                    value={numTravelers}
                    onChange={(e) => setNumTravelers(Number(e.target.value))}
                    className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} Traveler{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Custom Request Details & Offbeat Interests
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what kind of experience you are looking for (e.g. 2-day photography trek, hidden waterfall hike, local food tasting)..."
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="w-full p-3 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div className="p-3 bg-earth-sand/30 border border-earth-clay/15 text-earth-charcoal/80 text-[11px] space-y-1">
                <span className="font-bold block uppercase tracking-wider text-earth-forest text-[10px]">
                  Estimated Rate:
                </span>
                <span>
                  Guide rate is ₹{guide.guideProfile?.pricePerDayINR.toLocaleString("en-IN")}/day. Estimated base request starting at ₹
                  {((guide.guideProfile?.pricePerDayINR || 2500) * numTravelers).toLocaleString("en-IN")}.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2.5 border border-earth-clay/30 text-earth-charcoal text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Send Request (Demo)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
