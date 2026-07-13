import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureUsersSeeded } from "./users";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to determine tier from points
function calculateTier(points: number): "Bronze" | "Silver" | "Gold" {
  if (points >= 2500) return "Gold";
  if (points >= 1000) return "Silver";
  return "Bronze";
}

export async function ensureGemsSeeded(db: any) {
  await ensureUsersSeeded(db);
  const anyGem = await db.query("hiddenGems").first();
  if (!anyGem) {
    const admin = await db.query("users").filter((q: any) => q.eq(q.field("role"), "admin")).first();
    const adminId = admin?._id;

    if (!adminId) {
      console.log("No admin found to assign initial gems");
      return;
    }

    const initialGems = [
      {
        title: "Gandikota Grand Canyon",
        description: "A stunning gorge carved by the Pennar River through red granite rocks, resembling the American Grand Canyon.",
        location: "Kadapa, Andhra Pradesh",
        state: "Andhra Pradesh",
        geo: { lat: 14.8011, lng: 78.2664 },
        photo: "https://images.unsplash.com/photo-1626590212990-2e40026e6cb5?auto=format&fit=crop&w=800&q=80",
        category: "Offbeat",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
      },
      {
        title: "Phugtal Cave Monastery",
        description: "A 12th-century Buddhist monastery built directly into the cliffside of a remote gorge in southeastern Zanskar.",
        location: "Zanskar, Ladakh",
        state: "Ladakh",
        geo: { lat: 33.1711, lng: 77.2356 },
        photo: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
        category: "Offbeat",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
      },
      {
        title: "Lonar Crater Lake",
        description: "A hyper-saline alkaline lake created by a meteorite impact during the Pleistocene Epoch, surrounded by temples.",
        location: "Buldhana, Maharashtra",
        state: "Maharashtra",
        geo: { lat: 19.9763, lng: 76.5096 },
        photo: "https://images.unsplash.com/photo-1583143874828-de3d288be51a?auto=format&fit=crop&w=800&q=80",
        category: "Offbeat",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
      }
    ];

    for (const gem of initialGems) {
      await db.insert("hiddenGems", gem);
    }
  }
}

// Submit a new gem (pending by default)
export const submitGem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    state: v.string(),
    category: v.string(),
    photo: v.string(),
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }

    const gemId = await ctx.db.insert("hiddenGems", {
      ...args,
      submittedBy: userId,
      status: "pending",
      createdAt: Date.now(),
    });
    return gemId;
  },
});

// Query pending gems (admin only)
export const getPendingGems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      return [];
    }
    
    const gems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const results = [];
    for (const gem of gems) {
      const submitter = await ctx.db.get(gem.submittedBy);
      results.push({
        id: gem._id,
        ...gem,
        submittedBy: submitter?.name || submitter?.email?.split("@")[0] || "Anonymous",
        submitterTier: submitter?.tier || "Bronze",
        submitterVerified: submitter?.isVerified || false,
        createdAt: new Date(gem.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return results;
  },
});

// Query all approved gems (public)
export const getApprovedGems = query({
  args: {},
  handler: async (ctx) => {
    const gems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    // Sort by approval date (most recent first) with fallback to creation date
    gems.sort((a, b) => {
      const timeA = a.approvedAt ?? a.createdAt;
      const timeB = b.approvedAt ?? b.createdAt;
      return timeB - timeA;
    });

    const results = [];
    for (const gem of gems) {
      const submitter = await ctx.db.get(gem.submittedBy);
      results.push({
        id: gem._id,
        ...gem,
        submittedBy: submitter?.name || submitter?.email?.split("@")[0] || "Anonymous",
        submitterTier: submitter?.tier || "Bronze",
        submitterVerified: submitter?.isVerified || false,
        createdAt: new Date(gem.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return results;
  },
});

// Approve a gem (admin only)
export const approveGem = mutation({
  args: {
    gemId: v.id("hiddenGems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin privileges required");
    }

    const gem = await ctx.db.get(args.gemId);
    if (!gem) {
      throw new Error("Gem not found");
    }
    if (gem.status !== "pending") {
      throw new Error("Gem is already processed");
    }

    const pointsToAward = 100; // Standard gem approval points

    // Update gem status to approved
    await ctx.db.patch(args.gemId, {
      status: "approved",
      approvedBy: admin._id,
      pointsAwarded: pointsToAward,
      approvedAt: Date.now(),
    });

    // Award points to the submitter
    const submitter = await ctx.db.get(gem.submittedBy);
    if (submitter) {
      const newPoints = (submitter.totalPoints ?? 0) + pointsToAward;
      const newTier = calculateTier(newPoints);

      await ctx.db.patch(gem.submittedBy, {
        totalPoints: newPoints,
        tier: newTier,
      });

      // Insert record in pointsLedger
      await ctx.db.insert("pointsLedger", {
        userId: gem.submittedBy,
        actionType: "gem_approved",
        pointsEarned: pointsToAward,
        timestamp: Date.now(),
        referenceId: gem.title,
      });
    }

    return { success: true };
  },
});

// Reject a gem (admin only)
export const rejectGem = mutation({
  args: {
    gemId: v.id("hiddenGems"),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin privileges required");
    }

    const gem = await ctx.db.get(args.gemId);
    if (!gem) {
      throw new Error("Gem not found");
    }
    if (gem.status !== "pending") {
      throw new Error("Gem is already processed");
    }

    // Update gem status to rejected
    await ctx.db.patch(args.gemId, {
      status: "rejected",
      approvedBy: admin._id,
      rejectionReason: args.rejectionReason || "Did not meet submission guidelines",
    });

    return { success: true };
  },
});
