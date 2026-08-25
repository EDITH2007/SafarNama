"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Navbar from "@/components/Navbar";
import ExplorerBadge from "@/components/badges/ExplorerBadge";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import MapPicker from "@/components/MapPicker";
import { CategoryDonutChart } from "@/components/ExpenseCharts";
import { useUser, PlanDay } from "@/components/UserContext";
import { CATEGORIES } from "@/app/data/mockData";
import VerificationStepper from "@/components/VerificationStepper";
import {
  Compass,
  Gift,
  Route,
  BookOpen,
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
  Activity,
  Award,
  ShieldAlert,
  Trash2,
  Flag,
  ChevronRight,
  User,
  Globe,
  DollarSign,
  Hotel,
  Ticket,
  Search,
  Wallet as WalletIcon,
  BookMarked,
  ArrowUpRight,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-earth-sand flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-terracotta" />
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  );
}

type MainTab = "explore" | "trips" | "wallet" | "guides" | "profile";

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
    leaderboard,
    pointsLedger,
    wishlist,
    toggleWishlist,
    savedItineraries,
    toggleSaveItinerary,
    isItinerarySaved,
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
    pendingJourneys,
    submitJourney,
    approveJourney,
    rejectJourney,
    updateUserPreferences,
  } = useUser();

  const savedJourneys = useMemo(() => {
    return journeys.filter((j) => isItinerarySaved(j.id));
  }, [journeys, isItinerarySaved]);

  const [savedFilter, setSavedFilter] = useState<"All" | "Custom Plans" | "Official Guides" | "Community Routes">("All");

  const filteredSavedJourneys = useMemo(() => {
    if (savedFilter === "Custom Plans") {
      return savedJourneys.filter((j) => j.type === "Custom Plan" || j.type === "AI-Generated");
    }
    if (savedFilter === "Official Guides") {
      return savedJourneys.filter((j) => j.type === "Official Guide");
    }
    if (savedFilter === "Community Routes") {
      return savedJourneys.filter((j) => j.type === "Community Route" || j.type === "Manual");
    }
    return savedJourneys;
  }, [savedJourneys, savedFilter]);

  // 5 Top-Level Tabs State
  const [activeTab, setActiveTab] = useState<MainTab>("explore");

  // Explore sub-views ("browse" | "planner" | "addgem" | "addjourney" | "writeblog")
  const [exploreSubView, setExploreSubView] = useState<"browse" | "planner" | "addgem" | "addjourney" | "writeblog">("browse");

  // My Trips sub-tabs ("itineraries" | "expenses" | "wishlist" | "stays" | "cancellations")
  const [tripsSubTab, setTripsSubTab] = useState<"itineraries" | "expenses" | "wishlist" | "stays" | "cancellations">("itineraries");

  // Admin sub-navigation state
  const [adminSubTab, setAdminSubTab] = useState<"spots" | "reviews" | "blogs" | "add_destination" | "approved_gems" | "journeys">("spots");
  const hasRedirectedRef = useRef(false);
  const [activeRejectionGemId, setActiveRejectionGemId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<{ [gemId: string]: string }>({});
  const [isAdminOverride, setIsAdminOverride] = useState(false);

  // Preference update notification
  const [prefSaveMsg, setPrefSaveMsg] = useState<string | null>(null);
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);

  // Search & Filter state for Explore tab
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreCategory, setExploreCategory] = useState("All");

  // Handle URL Query Sync & Backward Compatibility
  useEffect(() => {
    if (queryTab) {
      if (queryTab === "planner") {
        setActiveTab("explore");
        setExploreSubView("planner");
      } else if (queryTab === "addgem") {
        setActiveTab("explore");
        setExploreSubView("addgem");
      } else if (queryTab === "addjourney") {
        setActiveTab("explore");
        setExploreSubView("addjourney");
      } else if (queryTab === "writeblog") {
        setActiveTab("explore");
        setExploreSubView("writeblog");
      } else if (queryTab === "expenses") {
        setActiveTab("trips");
        setTripsSubTab("expenses");
      } else if (queryTab === "wishlist") {
        setActiveTab("trips");
        setTripsSubTab("wishlist");
      } else if (queryTab === "submissions") {
        setActiveTab("profile");
      } else if (queryTab === "admin") {
        setActiveTab("profile");
      } else if (["explore", "trips", "wallet", "guides", "profile"].includes(queryTab)) {
        setActiveTab(queryTab as MainTab);
      }
    }
  }, [queryTab]);

  // Moderation Sandbox list
  const pendingGems = useMemo(() => {
    if (!hiddenGems) return [];
    return hiddenGems.filter(
      (g) => g.status === "pending" || g.status === "submitted" || g.status === "in_review"
    );
  }, [hiddenGems]);

  const markGemsInReview = useMutation(api.gems.markGemsInReview);

  useEffect(() => {
    const isUserAdmin = currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com";
    if (isUserAdmin && activeTab === "profile" && adminSubTab === "spots" && pendingGems.length > 0) {
      const submittedGemIds = pendingGems
        .filter((g) => g.status === "submitted")
        .map((g) => g.id);

      if (submittedGemIds.length > 0) {
        markGemsInReview({ ids: submittedGemIds as any[] }).catch((err) => {
          console.error("Failed to mark gems in review:", err);
        });
      }
    }
  }, [activeTab, adminSubTab, pendingGems, currentUser, markGemsInReview]);

  const [activeRejectionJourneyId, setActiveRejectionJourneyId] = useState<string | null>(null);

  // Add Journey Form State
  const [jTitle, setJTitle] = useState("");
  const [jDesc, setJDesc] = useState("");
  const [jDuration, setJDuration] = useState("");
  const [stopsList, setStopsList] = useState<string[]>([""]);
  const [jSuccess, setJSuccess] = useState(false);
  const [jError, setJError] = useState("");
  const [jLoading, setJLoading] = useState(false);

  // Add Blog Form State
  const [bTitle, setBTitle] = useState("");
  const [bContent, setBContent] = useState("");
  const [bCover, setBCover] = useState("");
  const [bSuccess, setBSuccess] = useState(false);
  const [bError, setBError] = useState("");
  const [bLoading, setBLoading] = useState(false);

  // Wishlist resolution helper
  const resolvedWishlistItems = useMemo(() => {
    return [
      ...destinations.map((d) => ({ ...d, type: "official" as const })),
      ...hiddenGems.map((g) => ({ ...g, type: "gem" as const })),
    ].filter((item) => wishlist.includes(item.id));
  }, [destinations, hiddenGems, wishlist]);

  // Combined Explore items for Explore tab
  const filteredExploreItems = useMemo(() => {
    const allItems = [
      ...destinations.map((d) => ({ ...d, itemType: "official" as const })),
      ...hiddenGems
        .filter((g) => g.status === "approved" || g.status === "verified")
        .map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          location: `${g.location}, ${g.state}`,
          state: g.state,
          category: g.category,
          photos: [g.photo],
          itemType: "gem" as const,
        })),
    ];

    return allItems.filter((item) => {
      const matchesSearch =
        !exploreSearch ||
        item.title.toLowerCase().includes(exploreSearch.toLowerCase()) ||
        item.location.toLowerCase().includes(exploreSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(exploreSearch.toLowerCase());

      const matchesCat =
        exploreCategory === "All" ||
        item.category.toLowerCase().includes(exploreCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [destinations, hiddenGems, exploreSearch, exploreCategory]);

  const filteredOfficialItems = useMemo(
    () => filteredExploreItems.filter((item) => item.itemType === "official"),
    [filteredExploreItems]
  );

  const filteredGemItems = useMemo(
    () => filteredExploreItems.filter((item) => item.itemType === "gem"),
    [filteredExploreItems]
  );

  // Expense Tracker active trip selection ("all" or specific trip ID)
  const [selectedTripId, setSelectedTripId] = useState<string>("all");
  const [targetTripForForm, setTargetTripForForm] = useState<string>("");

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
  const [expCategory, setExpCategory] = useState<
    "Food" | "Stay" | "Transport" | "Tickets" | "Shopping" | "Other"
  >("Food");
  const [expDesc, setExpDesc] = useState("");

  const handleAddJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTitle.trim() || !jDesc.trim() || !jDuration.trim()) {
      setJError("Please fill out all required fields.");
      return;
    }
    const filteredStops = stopsList.map((s) => s.trim()).filter(Boolean);
    if (filteredStops.length === 0) {
      setJError("Please add at least one stop for your journey.");
      return;
    }
    setJLoading(true);
    setJError("");
    setJSuccess(false);
    try {
      await submitJourney({
        title: jTitle,
        description: jDesc,
        duration: jDuration,
        stops: filteredStops,
      });
      setJSuccess(true);
      setJTitle("");
      setJDesc("");
      setJDuration("");
      setStopsList([""]);
    } catch (err: any) {
      setJError(err.message || "Failed to submit journey. Please try again.");
    } finally {
      setJLoading(false);
    }
  };

  const handleAddBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bContent.trim()) {
      setBError("Please fill out all required fields.");
      return;
    }
    setBLoading(true);
    setBError("");
    setBSuccess(false);
    try {
      await addBlog({
        title: bTitle,
        content: bContent,
        coverImage:
          bCover.trim() ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      });
      setBSuccess(true);
      setBTitle("");
      setBContent("");
      setBCover("");
    } catch (err: any) {
      setBError(err.message || "Failed to publish blog post.");
    } finally {
      setBLoading(false);
    }
  };

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
        description:
          newTripDesc.trim() || `Travel expenses and details for ${newTripDest.trim()}`,
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
  const [planBudgetStyle, setPlanBudgetStyle] = useState<"Budget" | "Mid-range" | "Luxury">(
    "Mid-range"
  );
  const [plannerStep, setPlannerStep] = useState(1);
  const [streamText, setStreamText] = useState("");
  const [richPlan, setRichPlan] = useState<any>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const saveTripPlanMutation = useMutation(api.trips.saveTripPlan);

  const allRegionSuggestions = useMemo(() => {
    const list = new Set<string>();
    destinations.forEach((d) => {
      if (d.location) list.add(d.location.trim());
      if (d.state) list.add(d.state.trim());
    });
    hiddenGems.forEach((g) => {
      if (g.status === "approved" || g.status === "verified") {
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

  const parseAIResponse = (text: string) => {
    let jsonString = text.trim();
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(jsonRegex);
    if (match && match[1]) {
      jsonString = match[1].trim();
    } else {
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
      setGenError("Puter.js AI library failed to load. Please check internet connection.");
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
        (g.status === "approved" || g.status === "verified") &&
        (g.location.toLowerCase().includes(locLower) ||
          g.state.toLowerCase().includes(locLower) ||
          g.title.toLowerCase().includes(locLower))
    );

    let contextPrompt = "";
    if (matchedDestinations.length > 0 || matchedGems.length > 0) {
      contextPrompt =
        "Here is verified information about this place from our local database. Please incorporate these spots into the itinerary if they fit:\n";
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
Ensure costs are in INR numbers.`;

    let response;
    try {
      try {
        response = await (window as any).puter.ai.chat(prompt, {
          model: "claude-3.5-sonnet",
          stream: true,
        });
      } catch (err) {
        try {
          response = await (window as any).puter.ai.chat(prompt, {
            model: "gpt-4o",
            stream: true,
          });
        } catch (err2) {
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
        throw new Error("The AI response did not match the expected itinerary structure.");
      }
    } catch (err: any) {
      console.warn("Puter AI unavailable or requires auth, using SafarNama local AI planner engine:", err);
      // Fallback to local AI generator engine
      const localDays = generateAILocalPlan(planRegion, planCategories, planDays);
      const generatedDays = Array.from({ length: planDays }, (_, idx) => {
        const dayNum = idx + 1;
        const dayItems = localDays.filter((d) => d.day === dayNum);
        return {
          dayNumber: dayNum,
          title: `Exploring ${planRegion} - Day ${dayNum}`,
          activities: dayItems.length > 0
            ? dayItems.map((item, iIdx) => ({
                time: iIdx === 0 ? "Morning" : iIdx === 1 ? "Afternoon" : "Evening",
                title: item.title,
                description: item.description,
                location: item.location,
                cost: Math.round(planBudget / (planDays * 2)),
              }))
            : [
                {
                  time: "Morning",
                  title: `Sightseeing in ${planRegion}`,
                  description: `Explore the top local landmarks, markets, and scenic viewpoints in ${planRegion}.`,
                  location: planRegion,
                  cost: Math.round(planBudget / (planDays * 3)),
                },
                {
                  time: "Afternoon",
                  title: `Local Cuisine & Cultural Walk`,
                  description: `Sample traditional dishes and visit heritage markets around ${planRegion}.`,
                  location: planRegion,
                  cost: Math.round(planBudget / (planDays * 4)),
                },
              ],
          approximateCosts: {
            transport: Math.round((planBudget * 0.25) / planDays),
            food: Math.round((planBudget * 0.35) / planDays),
            stay: Math.round((planBudget * 0.40) / planDays),
          },
        };
      });

      setRichPlan({
        title: `${planDays}-Day Custom ${planBudgetStyle} Itinerary for ${planRegion}`,
        description: `A custom-tailored ${planDays}-day travel itinerary for ${planRegion} optimized for your ${planBudgetStyle.toLowerCase()} budget (₹${planBudget.toLocaleString("en-IN")}) and ${planCategories.join(", ") || "explore"} vibe preferences.`,
        bestTimeToVisit: "October to March (Recommended)",
        practicalTips: [
          "Book local transport and accommodations in advance for better deals",
          "Carry cash currency for regional markets and small vendors",
          "Engage verified local guides when visiting offbeat hidden gems",
        ],
        days: generatedDays,
      });
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

      const title = richPlan.title || `Trip to ${planRegion}`;

      if (currentUser && currentUser.id !== "loading") {
        const newId = await saveTripPlanMutation({
          title,
          description: richPlan.description || "",
          destination: planRegion,
          isAI: true,
          isCustom: true,
          status: "planning",
          summary: richPlan.description || "",
          itinerary: itinerary,
          travelers: 1,
        });
        if (newId) {
          setRichPlan((prev: any) => ({ ...prev, id: newId }));
        }
      } else {
        const stops = Array.from(
          new Set(
            itinerary.flatMap((d: any) =>
              d.activities.map((a: any) => a.location).filter(Boolean)
            )
          )
        ).slice(0, 5);

        if (stops.length === 0 && planRegion) {
          stops.push(planRegion);
        }

        const localId = addTrip({
          title,
          duration: `${itinerary.length} ${itinerary.length === 1 ? "Day" : "Days"}`,
          type: "Custom Plan",
          description: richPlan.description || "",
          stops: stops as string[],
          rawPlan: {
            _id: "temp",
            title,
            destination: planRegion,
            description: richPlan.description || "",
            itinerary: itinerary,
            isAI: true,
            isCustom: true,
            status: "planning",
          },
        });
        
        setRichPlan((prev: any) => ({ ...prev, id: localId }));
      }

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
        id: journey.id,
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
      setActiveTab("explore");
      setExploreSubView("planner");
    } else {
      setRichPlan({
        id: journey.id,
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
      setActiveTab("explore");
      setExploreSubView("planner");
    }
  };

  useEffect(() => {
    if (queryTab === "planner" && queryPlanId && journeys.length > 0) {
      handleViewPlan(queryPlanId);
    }
  }, [queryTab, queryPlanId, journeys]);

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
        setExploreSubView("browse");
      }, 4000);
    } catch (err: any) {
      console.error("Error submitting gem:", err);
      setGemError(err.message || "Failed to submit discovery guide.");
    }
  };

  const renderTierBadge = (tier: "Bronze" | "Silver" | "Gold" | "Platinum") => {
    return <ExplorerBadge tier={tier} size={32} showTooltip showLabel />;
  };

  const hasSubmittedGem = hiddenGems.some((g) => g.submittedBy === currentUser.name);
  const hasWrittenReview =
    reviews.some((r) => r.author === currentUser.name) ||
    blogs.some((b) => b.author === currentUser.name);
  const isGoldOrSilver =
    currentUser.tier === "Gold" || currentUser.tier === "Silver" || currentUser.tier === "Platinum";

  // Preference Change Handler
  const handlePreferenceChange = async (key: "language" | "currency", val: string) => {
    setIsUpdatingPrefs(true);
    setPrefSaveMsg(null);
    try {
      await updateUserPreferences({ [key]: val });
      setPrefSaveMsg(`Preference updated successfully: ${key.toUpperCase()} set to ${val}`);
      setTimeout(() => setPrefSaveMsg(null), 3000);
    } catch (err: any) {
      console.error("Failed to update user preferences:", err);
    } finally {
      setIsUpdatingPrefs(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans pb-20 md:pb-0">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Profile Card Banner */}
        <div className="bg-[#1c3d27] text-white p-6 md:p-10 mb-8 border border-earth-clay/10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 md:pt-0">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-earth-saffron/10 border-2 border-earth-saffron/40 flex items-center justify-center text-xl md:text-2xl font-bold text-earth-saffron font-serif shadow-inner shrink-0">
                {currentUser.avatar}
              </div>

              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
                    {currentUser.name}
                  </h1>
                  {currentUser.isVerified && (
                    <span title="Verified Explorer Badge">
                      <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-400 fill-[#1c3d27] shrink-0" />
                    </span>
                  )}
                  <button
                    onClick={() => logout()}
                    className="ml-2 px-2.5 py-1 border border-white/20 bg-white/5 hover:bg-red-650 text-white font-sans text-[10px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
                <p className="text-xs text-earth-sand/70 font-light max-w-md">
                  From {currentUser.homeTown} • {currentUser.bio}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                  {renderTierBadge(currentUser.tier)}
                  <span className="text-[10px] text-earth-saffron font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 border border-white/10">
                    {currentUser.language?.toUpperCase() || "EN"} • {currentUser.currency || "INR"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/5 p-4 md:p-5 flex flex-col items-center justify-center min-w-[180px] text-center shrink-0">
              <Coins className="h-7 w-7 text-earth-saffron mb-1 animate-pulse" />
              <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-earth-saffron">
                Explorer Points
              </span>
              <span className="font-serif text-3xl font-bold text-white mt-0.5">
                {currentUser.points} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Persistent Tab Bar (Desktop: Top bar matching nav style) */}
        <div className="w-full bg-white border border-earth-clay/10 shadow-sm mb-8">
          {/* Top persistent tab bar for Desktop (md+) */}
          <div className="hidden md:flex border-b border-earth-clay/10 bg-earth-sand/20 px-4">
            {[
              { id: "explore" as const, name: "Explore", icon: Compass },
              { id: "trips" as const, name: "My Trips", icon: Route },
              { id: "wallet" as const, name: "Wallet", icon: WalletIcon },
              { id: "guides" as const, name: "Guides", icon: BookOpen },
              { id: "profile" as const, name: "Profile", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-sans text-xs font-bold uppercase tracking-widest border-b-2 -mb-[1px] transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-earth-terracotta text-earth-terracotta bg-white shadow-sm"
                      : "border-transparent text-earth-charcoal/60 hover:text-earth-charcoal hover:bg-earth-sand/40"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-earth-terracotta" : ""}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area for the Active Tab */}
          <div className="p-6 md:p-8">

            {/* TAB 1: EXPLORE */}
            {activeTab === "explore" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Explore Sub-view Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-clay/10 pb-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-earth-forest">
                      Travel Discovery & Planning
                    </h2>
                    <p className="font-sans text-xs text-earth-charcoal/70 font-light">
                      Browse offbeat hidden gems, official guides, and launch AI trip itineraries.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setExploreSubView("browse")}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                        exploreSubView === "browse"
                          ? "bg-earth-forest text-white border-earth-forest"
                          : "bg-white text-earth-charcoal border-earth-clay/20 hover:border-earth-forest"
                      }`}
                    >
                      🗺️ Catalog
                    </button>
                    <button
                      onClick={() => setExploreSubView("planner")}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer flex items-center space-x-1 ${
                        exploreSubView === "planner"
                          ? "bg-earth-terracotta text-white border-earth-terracotta"
                          : "bg-white text-earth-charcoal border-earth-clay/20 hover:border-earth-terracotta"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Planner</span>
                    </button>
                    <button
                      onClick={() => setExploreSubView("addgem")}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer flex items-center space-x-1 ${
                        exploreSubView === "addgem"
                          ? "bg-earth-terracotta text-white border-earth-terracotta"
                          : "bg-white text-earth-charcoal border-earth-clay/20 hover:border-earth-terracotta"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Spot</span>
                    </button>
                    <button
                      onClick={() => setExploreSubView("addjourney")}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                        exploreSubView === "addjourney"
                          ? "bg-earth-forest text-white border-earth-forest"
                          : "bg-white text-earth-charcoal border-earth-clay/20 hover:border-earth-forest"
                      }`}
                    >
                      Share Route
                    </button>
                    <button
                      onClick={() => setExploreSubView("writeblog")}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                        exploreSubView === "writeblog"
                          ? "bg-earth-forest text-white border-earth-forest"
                          : "bg-white text-earth-charcoal border-earth-clay/20 hover:border-earth-forest"
                      }`}
                    >
                      Write Story
                    </button>
                  </div>
                </div>

                {/* Sub-view: Catalog Browsing */}
                {exploreSubView === "browse" && (
                  <div className="space-y-8">
                    {/* Hero Entry Card into AI Trip Planner */}
                    <div className="bg-gradient-to-r from-[#1c3d27] to-[#2c5d3d] text-white p-6 md:p-8 border border-earth-clay/20 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center md:text-left z-10">
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <Sparkles className="h-5 w-5 text-earth-saffron animate-bounce" />
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-earth-saffron">
                            Client-Side AI Assistant
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl font-bold">
                          Craft Your Custom Travel Itinerary
                        </h3>
                        <p className="text-xs text-earth-sand/80 font-light max-w-xl leading-relaxed">
                          Enter your destination, budget style, and vibe preference to automatically compile an optimized day-by-day route with local tips using Puter AI.
                        </p>
                      </div>
                      <button
                        onClick={() => setExploreSubView("planner")}
                        className="px-6 py-3.5 bg-earth-terracotta hover:bg-earth-saffron hover:text-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shrink-0 shadow-lg flex items-center space-x-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Launch AI Trip Planner</span>
                      </button>
                    </div>

                    {/* Search & Category Filter Bar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-earth-sand/30 p-4 border border-earth-clay/10">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-clay/50" />
                        <input
                          type="text"
                          value={exploreSearch}
                          onChange={(e) => setExploreSearch(e.target.value)}
                          placeholder="Search places, states, valleys, or activities..."
                          className="w-full pl-9 pr-4 py-2 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta font-sans"
                        />
                      </div>

                      <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
                        {["All", "Hills", "Beaches", "Heritage", "Wildlife", "Offbeat"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setExploreCategory(cat)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border cursor-pointer ${
                              exploreCategory === cat
                                ? "bg-earth-terracotta text-white border-earth-terracotta"
                                : "bg-white text-earth-charcoal/80 border-earth-clay/15 hover:border-earth-terracotta"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 1: Recommended for You (Official Chronicles) */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-earth-terracotta" />
                            <h3 className="font-serif text-lg font-bold text-earth-forest">
                              Recommended for You
                            </h3>
                          </div>
                          <p className="text-xs text-earth-charcoal/60 font-light mt-0.5">
                            Curated official regional travel guides for India&apos;s iconic regions
                          </p>
                        </div>
                        <Link
                          href="/destinations"
                          className="text-xs font-bold uppercase tracking-wider text-earth-terracotta hover:text-earth-forest flex items-center space-x-1 transition-colors shrink-0"
                        >
                          <span>View All</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {filteredOfficialItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {filteredOfficialItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border border-earth-clay/10 flex flex-col justify-between hover:border-earth-terracotta/40 transition-all duration-300 shadow-sm group"
                            >
                              <div className="relative aspect-[16/10] overflow-hidden bg-earth-sand">
                                {item.photos?.[0] ? (
                                  <img
                                    src={item.photos[0]}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-earth-clay/40 text-xs">
                                    No image available
                                  </div>
                                )}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10 max-w-[75%]">
                                  {item.category.split(",").map((cat) => (
                                    <span
                                      key={cat}
                                      className="bg-earth-sand/90 text-earth-forest border border-earth-clay/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm"
                                    >
                                      {cat.trim()}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  onClick={() => toggleWishlist(item.id)}
                                  className={`absolute top-3 right-3 p-2 rounded-full transition-all cursor-pointer shadow-md ${
                                    wishlist.includes(item.id)
                                      ? "bg-red-500 text-white"
                                      : "bg-white/80 text-earth-charcoal hover:bg-white"
                                  }`}
                                  title={wishlist.includes(item.id) ? "Remove from wishlist" : "Save to wishlist"}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      wishlist.includes(item.id) ? "fill-current text-white" : ""
                                    }`}
                                  />
                                </button>
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-sans text-earth-clay">
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3 text-earth-terracotta shrink-0" />
                                      <span>{item.location}</span>
                                    </span>
                                    <span className="uppercase font-bold tracking-wider text-earth-terracotta text-[8px] bg-earth-terracotta/5 px-2 py-0.5 border border-earth-terracotta/10">
                                      Official Guide
                                    </span>
                                  </div>
                                  <h4 className="font-serif text-base font-bold text-earth-charcoal leading-tight">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-earth-charcoal/70 line-clamp-2 font-light leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-earth-clay/5 flex items-center justify-between text-xs">
                                  <button
                                    onClick={() => toggleWishlist(item.id)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-earth-terracotta hover:underline cursor-pointer"
                                  >
                                    {wishlist.includes(item.id) ? "✓ Wishlisted" : "+ Add to Wishlist"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-earth-sand/20 border border-dashed border-earth-clay/20 text-center text-xs text-earth-charcoal/60">
                          No official guides found matching your search criteria.
                        </div>
                      )}
                    </div>

                    {/* Section 2: Trending Now (Community Hidden Gems) */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-earth-terracotta" />
                            <h3 className="font-serif text-lg font-bold text-earth-forest">
                              Trending Now
                            </h3>
                          </div>
                          <p className="text-xs text-earth-charcoal/60 font-light mt-0.5">
                            Secret offbeat spots discovered and verified by community explorers
                          </p>
                        </div>
                        <Link
                          href="/hidden-gems"
                          className="text-xs font-bold uppercase tracking-wider text-earth-terracotta hover:text-earth-forest flex items-center space-x-1 transition-colors shrink-0"
                        >
                          <span>View All</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {filteredGemItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {filteredGemItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="bg-white border border-earth-clay/10 flex flex-col justify-between hover:border-earth-terracotta/40 transition-all duration-300 shadow-sm group"
                            >
                              <div className="relative aspect-[16/10] overflow-hidden bg-earth-sand">
                                {item.photos?.[0] ? (
                                  <img
                                    src={item.photos[0]}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-earth-clay/40 text-xs">
                                    No image available
                                  </div>
                                )}
                                <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10 max-w-[75%]">
                                  {item.category.split(",").map((cat) => (
                                    <span
                                      key={cat}
                                      className="bg-earth-sand/90 text-earth-forest border border-earth-clay/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm"
                                    >
                                      {cat.trim()}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  onClick={() => toggleWishlist(item.id)}
                                  className={`absolute top-3 right-3 p-2 rounded-full transition-all cursor-pointer shadow-md ${
                                    wishlist.includes(item.id)
                                      ? "bg-red-500 text-white"
                                      : "bg-white/80 text-earth-charcoal hover:bg-white"
                                  }`}
                                  title={wishlist.includes(item.id) ? "Remove from wishlist" : "Save to wishlist"}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      wishlist.includes(item.id) ? "fill-current text-white" : ""
                                    }`}
                                  />
                                </button>
                              </div>

                              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-sans text-earth-clay">
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3 text-earth-terracotta shrink-0" />
                                      <span>{item.location}</span>
                                    </span>
                                    <span className="uppercase font-bold tracking-wider text-earth-terracotta text-[8px] bg-earth-terracotta/5 px-2 py-0.5 border border-earth-terracotta/10">
                                      Hidden Gem
                                    </span>
                                  </div>
                                  <h4 className="font-serif text-base font-bold text-earth-charcoal leading-tight">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-earth-charcoal/70 line-clamp-2 font-light leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-earth-clay/5 flex items-center justify-between text-xs">
                                  <button
                                    onClick={() => toggleWishlist(item.id)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-earth-terracotta hover:underline cursor-pointer"
                                  >
                                    {wishlist.includes(item.id) ? "✓ Wishlisted" : "+ Add to Wishlist"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-earth-sand/20 border border-dashed border-earth-clay/20 text-center text-xs text-earth-charcoal/60">
                          No community hidden gems found matching your search criteria.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-view: AI Planner */}
                {exploreSubView === "planner" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                      <h3 className="font-serif text-lg font-bold text-earth-forest flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-earth-terracotta" />
                        <span>AI Travel Itinerary Planner</span>
                      </h3>
                      <button
                        onClick={() => setExploreSubView("browse")}
                        className="text-xs text-earth-clay font-bold uppercase hover:underline"
                      >
                        ← Back to Catalog
                      </button>
                    </div>

                    {!isGenerating && !richPlan && (
                      <div className="bg-earth-sand/15 border border-earth-clay/10 p-6 space-y-6 font-sans">
                        <div className="flex items-center space-x-2 text-xs border-b border-earth-clay/5 pb-3">
                          <span
                            className={`px-2 py-0.5 font-bold ${
                              plannerStep === 1
                                ? "bg-earth-terracotta text-white"
                                : "bg-earth-clay/10 text-earth-charcoal/60"
                            }`}
                          >
                            Step 1: Destination & Budget
                          </span>
                          <span className="text-earth-clay/35">→</span>
                          <span
                            className={`px-2 py-0.5 font-bold ${
                              plannerStep === 2
                                ? "bg-earth-terracotta text-white"
                                : "bg-earth-clay/10 text-earth-charcoal/60"
                            }`}
                          >
                            Step 2: Category Vibes
                          </span>
                        </div>

                        {plannerStep === 1 ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div ref={suggestionsRef} className="relative space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                  Where do you want to go? *
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
                                  placeholder="e.g. Kerala, Ladakh, Paris..."
                                  className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
                                />
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
                                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-earth-sand/30 text-earth-charcoal border-b border-earth-clay/5 cursor-pointer"
                                      >
                                        🗺️ {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                  Duration (Days) *
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={1}
                                  max={30}
                                  value={planDays}
                                  onChange={(e) => setPlanDays(Number(e.target.value) || 1)}
                                  className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                  Budget (₹ INR) *
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={1000}
                                  value={planBudget}
                                  onChange={(e) => setPlanBudget(Number(e.target.value) || 0)}
                                  className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta font-mono font-bold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                  Budget Style
                                </label>
                                <select
                                  value={planBudgetStyle}
                                  onChange={(e) => setPlanBudgetStyle(e.target.value as any)}
                                  className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta font-semibold"
                                >
                                  <option value="Budget">Budget (Backpacker, homestays)</option>
                                  <option value="Mid-range">Mid-range (Comfortable, cabs)</option>
                                  <option value="Luxury">Luxury (Premium, private villas)</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (planRegion.trim()) setPlannerStep(2);
                                  else alert("Please enter a destination!");
                                }}
                                className="px-8 py-3 bg-earth-terracotta hover:bg-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                              >
                                <span>Choose Vibes</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-earth-clay">
                                Select Vibe Categories
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { value: "Hills", label: "⛰️ Hills & Valleys" },
                                  { value: "Beaches", label: "🏖️ Beaches & Coasts" },
                                  { value: "Heritage", label: "🏰 Heritage & Forts" },
                                  { value: "Wildlife", label: "🦁 Wildlife & Jungles" },
                                  { value: "Offbeat", label: "💎 Community Gems" },
                                ].map((cat) => {
                                  const isSelected = planCategories.includes(cat.value);
                                  return (
                                    <button
                                      key={cat.value}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          setPlanCategories(
                                            planCategories.filter((c) => c !== cat.value)
                                          );
                                        } else {
                                          setPlanCategories([...planCategories, cat.value]);
                                        }
                                      }}
                                      className={`px-3 py-2 text-xs border cursor-pointer font-medium ${
                                        isSelected
                                          ? "bg-earth-forest border-earth-forest text-white"
                                          : "bg-white border-earth-clay/20 text-earth-charcoal/80"
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
                                className="px-6 py-2.5 border border-earth-clay/20 text-earth-charcoal text-xs font-bold uppercase tracking-widest cursor-pointer"
                              >
                                Back
                              </button>
                              <button
                                onClick={handleGeneratePlan}
                                disabled={!planRegion.trim()}
                                className="px-8 py-3 bg-earth-terracotta hover:bg-earth-forest disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                              >
                                <Sparkles className="h-4 w-4" />
                                <span>Generate AI Plan</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isGenerating && (
                      <div className="text-center py-12 space-y-4">
                        <Compass className="h-10 w-10 text-earth-terracotta animate-spin mx-auto" />
                        <p className="font-serif text-base font-bold text-earth-forest animate-pulse">
                          SafarNama AI is drafting your itinerary...
                        </p>
                      </div>
                    )}

                    {genError && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
                        <strong>AI Generation Error:</strong> {genError}
                      </div>
                    )}

                    {!isGenerating && richPlan && (
                      <div className="space-y-6 font-sans">
                        {/* Header Banner */}
                        <div className="bg-white border border-earth-clay/15 p-6 space-y-4 shadow-sm relative overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-earth-clay/10 pb-3">
                            <div className="flex items-center space-x-2">
                              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-earth-terracotta text-white flex items-center space-x-1 border border-earth-terracotta shadow-sm">
                                <Sparkles className="h-3 w-3" />
                                <span>Custom Plan</span>
                              </span>
                              {richPlan.bestTimeToVisit && (
                                <span className="text-[10px] text-earth-forest font-bold uppercase tracking-wider bg-earth-forest/10 px-2.5 py-1 border border-earth-forest/20">
                                  🗓️ Best Time: {richPlan.bestTimeToVisit}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setRichPlan(null);
                                setPlannerStep(1);
                              }}
                              className="text-xs text-earth-clay hover:text-earth-terracotta font-bold uppercase cursor-pointer"
                            >
                              + Craft Another Plan
                            </button>
                          </div>

                          <div className="space-y-2 pt-1">
                            <h4 className="font-serif text-2xl font-bold text-earth-charcoal">
                              {richPlan.title}
                            </h4>
                            <p className="text-xs text-earth-charcoal/80 font-light leading-relaxed">
                              {richPlan.description}
                            </p>
                          </div>

                          {/* Practical Tips */}
                          {richPlan.practicalTips && richPlan.practicalTips.length > 0 && (
                            <div className="bg-earth-sand/30 border border-earth-clay/10 p-4 space-y-2">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-earth-forest flex items-center gap-1.5">
                                💡 Local Travel Tips & Guidance
                              </h5>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-earth-charcoal/80">
                                {richPlan.practicalTips.map((tip: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-earth-terracotta font-bold">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Day-by-Day Detailed Itinerary Schedule */}
                        {richPlan.days && richPlan.days.length > 0 && (
                          <div className="space-y-6">
                            <h5 className="font-serif text-lg font-bold text-earth-forest flex items-center gap-2">
                              <span>Day-by-Day Detailed Schedule</span>
                              <span className="text-xs font-sans text-earth-clay font-normal">
                                ({richPlan.days.length} Days)
                              </span>
                            </h5>

                            <div className="space-y-6">
                              {richPlan.days.map((day: any, dIdx: number) => (
                                <div
                                  key={dIdx}
                                  className="bg-white border border-earth-clay/15 shadow-sm p-5 md:p-6 space-y-4"
                                >
                                  <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="bg-earth-forest text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                                        Day {day.dayNumber || dIdx + 1}
                                      </span>
                                      {day.title && (
                                        <h6 className="font-serif text-base font-bold text-earth-charcoal">
                                          {day.title}
                                        </h6>
                                      )}
                                    </div>
                                    {day.date && (
                                      <span className="text-xs text-earth-clay font-mono">
                                        {day.date}
                                      </span>
                                    )}
                                  </div>

                                  {/* Activities list */}
                                  <div className="space-y-3">
                                    {(day.activities || []).map((act: any, aIdx: number) => (
                                      <div
                                        key={aIdx}
                                        className="p-3.5 bg-earth-sand/20 border border-earth-clay/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                                      >
                                        <div className="space-y-1 flex-1">
                                          <div className="flex items-center space-x-2">
                                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-earth-terracotta/10 text-earth-terracotta border border-earth-terracotta/20 shrink-0">
                                              {act.time || "Activity"}
                                            </span>
                                            <span className="font-serif text-sm font-bold text-earth-charcoal">
                                              {act.title}
                                            </span>
                                          </div>
                                          {act.description && (
                                            <p className="text-xs text-earth-charcoal/70 font-light leading-relaxed pl-0.5">
                                              {act.description}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex items-center space-x-3 shrink-0 text-xs">
                                          {act.location && (
                                            <span className="flex items-center space-x-1 text-earth-clay">
                                              <MapPin className="h-3 w-3 text-earth-terracotta shrink-0" />
                                              <span>{act.location}</span>
                                            </span>
                                          )}
                                          {act.cost !== undefined && (
                                            <span className="font-mono font-bold text-earth-forest bg-earth-forest/5 px-2 py-0.5 border border-earth-forest/10">
                                              ₹{act.cost}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Approximate Costs */}
                                  {day.approximateCosts && (
                                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[10px] text-earth-clay border-t border-earth-clay/5">
                                      <span className="font-bold uppercase tracking-wider text-earth-charcoal">
                                        Estimated Day Expenses:
                                      </span>
                                      {day.approximateCosts.stay && (
                                        <span>Stay: ₹{day.approximateCosts.stay}</span>
                                      )}
                                      {day.approximateCosts.food && (
                                        <span>Food: ₹{day.approximateCosts.food}</span>
                                      )}
                                      {day.approximateCosts.transport && (
                                        <span>Transport: ₹{day.approximateCosts.transport}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Save Confirmation & Action Footer */}
                        {saveSuccess && (
                          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                              <span>Custom Plan successfully saved to My Trips!</span>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab("trips");
                                setTripsSubTab("itineraries");
                              }}
                              className="px-4 py-1.5 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              View in My Trips →
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-end space-x-3 pt-2">
                          {richPlan.id && isItinerarySaved(richPlan.id) ? (
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleSaveItinerary(richPlan.id)}
                                className="px-6 py-3 bg-earth-terracotta hover:bg-red-600 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
                              >
                                ✓ Saved in My Trips
                              </button>
                              <button
                                onClick={() => {
                                  setActiveTab("trips");
                                  setTripsSubTab("itineraries");
                                }}
                                className="px-6 py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer"
                              >
                                View in My Trips →
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleSavePlan}
                              disabled={saveSuccess}
                              className="px-8 py-3 bg-earth-terracotta hover:bg-earth-forest disabled:bg-earth-clay/30 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer shadow-md flex items-center space-x-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              <span>{saveSuccess ? "✓ Saved to My Trips" : "Save to My Trips"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: Add Spot */}
                {exploreSubView === "addgem" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                      <h3 className="font-serif text-lg font-bold text-earth-forest">
                        Submit a New Hidden Gem Spot
                      </h3>
                      <button
                        onClick={() => setExploreSubView("browse")}
                        className="text-xs text-earth-clay font-bold uppercase hover:underline"
                      >
                        ← Back to Catalog
                      </button>
                    </div>

                    {gemSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Submitted! Your spot will appear after review.</span>
                      </div>
                    )}

                    <form onSubmit={handleAddGemSubmit} className="space-y-6 font-sans text-xs">
                      <div className="bg-earth-sand/10 border border-earth-clay/10 p-4">
                        <MapPicker
                          onSelectLocation={(lat, lng, name) => {
                            setGemLat(lat);
                            setGemLng(lng);
                            if (name.includes(",")) {
                              const [cityName, stateName] = name.split(",");
                              setGemLocName(cityName.trim());
                              setGemState(stateName.trim());
                            }
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                            Spot Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={gemTitle}
                            onChange={(e) => setGemTitle(e.target.value)}
                            placeholder="Spot name"
                            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                            Photo URL *
                          </label>
                          <input
                            type="text"
                            required
                            value={uploadedImageUrl}
                            onChange={(e) => setUploadedImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                            City / District *
                          </label>
                          <input
                            type="text"
                            required
                            value={gemLocName}
                            onChange={(e) => setGemLocName(e.target.value)}
                            placeholder="Location"
                            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={gemState}
                            onChange={(e) => setGemState(e.target.value)}
                            placeholder="State"
                            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Description & Details *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={gemDesc}
                          onChange={(e) => setGemDesc(e.target.value)}
                          placeholder="Describe the hidden gem spot..."
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!gemTitle || !gemLocName || !gemState || !gemDesc || !uploadedImageUrl}
                        className="w-full py-3 bg-earth-forest hover:bg-earth-terracotta disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Submit Hidden Gem (+100 PTS)
                      </button>
                    </form>
                  </div>
                )}

                {/* Sub-view: Share Journey */}
                {exploreSubView === "addjourney" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                      <h3 className="font-serif text-lg font-bold text-earth-forest">
                        Share Your Journey Route
                      </h3>
                      <button
                        onClick={() => setExploreSubView("browse")}
                        className="text-xs text-earth-clay font-bold uppercase hover:underline"
                      >
                        ← Back to Catalog
                      </button>
                    </div>

                    {jSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Journey submitted successfully!</span>
                      </div>
                    )}

                    <form onSubmit={handleAddJourneySubmit} className="space-y-6 font-sans text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                            Journey Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={jTitle}
                            onChange={(e) => setJTitle(e.target.value)}
                            placeholder="e.g. 5-Day Spiti Circuit"
                            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                            Duration *
                          </label>
                          <input
                            type="text"
                            required
                            value={jDuration}
                            onChange={(e) => setJDuration(e.target.value)}
                            placeholder="e.g. 5 Days"
                            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Journey Story / Overview *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={jDesc}
                          onChange={(e) => setJDesc(e.target.value)}
                          placeholder="Describe the route, roads, and experiences..."
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={jLoading || !jTitle || !jDesc || !jDuration}
                        className="w-full py-3 bg-earth-forest hover:bg-earth-terracotta disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Submit Journey (+100 PTS)
                      </button>
                    </form>
                  </div>
                )}

                {/* Sub-view: Write Story */}
                {exploreSubView === "writeblog" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                      <h3 className="font-serif text-lg font-bold text-earth-forest">
                        Write a Traveler Story
                      </h3>
                      <button
                        onClick={() => setExploreSubView("browse")}
                        className="text-xs text-earth-clay font-bold uppercase hover:underline"
                      >
                        ← Back to Catalog
                      </button>
                    </div>

                    {bSuccess && (
                      <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>Traveler story published!</span>
                      </div>
                    )}

                    <form onSubmit={handleAddBlogSubmit} className="space-y-6 font-sans text-xs">
                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Story Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={bTitle}
                          onChange={(e) => setBTitle(e.target.value)}
                          placeholder="Story Title"
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                          Story Content *
                        </label>
                        <textarea
                          rows={8}
                          required
                          value={bContent}
                          onChange={(e) => setBContent(e.target.value)}
                          placeholder="Write your story..."
                          className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bLoading || !bTitle || !bContent}
                        className="w-full py-3 bg-earth-forest hover:bg-earth-terracotta disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Publish Story (+30 PTS)
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MY TRIPS */}
            {activeTab === "trips" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Sub-tabs header for My Trips */}
                <div className="flex border-b border-earth-clay/10 pb-2 flex-wrap gap-2">
                  {[
                    { id: "itineraries" as const, name: "Saved Itineraries", icon: Route },
                    { id: "expenses" as const, name: "Expense Visualizer", icon: Activity },
                    { id: "wishlist" as const, name: "Wishlist Explorations", icon: Heart },
                    { id: "stays" as const, name: "Upcoming Stays", icon: Hotel },
                    { id: "cancellations" as const, name: "Cancellations", icon: Ticket },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isActive = tripsSubTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setTripsSubTab(sub.id)}
                        className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-[10px] transition-all cursor-pointer ${
                          isActive
                            ? "border-earth-terracotta text-earth-terracotta"
                            : "border-transparent text-earth-charcoal/60 hover:text-earth-charcoal"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{sub.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-tab: Saved Itineraries */}
                {tripsSubTab === "itineraries" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-clay/10 pb-4">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-earth-forest">
                          My Saved Itineraries & Custom Plans
                        </h3>
                        <p className="text-xs text-earth-charcoal/70 font-light">
                          Manage your saved custom AI plans, official guides, and community routes.
                        </p>
                      </div>

                      {/* Filter pills */}
                      <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                        {(["All", "Custom Plans", "Official Guides", "Community Routes"] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setSavedFilter(filter)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border cursor-pointer ${
                              savedFilter === filter
                                ? "bg-earth-terracotta text-white border-earth-terracotta"
                                : "bg-white text-earth-charcoal/80 border-earth-clay/15 hover:border-earth-terracotta"
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredSavedJourneys && filteredSavedJourneys.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredSavedJourneys.map((j) => {
                          const isCustom = j.type === "Custom Plan" || j.type === "AI-Generated";
                          const isOfficial = j.type === "Official Guide";
                          const isCommunity = j.type === "Community Route" || j.type === "Manual";

                          return (
                            <div
                              key={j.id}
                              className="bg-white border border-earth-clay/15 p-6 flex flex-col justify-between hover:border-earth-terracotta/40 transition-all shadow-sm space-y-4 relative"
                            >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  {isCustom ? (
                                    <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-earth-terracotta text-white flex items-center space-x-1 border border-earth-terracotta shadow-sm">
                                      <Sparkles className="h-3 w-3 text-earth-saffron" />
                                      <span>Custom Plan</span>
                                    </span>
                                  ) : isOfficial ? (
                                    <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-earth-forest text-earth-saffron flex items-center space-x-1 border border-earth-forest shadow-sm">
                                      <ShieldCheck className="h-3 w-3 text-earth-saffron" />
                                      <span>Official Guide</span>
                                    </span>
                                  ) : isCommunity ? (
                                    <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-100 flex items-center space-x-1 border border-slate-700 shadow-sm">
                                      <Route className="h-3 w-3 text-sky-400" />
                                      <span>Community Route</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-earth-clay/20 text-earth-charcoal flex items-center space-x-1 border border-earth-clay/30">
                                      <span>{j.type || "Itinerary"}</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] text-earth-clay font-mono">
                                    {j.duration}
                                  </span>
                                </div>
                                <h4 className="font-serif text-lg font-bold text-earth-charcoal leading-snug">
                                  {j.title}
                                </h4>
                                <p className="text-xs text-earth-charcoal/70 line-clamp-2 font-light leading-relaxed">
                                  {j.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-earth-clay/5 flex items-center justify-between">
                                <button
                                  onClick={() => handleViewPlan(j.id)}
                                  className="px-4 py-2 border border-earth-clay/20 text-earth-forest hover:bg-earth-forest hover:text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1.5"
                                >
                                  <span>View Detailed Route</span>
                                  <span>→</span>
                                </button>
                                <button
                                  onClick={() => toggleSaveItinerary(j.id)}
                                  className="p-2 border border-earth-clay/10 text-earth-clay hover:text-earth-terracotta hover:bg-earth-terracotta/5 transition-colors cursor-pointer"
                                  title="Remove from Saved Itineraries"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5 space-y-4">
                        <Route className="h-12 w-12 text-earth-clay/30 mx-auto" />
                        <div className="space-y-1 max-w-sm mx-auto">
                          <p className="font-serif text-base font-bold text-earth-forest">
                            {savedFilter === "All"
                              ? "No saved itineraries yet."
                              : `No saved ${savedFilter.toLowerCase()} found.`}
                          </p>
                          <p className="font-sans text-xs text-earth-charcoal/60 font-light">
                            Craft your personalized custom travel itinerary with AI assistant!
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("explore");
                            setExploreSubView("planner");
                          }}
                          className="px-6 py-2.5 bg-earth-terracotta hover:bg-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md inline-flex items-center space-x-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          <span>Craft Custom Travel Itinerary</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab: Expense Tracker */}
                {tripsSubTab === "expenses" && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-earth-clay/10 pb-4">
                      <div className="space-y-1">
                        <h3 className="font-serif text-xl font-bold text-earth-forest">
                          Flexible Trip Expense Tracker
                        </h3>
                        <p className="font-sans text-xs font-light text-earth-charcoal/70">
                          Track expenditure for any trip or destination worldwide.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={selectedTripId}
                          onChange={(e) => setSelectedTripId(e.target.value)}
                          className="p-2 bg-white border border-earth-clay/20 text-xs font-medium focus:outline-none focus:border-earth-terracotta"
                        >
                          <option value="all">🌐 All Trips (Combined)</option>
                          {savedJourneys.map((j) => (
                            <option key={j.id} value={j.id}>
                              📍 {j.title}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => setShowAddTripModal(true)}
                          className="px-3.5 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          + Track New Trip
                        </button>
                      </div>
                    </div>

                    {showAddTripModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white border border-earth-clay/20 shadow-2xl max-w-md w-full p-6 space-y-4">
                          <div className="flex items-center justify-between border-b border-earth-clay/10 pb-2">
                            <h4 className="font-serif text-base font-bold text-earth-forest">
                              Track Expenses for New Trip
                            </h4>
                            <button
                              onClick={() => setShowAddTripModal(false)}
                              className="text-earth-clay font-bold text-sm"
                            >
                              ✕
                            </button>
                          </div>

                          <form onSubmit={handleCreateCustomTrip} className="space-y-4 font-sans text-xs">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase text-earth-charcoal">
                                Destination Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={newTripDest}
                                onChange={(e) => setNewTripDest(e.target.value)}
                                placeholder="e.g. Goa Beach Trip"
                                className="w-full p-2 bg-white border border-earth-clay/20 text-xs"
                              />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setShowAddTripModal(false)}
                                className="px-4 py-2 border border-earth-clay/20 text-xs font-bold uppercase"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmittingTrip}
                                className="px-4 py-2 bg-earth-forest text-white text-xs font-bold uppercase"
                              >
                                {isSubmittingTrip ? "Creating..." : "Save Trip"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4">
                        <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                          Selected View
                        </span>
                        <span className="font-serif text-lg font-bold text-earth-forest block mt-1 truncate">
                          {selectedTripId === "all" ? "All Trips Combined" : activeJourney?.title}
                        </span>
                      </div>

                      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4">
                        <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                          Total Cost
                        </span>
                        <span className="font-serif text-xl font-bold text-earth-terracotta block mt-1 font-mono">
                          ₹{tripRunningTotal.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4">
                        <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
                          Entries
                        </span>
                        <span className="font-serif text-lg font-bold text-earth-charcoal block mt-1">
                          {selectedTripExpenses.length} Items Logged
                        </span>
                      </div>
                    </div>

                    <div className="max-w-xl mx-auto w-full">
                      <CategoryDonutChart expenses={selectedTripExpenses} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-3 font-sans">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest border-b border-earth-clay/10 pb-1">
                          Logged Expense Items
                        </h4>
                        {selectedTripExpenses.length > 0 ? (
                          <div className="divide-y divide-earth-clay/10 max-h-[300px] overflow-y-auto border border-earth-clay/10 p-2 bg-white">
                            {selectedTripExpenses.map((exp) => (
                              <div key={exp.id} className="py-2 px-2 flex justify-between items-center text-xs">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-earth-charcoal">{exp.description}</div>
                                  <div className="text-[9px] text-earth-clay">{exp.category} • {exp.date}</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-earth-terracotta">₹{exp.amount}</span>
                                  <button
                                    onClick={() => deleteExpense(exp.id)}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-earth-clay/60 border border-dashed border-earth-clay/15 text-xs">
                            No expenses logged yet.
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleAddExpense} className="bg-earth-sand/10 border border-earth-clay/10 p-4 space-y-4 font-sans text-xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest border-b border-earth-clay/10 pb-1">
                          Log Categorized Expense
                        </h4>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold uppercase text-earth-charcoal">
                            Amount (₹ INR) *
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={expAmount}
                            onChange={(e) => setExpAmount(e.target.value)}
                            placeholder="1200"
                            className="w-full p-2 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold uppercase text-earth-charcoal">
                            Category *
                          </label>
                          <select
                            value={expCategory}
                            onChange={(e) => setExpCategory(e.target.value as any)}
                            className="w-full p-2 bg-white border border-earth-clay/20 text-xs"
                          >
                            {["Food", "Stay", "Transport", "Tickets", "Shopping", "Other"].map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold uppercase text-earth-charcoal">
                            Description *
                          </label>
                          <input
                            type="text"
                            required
                            value={expDesc}
                            onChange={(e) => setExpDesc(e.target.value)}
                            placeholder="Dinner at beach shack"
                            className="w-full p-2 bg-white border border-earth-clay/20 text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer"
                        >
                          Log Expense
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Sub-tab: Wishlist */}
                {tripsSubTab === "wishlist" && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      My Saved Wishlist Explorations
                    </h3>

                    {resolvedWishlistItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {resolvedWishlistItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border border-earth-clay/10 flex flex-col justify-between hover:border-earth-terracotta/30 transition-all"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden">
                              <img
                                src={item.type === "official" ? item.photos?.[0] : item.photo}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 space-y-2">
                              <h4 className="font-serif text-base font-bold text-earth-charcoal">
                                {item.title}
                              </h4>
                              <button
                                onClick={() => toggleWishlist(item.id)}
                                className="w-full py-1.5 border border-earth-clay/20 text-xs font-bold uppercase hover:bg-red-50 hover:text-red-650 cursor-pointer"
                              >
                                Remove from Wishlist
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5 space-y-2">
                        <Heart className="h-12 w-12 text-earth-clay/30 mx-auto" />
                        <p className="font-sans text-xs text-earth-charcoal/60 font-light">
                          Your wishlist is empty. Save destinations while browsing in Explore!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab: Stays Placeholder */}
                {tripsSubTab === "stays" && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      Upcoming Stays Bookings
                    </h3>

                    <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5 space-y-4 p-6">
                      <Hotel className="h-14 w-14 text-earth-clay/30 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-bold text-earth-forest">
                          No Active Stay Bookings Found
                        </h4>
                        <p className="font-sans text-xs text-earth-charcoal/60 font-light max-w-md mx-auto">
                          Hotel and homestay reservation management will be integrated in an upcoming feature update.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab: Cancellations Placeholder */}
                {tripsSubTab === "cancellations" && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      Cancellation Status & Refund Requests
                    </h3>

                    <div className="text-center py-16 border border-dashed border-earth-clay/20 bg-earth-sand/5 space-y-4 p-6">
                      <Ticket className="h-14 w-14 text-earth-clay/30 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-bold text-earth-forest">
                          No Active Cancellation Requests
                        </h4>
                        <p className="font-sans text-xs text-earth-charcoal/60 font-light max-w-md mx-auto">
                          Cancellation status and refund request tracking will be managed here once booking integration goes live.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WALLET */}
            {activeTab === "wallet" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-1 border-b border-earth-clay/10 pb-4">
                  <h2 className="font-serif text-xl font-bold text-earth-forest">
                    Explorer Points & Rewards Wallet
                  </h2>
                  <p className="font-sans text-xs text-earth-charcoal/70 font-light">
                    Track your points balance, view activity earnings ledger, and learn how to earn more points.
                  </p>
                </div>

                {/* Points Balance Banner Card */}
                <div className="bg-[#1c3d27] text-white p-6 md:p-8 border border-earth-clay/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-earth-saffron">
                      Current Points Balance
                    </span>
                    <div className="font-serif text-4xl font-bold text-white flex items-center justify-center sm:justify-start space-x-3">
                      <span>{currentUser.points} PTS</span>
                    </div>
                    <p className="text-xs text-earth-sand/70">
                      Tier Level: <span className="font-bold text-earth-saffron">{currentUser.tier}</span> Explorer
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 p-4 border border-white/10">
                    <Coins className="h-10 w-10 text-earth-saffron animate-pulse" />
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-bold text-earth-saffron">Tier Rank</div>
                      <div className="text-sm font-bold text-white">{currentUser.tier} Tier</div>
                    </div>
                  </div>
                </div>

                {/* How to Earn More Points Panel */}
                <div className="bg-earth-sand/20 border border-earth-clay/15 p-6 space-y-4">
                  <h3 className="font-serif text-base font-bold text-earth-forest flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-earth-terracotta" />
                    <span>How to Earn More Explorer Points</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-earth-clay/10 p-4 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-earth-terracotta block">+100 PTS</span>
                        <h4 className="font-serif text-sm font-bold text-earth-charcoal mt-1">Submit Hidden Gem</h4>
                        <p className="text-[11px] text-earth-charcoal/70 font-light mt-1">
                          Share an offbeat local spot. Upon admin approval, receive 100 points.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab("explore");
                          setExploreSubView("addgem");
                        }}
                        className="mt-3 py-1.5 px-3 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Submit Spot
                      </button>
                    </div>

                    <div className="bg-white border border-earth-clay/10 p-4 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-earth-terracotta block">+100 PTS</span>
                        <h4 className="font-serif text-sm font-bold text-earth-charcoal mt-1">Share Journey Route</h4>
                        <p className="text-[11px] text-earth-charcoal/70 font-light mt-1">
                          Publish a multi-stop trip route for travelers. Earn 100 points on review approval.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab("explore");
                          setExploreSubView("addjourney");
                        }}
                        className="mt-3 py-1.5 px-3 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Share Route
                      </button>
                    </div>

                    <div className="bg-white border border-earth-clay/10 p-4 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-earth-terracotta block">+30 PTS</span>
                        <h4 className="font-serif text-sm font-bold text-earth-charcoal mt-1">Write Story / Review</h4>
                        <p className="text-[11px] text-earth-charcoal/70 font-light mt-1">
                          Write a verified destination review or travelogue story to earn 30 points.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab("explore");
                          setExploreSubView("writeblog");
                        }}
                        className="mt-3 py-1.5 px-3 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Write Story
                      </button>
                    </div>

                    <div className="bg-white border border-earth-clay/10 p-4 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-earth-terracotta block">+50 PTS</span>
                        <h4 className="font-serif text-sm font-bold text-earth-charcoal mt-1">Welcome Bonus</h4>
                        <p className="text-[11px] text-earth-charcoal/70 font-light mt-1">
                          Sign up and initialize your SafarNama explorer account.
                        </p>
                      </div>
                      <span className="mt-3 py-1.5 px-3 bg-green-50 text-green-700 text-[10px] font-bold uppercase text-center border border-green-200">
                        ✓ Claimed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vouchers List Section (Empty State) */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-earth-forest border-b border-earth-clay/10 pb-2">
                    Available Discount Vouchers
                  </h3>

                  <div className="text-center py-12 border border-dashed border-earth-clay/20 bg-earth-sand/5 space-y-3">
                    <Gift className="h-10 w-10 text-earth-clay/30 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-earth-charcoal">
                        No Active Vouchers Available
                      </h4>
                      <p className="font-sans text-xs text-earth-charcoal/60 font-light max-w-sm mx-auto">
                        Convert your earned points into exclusive travel discount vouchers soon!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Points Ledger History Table */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-earth-forest border-b border-earth-clay/10 pb-2">
                    Points Activity Ledger
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

            {/* TAB 4: GUIDES */}
            {activeTab === "guides" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-1 border-b border-earth-clay/10 pb-4">
                  <h2 className="font-serif text-xl font-bold text-earth-forest">
                    Local Guides & Experiences
                  </h2>
                  <p className="font-sans text-xs text-earth-charcoal/70 font-light">
                    Connect with verified local experts, book guided trekking tours, and discover authentic offbeat experiences.
                  </p>
                </div>

                {/* Empty State Banner */}
                <div className="bg-white border border-earth-clay/15 p-10 md:p-16 text-center space-y-6 shadow-sm">
                  <div className="h-20 w-20 bg-earth-sand border-2 border-earth-terracotta/20 rounded-full flex items-center justify-center mx-auto text-earth-terracotta shadow-inner">
                    <BookOpen className="h-10 w-10 stroke-[1.5]" />
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="font-serif text-2xl font-bold text-earth-forest">
                      Local Guides Coming Soon
                    </h3>
                    <p className="font-sans text-xs text-earth-charcoal/70 leading-relaxed font-light">
                      We are onboarding verified local experts, native storytellers, and trekking guides across India to bring you authentic local experiences. Stay tuned!
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => alert("Thank you! You will be notified when local guides launch.")}
                      className="px-8 py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      Get Notified on Launch
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Account Settings & Preferences Section */}
                <div className="bg-earth-sand/20 border border-earth-clay/15 p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
                    <h3 className="font-serif text-lg font-bold text-earth-forest">
                      Account Settings & Preferences
                    </h3>
                    <button
                      onClick={toggleUserVerification}
                      className="px-3 py-1.5 border border-earth-clay/20 bg-white text-[10px] uppercase font-bold tracking-wider hover:bg-earth-sand cursor-pointer"
                    >
                      {currentUser.isVerified ? "Revoke Verification" : "Grant Verified Perk"}
                    </button>
                  </div>

                  {prefSaveMsg && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{prefSaveMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
                    {/* User Details */}
                    <div className="space-y-3 bg-white p-4 border border-earth-clay/10">
                      <div className="font-bold uppercase tracking-wider text-earth-forest text-[10px]">
                        Explorer Details
                      </div>
                      <div className="space-y-1">
                        <span className="text-earth-clay block text-[10px] uppercase">Name:</span>
                        <span className="font-semibold text-earth-charcoal">{currentUser.name}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-earth-clay block text-[10px] uppercase">Email:</span>
                        <span className="font-mono text-earth-charcoal">{currentUser.email || "N/A"}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-earth-clay block text-[10px] uppercase">Hometown:</span>
                        <span className="text-earth-charcoal">{currentUser.homeTown}</span>
                      </div>
                    </div>

                    {/* NEW Preferences Rows: Language & Currency */}
                    <div className="space-y-4 bg-white p-4 border border-earth-clay/10">
                      <div className="font-bold uppercase tracking-wider text-earth-forest text-[10px] flex items-center justify-between">
                        <span>Regional Preferences</span>
                        <span className="text-[9px] text-earth-terracotta font-mono">Convex Backed</span>
                      </div>

                      {/* Language Preference Row */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-clay flex items-center space-x-1">
                          <Globe className="h-3.5 w-3.5 text-earth-terracotta" />
                          <span>Language Preference</span>
                        </label>
                        <select
                          value={currentUser.language || "en"}
                          disabled={isUpdatingPrefs}
                          onChange={(e) => handlePreferenceChange("language", e.target.value)}
                          className="w-full p-2 bg-white border border-earth-clay/20 text-xs font-semibold text-earth-charcoal focus:outline-none focus:border-earth-terracotta cursor-pointer"
                        >
                          <option value="en">English (en)</option>
                          <option value="hi">Hindi (hi)</option>
                          <option value="es">Spanish (es)</option>
                          <option value="fr">French (fr)</option>
                          <option value="de">German (de)</option>
                        </select>
                      </div>

                      {/* Currency Preference Row */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-clay flex items-center space-x-1">
                          <DollarSign className="h-3.5 w-3.5 text-earth-terracotta" />
                          <span>Currency Display</span>
                        </label>
                        <select
                          value={currentUser.currency || "INR"}
                          disabled={isUpdatingPrefs}
                          onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                          className="w-full p-2 bg-white border border-earth-clay/20 text-xs font-semibold text-earth-charcoal focus:outline-none focus:border-earth-terracotta cursor-pointer"
                        >
                          <option value="INR">INR (₹ Indian Rupee)</option>
                          <option value="USD">USD ($ US Dollar)</option>
                          <option value="EUR">EUR (€ Euro)</option>
                          <option value="GBP">GBP (£ British Pound)</option>
                          <option value="AED">AED (د.إ UAE Dirham)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges Drawer */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/10 pb-2">
                    Explorer Achievements & Badges
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div
                      className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 ${
                        currentUser.isVerified
                          ? "bg-blue-50/50 border-blue-200 text-blue-800"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}
                    >
                      <ShieldCheck className={`h-8 w-8 ${currentUser.isVerified ? "text-blue-500" : ""}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Verified Identity</span>
                    </div>

                    <div
                      className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 ${
                        hasSubmittedGem
                          ? "bg-amber-50/50 border-amber-200 text-amber-800"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}
                    >
                      <Compass className="h-8 w-8 text-earth-saffron" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Spot Discoverer</span>
                    </div>

                    <div
                      className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 ${
                        hasWrittenReview
                          ? "bg-orange-50/50 border-orange-200 text-orange-800"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}
                    >
                      <BookOpen className="h-8 w-8" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Logbook Writer</span>
                    </div>

                    <div
                      className={`p-4 border text-center flex flex-col items-center justify-center space-y-2 ${
                        isGoldOrSilver
                          ? "bg-earth-sand border-earth-clay/20 text-earth-clay"
                          : "bg-stone-50 border-stone-200 opacity-40 text-stone-500"
                      }`}
                    >
                      <Award className="h-8 w-8 text-earth-terracotta" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Elite Guide</span>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Section */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/10 pb-2">
                    Explorer Leaderboard Standings
                  </h3>

                  <div className="font-sans text-sm">
                    {leaderboard && leaderboard.length > 0 ? (
                      (() => {
                        const userRankInfo = leaderboard.find((u) => u.isCurrentUser);
                        if (userRankInfo) {
                          return (
                            <Link
                              href="/leaderboard"
                              className="inline-flex items-center space-x-2 text-earth-forest hover:text-earth-terracotta transition-colors font-semibold group cursor-pointer"
                            >
                              <span>Rank #{userRankInfo.rank} · {userRankInfo.points.toLocaleString()} pts</span>
                              <span className="text-xs text-earth-clay group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                          );
                        } else {
                          return (
                            <Link
                              href="/leaderboard"
                              className="inline-flex items-center space-x-2 text-earth-forest hover:text-earth-terracotta transition-colors font-semibold group cursor-pointer"
                            >
                              <span>Rank #N/A · {currentUser.points.toLocaleString()} pts</span>
                              <span className="text-xs text-earth-clay group-hover:translate-x-1 transition-transform font-normal">(View Leaderboard) →</span>
                            </Link>
                          );
                        }
                      })()
                    ) : (
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-4 bg-earth-clay/10 w-28 rounded" />
                      </div>
                    )}
                  </div>
                </div>

                {/* My Submissions Section */}
                <div className="space-y-6">
                  <h3 className="font-serif text-lg font-bold text-earth-forest border-b border-earth-clay/10 pb-2">
                    My Submitted Gems & Tracking Status
                  </h3>

                  {mySubmissions && mySubmissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {mySubmissions.map((gem) => (
                        <div
                          key={gem.id}
                          className="bg-white border border-earth-clay/10 flex flex-col justify-between hover:border-earth-terracotta/30 transition-all p-4 space-y-3"
                        >
                          <div className="space-y-1">
                            <h4 className="font-serif text-base font-bold text-earth-charcoal">
                              {gem.title}
                            </h4>
                            <p className="text-xs text-earth-charcoal/70 line-clamp-2">
                              {gem.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-earth-clay/5">
                            <VerificationStepper status={gem.status as any} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-earth-clay/20 bg-earth-sand/5 text-xs text-earth-charcoal/60">
                      You haven't submitted any spots yet. Switch to Explore tab to submit a spot!
                    </div>
                  )}
                </div>

                {/* Admin Moderation Console (Gated for admin users) */}
                {(currentUser?.email?.trim().toLowerCase() === "230107anu@gmail.com" || currentUser?.role === "admin") && (
                  <div className="space-y-6 font-sans text-xs border-t-2 border-earth-terracotta/30 pt-8 mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-earth-clay/10 pb-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-earth-forest">
                          <Sparkles className="h-5 w-5 text-earth-terracotta shrink-0" />
                          <h3 className="font-serif text-lg font-bold uppercase tracking-wider">
                            Admin Moderation Console
                          </h3>
                        </div>
                        <p className="text-[11px] text-earth-charcoal/60">
                          Active Role: <span className="font-bold text-earth-forest uppercase">Convex Admin ({currentUser.name})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 border-b border-earth-clay/10 pb-1 flex-wrap gap-y-2">
                      {[
                        { id: "spots" as const, name: `Spot Discoveries (${pendingGems.length})` },
                        { id: "journeys" as const, name: `Journeys (${pendingJourneys.length})` },
                        { id: "reviews" as const, name: `Reviews (${reviews.length})` },
                        { id: "blogs" as const, name: `Traveler Stories (${blogs.length})` },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setAdminSubTab(sub.id)}
                          className={`px-3 py-2 font-sans font-bold uppercase tracking-wider border-b-2 -mb-[3px] transition-all cursor-pointer ${
                            adminSubTab === sub.id
                              ? "border-earth-forest text-earth-forest text-[11px]"
                              : "border-transparent text-earth-charcoal/50 hover:text-earth-charcoal text-[11px]"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>

                    {adminSubTab === "spots" && (
                      <div className="space-y-4">
                        {pendingGems.length > 0 ? (
                          <div className="space-y-4">
                            {pendingGems.map((g) => (
                              <div key={g.id} className="p-4 bg-earth-sand/10 border border-earth-clay/10 flex justify-between items-center">
                                <div className="space-y-1">
                                  <div className="font-serif font-bold text-sm text-earth-charcoal">{g.title}</div>
                                  <div className="text-[10px] text-earth-clay">{g.location}, {g.state} • Submitter: {g.submittedBy}</div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => rejectGem(g.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => approveGem(g.id)}
                                    className="px-3 py-1 bg-earth-forest text-white text-[10px] font-bold uppercase cursor-pointer"
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
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Persistent Bottom Tab Bar for Mobile (<md) */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-earth-clay/15 py-2 px-3 justify-around items-center shadow-2xl pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {[
          { id: "explore" as const, name: "Explore", icon: Compass },
          { id: "trips" as const, name: "My Trips", icon: Route },
          { id: "wallet" as const, name: "Wallet", icon: WalletIcon },
          { id: "guides" as const, name: "Guides", icon: BookOpen },
          { id: "profile" as const, name: "Profile", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors cursor-pointer ${
                isActive ? "text-earth-terracotta" : "text-earth-charcoal/60 hover:text-earth-charcoal"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-earth-terracotta stroke-[2.5]" : "stroke-[1.5]"}`} />
              <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{tab.name}</span>
            </button>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
