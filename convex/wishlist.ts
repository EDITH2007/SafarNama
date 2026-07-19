import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Fetch all saved wishlist destination and gem IDs for the current user.
 */
export const getWishlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const wishlists = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ids: string[] = [];
    for (const item of wishlists) {
      if (item.destinationId) {
        ids.push(item.destinationId);
      } else if (item.gemId) {
        ids.push(item.gemId);
      }
    }
    return ids;
  },
});

/**
 * Toggle a destination or gem in the current user's wishlist.
 */
export const toggleWishlist = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }

    let destinationId: any = null;
    let gemId: any = null;

    try {
      const doc = await ctx.db.get(args.id as any);
      if (doc) {
        if ("photos" in doc) {
          destinationId = doc._id;
        } else if ("photo" in doc) {
          gemId = doc._id;
        }
      }
    } catch (e) {
      // Ignore invalid/mock ID format errors
    }

    if (destinationId) {
      const existing = await ctx.db
        .query("wishlists")
        .withIndex("by_user_destination", (q) =>
          q.eq("userId", userId).eq("destinationId", destinationId)
        )
        .first();
      if (existing) {
        await ctx.db.delete(existing._id);
        return { success: true, action: "removed", id: args.id };
      } else {
        await ctx.db.insert("wishlists", {
          userId,
          destinationId,
          createdAt: Date.now(),
        });
        return { success: true, action: "added", id: args.id };
      }
    } else if (gemId) {
      const existing = await ctx.db
        .query("wishlists")
        .withIndex("by_user_gem", (q) =>
          q.eq("userId", userId).eq("gemId", gemId)
        )
        .first();
      if (existing) {
        await ctx.db.delete(existing._id);
        return { success: true, action: "removed", id: args.id };
      } else {
        await ctx.db.insert("wishlists", {
          userId,
          gemId,
          createdAt: Date.now(),
        });
        return { success: true, action: "added", id: args.id };
      }
    }

    return { success: false, reason: "Invalid ID: Not a destination or hidden gem" };
  },
});

/**
 * Synchronize offline wishlist items to the authenticated user's wishlist in Convex.
 */
export const syncWishlist = mutation({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }

    for (const id of args.ids) {
      let destinationId: any = null;
      let gemId: any = null;

      try {
        const doc = await ctx.db.get(id as any);
        if (doc) {
          if ("photos" in doc) {
            destinationId = doc._id;
          } else if ("photo" in doc) {
            gemId = doc._id;
          }
        }
      } catch (e) {
        // Ignore invalid/mock ID format errors
      }

      if (destinationId) {
        const existing = await ctx.db
          .query("wishlists")
          .withIndex("by_user_destination", (q) =>
            q.eq("userId", userId).eq("destinationId", destinationId)
          )
          .first();
        if (!existing) {
          await ctx.db.insert("wishlists", {
            userId,
            destinationId,
            createdAt: Date.now(),
          });
        }
      } else if (gemId) {
        const existing = await ctx.db
          .query("wishlists")
          .withIndex("by_user_gem", (q) =>
            q.eq("userId", userId).eq("gemId", gemId)
          )
          .first();
        if (!existing) {
          await ctx.db.insert("wishlists", {
            userId,
            gemId,
            createdAt: Date.now(),
          });
        }
      }
    }

    // Return the updated wishlist list of IDs
    const wishlists = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ids: string[] = [];
    for (const item of wishlists) {
      if (item.destinationId) {
        ids.push(item.destinationId);
      } else if (item.gemId) {
        ids.push(item.gemId);
      }
    }
    return ids;
  },
});
