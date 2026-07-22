import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserExpenses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getTripExpenses = query({
  args: { tripId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .collect();
  },
});

export const addExpense = mutation({
  args: {
    tripId: v.string(),
    category: v.string(),
    amount: v.number(),
    currency: v.optional(v.string()),
    date: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Please sign in to log expenses.");
    }

    const expenseId = await ctx.db.insert("expenses", {
      userId,
      tripId: args.tripId,
      category: args.category,
      amount: args.amount,
      currency: args.currency || "INR",
      date: args.date || new Date().toISOString().split("T")[0],
      description: args.description || "",
      createdAt: Date.now(),
    });

    return expenseId;
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== userId) {
      throw new Error("Unauthorized or expense not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
