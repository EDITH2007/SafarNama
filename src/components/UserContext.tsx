"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import {
  HiddenGem,
  Blog,
  Review,
  Journey,
  LeaderboardUser,
  POINTS,
  mockBlogs,
  mockReviews,
  mockJourneys,
  Destination,
} from "../app/data/mockData";

export interface PointsLedgerEntry {
  id: string;
  action: string;
  points: number;
  date: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  points: number;
  tier: "Bronze" | "Silver" | "Gold";
  isVerified: boolean;
  avatar: string;
  bio: string;
  homeTown: string;
  role?: "user" | "admin";
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: "Food" | "Stay" | "Transport" | "Tickets" | "Shopping" | "Other";
  date: string;
  description: string;
}

export interface PlanDay {
  day: number;
  title: string;
  description: string;
  location: string;
  sourceName?: string;
  sourceType?: "official" | "gem" | "generic";
}

export interface InAppNotification {
  _id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: number;
  relatedSubmissionId?: string;
}

interface UserContextType {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  switchProfile: (name: string) => void;
  destinations: Destination[];
  hiddenGems: HiddenGem[];
  blogs: Blog[];
  reviews: Review[];
  journeys: Journey[];
  leaderboard: LeaderboardUser[];
  pointsLedger: PointsLedgerEntry[];
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  expenses: Expense[];
  addExpense: (tripId: string, amount: number, category: Expense["category"], description: string) => Promise<void> | void;
  deleteExpense: (expenseId: string) => Promise<void>;
  createCustomTrip: (trip: { title?: string; destination: string; description?: string; startDate?: string; endDate?: string }) => Promise<string>;
  generateAILocalPlan: (location: string, categories: string[], days: number) => PlanDay[];
  submitGem: (gem: Omit<HiddenGem, "id" | "submittedBy" | "submitterTier" | "submitterVerified" | "pointsAwarded" | "createdAt" | "status">) => Promise<string>;
  approveGem: (gemId: string) => Promise<void>;
  rejectGem: (gemId: string, reason?: string) => Promise<void>;
  addDestination: (dest: {
    title: string;
    description: string;
    location: string;
    state: string;
    geo: { lat: number; lng: number };
    photos: string[];
    category: string;
    bestTimeToVisit?: string;
    howToReach?: string;
    nearbyAttractions?: string[];
    tips?: string[];
    photoGallery?: string[];
  }) => Promise<void>;
  addReview: (review: Omit<Review, "id" | "author" | "authorTier" | "authorVerified" | "date">) => void;
  addBlog: (blog: Omit<Blog, "id" | "author" | "authorTier" | "authorVerified" | "date">) => void;
  completeTrip: (journeyId: string) => void;
  addTrip: (trip: Omit<Journey, "id" | "author" | "completed">) => void;
  toggleUserVerification: () => void;
  flagReview: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  flagBlog: (blogId: string) => void;
  deleteBlog: (blogId: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  mySubmissions: any[];
  notifications: InAppNotification[];
  markNotificationsAsRead: () => Promise<void>;
}

const PLACEHOLDER_USER: UserProfile = {
  id: "loading",
  name: "Loading...",
  points: 0,
  tier: "Bronze",
  isVerified: false,
  avatar: "L",
  bio: "Loading user profile...",
  homeTown: "SafarNama",
  role: "user",
};

const EMPTY_ARRAY: never[] = [];

const MOCK_POINTS_LEDGER: PointsLedgerEntry[] = [
  { id: "1", action: "SafarNama Welcoming Gift", points: 50, date: "June 15, 2026" },
  { id: "2", action: "Written Review: Munnar Tea Hills", points: 30, date: "June 25, 2026" },
  { id: "3", action: "Completed Journey: Coastal Gokarna Trek", points: 50, date: "July 02, 2026" },
  { id: "4", action: "Logged trip expenses to Munnar", points: 50, date: "July 08, 2026" },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  
  // Queries
  const viewer = useQuery(api.users.viewer);
  const dbPointsLedger = useQuery(api.users.getPointsLedger);
  const rawLeaderboard = useQuery(api.users.getLeaderboard);
  const dbLeaderboard = rawLeaderboard || EMPTY_ARRAY;
  
  const dbDestinations = useQuery(api.destinations.getDestinations);
  const destinations = dbDestinations || EMPTY_ARRAY;

  const dbApprovedGems = useQuery(api.gems.getApprovedGems);
  const approvedGems = dbApprovedGems || EMPTY_ARRAY;

  const isLocalAdmin = viewer?.role === "admin";
  const dbPendingGems = useQuery(api.gems.getPendingGems, isLocalAdmin ? {} : "skip");
  const pendingGems = dbPendingGems || EMPTY_ARRAY;

  // Mutations
  const awardPointsMutation = useMutation(api.users.awardPoints);
  const toggleVerificationMutation = useMutation(api.users.toggleVerification);
  const seedDatabase = useMutation(api.seed.seedDatabase);
  
  const submitGemMutation = useMutation(api.gems.submitGem);
  const approveGemMutation = useMutation(api.gems.approveGem);
  const rejectGemMutation = useMutation(api.gems.rejectGem);
  const addDestinationMutation = useMutation(api.destinations.addDestination);
  
  const ensureAdminStatusMutation = useMutation(api.users.ensureAdminStatus);
  const removeFakeUsersMutation = useMutation(api.users.removeFakeUsers);

  const dbMySubmissions = useQuery(api.gems.getMySubmissions);
  const mySubmissions = dbMySubmissions || EMPTY_ARRAY;

  const dbNotifications = useQuery(api.notifications.getUserNotifications);
  const notifications = dbNotifications || EMPTY_ARRAY;

  const markNotificationsAsReadMutation = useMutation(api.notifications.markAllAsRead);
  const dbTripPlans = useQuery(api.trips.getTripPlans);
  const completeTripPlanMutation = useMutation(api.trips.completeTripPlan);
  const saveTripPlanMutation = useMutation(api.trips.saveTripPlan);

  // Expenses Queries and Mutations
  const dbExpenses = useQuery(api.expenses.getUserExpenses);
  const addExpenseMutation = useMutation(api.expenses.addExpense);
  const deleteExpenseMutation = useMutation(api.expenses.deleteExpense);

  // Wishlist Queries and Mutations
  const dbWishlist = useQuery(api.wishlist.getWishlist);
  const toggleWishlistMutation = useMutation(api.wishlist.toggleWishlist);
  const syncWishlistMutation = useMutation(api.wishlist.syncWishlist);
  const markNotificationsAsRead = async () => {
    try {
      await markNotificationsAsReadMutation();
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  // Auto-seed if database is empty
  useEffect(() => {
    if (rawLeaderboard !== undefined && rawLeaderboard.length === 0) {
      seedDatabase().catch((err) => {
        console.error("Autoseeding failed:", err);
      });
    }
  }, [rawLeaderboard, seedDatabase]);

  // Run admin promotion and fake user cleanup on login
  useEffect(() => {
    if (isAuthenticated && viewer) {
      ensureAdminStatusMutation().catch(console.error);
      removeFakeUsersMutation().catch(console.error);
    }
  }, [isAuthenticated, viewer, ensureAdminStatusMutation, removeFakeUsersMutation]);

  const currentUser: UserProfile | null = useMemo(() => {
    return viewer
      ? {
          id: viewer._id,
          name: viewer.name || viewer.email?.split("@")[0] || "Traveler",
          email: viewer.email,
          points: viewer.totalPoints ?? 0,
          tier: (viewer.tier || "Bronze") as "Bronze" | "Silver" | "Gold",
          isVerified: viewer.isVerified ?? false,
          avatar: (viewer.name || viewer.email || "TR")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          bio: viewer.bio || "Wanderer",
          homeTown: viewer.homeTown || "Unknown",
          role: (viewer.role || "user") as "user" | "admin",
        }
      : isLoading
      ? PLACEHOLDER_USER
      : null;
  }, [viewer, isLoading]);

  const profiles: UserProfile[] = useMemo(() => {
    return dbLeaderboard.map((u) => ({
      id: u.id,
      name: u.name,
      points: u.points,
      tier: u.tier,
      isVerified: u.isVerified,
      avatar: u.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase(),
      bio: "Explorer profile on SafarNama",
      homeTown: "India",
      role: "user",
    }));
  }, [dbLeaderboard]);

  // Combine approved gems with pending ones if admin
  const hiddenGems: HiddenGem[] = (currentUser?.role === "admin" 
    ? [...approvedGems, ...pendingGems] 
    : approvedGems) as HiddenGem[];

  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [localJourneys, setLocalJourneys] = useState<Journey[]>(mockJourneys);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // 1. Load wishlist from localStorage on mount (for guest/anonymous users)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("safarnama_wishlist");
      if (local) {
        try {
          setWishlist(JSON.parse(local));
        } catch (e) {
          console.error("Failed to parse local wishlist:", e);
        }
      }
    }
  }, []);

  // 2. Synchronize React state with Convex database when authenticated
  useEffect(() => {
    if (isAuthenticated && dbWishlist !== undefined) {
      setWishlist(dbWishlist);
    }
  }, [isAuthenticated, dbWishlist]);

  // 3. Clear or restore wishlist state upon logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("safarnama_wishlist");
        if (local) {
          try {
            setWishlist(JSON.parse(local));
            return;
          } catch (e) {
            // ignore
          }
        }
      }
      setWishlist([]);
    }
  }, [isAuthenticated, isLoading]);

  // 4. Sync offline/anonymous wishlist items to Convex upon login
  useEffect(() => {
    if (isAuthenticated) {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("safarnama_wishlist");
        if (local) {
          try {
            const ids = JSON.parse(local) as string[];
            // Filter out hardcoded mock IDs before syncing to prevent db noise
            const realIds = ids.filter(id => !id.startsWith("dest-") && !id.startsWith("gem-"));
            if (realIds.length > 0) {
              syncWishlistMutation({ ids: realIds })
                .then(() => {
                  localStorage.removeItem("safarnama_wishlist");
                })
                .catch((err) => console.error("Failed to sync wishlist on login:", err));
            } else {
              localStorage.removeItem("safarnama_wishlist");
            }
          } catch (e) {
            console.error("Failed to parse/sync local wishlist:", e);
            localStorage.removeItem("safarnama_wishlist");
          }
        }
      }
    }
  }, [isAuthenticated, syncWishlistMutation]);

  const mappedDbTripPlans = useMemo(() => {
    if (!dbTripPlans) return [];
    return dbTripPlans.map((tp: any) => {
      const stopsSet = new Set<string>();
      if (tp.itinerary) {
        tp.itinerary.forEach((day: any) => {
          if (day.activities) {
            day.activities.forEach((act: any) => {
              if (act.location) stopsSet.add(act.location.trim());
            });
          }
        });
      }
      const stops = Array.from(stopsSet).slice(0, 5);
      if (stops.length === 0 && tp.destination) {
        stops.push(tp.destination);
      }

      const durationDays = tp.itinerary ? tp.itinerary.length : 1;

      return {
        id: tp._id,
        title: tp.title || `Trip to ${tp.destination || "Unknown Destination"}`,
        duration: `${durationDays} ${durationDays === 1 ? "Day" : "Days"}`,
        type: (tp.isAI ? "AI-Generated" : "Manual") as "AI-Generated" | "Manual",
        description: tp.description || tp.summary || `A travel plan for ${tp.destination}.`,
        stops: stops,
        author: currentUser ? (currentUser.name || "You") : "You",
        completed: tp.status === "completed",
        rawPlan: tp,
      };
    });
  }, [dbTripPlans, currentUser]);

  const journeys = useMemo(() => {
    return [...mappedDbTripPlans, ...localJourneys];
  }, [mappedDbTripPlans, localJourneys]);
  
  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "exp-1",
      tripId: "journey-2",
      amount: 1500,
      category: "Food",
      date: "2026-07-01",
      description: "Local seafood dinner in Gokarna cliffs",
    },
    {
      id: "exp-2",
      tripId: "journey-2",
      amount: 2200,
      category: "Transport",
      date: "2026-07-02",
      description: "Scooter rental and fuel",
    },
    {
      id: "exp-3",
      tripId: "journey-2",
      amount: 4000,
      category: "Stay",
      date: "2026-07-02",
      description: "Beach cottage booking",
    },
    {
      id: "exp-4",
      tripId: "journey-1",
      amount: 12000,
      category: "Transport",
      date: "2026-06-15",
      description: "Leh to Nubra private cab rental",
    },
    {
      id: "exp-5",
      tripId: "journey-1",
      amount: 7500,
      category: "Stay",
      date: "2026-06-16",
      description: "Homestay booking in Hunder",
    }
  ]);

  // Formatted DB expenses
  const formattedDbExpenses = useMemo(() => {
    if (!dbExpenses) return [];
    return dbExpenses.map((e: any) => ({
      id: e._id,
      tripId: e.tripId,
      amount: e.amount,
      category: e.category as Expense["category"],
      date: e.date,
      description: e.description || "",
    }));
  }, [dbExpenses]);

  // Sync expenses with Convex database when authenticated
  useEffect(() => {
    if (isAuthenticated && dbExpenses !== undefined) {
      setExpenses(formattedDbExpenses);
    }
  }, [isAuthenticated, dbExpenses, formattedDbExpenses]);

  const pointsLedger: PointsLedgerEntry[] = useMemo(() => {
    return dbPointsLedger
      ? dbPointsLedger.map((entry) => ({
          id: entry._id,
          action: entry.actionType === "submit_gem" ? "Submit Gem" :
                  entry.actionType === "gem_approved" ? `Approved Hidden Gem: ${entry.referenceId || ""}` :
                  entry.actionType === "review" ? "Written Review" :
                  entry.actionType === "blog" ? "Published Story" : entry.actionType,
          points: entry.pointsEarned,
          date: new Date(entry.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }))
      : MOCK_POINTS_LEDGER;
  }, [dbPointsLedger]);

  // Recalculate leaderboard dynamically
  const leaderboard = useMemo<LeaderboardUser[]>(() => {
    if (!dbLeaderboard || dbLeaderboard.length === 0) return [];
    return dbLeaderboard.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      tier: user.tier,
      points: user.points,
      isVerified: user.isVerified,
      isCurrentUser: currentUser ? user.name === currentUser.name : false,
    }));
  }, [dbLeaderboard, currentUser]);

  // Sync profile tiers when points change
  const updateProfilePointsAndTier = (name: string, pointsDelta: number, ledgerAction: string) => {
    if (!name || (currentUser && name === currentUser.name)) {
      awardPointsMutation({
        pointsEarned: pointsDelta,
        actionType: "client_action",
        referenceId: ledgerAction,
      }).catch(console.error);
    } else {
      awardPointsMutation({
        userName: name,
        pointsEarned: pointsDelta,
        actionType: "client_action",
        referenceId: ledgerAction,
      }).catch(console.error);
    }
  };

  // Switch Profiles (simulated auth)
  const switchProfile = (name: string) => {
    console.log("Profile switching disabled - using Convex Auth");
  };

  const logout = async () => {
    await signOut();
    window.location.href = "/";
  };

  // Wishlist Actions
  const toggleWishlist = async (id: string) => {
    if (isAuthenticated) {
      try {
        await toggleWishlistMutation({ id });
      } catch (err) {
        console.error("Failed to toggle wishlist item on Convex:", err);
      }
    } else {
      // Offline fallback for guest/anonymous users
      setWishlist((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        if (typeof window !== "undefined") {
          localStorage.setItem("safarnama_wishlist", JSON.stringify(next));
        }
        return next;
      });
    }
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  // Expense Tracker Actions
  const addExpense = async (
    tripId: string,
    amount: number,
    category: Expense["category"],
    description: string
  ) => {
    if (isAuthenticated) {
      try {
        const newId = await addExpenseMutation({
          tripId,
          amount,
          category,
          description,
          date: new Date().toISOString().split("T")[0],
        });
        const newExpense: Expense = {
          id: newId,
          tripId,
          amount,
          category,
          date: new Date().toISOString().split("T")[0],
          description,
        };
        setExpenses((prev) => [newExpense, ...prev.filter((e) => e.id !== newId)]);
      } catch (err) {
        console.error("Failed to save expense on Convex:", err);
      }
    } else {
      const newExpense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
        tripId,
        amount,
        category,
        date: new Date().toISOString().split("T")[0],
        description,
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (isAuthenticated && !expenseId.startsWith("exp-")) {
      try {
        await deleteExpenseMutation({ id: expenseId as any });
      } catch (err) {
        console.error("Failed to delete expense on Convex:", err);
      }
    }
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const createCustomTrip = async (trip: {
    title?: string;
    destination: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<string> => {
    const title = trip.title || `Trip to ${trip.destination}`;
    if (isAuthenticated) {
      const tripId = await saveTripPlanMutation({
        title,
        destination: trip.destination,
        description: trip.description || `Travel expenses and details for ${trip.destination}`,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isAI: false,
        status: "planning",
        travelers: 1,
      });
      return tripId;
    } else {
      const newJourney: Journey = {
        id: `journey-${Date.now()}`,
        title,
        duration: "Custom Trip",
        type: "Manual",
        description: trip.description || `Custom trip to ${trip.destination}`,
        stops: [trip.destination],
        author: currentUser ? currentUser.name : "You",
        completed: false,
      };
      setLocalJourneys((prev) => [newJourney, ...prev]);
      return newJourney.id;
    }
  };

  // AI Planner (Local Recommendation First)
  const generateAILocalPlan = (location: string, categories: string[], days: number): PlanDay[] => {
    // 1. Scan our Destinations and Hidden Gems matching location
    const locLower = location.toLowerCase().trim();

    // Filter destinations by location or state
    const matchedDestinations = destinations.filter(
      (d) =>
        d.location.toLowerCase().includes(locLower) ||
        d.state.toLowerCase().includes(locLower)
    );

    // Filter hidden gems by location or state (approved only)
    const matchedGems = hiddenGems.filter(
      (g) =>
        g.status === "approved" &&
        (g.location.toLowerCase().includes(locLower) ||
          g.state.toLowerCase().includes(locLower))
    );

    // Prioritize destinations and gems that match the selected categories
    let prioritizedDestinations = matchedDestinations;
    let prioritizedGems = matchedGems;

    if (categories && categories.length > 0) {
      const catLowers = categories.map((c) => c.toLowerCase());
      
      const categoryDests = matchedDestinations.filter((d) =>
        catLowers.includes(d.category.toLowerCase())
      );
      const otherDests = matchedDestinations.filter((d) =>
        !catLowers.includes(d.category.toLowerCase())
      );
      prioritizedDestinations = [...categoryDests, ...otherDests];

      const categoryGems = matchedGems.filter((g) => {
        const gemCats = g.category.split(",").map((c) => c.trim().toLowerCase());
        return gemCats.some((c) => catLowers.includes(c));
      });
      const otherGems = matchedGems.filter((g) => {
        const gemCats = g.category.split(",").map((c) => c.trim().toLowerCase());
        return !gemCats.some((c) => catLowers.includes(c));
      });
      prioritizedGems = [...categoryGems, ...otherGems];
    }

    const plan: PlanDay[] = [];
    let destIndex = 0;
    let gemIndex = 0;

    // Define fallback AI generation templates
    const fallbackTemplates: Record<string, { titles: string[]; descs: string[] }> = {
      hills: {
        titles: ["Mist-Covered Ridge Hike", "Scenic Valley Lookout", "Lush Mountain Estate Walk", "High-Altitude Peak Panorama"],
        descs: [
          "Embark on a refreshing morning hike to a local ridge in {location} to witness a breathtaking sunrise above the valley gorges.",
          "Take a scenic drive through the high passes of {location}, stopping by panoramic viewpoints of rolling hills and valleys.",
          "Stroll through regional coffee or tea plantations, learning about the local hill agriculture and enjoying a fresh brew.",
          "Hike to a quiet mountain summit in the outskirts of {location}, enjoying a bird's-eye view of the surrounding peaks."
        ]
      },
      beaches: {
        titles: ["Golden Sand Coastline Walk", "Secret Cove Exploration", "Oceanfront Cliff Viewpoint", "Coastal Seafood Trail"],
        descs: [
          "Spend a relaxing morning walking along the warm sandy shores of {location}, watching local wooden fishing boats navigate the waves.",
          "Discover a quiet, sheltered beach cove hidden from the main tracks in {location}, perfect for sunbathing and swimming.",
          "Climb up the coastal headland paths of {location} to view the infinite ocean expanse as waves crash against the rocks below.",
          "Explore the coastal shacks and local markets of {location}, sampling fresh traditional seafood catches and coconut water."
        ]
      },
      heritage: {
        titles: ["Ancient Stone Temple Ruins", "Historical Fort & Monument Trail", "Old Town Heritage Architecture Walk", "Cultural Museum & Craft Bazaar"],
        descs: [
          "Explore the beautifully carved stone temples and ruins in {location}, learning about the ancient history and local legends.",
          "Wander through a massive historical fortress of {location}, exploring its old barracks, grand gates, and watchtowers.",
          "Walk down the historical lanes of {location}, observing preserved heritage houses and traditional regional architecture.",
          "Visit a local folk museum or artisan center in {location} to see standard handloom textiles, woodcrafts, and classical arts."
        ]
      },
      wildlife: {
        titles: ["Eco-Reserve Jungle Safari", "Morning Wetland Bird-Watching", "River Estuary Eco-Cruise", "Canopy Walk Nature Trail"],
        descs: [
          "Take a guided open-jeep tour through the nature reserve in {location} to spot endemic regional wildlife and bird species.",
          "Wake up early for a guided bird-watching walk along the scenic marshes and forest edges of {location}, identifying rare species.",
          "Take a boat cruise down a tranquil river delta or lake in {location} to see migratory birds and riverside fauna.",
          "Hike a lush forest trail in the outskirts of {location}, learning about local plant species and environmental protection efforts."
        ]
      },
      offbeat: {
        titles: ["Secret Waterfall Forest Trek", "Ancient Hidden Caves Discovery", "Remote Outpost Homestay Walk", "Lesser-Known Village Trail"],
        descs: [
          "Follow a hidden trail through dense forest to a secret waterfall in {location}, enjoying a dip in pristine natural waters.",
          "Discover ancient limestone or rock-cut caves tucked away in the countryside of {location}, guided by local folklore.",
          "Visit a remote, traditional settlement in the outskirts of {location} to experience authentic hospitality and a local home-cooked meal.",
          "Explore a serene offbeat trail near {location} that remains completely untouched by modern commercial tourism."
        ]
      },
      spiritual: {
        titles: ["Ancient Monastery Meditation", "Riverside Aarti Gathering", "Sacred Temple Trail Walk", "Quiet Mountain Hermitage"],
        descs: [
          "Visit a peaceful monastic complex in {location} to experience local spiritual chants and a silent meditation session.",
          "Join the locals for a serene evening prayer ceremony by the holy waters or ghats in {location}.",
          "Walk the ancient pilgrim path in {location}, observing sacred rituals and historical shrine structures.",
          "Ascend to a secluded sanctuary nestled in the hills of {location}, enjoying pristine silence and spiritual peace."
        ]
      },
      trek: {
        titles: ["High Mountain Ridge Trek", "Alpine Meadows Crossing", "Rugged Mountain Pass Journey", "Glacial Valley Hiking"],
        descs: [
          "Ascend steep mountain ridges of {location} for panoramic views of surrounding peaks and beautiful valleys.",
          "Trek through lush alpine pastures and wildflower meadows in the higher reaches of {location}.",
          "Navigate a challenging pass or trail in {location}, guided by expert mountaineers.",
          "Walk alongside crystal clear mountain rivers and glacial lakes in the wilderness of {location}."
        ]
      },
      waterfall: {
        titles: ["Secret Jungle Waterfall Hike", "Cascading Gorge Pool Dip", "Multi-tiered Forest Falls View", "Hidden Valley Stream Search"],
        descs: [
          "Follow a scenic stream trail through the jungle of {location} to stumble upon a magnificent secret waterfall.",
          "Swim in the refreshing natural plunge pool beneath a massive cascading waterfall in {location}.",
          "Trek to a viewpoint overlooking a spectacular multi-tiered water cascade deep in the woods of {location}.",
          "Discover quiet streams and cascading spring pools hidden away in the wilderness of {location}."
        ]
      },
      desert: {
        titles: ["Golden Sand Dunes Safari", "Sunset Camel Caravan Trail", "Desert Oasis Heritage Walk", "Starry Night Dunes Camp"],
        descs: [
          "Ride through the sweeping golden sand dunes of {location} in a 4x4 vehicle, experiencing the vast desert landscape.",
          "Embark on a traditional camel ride along the ridges of the desert at sunset in {location}.",
          "Wander through a historical village or oasis in the arid plains of {location}, learning about desert water systems.",
          "Spend an unforgettable evening at a desert campsite in {location}, enjoying traditional music under a star-filled sky."
        ]
      },
      camping: {
        titles: ["Lakeside Starlit Camp", "Forest Canopy Wilderness Camp", "High Peak Basecamp Night", "River Valley Camping Adventure"],
        descs: [
          "Set up camp by a serene freshwater lake in {location}, enjoying a campfire and stargazing under the open sky.",
          "Pitch your tent under the dense canopy of trees in a protected forest area near {location}, listening to the night sounds.",
          "Stay at a high-altitude basecamp in the mountains of {location}, preparing for the morning's peak exploration.",
          "Camp in a lush green valley beside a rushing mountain river in the outskirts of {location}."
        ]
      }
    };

    const defaultTemplates = {
      titles: ["Local Town Center Orientation", "Scenic Regional Vantage Point", "Traditional Heritage Discovery", "Hidden Countryside Trail", "Artisan Market & Spice Walk", "Forest Nature Hike", "Sunset Ridge Farewell"],
      descs: [
        "Orient yourself with a relaxed walk through the town center of {location}, checking out local street food and shops.",
        "Travel to the highest scenic viewpoint around {location} to capture stunning panoramic photos of the landscape.",
        "Explore local monuments and heritage landmarks of {location}, uncovering the cultural history of the area.",
        "Take a peaceful stroll along a lesser-known path in the outskirts of {location}, visiting quiet streams and meadows.",
        "Visit the bustling local market of {location} to see traditional handloom works, spices, and regional crafts.",
        "Take a guided walk through local woods or botanical paths in {location}, appreciating the regional plants and birds.",
        "End the trip with an early evening trek to a scenic ridge in {location} to witness the sunset before departure."
      ]
    };

    // Build template pool based on selected categories
    let activeTitles: string[] = [];
    let activeDescs: string[] = [];

    if (categories && categories.length > 0) {
      categories
        .map((c) => c.toLowerCase())
        .forEach((cat) => {
          if (fallbackTemplates[cat]) {
            activeTitles = [...activeTitles, ...fallbackTemplates[cat].titles];
            activeDescs = [...activeDescs, ...fallbackTemplates[cat].descs];
          }
        });
    }

    if (activeTitles.length === 0) {
      activeTitles = defaultTemplates.titles;
      activeDescs = defaultTemplates.descs;
    }

    // Day-by-day routing
    for (let day = 1; day <= days; day++) {
      // Prioritize putting official destinations on odd days, hidden gems on even days
      if (day % 2 !== 0 && destIndex < prioritizedDestinations.length) {
        const dest = prioritizedDestinations[destIndex++];
        plan.push({
          day,
          title: `Explore ${dest.title}`,
          description: `Visit our verified guide destination: ${dest.description}`,
          location: dest.location,
          sourceName: dest.title,
          sourceType: "official",
        });
      } else if (gemIndex < prioritizedGems.length) {
        const gem = prioritizedGems[gemIndex++];
        plan.push({
          day,
          title: `Discover ${gem.title} (Local Discovery)`,
          description: `Hike to this offbeat hidden gem submitted by community member ${gem.submittedBy}: ${gem.description}`,
          location: gem.location,
          sourceName: gem.title,
          sourceType: "gem",
        });
      } else if (destIndex < prioritizedDestinations.length) {
        const dest = prioritizedDestinations[destIndex++];
        plan.push({
          day,
          title: `Visit ${dest.title}`,
          description: `Take a scenic route around ${dest.title}: ${dest.description}`,
          location: dest.location,
          sourceName: dest.title,
          sourceType: "official",
        });
      } else {
        // Fallback to dynamic AI generation if database runs dry / has no matches
        const templateIndex = (day - 1) % activeTitles.length;
        const rawTitle = activeTitles[templateIndex];
        const rawDesc = activeDescs[templateIndex];

        const displayLocation = location.trim() ? location : "Destination";

        plan.push({
          day,
          title: rawTitle.replace(/{location}/g, displayLocation),
          description: `${rawDesc.replace(/{location}/g, displayLocation)} (Constructed via SafarNama regional AI knowledge)`,
          location: displayLocation,
          sourceName: "SafarNama Regional AI",
          sourceType: "generic",
        });
      }
    }

    return plan;
  };

  // Submit a spot (Convex mutation backed)
  const submitGem = async (
    gem: Omit<
      HiddenGem,
      | "id"
      | "submittedBy"
      | "submitterTier"
      | "submitterVerified"
      | "pointsAwarded"
      | "createdAt"
      | "status"
    >
  ) => {
    return await submitGemMutation({
      title: gem.title,
      description: gem.description,
      location: gem.location,
      state: gem.state,
      category: gem.category,
      photo: gem.photo,
      geo: gem.geo || { lat: 0, lng: 0 },
    });
  };

  // Approve a spot (Convex mutation backed)
  const approveGem = async (gemId: string) => {
    await approveGemMutation({ gemId: gemId as any });
  };

  // Reject a spot (Convex mutation backed)
  const rejectGem = async (gemId: string, reason?: string) => {
    await rejectGemMutation({ gemId: gemId as any, rejectionReason: reason });
  };

  // Add an official destination (Convex mutation backed)
  const addDestination = async (dest: {
    title: string;
    description: string;
    location: string;
    state: string;
    geo: { lat: number; lng: number };
    photos: string[];
    category: string;
    bestTimeToVisit?: string;
    howToReach?: string;
    nearbyAttractions?: string[];
    tips?: string[];
    photoGallery?: string[];
  }) => {
    await addDestinationMutation(dest);
  };

  // Add a Review
  const addReview = (
    review: Omit<Review, "id" | "author" | "authorTier" | "authorVerified" | "date">
  ) => {
    const authorName = currentUser?.name || "Guest";
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString()}`,
      author: authorName,
      authorTier: currentUser?.tier || "Bronze",
      authorVerified: currentUser?.isVerified || false,
      date: "Just now",
    };

    setReviews((prev) => [newReview, ...prev]);
    updateProfilePointsAndTier(
      authorName,
      POINTS.WRITE_REVIEW,
      `Written Review: ${review.title}`
    );
  };

  // Add a Blog Post
  const addBlog = (
    blog: Omit<Blog, "id" | "author" | "authorTier" | "authorVerified" | "date">
  ) => {
    const authorName = currentUser?.name || "Guest";
    const newBlog: Blog = {
      ...blog,
      id: `blog-${Math.random().toString()}`,
      author: authorName,
      authorTier: currentUser?.tier || "Bronze",
      authorVerified: currentUser?.isVerified || false,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setBlogs((prev) => [newBlog, ...prev]);
    updateProfilePointsAndTier(
      authorName,
      POINTS.WRITE_BLOG,
      `Published Story: ${blog.title}`
    );
  };

  // Complete a Trip
  const completeTrip = async (journeyId: string) => {
    const authorName = currentUser?.name || "Guest";
    
    if (journeyId.startsWith("journey-")) {
      setLocalJourneys((prev) =>
        prev.map((journey) => {
          if (journey.id === journeyId && !journey.completed) {
            updateProfilePointsAndTier(
              authorName,
              POINTS.COMPLETE_TRIP,
              `Completed Trip: ${journey.title}`
            );
            return { ...journey, completed: true };
          }
          return journey;
        })
      );
    } else {
      try {
        await completeTripPlanMutation({ id: journeyId as any });
        updateProfilePointsAndTier(
          authorName,
          POINTS.COMPLETE_TRIP,
          `Completed Saved Trip Plan`
        );
      } catch (err) {
        console.error("Failed to complete trip plan:", err);
      }
    }
  };

  // Add a Trip
  const addTrip = (trip: Omit<Journey, "id" | "author" | "completed">) => {
    const newTrip: Journey = {
      ...trip,
      id: `journey-${Math.random().toString()}`,
      author: currentUser?.name || "Guest",
      completed: false,
    };
    setLocalJourneys((prev) => [newTrip, ...prev]);
  };

  // Toggle Verification status for the logged in user
  const toggleUserVerification = () => {
    toggleVerificationMutation().catch(console.error);
  };

  // Moderation functions
  const flagReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((rev) => (rev.id === reviewId ? { ...rev, flagged: !rev.flagged } : rev))
    );
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
  };

  const flagBlog = (blogId: string) => {
    setBlogs((prev) =>
      prev.map((b) => (b.id === blogId ? { ...b, flagged: !b.flagged } : b))
    );
  };

  const deleteBlog = (blogId: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== blogId));
  };

  return (
    <UserContext.Provider
      value={{
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
        isWishlisted,
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
        isAuthenticated,
        isLoading,
        logout,
        mySubmissions,
        notifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
