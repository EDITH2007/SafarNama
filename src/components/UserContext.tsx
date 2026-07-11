"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  currentUser: UserProfile;
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
  // Profiles state
  const [profiles, setProfiles] = useState<UserProfile[]>(AVAILABLE_PROFILES);
  const [currentUserName, setCurrentUserName] = useState<string>("Sneha Gupta");

  const currentUser = profiles.find((p) => p.name === currentUserName) || profiles[0];

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

  const [pointsLedger, setPointsLedger] = useState<PointsLedgerEntry[]>([
    { id: "1", action: "SafarNama Welcoming Gift", points: 50, date: "June 15, 2026" },
    { id: "2", action: "Written Review: Munnar Tea Hills", points: 30, date: "June 25, 2026" },
    { id: "3", action: "Completed Journey: Coastal Gokarna Trek", points: 50, date: "July 02, 2026" },
    { id: "4", action: "Logged trip expenses to Munnar", points: 50, date: "July 08, 2026" },
  ]);

  // Recalculate leaderboard dynamically
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    // Dynamically build the leaderboard from our profile states
    const sorted = [...profiles].sort((a, b) => b.points - a.points);
    const ranked = sorted.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      tier: user.tier,
      points: user.points,
      isVerified: user.isVerified,
      isCurrentUser: user.name === currentUser.name,
    }));
    setLeaderboard(ranked);
  }, [profiles, currentUser.name]);

  // Sync profile tiers when points change
  const updateProfilePointsAndTier = (name: string, pointsDelta: number, ledgerAction: string) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    setProfiles((prev) =>
      prev.map((prof) => {
        if (prof.name === name) {
          const nextPoints = prof.points + pointsDelta;
          const nextTier = getTier(nextPoints);
          return {
            ...prof,
            points: nextPoints,
            tier: nextTier,
          };
        }
        return prof;
      })
    );

    // Only add to points ledger if it is the current logged-in user
    if (name === currentUser.name) {
      setPointsLedger((prev) => [
        {
          id: Math.random().toString(),
          action: ledgerAction,
          points: pointsDelta,
          date: today,
        },
        ...prev,
      ]);
    }
  };

  // Switch Profiles (simulated auth)
  const switchProfile = (name: string) => {
    if (profiles.some((p) => p.name === name)) {
      setCurrentUserName(name);
    }
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
      submittedBy: currentUser.name,
      submitterTier: currentUser.tier,
      submitterVerified: currentUser.isVerified,
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
    const newReview: Review = {
      ...review,
      id: `rev-${Math.random().toString()}`,
      author: currentUser.name,
      authorTier: currentUser.tier,
      authorVerified: currentUser.isVerified,
      date: "Just now",
    };

    setReviews((prev) => [newReview, ...prev]);
    updateProfilePointsAndTier(
      currentUser.name,
      POINTS.WRITE_REVIEW,
      `Written Review: ${review.title}`
    );
  };

  // Add a Blog Post
  const addBlog = (
    blog: Omit<Blog, "id" | "author" | "authorTier" | "authorVerified" | "date">
  ) => {
    const newBlog: Blog = {
      ...blog,
      id: `blog-${Math.random().toString()}`,
      author: currentUser.name,
      authorTier: currentUser.tier,
      authorVerified: currentUser.isVerified,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setBlogs((prev) => [newBlog, ...prev]);
    updateProfilePointsAndTier(
      currentUser.name,
      POINTS.WRITE_BLOG,
      `Published Story: ${blog.title}`
    );
  };

  // Complete a Trip
  const completeTrip = (journeyId: string) => {
    setJourneys((prev) =>
      prev.map((journey) => {
        if (journey.id === journeyId && !journey.completed) {
          updateProfilePointsAndTier(
            currentUser.name,
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
      author: currentUser.name,
      completed: false,
    };
    setJourneys((prev) => [newTrip, ...prev]);
  };

  // Toggle Verification status for the logged in user
  const toggleUserVerification = () => {
    setProfiles((prev) =>
      prev.map((p) => (p.name === currentUser.name ? { ...p, isVerified: !p.isVerified } : p))
    );
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
