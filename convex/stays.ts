import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { calculateUserTier } from "./users";

// Helper seed data for 3-5 stays per major destination

export const INITIAL_STAYS = [
  // Destination: Munnar Tea Hills (dest-1)
  {
    destinationId: "dest-1",
    type: "homestay",
    name: "Misty Mountain Valley Homestay",
    description: "Nestled right amidst the organic tea hills of Munnar, offering homemade Keralan breakfast and panoramic valley sunrise views.",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 3200,
    maxGuests: 4,
    amenities: ["Free Wi-Fi", "Tea Estate Tour", "Breakfast Included", "Hot Water", "Mountain View"],
    hostName: "Mathew Varghese",
    hostVerified: true,
    rating: 4.9,
    reviewCount: 42,
    latitude: 10.0889,
    longitude: 77.0595,
  },
  {
    destinationId: "dest-1",
    type: "hotel",
    name: "Eravikulam Heritage Resort & Spa",
    description: "Luxury eco-resort overlooking the Nilgiri hills with private balcony tea garden access, infinity pool, and Ayurvedic spa.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 7500,
    maxGuests: 3,
    amenities: ["Swimming Pool", "Spa & Wellness", "Restaurant", "Free Wi-Fi", "Air Conditioning", "Valet Parking"],
    hostName: "SafarNama Verified Resort Group",
    hostVerified: true,
    rating: 4.8,
    reviewCount: 88,
    latitude: 10.0920,
    longitude: 77.0620,
  },
  {
    destinationId: "dest-1",
    type: "airbnb-style",
    name: "Cardamom Trail Eco Cottage",
    description: "Rustic wooden cottage secluded in a spice plantation. Perfect for couples and peace-seekers wanting a quiet hill stay.",
    images: [
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 4100,
    maxGuests: 2,
    amenities: ["Spice Plantation Access", "Kitchenette", "Firepit", "Free Parking", "Breakfast"],
    hostName: "Anu & Joseph",
    hostVerified: true,
    rating: 4.7,
    reviewCount: 31,
    latitude: 10.0820,
    longitude: 77.0540,
  },

  // Destination: Ruins of Hampi (dest-2)
  {
    destinationId: "dest-2",
    type: "homestay",
    name: "Boulders & Palms Riverfront Cottage",
    description: "Traditional stone cottage right across the Tungabhadra River, overlooking banana plantations and ancient granite hills.",
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 2800,
    maxGuests: 4,
    amenities: ["Bicycle Rental", "River View", "Rooftop Cafe", "Wi-Fi", "Homemade South Indian Meals"],
    hostName: "Ramesh Gowda",
    hostVerified: true,
    rating: 4.85,
    reviewCount: 56,
    latitude: 15.3350,
    longitude: 76.4600,
  },
  {
    destinationId: "dest-2",
    type: "hotel",
    name: "Heritage Palace Resort Hampi",
    description: "Vijayanagara era architecture inspired boutique resort featuring grand courtyards, traditional dining, and guided temple tours.",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 8900,
    maxGuests: 3,
    amenities: ["Heritage Architecture", "Swimming Pool", "Cultural Performances", "Restaurant", "Wi-Fi"],
    hostName: "Vijayanagara Heritage Stays",
    hostVerified: true,
    rating: 4.9,
    reviewCount: 112,
    latitude: 15.3400,
    longitude: 76.4650,
  },

  // Destination: Radhanagar Beach (dest-3)
  {
    destinationId: "dest-3",
    type: "airbnb-style",
    name: "Havelock Turquoise Sands Villa",
    description: "Beachfront wooden bungalow 2 minutes walk from Radhanagar Beach shore, surrounded by giant tropical mahua trees.",
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 6400,
    maxGuests: 4,
    amenities: ["Beach Access", "Snorkeling Gear", "Sea View", "Air Conditioning", "Free Breakfast"],
    hostName: "Captain Devender Singh",
    hostVerified: true,
    rating: 4.95,
    reviewCount: 64,
    latitude: 12.0304,
    longitude: 92.9876,
  },
  {
    destinationId: "dest-3",
    type: "homestay",
    name: "Island Breeze Eco Huts",
    description: "Sustainable bamboo eco huts near Kalapathar & Radhanagar beaches with fresh seafood dining and island scooter rentals.",
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 3500,
    maxGuests: 3,
    amenities: ["Scooter Rental", "Fresh Seafood", "Hammocks", "Wi-Fi", "Garden"],
    hostName: "Anita Biswas",
    hostVerified: true,
    rating: 4.75,
    reviewCount: 29,
    latitude: 12.0350,
    longitude: 92.9890,
  },

  // Destination: Kaziranga Forest (dest-4)
  {
    destinationId: "dest-4",
    type: "hotel",
    name: "Wild Rhino Safari Lodge",
    description: "Jungle lodge adjacent to Kaziranga National Park Central Range entry. Features safari desk and Assamese cultural dining.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 5200,
    maxGuests: 4,
    amenities: ["Jeep Safari Booking Desk", "Assamese Thali Restaurant", "Bonfire", "Free Wi-Fi", "Parking"],
    hostName: "Biren Gogoi",
    hostVerified: true,
    rating: 4.8,
    reviewCount: 75,
    latitude: 26.5775,
    longitude: 93.1711,
  },

  // Destination: Gokarna Cliffs (dest-5)
  {
    destinationId: "dest-5",
    type: "homestay",
    name: "Kudle Cliffside Beach House",
    description: "Perched atop the rocks overlooking Kudle Beach, watch spectacular Arabian Sea sunsets directly from your private hammock deck.",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 2900,
    maxGuests: 3,
    amenities: ["Ocean View Deck", "Cliff Access Trail", "Yoga Lawn", "Cafeteria", "Wi-Fi"],
    hostName: "Ganesh Pujari",
    hostVerified: true,
    rating: 4.9,
    reviewCount: 94,
    latitude: 14.5479,
    longitude: 74.3188,
  },

  // Destination: Gateway of India & Marine Drive (dest-6)
  {
    destinationId: "dest-6",
    type: "hotel",
    name: "Colaba Waterfront Boutique Stay",
    description: "Classic South Mumbai heritage boutique stay located steps away from Gateway of India, Taj Mahal Palace, and Causeway market.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 6800,
    maxGuests: 2,
    amenities: ["Heritage Building", "City & Sea View", "High-speed Wi-Fi", "Breakfast", "Air Conditioning"],
    hostName: "Zubin Irani",
    hostVerified: true,
    rating: 4.85,
    reviewCount: 140,
    latitude: 18.9220,
    longitude: 72.8347,
  },

  // Hidden Gem: Gandikota Grand Canyon (gem-1)
  {
    destinationId: "gem-1",
    type: "homestay",
    name: "Fortside Canyon View Homestay",
    description: "Authentic local family homestay near Gandikota Fort gate, serving homemade Rayalaseema meals and organizing cliff stargazing.",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 2200,
    maxGuests: 5,
    amenities: ["Home Cooked Meals", "Canyon Sunset Trail", "Free Parking", "Hot Water", "Stargazing Deck"],
    hostName: "Subba Reddy",
    hostVerified: true,
    rating: 4.9,
    reviewCount: 38,
    latitude: 14.8011,
    longitude: 78.2664,
  },

  // Hidden Gem: Phugtal Cave Monastery (gem-2)
  {
    destinationId: "gem-2",
    type: "homestay",
    name: "Zanskar Valley Cliff Homestay",
    description: "Traditional Zanskari stone home offering warm butter tea, firewood heating, and guiding for the Phugtal cave trek.",
    images: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80",
    ],
    pricePerNightINR: 1900,
    maxGuests: 3,
    amenities: ["Local Trekking Guide", "Traditional Wood Stove", "Ladakhi Meals", "Stargazing"],
    hostName: "Stanzin Dorje",
    hostVerified: true,
    rating: 4.95,
    reviewCount: 19,
    latitude: 33.1711,
    longitude: 77.2356,
  },
];

// Seeding function
export async function ensureStaysSeeded(db: any) {

  const existing = await db.query("stays").collect();
  if (existing.length === 0) {
    for (const stay of INITIAL_STAYS) {
      await db.insert("stays", {
        ...stay,
        createdAt: Date.now(),
      });
    }
  }
}

// Queries
export const getStays = query({
  args: {
    type: v.optional(v.string()),
    destinationId: v.optional(v.string()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let stays = await ctx.db.query("stays").collect();
    if (args.type && args.type !== "All") {
      stays = stays.filter((s) => s.type === args.type);
    }
    if (args.destinationId && args.destinationId !== "All") {
      stays = stays.filter((s) => s.destinationId === args.destinationId);
    }
    if (args.maxPrice && args.maxPrice > 0) {
      stays = stays.filter((s) => s.pricePerNightINR <= args.maxPrice!);
    }
    return stays;
  },
});

export const getStaysByDestination = query({
  args: {
    destinationId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stays")
      .withIndex("by_destination", (q) => q.eq("destinationId", args.destinationId))
      .collect();
  },
});

export const getStayById = query({
  args: {
    id: v.id("stays"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserStayBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("stayBookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Mutations
export const createStayBooking = mutation({
  args: {
    stayId: v.union(v.id("stays"), v.string()),
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.number(),
    totalPriceINR: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const pointsEarned = 500; // 500 points for stay booking

    // Insert booking
    const bookingId = await ctx.db.insert("stayBookings", {
      stayId: args.stayId,
      userId: userId,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guests: args.guests,
      totalPriceINR: args.totalPriceINR,
      status: "confirmed",
      pointsEarned: pointsEarned,
      createdAt: Date.now(),
    });

    // Update user points and tier
    const user = await ctx.db.get(userId);
    if (user) {
      const newPoints = (user.totalPoints ?? 0) + pointsEarned;
      const newTier = await calculateUserTier(ctx.db, userId);

      await ctx.db.patch(userId, {
        totalPoints: newPoints,
        tier: newTier,
      });

      // Add points ledger record
      await ctx.db.insert("pointsLedger", {
        userId: userId,
        actionType: "stay_booking",
        pointsEarned: pointsEarned,
        timestamp: Date.now(),
        referenceId: bookingId,
      });

      // Add notification
      await ctx.db.insert("notifications", {
        userId: userId,
        message: `Stay booking confirmed! Earned +${pointsEarned} Explorer Points.`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return bookingId;
  },
});

export const cancelStayBooking = mutation({
  args: {
    bookingId: v.id("stayBookings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
    });

    return { success: true };
  },
});
