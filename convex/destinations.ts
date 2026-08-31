import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin } from "./users";

// Seed official destinations helper
export async function ensureDestinationsSeeded(db: any) {
  const anyDest = await db.query("destinations").first();
  if (!anyDest) {
    const admin = await db.query("users").filter((q: any) => q.eq(q.field("role"), "admin")).first();
    const adminId = admin?._id;

    // Standard list of destinations with full premium details
    const initialDestinations = [
      {
        title: "Munnar Tea Hills",
        description: "Lush green rolling hills, misty trails, and sprawling organic tea estates in the heart of Kerala.",
        location: "Munnar, Kerala",
        state: "Kerala",
        geo: { lat: 10.0889, lng: 77.0595 },
        photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"],
        category: "Hills",
        bestTimeToVisit: "September to May",
        howToReach: "Fly to Cochin International Airport (COK), then drive 3 hours (110 km) through winding ghat roads. Public and private buses ply regularly from Kochi and Alappuzha.",
        nearbyAttractions: ["Eravikulam National Park", "Mattupetty Dam", "Anamudi Peak", "Attukad Waterfalls"],
        tips: [
          "Carry a light jacket or sweater as temperatures drop significantly in the evening.",
          "Hire a local jeep to explore deep into private estate viewpoints that normal cars cannot access.",
          "Buy authentic green tea and spices directly from government-certified co-operative outlets."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=800&q=80"
        ],
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "moderate",
          bestTimeToVisit: "Early morning (6:30–9:00 AM) or Nov–Feb",
          crowdSourceNote: "Peak season sees 4x visitor volume vs shoulder months; early morning offers serene tea garden views.",
          reportCount: 14,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Ruins of Hampi",
        description: "Step back into the golden era of the Vijayanagara Empire amidst boulder-strewn hills and monolithic temples.",
        location: "Hampi, Karnataka",
        state: "Karnataka",
        geo: { lat: 15.3350, lng: 76.4600 },
        photos: ["https://images.unsplash.com/photo-1600100398055-124e57517a9e?auto=format&fit=crop&w=800&q=80"],
        category: "Heritage",
        bestTimeToVisit: "October to February",
        howToReach: "Take a direct train to Hospet Junction (13 km away), then hire an auto-rickshaw. Alternatively, fly to Jindal Vijayanagar Airport in Vidyanagar (35 km away).",
        nearbyAttractions: ["Virupaksha Temple", "Vittala Temple (Stone Chariot)", "Matanga Hill", "Hemakuta Hill Temple complex"],
        tips: [
          "Rent a bicycle or moped to wander the massive 25 sq km historical park at your own pace.",
          "Climb Matanga Hill before 5:30 AM to catch a legendary sunrise over the ruins and Tungabhadra River.",
          "Ensure you wear modest clothing when entering active temples like Virupaksha."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1620311496331-50e58fa2f56f?auto=format&fit=crop&w=800&q=80"
        ],
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "high",
          bestTimeToVisit: "Sunrise (5:30–7:30 AM) or Oct–Jan",
          crowdSourceNote: "Vittala Temple complex gets heavily congested by noon; visit Anegundi side for quieter ruins.",
          reportCount: 28,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Radhanagar Beach",
        description: "Award-winning turquoise waters and white sand, framed by deep green mahua forests on Havelock Island.",
        location: "Havelock Island, Andaman",
        state: "Andaman & Nicobar",
        geo: { lat: 12.0304, lng: 92.9876 },
        photos: ["https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80"],
        category: "Beaches",
        bestTimeToVisit: "November to April",
        howToReach: "Take a government or private cruise ferry from Port Blair to Havelock Island (approx. 2 hours), then hire a local auto or scooty to reach Beach No. 7 (Radhanagar).",
        nearbyAttractions: ["Elephant Beach", "Kalapathar Beach", "Neil Island (Shaheed Dweep)", "Barren Island Volcano"],
        tips: [
          "Do not miss the sunset here; it is globally recognized as one of the best beach sunsets.",
          "Swimming is strictly monitored by lifeguards; stay within the designated safe swim zones.",
          "Mobile networks are extremely weak on the island—download offline maps and tickets beforehand."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"
        ],
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "overcrowded",
          bestTimeToVisit: "Early morning (7:00–9:30 AM) or shoulder season",
          crowdSourceNote: "Peak afternoon cruise ship arrivals cause 10x visitor volume; check out Kalapathar Beach for tranquility.",
          reportCount: 42,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Kaziranga Forest",
        description: "Wild grasslands sanctuary, sanctuary to the world's largest population of great Indian one-horned rhinoceroses.",
        location: "Kaziranga, Assam",
        state: "Assam",
        geo: { lat: 26.5775, lng: 93.1711 },
        photos: ["https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80"],
        category: "Wildlife",
        bestTimeToVisit: "November to April (the park is closed during monsoon)",
        howToReach: "Fly to Jorhat Airport (97 km) or Guwahati International Airport (217 km). Cabs and regional buses run regularly along NH-37 directly to the park entry gates.",
        nearbyAttractions: ["Orchid and Biodiversity Park", "Hoollongapar Gibbon Sanctuary", "Kakochang Waterfalls"],
        tips: [
          "Book your morning elephant safari and afternoon jeep safaris well in advance.",
          "Different ranges (Central, Western, Eastern) offer different sightings; visit at least two ranges.",
          "Bring a good zoom lens or binoculars; rhinoceroses and wild water buffaloes are frequently spotted."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1616128610967-824c419c8d17?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1588714013470-3d77ad85e3c7?auto=format&fit=crop&w=800&q=80"
        ],
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "First slot morning safari (6:00 AM), Nov–Apr",
          crowdSourceNote: "Daily safari entry caps keep crowds low and wildlife experiences intimate.",
          reportCount: 19,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Gokarna Cliffs",
        description: "Pristine rocky coastlines meeting sandy beaches, offering a relaxed alternative to crowded tourist centers.",
        location: "Gokarna, Karnataka",
        state: "Karnataka",
        geo: { lat: 14.5479, lng: 74.3188 },
        photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"],
        category: "Offbeat",
        bestTimeToVisit: "October to March",
        howToReach: "Fly to Dabolim Airport Goa (140 km away) or take a train directly to Gokarna Road station. Local rickshaws connect the station to the beaches.",
        nearbyAttractions: ["Kudle Beach", "Om Beach", "Half Moon Beach", "Mahabaleshwar Temple"],
        tips: [
          "Complete the famous 5-Beach Trek (Belekan to Kudle) over the cliffs in the late afternoon.",
          "Eat at local beach-side shacks on Om Beach for amazing coastal food and sunset vistas.",
          "Respect temple guidelines in Gokarna town, which require traditional dress codes for entry."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80"
        ],
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "low",
          bestTimeToVisit: "Late afternoon for cliff trek, Oct–Mar",
          crowdSourceNote: "Far less commercialized than North Goa; secluded coves maintain a calm vibe year-round.",
          reportCount: 22,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Gateway of India & Marine Drive",
        description: "Historic waterfront monument and iconic coastal promenade in South Mumbai facing the Arabian Sea.",
        location: "Mumbai, Maharashtra",
        state: "Maharashtra",
        geo: { lat: 18.9220, lng: 72.8347 },
        photos: ["https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80"],
        category: "Heritage",
        bestTimeToVisit: "November to February",
        howToReach: "Fly to Chhatrapati Shivaji Maharaj International Airport (BOM), take a cab or local train to Churchgate/CST station, then a short taxi ride.",
        nearbyAttractions: ["Elephanta Caves Ferry", "Taj Mahal Palace", "Colaba Causeway", "Marine Drive Promenade"],
        tips: [
          "Visit early in the morning before 8 AM for peaceful ocean views and sunrise photo opportunities.",
          "Take the morning boat ferry from Gateway to Elephanta Island for UNESCO rock-cut cave temples.",
          "Beware of crowded tourist traps and unauthorized photo vendors around the plaza."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1595658658421-a9ac457190ae?auto=format&fit=crop&w=800&q=80"
        ],
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "overcrowded",
          bestTimeToVisit: "Sunrise (6:00–7:30 AM) or late night weekdays",
          crowdSourceNote: "Peak weekend footfalls at Gateway & Promenade cause extreme congestion.",
          reportCount: 38,
          updatedAt: Date.now(),
        },
      },
      {
        title: "Golden Temple, Amritsar",
        description: "The Golden Temple, also known as Sri Harmandir Sahib, is a gurdwara located in the city of Amritsar, Punjab, India. It is the central house of worship of Sikhism.",
        location: "Amritsar, Punjab",
        state: "Punjab",
        geo: { lat: 31.6200, lng: 74.8765 },
        photos: ["https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80"],
        category: "Spiritual",
        bestTimeToVisit: "October to March",
        howToReach: "Fly to Sri Guru Ram Dass Jee International Airport in Amritsar (11 km away) or take a direct train to Amritsar Junction.",
        nearbyAttractions: ["Jallianwala Bagh", "Wagah Border", "Partition Museum", "Gobindgarh Fort"],
        tips: [
          "Cover your head before entering the temple complex.",
          "Remove your shoes and wash your feet at the entrance pool.",
          "Experience the world's largest free community kitchen (Langar)."
        ],
        photoGallery: [
          "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80"
        ],
        sourceName: "Wikipedia",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Temple",
        createdAt: Date.now(),
        crowdData: {
          crowdLevel: "high",
          bestTimeToVisit: "Early morning (4:00–6:00 AM) or Oct–Mar",
          crowdSourceNote: "Golden Temple complex experiences heavy footfall from mid-morning to evening.",
          reportCount: 35,
          updatedAt: Date.now(),
        },
      }
    ];

    for (const dest of initialDestinations) {
      await db.insert("destinations", {
        ...dest,
        addedBy: adminId || admin?._id, // Assign to first admin or dummy/seed user
      });
    }
  } else {
    // Patch Wikipedia attribution on Golden Temple if it exists in DB
    const amritsarDest = await db.query("destinations").filter((q: any) =>
      q.or(
        q.eq(q.field("title"), "Golden Temple, Amritsar"),
        q.eq(q.field("location"), "Amritsar, Punjab")
      )
    ).first();

    if (amritsarDest && (!amritsarDest.sourceName || !amritsarDest.sourceUrl)) {
      await db.patch(amritsarDest._id, {
        sourceName: "Wikipedia",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Temple",
      });
    }
  }
}

// Helper to guarantee valid crowdData for any destination
export function resolveCrowdData(dest: any) {
  if (dest.crowdData && dest.crowdData.crowdLevel) {
    return dest.crowdData;
  }

  const title = (dest.title || "").toLowerCase();
  const location = (dest.location || "").toLowerCase();

  if (title.includes("amritsar") || location.includes("amritsar")) {
    return {
      crowdLevel: "high",
      bestTimeToVisit: "Early morning (4:00–6:00 AM) or Oct–Mar",
      crowdSourceNote: "Golden Temple complex experiences heavy footfall from mid-morning to evening.",
      reportCount: 35,
      updatedAt: Date.now(),
    };
  }

  if (title.includes("mumbai") || location.includes("mumbai")) {
    return {
      crowdLevel: "high",
      bestTimeToVisit: "Sunrise or late night, Oct–Mar",
      crowdSourceNote: "Gateway of India & Marine Drive experience high footfall during peak weekend hours.",
      reportCount: 30,
      updatedAt: Date.now(),
    };
  }

  if (title.includes("radhanagar") || location.includes("havelock")) {
    return {
      crowdLevel: "overcrowded",
      bestTimeToVisit: "Early morning (7:00–9:30 AM) or shoulder season",
      crowdSourceNote: "Peak afternoon cruise ship arrivals cause 10x visitor volume.",
      reportCount: 42,
      updatedAt: Date.now(),
    };
  }

  if (title.includes("hampi") || location.includes("hampi")) {
    return {
      crowdLevel: "high",
      bestTimeToVisit: "Sunrise (5:30–7:30 AM) or Oct–Jan",
      crowdSourceNote: "Vittala Temple complex gets heavily congested by noon.",
      reportCount: 28,
      updatedAt: Date.now(),
    };
  }

  if (title.includes("munnar") || location.includes("munnar")) {
    return {
      crowdLevel: "moderate",
      bestTimeToVisit: "Early morning (6:30–9:00 AM) or Nov–Feb",
      crowdSourceNote: "Peak season sees 4x visitor volume vs shoulder months.",
      reportCount: 14,
      updatedAt: Date.now(),
    };
  }

  if (title.includes("kaziranga") || location.includes("kaziranga")) {
    return {
      crowdLevel: "low",
      bestTimeToVisit: "First slot morning safari (6:00 AM), Nov–Apr",
      crowdSourceNote: "Daily safari entry caps keep crowds low and wildlife experiences intimate.",
      reportCount: 19,
      updatedAt: Date.now(),
    };
  }

  if (title.includes("gokarna") || location.includes("gokarna")) {
    return {
      crowdLevel: "low",
      bestTimeToVisit: "Late afternoon for cliff trek, Oct–Mar",
      crowdSourceNote: "Far less commercialized than North Goa; secluded coves maintain a calm vibe.",
      reportCount: 22,
      updatedAt: Date.now(),
    };
  }

  return {
    crowdLevel: "moderate",
    bestTimeToVisit: dest.bestTimeToVisit || "October to March",
    crowdSourceNote: "Community & seasonal baseline crowd rating.",
    reportCount: 10,
    updatedAt: Date.now(),
  };
}

// Query all official destinations
export const getDestinations = query({
  handler: async (ctx) => {
    const dests = await ctx.db.query("destinations").collect();
    const results = [];
    for (const dest of dests) {
      const creator = await ctx.db.get(dest.addedBy);
      // Fetch actual reviews for average score calculation
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_destination", (q) => q.eq("destinationId", dest._id))
        .collect();

      const rating = reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 4.8; // Default rating fallback

      const crowdData = resolveCrowdData(dest);

      results.push({
        id: dest._id,
        ...dest,
        addedBy: creator?.name || "Admin",
        rating,
        crowdData,
      });
    }
    return results;
  },
});

// Query a single official destination by ID
export const getDestinationById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    let dest: any = null;
    try {
      dest = await ctx.db.get(args.id as any);
    } catch {
      // Not a valid Convex ID string format
    }
    if (!dest) {
      const all = await ctx.db.query("destinations").collect();
      dest = all.find((d: any) => String(d._id) === args.id || String((d as any).id) === args.id) || null;
    }
    if (!dest) return null;
    const creator: any = dest.addedBy ? await ctx.db.get(dest.addedBy) : null;

    // Fetch actual reviews for average score calculation
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_destination", (q: any) => q.eq("destinationId", dest._id))
      .collect();

    const rating = reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 4.8; // Default rating fallback

    const crowdData = resolveCrowdData(dest);

    return {
      id: dest._id,
      ...dest,
      addedBy: creator?.name || "Admin",
      rating,
      reviewCount: reviews.length,
      crowdData,
    };
  },
});

// Mutation to ensure Wikipedia source attributions are patched on live database records
export const patchWikipediaAttributions = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("users").filter((q: any) => q.eq(q.field("role"), "admin")).first();
    const user = await ctx.db.query("users").first();
    const adminId = admin?._id || user?._id;
    if (!adminId) return [];

    // 1. Golden Temple, Amritsar
    const amritsarDest = await ctx.db
      .query("destinations")
      .filter((q: any) =>
        q.or(
          q.eq(q.field("title"), "Golden Temple, Amritsar"),
          q.eq(q.field("location"), "Amritsar, Punjab")
        )
      )
      .first();

    if (amritsarDest && (!amritsarDest.sourceName || !amritsarDest.sourceUrl)) {
      await ctx.db.patch(amritsarDest._id, {
        sourceName: "Wikipedia",
        sourceUrl: "https://en.wikipedia.org/wiki/Golden_Temple",
      });
    }

    // 2. Kaziranga Forest
    const kazirangaDest = await ctx.db
      .query("destinations")
      .filter((q: any) =>
        q.or(
          q.eq(q.field("title"), "Kaziranga Forest"),
          q.eq(q.field("location"), "Kaziranga, Assam")
        )
      )
      .first();

    if (kazirangaDest && (!kazirangaDest.sourceName || !kazirangaDest.sourceUrl)) {
      await ctx.db.patch(kazirangaDest._id, {
        sourceName: "Wikipedia",
        sourceUrl: "https://en.wikipedia.org/wiki/Kaziranga_National_Park",
      });
    }

    const allDests = await ctx.db.query("destinations").collect();
    return allDests.map((d: any) => ({
      id: d._id,
      title: d.title,
      sourceName: d.sourceName || null,
      sourceUrl: d.sourceUrl || null,
    }));
  },
});

// Add a new official destination (admin only)
export const addDestination = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    state: v.string(),
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    photos: v.array(v.string()),
    category: v.string(),
    bestTimeToVisit: v.optional(v.string()),
    howToReach: v.optional(v.string()),
    nearbyAttractions: v.optional(v.array(v.string())),
    tips: v.optional(v.array(v.string())),
    photoGallery: v.optional(v.array(v.string())),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    crowdData: v.optional(
      v.object({
        crowdLevel: v.string(),
        bestTimeToVisit: v.optional(v.string()),
        crowdSourceNote: v.optional(v.string()),
        reportCount: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAdmin(ctx);

    const destinationId = await ctx.db.insert("destinations", {
      ...args,
      addedBy: userId,
      createdAt: Date.now(),
    });
    return destinationId;
  },
});

// Edit an existing official destination (admin only)
export const editDestination = mutation({
  args: {
    id: v.id("destinations"),
    title: v.string(),
    description: v.string(),
    location: v.string(),
    state: v.string(),
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    photos: v.array(v.string()),
    category: v.string(),
    bestTimeToVisit: v.optional(v.string()),
    howToReach: v.optional(v.string()),
    nearbyAttractions: v.optional(v.array(v.string())),
    tips: v.optional(v.array(v.string())),
    photoGallery: v.optional(v.array(v.string())),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    crowdData: v.optional(
      v.object({
        crowdLevel: v.string(),
        bestTimeToVisit: v.optional(v.string()),
        crowdSourceNote: v.optional(v.string()),
        reportCount: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

// Delete an official destination and clean up reviews (admin only)
export const deleteDestination = mutation({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // 1. Clean up associated reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_destination", (q) => q.eq("destinationId", args.id))
      .collect();

    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    // 2. Clean up associated crowdReports
    const crowdReports = await ctx.db
      .query("crowdReports")
      .withIndex("by_destination", (q) => q.eq("destinationId", args.id))
      .collect();

    for (const report of crowdReports) {
      await ctx.db.delete(report._id);
    }

    // 3. Clean up associated wishlists
    const wishlists = await ctx.db
      .query("wishlists")
      .filter((q) => q.eq(q.field("destinationId"), args.id))
      .collect();

    for (const item of wishlists) {
      await ctx.db.delete(item._id);
    }

    // 4. Delete the destination record itself
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Submit a crowd report (Gold Explorer+ users)
export const submitCrowdReport = mutation({
  args: {
    destinationId: v.optional(v.id("destinations")),
    gemId: v.optional(v.id("hiddenGems")),
    crowdLevel: v.string(), // "low" | "moderate" | "high" | "overcrowded"
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: You must be logged in to submit a crowd report.");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User record not found.");
    }

    // Check Gold Explorer+ status (Gold/Platinum tier OR points >= 2500)
    const points = user.totalPoints ?? 0;
    const tier = (user.tier || "").toLowerCase();
    const isGoldOrHigher = tier === "gold" || tier === "platinum" || points >= 2500;

    if (!isGoldOrHigher) {
      throw new Error("Crowd reports are reserved for Gold Explorer+ status (2,500+ PTS or Gold Tier). Earn points by sharing hidden gems and reviews!");
    }

    if (!args.destinationId && !args.gemId) {
      throw new Error("Must specify a destinationId or gemId.");
    }

    // Insert crowd report
    await ctx.db.insert("crowdReports", {
      destinationId: args.destinationId,
      gemId: args.gemId,
      userId: userId,
      crowdLevel: args.crowdLevel,
      note: args.note,
      createdAt: Date.now(),
    });

    // Update target target entity (destination or gem)
    if (args.destinationId) {
      const dest = await ctx.db.get(args.destinationId);
      if (dest) {
        const existingCount = dest.crowdData?.reportCount || 10;
        const newCount = existingCount + 1;

        await ctx.db.patch(args.destinationId, {
          crowdData: {
            crowdLevel: args.crowdLevel,
            bestTimeToVisit: dest.crowdData?.bestTimeToVisit || dest.bestTimeToVisit || "Early morning",
            crowdSourceNote: args.note ? `Recent community report: "${args.note}"` : dest.crowdData?.crowdSourceNote || "Updated based on Gold Explorer community reports.",
            reportCount: newCount,
            updatedAt: Date.now(),
          },
        });
      }
    } else if (args.gemId) {
      const gem = await ctx.db.get(args.gemId);
      if (gem) {
        const existingCount = gem.crowdData?.reportCount || 5;
        const newCount = existingCount + 1;

        await ctx.db.patch(args.gemId, {
          crowdData: {
            crowdLevel: args.crowdLevel,
            bestTimeToVisit: gem.crowdData?.bestTimeToVisit || gem.bestTimeToVisit || "Early morning",
            crowdSourceNote: args.note ? `Recent community report: "${args.note}"` : gem.crowdData?.crowdSourceNote || "Updated based on Gold Explorer community reports.",
            reportCount: newCount,
            updatedAt: Date.now(),
          },
        });
      }
    }

    // Award +15 points to user for contributing verified crowd data
    const pointsAwarded = 15;
    const newTotalPoints = (user.totalPoints ?? 0) + pointsAwarded;
    await ctx.db.patch(userId, { totalPoints: newTotalPoints });

    await ctx.db.insert("pointsLedger", {
      userId,
      actionType: "crowd_report",
      pointsEarned: pointsAwarded,
      timestamp: Date.now(),
      referenceId: args.destinationId || args.gemId,
    });

    return { success: true, pointsAwarded };
  },
});



