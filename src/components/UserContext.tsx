"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  getTier,
  mockHiddenGems,
  mockBlogs,
  mockReviews,
  mockJourneys,
  mockDestinations,
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

interface UserContextType {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  switchProfile: (name: string) => void;
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
  addExpense: (tripId: string, amount: number, category: Expense["category"], description: string) => void;
  generateAILocalPlan: (location: string, category: string, days: number) => PlanDay[];
  submitGem: (gem: Omit<HiddenGem, "id" | "submittedBy" | "submitterTier" | "submitterVerified" | "pointsAwarded" | "createdAt" | "status">) => void;
  approveGem: (gemId: string) => void;
  rejectGem: (gemId: string, reason?: string) => void;
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const AVAILABLE_PROFILES: UserProfile[] = [
  {
    name: "Sneha Gupta",
    points: 180,
    tier: "Bronze",
    isVerified: false,
    avatar: "SG",
    bio: "Passionate wanderer exploring the offbeat trails of Southern India. Always searching for the next secret beach.",
    homeTown: "Bengaluru, Karnataka",
    role: "user",
  },
  {
    name: "Priya Patel",
    points: 1050,
    tier: "Silver",
    isVerified: true,
    avatar: "PP",
    bio: "Climbing high mountain passes and capturing hidden trails across Ladakh and Himachal. Local legend in high-altitude planning.",
    homeTown: "Manali, Himachal Pradesh",
    role: "user",
  },
  {
    name: "Tenzing Norgay",
    points: 2600,
    tier: "Gold",
    isVerified: true,
    avatar: "TN",
    bio: "Pioneering high-altitude routes and cave monasteries in the Zanskar range. Certified safety guide and local elder.",
    homeTown: "Leh, Ladakh",
    role: "admin",
  },
  {
    name: "Aarav Sharma",
    points: 1200,
    tier: "Silver",
    isVerified: false,
    avatar: "AS",
    bio: "Exploring heritage sites, ancient ruins, and local street eats in Karnataka and Andhra Pradesh.",
    homeTown: "Hampi, Karnataka",
    role: "user",
  }
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);

  const awardPointsMutation = useMutation(api.users.awardPoints);
  const toggleVerificationMutation = useMutation(api.users.toggleVerification);
  const dbPointsLedger = useQuery(api.users.getPointsLedger);
  const rawLeaderboard = useQuery(api.users.getLeaderboard);
  const dbLeaderboard = rawLeaderboard || [];
  
  const seedDatabase = useMutation(api.seed.seedDatabase);

  useEffect(() => {
    if (rawLeaderboard !== undefined && rawLeaderboard.length === 0) {
      seedDatabase().catch((err) => {
        console.error("Autoseeding failed:", err);
      });
    }
  }, [rawLeaderboard, seedDatabase]);

  const placeholderUser: UserProfile = {
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

  const currentUser: UserProfile | null = viewer
    ? {
        id: viewer._id,
        name: viewer.name || viewer.email?.split("@")[0] || "Traveler",
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
    ? placeholderUser
    : null;

  const profiles: UserProfile[] = dbLeaderboard.map((u) => ({
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

  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>(mockHiddenGems);
  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [journeys, setJourneys] = useState<Journey[]>(mockJourneys);
  const [wishlist, setWishlist] = useState<string[]>(["dest-1", "gem-2"]);
  
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

  const pointsLedger: PointsLedgerEntry[] = dbPointsLedger
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
    : [
        { id: "1", action: "SafarNama Welcoming Gift", points: 50, date: "June 15, 2026" },
        { id: "2", action: "Written Review: Munnar Tea Hills", points: 30, date: "June 25, 2026" },
        { id: "3", action: "Completed Journey: Coastal Gokarna Trek", points: 50, date: "July 02, 2026" },
        { id: "4", action: "Logged trip expenses to Munnar", points: 50, date: "July 08, 2026" },
      ];

  // Recalculate leaderboard dynamically
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    if (dbLeaderboard && dbLeaderboard.length > 0) {
      const ranked = dbLeaderboard.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        tier: user.tier,
        points: user.points,
        isVerified: user.isVerified,
        isCurrentUser: currentUser ? user.name === currentUser.name : false,
      }));
      setLeaderboard(ranked);
    }
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
  };

  // Wishlist Actions
  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  // Expense Tracker Actions
  const addExpense = (
    tripId: string,
    amount: number,
    category: Expense["category"],
    description: string
  ) => {
    const newExpense: Expense = {
      id: `exp-${Math.random().toString()}`,
      tripId,
      amount,
      category,
      date: new Date().toISOString().split("T")[0],
      description,
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  // AI Planner (Local Recommendation First)
  const generateAILocalPlan = (location: string, category: string, days: number): PlanDay[] => {
    // 1. Scan our Destinations and Hidden Gems matching location or category
    const locLower = location.toLowerCase();
    const catLower = category.toLowerCase();

    // Filter local destinations
    const matchedDestinations = mockDestinations.filter(
      (d) =>
        d.location.toLowerCase().includes(locLower) ||
        d.state.toLowerCase().includes(locLower) ||
        d.category.toLowerCase().includes(catLower)
    );

    // Filter local hidden gems (approved only)
    const matchedGems = hiddenGems.filter(
      (g) =>
        g.status === "approved" &&
        (g.location.toLowerCase().includes(locLower) ||
          g.state.toLowerCase().includes(locLower) ||
          g.category.toLowerCase().includes(catLower))
    );

    const plan: PlanDay[] = [];
    let destIndex = 0;
    let gemIndex = 0;

    // Day-by-day routing
    for (let day = 1; day <= days; day++) {
      // Prioritize putting official destinations on odd days, hidden gems on even days
      if (day % 2 !== 0 && destIndex < matchedDestinations.length) {
        const dest = matchedDestinations[destIndex++];
        plan.push({
          day,
          title: `Explore ${dest.title}`,
          description: `Visit our verified guide destination: ${dest.description}`,
          location: dest.location,
          sourceName: dest.title,
          sourceType: "official",
        });
      } else if (gemIndex < matchedGems.length) {
        const gem = matchedGems[gemIndex++];
        plan.push({
          day,
          title: `Discover ${gem.title} (Local Discovery)`,
          description: `Hike to this offbeat hidden gem submitted by community member ${gem.submittedBy}: ${gem.description}`,
          location: gem.location,
          sourceName: gem.title,
          sourceType: "gem",
        });
      } else if (destIndex < matchedDestinations.length) {
        const dest = matchedDestinations[destIndex++];
        plan.push({
          day,
          title: `Visit ${dest.title}`,
          description: `Take a scenic route around ${dest.title}: ${dest.description}`,
          location: dest.location,
          sourceName: dest.title,
          sourceType: "official",
        });
      } else {
        // Fallback to generic AI generation if database runs dry
        const fallbackOptions = [
          {
            title: "Scenic Vantage Trek",
            desc: "Embark on an early morning hike to the local ridge to see sunrise over the valley gorges, popular among local villagers.",
            loc: `${location} Outskirts`,
          },
          {
            title: "Traditional Craft & Spice Market Walk",
            desc: "Wander the old local markets, interacting with native handloom artisans and exploring traditional regional kitchens.",
            loc: `${location} Town Center`,
          },
          {
            title: "Local Secret Meadow Rest",
            desc: "Relax by the crystal clear stream running through the pine valleys, ideal for a quiet afternoon picnic.",
            loc: `Rural ${location}`,
          }
        ];
        
        const fallback = fallbackOptions[(day - 1) % fallbackOptions.length];
        
        plan.push({
          day,
          title: fallback.title,
          description: `${fallback.desc} (Constructed via SafarNama regional search)`,
          location: fallback.loc,
          sourceName: "SafarNama Regional AI",
          sourceType: "generic",
        });
      }
    }

    return plan;
  };

  // Submit a spot (Starts as pending)
  const submitGem = (
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
    const newGem: HiddenGem = {
      ...gem,
      id: `gem-${Math.random().toString()}`,
      submittedBy: currentUser?.name || "Guest",
      submitterTier: currentUser?.tier || "Bronze",
      submitterVerified: currentUser?.isVerified || false,
      pointsAwarded: POINTS.SUBMIT_GEM,
      createdAt: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      status: "pending",
    };

    setHiddenGems((prev) => [newGem, ...prev]);
  };

  // Approve a spot
  const approveGem = (gemId: string) => {
    setHiddenGems((prev) =>
      prev.map((gem) => {
        if (gem.id === gemId && gem.status === "pending") {
          // Award points to the submitter (whichever user profile submitted it)
          updateProfilePointsAndTier(
            gem.submittedBy,
            POINTS.SUBMIT_GEM,
            `Approved Hidden Gem: ${gem.title}`
          );
          return { ...gem, status: "approved" };
        }
        return gem;
      })
    );
  };

  // Reject a spot
  const rejectGem = (gemId: string, reason?: string) => {
    setHiddenGems((prev) =>
      prev.map((gem) => {
        if (gem.id === gemId && gem.status === "pending") {
          return {
            ...gem,
            status: "rejected",
            rejectionReason: reason || "Did not meet submission guidelines",
          };
        }
        return gem;
      })
    );
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
  const completeTrip = (journeyId: string) => {
    const authorName = currentUser?.name || "Guest";
    setJourneys((prev) =>
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
  };

  // Add a Trip
  const addTrip = (trip: Omit<Journey, "id" | "author" | "completed">) => {
    const newTrip: Journey = {
      ...trip,
      id: `journey-${Math.random().toString()}`,
      author: currentUser?.name || "Guest",
      completed: false,
    };
    setJourneys((prev) => [newTrip, ...prev]);
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
        generateAILocalPlan,
        submitGem,
        approveGem,
        rejectGem,
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
