import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Fetch all saved itinerary IDs (both trip plans and journeys) for the current user.
 */
export const getSavedItineraries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const saved = await ctx.db
      .query("savedItineraries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ids: string[] = [];
    for (const item of saved) {
      if (item.tripPlanId) {
        ids.push(item.tripPlanId);
      } else if (item.journeyId) {
        ids.push(item.journeyId);
      }
    }
    return ids;
  },
});

/**
 * Toggle saving/bookmarking an itinerary (trip plan or journey).
 */
export const toggleSaveItinerary = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }

    let tripPlanId: any = null;
    let journeyId: any = null;

    try {
      tripPlanId = ctx.db.normalizeId("tripPlans", args.id);
      journeyId = ctx.db.normalizeId("journeys", args.id);
    } catch (e) {
      // Ignore normalization errors for mock/invalid strings
    }

    if (tripPlanId) {
      const existing = await ctx.db
        .query("savedItineraries")
        .withIndex("by_user_trip", (q) =>
          q.eq("userId", userId).eq("tripPlanId", tripPlanId)
        )
        .first();
      if (existing) {
        await ctx.db.delete(existing._id);
        return { success: true, action: "removed", id: args.id };
      } else {
        await ctx.db.insert("savedItineraries", {
          userId,
          tripPlanId,
          createdAt: Date.now(),
        });
        return { success: true, action: "added", id: args.id };
      }
    } else if (journeyId) {
      const existing = await ctx.db
        .query("savedItineraries")
        .withIndex("by_user_journey", (q) =>
          q.eq("userId", userId).eq("journeyId", journeyId)
        )
        .first();
      if (existing) {
        await ctx.db.delete(existing._id);
        return { success: true, action: "removed", id: args.id };
      } else {
        await ctx.db.insert("savedItineraries", {
          userId,
          journeyId,
          createdAt: Date.now(),
        });
        return { success: true, action: "added", id: args.id };
      }
    }

    return { success: false, reason: "Invalid ID: Not a trip plan or journey" };
  },
});

/**
 * Synchronize offline/anonymous saved itineraries to the authenticated user's saved list.
 */
export const syncSavedItineraries = mutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }

    for (const id of args.ids) {
      let tripPlanId: any = null;
      let journeyId: any = null;

      try {
        tripPlanId = ctx.db.normalizeId("tripPlans", id);
        journeyId = ctx.db.normalizeId("journeys", id);
      } catch (e) {
        // Ignore normalization errors for mock/invalid strings
      }

      if (tripPlanId) {
        const existing = await ctx.db
          .query("savedItineraries")
          .withIndex("by_user_trip", (q) =>
            q.eq("userId", userId).eq("tripPlanId", tripPlanId)
          )
          .first();
        if (!existing) {
          await ctx.db.insert("savedItineraries", {
            userId,
            tripPlanId,
            createdAt: Date.now(),
          });
        }
      } else if (journeyId) {
        const existing = await ctx.db
          .query("savedItineraries")
          .withIndex("by_user_journey", (q) =>
            q.eq("userId", userId).eq("journeyId", journeyId)
          )
          .first();
        if (!existing) {
          await ctx.db.insert("savedItineraries", {
            userId,
            journeyId,
            createdAt: Date.now(),
          });
        }
      }
    }

    // Return the updated list of saved IDs
    const saved = await ctx.db
      .query("savedItineraries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ids: string[] = [];
    for (const item of saved) {
      if (item.tripPlanId) {
        ids.push(item.tripPlanId);
      } else if (item.journeyId) {
        ids.push(item.journeyId);
      }
    }
    return ids;
  },
});
