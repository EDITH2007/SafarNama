import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTripPlans = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("tripPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const saveTripPlan = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    isAI: v.optional(v.boolean()),
    status: v.optional(v.string()),
    itinerary: v.optional(v.array(
      v.object({
        dayNumber: v.number(),
        date: v.optional(v.string()),
        activities: v.array(
          v.object({
            time: v.string(),
            title: v.string(),
            description: v.optional(v.string()),
            cost: v.optional(v.number()),
            currency: v.optional(v.string()),
            location: v.optional(v.string()),
            durationMinutes: v.optional(v.number()),
            destinationId: v.optional(v.string()),
            gemId: v.optional(v.string()),
          })
        ),
      })
    )),
    destination: v.optional(v.string()),
    summary: v.optional(v.string()),
    travelers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Convert string IDs to Convex v.id types safely inside the mutation
    const sanitizedItinerary = args.itinerary
      ? args.itinerary.map((day) => ({
          dayNumber: day.dayNumber,
          date: day.date,
          activities: day.activities.map((act) => {
            const destId = act.destinationId ? ctx.db.normalizeId("destinations", act.destinationId) : null;
            const gemId = act.gemId ? ctx.db.normalizeId("hiddenGems", act.gemId) : null;
            
            return {
              time: act.time,
              title: act.title,
              description: act.description,
              cost: act.cost,
              currency: act.currency,
              location: act.location,
              durationMinutes: act.durationMinutes,
              destinationId: destId || undefined,
              gemId: gemId || undefined,
            };
          }),
        }))
      : [];

    const newTripId = await ctx.db.insert("tripPlans", {
      userId,
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      isAI: args.isAI ?? true,
      status: args.status ?? "planning",
      createdAt: Date.now(),
      itinerary: sanitizedItinerary,
      destination: args.destination,
      summary: args.summary,
      travelers: args.travelers ?? 1,
    });

    return newTripId;
  },
});

export const completeTripPlan = mutation({
  args: { id: v.id("tripPlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const trip = await ctx.db.get(args.id);
    if (!trip || trip.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }
    await ctx.db.patch(args.id, { status: "completed" });
    return { success: true };
  },
});

export const deleteTripPlan = mutation({
  args: { id: v.id("tripPlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const trip = await ctx.db.get(args.id);
    if (!trip || trip.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
