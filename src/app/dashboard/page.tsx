"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import MapPicker from "@/components/MapPicker";
import { CategoryDonutChart, TripExpensesBarChart } from "@/components/ExpenseCharts";
import { useUser, PlanDay } from "@/components/UserContext";
import {
  Compass,
  Gift,
  Route,
  BookOpen,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Plus,
  Coins,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Heart,
  MapPin,
  Image,
  Upload,
  UserCheck,
  Activity,
  Award,
  ShieldAlert,
  Trash2,
  Flag,
  XCircle,
} from "lucide-react";

export default function Dashboard() {
  const {
    currentUser,
    profiles,
    switchProfile,
    destinations,
    hiddenGems,
    blogs,
    reviews,
    journeys,
    pointsLedger,
    wishlist,
    toggleWishlist,
    expenses,
    addExpense,
    generateAILocalPlan,
    submitGem,
    approveGem,
    rejectGem,
    addDestination,
    addReview,
    addBlog,
    completeTrip,
    addTrip,
    toggleUserVerification,
    flagReview,
    deleteReview,
    flagBlog,
    deleteBlog,
    logout,
  } = useUser();

  const [activeTab, setActiveTab] = useState<"profile" | "wishlist" | "expenses" | "planner" | "addgem" | "admin">("profile");

  // Admin section sub-navigation states
  const [adminSubTab, setAdminSubTab] = useState<"spots" | "reviews" | "blogs" | "add_destination">("spots");
  const [activeRejectionGemId, setActiveRejectionGemId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<{ [gemId: string]: string }>({});
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  
  // Add Destination Form State
  const [destTitle, setDestTitle] = useState("");
  const [destDesc, setDestDesc] = useState("");
  const [destLocation, setDestLocation] = useState("");
  const [destState, setDestState] = useState("");
  const [destCategory, setDestCategory] = useState("Hills");
  const [destPhotoUrl, setDestPhotoUrl] = useState("");
  const [destLat, setDestLat] = useState("");
  const [destLng, setDestLng] = useState("");
  const [destSuccess, setDestSuccess] = useState(false);
  const [destError, setDestError] = useState("");
  const [destLoading, setDestLoading] = useState(false);

  const handleAddDestinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destTitle || !destDesc || !destLocation || !destState || !destPhotoUrl) {
      setDestError("Please fill in all fields.");
      return;
    }
    setDestLoading(true);
    setDestError("");
    setDestSuccess(false);
    try {
      await addDestination({
        title: destTitle,
        description: destDesc,
        location: destLocation,
        state: destState,
        category: destCategory,
        photos: [destPhotoUrl],
        geo: {
          lat: Number(destLat) || 0,
          lng: Number(destLng) || 0,
        },
      });
      setDestSuccess(true);
      setDestTitle("");
      setDestDesc("");
      setDestLocation("");
      setDestState("");
      setDestPhotoUrl("");
      setDestLat("");
      setDestLng("");
    } catch (err: any) {
      setDestError(err.message || "Failed to add destination.");
    } finally {
      setDestLoading(false);
    }
  };

  // Profile selector dropdown toggle
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Wishlist resolution helper
  // Load curations and gems matching saved wishlist IDs
  const resolvedWishlistItems = [
    ...destinations.map(d => ({ ...d, type: "official" as const })),
    ...hiddenGems.map(g => ({ ...g, type: "gem" as const }))
  ].filter(item => wishlist.includes(item.id));

  // Expense Tracker active trip selection
  const [selectedTripId, setSelectedTripId] = useState<string>(journeys[0]?.id || "");
  const activeJourney = journeys.find(j => j.id === selectedTripId);

  // Expense Tracker Form State
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<"Food" | "Stay" | "Transport" | "Tickets" | "Shopping" | "Other">("Food");
  const [expDesc, setExpDesc] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !expAmount || !expDesc) return;
    addExpense(selectedTripId, Number(expAmount), expCategory, expDesc);
    setExpAmount("");
    setExpDesc("");
  };

  const selectedTripExpenses = expenses.filter(e => e.tripId === selectedTripId);
  const tripRunningTotal = selectedTripExpenses.reduce((sum, curr) => sum + curr.amount, 0);

  // AI Trip Planner Form State
  const [planRegion, setPlanRegion] = useState("Kerala");
  const [planCategories, setPlanCategories] = useState<string[]>([]);
  const [planDays, setPlanDays] = useState(3);
  const [generatedItinerary, setGeneratedItinerary] = useState<PlanDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Memoized unique region/state suggestions from destinations and approved gems
  const allRegionSuggestions = useMemo(() => {
    const list = new Set<string>();
    destinations.forEach((d) => {
      if (d.location) list.add(d.location.trim());
      if (d.state) list.add(d.state.trim());
    });
    hiddenGems.forEach((g) => {
      if (g.status === "approved") {
        if (g.location) list.add(g.location.trim());
        if (g.state) list.add(g.state.trim());
      }
    });
    return Array.from(list).filter(Boolean);
  }, [destinations, hiddenGems]);

  const filteredSuggestions = useMemo(() => {
    if (!planRegion.trim()) return [];
    const searchVal = planRegion.toLowerCase();
    return allRegionSuggestions
      .filter(
        (item) =>
          item.toLowerCase().includes(searchVal) &&
          item.toLowerCase() !== searchVal
      )
      .slice(0, 6);
  }, [planRegion, allRegionSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const plan = generateAILocalPlan(planRegion, planCategories, planDays);
      setGeneratedItinerary(plan);
      setIsGenerating(false);
    }, 1500);
  };

  // Add Hidden Gem Form State
  const [gemTitle, setGemTitle] = useState("");
  const [gemLocName, setGemLocName] = useState("");
  const [gemState, setGemState] = useState("");
  const [gemCategory, setGemCategory] = useState("Offbeat");
  const [gemDesc, setGemDesc] = useState("");
  const [gemLat, setGemLat] = useState<number>(0);
  const [gemLng, setGemLng] = useState<number>(0);
  
  // Image URL state and validation helper
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const isValidImageUrl = (url: string) => {
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
      return false;
    }
    const cleanUrl = trimmed.split("?")[0].split("#")[0].toLowerCase();
    const commonExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg"];
    return commonExtensions.some(ext => cleanUrl.endsWith(ext));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-earth-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-terracotta" />
      </div>
    );
  }

  const handleAddGemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gemTitle || !gemLocName || !gemState || !gemDesc || !uploadedImageUrl) return;
    if (!isValidImageUrl(uploadedImageUrl)) return;

    submitGem({
      title: gemTitle,
      description: gemDesc,
      location: gemLocName,
      state: gemState,
      category: gemCategory,
      photo: uploadedImageUrl,
      geo: { lat: gemLat, lng: gemLng },
    });

    // Reset Form
    setGemTitle("");
    setGemLocName("");
    setGemState("");
    setGemCategory("Offbeat");
    setGemDesc("");
    setGemLat(0);
    setGemLng(0);
    setUploadedImageUrl("");
    
    // Switch to appropriate tab
    if (currentUser?.email === "230107anu@gmail.com") {
      setActiveTab("admin");
    } else {
      setActiveTab("profile");
    }
  };

  // Helper to color tier label
  const renderTierBadge = (tier: "Bronze" | "Silver" | "Gold") => {
    switch (tier) {
      case "Gold":
        return (
          <span className="px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider border border-[#f3d082] bg-[#fdf6e2] text-[#d69e2e] inline-block shadow-sm">
            Gold Member
          </span>
        );
      case "Silver":
        return (
          <span className="px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider border border-[#ccd2d8] bg-[#f0f2f5] text-[#5c6873] inline-block shadow-sm">
            Silver Member
          </span>
        );
      case "Bronze":
      default:
        return (
          <span className="px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider border border-[#d8c3b7] bg-[#fbf5f0] text-[#8c5230] inline-block shadow-sm">
            Bronze Member
          </span>
        );
    }
  };

  // Badges Earned Calculations
  const hasSubmittedGem = hiddenGems.some(g => g.submittedBy === currentUser.name);
  const hasWrittenReview = reviews.some(r => r.author === currentUser.name) || blogs.some(b => b.author === currentUser.name);
  const hasCompletedTrip = journeys.some(j => j.author === currentUser.name && j.completed);
  const isGoldOrSilver = currentUser.tier === "Gold" || currentUser.tier === "Silver";

  // Moderation Sandbox list
  const pendingGems = hiddenGems.filter(g => g.status === "pending");

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card & Auth Switcher header */}
        <div className="bg-[#1c3d27] text-white p-8 md:p-12 mb-10 border border-earth-clay/10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />



          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4 md:pt-0">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar circle */}
              <div className="h-20 w-20 rounded-full bg-earth-saffron/10 border-2 border-earth-saffron/40 flex items-center justify-center text-2xl font-bold text-earth-saffron font-serif shadow-inner shrink-0">
                {currentUser.avatar}
              </div>

              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="font-serif text-3xl font-bold tracking-tight">
                    {currentUser.name}
                  </h1>
                  {currentUser.isVerified && (
                    <span title="Verified Explorer Badge">
                      <ShieldCheck className="h-6 w-6 text-blue-400 fill-[#1c3d27] shrink-0" />
                    </span>
                  )}
                  <button
                    onClick={() => logout()}
                    className="ml-2 px-3 py-1 border border-white/20 bg-white/5 hover:bg-red-650 hover:border-red-650 text-white font-sans text-[10px] font-bold uppercase tracking-widest transition-all duration-200 rounded-none cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
                <p className="text-xs text-earth-sand/70 font-light max-w-md">
                  From {currentUser.homeTown} • {currentUser.bio}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                  {renderTierBadge(currentUser.tier)}
                  <button
                    onClick={toggleUserVerification}
                    className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-none transition-colors cursor-pointer"
                  >
                    {currentUser.isVerified ? "Revoke Verification" : "Grant Verified Perk"}
                  </button>
                </div>
              </div>
            </div>

            {/* Point stand */}
            <div className="border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center min-w-[200px] text-center shrink-0">
              <Coins className="h-8 w-8 text-earth-saffron mb-2 animate-pulse" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-earth-saffron">
                Explorer Points
              </span>
              <span className="font-serif text-4xl font-bold text-white mt-1">
                {currentUser.points} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Grid Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-8 bg-white border border-earth-clay/10 p-6 md:p-8">
            
            {/* Tabs Header */}
            <div className="flex border-b border-earth-clay/10 pb-2 flex-wrap gap-2">
              {[
                { id: "profile", name: "My Profile & Badges", icon: Award },
                { id: "wishlist", name: "My Wishlist", icon: Heart },
                { id: "expenses", name: "Expense Visualizer", icon: Activity },
                { id: "planner", name: "AI Local Planner", icon: Route },
                { id: "addgem", name: "Add a Spot Discovery", icon: Plus },
                ...(currentUser?.email === "230107anu@gmail.com"
                  ? [{ id: "admin", name: "Admin Mod sandbox", icon: Sparkles }]
                  : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-3 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[10px] transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-earth-terracotta text-earth-terracotta"
                        : "border-transparent text-earth-charcoal/60 hover:text-earth-charcoal"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="pt-4">
              
              {/* Profile & Badges Tab */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  {/* Badges Drawer */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/5 pb-2">
                      Explorer Achievements & Badges
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Badge: Verified */}
                      <div className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 rounded-none transition-all ${
                        currentUser.isVerified
                          ? "bg-blue-50/50 border-blue-200 text-blue-800"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}>
                        <ShieldCheck className={`h-8 w-8 ${currentUser.isVerified ? "text-blue-500 fill-blue-50" : ""}`} />
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Verified Identity</span>
                        <p className="text-[8px] font-sans font-light">Verified user checkmark perk</p>
                      </div>

                      {/* Badge: Spotter */}
                      <div className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 rounded-none transition-all ${
                        hasSubmittedGem
                          ? "bg-amber-50/50 border-amber-200 text-amber-800"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}>
                        <Compass className={`h-8 w-8 ${hasSubmittedGem ? "text-earth-saffron animate-spin" : ""}`} />
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Spot Discoverer</span>
                        <p className="text-[8px] font-sans font-light">Submitted offbeat hidden gem</p>
                      </div>

                      {/* Badge: Writer */}
                      <div className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 rounded-none transition-all ${
                        hasWrittenReview
                          ? "bg-orange-50/50 border-orange-200 text-orange-850"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}>
                        <BookOpen className="h-8 w-8" />
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Logbook Writer</span>
                        <p className="text-[8px] font-sans font-light">Published review or blog post</p>
                      </div>

                      {/* Badge: Legend */}
                      <div className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 rounded-none transition-all ${
                        isGoldOrSilver
                          ? "bg-earth-sand border-earth-clay/20 text-earth-clay"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}>
                        <Award className="h-8 w-8 text-earth-terracotta" />
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Elite Guide</span>
                        <p className="text-[8px] font-sans font-light">Promoted to Silver or Gold tier</p>
                      </div>
                    </div>
                  </div>

                  {/* Points breakdown ledger */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/5 pb-2">
                      Points Earnings Breakdown
                    </h3>
                    <div className="overflow-x-auto border border-earth-clay/10 bg-white">
                      <table className="min-w-full font-sans text-xs text-left">
                        <thead className="bg-earth-sand border-b border-earth-clay/10 text-earth-charcoal uppercase tracking-widest text-[9px] font-bold">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Activity Description</th>
                            <th className="p-3 text-right">Points Earned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-earth-clay/5">
                          {pointsLedger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-earth-sand/30">
                              <td className="p-3 text-earth-clay/70">{entry.date}</td>
                              <td className="p-3 font-semibold text-earth-charcoal">{entry.action}</td>
                              <td className="p-3 text-right text-earth-terracotta font-bold">
                                +{entry.points} PTS
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/5 pb-2">
                    My Saved Explorations
                  </h3>
                  
                  {resolvedWishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resolvedWishlistItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-earth-sand/20 border border-earth-clay/10 flex flex-col justify-between hover:border-earth-terracotta/30 transition-all duration-300"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={item.type === "official" ? item.photos?.[0] : item.photo} alt={item.title} className="w-full h-full object-cover" />
                            <span className="absolute top-4 left-4 bg-earth-sand text-earth-forest border border-earth-clay/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              {item.category}
                            </span>
                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full transition-all cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Heart className="h-4 w-4 fill-current text-white" />
                            </button>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-sans text-earth-clay">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span>{item.location}</span>
                                </span>
                                <span className="uppercase font-bold tracking-wider text-earth-terracotta text-[8px] bg-earth-terracotta/5 px-2 py-0.5 border border-earth-terracotta/10">
                                  {item.type === "official" ? "Official Guide" : "Hidden Gem Spot"}
                                </span>
                              </div>
                              <h4 className="font-serif text-base font-bold text-earth-charcoal leading-tight">
                                {item.title}
                              </h4>
                            </div>

                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className="w-full py-2 border border-earth-clay/20 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-earth-terracotta hover:text-white hover:border-earth-terracotta transition-all rounded-none cursor-pointer"
                            >
                              Remove from Wishlist
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5">
                      <Heart className="h-12 w-12 text-earth-clay/25 mx-auto mb-3" />
                      <p className="font-sans text-xs text-earth-charcoal/60 font-light">
                        Your wishlist is empty. Explore the home page to save official guides or offbeat local spots!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Expense visualizer Tab */}
              {activeTab === "expenses" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-earth-clay/10 pb-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-earth-forest">
                        Trip Expense Tracker
                      </h3>
                      <p className="font-sans text-xs font-light text-earth-charcoal/70">
                        Manage your categories and track real-time budgets using custom SVG chart visualization.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-earth-clay">Select Trip:</label>
                      <select
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        className="p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                      >
                        {journeys.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.title.split("Itinerary")[0].split("Trek")[0].trim()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {activeJourney ? (
                    <div className="space-y-8">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col justify-center">
                          <span className="text-[9px] uppercase font-bold text-earth-clay">Journey Status</span>
                          <span className="font-serif text-lg font-bold text-earth-forest mt-1">
                            {activeJourney.completed ? "Completed" : "Active & In Progress"}
                          </span>
                        </div>
                        <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col justify-center">
                          <span className="text-[9px] uppercase font-bold text-earth-clay">Running Cost</span>
                          <span className="font-serif text-xl font-bold text-earth-terracotta mt-1 font-mono">
                            ₹{tripRunningTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col justify-center">
                          <span className="text-[9px] uppercase font-bold text-earth-clay">Recorded Items</span>
                          <span className="font-serif text-lg font-bold text-earth-charcoal mt-1">
                            {selectedTripExpenses.length} Entries
                          </span>
                        </div>
                      </div>

                      {/* SVG Visualizations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CategoryDonutChart expenses={selectedTripExpenses} />
                        <TripExpensesBarChart journeys={journeys} expenses={expenses} />
                      </div>

                      {/* Split view: Add Expense & Expenses List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* List */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest border-b border-earth-clay/5 pb-1">
                            Logged Expenses
                          </h4>
                          {selectedTripExpenses.length > 0 ? (
                            <div className="divide-y divide-earth-clay/10 max-h-[300px] overflow-y-auto border border-earth-clay/5 p-2 bg-white">
                              {selectedTripExpenses.map((exp) => (
                                <div key={exp.id} className="py-2.5 flex justify-between items-center text-xs">
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-1.5">
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            exp.category === "Food"
                                              ? "#d69e2e"
                                              : exp.category === "Stay"
                                              ? "#8c5230"
                                              : exp.category === "Transport"
                                              ? "#c05621"
                                              : exp.category === "Tickets"
                                              ? "#1c3d27"
                                              : exp.category === "Shopping"
                                              ? "#e53e3e"
                                              : "#718096",
                                        }}
                                      />
                                      <span className="font-semibold text-earth-charcoal">
                                        {exp.description}
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-earth-clay/70 font-light">
                                      {exp.category} • {exp.date}
                                    </p>
                                  </div>
                                  <span className="font-mono font-bold text-earth-terracotta">
                                    ₹{exp.amount}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-earth-clay/60 border border-dashed border-earth-clay/10 text-xs">
                              No expenses logged yet.
                            </div>
                          )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddExpense} className="bg-earth-sand/10 border border-earth-clay/10 p-5 space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest border-b border-earth-clay/5 pb-1">
                            Add Categorized Expense
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-charcoal">
                                Amount (INR)
                              </label>
                              <input
                                type="number"
                                required
                                value={expAmount}
                                onChange={(e) => setExpAmount(e.target.value)}
                                placeholder="₹ e.g. 1200"
                                className="w-full p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-charcoal">
                                Category
                              </label>
                              <select
                                value={expCategory}
                                onChange={(e) => setExpCategory(e.target.value as any)}
                                className="w-full p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                              >
                                {["Food", "Stay", "Transport", "Tickets", "Shopping", "Other"].map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Description
                            </label>
                            <input
                              type="text"
                              required
                              value={expDesc}
                              onChange={(e) => setExpDesc(e.target.value)}
                              placeholder="e.g. Local guide fees or lunch"
                              className="w-full p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                          >
                            Log Expense
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">No journeys loaded.</div>
                  )}
                </div>
              )}

              {/* AI Local Planner Tab */}
              {activeTab === "planner" && (
                <div className="space-y-8">
                  <div className="space-y-1 border-b border-earth-clay/10 pb-4">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      AI Local-First Trip Planner
                    </h3>
                    <p className="font-sans text-xs font-light text-earth-charcoal/70 leading-relaxed">
                      Enter your destination and preference. Rather than spitting out generic ChatGPT content, our AI customizes your route prioritizing verified guides and community-submitted hidden gems matching our database first!
                    </p>
                  </div>

                  {/* Settings planner form */}
                  <form onSubmit={handleGeneratePlan} className="bg-earth-sand/15 border border-earth-clay/10 p-6 space-y-6 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      {/* Region/State/Place free-text input with Autocomplete */}
                      <div ref={suggestionsRef} className="relative md:col-span-2 space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                          Region / State / Place
                        </label>
                        <input
                          type="text"
                          required
                          value={planRegion}
                          onChange={(e) => {
                            setPlanRegion(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          placeholder="e.g. Kerala, Ladakh, Jaipur, Paris..."
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none placeholder-earth-charcoal/40"
                        />
                        
                        {/* Autocomplete Suggestions */}
                        {showSuggestions && filteredSuggestions.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-earth-clay/20 shadow-lg max-h-48 overflow-y-auto">
                            {filteredSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => {
                                  setPlanRegion(suggestion);
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-earth-sand/30 text-earth-charcoal hover:text-earth-terracotta transition-colors border-b border-earth-clay/5 last:border-0 font-sans"
                              >
                                🗺️ {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Flexible Duration Days input */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                          Duration (Days)
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={30}
                          value={planDays}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPlanDays(val > 0 ? val : 1);
                          }}
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                        />
                      </div>
                    </div>

                    {/* Multi-select Category Tags */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                        Category Vibes (Optional - select multiple)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: "Hills", label: "⛰️ Hills & Valleys" },
                          { value: "Beaches", label: "🏖️ Beaches & Coasts" },
                          { value: "Heritage", label: "🏰 Heritage & Forts" },
                          { value: "Wildlife", label: "🦁 Wildlife & Jungles" },
                          { value: "Offbeat", label: "💎 Community Gems" }
                        ].map((cat) => {
                          const isSelected = planCategories.includes(cat.value);
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setPlanCategories(planCategories.filter((c) => c !== cat.value));
                                } else {
                                  setPlanCategories([...planCategories, cat.value]);
                                }
                              }}
                              className={`px-3 py-2 text-xs transition-all border border-earth-clay/20 rounded-none cursor-pointer flex items-center gap-1.5 font-medium ${
                                isSelected
                                  ? "bg-earth-forest border-earth-forest text-white shadow-sm"
                                  : "bg-white border-earth-clay/20 text-earth-charcoal/80 hover:border-earth-terracotta hover:text-earth-terracotta"
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full md:w-auto px-8 py-3.5 bg-earth-terracotta hover:bg-earth-forest disabled:bg-earth-clay/40 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer shrink-0"
                      >
                        {isGenerating ? "Mapping Trails..." : "Generate AI Plan"}
                      </button>
                    </div>
                  </form>

                  {/* Generated result */}
                  {isGenerating ? (
                    <div className="text-center py-16 space-y-4">
                      <Compass className="h-10 w-10 text-earth-terracotta animate-spin mx-auto" />
                      <p className="font-serif text-sm font-bold text-earth-forest animate-pulse">
                        Scanning SafarNama Chronicles & community spot ledgers...
                      </p>
                    </div>
                  ) : generatedItinerary.length > 0 ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="p-3 bg-earth-forest/5 border border-earth-forest/20 text-earth-forest text-xs font-medium font-sans flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-earth-saffron animate-bounce" />
                        <span>Plan successfully compiled: Prioritized local database guidebooks & spot submissions!</span>
                      </div>

                      {/* Days roadmap list */}
                      <div className="space-y-6 relative border-l-2 border-earth-clay/10 pl-6 ml-4">
                        {generatedItinerary.map((day) => (
                          <div key={day.day} className="relative space-y-2 font-sans">
                            {/* Bullet Node */}
                            <span className="absolute -left-[35px] top-1.5 h-4 w-4 rounded-full border-2 border-earth-terracotta bg-white flex items-center justify-center font-sans text-[8px] font-bold text-earth-terracotta shadow-sm">
                              {day.day}
                            </span>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <h4 className="font-serif text-base font-bold text-earth-charcoal">
                                Day {day.day}: {day.title}
                              </h4>
                              
                              {/* Source Badge */}
                              {day.sourceType === "official" && (
                                <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-earth-forest/10 border border-earth-forest/25 text-earth-forest rounded-none self-start">
                                  📖 SafarNama Official Guide
                                </span>
                              )}
                              {day.sourceType === "gem" && (
                                <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-earth-saffron/10 border border-[#f3d082] text-earth-clay rounded-none self-start">
                                  💎 Community Hidden Gem
                                </span>
                              )}
                              {day.sourceType === "generic" && (
                                <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-stone-100 border border-stone-200 text-stone-500 rounded-none self-start">
                                  🤖 Regional AI Suggestions
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-earth-charcoal/70 font-light leading-relaxed">
                              {day.description}
                            </p>
                            <div className="text-[10px] text-earth-clay font-medium flex items-center space-x-1">
                              <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                              <span>{day.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5">
                      <Compass className="h-12 w-12 text-earth-clay/25 mx-auto mb-3" />
                      <p className="font-sans text-xs text-earth-charcoal/60 font-light">
                        Select a region and request an itinerary to initialize the AI trip planning visualizer.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Add Spot Tab */}
              {activeTab === "addgem" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-1 border-b border-earth-clay/10 pb-4">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      Submit a New Hidden Gem Discovery
                    </h3>
                    <p className="font-sans text-xs font-light text-earth-charcoal/70">
                      Submit a local offbeat spot to our moderation desk. On admin approval, you earn <span className="font-bold text-earth-terracotta">100 points</span>.
                    </p>
                  </div>

                  <form onSubmit={handleAddGemSubmit} className="space-y-6 font-sans text-xs">
                    
                    {/* India Map picker selector */}
                    <div className="bg-earth-sand/10 border border-earth-clay/10 p-5">
                      <MapPicker
                        onSelectLocation={(lat, lng, name) => {
                          setGemLat(lat);
                          setGemLng(lng);
                          // Auto fill city/state if it snaped to a hotspot
                          if (name.includes(",")) {
                            const [cityName, stateName] = name.split(",");
                            setGemLocName(cityName.trim());
                            setGemState(stateName.trim());
                          }
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Spot Name
                        </label>
                        <input
                          type="text"
                          required
                          value={gemTitle}
                          onChange={(e) => setGemTitle(e.target.value)}
                          placeholder="e.g. Phugtal cliff monastery"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Vibe Category
                        </label>
                        <select
                          value={gemCategory}
                          onChange={(e) => setGemCategory(e.target.value)}
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none animate-none"
                        >
                          <option value="Hills">Hills & Gorges</option>
                          <option value="Beaches">Secret Beaches</option>
                          <option value="Heritage">Heritage Ruins</option>
                          <option value="Wildlife">Forest Trails</option>
                          <option value="Offbeat">Offbeat Caves</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Location Name */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          City / Valley / District
                        </label>
                        <input
                          type="text"
                          required
                          value={gemLocName}
                          onChange={(e) => setGemLocName(e.target.value)}
                          placeholder="e.g. Zanskar Gorge"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                        />
                      </div>

                      {/* State */}
                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          State Name
                        </label>
                        <input
                          type="text"
                          required
                          value={gemState}
                          onChange={(e) => setGemState(e.target.value)}
                          placeholder="e.g. Ladakh"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                        />
                      </div>

                      {/* Location Coordinates Lat/Lng autofill visual */}
                      <div className="space-y-1 bg-earth-sand/30 border border-earth-clay/10 p-2 flex flex-col justify-center select-none text-[9px] font-mono leading-tight">
                        <span className="font-sans font-bold text-earth-clay uppercase text-[8px] tracking-wider mb-1">
                          Map Coordinates
                        </span>
                        <div>Lat: {gemLat || "Not Set"}</div>
                        <div>Lng: {gemLng || "Not Set"}</div>
                      </div>
                    </div>

                    {/* Photo URL Input & Validation Preview */}
                    <div className="space-y-3 border border-earth-clay/10 p-5 bg-earth-sand/5">
                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal text-[10px]">
                          Photo URL
                        </label>
                        <input
                          type="text"
                          required
                          value={uploadedImageUrl}
                          onChange={(e) => setUploadedImageUrl(e.target.value)}
                          placeholder="e.g., https://images.unsplash.com/photo-1626590212990-2e40026e6cb5?auto=format&fit=crop&w=800&q=80"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none animate-none"
                        />
                      </div>

                      {/* Live Validation Warning */}
                      {uploadedImageUrl && !isValidImageUrl(uploadedImageUrl) && (
                        <p className="text-red-650 text-[10px] font-semibold animate-pulse">
                          ⚠️ Please enter a valid image URL starting with http:// or https:// and ending in a common extension (.jpg, .jpeg, .png, .webp, .gif, .svg, .bmp).
                        </p>
                      )}

                      {/* Live Image Preview */}
                      {uploadedImageUrl && isValidImageUrl(uploadedImageUrl) && (
                        <div className="space-y-1.5 animate-in fade-in duration-200">
                          <span className="text-[10px] font-bold text-earth-forest uppercase tracking-wider block">✓ Image URL Validated</span>
                          <div className="h-32 w-48 overflow-hidden border border-earth-clay/15 bg-white shadow-md relative">
                            <img
                              src={uploadedImageUrl}
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

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                        Detailed Discovery Review & Directions
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={gemDesc}
                        onChange={(e) => setGemDesc(e.target.value)}
                        placeholder="Write details of how you stumbled upon this trail, points of entry, warnings, or seasonal instructions..."
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none resize-none animate-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!gemTitle || !gemLocName || !gemState || !gemDesc || !uploadedImageUrl || !isValidImageUrl(uploadedImageUrl)}
                      className="w-full py-3 bg-earth-forest hover:bg-earth-terracotta disabled:bg-earth-clay/30 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer shadow-md"
                    >
                      Submit Discovery Guide
                    </button>
                  </form>
                </div>
              )}

              {/* Admin Sandbox queue tab */}
              {activeTab === "admin" && (() => {
                const isUserAdmin = currentUser?.email === "230107anu@gmail.com";

                if (!isUserAdmin) {
                  return (
                    <div className="space-y-6 text-center py-12 px-6 border border-earth-clay/10 bg-earth-sand/5 animate-in fade-in duration-300">
                      <ShieldAlert className="h-16 w-16 text-earth-terracotta mx-auto stroke-[1.5]" />
                      <div className="space-y-2">
                        <h3 className="font-serif text-xl font-bold text-earth-forest">
                          Admin Authorization Required
                        </h3>
                        <p className="font-sans text-xs text-earth-charcoal/70 max-w-md mx-auto leading-relaxed">
                          Moderation controls are restricted. You are currently logged in as <span className="font-bold">{currentUser.name}</span>.
                        </p>
                        <p className="font-sans text-[11px] text-earth-charcoal/50 max-w-md mx-auto">
                          Please sign in using the administrator email (230107anu@gmail.com).
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 font-sans text-xs animate-in fade-in duration-350">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-earth-clay/10 pb-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-earth-forest">
                          <Sparkles className="h-5 w-5 text-earth-terracotta shrink-0" />
                          <h3 className="font-serif text-lg font-bold uppercase tracking-wider">
                            Admin Moderation Console
                          </h3>
                        </div>
                        <p className="font-sans text-[11px] text-earth-charcoal/60">
                          Active Role: <span className="font-bold text-earth-forest uppercase">Convex Admin ({currentUser.name})</span>
                          {isAdminOverride && <span className="ml-1 text-[10px] text-amber-600 font-semibold italic">(Simulated bypass mode)</span>}
                        </p>
                      </div>

                      {/* Override status controls */}
                      <button
                        onClick={() => {
                          setIsAdminOverride(false);
                          if (currentUser.role !== "admin") {
                            // If they switched to a user profile, force them back to profile tab
                            setActiveTab("profile");
                          }
                        }}
                        className="px-3 py-1.5 border border-earth-clay/20 bg-earth-sand text-[10px] uppercase font-bold tracking-widest hover:border-earth-terracotta/40 hover:text-earth-terracotta transition-all cursor-pointer"
                      >
                        Exit Moderation
                      </button>
                    </div>

                    {/* Sub tabs navigation */}
                    <div className="flex space-x-2 border-b border-earth-clay/10 pb-1 flex-wrap gap-y-2">
                      {[
                        { id: "spots", name: `Spot Discoveries (${pendingGems.length})` },
                        { id: "reviews", name: `Reviews (${reviews.length})` },
                        { id: "blogs", name: `Traveler Stories (${blogs.length})` },
                        { id: "add_destination", name: "Add Official Destination" },
                      ].map((subTab) => {
                        const isActive = adminSubTab === subTab.id;
                        return (
                          <button
                            key={subTab.id}
                            onClick={() => setAdminSubTab(subTab.id as any)}
                            className={`px-3 py-2 font-sans font-bold uppercase tracking-wider border-b-2 -mb-[3px] transition-all cursor-pointer ${
                              isActive
                                ? "border-earth-forest text-earth-forest text-[11px]"
                                : "border-transparent text-earth-charcoal/50 hover:text-earth-charcoal text-[11px]"
                            }`}
                          >
                            {subTab.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sub tabs body */}
                    <div className="pt-2">
                      
                      {/* Sub-tab: Spot discoveries */}
                      {adminSubTab === "spots" && (
                        <div className="space-y-4">
                          <p className="text-earth-charcoal/70 font-light leading-relaxed">
                            Review community-submitted hidden gems. Approving a spot awards the user <span className="font-bold text-earth-terracotta">100 points</span> via the Convex points ledger and publishes it. Rejecting stores an optional feedback note explaining why it was returned.
                          </p>

                          {pendingGems.length > 0 ? (
                            <div className="space-y-4 pt-2">
                              {pendingGems.map((g) => {
                                const isRejectionOpen = activeRejectionGemId === g.id;
                                return (
                                  <div
                                    key={g.id}
                                    className="p-5 bg-earth-sand/15 border border-earth-clay/10 space-y-4 flex flex-col hover:border-earth-clay/35 transition-all"
                                  >
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                      {/* Thumbnail */}
                                      <div className="h-20 w-32 overflow-hidden border border-earth-clay/10 bg-white shrink-0 shadow-sm">
                                        <img src={g.photo} alt={g.title} className="w-full h-full object-cover" />
                                      </div>

                                      {/* Core Info */}
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                          <span className="font-serif text-sm font-bold text-earth-charcoal">{g.title}</span>
                                          <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-earth-sand border border-earth-clay/10 text-earth-clay">
                                            {g.category}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-earth-clay font-medium flex items-center space-x-1">
                                          <MapPin className="h-3 w-3 text-earth-terracotta" />
                                          <span>{g.location}, {g.state}</span>
                                        </div>
                                        <p className="text-xs font-light text-earth-charcoal/75 leading-relaxed pt-1 font-sans">
                                          {g.description}
                                        </p>
                                        
                                        <div className="pt-2 text-[9px] text-earth-clay flex items-center flex-wrap gap-x-4 gap-y-1">
                                          <span>Submitted by: <span className="font-bold text-earth-charcoal">{g.submittedBy}</span> ({g.submitterTier})</span>
                                          <span>•</span>
                                          <span>Date: <span className="font-semibold text-earth-charcoal">{g.createdAt}</span></span>
                                          {g.geo && (
                                            <>
                                              <span>•</span>
                                              <span className="font-mono bg-stone-100 px-1 border border-stone-200">Lat: {g.geo.lat.toFixed(4)}, Lng: {g.geo.lng.toFixed(4)}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons Row */}
                                    {!isRejectionOpen ? (
                                      <div className="flex items-center justify-end space-x-2 border-t border-earth-clay/5 pt-3">
                                        <button
                                          onClick={() => {
                                            setActiveRejectionGemId(g.id);
                                            setRejectionReasonText(prev => ({ ...prev, [g.id]: "" }));
                                          }}
                                          className="px-3.5 py-1.5 border border-red-200 text-red-700 bg-red-50/20 hover:bg-red-50 hover:border-red-300 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                        >
                                          Reject Submission
                                        </button>
                                        <button
                                          onClick={() => approveGem(g.id)}
                                          className="px-4 py-1.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                                        >
                                          Approve Discovery (+100 PTS)
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-3 bg-red-50/10 border border-red-200/40 p-4 animate-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-1">
                                          <label className="block text-[9px] font-bold uppercase tracking-wider text-red-800">
                                            Optional Rejection Reason / Submitter Feedback Note:
                                          </label>
                                          <textarea
                                            rows={2}
                                            value={rejectionReasonText[g.id] || ""}
                                            onChange={(e) => setRejectionReasonText(prev => ({ ...prev, [g.id]: e.target.value }))}
                                            placeholder="Explain why this spot was rejected (e.g. coordinates incorrect, picture low resolution, duplicate spot)..."
                                            className="w-full p-2 bg-white border border-red-200/80 text-xs focus:outline-none focus:border-red-500 rounded-none resize-none"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => setActiveRejectionGemId(null)}
                                            className="px-3 py-1 border border-earth-clay/20 text-earth-charcoal hover:bg-earth-sand font-sans text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              rejectGem(g.id, rejectionReasonText[g.id]);
                                              setActiveRejectionGemId(null);
                                            }}
                                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-sans text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                                          >
                                            Confirm Rejection
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-earth-sand/5 border border-dashed border-earth-clay/10 text-earth-clay font-medium">
                              No pending hidden gem submissions in the review queue.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-tab: Reviews moderation */}
                      {adminSubTab === "reviews" && (
                        <div className="space-y-4">
                          <p className="text-earth-charcoal/70 font-light leading-relaxed">
                            Moderate user review postings. Flagging a review hides it from the public destinations page instantly. Removing it deletes the review permanently from the database.
                          </p>

                          {reviews.length > 0 ? (
                            <div className="overflow-x-auto border border-earth-clay/10 bg-white shadow-sm">
                              <table className="min-w-full font-sans text-xs text-left">
                                <thead className="bg-earth-sand border-b border-earth-clay/10 text-earth-charcoal uppercase tracking-widest text-[9px] font-bold">
                                  <tr>
                                    <th className="p-3">Reviewer</th>
                                    <th className="p-3">Rating & Destination</th>
                                    <th className="p-3">Review Text</th>
                                    <th className="p-3">Moderation Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-earth-clay/5">
                                  {reviews.map((r) => {
                                    const stars = Array.from({ length: 5 }, (_, i) => i < r.rating);
                                    return (
                                      <tr key={r.id} className={`hover:bg-earth-sand/20 ${r.flagged ? "bg-red-50/10" : ""}`}>
                                        <td className="p-3 font-semibold align-top whitespace-nowrap">
                                          <div className="space-y-0.5">
                                            <div className="text-earth-charcoal">{r.author}</div>
                                            <div className="text-[8px] text-earth-clay uppercase font-bold tracking-wider">{r.authorTier}</div>
                                          </div>
                                        </td>
                                        <td className="p-3 align-top whitespace-nowrap">
                                          <div className="space-y-1">
                                            <div className="flex text-earth-saffron">
                                              {stars.map((filled, idx) => (
                                                <span key={idx} className="text-sm leading-none">
                                                  {filled ? "★" : "☆"}
                                                </span>
                                              ))}
                                            </div>
                                            <div className="text-[10px] text-earth-clay font-medium">{r.location}</div>
                                          </div>
                                        </td>
                                        <td className="p-3 align-top max-w-sm">
                                          <div className="space-y-0.5">
                                            <div className="font-semibold text-earth-charcoal">{r.title}</div>
                                            <p className="text-[11px] text-earth-charcoal/70 font-light leading-relaxed line-clamp-2">
                                              {r.text}
                                            </p>
                                          </div>
                                        </td>
                                        <td className="p-3 align-top whitespace-nowrap">
                                          {r.flagged ? (
                                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-705 bg-red-50 border border-red-200">
                                              🚨 FLAGGED / HIDDEN
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-earth-forest bg-earth-forest/5 border border-earth-forest/10">
                                              ✓ Active
                                            </span>
                                          )}
                                        </td>
                                        <td className="p-3 align-top text-right whitespace-nowrap">
                                          <div className="flex items-center justify-end space-x-1.5">
                                            <button
                                              onClick={() => flagReview(r.id)}
                                              className="p-1.5 border border-earth-clay/10 bg-white hover:bg-earth-sand cursor-pointer transition-all"
                                              title={r.flagged ? "Unflag review (shows publicly)" : "Flag review (hides from public)"}
                                            >
                                              <Flag className={`h-3.5 w-3.5 ${r.flagged ? "text-red-500 fill-red-500 animate-bounce" : "text-earth-clay hover:text-earth-terracotta"}`} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (window.confirm("Are you sure you want to permanently delete this review? This action is irreversible.")) {
                                                  deleteReview(r.id);
                                                }
                                              }}
                                              className="p-1.5 border border-earth-clay/10 bg-white hover:bg-red-50 hover:text-red-650 hover:border-red-200 transition-all cursor-pointer"
                                              title="Delete review permanently"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-earth-sand/5 border border-dashed border-earth-clay/10 text-earth-clay font-medium">
                              No user reviews found in the database.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-tab: Blogs moderation */}
                      {adminSubTab === "blogs" && (
                        <div className="space-y-4">
                          <p className="text-earth-charcoal/70 font-light leading-relaxed">
                            Moderate traveler blog posts. Flagging hides the story from the community feed. Removing deletes the post permanently.
                          </p>

                          {blogs.length > 0 ? (
                            <div className="space-y-3">
                              {blogs.map((b) => (
                                <div
                                  key={b.id}
                                  className={`p-4 bg-white border border-earth-clay/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-earth-clay/35 transition-all ${
                                    b.flagged ? "bg-red-50/5 border-red-200/50" : ""
                                  }`}
                                >
                                  <div className="flex items-start space-x-4 flex-1">
                                    <div className="h-12 w-20 overflow-hidden border border-earth-clay/10 bg-white shrink-0 shadow-sm">
                                      <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center flex-wrap gap-x-2">
                                        <h4 className="font-serif text-sm font-bold text-earth-charcoal">{b.title}</h4>
                                        {b.flagged && (
                                          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-red-100 border border-red-200 text-red-700 animate-pulse">
                                            🚨 Flagged
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-earth-clay">
                                        By: <span className="font-semibold text-earth-charcoal">{b.author}</span> • Date: {b.date}
                                      </p>
                                      <p className="text-[10px] text-earth-charcoal/70 line-clamp-1 font-light leading-relaxed">
                                        {b.content}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-1.5 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                                    <button
                                      onClick={() => flagBlog(b.id)}
                                      className={`px-3 py-1.5 border text-[10px] uppercase font-bold tracking-wider flex items-center space-x-1 transition-all cursor-pointer bg-white hover:bg-earth-sand ${
                                        b.flagged ? "border-red-200 text-red-750 bg-red-50/20" : "border-earth-clay/15 text-earth-clay"
                                      }`}
                                    >
                                      <Flag className={`h-3 w-3 ${b.flagged ? "text-red-500 fill-red-500" : "text-earth-clay"}`} />
                                      <span>{b.flagged ? "Unflag Story" : "Flag Story"}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to permanently delete this story?")) {
                                          deleteBlog(b.id);
                                        }
                                      }}
                                      className="px-3 py-1.5 border border-red-250 text-red-650 hover:bg-red-50 hover:text-red-700 font-sans text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-earth-sand/5 border border-dashed border-earth-clay/10 text-earth-clay font-medium">
                              No stories (blogs) found in the database.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sub-tab: Add Official Destination */}
                      {adminSubTab === "add_destination" && (
                        <div className="space-y-6 bg-earth-sand/5 p-6 border border-earth-clay/10 animate-in fade-in duration-300">
                          <div className="text-center py-12 space-y-6 max-w-lg mx-auto">
                            <div className="p-3 bg-earth-terracotta/5 border border-earth-terracotta/10 text-earth-terracotta inline-block rounded-full">
                              <Sparkles className="h-8 w-8 text-earth-terracotta" />
                            </div>
                            <h4 className="font-serif text-lg font-bold text-earth-forest">
                              Official Chronicles Portal
                            </h4>
                            <p className="text-xs text-earth-charcoal/60 leading-relaxed font-light">
                              The official travel guide curation tools support full photo galleries, interactive visual coordinates mapping, seasonal best times, how to reach guidelines, and local tips.
                            </p>
                            <p className="text-xs font-semibold text-earth-clay/80">
                              Choose an administrative task below:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                              <Link
                                href="/admin/destinations/new"
                                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-sm rounded-none cursor-pointer"
                              >
                                <span>Publish New Chronicle</span>
                              </Link>
                              
                              <Link
                                href="/admin/destinations"
                                className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 border border-earth-clay/20 hover:border-earth-charcoal bg-white text-earth-charcoal/80 hover:text-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-sm rounded-none cursor-pointer"
                              >
                                <span>Manage & Edit Chronicles</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-28">
            <div className="space-y-3">
              <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-terracotta">
                Honors & Standings
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-earth-forest">
                Explorer Ranks
              </h2>
              <p className="font-sans text-xs text-earth-charcoal/70 font-light leading-relaxed">
                Your rank updates reactively in real-time as you log expenses, map AI trails, or verify gems.
              </p>
            </div>

            <Leaderboard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
