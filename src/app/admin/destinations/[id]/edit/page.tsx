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

export default function EditDestinationPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const destinationId = rawId as Id<"destinations">;
  
  const router = useRouter();
  const { currentUser, isLoading } = useUser();
  const [isPending, startTransition] = useTransition();

  // Queries & Mutations
  const destination = useQuery(api.destinations.getDestinationById, { id: destinationId });
  const editDestMutation = useMutation(api.destinations.editDestination);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("Hills");
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

  // Sync state once data loads
  useEffect(() => {
    if (destination) {
      setTitle(destination.title || "");
      setDesc(destination.description || "");
      setLocation(destination.location || "");
      setState(destination.state || "");
      setCategory(destination.category || "Hills");
      setPhotoUrl(destination.photos?.[0] || "");
      setLat(String(destination.geo?.lat || ""));
      setLng(String(destination.geo?.lng || ""));
      setBestTimeToVisit(destination.bestTimeToVisit || "");
      setHowToReach(destination.howToReach || "");
      setNearbyAttractionsRaw(destination.nearbyAttractions?.join("\n") || "");
      setTipsRaw(destination.tips?.join("\n") || "");
      setGalleryRaw(destination.photoGallery?.join("\n") || "");
    }
  }, [destination]);

  const isValidImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    return /^https?:\/\/.+/i.test(trimmed) || /^data:image\/.+/i.test(trimmed);
  };

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
        await editDestMutation({
          id: destinationId,
          title,
          description: desc,
          location,
          state,
          category,
          photos: [photoUrl],
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
        
        // Wait and redirect back to manager
        setTimeout(() => {
          router.push("/admin/destinations");
        }, 1500);
      } catch (err: any) {
        setError(err.message || "Failed to update destination.");
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

  // 1. Loading state
  if (isLoading || destination === undefined) {
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
  if (destination === null) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-8 text-center space-y-6 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-earth-forest">Chronicle Not Found</h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              We could not find the destination record you want to edit. It may have been deleted.
            </p>
            <div className="pt-4">
              <Link
                href="/admin/destinations"
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
      <title>Edit {destination.title} | SafarNama Admin</title>
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Back link */}
          <Link
            href="/admin/destinations"
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
              Edit "{destination.title}" Guide
            </h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              Modify the curated travel fields, photographic gallery links, coordinates and recommendations for this official chronicle.
            </p>
          </div>

          {/* Form container */}
          <div className="bg-white border border-earth-clay/10 p-6 md:p-10 shadow-lg">
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <span>Destination guide successfully updated! Redirecting to manager...</span>
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
                      Destination Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Munnar Tea Hills"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Location / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Munnar, Kerala"
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
                      placeholder="e.g. Kerala"
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
                    placeholder="Provide a comprehensive introduction of this curated destination..."
                    className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none"
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
                      placeholder="e.g. 10.0889"
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
                      placeholder="e.g. 77.0595"
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
                      placeholder="e.g. September to May"
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
                      placeholder="e.g. Flight to Cochin, then drive 3 hours"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Nearby Attractions</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(optional, one per line)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={nearbyAttractionsRaw}
                      onChange={(e) => setNearbyAttractionsRaw(e.target.value)}
                      placeholder="e.g.&#10;Eravikulam National Park&#10;Mattupetty Dam"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Admin Travel Tips</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(optional, one per line)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={tipsRaw}
                      onChange={(e) => setTipsRaw(e.target.value)}
                      placeholder="e.g.&#10;Carry a light jacket.&#10;Hire local jeeps."
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. PHOTOS & GALLERY */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider pb-2 border-b border-earth-clay/5">
                  4. Media & Gallery
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
                      Main Preview Photo URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal"
                    />

                    {/* Live Image Preview */}
                    {photoUrl && isValidImageUrl(photoUrl) && (
                      <div className="mt-2 space-y-1 animate-in fade-in duration-200">
                        <span className="text-[9px] font-bold text-earth-forest uppercase tracking-wider block">Image Preview</span>
                        <div className="h-24 w-36 overflow-hidden border border-earth-clay/15 bg-white shadow-sm relative">
                          <img
                            src={photoUrl}
                            alt="Main preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <span>Additional Photo Gallery URLs</span>
                      <span className="text-earth-clay/60 italic lowercase font-normal">(optional, one URL per line)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={galleryRaw}
                      onChange={(e) => setGalleryRaw(e.target.value)}
                      placeholder="e.g.&#10;https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                      className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-end pt-4 border-t border-earth-clay/10">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-3.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md rounded-none disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isPending ? "Saving changes..." : "Save Changes"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
