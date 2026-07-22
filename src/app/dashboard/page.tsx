"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import MapPicker from "@/components/MapPicker";
import { CategoryDonutChart } from "@/components/ExpenseCharts";
import { useUser, PlanDay } from "@/components/UserContext";
import { CATEGORIES } from "@/app/data/mockData";
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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-earth-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-terracotta" />
      </div>
    }>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");
  const queryPlanId = searchParams.get("planId");

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
    deleteExpense,
    createCustomTrip,
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
    mySubmissions,
  } = useUser();

  const [activeTab, setActiveTab] = useState<"profile" | "submissions" | "wishlist" | "expenses" | "planner" | "addgem" | "admin">("profile");

  // Admin section sub-navigation states
  const [adminSubTab, setAdminSubTab] = useState<"spots" | "reviews" | "blogs" | "add_destination" | "approved_gems">("spots");
  const hasRedirectedRef = useRef(false);
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

  // Expense Tracker active trip selection ("all" or specific trip ID)
  const [selectedTripId, setSelectedTripId] = useState<string>("all");
  const [targetTripForForm, setTargetTripForForm] = useState<string>("");

  // Sync target trip for form when selectedTripId or journeys change
  useEffect(() => {
    if (selectedTripId !== "all") {
      setTargetTripForForm(selectedTripId);
    } else if (journeys.length > 0 && !targetTripForForm) {
      setTargetTripForForm(journeys[0].id);
    }
  }, [selectedTripId, journeys, targetTripForForm]);

  const activeJourney = journeys.find((j) => j.id === selectedTripId);

  // Expense Tracker Modal / Form State for Custom Trips
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [newTripDest, setNewTripDest] = useState("");
  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripDesc, setNewTripDesc] = useState("");
  const [isSubmittingTrip, setIsSubmittingTrip] = useState(false);

  // Expense Tracker Item Form State
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<"Food" | "Stay" | "Transport" | "Tickets" | "Shopping" | "Other">("Food");
  const [expDesc, setExpDesc] = useState("");

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const tripToUse = selectedTripId === "all" ? targetTripForForm : selectedTripId;
    if (!tripToUse || !expAmount || !expDesc) return;
    await addExpense(tripToUse, Number(expAmount), expCategory, expDesc);
    setExpAmount("");
    setExpDesc("");
  };

  const handleCreateCustomTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripDest.trim()) return;
    setIsSubmittingTrip(true);
    try {
      const createdId = await createCustomTrip({
        destination: newTripDest.trim(),
        title: newTripTitle.trim() || `Trip to ${newTripDest.trim()}`,
        description: newTripDesc.trim() || `Travel expenses and details for ${newTripDest.trim()}`,
      });
      setSelectedTripId(createdId);
      setTargetTripForForm(createdId);
      setNewTripDest("");
      setNewTripTitle("");
      setNewTripDesc("");
      setShowAddTripModal(false);
    } catch (err) {
      console.error("Failed to create custom trip:", err);
    } finally {
      setIsSubmittingTrip(false);
    }
  };

  const selectedTripExpenses =
    selectedTripId === "all"
      ? expenses
      : expenses.filter((e) => e.tripId === selectedTripId);

  const tripRunningTotal = selectedTripExpenses.reduce((sum, curr) => sum + curr.amount, 0);

  // AI Trip Planner Form State
  const [planRegion, setPlanRegion] = useState("Kerala");
  const [planCategories, setPlanCategories] = useState<string[]>([]);
  const [planDays, setPlanDays] = useState(3);
  const [planBudget, setPlanBudget] = useState(25000);
  const [planBudgetStyle, setPlanBudgetStyle] = useState<"Budget" | "Mid-range" | "Luxury">("Mid-range");
  const [plannerStep, setPlannerStep] = useState(1);
  const [streamText, setStreamText] = useState("");
  const [richPlan, setRichPlan] = useState<any>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const saveTripPlanMutation = useMutation(api.trips.saveTripPlan);

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

  // Automatically select the admin tab when logging in as an admin (avoids race conditions)
  useEffect(() => {
    if (currentUser && currentUser.id !== "loading" && !hasRedirectedRef.current) {
      if (currentUser.role === "admin" || currentUser.email?.trim().toLowerCase() === "230107anu@gmail.com") {
        setActiveTab("admin");
      }
      hasRedirectedRef.current = true;
    }
  }, [currentUser]);

  const parseAIResponse = (text: string) => {
    let jsonString = text.trim();
    
    // Try to find a JSON block in the text
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(jsonRegex);
    if (match && match[1]) {
      jsonString = match[1].trim();
    } else {
      // If not enclosed in code block, try to find first '{' and last '}'
      const firstBrace = jsonString.indexOf("{");
      const lastBrace = jsonString.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
    }

    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      return null;
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === "undefined" || !(window as any).puter) {
      setGenError("Puter.js AI library failed to load. Please check your internet connection or reload the page.");
      return;
    }

    setIsGenerating(true);
    setGenError(null);
    setStreamText("");
    setRichPlan(null);
    setSaveSuccess(false);

    const locLower = planRegion.toLowerCase().trim();
    const matchedDestinations = destinations.filter(
      (d) =>
        d.location.toLowerCase().includes(locLower) ||
        d.state.toLowerCase().includes(locLower) ||
        d.title.toLowerCase().includes(locLower)
    );
    const matchedGems = hiddenGems.filter(
      (g) =>
        g.status === "approved" &&
        (g.location.toLowerCase().includes(locLower) ||
          g.state.toLowerCase().includes(locLower) ||
          g.title.toLowerCase().includes(locLower))
    );

    let contextPrompt = "";
    if (matchedDestinations.length > 0 || matchedGems.length > 0) {
      contextPrompt = "Here is verified information about this place from our local database. Please prioritize incorporating these spots/destinations into the itinerary if they fit the travel style:\n";
      matchedDestinations.slice(0, 3).forEach((d) => {
        contextPrompt += `- Destination: "${d.title}" in ${d.location}, ${d.state}. Category: ${d.category}. Description: ${d.description}\n`;
      });
      matchedGems.slice(0, 3).forEach((g) => {
        contextPrompt += `- Hidden Gem: "${g.title}" in ${g.location}, ${g.state}. Category: ${g.category}. Description: ${g.description}\n`;
      });
    }

    const prompt = `You are a local travel assistant and expert planner for SafarNama.
Create a detailed, day-by-day travel itinerary for:
Destination: ${planRegion}
Duration: ${planDays} Days
Budget: ₹${planBudget} (INR)
Budget Style: ${planBudgetStyle}
Vibe/Category filters: ${planCategories.join(", ") || "Any"}

${contextPrompt}

You MUST structure your response as a valid JSON object. Do not include any other markdown text except optionally wrapping the JSON in a standard markdown \`\`\`json code block.

The JSON schema MUST exactly match:
{
  "title": "Itinerary Title",
  "description": "Short overview of the trip and vibe",
  "bestTimeToVisit": "Best months/season to visit",
  "practicalTips": [
    "Practical tips (how to get around, what to book in advance, packing tips)"
  ],
  "days": [
    {
      "dayNumber": 1,
      "title": "Theme of Day 1",
      "activities": [
        {
          "time": "Morning / Afternoon / Evening",
          "title": "Activity name",
          "description": "Detailed description of the activity/spot",
          "location": "Specific place name",
          "cost": 1000
        }
      ],
      "approximateCosts": {
        "transport": 500,
        "food": 500,
        "stay": 1500
      }
    }
  ]
}

Ensure the activities match the specified ${planDays} days. The daily costs (transport, food, stay) should align with the overall "${planBudgetStyle}" budget of ₹${planBudget} for ${planDays} days. All costs should be in Indian Rupees (INR) represented as numbers.
`;

    let response;
    try {
      try {
        response = await (window as any).puter.ai.chat(prompt, {
          model: "claude-3.5-sonnet",
          stream: true,
        });
      } catch (err) {
        console.warn("Generation with claude-3.5-sonnet failed, trying gpt-4o...", err);
        try {
          response = await (window as any).puter.ai.chat(prompt, {
            model: "gpt-4o",
            stream: true,
          });
        } catch (err2) {
          console.warn("Generation with gpt-4o failed, trying default model...", err2);
          response = await (window as any).puter.ai.chat(prompt, {
            stream: true,
          });
        }
      }

      let fullText = "";
      for await (const part of response) {
        if (part?.text) {
          fullText += part.text;
          setStreamText(fullText);
        }
      }

      const parsed = parseAIResponse(fullText);
      if (parsed && parsed.days && Array.isArray(parsed.days)) {
        setRichPlan(parsed);
      } else {
        throw new Error("The AI response did not match the expected itinerary structure. Please try again.");
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      const errMsg = err?.message || err?.description || String(err) || "An unexpected error occurred during AI plan generation.";
      setGenError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!richPlan) return;
    try {
      setGenError(null);
      setSaveSuccess(false);

      const itinerary = richPlan.days.map((day: any) => ({
        dayNumber: day.dayNumber || day.day || 1,
        date: day.date || "",
        activities: (day.activities || []).map((act: any) => ({
          time: act.time || "Morning",
          title: act.title || "Sightseeing",
          description: act.description || "",
          cost: act.cost ? Number(act.cost) : undefined,
          currency: "INR",
          location: act.location || "",
          durationMinutes: act.durationMinutes ? Number(act.durationMinutes) : undefined,
        })),
      }));

      await saveTripPlanMutation({
        title: richPlan.title || `Trip to ${planRegion}`,
        description: richPlan.description || "",
        destination: planRegion,
        isAI: true,
        status: "planning",
        summary: richPlan.description || "",
        itinerary: itinerary,
        travelers: 1,
      });

      setSaveSuccess(true);
    } catch (err: any) {
      console.error("Failed to save trip plan:", err);
      setGenError(err.message || "Failed to save trip plan to your dashboard.");
    }
  };

  const handleViewPlan = (journeyId: string) => {
    const journey = journeys.find((j) => j.id === journeyId);
    if (!journey) return;

    if (journey.rawPlan) {
      const raw = journey.rawPlan;
      setRichPlan({
        title: raw.title || `Trip to ${raw.destination}`,
        description: raw.description || raw.summary || "",
        bestTimeToVisit: raw.bestTimeToVisit || "Varies",
        practicalTips: raw.practicalTips || [],
        days: (raw.itinerary || []).map((day: any) => ({
          dayNumber: day.dayNumber,
          date: day.date,
          activities: day.activities || [],
        })),
      });
      setPlanRegion(raw.destination || "");
      setPlanDays(raw.itinerary ? raw.itinerary.length : 3);
      setStreamText("");
      setGenError(null);
      setSaveSuccess(false);
      setActiveTab("planner");
    } else {
      setRichPlan({
        title: journey.title,
        description: journey.description,
        bestTimeToVisit: "Varies",
        practicalTips: ["Acclimate well", "Book local guides in advance"],
        days: [
          {
            dayNumber: 1,
            activities: journey.stops.map((stop: string, idx: number) => ({
              time: idx === 0 ? "Morning" : idx === 1 ? "Afternoon" : "Evening",
              title: `Explore ${stop}`,
              description: `Visit the local attractions and details for ${stop}.`,
              location: stop,
              cost: 0,
            })),
          },
        ],
      });
      setPlanRegion(journey.stops[0] || "");
      setPlanDays(1);
      setStreamText("");
      setGenError(null);
      setSaveSuccess(false);
      setActiveTab("planner");
    }
  };

  useEffect(() => {
    if (queryTab === "planner" && queryPlanId && journeys.length > 0) {
      handleViewPlan(queryPlanId);
    }
  }, [queryTab, queryPlanId, journeys]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).puter) {
      (window as any).puter.ai.listModels()
        .then((m: any) => console.log("PUTER AI MODELS AVAILABLE:", m))
        .catch((e: any) => console.error("PUTER AI LIST MODELS FAILED:", e));
    }
  }, []);

  // Add Hidden Gem Form State
  const [gemTitle, setGemTitle] = useState("");
  const [gemLocName, setGemLocName] = useState("");
  const [gemState, setGemState] = useState("");
  const [selectedGemCategories, setSelectedGemCategories] = useState<string[]>(["Offbeat"]);
  const [gemDesc, setGemDesc] = useState("");
  const [gemLat, setGemLat] = useState<number>(0);
  const [gemLng, setGemLng] = useState<number>(0);
  const [gemSuccess, setGemSuccess] = useState(false);
  const [gemError, setGemError] = useState<string | null>(null);
  
  // Image URL state and validation helper
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const isValidImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    return /^https?:\/\/.+/i.test(trimmed) || /^data:image\/.+/i.test(trimmed);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-earth-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-terracotta" />
      </div>
    );
  }

  const handleAddGemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gemTitle || !gemLocName || !gemState || !gemDesc || !uploadedImageUrl) {
      setGemError("Please fill in all fields.");
      return;
    }
    if (!isValidImageUrl(uploadedImageUrl)) {
      setGemError("Please enter a valid image URL.");
      return;
    }
    if (selectedGemCategories.length === 0) {
      setGemError("Please select at least one category vibe.");
      return;
    }

    try {
      setGemError(null);
      setGemSuccess(false);

      await submitGem({
        title: gemTitle,
        description: gemDesc,
        location: gemLocName,
        state: gemState,
        category: selectedGemCategories.join(", "),
        photo: uploadedImageUrl,
        geo: { lat: gemLat, lng: gemLng },
      });

      setGemSuccess(true);

      // Reset Form
      setGemTitle("");
      setGemLocName("");
      setGemState("");
      setSelectedGemCategories(["Offbeat"]);
      setGemDesc("");
      setGemLat(0);
      setGemLng(0);
      setUploadedImageUrl("");

      setTimeout(() => {
        setGemSuccess(false);
        // Switch to appropriate tab
        if (currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com") {
          setActiveTab("admin");
        } else {
          setActiveTab("profile");
        }
      }, 4000);
    } catch (err: any) {
      console.error("Error submitting gem:", err);
      setGemError(err.message || "Failed to submit discovery guide.");
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
                { id: "submissions", name: "My Submissions", icon: Compass },
                { id: "wishlist", name: "My Wishlist", icon: Heart },
                { id: "expenses", name: "Expense Visualizer", icon: Activity },
                { id: "planner", name: "AI Local Planner", icon: Route },
                { id: "addgem", name: "Add a Spot Discovery", icon: Plus },
                ...(currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com"
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

              {/* My Submissions Tab */}
              {activeTab === "submissions" && (
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/5 pb-2">
                    My Submissions
                  </h3>
                  
                  {mySubmissions && mySubmissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                      {mySubmissions.map((gem) => (
                        <div
                          key={gem.id}
                          className="bg-earth-sand/20 border border-earth-clay/10 flex flex-col justify-between hover:border-earth-terracotta/30 transition-all duration-300"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {gem.photo ? (
                              <img src={gem.photo} alt={gem.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-earth-sand flex items-center justify-center text-earth-clay/50">No photo available</div>
                            )}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-1 z-10 max-w-[80%]">
                              {(gem.category || "").split(",").map((cat: string) => (
                                <span key={cat} className="bg-earth-sand text-earth-forest border border-earth-clay/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                  {cat.trim()}
                                </span>
                              ))}
                            </div>
                            <div className="absolute top-4 right-4 z-10">
                              {gem.status === "approved" && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-green-200 bg-green-50 text-green-800 shadow-sm">
                                  Approved
                                </span>
                              )}
                              {gem.status === "pending" && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-amber-200 bg-amber-50 text-amber-800 shadow-sm">
                                  Pending
                                </span>
                              )}
                              {gem.status === "rejected" && (
                                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-red-200 bg-red-50 text-red-800 shadow-sm">
                                  Rejected
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-[10px] font-sans text-earth-clay">
                                <span className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span>{gem.location}, {gem.state}</span>
                                </span>
                              </div>
                              <h4 className="font-serif text-base font-bold text-earth-charcoal leading-tight">
                                {gem.title}
                              </h4>
                              <p className="text-xs text-earth-charcoal/70 line-clamp-3 font-light leading-relaxed">
                                {gem.description}
                              </p>
                              
                              {gem.status === "rejected" && gem.rejectionReason && (
                                <div className="mt-2 p-3 bg-red-50/50 border border-red-100 text-[11px] text-red-800 font-sans">
                                  <strong>Reason for rejection:</strong> {gem.rejectionReason}
                                </div>
                              )}
                              
                              {gem.status === "approved" && gem.pointsAwarded && (
                                <div className="mt-2 text-xs text-earth-forest font-semibold flex items-center space-x-1">
                                  <Coins className="h-3.5 w-3.5 text-earth-saffron animate-pulse" />
                                  <span>Awarded +{gem.pointsAwarded} points</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-[10px] text-earth-clay/60 text-right pt-2 border-t border-earth-clay/5">
                              Submitted on {new Date(gem.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5">
                      <Compass className="h-12 w-12 text-earth-clay/25 mx-auto mb-3" />
                      <p className="font-sans text-xs text-earth-charcoal/60 font-light">
                        You haven't submitted any spots yet. Click the "Add a Spot Discovery" tab to submit your first hidden gem!
                      </p>
                    </div>
                  )}
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
                            <div className="absolute top-4 left-4 flex flex-wrap gap-1 z-10 max-w-[80%]">
                              {item.category.split(",").map((cat) => (
                                <span key={cat} className="bg-earth-sand text-earth-forest border border-earth-clay/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                  {cat.trim()}
                                </span>
                              ))}
                            </div>
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
                  {/* Header Bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-earth-clay/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-xl font-bold text-earth-forest">
                          Flexible Trip Expense Tracker
                        </h3>
                        <span className="px-2 py-0.5 bg-earth-terracotta/10 text-earth-terracotta text-[10px] font-bold uppercase tracking-wider rounded-full">
                          Any Location
                        </span>
                      </div>
                      <p className="font-sans text-xs font-light text-earth-charcoal/70">
                        Track expenses for any destination worldwide. Saved automatically to your backend profile.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <label className="text-xs font-bold uppercase tracking-wider text-earth-clay shrink-0">
                          Select View / Trip:
                        </label>
                        <select
                          value={selectedTripId}
                          onChange={(e) => setSelectedTripId(e.target.value)}
                          className="p-2 bg-white border border-earth-clay/20 text-xs font-medium focus:outline-none focus:border-earth-terracotta rounded-none shadow-sm flex-1 sm:flex-none w-full sm:w-[220px] md:w-[260px] truncate"
                        >
                          <option value="all">🌐 All Trips (Combined Summary)</option>
                          <optgroup label="Your Trips & Destinations">
                            {journeys.map((j) => {
                              const displayTitle = j.title.length > 25 ? j.title.substring(0, 23) + "..." : j.title;
                              return (
                                <option key={j.id} value={j.id}>
                                  📍 {displayTitle}
                                </option>
                              );
                            })}
                          </optgroup>
                        </select>
                      </div>

                      <button
                        onClick={() => setShowAddTripModal(true)}
                        className="px-3.5 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Track New Trip</span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Trip Creation Modal */}
                  {showAddTripModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                      <div className="bg-white border border-earth-clay/20 shadow-2xl max-w-md w-full p-6 space-y-5 rounded-none">
                        <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                          <div>
                            <h4 className="font-serif text-lg font-bold text-earth-forest">
                              Track Expenses for a New Trip
                            </h4>
                            <p className="text-[11px] text-earth-clay font-light">
                              Enter any destination or location you are visiting!
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddTripModal(false)}
                            className="text-earth-clay hover:text-earth-charcoal p-1 text-sm font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleCreateCustomTrip} className="space-y-4 font-sans">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Destination / Location Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={newTripDest}
                              onChange={(e) => setNewTripDest(e.target.value)}
                              placeholder="e.g. Paris, France or Goa Beach Vacation"
                              className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Trip Title (Optional)
                            </label>
                            <input
                              type="text"
                              value={newTripTitle}
                              onChange={(e) => setNewTripTitle(e.target.value)}
                              placeholder="e.g. Summer Vacation 2026"
                              className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Description / Notes (Optional)
                            </label>
                            <textarea
                              rows={2}
                              value={newTripDesc}
                              onChange={(e) => setNewTripDesc(e.target.value)}
                              placeholder="e.g. Flight details, stay budget, or solo backpacking notes"
                              className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                            />
                          </div>

                          <div className="flex items-center justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddTripModal(false)}
                              className="px-4 py-2 border border-earth-clay/30 text-earth-charcoal text-xs font-bold uppercase tracking-wider hover:bg-earth-sand/30"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingTrip}
                              className="px-5 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                            >
                              {isSubmittingTrip ? "Creating..." : "Save Trip & Start Tracking"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Main Display Section */}
                  <div className="space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col justify-center">
                        <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                          {selectedTripId === "all" ? "Selected View" : "Trip Destination"}
                        </span>
                        <span className="font-serif text-lg font-bold text-earth-forest mt-1 truncate" title={selectedTripId === "all" ? "All Saved Trips Combined" : activeJourney?.title}>
                          {selectedTripId === "all" ? "All Trips Combined" : (activeJourney?.title || "Custom Trip")}
                        </span>
                      </div>

                      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col justify-center">
                        <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                          {selectedTripId === "all" ? "Total Expenditure (All Trips)" : "Running Cost"}
                        </span>
                        <span className="font-serif text-xl font-bold text-earth-terracotta mt-1 font-mono">
                          ₹{tripRunningTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col justify-center">
                        <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                          {selectedTripId === "all" ? "Total Tracked Trips" : "Recorded Expense Items"}
                        </span>
                        <span className="font-serif text-lg font-bold text-earth-charcoal mt-1">
                          {selectedTripId === "all"
                            ? `${journeys.length} Trips (${expenses.length} Entries)`
                            : `${selectedTripExpenses.length} Entries`}
                        </span>
                      </div>
                    </div>

                    {/* SVG Visualizations */}
                    <div className="max-w-2xl mx-auto w-full">
                      <CategoryDonutChart expenses={selectedTripExpenses} />
                    </div>

                    {/* Split view: Logged Expenses List & Log Expense Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Logged Expenses List */}
                      <div className="space-y-4 font-sans">
                        <div className="flex items-center justify-between border-b border-earth-clay/10 pb-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest">
                            {selectedTripId === "all"
                              ? "Logged Expenses (All Trips)"
                              : `Logged Expenses for ${activeJourney?.title || "Selected Trip"}`}
                          </h4>
                          <span className="text-[10px] text-earth-clay font-mono">
                            {selectedTripExpenses.length} items
                          </span>
                        </div>

                        {selectedTripExpenses.length > 0 ? (
                          <div className="divide-y divide-earth-clay/10 max-h-[360px] overflow-y-auto border border-earth-clay/10 p-2 bg-white">
                            {selectedTripExpenses.map((exp) => {
                              const tripForExp = journeys.find((j) => j.id === exp.tripId);
                              return (
                                <div key={exp.id} className="py-2.5 px-2 flex justify-between items-center text-xs hover:bg-earth-sand/10 transition-colors group">
                                  <div className="space-y-1 flex-1 pr-2">
                                    <div className="flex items-center space-x-1.5">
                                      <span
                                        className="h-2.5 w-2.5 rounded-full shrink-0"
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
                                    <div className="flex items-center space-x-2 text-[9px] text-earth-clay/80 font-light">
                                      <span>{exp.category}</span>
                                      <span>•</span>
                                      <span>{exp.date}</span>
                                      {selectedTripId === "all" && tripForExp && (
                                        <>
                                          <span>•</span>
                                          <span className="bg-earth-sand/50 text-earth-forest px-1 font-medium">
                                            {tripForExp.title}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3 shrink-0">
                                    <span className="font-mono font-bold text-earth-terracotta">
                                      ₹{exp.amount.toLocaleString("en-IN")}
                                    </span>
                                    <button
                                      onClick={() => deleteExpense(exp.id)}
                                      title="Delete Expense"
                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] font-bold p-1 transition-opacity cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-earth-clay/60 border border-dashed border-earth-clay/15 text-xs bg-earth-sand/5">
                            No expenses logged for this selection yet. Use the form to record expenses!
                          </div>
                        )}
                      </div>

                      {/* Log Expense Form */}
                      <form onSubmit={handleAddExpense} className="bg-earth-sand/10 border border-earth-clay/10 p-5 space-y-4 font-sans">
                        <div className="flex items-center justify-between border-b border-earth-clay/10 pb-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest">
                            Log Categorized Expense
                          </h4>
                          <span className="text-[9px] text-earth-clay font-medium uppercase">
                            Backend Saved
                          </span>
                        </div>

                        {/* Trip Selector inside form if viewing All Trips */}
                        {selectedTripId === "all" && (
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Destination / Trip *
                            </label>
                            <select
                              value={targetTripForForm}
                              onChange={(e) => setTargetTripForForm(e.target.value)}
                              className="w-full p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none font-medium"
                            >
                              {journeys.map((j) => (
                                <option key={j.id} value={j.id}>
                                  {j.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Amount (INR ₹) *
                            </label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={expAmount}
                              onChange={(e) => setExpAmount(e.target.value)}
                              placeholder="₹ e.g. 1200"
                              className="w-full p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-charcoal">
                              Category *
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
                            Description *
                          </label>
                          <input
                            type="text"
                            required
                            value={expDesc}
                            onChange={(e) => setExpDesc(e.target.value)}
                            placeholder="e.g. Local seafood dinner or hotel stay"
                            className="w-full p-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer shadow-sm"
                        >
                          Log Expense
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Local Planner Tab */}
              {activeTab === "planner" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-1 border-b border-earth-clay/10 pb-4">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      AI Travel Itinerary Planner
                    </h3>
                    <p className="font-sans text-xs font-light text-earth-charcoal/70 leading-relaxed">
                      Plan your next adventure with the help of Puter's client-side AI. Our planner generates a custom route based on your budget style, vibes, and matches them against SafarNama's local databases!
                    </p>
                  </div>

                  {/* Settings planner form - Multi-step */}
                  {!isGenerating && !richPlan && (
                    <div className="bg-earth-sand/15 border border-earth-clay/10 p-6 space-y-6 font-sans">
                      {/* Step Indicator */}
                      <div className="flex items-center space-x-2 text-xs border-b border-earth-clay/5 pb-3">
                        <span className={`px-2 py-0.5 rounded-none font-bold ${
                          plannerStep === 1 
                            ? "bg-earth-terracotta text-white" 
                            : "bg-earth-clay/10 text-earth-charcoal/60"
                        }`}>
                          Step 1: Details
                        </span>
                        <span className="text-earth-clay/35">→</span>
                        <span className={`px-2 py-0.5 rounded-none font-bold ${
                          plannerStep === 2 
                            ? "bg-earth-terracotta text-white" 
                            : "bg-earth-clay/10 text-earth-charcoal/60"
                        }`}>
                          Step 2: Vibes (Optional)
                        </span>
                      </div>

                      {plannerStep === 1 ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Destination input */}
                            <div ref={suggestionsRef} className="relative space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                Where do you want to go?
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
                                placeholder="e.g. Kerala, Ladakh, Paris, Himalayas..."
                                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none placeholder-earth-charcoal/40 font-sans"
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
                                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-earth-sand/30 text-earth-charcoal hover:text-earth-terracotta transition-colors border-b border-earth-clay/5 last:border-0 font-sans cursor-pointer"
                                    >
                                      🗺️ {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Days Input */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                How many days?
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
                                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none font-sans"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Budget Input */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                What's your budget? (₹ INR)
                              </label>
                              <div className="relative flex items-center">
                                <span className="absolute left-3 text-earth-charcoal/60 font-semibold text-xs select-none">₹</span>
                                <input
                                  type="number"
                                  required
                                  min={1000}
                                  value={planBudget}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPlanBudget(val > 0 ? val : 0);
                                  }}
                                  className="w-full p-2.5 pl-7 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none font-mono font-bold"
                                />
                              </div>
                            </div>

                            {/* Budget Style Select */}
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                Budget Style
                              </label>
                              <select
                                value={planBudgetStyle}
                                onChange={(e) => setPlanBudgetStyle(e.target.value as any)}
                                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none font-semibold text-earth-charcoal/85 font-sans"
                              >
                                <option value="Budget">Budget (Backpacker, homestays, public transit)</option>
                                <option value="Mid-range">Mid-range (Comfortable, cabs, nice hotels)</option>
                                <option value="Luxury">Luxury (Premium, private villas, gourmet dining)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (planRegion.trim()) {
                                  setPlannerStep(2);
                                } else {
                                  alert("Please fill in where you want to go!");
                                }
                              }}
                              className="w-full md:w-auto px-8 py-3.5 bg-earth-terracotta hover:bg-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Choose Vibes</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Vibes Selection */}
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

                          <div className="flex items-center justify-between pt-4 border-t border-earth-clay/5">
                            <button
                              type="button"
                              onClick={() => setPlannerStep(1)}
                              className="px-6 py-3 border border-earth-clay/20 hover:border-earth-terracotta text-earth-charcoal hover:text-earth-terracotta font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              onClick={handleGeneratePlan}
                              disabled={!planRegion.trim()}
                              className="px-8 py-3.5 bg-earth-terracotta hover:bg-earth-forest disabled:bg-earth-clay/40 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Sparkles className="h-4 w-4 text-white shrink-0" />
                              <span>Generate AI Plan</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Generation Stream & Loading State */}
                  {isGenerating && (
                    <div className="space-y-6">
                      <div className="text-center py-8 space-y-4">
                        <Compass className="h-12 w-12 text-earth-terracotta animate-spin mx-auto" />
                        <p className="font-serif text-base font-bold text-earth-forest animate-pulse">
                          SafarNama AI is drafting your customized itinerary...
                        </p>
                        <p className="font-sans text-xs font-light text-earth-charcoal/60">
                          Scanning database guides, verifying hidden gems, and calibrating your budget.
                        </p>
                      </div>

                      {streamText && (
                        <div className="bg-[#fcfaf5] border border-earth-clay/20 p-6 rounded-none font-mono text-xs text-earth-charcoal/80 max-h-[300px] overflow-y-auto shadow-inner leading-relaxed whitespace-pre-wrap">
                          <div className="flex items-center space-x-1.5 text-earth-terracotta border-b border-earth-clay/10 pb-2 mb-3">
                            <span className="h-2 w-2 rounded-full bg-earth-terracotta animate-ping" />
                            <span className="font-sans font-bold uppercase tracking-wider text-[9px]">Live Stream Output</span>
                          </div>
                          {streamText}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Generation Error State */}
                  {genError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-medium font-sans flex items-start gap-2.5">
                      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <span className="font-bold block">AI Generation Error</span>
                        <p>{genError}</p>
                        <button
                          onClick={() => {
                            setGenError(null);
                            setPlannerStep(1);
                            setRichPlan(null);
                          }}
                          className="mt-2 text-earth-terracotta hover:underline font-semibold text-[10px] uppercase tracking-wider block text-left bg-transparent border-0 cursor-pointer"
                        >
                          Reset & Try Again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rich Generated Plan View */}
                  {!isGenerating && richPlan && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      {/* Success Alert */}
                      <div className="p-4 bg-earth-forest/5 border border-earth-forest/20 text-earth-forest text-xs font-medium font-sans flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-earth-saffron animate-bounce" />
                          <span>Plan compiled successfully using Puter AI! Prioritized SafarNama guides & hidden gems.</span>
                        </div>
                        {saveSuccess && (
                          <span className="text-green-700 font-bold bg-green-50 px-2 py-1 border border-green-200 font-sans">
                            Saved to your dashboard!
                          </span>
                        )}
                      </div>

                      {/* Header Overview Card */}
                      <div className="bg-white border border-earth-clay/10 p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-24 w-24 bg-earth-sand/20 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider bg-earth-terracotta/10 text-earth-terracotta">
                              AI-Generated Plan
                            </span>
                            <span className="px-2.5 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider bg-earth-forest/10 text-earth-forest">
                              {planBudgetStyle} style
                            </span>
                          </div>
                          <h4 className="font-serif text-2xl font-bold text-earth-charcoal leading-tight">
                            {richPlan.title}
                          </h4>
                          <p className="font-sans text-sm font-light text-earth-charcoal/80 leading-relaxed">
                            {richPlan.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-earth-clay/5 text-xs font-sans">
                          {richPlan.bestTimeToVisit && (
                            <div className="flex items-start space-x-2 text-earth-charcoal/85">
                              <Calendar className="h-4.5 w-4.5 text-earth-terracotta shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-earth-forest block uppercase text-[9px] tracking-wider">Best Time to Visit</span>
                                <span className="font-light">{richPlan.bestTimeToVisit}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start space-x-2 text-earth-charcoal/85">
                            <Coins className="h-4.5 w-4.5 text-earth-terracotta shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-earth-forest block uppercase text-[9px] tracking-wider">Estimated Total Budget</span>
                              <span className="font-semibold text-earth-terracotta font-mono">₹{planBudget.toLocaleString("en-IN")} (INR)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Practical Tips Card */}
                      {richPlan.practicalTips && richPlan.practicalTips.length > 0 && (
                        <div className="bg-earth-sand/15 border border-earth-clay/10 p-6 space-y-4">
                          <h5 className="font-serif text-sm font-bold text-earth-forest flex items-center gap-1.5 uppercase tracking-wider">
                            💡 Practical Tips & Booking Guide
                          </h5>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 font-sans">
                            {richPlan.practicalTips.map((tip: string, idx: number) => (
                              <li key={idx} className="text-xs text-earth-charcoal/80 font-light flex items-start gap-2">
                                <span className="text-earth-terracotta font-bold select-none">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Day by Day Cards Roadmap */}
                      <div className="space-y-6">
                        <h5 className="font-serif text-base font-bold text-earth-forest border-b border-earth-clay/10 pb-2">
                          Day-by-Day Timeline
                        </h5>
                        <div className="space-y-6">
                          {richPlan.days.map((day: any, dIdx: number) => {
                            const dailyTotal = 
                              (day.approximateCosts?.transport || 0) +
                              (day.approximateCosts?.food || 0) +
                              (day.approximateCosts?.stay || 0);

                            return (
                              <div key={dIdx} className="bg-white border border-earth-clay/15 shadow-sm overflow-hidden">
                                {/* Day Header */}
                                <div className="bg-earth-sand/30 border-b border-earth-clay/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h6 className="font-serif text-base font-bold text-earth-charcoal flex items-center gap-2">
                                    <span className="bg-earth-terracotta text-white rounded-none px-2 py-0.5 text-xs font-sans font-bold">
                                      Day {day.dayNumber || day.day || (dIdx + 1)}
                                    </span>
                                    <span>{day.title || `Exploring the Vibe`}</span>
                                  </h6>
                                  {dailyTotal > 0 && (
                                    <div className="font-sans text-[11px] font-semibold text-earth-clay">
                                      Estimated Cost: <span className="font-mono text-earth-terracotta font-bold">₹{dailyTotal.toLocaleString("en-IN")}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Day Activities List */}
                                <div className="p-5 space-y-5 divide-y divide-earth-clay/5">
                                  {(day.activities || []).map((activity: any, actIdx: number) => (
                                    <div key={actIdx} className={`space-y-2 font-sans ${actIdx > 0 ? "pt-4" : ""}`}>
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                        <div className="flex items-center space-x-2">
                                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-earth-forest text-white">
                                            {activity.time || "Activity"}
                                          </span>
                                          <span className="font-serif text-sm font-bold text-earth-charcoal">
                                            {activity.title}
                                          </span>
                                        </div>
                                        {activity.cost > 0 && (
                                          <span className="text-[10px] font-semibold text-earth-clay bg-earth-sand px-2 py-0.5 font-mono">
                                            Cost: ₹{activity.cost}
                                          </span>
                                        )}
                                      </div>

                                      <p className="text-xs text-earth-charcoal/70 font-light leading-relaxed pl-1">
                                        {activity.description}
                                      </p>

                                      {activity.location && (
                                        <div className="text-[10px] text-earth-clay font-medium flex items-center space-x-1 pl-1">
                                          <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                                          <span>{activity.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Daily Cost Breakdown Badges */}
                                {day.approximateCosts && (
                                  <div className="bg-stone-50 border-t border-earth-clay/5 p-4 flex flex-wrap gap-4 text-[10px] text-earth-charcoal/80 font-sans">
                                    <span className="font-bold text-earth-forest uppercase tracking-wider self-center">Daily Expenses:</span>
                                    <span className="bg-white border border-earth-clay/10 px-2.5 py-1 flex items-center gap-1.5">
                                      🚗 Transport: <span className="font-mono font-semibold text-earth-terracotta">₹{day.approximateCosts.transport || 0}</span>
                                    </span>
                                    <span className="bg-white border border-earth-clay/10 px-2.5 py-1 flex items-center gap-1.5">
                                      🍲 Food: <span className="font-mono font-semibold text-earth-terracotta">₹{day.approximateCosts.food || 0}</span>
                                    </span>
                                    <span className="bg-white border border-earth-clay/10 px-2.5 py-1 flex items-center gap-1.5">
                                      🏨 Stay: <span className="font-mono font-semibold text-earth-terracotta">₹{day.approximateCosts.stay || 0}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Planner Action Footer Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-earth-clay/10">
                        <button
                          onClick={() => {
                            setRichPlan(null);
                            setStreamText("");
                            setPlannerStep(1);
                            setSaveSuccess(false);
                          }}
                          className="w-full sm:w-auto px-6 py-3 border border-earth-clay/30 hover:border-earth-terracotta hover:text-earth-terracotta text-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 bg-transparent"
                        >
                          <Route className="h-4 w-4 shrink-0" />
                          <span>Plan Another Trip</span>
                        </button>
                        <button
                          onClick={handleSavePlan}
                          disabled={saveSuccess}
                          className="w-full sm:w-auto px-6 py-3 bg-earth-forest hover:bg-earth-terracotta disabled:bg-earth-clay/30 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Gift className="h-4 w-4 shrink-0" />
                          <span>{saveSuccess ? "Saved to Dashboard" : "Save this plan"}</span>
                        </button>
                        <button
                          onClick={handleGeneratePlan}
                          className="w-full sm:w-auto px-6 py-3 bg-earth-terracotta hover:bg-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
                          <span>Regenerate Plan</span>
                        </button>
                      </div>
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

                  {gemSuccess && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-2 rounded-none animate-in fade-in duration-300">
                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      <span>Your Spot Discovery has been submitted successfully! The destination will appear on the map and lists once the administrator reviews and approves it.</span>
                    </div>
                  )}

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

                    {gemError && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center space-x-2 rounded-none animate-in fade-in duration-300">
                        <ShieldAlert className="h-5 w-5 text-red-650 shrink-0" />
                        <span>{gemError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Title */}
                      <div className="space-y-1 md:col-span-1">
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

                      {/* Vibe Category Selector (Multi-select) */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Vibe Categories (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-1.5 p-3 bg-earth-sand/5 border border-earth-clay/20 max-h-[120px] overflow-y-auto">
                          {CATEGORIES.filter((c) => c !== "All").map((cat) => {
                            const isSelected = selectedGemCategories.includes(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedGemCategories(selectedGemCategories.filter((c) => c !== cat));
                                  } else {
                                    setSelectedGemCategories([...selectedGemCategories, cat]);
                                  }
                                }}
                                className={`px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider transition-all border rounded-none cursor-pointer ${
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
                      <div className="md:col-span-2 space-y-1">
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

                      {/* Latitude */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Latitude Coordinate *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={gemLat === 0 ? "" : gemLat}
                          onChange={(e) => setGemLat(Number(e.target.value))}
                          placeholder="e.g. 33.1711"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                        />
                      </div>

                      {/* Longitude */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Longitude Coordinate *
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={gemLng === 0 ? "" : gemLng}
                          onChange={(e) => setGemLng(Number(e.target.value))}
                          placeholder="e.g. 77.2356"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta rounded-none"
                        />
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
                          ⚠️ Please enter a valid image URL starting with http:// or https://.
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
                      disabled={!gemTitle || !gemLocName || !gemState || !gemDesc || !uploadedImageUrl || !isValidImageUrl(uploadedImageUrl) || selectedGemCategories.length === 0}
                      className="w-full py-3 bg-earth-forest hover:bg-earth-terracotta disabled:bg-earth-clay/30 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-colors cursor-pointer shadow-md"
                    >
                      Submit Discovery Guide
                    </button>
                  </form>
                </div>
              )}

              {/* Admin Sandbox queue tab */}
              {activeTab === "admin" && (() => {
                const isUserAdmin = currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com";

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
                        { id: "approved_gems", name: "Manage Approved Gems" },
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
                                          {g.category.split(",").map((cat) => (
                                            <span key={cat} className="px-2 py-0.5 text-[9px] uppercase font-bold bg-earth-sand border border-earth-clay/10 text-earth-clay">
                                              {cat.trim()}
                                            </span>
                                          ))}
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

                      {/* Sub-tab: Manage Approved Gems */}
                      {adminSubTab === "approved_gems" && (
                        <div className="space-y-6 bg-earth-sand/5 p-6 border border-earth-clay/10 animate-in fade-in duration-300">
                          <div className="text-center py-12 space-y-6 max-w-lg mx-auto">
                            <div className="p-3 bg-earth-terracotta/5 border border-earth-terracotta/10 text-earth-terracotta inline-block rounded-full">
                              <Sparkles className="h-8 w-8 text-earth-terracotta" />
                            </div>
                            <h4 className="font-serif text-lg font-bold text-earth-forest">
                              Approved Gems Portal
                            </h4>
                            <p className="text-xs text-earth-charcoal/60 leading-relaxed font-light">
                              Manage and edit community-submitted hidden gems that are already live on the platform. Modify details or unpublish/delete them from the catalog.
                            </p>
                            <div className="flex justify-center pt-2">
                              <Link
                                href="/admin/hidden-gems"
                                className="inline-flex items-center justify-center space-x-2 px-8 py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-sm rounded-none cursor-pointer"
                              >
                                <span>Manage & Edit Approved Gems</span>
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
