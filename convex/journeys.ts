import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateUserTier, requireAdmin } from "./users";

// Submit a new journey (pending by default)
export const submitJourney = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    duration: v.string(),
    stops: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }

    const journeyId = await ctx.db.insert("journeys", {
      ...args,
      author: userId,
      status: "pending",
      createdAt: Date.now(),
    });
    return journeyId;
  },
});

// Query pending journeys (admin only)
export const getPendingJourneys = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return [];
    }
    
    const journeys = await ctx.db
      .query("journeys")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const results = [];
    for (const journey of journeys) {
      const authorUser = await ctx.db.get(journey.author);
      results.push({
        id: journey._id,
        ...journey,
        author: authorUser?.name || authorUser?.email?.split("@")[0] || "Anonymous",
        authorTier: authorUser?.tier || "Bronze",
        authorVerified: authorUser?.isVerified || false,
        createdAtFormatted: new Date(journey.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return results;
  },
});

// Query all journeys for admin (admin only)
export const getAllJourneysAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return [];
    }

    const journeys = await ctx.db.query("journeys").collect();
    journeys.sort((a, b) => b.createdAt - a.createdAt);

    const results = [];
    for (const journey of journeys) {
      const authorUser = await ctx.db.get(journey.author);
      results.push({
        id: journey._id,
        ...journey,
        author: authorUser?.name || authorUser?.email?.split("@")[0] || "Anonymous",
        authorTier: authorUser?.tier || "Bronze",
        authorVerified: authorUser?.isVerified || false,
        createdAtFormatted: new Date(journey.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    }
    return results;
  },
});

// Query all approved journeys (public)
export const getApprovedJourneys = query({
  args: {},
  handler: async (ctx) => {
    const journeys = await ctx.db
      .query("journeys")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // Sort by approval date (most recent first) with fallback to creation date
    journeys.sort((a, b) => {
      const timeA = a.approvedAt ?? a.createdAt;
      const timeB = b.approvedAt ?? b.createdAt;
      return timeB - timeA;
    });

    const results = [];
    for (const journey of journeys) {
      const authorUser = await ctx.db.get(journey.author);
      results.push({
        id: journey._id,
        ...journey,
        author: authorUser?.name || authorUser?.email?.split("@")[0] || "Anonymous",
        authorTier: authorUser?.tier || "Bronze",
        authorVerified: authorUser?.isVerified || false,
        createdAtFormatted: new Date(journey.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return results;
  },
});

// Approve a journey (admin only)
export const approveJourney = mutation({
  args: {
    journeyId: v.id("journeys"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) {
      throw new Error("Journey not found");
    }

    const pointsToAward = 100; // Standard journey approval points

    // Update status to approved
    await ctx.db.patch(args.journeyId, {
      status: "approved",
      approvedBy: userId,
      pointsAwarded: pointsToAward,
      approvedAt: Date.now(),
    });

    // Award points to the author
    const authorUser = await ctx.db.get(journey.author);
    if (authorUser) {
      const newPoints = (authorUser.totalPoints ?? 0) + pointsToAward;
      const newTier = await calculateUserTier(ctx.db, journey.author);

      await ctx.db.patch(journey.author, {
        totalPoints: newPoints,
        tier: newTier,
      });

      // Insert record in pointsLedger
      await ctx.db.insert("pointsLedger", {
        userId: journey.author,
        actionType: "journey_approved",
        pointsEarned: pointsToAward,
        timestamp: Date.now(),
        referenceId: journey.title,
      });

      // Insert notification
      await ctx.db.insert("notifications", {
        userId: journey.author,
        message: `Your journey '${journey.title}' was approved! +${pointsToAward} pts`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Reject a journey (admin only)
export const rejectJourney = mutation({
  args: {
    journeyId: v.id("journeys"),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const journey = await ctx.db.get(args.journeyId);
    if (!journey) {
      throw new Error("Journey not found");
    }

    // Update status to rejected
    await ctx.db.patch(args.journeyId, {
      status: "rejected",
      rejectionReason: args.rejectionReason || "Does not meet guidelines",
    });

    // Insert notification
    await ctx.db.insert("notifications", {
      userId: journey.author,
      message: `Your journey '${journey.title}' submission was not approved. Reason: ${args.rejectionReason || "Does not meet community guidelines"}`,
      read: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Edit a journey (admin only)
export const editJourney = mutation({
  args: {
    journeyId: v.id("journeys"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    duration: v.optional(v.string()),
    stops: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { journeyId, ...fields } = args;
    await ctx.db.patch(journeyId, fields);
    return { success: true };
  },
});

// Delete a journey (admin only)
export const deleteJourney = mutation({
  args: {
    journeyId: v.id("journeys"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.journeyId);
    return { success: true };
  },
});
