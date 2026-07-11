import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to check if a user is an admin
async function checkAdmin(db: any, userId: any) {
  const user = await db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin privileges required");
  }
}

// Get blogs
export const getBlogs = query({
  handler: async (ctx) => {
    return await ctx.db.query("blogs").collect();
  },
});

// Add a blog
export const addBlog = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    coverImage: v.optional(v.string()),
    author: v.id("users"),
    status: v.string(), // "draft" | "published"
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("blogs", {
      title: args.title,
      content: args.content,
      coverImage: args.coverImage,
      author: args.author,
      status: args.status,
      createdAt: Date.now(),
      flagged: false,
    });
  },
});

// Flag/Unflag a blog (admin only)
export const flagBlog = mutation({
  args: {
    adminUserId: v.id("users"),
    blogId: v.id("blogs"),
    flagged: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx.db, args.adminUserId);

    await ctx.db.patch(args.blogId, {
      flagged: args.flagged,
    });

    return { success: true };
  },
});

// Delete a blog (admin only)
export const deleteBlog = mutation({
  args: {
    adminUserId: v.id("users"),
    blogId: v.id("blogs"),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx.db, args.adminUserId);

    await ctx.db.delete(args.blogId);

    return { success: true };
  },
});
