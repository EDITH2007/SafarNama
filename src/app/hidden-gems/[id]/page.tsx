"use client";

import React, { useState, useTransition, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
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
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShieldCheck,
  Edit2,
  Check,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapPicker from "@/components/MapPicker";
import { useUser } from "@/components/UserContext";
import { CATEGORIES } from "@/app/data/mockData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HiddenGemDetailPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const gemId = rawId as Id<"hiddenGems">;
  const router = useRouter();

  const { currentUser, isWishlisted, toggleWishlist, approveGem, rejectGem } = useUser();
  const [isPending, startTransition] = useTransition();

  // Queries
  const gem = useQuery(api.gems.getGemById, { id: gemId });
  const reviews = useQuery(api.reviews.getReviewsForGem, { gemId });

  // Mutations
  const editGemMutation = useMutation(api.gems.editGem);
  const deleteGemMutation = useMutation(api.gems.deleteGem);
  const addReviewMutation = useMutation(api.reviews.addReview);

  // States
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Admin Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editState, setEditState] = useState("");
  const [selectedEditCategories, setSelectedEditCategories] = useState<string[]>(["Offbeat"]);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [howToReach, setHowToReach] = useState("");
  const [nearbyAttractionsRaw, setNearbyAttractionsRaw] = useState("");
  const [tipsRaw, setTipsRaw] = useState("");
  const [galleryRaw, setGalleryRaw] = useState("");

  const [editError, setEditError] = useState("");

  // Admin Moderation Rejection Reason state
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [moderationMessage, setModerationMessage] = useState("");

  // Admin Delete States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingGem, setIsDeletingGem] = useState(false);



  if (gem === undefined || reviews === undefined) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <Compass className="h-10 w-10 text-earth-terracotta animate-spin mx-auto" />
            <p className="text-sm font-semibold tracking-wider uppercase text-earth-clay/60">
              Loading Hidden Gem Chronicle...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (gem === null) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-8 text-center space-y-6 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-earth-forest">Discovery Not Found</h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              The spot discovery you are looking for does not exist or hasn&apos;t been approved yet.
            </p>
            <div className="pt-4">
              <Link
                href="/hidden-gems"
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Back to Discoveries
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Combine main photo and gallery photos
  const allPhotos = [gem.photo, ...(gem.photoGallery || [])].filter(Boolean);
  const isUserAdmin = currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com";

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
          gemId: gemId,
        });

        setReviewSuccess(true);
        setReviewText("");
        setReviewRating(5);
      } catch (err: unknown) {
        const error = err as Error;
        setReviewError(error.message || "Failed to post review. Please try again.");
      }
    });
  };

  const handleAdminApprove = async () => {
    if (!isUserAdmin) return;
    setModerationMessage("");
    try {
      await approveGem(gemId);
      setModerationMessage("Success: Gem approved and points awarded!");
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setModerationMessage(`Error: ${error.message}`);
    }
  };

  const handleAdminReject = async () => {
    if (!isUserAdmin) return;
    setModerationMessage("");
    try {
      await rejectGem(gemId, rejectionReasonText || "Did not meet submission guidelines");
      setModerationMessage("Success: Gem rejected and feedback saved.");
      setIsRejectionOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setModerationMessage(`Error: ${error.message}`);
    }
  };

  const handleAdminDelete = async () => {
    if (!isUserAdmin) return;
    setIsDeletingGem(true);
    try {
      await deleteGemMutation({ id: gemId });
      router.push("/hidden-gems");
    } catch (err: unknown) {
      const error = err as Error;
      setEditError(error.message || "Failed to delete hidden gem.");
      setIsDeletingGem(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleAdminSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editDesc || !editLocation || !editState || !editPhotoUrl || !editLat || !editLng) {
      setEditError("Please fill in all required fields.");
      return;
    }

    setEditError("");

    // Process lists
    const nearbyAttractions = nearbyAttractionsRaw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const tips = tipsRaw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const photoGallery = galleryRaw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        await editGemMutation({
          id: gemId,
          title: editTitle,
          description: editDesc,
          location: editLocation,
          state: editState,
          category: selectedEditCategories.join(", "),
          photo: editPhotoUrl,
          geo: {
            lat: Number(editLat),
            lng: Number(editLng),
          },
          bestTimeToVisit: bestTimeToVisit || undefined,
          howToReach: howToReach || undefined,
          nearbyAttractions: nearbyAttractions.length > 0 ? nearbyAttractions : undefined,
          tips: tips.length > 0 ? tips : undefined,
          photoGallery: photoGallery.length > 0 ? photoGallery : undefined,
        });

        setIsEditing(false);
        router.refresh();
      } catch (err: unknown) {
        const error = err as Error;
        setEditError(error.message || "Failed to update hidden gem.");
      }
    });
  };

  const handleSelectMapLocation = (selectedLat: number, selectedLng: number) => {
    setEditLat(String(selectedLat));
    setEditLng(String(selectedLng));
  };

  const renderTierBadge = (tier: "Bronze" | "Silver" | "Gold") => {
    switch (tier) {
      case "Gold":
        return <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-[#f3d082] bg-[#fdf6e2] text-[#d69e2e] shadow-sm ml-1">Gold</span>;
      case "Silver":
        return <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-[#ccd2d8] bg-[#f0f2f5] text-[#5c6873] shadow-sm ml-1">Silver</span>;
      case "Bronze":
      default:
        return <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-[#d8c3b7] bg-[#fbf5f0] text-[#8c5230] shadow-sm ml-1">Bronze</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <title>{gem.title} Discovery | SafarNama Hidden Gems</title>
      <meta name="description" content={gem.description} />
      <Navbar />

      <main className="flex-grow py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumbs, navigation & wishlist */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/hidden-gems"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-earth-clay hover:text-earth-terracotta uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Discoveries</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(gem.id)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-earth-clay/10 bg-white hover:border-earth-terracotta/30 text-xs font-semibold text-earth-charcoal uppercase tracking-wider cursor-pointer transition-all shadow-sm"
              >
                <Heart
                  className={`h-4 w-4 transition-transform duration-200 active:scale-75 ${
                    isWishlisted(gem.id) ? "fill-red-500 text-red-500" : "text-earth-clay/60"
                  }`}
                />
                <span>{isWishlisted(gem.id) ? "Saved" : "Save Discovery"}</span>
              </button>

              {/* Admin toggle edit mode */}
              {isUserAdmin && (
                <button
                  onClick={() => {
                    if (!isEditing && gem) {
                      setEditTitle(gem.title || "");
                      setEditDesc(gem.description || "");
                      setEditLocation(gem.location || "");
                      setEditState(gem.state || "");
                      setSelectedEditCategories(gem.category ? gem.category.split(",").map(s => s.trim()) : ["Offbeat"]);
                      setEditPhotoUrl(gem.photo || "");
                      setEditLat(String(gem.geo?.lat || ""));
                      setEditLng(String(gem.geo?.lng || ""));
                      setBestTimeToVisit(gem.bestTimeToVisit || "");
                      setHowToReach(gem.howToReach || "");
                      setNearbyAttractionsRaw(gem.nearbyAttractions?.join("\n") || "");
                      setTipsRaw(gem.tips?.join("\n") || "");
                      setGalleryRaw(gem.photoGallery?.join("\n") || "");
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 border border-earth-forest/20 bg-earth-forest/5 hover:bg-earth-forest hover:text-white text-xs font-semibold text-earth-forest uppercase tracking-wider cursor-pointer transition-all shadow-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>{isEditing ? "View Mode" : "Edit Discovery"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Admin Moderation Queue Panel */}
          {isUserAdmin && gem.status === "pending" && (
            <div className="bg-earth-terracotta/5 border border-earth-terracotta/20 p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-2 text-earth-terracotta">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider">
                  Admin Moderation Action Required (Pending Submission)
                </h3>
              </div>
              <p className="font-sans text-xs text-earth-charcoal/80 leading-relaxed font-light">
                This hidden gem has been submitted by a traveler and is in the moderation queue. On approval, the user will be awarded 100 points, and the spot will become visible to the public.
              </p>

              {moderationMessage && (
                <div className="p-3 bg-white border border-earth-clay/20 text-xs font-semibold text-earth-forest animate-pulse">
                  {moderationMessage}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                {!isRejectionOpen ? (
                  <>
                    <button
                      onClick={handleAdminApprove}
                      className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                    >
                      Approve Discovery (+100 PTS)
                    </button>
                    <button
                      onClick={() => setIsRejectionOpen(true)}
                      className="px-4 py-2 border border-red-200 text-red-700 bg-red-50/20 hover:bg-red-50 font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Reject Submission
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-3 bg-white border border-red-200/50 p-4">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-red-800">
                      Rejection Feedback Note / Reason:
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReasonText}
                      onChange={(e) => setRejectionReasonText(e.target.value)}
                      placeholder="Explain why this spot was returned (e.g. coordinates incorrect, picture low resolution, duplicate)..."
                      className="w-full p-2 bg-white border border-red-200/80 text-xs focus:outline-none focus:border-red-500 rounded-none resize-none font-sans"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAdminReject}
                        className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white font-sans text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                      >
                        Confirm Rejection
                      </button>
                      <button
                        onClick={() => setIsRejectionOpen(false)}
                        className="px-3 py-1.5 border border-earth-clay/20 text-earth-charcoal hover:bg-earth-sand font-sans text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT MODE ADMIN FORM */}
          {isEditing && isUserAdmin ? (
            <div className="bg-white border border-earth-clay/10 p-6 md:p-10 shadow-lg animate-in zoom-in-95 duration-200">
              <div className="space-y-2 border-b border-earth-clay/10 pb-4 mb-6">
                <h2 className="font-serif text-2xl font-bold text-earth-forest">
                  Edit Discovery Details
                </h2>
                <p className="font-sans text-xs font-light text-earth-charcoal/70">
                  Update basic info, categories, coordinates, and details for this community discovery.
                </p>
              </div>

              {editError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-3">
                  <XCircle className="h-5 w-5 text-red-650 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSaveEdit} className="space-y-6 text-xs font-sans">
                {/* Basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Spot Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Vibe Categories * (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-earth-clay/20 max-h-[120px] overflow-y-auto">
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => {
                        const isSelected = selectedEditCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedEditCategories(selectedEditCategories.filter((c) => c !== cat));
                              } else {
                                setSelectedEditCategories([...selectedEditCategories, cat]);
                              }
                            }}
                            className={`px-2 py-1 text-[9px] font-sans font-semibold uppercase tracking-wider transition-all border rounded-none cursor-pointer ${
                              isSelected
                                ? "bg-earth-terracotta border-earth-terracotta text-white shadow-sm"
                                : "bg-white border-earth-clay/10 text-earth-charcoal/80 hover:border-earth-terracotta hover:text-earth-terracotta"
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      City / Valley / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                    Detailed Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none resize-none"
                  />
                </div>

                {/* Geography coordinates */}
                <div className="space-y-4 border-t border-earth-clay/5 pt-4">
                  <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider">
                    Location Coordinates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Latitude Coordinate *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editLat}
                        onChange={(e) => setEditLat(e.target.value)}
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Longitude Coordinate *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editLng}
                        onChange={(e) => setEditLng(e.target.value)}
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                      />
                    </div>
                  </div>

                  <div className="border border-earth-clay/10 p-4 bg-earth-sand/5">
                    <MapPicker onSelectLocation={handleSelectMapLocation} />
                  </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4 border-t border-earth-clay/5 pt-4">
                  <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider">
                    Logistics & Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Best Time to Visit (optional)
                      </label>
                      <input
                        type="text"
                        value={bestTimeToVisit}
                        onChange={(e) => setBestTimeToVisit(e.target.value)}
                        placeholder="e.g. October to March"
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        How to Reach (optional)
                      </label>
                      <input
                        type="text"
                        value={howToReach}
                        onChange={(e) => setHowToReach(e.target.value)}
                        placeholder="e.g. Drive 3 hours from nearest rail head"
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Nearby Attractions (optional, one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={nearbyAttractionsRaw}
                        onChange={(e) => setNearbyAttractionsRaw(e.target.value)}
                        placeholder="e.g.&#10;Waterfall viewpoints&#10;Cliff trails"
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Travel Advice & Tips (optional, one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={tipsRaw}
                        onChange={(e) => setTipsRaw(e.target.value)}
                        placeholder="e.g.&#10;Carry enough water.&#10;Hire a local guide."
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div className="space-y-4 border-t border-earth-clay/5 pt-4">
                  <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider">
                    Preview Media URLs
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Main Photo URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={editPhotoUrl}
                        onChange={(e) => setEditPhotoUrl(e.target.value)}
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                        Additional Photo Gallery URLs (optional, one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={galleryRaw}
                        onChange={(e) => setGalleryRaw(e.target.value)}
                        placeholder="e.g.&#10;https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-earth-clay/10">
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="px-4 py-2 border border-red-250 text-red-650 hover:bg-red-50 font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none flex items-center space-x-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Discovery</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 border border-earth-clay/20 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-earth-sand rounded-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-6 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm rounded-none flex items-center space-x-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isPending ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* DISPLAY MODE VIEW */}
              {/* 1. Hero Content Card */}
              <section className="bg-white border border-earth-clay/5 shadow-xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* Large Image Showcase */}
                <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto min-h-[300px] lg:min-h-[450px] bg-[#142B1B]/10">
                  {allPhotos.length > 0 ? (
                    <>
                      <img
                        src={allPhotos[activePhotoIndex]}
                        alt={`${gem.title} view`}
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
                  
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10 max-w-[70%]">
                    {gem.category.split(",").map((cat) => (
                      <span key={cat} className="bg-earth-sand text-earth-forest px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider border border-earth-clay/15">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Status Badge */}
                  <span className={`absolute top-4 right-4 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider border z-10 ${
                    gem.status === "approved"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : gem.status === "rejected"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}>
                    {gem.status}
                  </span>
                </div>

                {/* Quick Details Panel */}
                <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1 text-xs text-earth-clay font-sans font-medium uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                      <span>{gem.location}, {gem.state}</span>
                    </div>

                    <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-earth-forest leading-tight">
                      {gem.title}
                    </h1>

                    <div className="flex items-center space-x-3 pt-2">
                      <div className="flex items-center text-earth-saffron bg-earth-saffron/5 px-2.5 py-1 border border-earth-saffron/20 font-bold text-sm">
                        <Gift className="h-4 w-4 fill-current mr-1 shrink-0" />
                        <span>+{gem.pointsAwarded || 100} PTS</span>
                      </div>
                      <span className="text-xs text-earth-clay/80 font-sans font-light">
                        Awarded on approval
                      </span>
                    </div>

                    <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light pt-2">
                      {gem.description}
                    </p>
                  </div>

                  {/* Submitter footer info */}
                  <div className="pt-6 border-t border-earth-clay/5 flex items-center justify-between text-[10px] font-sans uppercase tracking-wider text-earth-clay/60">
                    <div className="flex items-center space-x-1.5">
                      <span>Submitted by: </span>
                      <span className="font-bold text-earth-forest">{gem.submittedBy}</span>
                      {gem.submitterVerified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-50 shrink-0" />
                      )}
                      {renderTierBadge(gem.submitterTier as "Bronze" | "Silver" | "Gold")}
                    </div>
                    <span>{gem.createdAt}</span>
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
                      About the Discovery
                    </h2>
                    <p className="font-sans text-sm text-earth-charcoal/80 leading-relaxed font-light">
                      {gem.description}
                    </p>
                    <div className="text-xs text-earth-charcoal/65 leading-relaxed font-light mt-4 pt-4 border-t border-dashed border-earth-clay/10">
                      This is a community-submitted offbeat location. SafarNama local legends explore these trails to verify safety, accessibility, and coordinates. Travel responsibly.
                    </div>
                  </div>

                  {/* Travel Advice and Tips */}
                  {gem.tips && gem.tips.length > 0 && (
                    <div className="bg-earth-terracotta/5 border-l-4 border-earth-terracotta p-6 md:p-8 space-y-4 shadow-sm">
                      <h3 className="font-serif text-lg font-bold text-earth-clay flex items-center space-x-2">
                        <Compass className="h-5 w-5 text-earth-terracotta shrink-0" />
                        <span>Travel Advice & Local Tips</span>
                      </h3>
                      <ul className="space-y-3 font-sans text-sm text-earth-charcoal/80 font-light list-disc pl-5 leading-relaxed">
                        {gem.tips.map((tip: string, idx: number) => (
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
                          {gem.bestTimeToVisit || "October to March (Recommended dry season)"}
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
                          {gem.howToReach || `Located in ${gem.location}. Accessible by regional highways, local transport, or trekking paths.`}
                        </p>
                      </div>
                    </div>

                    {/* Nearby attractions */}
                    {gem.nearbyAttractions && gem.nearbyAttractions.length > 0 && (
                      <div className="flex items-start space-x-4 pt-2 border-t border-earth-clay/5">
                        <div className="p-2.5 bg-earth-saffron/5 border border-earth-saffron/10 text-earth-saffron shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="space-y-2">
                          <span className="block font-sans text-xs font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                            Nearby Attractions
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {gem.nearbyAttractions.map((attraction: string, idx: number) => (
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
                  {gem.geo && (
                    <div className="bg-white border border-earth-clay/5 p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <span className="font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                          Geographic Location Grid
                        </span>
                        <span className="text-[10px] text-earth-clay font-medium font-mono bg-earth-sand px-1.5 py-0.5 border border-earth-clay/5">
                          Lat: {gem.geo.lat.toFixed(6)}, Lng: {gem.geo.lng.toFixed(6)}
                        </span>
                      </div>
                      
                      {/* Google Maps Embed iframe */}
                      <div className="relative aspect-video overflow-hidden border border-earth-clay/10 bg-[#142B1B]/10">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${gem.geo.lat},${gem.geo.lng}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
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
                    Discovery Logs & Chronicles
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
                                    {renderTierBadge(review.authorTier as "Bronze" | "Silver" | "Gold")}
                                  </div>
                                  <span className="text-[10px] text-earth-clay/60 font-sans font-light">
                                    Logged {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                          No logs recorded for this discovery yet. Be the first contributor to log coordinates or instructions!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* WRITE A REVIEW FORM */}
                  <div className="lg:col-span-5">
                    <div className="bg-white border border-earth-clay/10 p-6 md:p-8 shadow-md space-y-6">
                      <div>
                        <h3 className="font-serif text-base font-bold text-earth-forest">
                          Log Your Experience
                        </h3>
                        <p className="text-xs text-earth-charcoal/60 font-light mt-1">
                          Share weather status, road blocks, checkpost locations, or water sources to help the explorer community.
                        </p>
                      </div>

                      {currentUser && currentUser.id !== "loading" ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-sans">
                          
                          {reviewSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                              <span>Log successfully recorded! (+30 PTS)</span>
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
                              Condition Rating
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
                              Log Details
                            </label>
                            <textarea
                              rows={4}
                              required
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="e.g. Hike is moderate, path starts behind the local temple. No networks available, carry maps offline."
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
                              <span>Saving...</span>
                            ) : (
                              <>
                                <Gift className="h-4 w-4" />
                                <span>Save Log & Claim +30 PTS</span>
                              </>
                            )}
                          </button>

                        </form>
                      ) : (
                        <div className="p-4 bg-earth-sand/20 border border-earth-clay/10 text-center space-y-3">
                          <p className="text-xs text-earth-charcoal/70 leading-relaxed font-light">
                            Please sign in to write logs and earn travel reward points.
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
            </>
          )}

        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-6 md:p-8 space-y-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <ShieldAlert className="h-14 w-14 text-red-650 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-earth-forest">
                Delete Hidden Gem?
              </h3>
              <p className="font-sans text-xs text-earth-charcoal/70 leading-relaxed font-light">
                Are you sure you want to permanently delete <strong>{gem.title}</strong>? This action cannot be undone and the spot will be removed from all public map displays, lists, and itineraries.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeletingGem}
                className="px-5 py-2 border border-earth-clay/20 text-earth-charcoal hover:bg-earth-sand font-sans text-xs font-semibold uppercase tracking-wider cursor-pointer rounded-none"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminDelete}
                disabled={isDeletingGem}
                className="px-6 py-2 bg-red-650 hover:bg-red-750 text-white font-sans text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm rounded-none"
              >
                {isDeletingGem ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
