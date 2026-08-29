import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUsersSeeded, calculateUserTier } from "./users";

// Initial seed guides and packages
export const INITIAL_GUIDES = [
  {
    name: "Tenzing Norgay",
    email: "tenzing.guide@safarnama.com",
    tier: "Platinum",
    totalPoints: 5200,
    isVerified: true,
    bio: "Native Himalayan high-altitude trekker with 12+ years leading offbeat trails in Himachal, Ladakh, and Zanskar. Certified wilderness first responder.",
    homeTown: "Manali, Himachal Pradesh",
    guideProfile: {
      bio: "Native Himalayan high-altitude trekker with 12+ years leading offbeat trails in Himachal, Ladakh, and Zanskar. Certified wilderness first responder.",
      languagesSpoken: ["English", "Hindi", "Pahari", "Tibetan"],
      destinationsCovered: ["Manali", "Ladakh", "Zanskar", "Spiti Valley", "Kasol"],
      yearsExperience: 12,
      pricePerDayINR: 3500,
      isActiveGuide: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
    },
    packages: [
      {
        title: "Hidden Glacial Pass & Valley Trek",
        description: "3-day offbeat alpine expedition through pristine glacial streams, pine forests, and high altitude camps.",
        durationDays: 3,
        priceINR: 9500,
        includes: ["High-Altitude Equipment", "Organic Meals", "Safety Gear", "Local Camping Permits"],
        destinationId: "Manali",
      },
      {
        title: "Spiti Monastery & Stargazing Culture Trail",
        description: "2-day immersive cultural journey through ancient mud monasteries, local homestays, and dark-sky astronomy spots.",
        durationDays: 2,
        priceINR: 6500,
        includes: ["Local Transport", "Monastery Entry Fees", "Homestay Meals", "Stargazing Telescope"],
        destinationId: "Spiti Valley",
      },
    ],
  },
  {
    name: "Sneha Gupta",
    email: "sneha.guide@safarnama.com",
    tier: "Gold",
    totalPoints: 3400,
    isVerified: true,
    bio: "Archaeological enthusiast & heritage storyteller from Hampi. Passionate about Vijayanagara architecture, ancient ruins, and boulder climbing trails.",
    homeTown: "Hampi, Karnataka",
    guideProfile: {
      bio: "Archaeological enthusiast & heritage storyteller from Hampi. Passionate about Vijayanagara architecture, ancient ruins, and boulder climbing trails.",
      languagesSpoken: ["English", "Hindi", "Kannada", "Telugu"],
      destinationsCovered: ["Hampi", "Badami", "Gokarna", "Chikmagalur"],
      yearsExperience: 7,
      pricePerDayINR: 2800,
      isActiveGuide: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    },
    packages: [
      {
        title: "Lost Ruins of Vijayanagara Dawn Walk",
        description: "Full day curated heritage walk through hidden boulder temples, royal enclosures, and sunset points across the Tungabhadra.",
        durationDays: 1,
        priceINR: 3200,
        includes: ["Temple Entry Fees", "Coracle Boat Ride", "Traditional South Indian Lunch", "Camera Permit Fees"],
        destinationId: "Hampi",
      },
      {
        title: "Gokarna Cliffside & Secret Beach Hop",
        description: "2-day coastal trail traversing Paradise Beach, Half Moon Beach, and cliffside sunset meditation spots.",
        durationDays: 2,
        priceINR: 5400,
        includes: ["Beachside Camping Gear", "Fresh Seafood Lunch", "Coracle Ride"],
        destinationId: "Gokarna",
      },
    ],
  },
  {
    name: "Aarav Sharma",
    email: "aarav.guide@safarnama.com",
    tier: "Gold",
    totalPoints: 2900,
    isVerified: true,
    bio: "Tea planter & wildlife enthusiast based in Kerala's Western Ghats. Specialized in secret waterfall hikes, spice garden walks, and night safari trails.",
    homeTown: "Munnar, Kerala",
    guideProfile: {
      bio: "Tea planter & wildlife enthusiast based in Kerala's Western Ghats. Specialized in secret waterfall hikes, spice garden walks, and night safari trails.",
      languagesSpoken: ["English", "Hindi", "Malayalam", "Tamil"],
      destinationsCovered: ["Munnar", "Wayanad", "Alleppey", "Thekkady"],
      yearsExperience: 5,
      pricePerDayINR: 2500,
      isActiveGuide: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
    },
    packages: [
      {
        title: "Munnar Secret Tea & Waterfall Exploration",
        description: "Full day trek through private tea estates, cardamom spice trails, and a hidden natural waterfall pool.",
        durationDays: 1,
        priceINR: 2900,
        includes: ["Spice Tasting Session", "Organic Keralan Lunch", "Jeep Transfers", "Trekking Pole"],
        destinationId: "Munnar",
      },
    ],
  },
];

// Helper to seed guides and their packages
export async function ensureGuidesSeeded(db: any) {
  await ensureUsersSeeded(db);

  // Check if any active guide exists
  const allUsers = await db.query("users").collect();
  const existingActiveGuide = allUsers.find(
    (u: any) => u.guideProfile && u.guideProfile.isActiveGuide === true
  );

  if (!existingActiveGuide) {
    for (const item of INITIAL_GUIDES) {
      let user = allUsers.find((u: any) => u.email === item.email);
      let userId;

      if (!user) {
        userId = await db.insert("users", {
          name: item.name,
          email: item.email,
          tier: item.tier,
          totalPoints: item.totalPoints,
          isVerified: item.isVerified,
          bio: item.bio,
          homeTown: item.homeTown,
          role: "user",
          guideProfile: item.guideProfile,
        });
      } else {
        userId = user._id;
        await db.patch(userId, {
          guideProfile: item.guideProfile,
          tier: item.tier,
        });
      }

      // Seed packages for this guide if none exist
      const existingPackages = await db
        .query("guidePackages")
        .withIndex("by_guide", (q: any) => q.eq("guideId", userId))
        .collect();

      if (existingPackages.length === 0) {
        for (const pkg of item.packages) {
          await db.insert("guidePackages", {
            guideId: userId,
            title: pkg.title,
            description: pkg.description,
            durationDays: pkg.durationDays,
            priceINR: pkg.priceINR,
            includes: pkg.includes,
            destinationId: pkg.destinationId,
            createdAt: Date.now(),
          });
        }
      }
    }
  }
}

// List all active guides filterable by destination and language
export const listGuides = query({
  args: {
    destination: v.optional(v.string()),
    language: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();

    // Filter users who have an active guide profile
    const activeGuideUsers = users.filter((u) => {
      if (!u.guideProfile || !u.guideProfile.isActiveGuide) return false;

      // Check destination filter
      if (args.destination && args.destination !== "All") {
        const destMatch = u.guideProfile.destinationsCovered?.some((d) =>
          d.toLowerCase().includes(args.destination!.toLowerCase())
        );
        if (!destMatch) return false;
      }

      // Check language filter
      if (args.language && args.language !== "All") {
        const langMatch = u.guideProfile.languagesSpoken?.some((l) =>
          l.toLowerCase().includes(args.language!.toLowerCase())
        );
        if (!langMatch) return false;
      }

      // Check search filter (matches name, bio, homeTown, destinations)
      if (args.search && args.search.trim() !== "") {
        const queryStr = args.search.toLowerCase();
        const nameMatch = u.name?.toLowerCase().includes(queryStr);
        const bioMatch = u.guideProfile.bio?.toLowerCase().includes(queryStr);
        const homeMatch = u.homeTown?.toLowerCase().includes(queryStr);
        const destsMatch = u.guideProfile.destinationsCovered?.some((d) =>
          d.toLowerCase().includes(queryStr)
        );
        if (!nameMatch && !bioMatch && !homeMatch && !destsMatch) return false;
      }

      return true;
    });

    const results = [];
    for (const u of activeGuideUsers) {
      // Fetch packages count
      const packages = await ctx.db
        .query("guidePackages")
        .withIndex("by_guide", (q) => q.eq("guideId", u._id))
        .collect();

      // Fetch reviews
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_guide", (q) => q.eq("guideId", u._id))
        .collect();

      const avgRating =
        reviews.length > 0
          ? Number(
              (
                reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
              ).toFixed(1)
            )
          : 4.9; // Fallback default rating for verified community members

      results.push({
        _id: u._id,
        id: u._id,
        name: u.name || u.email?.split("@")[0] || "Explorer Guide",
        email: u.email,
        image: u.image,
        tier: (u.tier || "Gold") as "Bronze" | "Silver" | "Gold" | "Platinum",
        totalPoints: u.totalPoints ?? 2500,
        isVerified: u.isVerified ?? true,
        homeTown: u.homeTown || "India",
        avatar: (u.name || u.email || "EG")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        guideProfile: u.guideProfile,
        packagesCount: packages.length,
        rating: avgRating,
        reviewCount: Math.max(reviews.length, 12),
      });
    }

    return results.sort((a, b) => b.totalPoints - a.totalPoints);
  },
});

// Get a single guide's detailed profile including packages and reviews
export const getGuide = query({
  args: { guideId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.guideId);
    if (!user) return null;

    const packages = await ctx.db
      .query("guidePackages")
      .withIndex("by_guide", (q) => q.eq("guideId", args.guideId))
      .collect();

    const rawReviews = await ctx.db
      .query("reviews")
      .withIndex("by_guide", (q) => q.eq("guideId", args.guideId))
      .collect();

    const reviews = [];
    for (const r of rawReviews) {
      const author = await ctx.db.get(r.author);
      reviews.push({
        _id: r._id,
        id: r._id,
        rating: r.rating,
        text: r.text,
        createdAt: r.createdAt,
        authorName: author?.name || author?.email?.split("@")[0] || "Traveler",
        authorAvatar: (author?.name || author?.email || "TR")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        authorTier: author?.tier || "Bronze",
        authorVerified: author?.isVerified || false,
      });
    }

    const avgRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            ).toFixed(1)
          )
        : 4.9;

    return {
      _id: user._id,
      id: user._id,
      name: user.name || user.email?.split("@")[0] || "Local Guide",
      email: user.email,
      image: user.image,
      tier: (user.tier || "Gold") as "Bronze" | "Silver" | "Gold" | "Platinum",
      totalPoints: user.totalPoints ?? 2500,
      isVerified: user.isVerified ?? true,
      homeTown: user.homeTown || "India",
      avatar: (user.name || user.email || "LG")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase(),
      guideProfile: user.guideProfile,
      packages,
      reviews,
      rating: avgRating,
      reviewCount: Math.max(reviews.length, 12),
    };
  },
});

// Toggle Guide Mode & update guide profile details (requires Gold/Platinum Explorer)
export const toggleGuideMode = mutation({
  args: {
    bio: v.string(),
    languagesSpoken: v.array(v.string()),
    destinationsCovered: v.array(v.string()),
    yearsExperience: v.number(),
    pricePerDayINR: v.number(),
    isActiveGuide: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to activate Guide Mode");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User record not found");
    }

    // Verify Gold Explorer+ eligibility
    const isGoldOrPlatinum = user.tier === "Gold" || user.tier === "Platinum";
    const hasEnoughPoints = (user.totalPoints ?? 0) >= 2500;

    if (!isGoldOrPlatinum && !hasEnoughPoints) {
      throw new Error(
        "Gold Explorer+ status (2,500+ PTS or 5+ approved contributions) is required to become a verified local guide."
      );
    }

    const updatedProfile = {
      bio: args.bio,
      languagesSpoken: args.languagesSpoken,
      destinationsCovered: args.destinationsCovered,
      yearsExperience: args.yearsExperience,
      pricePerDayINR: args.pricePerDayINR,
      isActiveGuide: args.isActiveGuide,
      createdAt: user.guideProfile?.createdAt || Date.now(),
    };

    await ctx.db.patch(userId, {
      guideProfile: updatedProfile,
    });

    return { success: true, guideProfile: updatedProfile };
  },
});

// Create a new fixed guide package
export const createPackage = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    durationDays: v.number(),
    priceINR: v.number(),
    includes: v.array(v.string()),
    destinationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to create a package");
    }

    const user = await ctx.db.get(userId);
    if (!user || !user.guideProfile?.isActiveGuide) {
      throw new Error("Must be an active guide to create packages");
    }

    const packageId = await ctx.db.insert("guidePackages", {
      guideId: userId,
      title: args.title,
      description: args.description,
      durationDays: args.durationDays,
      priceINR: args.priceINR,
      includes: args.includes,
      destinationId: args.destinationId,
      createdAt: Date.now(),
    });

    return packageId;
  },
});

// Delete a guide package
export const deletePackage = mutation({
  args: { packageId: v.id("guidePackages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const pkg = await ctx.db.get(args.packageId);
    if (!pkg) {
      throw new Error("Package not found");
    }

    const user = await ctx.db.get(userId);
    if (pkg.guideId !== userId && user?.role !== "admin") {
      throw new Error("Unauthorized to delete this package");
    }

    await ctx.db.delete(args.packageId);
    return { success: true };
  },
});

// Create a booking (either fixed package or custom request)
export const createBooking = mutation({
  args: {
    guideId: v.id("users"),
    packageId: v.optional(v.id("guidePackages")),
    customRequestDetails: v.optional(v.string()),
    startDate: v.string(),
    numTravelers: v.number(),
    totalPriceINR: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Please sign in to book a local guide");
    }

    const guide = await ctx.db.get(args.guideId);
    if (!guide || !guide.guideProfile?.isActiveGuide) {
      throw new Error("Selected local guide is currently inactive");
    }

    const bookingId = await ctx.db.insert("guideBookings", {
      guideId: args.guideId,
      userId,
      packageId: args.packageId,
      customRequestDetails: args.customRequestDetails,
      startDate: args.startDate,
      numTravelers: args.numTravelers,
      status: "requested",
      totalPriceINR: args.totalPriceINR,
      createdAt: Date.now(),
    });

    // Notify guide of incoming request
    await ctx.db.insert("notifications", {
      userId: args.guideId,
      message: `New guide booking request from a traveler for ${args.startDate} (${args.numTravelers} traveler(s)).`,
      read: false,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

// Update booking status (Guide accepts, declines, or marks completed)
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("guideBookings"),
    status: v.string(), // "confirmed" | "declined" | "completed"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking record not found");
    }

    if (booking.guideId !== userId) {
      throw new Error("Only the assigned guide can update this booking status");
    }

    const patch: any = { status: args.status };

    // If marking as completed, award 250 points to the guide
    if (args.status === "completed" && booking.status !== "completed") {
      const pointsToAward = 250;
      patch.pointsEarned = pointsToAward;

      const guide = await ctx.db.get(userId);
      if (guide) {
        const newTotal = (guide.totalPoints ?? 0) + pointsToAward;
        const newTier = await calculateUserTier(ctx.db, userId);

        await ctx.db.patch(userId, {
          totalPoints: newTotal,
          tier: newTier,
        });

        await ctx.db.insert("pointsLedger", {
          userId,
          actionType: "guide_booking_completed",
          pointsEarned: pointsToAward,
          timestamp: Date.now(),
          referenceId: booking._id,
        });
      }
    }

    await ctx.db.patch(args.bookingId, patch);

    // Send notification to traveler
    const travelerNotifMsg =
      args.status === "confirmed"
        ? `Your guide booking request for ${booking.startDate} has been CONFIRMED by the guide!`
        : args.status === "declined"
        ? `Your guide booking request for ${booking.startDate} was declined.`
        : `Your guide booking for ${booking.startDate} has been marked COMPLETED. Hope you had a great experience!`;

    await ctx.db.insert("notifications", {
      userId: booking.userId,
      message: travelerNotifMsg,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true, status: args.status };
  },
});

// Get user bookings (both as traveler and as guide)
export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { asTraveler: [], asGuide: [] };

    const travelerBookingsRaw = await ctx.db
      .query("guideBookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const guideBookingsRaw = await ctx.db
      .query("guideBookings")
      .withIndex("by_guide", (q) => q.eq("guideId", userId))
      .collect();

    const asTraveler = [];
    for (const b of travelerBookingsRaw) {
      const guide = await ctx.db.get(b.guideId);
      let packageTitle = "Custom Guided Experience";
      if (b.packageId) {
        const pkg = await ctx.db.get(b.packageId);
        if (pkg) packageTitle = pkg.title;
      }
      asTraveler.push({
        ...b,
        id: b._id,
        guideName: guide?.name || "Local Guide",
        guideAvatar: (guide?.name || "LG")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        guideTier: guide?.tier || "Gold",
        packageTitle,
      });
    }

    const asGuide = [];
    for (const b of guideBookingsRaw) {
      const traveler = await ctx.db.get(b.userId);
      let packageTitle = "Custom Guided Experience";
      if (b.packageId) {
        const pkg = await ctx.db.get(b.packageId);
        if (pkg) packageTitle = pkg.title;
      }
      asGuide.push({
        ...b,
        id: b._id,
        travelerName: traveler?.name || traveler?.email?.split("@")[0] || "Traveler",
        travelerAvatar: (traveler?.name || traveler?.email || "TR")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        travelerEmail: traveler?.email,
        packageTitle,
      });
    }

    return {
      asTraveler: asTraveler.sort((a, b) => b.createdAt - a.createdAt),
      asGuide: asGuide.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});

// Add a review for a guide
export const addGuideReview = mutation({
  args: {
    guideId: v.id("users"),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to leave a review");
    }

    const reviewId = await ctx.db.insert("reviews", {
      guideId: args.guideId,
      author: userId,
      rating: args.rating,
      text: args.text,
      createdAt: Date.now(),
      flagged: false,
    });

    return reviewId;
  },
});
