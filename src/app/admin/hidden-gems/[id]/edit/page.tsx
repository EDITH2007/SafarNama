"use client";

import React, { useState, useEffect, useTransition, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Save,
  Compass,
  MapPin,
  Trash2,
  AlertTriangle,
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

export default function EditHiddenGemPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const gemId = rawId as Id<"hiddenGems">;
  
  const router = useRouter();
  const { currentUser, isLoading } = useUser();
  const [isPending, startTransition] = useTransition();

  // Queries & Mutations
  const gem = useQuery(api.gems.getGemById, { id: gemId });
  const editGemMutation = useMutation(api.gems.editGem);
  const deleteGemMutation = useMutation(api.gems.deleteGem);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Offbeat"]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [howToReach, setHowToReach] = useState("");
  const [nearbyAttractionsRaw, setNearbyAttractionsRaw] = useState("");
  const [tipsRaw, setTipsRaw] = useState("");
  const [galleryRaw, setGalleryRaw] = useState("");

  // Status State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Delete State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state once data loads
  useEffect(() => {
    if (gem) {
      setTitle(gem.title || "");
      setDesc(gem.description || "");
      setLocation(gem.location || "");
      setState(gem.state || "");
      setSelectedCategories(gem.category ? gem.category.split(",").map(s => s.trim()) : ["Offbeat"]);
      setPhotoUrl(gem.photo || "");
      setLat(String(gem.geo?.lat || ""));
      setLng(String(gem.geo?.lng || ""));
      setBestTimeToVisit(gem.bestTimeToVisit || "");
      setHowToReach(gem.howToReach || "");
      setNearbyAttractionsRaw(gem.nearbyAttractions?.join("\n") || "");
      setTipsRaw(gem.tips?.join("\n") || "");
      setGalleryRaw(gem.photoGallery?.join("\n") || "");
    }
  }, [gem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc || !location || !state || !photoUrl || !lat || !lng) {
      setError("Please fill in all required fields.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setError("");
    setSuccess(false);

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
          title,
          description: desc,
          location,
          state,
          category: selectedCategories.join(", "),
          photo: photoUrl,
          geo: {
            lat: Number(lat),
            lng: Number(lng),
          },
          bestTimeToVisit: bestTimeToVisit || undefined,
          howToReach: howToReach || undefined,
          nearbyAttractions: nearbyAttractions.length > 0 ? nearbyAttractions : undefined,
          tips: tips.length > 0 ? tips : undefined,
          photoGallery: photoGallery.length > 0 ? photoGallery : undefined,
        });

        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        // Wait and redirect back to manager
        setTimeout(() => {
          router.push("/admin/hidden-gems");
        }, 1500);
      } catch (err: any) {
        setError(err.message || "Failed to update hidden gem.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const handleSelectMapLocation = (selectedLat: number, selectedLng: number, regionName: string) => {
    setLat(String(selectedLat));
    setLng(String(selectedLng));
    
    // Auto-fill details if snap snapped
    if (regionName && regionName.includes(",")) {
      const parts = regionName.split(",");
      const locPart = parts[0].replace("Explore ", "").replace("Discover ", "").trim();
      const statePart = parts[1].trim();
      
      if (!location) setLocation(locPart);
      if (!state) setState(statePart);
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    setError("");

    startTransition(async () => {
      try {
        await deleteGemMutation({ id: gemId });
        setIsDeleteConfirmOpen(false);
        router.push("/admin/hidden-gems");
      } catch (err: any) {
        setError(err.message || "Failed to delete hidden gem.");
        setIsDeleting(false);
        setIsDeleteConfirmOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  // 1. Loading state
  if (isLoading || gem === undefined) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <Compass className="h-10 w-10 text-earth-terracotta animate-spin mx-auto" />
            <p className="text-sm font-semibold tracking-wider uppercase text-earth-clay/60">
              Loading Chronicle Editor...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Authorization check
  const isUserAdmin = currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com";
  if (!currentUser || !isUserAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-8 text-center space-y-6 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-earth-forest">Admin Access Required</h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              You must be logged in as an Administrator to modify curated guides. Please sign in using admin credentials.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signin"
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Sign In
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 border border-earth-clay/20 text-earth-charcoal/75 hover:border-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Back to Safety
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Document 404 Check
  if (gem === null) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-8 text-center space-y-6 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-earth-forest">Hidden Gem Not Found</h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              We could not find the hidden gem record you want to edit. It may have been deleted.
            </p>
            <div className="pt-4">
              <Link
                href="/admin/hidden-gems"
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Go to Manager
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <title>Edit {gem.title} | SafarNama Admin</title>
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Back link */}
          <Link
            href="/admin/hidden-gems"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-earth-clay hover:text-earth-terracotta uppercase tracking-wider mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Manager</span>
          </Link>

          {/* Title */}
          <div className="space-y-4 pb-8 border-b border-earth-clay/10 mb-8">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-terracotta bg-earth-terracotta/5 px-4 py-1.5 border border-earth-terracotta/10 inline-block">
              Admin Portal
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-earth-forest">
              Edit "{gem.title}" Discovery
            </h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              Modify the community-submitted description, vibe tags, coordinates, and recommendations. Submission history and submitter points rewards remain locked.
            </p>
          </div>

          {/* Form container */}
          <div className="bg-white border border-earth-clay/10 p-6 md:p-10 shadow-lg">
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span>Hidden gem successfully updated! Redirecting to manager...</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-3">
                <XCircle className="h-5 w-5 text-red-650 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 text-xs font-sans">

              {/* 1. BASIC INFO */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider pb-2 border-b border-earth-clay/5">
                  1. Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Spot Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Gandikota Grand Canyon"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Vibe Categories * (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-earth-clay/20 max-h-[120px] overflow-y-auto">
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                              } else {
                                setSelectedCategories([...selectedCategories, cat]);
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

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Location / District / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kadapa, Andhra Pradesh"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Andhra Pradesh"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Provide a detailed description of this offbeat secret destination..."
                    className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none animate-in"
                  />
                </div>
              </div>

              {/* 2. GEOGRAPHY */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider pb-2 border-b border-earth-clay/5">
                  2. Geography & Coordinates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Latitude Coordinate *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="e.g. 14.8011"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Longitude Coordinate *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="e.g. 78.2664"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>
                </div>

                <div className="border border-earth-clay/10 p-4 bg-earth-sand/5">
                  <MapPicker onSelectLocation={handleSelectMapLocation} />
                </div>
              </div>

              {/* 3. LOGISTICS */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider pb-2 border-b border-earth-clay/5">
                  3. Travel Details & Guidelines
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Best Time to Visit</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={bestTimeToVisit}
                      onChange={(e) => setBestTimeToVisit(e.target.value)}
                      placeholder="e.g. October to February"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>How to Reach</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={howToReach}
                      onChange={(e) => setHowToReach(e.target.value)}
                      placeholder="e.g. Take train to Kadapa, hire private jeep"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Nearby Attractions</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(one per line)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={nearbyAttractionsRaw}
                      onChange={(e) => setNearbyAttractionsRaw(e.target.value)}
                      placeholder="e.g.&#10;Belum Caves&#10;Gandikota Fort temples"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Travel Advice & Tips</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(one per line)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={tipsRaw}
                      onChange={(e) => setTipsRaw(e.target.value)}
                      placeholder="e.g.&#10;Carry plenty of drinking water&#10;Visit early in the morning"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* 4. MEDIA GALLERY */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider pb-2 border-b border-earth-clay/5">
                  4. Photograph Showcase & Galleries
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Main Photo URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Additional Gallery Images</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(one per line)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={galleryRaw}
                      onChange={(e) => setGalleryRaw(e.target.value)}
                      placeholder="e.g.&#10;https://images.unsplash.com/photo-gallery1&#10;https://images.unsplash.com/photo-gallery2"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-earth-clay/15">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="px-5 py-3 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Unpublish Discovery</span>
                </button>

                <div className="flex gap-4">
                  <Link
                    href="/admin/hidden-gems"
                    className="px-5 py-3 border border-earth-clay/20 text-earth-charcoal/70 hover:border-earth-charcoal hover:text-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center shadow-sm"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isPending ? "Saving..." : "Save Updates"}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-earth-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-6 md:p-8 space-y-6 shadow-2xl text-center relative animate-in scale-in duration-200">
            
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 inline-block rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-earth-forest">
                Unpublish / Delete Hidden Gem?
              </h3>
              <p className="font-sans text-xs text-earth-charcoal/70 leading-relaxed font-light">
                Are you sure you want to permanently remove the hidden gem <span className="font-bold text-earth-charcoal">"{gem.title}"</span>? 
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 text-[10px] text-amber-800 text-left font-light leading-relaxed flex items-start space-x-2">
                <span>⚠️</span>
                <span>This action cannot be undone. The gem will be immediately deleted from Convex, although points already granted to the original submitter are retained.</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 border border-earth-clay/20 text-earth-charcoal/75 hover:border-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Unpublishing..." : "Confirm Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
