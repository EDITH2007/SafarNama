import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

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
      }
    ];

    for (const dest of initialDestinations) {
      await db.insert("destinations", {
        ...dest,
        addedBy: adminId || admin?._id, // Assign to first admin or dummy/seed user
      });
    }
  }
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

      results.push({
        id: dest._id,
        ...dest,
        addedBy: creator?.name || "Admin",
        rating,
      });
    }
    return results;
  },
});

// Query a single official destination by ID
export const getDestinationById = query({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    const dest = await ctx.db.get(args.id);
    if (!dest) return null;
    const creator = await ctx.db.get(dest.addedBy);

    // Fetch actual reviews for average score calculation
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_destination", (q) => q.eq("destinationId", args.id))
      .collect();

    const rating = reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 4.8; // Default rating fallback

    return {
      id: dest._id,
      ...dest,
      addedBy: creator?.name || "Admin",
      rating,
      reviewCount: reviews.length,
    };
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

    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

// Delete an official destination and clean up reviews (admin only)
export const deleteDestination = mutation({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: Not authenticated");
    }
    const admin = await ctx.db.get(userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Admin privileges required");
    }

    // 1. Clean up associated reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_destination", (q) => q.eq("destinationId", args.id))
      .collect();
    
    for (const review of reviews) {
      await ctx.db.delete(review._id);
    }

    // 2. Delete the destination record itself
    await ctx.db.delete(args.id);
    return { success: true };
  },
});


