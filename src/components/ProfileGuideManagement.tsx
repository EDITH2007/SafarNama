"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ExplorerBadge from "./badges/ExplorerBadge";
import {
  UserCheck,
  ShieldAlert,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Calendar,
  Users,
  Check,
  Coins,
  AlertCircle,
  X,
} from "lucide-react";

interface ProfileGuideManagementProps {
  currentUser: {
    id?: string;
    name: string;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    points: number;
    isVerified: boolean;
  };
}

export default function ProfileGuideManagement({ currentUser }: ProfileGuideManagementProps) {
  // Enforce Gold/Platinum Explorer requirement
  const isGoldOrPlatinum = currentUser.tier === "Gold" || currentUser.tier === "Platinum";
  const hasEnoughPoints = currentUser.points >= 2500;
  const isEligible = isGoldOrPlatinum || hasEnoughPoints;

  // Convex Queries & Mutations
  const viewer = useQuery(api.users.viewer);
  const toggleGuideModeMutation = useMutation((api as any).guides.toggleGuideMode);
  const createPackageMutation = useMutation((api as any).guides.createPackage);
  const deletePackageMutation = useMutation((api as any).guides.deletePackage);
  const updateBookingStatusMutation = useMutation((api as any).guides.updateBookingStatus);
  const bookingsData = useQuery((api as any).guides.getMyBookings);
  const guideDetails = useQuery(
    (api as any).guides.getGuide,
    viewer?._id ? { guideId: viewer._id } : "skip"
  );

  // Guide Profile Form State
  const [isActiveGuide, setIsActiveGuide] = useState<boolean>(false);
  const [bio, setBio] = useState<string>("");
  const [languagesSpoken, setLanguagesSpoken] = useState<string>("English, Hindi");
  const [destinationsCovered, setDestinationsCovered] = useState<string>("Manali, Hampi");
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [pricePerDayINR, setPricePerDayINR] = useState<number>(2500);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // New Package Modal State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState<boolean>(false);
  const [pkgTitle, setPkgTitle] = useState<string>("");
  const [pkgDesc, setPkgDesc] = useState<string>("");
  const [pkgDuration, setPkgDuration] = useState<number>(1);
  const [pkgPrice, setPkgPrice] = useState<number>(3000);
  const [pkgIncludes, setPkgIncludes] = useState<string>("Local Transport, Guided Walk, Lunch");
  const [pkgDestination, setPkgDestination] = useState<string>("");

  // Sub-tab for Bookings
  const [bookingSubTab, setBookingSubTab] = useState<"asGuide" | "asTraveler">("asGuide");

  // Sync existing guide profile into form
  useEffect(() => {
    if (viewer?.guideProfile) {
      setIsActiveGuide(viewer.guideProfile.isActiveGuide ?? false);
      setBio(viewer.guideProfile.bio || "");
      setLanguagesSpoken(
        viewer.guideProfile.languagesSpoken?.join(", ") || "English, Hindi"
      );
      setDestinationsCovered(
        viewer.guideProfile.destinationsCovered?.join(", ") || "Manali, Hampi"
      );
      setYearsExperience(viewer.guideProfile.yearsExperience || 3);
      setPricePerDayINR(viewer.guideProfile.pricePerDayINR || 2500);
    }
  }, [viewer]);

  // Save Guide Profile & Toggle
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
    try {
      const langArray = languagesSpoken
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const destArray = destinationsCovered
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await toggleGuideModeMutation({
        bio,
        languagesSpoken: langArray,
        destinationsCovered: destArray,
        yearsExperience,
        pricePerDayINR,
        isActiveGuide,
      });

      setSaveSuccessMsg(
        isActiveGuide
          ? "Guide Mode successfully ACTIVATED! You are now listed on the Local Guide Marketplace."
          : "Guide Profile updated. Guide Mode is currently inactive."
      );
    } catch (err: any) {
      setSaveErrorMsg(err.message || "Failed to update Guide Profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add Package Submit
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const incArray = pkgIncludes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createPackageMutation({
        title: pkgTitle,
        description: pkgDesc,
        durationDays: pkgDuration,
        priceINR: pkgPrice,
        includes: incArray,
        destinationId: pkgDestination || undefined,
      });

      setIsPackageModalOpen(false);
      setPkgTitle("");
      setPkgDesc("");
      setPkgIncludes("Local Transport, Guided Walk, Lunch");
    } catch (err: any) {
      alert(err.message || "Failed to create package");
    }
  };

  // Delete Package
  const handleDeletePackage = async (packageId: any) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await deletePackageMutation({ packageId });
    } catch (err: any) {
      alert(err.message || "Failed to delete package");
    }
  };

  // Update Booking Status (Accept / Decline / Complete)
  const handleUpdateStatus = async (bookingId: any, newStatus: string) => {
    try {
      await updateBookingStatusMutation({
        bookingId,
        status: newStatus,
      });
      if (newStatus === "completed") {
        alert("Booking marked COMPLETED! 250 PTS awarded to your Explorer ledger.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update booking status");
    }
  };

  if (!isEligible) {
    return (
      <div className="bg-earth-sand/20 border border-earth-clay/15 p-6 space-y-4 font-sans text-xs">
        <div className="flex items-center space-x-3 border-b border-earth-clay/10 pb-3">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0" />
          <div>
            <h3 className="font-serif text-base font-bold text-earth-forest">
              Local Guide Application & Management
            </h3>
            <p className="text-[11px] text-earth-charcoal/70">
              Gold Explorer+ Status Required to Become a Guide
            </p>
          </div>
        </div>

        {/* Lock Callout */}
        <div className="bg-amber-50 border border-amber-200 p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Award className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif text-sm font-bold text-amber-900">
                Gold Explorer Status Required
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed font-light">
                In SafarNama, local guides are verified community leaders. To maintain trust and quality, only members with <strong>Gold Explorer</strong> status or higher (2,500+ PTS or 5+ verified submissions) can activate Guide Mode.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-amber-900 block">Your Current Status:</span>
              <span className="text-amber-800">
                {currentUser.tier} Explorer • {currentUser.points.toLocaleString()} PTS
              </span>
            </div>
            <div className="w-full sm:w-48 bg-amber-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all"
                style={{ width: `${Math.min(100, (currentUser.points / 2500) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-earth-sand/20 border border-earth-clay/15 p-6 space-y-8 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-earth-clay/10 pb-4 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif text-lg font-bold text-earth-forest">
              Local Guide Application & Settings
            </h3>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider border border-amber-300">
              Gold Explorer Eligible
            </span>
          </div>
          <p className="text-xs text-earth-charcoal/70 font-light">
            Manage your guide profile, offer fixed packages, and review incoming traveler requests.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center space-x-3 bg-white p-3 border border-earth-clay/20 shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-earth-forest">
            Guide Mode:
          </span>
          <button
            type="button"
            onClick={() => setIsActiveGuide(!isActiveGuide)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActiveGuide ? "bg-emerald-600" : "bg-earth-clay/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActiveGuide ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isActiveGuide ? "text-emerald-700" : "text-earth-clay"
            }`}
          >
            {isActiveGuide ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center space-x-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 font-bold text-xs">
          {saveErrorMsg}
        </div>
      )}

      {/* Guide Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 border border-earth-clay/15 space-y-4">
        <h4 className="font-serif text-sm font-bold text-earth-forest uppercase tracking-wider">
          Guide Profile & Bio Details
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
              Guide Bio & Experience Highlights
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell travelers about your trekking background, local knowledge, and what makes your tours unique..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal focus:outline-none focus:border-earth-terracotta"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                Languages Spoken (comma separated)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. English, Hindi, Malayalam"
                value={languagesSpoken}
                onChange={(e) => setLanguagesSpoken(e.target.value)}
                className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                Destinations / Regions Covered (comma separated)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Munnar, Hampi, Manali"
                value={destinationsCovered}
                onChange={(e) => setDestinationsCovered(e.target.value)}
                className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                Years of Guiding Experience
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                Base Daily Guide Rate (₹ INR)
              </label>
              <input
                type="number"
                min={500}
                max={50000}
                required
                value={pricePerDayINR}
                onChange={(e) => setPricePerDayINR(Number(e.target.value))}
                className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider hover:bg-earth-terracotta transition-colors"
          >
            {isSaving ? "Saving Settings..." : "Save Guide Profile"}
          </button>
        </div>
      </form>

      {/* Guide Fixed Packages Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-earth-clay/10 pb-2">
          <h4 className="font-serif text-base font-bold text-earth-forest">
            My Fixed Guided Packages ({guideDetails?.packages?.length || 0})
          </h4>

          <button
            type="button"
            onClick={() => setIsPackageModalOpen(true)}
            className="px-3.5 py-1.5 bg-earth-forest text-white text-[11px] font-bold uppercase tracking-wider hover:bg-earth-terracotta transition-colors inline-flex items-center space-x-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Package</span>
          </button>
        </div>

        {guideDetails?.packages && guideDetails.packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideDetails.packages.map((pkg: any) => (
              <div key={pkg._id} className="bg-white border border-earth-clay/15 p-4 space-y-2 relative">
                <button
                  onClick={() => handleDeletePackage(pkg._id)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                  title="Delete Package"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <h5 className="font-serif text-sm font-bold text-earth-forest pr-8">
                  {pkg.title}
                </h5>
                <p className="text-[11px] text-earth-charcoal/70 font-light line-clamp-2">
                  {pkg.description}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-earth-clay/10 font-bold">
                  <span className="text-earth-forest">₹{pkg.priceINR.toLocaleString("en-IN")}</span>
                  <span className="text-earth-charcoal/60">{pkg.durationDays} Day(s)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 text-center text-earth-clay/60 border border-earth-clay/15 text-xs font-light">
            No fixed packages created yet. Click "Add New Package" to create your first guided itinerary!
          </div>
        )}
      </div>

      {/* "My Guide Bookings" Panel (Guide View & Traveler View) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-earth-clay/10 pb-2">
          <h4 className="font-serif text-base font-bold text-earth-forest">
            My Guide Bookings & Requests
          </h4>

          <div className="flex items-center space-x-2 bg-earth-sand/40 p-1 border border-earth-clay/15">
            <button
              onClick={() => setBookingSubTab("asGuide")}
              className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                bookingSubTab === "asGuide"
                  ? "bg-earth-forest text-white shadow-sm"
                  : "text-earth-charcoal hover:text-earth-forest"
              }`}
            >
              Bookings I'm Guiding ({bookingsData?.asGuide?.length || 0})
            </button>
            <button
              onClick={() => setBookingSubTab("asTraveler")}
              className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                bookingSubTab === "asTraveler"
                  ? "bg-earth-forest text-white shadow-sm"
                  : "text-earth-charcoal hover:text-earth-forest"
              }`}
            >
              My Travel Bookings ({bookingsData?.asTraveler?.length || 0})
            </button>
          </div>
        </div>

        {/* Sub-tab 1: Bookings I'm Guiding */}
        {bookingSubTab === "asGuide" && (
          <div className="space-y-3">
            {bookingsData?.asGuide && bookingsData.asGuide.length > 0 ? (
              bookingsData.asGuide.map((b: any) => (
                <div
                  key={b._id}
                  className="bg-white border border-earth-clay/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-sm text-earth-forest">
                        {b.packageTitle}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          b.status === "confirmed"
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : b.status === "completed"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : b.status === "declined"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-earth-charcoal/80 font-light">
                      Traveler: <strong className="text-earth-forest">{b.travelerName}</strong> ({b.numTravelers} traveler(s)) • Start Date: <span className="font-mono">{b.startDate}</span>
                    </p>

                    {b.customRequestDetails && (
                      <p className="text-[11px] text-earth-charcoal/70 bg-earth-sand/30 p-2 border border-earth-clay/10 mt-1">
                        <strong>Custom Details:</strong> {b.customRequestDetails}
                      </p>
                    )}

                    <div className="text-[11px] text-earth-charcoal/60 pt-1">
                      Total Booking Value: <strong className="text-earth-forest font-serif">₹{b.totalPriceINR.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  {/* Actions for Guide */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {b.status === "requested" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b._id, "confirmed")}
                          className="px-3.5 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                        >
                          Accept Request
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(b._id, "declined")}
                          className="px-3 py-2 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider hover:bg-red-50 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, "completed")}
                        className="px-4 py-2 bg-earth-forest text-white text-[10px] font-bold uppercase tracking-wider hover:bg-earth-terracotta transition-colors flex items-center space-x-1"
                      >
                        <Coins className="h-3.5 w-3.5 text-earth-saffron" />
                        <span>Mark Completed (+250 PTS)</span>
                      </button>
                    )}

                    {b.status === "completed" && (
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed (+250 PTS)</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 text-center text-earth-clay/60 border border-earth-clay/15 text-xs font-light">
                No guide booking requests received yet.
              </div>
            )}
          </div>
        )}

        {/* Sub-tab 2: My Travel Bookings */}
        {bookingSubTab === "asTraveler" && (
          <div className="space-y-3">
            {bookingsData?.asTraveler && bookingsData.asTraveler.length > 0 ? (
              bookingsData.asTraveler.map((b: any) => (
                <div
                  key={b._id}
                  className="bg-white border border-earth-clay/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-sm text-earth-forest">
                        {b.packageTitle}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          b.status === "confirmed"
                            ? "bg-blue-50 border-blue-200 text-blue-800"
                            : b.status === "completed"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : b.status === "declined"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-earth-charcoal/80 font-light">
                      Local Guide: <strong className="text-earth-forest">{b.guideName}</strong> • Start Date: <span className="font-mono">{b.startDate}</span> ({b.numTravelers} traveler(s))
                    </p>

                    <div className="text-[11px] text-earth-charcoal/60 pt-1">
                      Total Paid/Booked: <strong className="text-earth-forest font-serif">₹{b.totalPriceINR.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 text-center text-earth-clay/60 border border-earth-clay/15 text-xs font-light">
                You have not booked any local guides yet. Visit the Local Guides tab to browse verified community guides!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add New Package Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-earth-clay/20 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsPackageModalOpen(false)}
              className="absolute top-4 right-4 text-earth-clay hover:text-earth-charcoal p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-earth-forest">
                Add New Guided Package
              </h3>
              <p className="text-xs text-earth-charcoal/70">
                Create a fixed itinerary package to offer to SafarNama travelers.
              </p>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Package Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Day Secret Waterfall & Tea Trail Hike"
                  value={pkgTitle}
                  onChange={(e) => setPkgTitle(e.target.value)}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Package Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the journey highlights, trail route, and offbeat stops..."
                  value={pkgDesc}
                  onChange={(e) => setPkgDesc(e.target.value)}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                    Total Package Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min={500}
                    max={100000}
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  What's Included (comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Local Transport, Meals, Permits, Safety Gear"
                  value={pkgIncludes}
                  onChange={(e) => setPkgIncludes(e.target.value)}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-earth-charcoal/80 mb-1">
                  Primary Destination Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Munnar, Hampi, Manali"
                  value={pkgDestination}
                  onChange={(e) => setPkgDestination(e.target.value)}
                  className="w-full p-2.5 bg-earth-sand/20 border border-earth-clay/20 text-xs text-earth-charcoal"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 border border-earth-clay/30 text-earth-charcoal text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider hover:bg-earth-terracotta transition-colors"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
