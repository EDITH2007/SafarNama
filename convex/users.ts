import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const INITIAL_PROFILES = [
  {
    name: "System Admin",
    email: "230107anu@gmail.com",
    totalPoints: 0,
    tier: "Bronze",
    isVerified: true,
    image: "SA",
    bio: "SafarNama System Administrator",
    homeTown: "SafarNama HQ",
    role: "admin",
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
export function calculateTier(points: number): "Bronze" | "Silver" | "Gold" {
  if (points >= 2500) return "Gold";
  if (points >= 1000) return "Silver";
  return "Bronze";
}

// Get user profile details
export const getUser = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
  },
});

// Fetch current authenticated user
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    // Automatically determine admin role if email is specific admin email
    const isAdminEmail = user.email?.trim().toLowerCase() === "230107anu@gmail.com";
    const finalRole = isAdminEmail ? "admin" : (user.role || "user");

    return {
      ...user,
      name: user.name || user.email?.split("@")[0] || "Traveler",
      tier: (user.tier || "Bronze") as "Bronze" | "Silver" | "Gold",
      totalPoints: user.totalPoints ?? 0,
      isVerified: user.isVerified ?? false,
      role: finalRole,
    };
  },
});

// Ensure admin role for specific admin email, and demote unauthorized admins
export const ensureAdminStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    if (user.email && user.email.trim().toLowerCase() === "230107anu@gmail.com") {
      if (user.role !== "admin") {
        await ctx.db.patch(userId, { role: "admin" });
        return true;
      }
    } else {
      if (user.role === "admin") {
        await ctx.db.patch(userId, { role: "user" });
        return true;
      }
    }
    return false;
  }
});

// Clean up fake/seeded users from database
export const removeFakeUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const fakeNames = ["Sneha Gupta", "Priya Patel", "Tenzing Norgay", "Aarav Sharma"];
    const users = await ctx.db.query("users").collect();
    let count = 0;
    for (const user of users) {
      if (user.name && fakeNames.includes(user.name) && !user.email) {
        await ctx.db.delete(user._id);
        count++;
      }
    }
    return count;
  }
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
    userName: v.optional(v.string()),
    actionType: v.string(), // "submit_gem" | "gem_approved" | "review" | "blog"
    pointsEarned: v.number(),
    referenceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let userId;
    if (args.userName) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("name"), args.userName))
        .first();
      if (!user) {
        throw new Error("User not found");
      }
      userId = user._id;
    } else {
      userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("Not authenticated");
      }
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newPoints = (user.totalPoints ?? 0) + args.pointsEarned;
    const newTier = calculateTier(newPoints);

    // Update user profile
    await ctx.db.patch(userId, {
      totalPoints: newPoints,
      tier: newTier,
    });

    // Add entry in pointsLedger
    await ctx.db.insert("pointsLedger", {
      userId: userId,
      actionType: args.actionType,
      pointsEarned: args.pointsEarned,
      timestamp: Date.now(),
      referenceId: args.referenceId,
    });

    return { totalPoints: newPoints, tier: newTier };
  },
});

// Toggle user verification status
export const toggleVerification = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    await ctx.db.patch(userId, {
      isVerified: !user.isVerified,
    });
    return { isVerified: !user.isVerified };
  },
});

// Fetch point ledger entries for the authenticated user
export const getPointsLedger = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const entries = await ctx.db
      .query("pointsLedger")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Sort entries newest first
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Query user standings for the Leaderboard
export const getLeaderboard = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .collect();

    // Exclude admins and sort by points descending
    const sorted = users
      .filter((u) => u.role !== "admin")
      .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

    return sorted.map((u, index) => ({
      rank: index + 1,
      id: u._id,
      name: u.name || u.email?.split("@")[0] || "Anonymous",
      tier: (u.tier || "Bronze") as "Bronze" | "Silver" | "Gold",
      points: u.totalPoints ?? 0,
      isVerified: u.isVerified ?? false,
    }));
  },
});

export const resetAdminAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts" as any).collect();
    for (const acc of accounts) {
      const accountFields = acc as any;
      if (accountFields.email?.trim().toLowerCase() === "230107anu@gmail.com" || accountFields.providerAccountId?.trim().toLowerCase() === "230107anu@gmail.com") {
        await ctx.db.delete(acc._id);
        console.log("Deleted account:", acc._id);
      }
    }
    const users = await ctx.db.query("users").collect();
    for (const u of users) {
      if (u.email?.trim().toLowerCase() === "230107anu@gmail.com") {
        await ctx.db.delete(u._id);
        console.log("Deleted user:", u._id);
      }
    }
    return { success: true };
  }
});


