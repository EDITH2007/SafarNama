import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureUsersSeeded } from "./users";

// Helper to determine tier from points
function calculateTier(points: number): "Explorer" | "Trailblazer" | "Local Legend" {
  if (points >= 2500) return "Local Legend";
  if (points >= 1000) return "Trailblazer";
  return "Explorer";
}

export async function ensureGemsSeeded(db: any) {
  await ensureUsersSeeded(db);
  const anyGem = await db.query("hiddenGems").first();
  if (!anyGem) {
    const aarav = await db.query("users").filter((q: any) => q.eq(q.field("name"), "Aarav Sharma")).first();
    const tenzing = await db.query("users").filter((q: any) => q.eq(q.field("name"), "Tenzing Norgay")).first();
    const priya = await db.query("users").filter((q: any) => q.eq(q.field("name"), "Priya Patel")).first();

    const initialGems = [
      {
        title: "Gandikota Grand Canyon",
        description: "A stunning gorge carved by the Pennar River through red granite rocks, resembling the American Grand Canyon.",
        location: "Kadapa, Andhra Pradesh",
        state: "Andhra Pradesh",
        photos: ["https://images.unsplash.com/photo-1626590212990-2e40026e6cb5?auto=format&fit=crop&w=800&q=80"],
        category: "Offbeat",
        submittedBy: aarav?._id,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
      },
      {
        title: "Phugtal Cave Monastery",
        description: "A 12th-century Buddhist monastery built directly into the cliffside of a remote gorge in southeastern Zanskar.",
        location: "Zanskar, Ladakh",
        state: "Ladakh",
        photos: ["https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80"],
        category: "Offbeat",
        submittedBy: tenzing?._id,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15, // 15 days ago
      },
      {
        title: "Lonar Crater Lake",
        description: "A hyper-saline alkaline lake created by a meteorite impact during the Pleistocene Epoch, surrounded by temples.",
        location: "Buldhana, Maharashtra",
        state: "Maharashtra",
        photos: ["https://images.unsplash.com/photo-1583143874828-de3d288be51a?auto=format&fit=crop&w=800&q=80"],
        category: "Offbeat",
        submittedBy: priya?._id,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
      }
    ];

    for (const gem of initialGems) {
      if (gem.submittedBy) {
        await db.insert("hiddenGems", gem);
      }
    }
  }
}

// Helper to check if a user is an admin by name
async function checkAdmin(db: any, name: string) {
  const user = await db
    .query("users")
    .filter((q: any) => q.eq(q.field("name"), name))
    .first();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin privileges required");
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
    photos: v.array(v.string()),
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    submittedByUserName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.submittedByUserName))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    const gemId = await ctx.db.insert("hiddenGems", {
      title: args.title,
      description: args.description,
      location: args.location,
      state: args.state,
      category: args.category,
      photos: args.photos,
      geo: args.geo,
      submittedBy: user._id,
      status: "pending",
      createdAt: Date.now(),
    });
    return gemId;
  },
});

// Query pending gems (admin only)
export const getPendingGems = query({
  args: { adminUserName: v.string() },
  handler: async (ctx, args) => {
    await ensureGemsSeeded(ctx.db);
    await checkAdmin(ctx.db, args.adminUserName);
    
    return await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Approve a gem (admin only)
export const approveGem = mutation({
  args: {
    adminUserName: v.string(),
    gemId: v.id("hiddenGems"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.adminUserName))
      .first();
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
    });

    // Award points to the submitter
    const submitter = await ctx.db.get(gem.submittedBy);
    if (submitter) {
      const newPoints = submitter.totalPoints + pointsToAward;
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
    adminUserName: v.string(),
    gemId: v.id("hiddenGems"),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.adminUserName))
      .first();
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
