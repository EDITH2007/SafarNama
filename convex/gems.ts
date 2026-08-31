import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureUsersSeeded, calculateUserTier, requireAdmin } from "./users";
import { getAuthUserId } from "@convex-dev/auth/server";

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
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Sunset (5:00–6:30 PM), Oct–Mar",
          crowdSourceNote: "Uncrowded red canyon trail; pristine alternative to commercial hill stations.",
          reportCount: 8,
          updatedAt: Date.now(),
        },
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
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Early morning hike, Jun–Sep",
          crowdSourceNote: "Requires a 2-hour foot trek; virtually zero tourist crowd.",
          reportCount: 5,
          updatedAt: Date.now(),
        },
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
        crowdData: {
          crowdLevel: "moderate",
          bestTimeToVisit: "Morning perimeter trek, Nov–Feb",
          crowdSourceNote: "Peaceful geological marvel; modest weekend family visits.",
          reportCount: 12,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Karnala Fort & Bird Sanctuary",
        description: "A quiet hill fort and lush bird sanctuary nestled in the Western Ghats near Panvel, perfect for peaceful nature walks.",
        location: "Panvel, Maharashtra",
        state: "Maharashtra",
        geo: { lat: 18.8958, lng: 73.1169 },
        photo: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        category: "Trek",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Early morning (7:00–10:00 AM), Oct–Mar",
          crowdSourceNote: "Serene nature trail; minimal weekend crowds compared to Mumbai city spots.",
          reportCount: 9,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Rajmachi Fort & Kondana Caves",
        description: "Historic twin fort plateau overlooking deep green valleys and ancient Buddhist rock-cut caves near Karjat.",
        location: "Karjat, Maharashtra",
        state: "Maharashtra",
        geo: { lat: 18.8268, lng: 73.3986 },
        photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        category: "Historical Ruins",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Sunrise or monsoon shoulder season",
          crowdSourceNote: "Uncrowded mountain citadel path offering panoramic misty valley vistas.",
          reportCount: 11,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Anegundi Ancient Village",
        description: "The quieter, mythical predecessor to Hampi across the Tungabhadra river, featuring ancient cave art and tranquil banana plantations.",
        location: "Koppal, Karnataka",
        state: "Karnataka",
        geo: { lat: 15.3524, lng: 76.4851 },
        photo: "https://images.unsplash.com/photo-1600100398055-124e57517a9e?auto=format&fit=crop&w=800&q=80",
        category: "Heritage",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Morning hours (7:00–10:30 AM)",
          crowdSourceNote: "Cross via coracle boat for a peaceful heritage walk away from crowded Hampi temple queues.",
          reportCount: 15,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Kalapathar Beach Cove",
        description: "A secluded beach with black rocks framing serene, crystal-clear turquoise waters on Havelock Island.",
        location: "Havelock Island, Andaman",
        state: "Andaman & Nicobar",
        geo: { lat: 11.9880, lng: 93.0030 },
        photo: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
        category: "Secret Beach",
        submittedBy: adminId,
        status: "approved",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
        approvedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Early morning sunrise",
          crowdSourceNote: "Uncrowded pristine coast; peaceful escape from Radhanagar tourist congestion.",
          reportCount: 7,
          updatedAt: Date.now(),
        },
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
      status: "submitted",
      createdAt: Date.now(),
    });
    return gemId;
  },
});

// Query pending gems (admin only)
export const getPendingGems = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return [];
    }

    const submittedGems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .collect();

    const inReviewGems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "in_review"))
      .collect();

    const legacyPendingGems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const gems = [...submittedGems, ...inReviewGems, ...legacyPendingGems];

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
    const verifiedGems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "verified"))
      .collect();

    const legacyApprovedGems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    const gems = [...verifiedGems, ...legacyApprovedGems];

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
    const { userId } = await requireAdmin(ctx);

    const gem = await ctx.db.get(args.gemId);
    if (!gem) {
      throw new Error("Gem not found");
    }

    const pointsToAward = 100; // Standard gem approval points

    // Update gem status to verified
    await ctx.db.patch(args.gemId, {
      status: "verified",
      approvedBy: userId,
      pointsAwarded: pointsToAward,
      approvedAt: Date.now(),
    });

    // Award points to the submitter
    const submitter = await ctx.db.get(gem.submittedBy);
    if (submitter) {
      const newPoints = (submitter.totalPoints ?? 0) + pointsToAward;
      const newTier = await calculateUserTier(ctx.db, gem.submittedBy);

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

      // Insert notification
      await ctx.db.insert("notifications", {
        userId: gem.submittedBy,
        message: `Your submission '${gem.title}' was approved! +${pointsToAward} pts`,
        read: false,
        createdAt: Date.now(),
        relatedSubmissionId: args.gemId,
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
    const { userId } = await requireAdmin(ctx);

    const gem = await ctx.db.get(args.gemId);
    if (!gem) {
      throw new Error("Gem not found");
    }

    const rejectionReason = args.rejectionReason || "Did not meet submission guidelines";

    // Update gem status to rejected
    await ctx.db.patch(args.gemId, {
      status: "rejected",
      approvedBy: userId,
      rejectionReason: rejectionReason,
    });

    // Insert notification
    await ctx.db.insert("notifications", {
      userId: gem.submittedBy,
      message: `Your submission '${gem.title}' was rejected. Reason: ${rejectionReason}`,
      read: false,
      createdAt: Date.now(),
      relatedSubmissionId: args.gemId,
    });

    return { success: true };
  },
});

// Edit a gem (admin only)
export const editGem = mutation({
  args: {
    id: v.id("hiddenGems"),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    state: v.string(),
    category: v.string(),
    photo: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    bestTimeToVisit: v.optional(v.string()),
    howToReach: v.optional(v.string()),
    nearbyAttractions: v.optional(v.array(v.string())),
    tips: v.optional(v.array(v.string())),
    photoGallery: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...data } = args;
    await ctx.db.patch(id, data);
    return { success: true };
  },
});

// Get a gem by ID (public)
export const getGemById = query({
  args: { id: v.id("hiddenGems") },
  handler: async (ctx, args) => {
    const gem = await ctx.db.get(args.id);
    if (!gem) return null;
    const submitter = await ctx.db.get(gem.submittedBy);
    return {
      id: gem._id,
      ...gem,
      submittedBy: submitter?.name || submitter?.email?.split("@")[0] || "Anonymous",
      submitterTier: submitter?.tier || "Bronze",
      submitterVerified: submitter?.isVerified || false,
      createdAt: new Date(gem.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  },
});

// Query gems submitted by the current authenticated user
export const getMySubmissions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const gems = await ctx.db
      .query("hiddenGems")
      .withIndex("by_submittedBy", (q) => q.eq("submittedBy", userId))
      .collect();

    // Sort by createdAt descending
    gems.sort((a, b) => b.createdAt - a.createdAt);

    const results = [];
    for (const gem of gems) {
      results.push({
        id: gem._id,
        ...gem,
      });
    }
    return results;
  },
});

// Bulk mark gems as in review
export const markGemsInReview = mutation({
  args: { ids: v.array(v.id("hiddenGems")) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    for (const id of args.ids) {
      const gem = await ctx.db.get(id);
      if (gem && gem.status === "submitted") {
        await ctx.db.patch(id, { status: "in_review" });
      }
    }
    return { success: true };
  },
});

// Delete a gem (admin only)
export const deleteGem = mutation({
  args: {
    id: v.id("hiddenGems"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Query all gems for admin management console (admin only)
export const getAllGemsAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return [];
    }

    const gems = await ctx.db.query("hiddenGems").collect();
    gems.sort((a, b) => b.createdAt - a.createdAt);

    const results = [];
    for (const gem of gems) {
      const submitter = await ctx.db.get(gem.submittedBy);
      results.push({
        id: gem._id,
        ...gem,
        submittedBy: submitter?.name || submitter?.email?.split("@")[0] || "Anonymous",
        submitterTier: submitter?.tier || "Bronze",
        submitterVerified: submitter?.isVerified || false,
        createdAtFormatted: new Date(gem.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    }
    return results;
  },
});

