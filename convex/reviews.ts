import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to check if a user is an admin
async function checkAdmin(db: any, userId: any) {
  const user = await db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin privileges required");
  }
}

// Get reviews
export const getReviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("reviews").collect();
  },
});

// Add a review
export const addReview = mutation({
  args: {
    rating: v.number(),
    text: v.string(),
    photos: v.optional(v.array(v.string())),
    author: v.id("users"),
    destinationId: v.optional(v.id("destinations")),
    gemId: v.optional(v.id("hiddenGems")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", {
      rating: args.rating,
      text: args.text,
      photos: args.photos,
      author: args.author,
      destinationId: args.destinationId,
      gemId: args.gemId,
      createdAt: Date.now(),
      flagged: false,
    });
  },
});

// Flag/Unflag a review (admin only)
export const flagReview = mutation({
  args: {
    adminUserId: v.id("users"),
    reviewId: v.id("reviews"),
    flagged: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx.db, args.adminUserId);

    await ctx.db.patch(args.reviewId, {
      flagged: args.flagged,
    });

    return { success: true };
  },
});

// Delete a review (admin only)
export const deleteReview = mutation({
  args: {
    adminUserId: v.id("users"),
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx.db, args.adminUserId);

    await ctx.db.delete(args.reviewId);

    return { success: true };
  },
});
