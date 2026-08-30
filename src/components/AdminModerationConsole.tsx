"use client";

import React, { useState, useTransition } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Compass,
  MapPin,
  Star,
  Flag,
  BookOpen,
  Route,
  MessageSquare,
  Eye,
  X,
  Check,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";

interface AdminModerationConsoleProps {
  currentUser: {
    id?: string;
    name: string;
    email?: string;
    role?: "user" | "admin";
  };
}

export default function AdminModerationConsole({ currentUser }: AdminModerationConsoleProps) {
  const [activeTab, setActiveTab] = useState<
    "destinations" | "spots" | "journeys" | "reviews" | "blogs"
  >("spots");
  const [isPending, startTransition] = useTransition();

  // Queries
  const destinations = useQuery(api.destinations.getDestinations) || [];
  const pendingGems = useQuery(api.gems.getPendingGems) || [];
  const allGems = useQuery(api.gems.getAllGemsAdmin) || [];
  const pendingJourneys = useQuery(api.journeys.getPendingJourneys) || [];
  const allJourneys = useQuery(api.journeys.getAllJourneysAdmin) || [];
  const reviews = useQuery(api.reviews.getEnrichedReviews) || [];
  const blogs = useQuery(api.blogs.getEnrichedBlogs) || [];

  // Sub-tab toggles for Gems and Journeys
  const [gemViewMode, setGemViewMode] = useState<"pending" | "all">("pending");
  const [journeyViewMode, setJourneyViewMode] = useState<"pending" | "all">("pending");

  // Mutations
  const approveGemMutation = useMutation(api.gems.approveGem);
  const rejectGemMutation = useMutation(api.gems.rejectGem);
  const deleteGemMutation = useMutation(api.gems.deleteGem);
  const editGemMutation = useMutation(api.gems.editGem);

  const addDestinationMutation = useMutation(api.destinations.addDestination);
  const editDestinationMutation = useMutation(api.destinations.editDestination);
  const deleteDestinationMutation = useMutation(api.destinations.deleteDestination);

  const approveJourneyMutation = useMutation(api.journeys.approveJourney);
  const rejectJourneyMutation = useMutation(api.journeys.rejectJourney);
  const deleteJourneyMutation = useMutation(api.journeys.deleteJourney);

  const flagReviewMutation = useMutation(api.reviews.flagReview);
  const deleteReviewMutation = useMutation(api.reviews.deleteReview);

  const approveBlogMutation = useMutation(api.blogs.approveBlog);
  const rejectBlogMutation = useMutation(api.blogs.rejectBlog);
  const deleteBlogMutation = useMutation(api.blogs.deleteBlog);

  // Status & Notification Messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3500);
    }
  };

  // Reusable Modal States
  // 1. Confirm Modal (Destructive Actions)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionLabel: "",
    onConfirm: async () => {},
  });

  // 2. Reject Modal with Reason Input
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    entityTitle: string;
    onReject: (reason: string) => Promise<void>;
  }>({
    isOpen: false,
    entityTitle: "",
    onReject: async () => {},
  });
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // 4. Detail View Modal State
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    type: "destination" | "spot" | "journey" | "review" | "blog" | null;
    item: any;
  }>({
    isOpen: false,
    type: null,
    item: null,
  });

  // 3. Destination Add/Edit Modal Form State
  const [destModal, setDestModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    id?: Id<"destinations">;
    title: string;
    description: string;
    location: string;
    state: string;
    category: string;
    photos: string;
    lat: string;
    lng: string;
    bestTimeToVisit: string;
    howToReach: string;
    sourceName: string;
    sourceUrl: string;
    nearbyAttractions: string;
    tips: string;
    photoGallery: string;
    crowdLevel: string;
    crowdSourceNote: string;
  }>({
    isOpen: false,
    isEdit: false,
    title: "",
    description: "",
    location: "",
    state: "",
    category: "Hills",
    photos: "",
    lat: "10.0889",
    lng: "77.0595",
    bestTimeToVisit: "",
    howToReach: "",
    sourceName: "",
    sourceUrl: "",
    nearbyAttractions: "",
    tips: "",
    photoGallery: "",
    crowdLevel: "moderate",
    crowdSourceNote: "",
  });

  // ---------------- Handlers ----------------

  // Confirm Modal Trigger
  const triggerConfirm = (
    title: string,
    message: string,
    actionLabel: string,
    onConfirm: () => Promise<void>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      actionLabel,
      onConfirm,
    });
  };

  const handleExecuteConfirm = () => {
    startTransition(async () => {
      try {
        await confirmModal.onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      } catch (err: any) {
        showNotification(err.message || "Operation failed", true);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Reject Modal Trigger
  const triggerReject = (entityTitle: string, onReject: (reason: string) => Promise<void>) => {
    setRejectionReasonInput("");
    setRejectModal({
      isOpen: true,
      entityTitle,
      onReject,
    });
  };

  const handleExecuteReject = () => {
    startTransition(async () => {
      try {
        await rejectModal.onReject(rejectionReasonInput.trim());
        setRejectModal((prev) => ({ ...prev, isOpen: false }));
      } catch (err: any) {
        showNotification(err.message || "Rejection failed", true);
        setRejectModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- Gem Actions ---
  const handleApproveGem = (gemId: Id<"hiddenGems">, title: string) => {
    startTransition(async () => {
      try {
        await approveGemMutation({ gemId });
        showNotification(`Spot "${title}" approved! Submitter awarded +100 points.`);
      } catch (err: any) {
        showNotification(err.message || "Failed to approve spot", true);
      }
    });
  };

  const handleRejectGem = (gemId: Id<"hiddenGems">, title: string) => {
    triggerReject(title, async (reason) => {
      await rejectGemMutation({ gemId, rejectionReason: reason });
      showNotification(`Spot "${title}" was rejected.`);
    });
  };

  const handleDeleteGem = (gemId: Id<"hiddenGems">, title: string) => {
    triggerConfirm(
      "Delete Hidden Gem",
      `Are you sure you want to permanently delete/unpublish "${title}"? This cannot be undone.`,
      "Delete Gem",
      async () => {
        await deleteGemMutation({ id: gemId });
        showNotification(`Spot "${title}" deleted.`);
      }
    );
  };

  // --- Journey Actions ---
  const handleApproveJourney = (journeyId: Id<"journeys">, title: string) => {
    startTransition(async () => {
      try {
        await approveJourneyMutation({ journeyId });
        showNotification(`Journey "${title}" approved! Author awarded +100 points.`);
      } catch (err: any) {
        showNotification(err.message || "Failed to approve journey", true);
      }
    });
  };

  const handleRejectJourney = (journeyId: Id<"journeys">, title: string) => {
    triggerReject(title, async (reason) => {
      await rejectJourneyMutation({ journeyId, rejectionReason: reason });
      showNotification(`Journey "${title}" was rejected.`);
    });
  };

  const handleDeleteJourney = (journeyId: Id<"journeys">, title: string) => {
    triggerConfirm(
      "Delete Journey",
      `Are you sure you want to delete "${title}"? This action is irreversible.`,
      "Delete Journey",
      async () => {
        await deleteJourneyMutation({ journeyId });
        showNotification(`Journey "${title}" deleted.`);
      }
    );
  };

  // --- Review Actions ---
  const handleFlagReview = (reviewId: Id<"reviews">, currentFlagged: boolean) => {
    startTransition(async () => {
      try {
        await flagReviewMutation({ reviewId, flagged: !currentFlagged });
        showNotification(currentFlagged ? "Review unflagged." : "Review flagged for review.");
      } catch (err: any) {
        showNotification(err.message || "Failed to flag review", true);
      }
    });
  };

  const handleDeleteReview = (reviewId: Id<"reviews">, title: string) => {
    triggerConfirm(
      "Delete Review",
      `Are you sure you want to delete this review (${title})?`,
      "Delete Review",
      async () => {
        await deleteReviewMutation({ reviewId });
        showNotification("Review deleted successfully.");
      }
    );
  };

  // --- Blog Actions ---
  const handleApproveBlog = (blogId: Id<"blogs">, title: string) => {
    startTransition(async () => {
      try {
        await approveBlogMutation({ blogId });
        showNotification(`Traveler story "${title}" published.`);
      } catch (err: any) {
        showNotification(err.message || "Failed to approve story", true);
      }
    });
  };

  const handleRejectBlog = (blogId: Id<"blogs">, title: string) => {
    triggerReject(title, async (reason) => {
      await rejectBlogMutation({ blogId, reason });
      showNotification(`Story "${title}" status set to rejected.`);
    });
  };

  const handleDeleteBlog = (blogId: Id<"blogs">, title: string) => {
    triggerConfirm(
      "Delete Traveler Story",
      `Are you sure you want to delete "${title}"?`,
      "Delete Story",
      async () => {
        await deleteBlogMutation({ blogId });
        showNotification(`Story "${title}" deleted.`);
      }
    );
  };

  // --- Destination Form Save ---
  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const photoArr = destModal.photos
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        const defaultPhoto = photoArr.length > 0
          ? photoArr
          : ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"];

        const nearbyAttractions = destModal.nearbyAttractions
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const tips = destModal.tips
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const photoGallery = destModal.photoGallery
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);

        const crowdDataObj = {
          crowdLevel: destModal.crowdLevel || "moderate",
          bestTimeToVisit: destModal.bestTimeToVisit || undefined,
          crowdSourceNote: destModal.crowdSourceNote || undefined,
          reportCount: 10,
          updatedAt: Date.now(),
        };

        const destPayload = {
          title: destModal.title,
          description: destModal.description,
          location: destModal.location,
          state: destModal.state,
          category: destModal.category,
          photos: defaultPhoto,
          geo: {
            lat: parseFloat(destModal.lat) || 10.0889,
            lng: parseFloat(destModal.lng) || 77.0595,
          },
          bestTimeToVisit: destModal.bestTimeToVisit || undefined,
          howToReach: destModal.howToReach || undefined,
          sourceName: destModal.sourceName || undefined,
          sourceUrl: destModal.sourceUrl || undefined,
          nearbyAttractions: nearbyAttractions.length > 0 ? nearbyAttractions : undefined,
          tips: tips.length > 0 ? tips : undefined,
          photoGallery: photoGallery.length > 0 ? photoGallery : undefined,
          crowdData: crowdDataObj,
        };

        if (destModal.isEdit && destModal.id) {
          await editDestinationMutation({
            id: destModal.id,
            ...destPayload,
          });
          showNotification(`Chronicle "${destModal.title}" updated.`);
        } else {
          await addDestinationMutation(destPayload);
          showNotification(`Official Chronicle "${destModal.title}" created successfully!`);
        }
        setDestModal((prev) => ({ ...prev, isOpen: false }));
      } catch (err: any) {
        showNotification(err.message || "Failed to save chronicle", true);
      }
    });
  };

  const handleDeleteDestination = (id: Id<"destinations">, title: string) => {
    triggerConfirm(
      "Delete Official Chronicle",
      `Are you sure you want to delete "${title}" and all associated reviews?`,
      "Delete Chronicle",
      async () => {
        await deleteDestinationMutation({ id });
        showNotification(`Chronicle "${title}" deleted.`);
      }
    );
  };

  return (
    <div className="space-y-6 font-sans text-xs border-t-2 border-earth-terracotta/30 pt-8 mt-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-earth-clay/10 pb-4 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-earth-forest">
            <Sparkles className="h-5 w-5 text-earth-terracotta shrink-0 animate-pulse" />
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider">
              Admin Moderation Console
            </h3>
          </div>
          <p className="text-[11px] text-earth-charcoal/60">
            Active Role:{" "}
            <span className="font-bold text-earth-forest uppercase">
              Convex Admin ({currentUser.name})
            </span>
          </p>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold flex items-center space-x-2 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-800 text-[11px] font-semibold flex items-center space-x-2 animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-2 border-b border-earth-clay/10 pb-1 flex-wrap gap-y-2">
        {[
          {
            id: "destinations" as const,
            name: `Official Chronicles (${destinations.length})`,
            icon: Compass,
          },
          {
            id: "spots" as const,
            name: `Spot Discoveries (${pendingGems.length})`,
            icon: MapPin,
          },
          {
            id: "journeys" as const,
            name: `Journeys (${pendingJourneys.length})`,
            icon: Route,
          },
          {
            id: "reviews" as const,
            name: `Reviews (${reviews.length})`,
            icon: MessageSquare,
          },
          {
            id: "blogs" as const,
            name: `Traveler Stories (${blogs.length})`,
            icon: BookOpen,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 font-sans font-bold uppercase tracking-wider border-b-2 -mb-[3px] transition-all cursor-pointer ${
                isActive
                  ? "border-earth-forest text-earth-forest text-[11px]"
                  : "border-transparent text-earth-charcoal/50 hover:text-earth-charcoal text-[11px]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- TAB 1: OFFICIAL CHRONICLES (DESTINATIONS) ---------------- */}
      {activeTab === "destinations" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-earth-clay/70 text-[11px]">
              Curated official destinations created and published by system administrators.
            </p>
            <button
              onClick={() =>
                setDestModal({
                  isOpen: true,
                  isEdit: false,
                  title: "",
                  description: "",
                  location: "",
                  state: "",
                  category: "Hills",
                  photos: "",
                  lat: "10.0889",
                  lng: "77.0595",
                  bestTimeToVisit: "",
                  howToReach: "",
                  sourceName: "",
                  sourceUrl: "",
                  nearbyAttractions: "",
                  tips: "",
                  photoGallery: "",
                  crowdLevel: "moderate",
                  crowdSourceNote: "",
                })
              }
              className="px-3 py-1.5 bg-earth-forest hover:bg-earth-terracotta text-white font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Official Chronicle</span>
            </button>
          </div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destinations.map((d: any) => (
                <div
                  key={d.id || d._id}
                  className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex justify-between items-start gap-4 hover:border-earth-clay/30 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-sm text-earth-charcoal">
                        {d.title}
                      </span>
                      <span className="px-2 py-0.5 bg-earth-clay/10 text-earth-forest text-[9px] uppercase font-bold tracking-wider">
                        {d.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-earth-clay">
                      {d.location}, {d.state} • Added by {d.addedBy}
                    </div>
                    <p className="text-[11px] text-earth-charcoal/70 line-clamp-2 font-light">
                      {d.description}
                    </p>
                  </div>
                  <div className="flex space-x-1 shrink-0">
                    <button
                      onClick={() => setViewModal({ isOpen: true, type: "destination", item: d })}
                      className="p-1.5 bg-earth-sand/50 hover:bg-earth-forest hover:text-white text-earth-charcoal text-[10px] transition-colors cursor-pointer border border-earth-clay/20"
                      title="View Full Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDestModal({
                          isOpen: true,
                          isEdit: true,
                          id: d.id || d._id,
                          title: d.title || "",
                          description: d.description || "",
                          location: d.location || "",
                          state: d.state || "",
                          category: d.category || "Hills",
                          photos: (d.photos || []).join(", "),
                          lat: String(d.geo?.lat ?? 10.0889),
                          lng: String(d.geo?.lng ?? 77.0595),
                          bestTimeToVisit: d.bestTimeToVisit || "",
                          howToReach: d.howToReach || "",
                          sourceName: d.sourceName || "",
                          sourceUrl: d.sourceUrl || "",
                          nearbyAttractions: (d.nearbyAttractions || []).join("\n"),
                          tips: (d.tips || []).join("\n"),
                          photoGallery: (d.photoGallery || []).join("\n"),
                          crowdLevel: d.crowdData?.crowdLevel || "moderate",
                          crowdSourceNote: d.crowdData?.crowdSourceNote || "",
                        })
                      }
                      className="p-1.5 bg-earth-clay/10 hover:bg-earth-forest hover:text-white text-earth-charcoal text-[10px] transition-colors cursor-pointer"
                      title="Edit Chronicle"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDestination(d.id || d._id, d.title)}
                      className="p-1.5 bg-red-100 hover:bg-red-600 hover:text-white text-red-700 text-[10px] transition-colors cursor-pointer"
                      title="Delete Chronicle"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
              No official destinations created yet.
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 2: SPOT DISCOVERIES (HIDDEN GEMS) ---------------- */}
      {activeTab === "spots" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setGemViewMode("pending")}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                  gemViewMode === "pending"
                    ? "bg-earth-forest text-white border-earth-forest"
                    : "bg-white text-earth-charcoal/60 border-earth-clay/20 hover:text-earth-charcoal"
                }`}
              >
                Pending Queue ({pendingGems.length})
              </button>
              <button
                onClick={() => setGemViewMode("all")}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                  gemViewMode === "all"
                    ? "bg-earth-forest text-white border-earth-forest"
                    : "bg-white text-earth-charcoal/60 border-earth-clay/20 hover:text-earth-charcoal"
                }`}
              >
                All Gems Database ({allGems.length})
              </button>
            </div>
          </div>

          {gemViewMode === "pending" ? (
            pendingGems.length > 0 ? (
              <div className="space-y-3">
                {pendingGems.map((g: any) => (
                  <div
                    key={g.id || g._id}
                    className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-sm text-earth-charcoal">
                          {g.title}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] uppercase font-bold tracking-wider">
                          {g.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-earth-clay">
                        {g.location}, {g.state} • Submitter: {g.submittedBy} (
                        {g.submitterTier})
                      </div>
                      <p className="text-[11px] text-earth-charcoal/70">{g.description}</p>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button
                        onClick={() => setViewModal({ isOpen: true, type: "spot", item: g })}
                        className="px-3 py-1.5 bg-earth-sand border border-earth-clay/30 hover:bg-earth-clay/20 text-earth-charcoal text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleRejectGem(g.id || g._id, g.title)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveGem(g.id || g._id, g.title)}
                        className="px-3 py-1.5 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Approve (+100 PTS)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
                No pending hidden gem submissions in queue.
              </div>
            )
          ) : (
            allGems.length > 0 ? (
              <div className="space-y-3">
                {allGems.map((g: any) => (
                  <div
                    key={g.id || g._id}
                    className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex justify-between items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-sm text-earth-charcoal">
                          {g.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                            g.status === "verified" || g.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : g.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {g.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-earth-clay">
                        {g.location}, {g.state} • Submitter: {g.submittedBy}
                      </div>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button
                        onClick={() => setViewModal({ isOpen: true, type: "spot", item: g })}
                        className="p-1.5 bg-earth-sand border border-earth-clay/30 hover:bg-earth-forest hover:text-white text-earth-charcoal text-[10px] transition-colors cursor-pointer"
                        title="View Gem Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGem(g.id || g._id, g.title)}
                        className="p-1.5 bg-red-100 hover:bg-red-600 hover:text-white text-red-700 text-[10px] transition-colors cursor-pointer"
                        title="Delete Gem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
                No hidden gems in database.
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------- TAB 3: JOURNEYS ---------------- */}
      {activeTab === "journeys" && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setJourneyViewMode("pending")}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                journeyViewMode === "pending"
                  ? "bg-earth-forest text-white border-earth-forest"
                  : "bg-white text-earth-charcoal/60 border-earth-clay/20 hover:text-earth-charcoal"
              }`}
            >
              Pending Journeys ({pendingJourneys.length})
            </button>
            <button
              onClick={() => setJourneyViewMode("all")}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                journeyViewMode === "all"
                  ? "bg-earth-forest text-white border-earth-forest"
                  : "bg-white text-earth-charcoal/60 border-earth-clay/20 hover:text-earth-charcoal"
              }`}
            >
              All Journeys ({allJourneys.length})
            </button>
          </div>

          {journeyViewMode === "pending" ? (
            pendingJourneys.length > 0 ? (
              <div className="space-y-3">
                {pendingJourneys.map((j: any) => (
                  <div
                    key={j.id || j._id}
                    className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="font-serif font-bold text-sm text-earth-charcoal">
                        {j.title} ({j.duration})
                      </div>
                      <div className="text-[10px] text-earth-clay">
                        Author: {j.author} ({j.authorTier}) • Stops: {(j.stops || []).join(", ")}
                      </div>
                      <p className="text-[11px] text-earth-charcoal/70">{j.description}</p>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button
                        onClick={() => setViewModal({ isOpen: true, type: "journey", item: j })}
                        className="px-3 py-1.5 bg-earth-sand border border-earth-clay/30 hover:bg-earth-clay/20 text-earth-charcoal text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
                        title="View Journey Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleRejectJourney(j.id || j._id, j.title)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveJourney(j.id || j._id, j.title)}
                        className="px-3 py-1.5 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Approve (+100 PTS)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
                No pending traveler journeys.
              </div>
            )
          ) : (
            allJourneys.length > 0 ? (
              <div className="space-y-3">
                {allJourneys.map((j: any) => (
                  <div
                    key={j.id || j._id}
                    className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex justify-between items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-sm text-earth-charcoal">
                          {j.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                            j.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : j.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {j.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-earth-clay">
                        Author: {j.author} • Duration: {j.duration}
                      </div>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                      <button
                        onClick={() => setViewModal({ isOpen: true, type: "journey", item: j })}
                        className="p-1.5 bg-earth-sand border border-earth-clay/30 hover:bg-earth-forest hover:text-white text-earth-charcoal text-[10px] transition-colors cursor-pointer"
                        title="View Journey Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJourney(j.id || j._id, j.title)}
                        className="p-1.5 bg-red-100 hover:bg-red-600 hover:text-white text-red-700 text-[10px] transition-colors cursor-pointer"
                        title="Delete Journey"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
                No journeys recorded in database.
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------- TAB 4: REVIEWS ---------------- */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <p className="text-earth-clay/70 text-[11px]">
            User-submitted reviews for destinations and hidden gems. Flag or remove inappropriate text.
          </p>

          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <div
                  key={r.id || r._id}
                  className={`p-4 border flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                    r.flagged
                      ? "bg-red-50/50 border-red-200"
                      : "bg-earth-sand/10 border-earth-clay/10"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-serif font-bold text-xs text-earth-charcoal">
                        Location: {r.location}
                      </span>
                      {r.flagged && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider">
                          Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-earth-charcoal/80 italic">"{r.text}"</p>
                    <div className="text-[10px] text-earth-clay">
                      Author: {r.author} ({r.authorTier}) • Date: {r.date}
                    </div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => setViewModal({ isOpen: true, type: "review", item: r })}
                      className="px-2.5 py-1 bg-earth-sand border border-earth-clay/30 hover:bg-earth-clay/20 text-earth-charcoal text-[10px] font-bold uppercase cursor-pointer flex items-center space-x-1"
                      title="View Review Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleFlagReview(r.id || r._id, r.flagged)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase cursor-pointer border ${
                        r.flagged
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-white text-earth-charcoal border-earth-clay/20 hover:bg-earth-sand/20"
                      }`}
                    >
                      {r.flagged ? "Unflag" : "Flag"}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(r.id || r._id, r.title)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
              No reviews available in system.
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 5: TRAVELER STORIES (BLOGS) ---------------- */}
      {activeTab === "blogs" && (
        <div className="space-y-4">
          <p className="text-earth-clay/70 text-[11px]">
            Community blog stories submitted by travelers.
          </p>

          {blogs.length > 0 ? (
            <div className="space-y-3">
              {blogs.map((b: any) => (
                <div
                  key={b.id || b._id}
                  className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-sm text-earth-charcoal">
                        {b.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                          b.status === "published"
                            ? "bg-green-100 text-green-800"
                            : b.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-earth-clay">
                      Author: {b.author} ({b.authorTier}) • Date: {b.date}
                    </div>
                    <p className="text-[11px] text-earth-charcoal/70 line-clamp-2">
                      {b.content}
                    </p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => setViewModal({ isOpen: true, type: "blog", item: b })}
                      className="px-2.5 py-1 bg-earth-sand border border-earth-clay/30 hover:bg-earth-clay/20 text-earth-charcoal text-[10px] font-bold uppercase cursor-pointer flex items-center space-x-1"
                      title="View Story Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                    {b.status !== "published" && (
                      <button
                        onClick={() => handleApproveBlog(b.id || b._id, b.title)}
                        className="px-2.5 py-1 bg-earth-forest text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Publish
                      </button>
                    )}
                    {b.status !== "rejected" && (
                      <button
                        onClick={() => handleRejectBlog(b.id || b._id, b.title)}
                        className="px-2.5 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBlog(b.id || b._id, b.title)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-earth-clay text-xs bg-earth-sand/5">
              No traveler stories found.
            </div>
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h4 className="font-serif font-bold text-base text-earth-charcoal">
                {confirmModal.title}
              </h4>
            </div>
            <p className="text-xs text-earth-charcoal/80 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-earth-sand/30 hover:bg-earth-sand text-earth-charcoal font-bold uppercase text-[10px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirm}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Processing..." : confirmModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Rejection Modal with Reason Input */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <h4 className="font-serif font-bold text-base text-earth-charcoal">
              Reject Submission: {rejectModal.entityTitle}
            </h4>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-earth-clay">
                Rejection Reason (Optional - sent to user notification):
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Image resolution too low, duplicate entry, invalid location details..."
                rows={3}
                className="w-full p-2.5 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-earth-sand/30 hover:bg-earth-sand text-earth-charcoal font-bold uppercase text-[10px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReject}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Destination Add / Edit Modal */}
      {destModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-earth-clay/10 pb-3">
              <h4 className="font-serif font-bold text-base text-earth-forest">
                {destModal.isEdit ? "Edit Official Chronicle" : "Add Official Chronicle"}
              </h4>
              <button
                onClick={() => setDestModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-earth-clay hover:text-earth-charcoal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-4 text-xs font-sans">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <span className="font-serif text-xs font-bold text-earth-forest uppercase tracking-wider block border-b border-earth-clay/10 pb-1">
                  1. Overview & Category
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Destination Title *</label>
                    <input
                      type="text"
                      required
                      value={destModal.title}
                      onChange={(e) => setDestModal({ ...destModal, title: e.target.value })}
                      placeholder="e.g. Munnar Tea Hills"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Category *</label>
                    <select
                      value={destModal.category}
                      onChange={(e) => setDestModal({ ...destModal, category: e.target.value })}
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest bg-white"
                    >
                      <option value="Hills">Hills</option>
                      <option value="Beaches">Beaches</option>
                      <option value="Heritage">Heritage</option>
                      <option value="Spiritual">Spiritual</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Offbeat">Offbeat</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Location / District *</label>
                    <input
                      type="text"
                      required
                      value={destModal.location}
                      onChange={(e) => setDestModal({ ...destModal, location: e.target.value })}
                      placeholder="e.g. Munnar, Kerala"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">State *</label>
                    <input
                      type="text"
                      required
                      value={destModal.state}
                      onChange={(e) => setDestModal({ ...destModal, state: e.target.value })}
                      placeholder="e.g. Kerala"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-earth-clay">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={destModal.description}
                    onChange={(e) => setDestModal({ ...destModal, description: e.target.value })}
                    placeholder="Provide a detailed overview of the destination..."
                    className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                  />
                </div>
              </div>

              {/* Section 2: Coordinates */}
              <div className="space-y-3">
                <span className="font-serif text-xs font-bold text-earth-forest uppercase tracking-wider block border-b border-earth-clay/10 pb-1">
                  2. Geography & Coordinates
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Latitude (Decimal) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={destModal.lat}
                      onChange={(e) => setDestModal({ ...destModal, lat: e.target.value })}
                      placeholder="e.g. 10.0889"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Longitude (Decimal) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={destModal.lng}
                      onChange={(e) => setDestModal({ ...destModal, lng: e.target.value })}
                      placeholder="e.g. 77.0595"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Travel Details & Attribution */}
              <div className="space-y-3">
                <span className="font-serif text-xs font-bold text-earth-forest uppercase tracking-wider block border-b border-earth-clay/10 pb-1">
                  3. Travel Details & Attribution Source
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Best Time to Visit (Optional)</label>
                    <input
                      type="text"
                      value={destModal.bestTimeToVisit}
                      onChange={(e) => setDestModal({ ...destModal, bestTimeToVisit: e.target.value })}
                      placeholder="e.g. September to May"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">How to Reach (Optional)</label>
                    <input
                      type="text"
                      value={destModal.howToReach}
                      onChange={(e) => setDestModal({ ...destModal, howToReach: e.target.value })}
                      placeholder="e.g. Fly to Cochin (COK), 3 hour drive..."
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Attribution Source Name (Optional)</label>
                    <input
                      type="text"
                      value={destModal.sourceName}
                      onChange={(e) => setDestModal({ ...destModal, sourceName: e.target.value })}
                      placeholder="e.g. Wikipedia"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Attribution Source URL (Optional)</label>
                    <input
                      type="text"
                      value={destModal.sourceUrl}
                      onChange={(e) => setDestModal({ ...destModal, sourceUrl: e.target.value })}
                      placeholder="e.g. https://en.wikipedia.org/wiki/..."
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Nearby Attractions (Optional, 1 per line)</label>
                    <textarea
                      rows={3}
                      value={destModal.nearbyAttractions}
                      onChange={(e) => setDestModal({ ...destModal, nearbyAttractions: e.target.value })}
                      placeholder="e.g.&#10;Eravikulam National Park&#10;Mattupetty Dam"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Admin Travel Tips (Optional, 1 per line)</label>
                    <textarea
                      rows={3}
                      value={destModal.tips}
                      onChange={(e) => setDestModal({ ...destModal, tips: e.target.value })}
                      placeholder="e.g.&#10;Carry light jacket.&#10;Hire local jeep."
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Imagery */}
              <div className="space-y-3">
                <span className="font-serif text-xs font-bold text-earth-forest uppercase tracking-wider block border-b border-earth-clay/10 pb-1">
                  4. Media & Gallery
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Main Photos (Comma separated URLs)</label>
                    <input
                      type="text"
                      value={destModal.photos}
                      onChange={(e) => setDestModal({ ...destModal, photos: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Photo Gallery URLs (Optional, 1 per line)</label>
                    <textarea
                      rows={3}
                      value={destModal.photoGallery}
                      onChange={(e) => setDestModal({ ...destModal, photoGallery: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2"
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Crowd Intelligence */}
              <div className="space-y-3">
                <span className="font-serif text-xs font-bold text-earth-forest uppercase tracking-wider block border-b border-earth-clay/10 pb-1">
                  5. Crowd Intelligence
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Crowd Level Rating</label>
                    <select
                      value={destModal.crowdLevel}
                      onChange={(e) => setDestModal({ ...destModal, crowdLevel: e.target.value })}
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest bg-white"
                    >
                      <option value="low">Low Crowd</option>
                      <option value="moderate">Moderate Crowd</option>
                      <option value="high">High Crowd</option>
                      <option value="overcrowded">Overcrowded</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-earth-clay">Crowd Advisory / Source Note (Optional)</label>
                    <input
                      type="text"
                      value={destModal.crowdSourceNote}
                      onChange={(e) => setDestModal({ ...destModal, crowdSourceNote: e.target.value })}
                      placeholder="e.g. Peak morning slot sees heavy footfall."
                      className="w-full p-2 border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-earth-clay/10">
                <button
                  type="button"
                  onClick={() => setDestModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-earth-sand/30 hover:bg-earth-sand text-earth-charcoal font-bold uppercase text-[10px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-bold uppercase text-[10px] cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Saving..." : destModal.isEdit ? "Update Chronicle" : "Create Chronicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Detail View Modal (Inspecting full submitted details across all queues) */}
      {viewModal.isOpen && viewModal.item && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-scale-in my-8 max-h-[90vh] overflow-y-auto border border-earth-clay/20">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-earth-clay/15 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-serif font-bold text-lg text-earth-forest">
                    {viewModal.type === "destination" && (viewModal.item.title || "Official Chronicle")}
                    {viewModal.type === "spot" && (viewModal.item.title || "Hidden Gem Discovery")}
                    {viewModal.type === "journey" && (viewModal.item.title || "Traveler Journey")}
                    {viewModal.type === "blog" && (viewModal.item.title || "Traveler Story")}
                    {viewModal.type === "review" && `Review for ${viewModal.item.location || "Location"}`}
                  </span>
                  
                  {/* Status Badge */}
                  {viewModal.item.status && (
                    <span
                      className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        viewModal.item.status === "verified" || viewModal.item.status === "approved" || viewModal.item.status === "published"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : viewModal.item.status === "rejected"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {viewModal.item.status}
                    </span>
                  )}
                  {viewModal.item.flagged && (
                    <span className="px-2.5 py-0.5 bg-red-600 text-white text-[10px] uppercase font-bold tracking-wider">
                      Flagged
                    </span>
                  )}
                  {viewModal.type === "spot" && viewModal.item.category && (
                    <span className="px-2 py-0.5 bg-earth-sand text-earth-clay border border-earth-clay/20 text-[9px] uppercase font-bold">
                      {viewModal.item.category}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-earth-clay flex items-center space-x-3 flex-wrap">
                  <span className="font-semibold text-earth-charcoal/80">
                    ID: {viewModal.item.id || viewModal.item._id}
                  </span>
                  {viewModal.item.createdAt && (
                    <span>• Submitted: {new Date(viewModal.item.createdAt).toLocaleDateString()}</span>
                  )}
                  {viewModal.item.date && (
                    <span>• Date: {viewModal.item.date}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setViewModal({ isOpen: false, type: null, item: null })}
                className="p-1.5 text-earth-clay hover:text-earth-charcoal hover:bg-earth-sand transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* TYPE 1: HIDDEN GEM (SPOT) */}
            {viewModal.type === "spot" && (
              <div className="space-y-5 text-xs font-sans">
                
                {/* Submitter Info Bar */}
                <div className="p-3 bg-earth-sand/30 border border-earth-clay/10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-earth-terracotta" />
                    <div>
                      <span className="text-[10px] uppercase text-earth-clay font-bold block">Submitted By</span>
                      <span className="font-semibold text-earth-charcoal">
                        {viewModal.item.submittedBy} ({viewModal.item.submitterTier || "Explorer"})
                      </span>
                    </div>
                  </div>
                  {viewModal.item.submitterVerified && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-200">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified Explorer</span>
                    </span>
                  )}
                  <div className="flex items-center space-x-1 text-earth-clay">
                    <MapPin className="h-3.5 w-3.5 text-earth-terracotta" />
                    <span>{viewModal.item.location}, {viewModal.item.state}</span>
                  </div>
                </div>

                {/* Geo Coordinates & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2.5 bg-white border border-earth-clay/15">
                    <span className="text-[9px] uppercase font-bold text-earth-clay block">Vibe / Category</span>
                    <span className="font-semibold text-earth-forest">{viewModal.item.category}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-earth-clay/15">
                    <span className="text-[9px] uppercase font-bold text-earth-clay block">Latitude</span>
                    <span className="font-mono text-earth-charcoal">{viewModal.item.geo?.lat ?? "N/A"}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-earth-clay/15">
                    <span className="text-[9px] uppercase font-bold text-earth-clay block">Longitude</span>
                    <span className="font-mono text-earth-charcoal">{viewModal.item.geo?.lng ?? "N/A"}</span>
                  </div>
                </div>

                {/* Full Description (Untruncated) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Full Description Submitted by Explorer
                  </span>
                  <div className="p-3 bg-earth-sand/15 border border-earth-clay/10 text-earth-charcoal/90 text-xs leading-relaxed whitespace-pre-wrap font-light">
                    {viewModal.item.description || "No description provided."}
                  </div>
                </div>

                {/* Photo Gallery Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Submitted Media & Photo Gallery
                  </span>
                  {(() => {
                    const photosList: string[] = [];
                    if (viewModal.item.photo) photosList.push(viewModal.item.photo);
                    if (Array.isArray(viewModal.item.photos)) {
                      viewModal.item.photos.forEach((p: string) => {
                        if (p && !photosList.includes(p)) photosList.push(p);
                      });
                    }
                    if (Array.isArray(viewModal.item.photoGallery)) {
                      viewModal.item.photoGallery.forEach((p: string) => {
                        if (p && !photosList.includes(p)) photosList.push(p);
                      });
                    }

                    if (photosList.length === 0) {
                      return (
                        <p className="text-earth-clay/60 italic text-[11px] p-3 bg-earth-sand/10 border border-earth-clay/10">
                          No photos uploaded for this spot.
                        </p>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {photosList.map((photoUrl, idx) => (
                          <div key={idx} className="group relative border border-earth-clay/20 bg-stone-100 overflow-hidden h-36">
                            <img
                              src={photoUrl}
                              alt={`Spot photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <a
                              href={photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Open Full
                            </a>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Additional Travel Fields */}
                {(viewModal.item.bestTimeToVisit || viewModal.item.howToReach || viewModal.item.nearbyAttractions?.length > 0 || viewModal.item.tips?.length > 0 || viewModal.item.crowdData) && (
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                      Travel & Crowd Intelligence Fields
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      {viewModal.item.bestTimeToVisit && (
                        <div className="p-2.5 bg-white border border-earth-clay/10 space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-earth-clay block">Best Time to Visit</span>
                          <p className="text-earth-charcoal font-medium">{viewModal.item.bestTimeToVisit}</p>
                        </div>
                      )}
                      {viewModal.item.howToReach && (
                        <div className="p-2.5 bg-white border border-earth-clay/10 space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-earth-clay block">How to Reach</span>
                          <p className="text-earth-charcoal font-medium">{viewModal.item.howToReach}</p>
                        </div>
                      )}
                    </div>

                    {viewModal.item.nearbyAttractions && viewModal.item.nearbyAttractions.length > 0 && (
                      <div className="p-2.5 bg-white border border-earth-clay/10 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-earth-clay block">Nearby Attractions</span>
                        <ul className="list-disc list-inside space-y-0.5 text-earth-charcoal/90">
                          {viewModal.item.nearbyAttractions.map((att: string, i: number) => (
                            <li key={i}>{att}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {viewModal.item.tips && viewModal.item.tips.length > 0 && (
                      <div className="p-2.5 bg-white border border-earth-clay/10 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-earth-clay block">Admin / Travel Tips</span>
                        <ul className="list-disc list-inside space-y-0.5 text-earth-charcoal/90">
                          {viewModal.item.tips.map((tip: string, i: number) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {viewModal.item.crowdData && (
                      <div className="p-2.5 bg-amber-50/40 border border-amber-200/50 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-amber-800 block">Crowd Intelligence</span>
                        <p className="text-earth-charcoal">
                          Level: <span className="font-bold uppercase text-earth-forest">{viewModal.item.crowdData.crowdLevel}</span>
                          {viewModal.item.crowdData.crowdSourceNote && ` — ${viewModal.item.crowdData.crowdSourceNote}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection Reason if present */}
                {viewModal.item.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                    <span className="font-bold uppercase text-[10px] block">Rejection Reason</span>
                    <p>{viewModal.item.rejectionReason}</p>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-earth-clay/15 gap-3">
                  <div className="text-[10px] text-earth-clay">
                    Actioning directly will update status and notify submitter.
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {(viewModal.item.status === "submitted" ||
                      viewModal.item.status === "in_review" ||
                      viewModal.item.status === "pending") ? (
                      <>
                        <button
                          onClick={() => {
                            handleRejectGem(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                            setViewModal({ isOpen: false, type: null, item: null });
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            handleApproveGem(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                            setViewModal({ isOpen: false, type: null, item: null });
                          }}
                          className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Approve (+100 PTS)
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          handleDeleteGem(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                          setViewModal({ isOpen: false, type: null, item: null });
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Delete Gem
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TYPE 2: JOURNEY */}
            {viewModal.type === "journey" && (
              <div className="space-y-5 text-xs font-sans">
                {/* Author Info Bar */}
                <div className="p-3 bg-earth-sand/30 border border-earth-clay/10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-earth-terracotta" />
                    <div>
                      <span className="text-[10px] uppercase text-earth-clay font-bold block">Author</span>
                      <span className="font-semibold text-earth-charcoal">
                        {viewModal.item.author} ({viewModal.item.authorTier || "Bronze"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Route className="h-4 w-4 text-earth-forest" />
                    <span className="font-semibold text-earth-forest">Duration: {viewModal.item.duration}</span>
                  </div>
                </div>

                {/* Stops List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Route & Planned Stops
                  </span>
                  {Array.isArray(viewModal.item.stops) && viewModal.item.stops.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {viewModal.item.stops.map((stop: string, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-earth-sand/50 border border-earth-clay/20 text-earth-charcoal font-semibold text-xs flex items-center space-x-1.5"
                        >
                          <span className="h-4 w-4 bg-earth-forest text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span>{stop}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-earth-clay/60 italic text-[11px]">No stops listed.</p>
                  )}
                </div>

                {/* Full Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Journey Description & Overview
                  </span>
                  <div className="p-3 bg-earth-sand/15 border border-earth-clay/10 text-earth-charcoal/90 text-xs leading-relaxed whitespace-pre-wrap font-light">
                    {viewModal.item.description || "No description provided."}
                  </div>
                </div>

                {/* Rejection Reason if present */}
                {viewModal.item.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                    <span className="font-bold uppercase text-[10px] block">Rejection Reason</span>
                    <p>{viewModal.item.rejectionReason}</p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end items-center pt-4 border-t border-earth-clay/15 space-x-2">
                  {viewModal.item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => {
                          handleRejectJourney(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                          setViewModal({ isOpen: false, type: null, item: null });
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          handleApproveJourney(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                          setViewModal({ isOpen: false, type: null, item: null });
                        }}
                        className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Approve (+100 PTS)
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleDeleteJourney(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                        setViewModal({ isOpen: false, type: null, item: null });
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Delete Journey
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TYPE 3: BLOG (TRAVELER STORY) */}
            {viewModal.type === "blog" && (
              <div className="space-y-5 text-xs font-sans">
                {/* Author & Story Info */}
                <div className="p-3 bg-earth-sand/30 border border-earth-clay/10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    {viewModal.item.authorImage ? (
                      <img src={viewModal.item.authorImage} alt={viewModal.item.author} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-earth-terracotta" />
                    )}
                    <div>
                      <span className="text-[10px] uppercase text-earth-clay font-bold block">Author</span>
                      <span className="font-semibold text-earth-charcoal">
                        {viewModal.item.author} ({viewModal.item.authorTier || "Bronze"})
                      </span>
                    </div>
                  </div>
                  <div className="text-earth-clay text-[11px]">
                    Date: {viewModal.item.date}
                  </div>
                </div>

                {/* Cover Image preview */}
                {viewModal.item.coverImage && (
                  <div className="h-48 border border-earth-clay/15 bg-stone-100 overflow-hidden">
                    <img src={viewModal.item.coverImage} alt={viewModal.item.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Full Content */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Full Story Content
                  </span>
                  <div className="p-4 bg-earth-sand/15 border border-earth-clay/10 text-earth-charcoal text-xs leading-relaxed whitespace-pre-wrap font-light">
                    {viewModal.item.content || "No story content submitted."}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end items-center pt-4 border-t border-earth-clay/15 space-x-2">
                  {viewModal.item.status !== "published" && (
                    <button
                      onClick={() => {
                        handleApproveBlog(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                        setViewModal({ isOpen: false, type: null, item: null });
                      }}
                      className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Publish
                    </button>
                  )}
                  {viewModal.item.status !== "rejected" && (
                    <button
                      onClick={() => {
                        handleRejectBlog(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                        setViewModal({ isOpen: false, type: null, item: null });
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteBlog(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                      setViewModal({ isOpen: false, type: null, item: null });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Delete Story
                  </button>
                </div>
              </div>
            )}

            {/* TYPE 4: REVIEW */}
            {viewModal.type === "review" && (
              <div className="space-y-5 text-xs font-sans">
                {/* Rating & Author Header */}
                <div className="p-3 bg-earth-sand/30 border border-earth-clay/10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < viewModal.item.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-earth-charcoal text-sm">
                      {viewModal.item.rating} / 5 Stars
                    </span>
                  </div>
                  <div className="text-earth-clay text-[11px]">
                    Author: <span className="font-semibold text-earth-charcoal">{viewModal.item.author}</span> • Date: {viewModal.item.date}
                  </div>
                </div>

                {/* Location */}
                <div className="p-2.5 bg-white border border-earth-clay/10">
                  <span className="text-[9px] uppercase font-bold text-earth-clay block">Location Reviewed</span>
                  <span className="font-serif font-bold text-earth-forest text-sm">{viewModal.item.location}</span>
                </div>

                {/* Full Review Text */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Full Review Text
                  </span>
                  <blockquote className="p-4 bg-earth-sand/15 border-l-4 border-earth-terracotta text-earth-charcoal italic text-xs leading-relaxed font-light">
                    "{viewModal.item.text}"
                  </blockquote>
                </div>

                {/* Review Photos if present */}
                {Array.isArray(viewModal.item.photos) && viewModal.item.photos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                      Attached Review Photos
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {viewModal.item.photos.map((p: string, idx: number) => (
                        <img key={idx} src={p} alt="Review attachment" className="h-32 w-full object-cover border border-earth-clay/20" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end items-center pt-4 border-t border-earth-clay/15 space-x-2">
                  <button
                    onClick={() => {
                      handleFlagReview(viewModal.item.id || viewModal.item._id, viewModal.item.flagged);
                      setViewModal({ isOpen: false, type: null, item: null });
                    }}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                      viewModal.item.flagged
                        ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                        : "bg-white text-earth-charcoal border-earth-clay/20 hover:bg-earth-sand"
                    }`}
                  >
                    {viewModal.item.flagged ? "Unflag Review" : "Flag Review"}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteReview(viewModal.item.id || viewModal.item._id, viewModal.item.title || "Review");
                      setViewModal({ isOpen: false, type: null, item: null });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Delete Review
                  </button>
                </div>
              </div>
            )}

            {/* TYPE 5: DESTINATION (OFFICIAL CHRONICLE) */}
            {viewModal.type === "destination" && (
              <div className="space-y-5 text-xs font-sans">
                <div className="p-3 bg-earth-sand/30 border border-earth-clay/10 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Compass className="h-4 w-4 text-earth-forest" />
                    <span className="font-semibold text-earth-charcoal">
                      {viewModal.item.location}, {viewModal.item.state}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-earth-clay/10 text-earth-forest text-[9px] uppercase font-bold">
                    {viewModal.item.category}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                    Description
                  </span>
                  <p className="p-3 bg-earth-sand/15 border border-earth-clay/10 text-earth-charcoal text-xs leading-relaxed font-light">
                    {viewModal.item.description}
                  </p>
                </div>

                {/* Photos */}
                {Array.isArray(viewModal.item.photos) && viewModal.item.photos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-earth-forest tracking-wider block border-b border-earth-clay/10 pb-1">
                      Main Photos
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {viewModal.item.photos.map((p: string, i: number) => (
                        <img key={i} src={p} alt="Destination main" className="h-36 w-full object-cover border border-earth-clay/20" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Travel Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  {viewModal.item.bestTimeToVisit && (
                    <div className="p-2.5 bg-white border border-earth-clay/10">
                      <span className="text-[9px] uppercase font-bold text-earth-clay block">Best Time to Visit</span>
                      <p className="text-earth-charcoal font-medium">{viewModal.item.bestTimeToVisit}</p>
                    </div>
                  )}
                  {viewModal.item.howToReach && (
                    <div className="p-2.5 bg-white border border-earth-clay/10">
                      <span className="text-[9px] uppercase font-bold text-earth-clay block">How to Reach</span>
                      <p className="text-earth-charcoal font-medium">{viewModal.item.howToReach}</p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end items-center pt-4 border-t border-earth-clay/15 space-x-2">
                  <button
                    onClick={() => {
                      const d = viewModal.item;
                      setViewModal({ isOpen: false, type: null, item: null });
                      setDestModal({
                        isOpen: true,
                        isEdit: true,
                        id: d.id || d._id,
                        title: d.title || "",
                        description: d.description || "",
                        location: d.location || "",
                        state: d.state || "",
                        category: d.category || "Hills",
                        photos: (d.photos || []).join(", "),
                        lat: String(d.geo?.lat ?? 10.0889),
                        lng: String(d.geo?.lng ?? 77.0595),
                        bestTimeToVisit: d.bestTimeToVisit || "",
                        howToReach: d.howToReach || "",
                        sourceName: d.sourceName || "",
                        sourceUrl: d.sourceUrl || "",
                        nearbyAttractions: (d.nearbyAttractions || []).join("\n"),
                        tips: (d.tips || []).join("\n"),
                        photoGallery: (d.photoGallery || []).join("\n"),
                        crowdLevel: d.crowdData?.crowdLevel || "moderate",
                        crowdSourceNote: d.crowdData?.crowdSourceNote || "",
                      });
                    }}
                    className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Edit Chronicle
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteDestination(viewModal.item.id || viewModal.item._id, viewModal.item.title);
                      setViewModal({ isOpen: false, type: null, item: null });
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Delete Chronicle
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
