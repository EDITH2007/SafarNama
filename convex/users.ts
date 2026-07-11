import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const INITIAL_PROFILES = [
  {
    name: "Sneha Gupta",
    totalPoints: 180,
    tier: "Bronze",
    isVerified: false,
    image: "SG",
    bio: "Passionate wanderer exploring the offbeat trails of Southern India. Always searching for the next secret beach.",
    homeTown: "Bengaluru, Karnataka",
    role: "user",
  },
  {
    name: "Priya Patel",
    totalPoints: 1050,
    tier: "Silver",
    isVerified: true,
    image: "PP",
    bio: "Climbing high mountain passes and capturing hidden trails across Ladakh and Himachal. Local legend in high-altitude planning.",
    homeTown: "Manali, Himachal Pradesh",
    role: "user",
  },
  {
    name: "Tenzing Norgay",
    totalPoints: 2600,
    tier: "Gold",
    isVerified: true,
    image: "TN",
    bio: "Pioneering high-altitude routes and cave monasteries in the Zanskar range. Certified safety guide and local elder.",
    homeTown: "Leh, Ladakh",
    role: "admin",
  },
  {
    name: "Aarav Sharma",
    totalPoints: 1200,
    tier: "Silver",
    isVerified: false,
    image: "AS",
    bio: "Exploring heritage sites, ancient ruins, and local street eats in Karnataka and Andhra Pradesh.",
    homeTown: "Hampi, Karnataka",
    role: "user",
  }
];

export async function ensureUsersSeeded(db: any) {
  const anyUser = await db.query("users").first();
  if (!anyUser) {
    for (const profile of INITIAL_PROFILES) {
      await db.insert("users", profile);
    }
  }
}

// Helper to determine tier from points
export function calculateTier(points: number): "Explorer" | "Trailblazer" | "Local Legend" {
  if (points >= 2500) return "Local Legend";
  if (points >= 1000) return "Trailblazer";
  return "Explorer";
}

// Get user profile details
export const getUser = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await ensureUsersSeeded(ctx.db);
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
  },
});

// Update a user's role (Admin gated)
export const updateRole = mutation({
  args: {
    adminUserName: v.string(),
    targetUserName: v.string(),
    role: v.string(), // "user" | "admin"
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.adminUserName))
      .first();
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can assign roles");
    }

    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.targetUserName))
      .first();
    if (targetUser) {
      await ctx.db.patch(targetUser._id, { role: args.role });
    }
  },
});

// Award points mutation
export const awardPoints = mutation({
  args: {
    userName: v.string(),
    actionType: v.string(), // "submit_gem" | "gem_approved" | "review" | "blog"
    pointsEarned: v.number(),
    referenceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.userName))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    const newPoints = user.totalPoints + args.pointsEarned;
    const newTier = calculateTier(newPoints);

    // Update user profile
    await ctx.db.patch(user._id, {
      totalPoints: newPoints,
      tier: newTier,
    });

    // Add entry in pointsLedger
    await ctx.db.insert("pointsLedger", {
      userId: user._id,
      actionType: args.actionType,
      pointsEarned: args.pointsEarned,
      timestamp: Date.now(),
      referenceId: args.referenceId,
    });

    return { totalPoints: newPoints, tier: newTier };
  },
});

// Query user standings for the Leaderboard
export const getLeaderboard = query({
  handler: async (ctx) => {
    await ensureUsersSeeded(ctx.db);
    const users = await ctx.db
      .query("users")
      .collect();

    // Sort by points descending
    const sorted = users.sort((a, b) => b.totalPoints - a.totalPoints);

    return sorted.map((u, index) => ({
      rank: index + 1,
      id: u._id,
      name: u.name || "Anonymous",
      tier: u.tier,
      points: u.totalPoints,
      isVerified: u.isVerified,
    }));
  },
});
