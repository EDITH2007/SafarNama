import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Custom users table schema extension
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Custom SafarNama user properties
    role: v.optional(v.string()), // "user" | "admin"
    tier: v.optional(v.string()), // "Explorer" | "Trailblazer" | "Local Legend"
    totalPoints: v.optional(v.number()), // cached total points from pointsLedger
    isVerified: v.optional(v.boolean()), // whether user profile is verified
    bio: v.optional(v.string()),
    homeTown: v.optional(v.string()),
    language: v.optional(v.string()), // "en" | "hi" | "es" | "fr" | "de"
    currency: v.optional(v.string()), // "INR" | "USD" | "EUR" | "GBP" | "AED"

    // Legacy fields from existing user records:
    passwordHash: v.optional(v.string()),
    salt: v.optional(v.string()),
    username: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("by_points", ["totalPoints"]),

  // Official/curated destinations added by admins
  destinations: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.string(), // e.g. "Manali, Himachal Pradesh"
    state: v.string(), // e.g. "Himachal Pradesh"
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    photos: v.array(v.string()), // Array of image URLs or storage IDs
    category: v.string(), // e.g. "Hills", "Beaches", "Heritage", "Spiritual", "Wildlife"
    addedBy: v.id("users"), // Reference to the admin who added it
    createdAt: v.number(), // Timestamp
    bestTimeToVisit: v.optional(v.string()),
    howToReach: v.optional(v.string()),
    nearbyAttractions: v.optional(v.array(v.string())),
    tips: v.optional(v.array(v.string())),
    photoGallery: v.optional(v.array(v.string())),
    sourceName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    crowdData: v.optional(
      v.object({
        crowdLevel: v.string(), // "low" | "moderate" | "high" | "overcrowded"
        bestTimeToVisit: v.optional(v.string()),
        crowdSourceNote: v.optional(v.string()),
        reportCount: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
      })
    ),
  })
    .index("by_category", ["category"])
    .index("by_state", ["state"]),

  // User-submitted hidden gems
  hiddenGems: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.string(),
    state: v.string(),
    geo: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    photo: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
    category: v.string(), // e.g. "Waterfall", "Trek", "Secret Beach", "Local Eatery"
    submittedBy: v.id("users"), // User who submitted this gem
    status: v.string(), // "submitted" | "in_review" | "verified" | "rejected"
    approvedBy: v.optional(v.id("users")), // Admin who reviewed it
    pointsAwarded: v.optional(v.number()), // Points given for approval
    rejectionReason: v.optional(v.string()), // If status is "rejected"
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    bestTimeToVisit: v.optional(v.string()),
    howToReach: v.optional(v.string()),
    nearbyAttractions: v.optional(v.array(v.string())),
    tips: v.optional(v.array(v.string())),
    photoGallery: v.optional(v.array(v.string())),
    crowdData: v.optional(
      v.object({
        crowdLevel: v.string(), // "low" | "moderate" | "high" | "overcrowded"
        bestTimeToVisit: v.optional(v.string()),
        crowdSourceNote: v.optional(v.string()),
        reportCount: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
      })
    ),
  })
    .index("by_status", ["status"])
    .index("by_submittedBy", ["submittedBy"])
    .index("by_category", ["category"]),

  // Community-submitted crowd reports
  crowdReports: defineTable({
    destinationId: v.optional(v.id("destinations")),
    gemId: v.optional(v.id("hiddenGems")),
    userId: v.id("users"),
    crowdLevel: v.string(), // "low" | "moderate" | "high" | "overcrowded"
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_destination", ["destinationId"])
    .index("by_gem", ["gemId"])
    .index("by_user", ["userId"]),

  // Reviews for both destinations and hidden gems
  reviews: defineTable({
    rating: v.number(), // 1 to 5
    text: v.string(),
    photos: v.optional(v.array(v.string())),
    author: v.id("users"),
    destinationId: v.optional(v.id("destinations")), // Linked to official destination
    gemId: v.optional(v.id("hiddenGems")), // Linked to hidden gem
    createdAt: v.number(),
    flagged: v.optional(v.boolean()),
  })
    .index("by_destination", ["destinationId"])
    .index("by_gem", ["gemId"])
    .index("by_author", ["author"]),

  // User-written travel stories
  blogs: defineTable({
    title: v.optional(v.string()),
    content: v.optional(v.string()), // Rich text or markdown content
    coverImage: v.optional(v.string()),
    author: v.optional(v.id("users")),
    status: v.optional(v.string()), // "draft" | "published"
    createdAt: v.optional(v.any()),
    flagged: v.optional(v.boolean()),
    authorAvatar: v.optional(v.string()),
    authorName: v.optional(v.string()),
    category: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    readTime: v.optional(v.number()),
    slug: v.optional(v.string()),
    uploadedByUsername: v.optional(v.string()),
  })
    .index("by_author", ["author"])
    .index("by_status_created", ["status", "createdAt"]),

  // Wishlists mapping destinations/gems to users
  wishlists: defineTable({
    userId: v.id("users"),
    destinationId: v.optional(v.id("destinations")),
    gemId: v.optional(v.id("hiddenGems")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_destination", ["userId", "destinationId"])
    .index("by_user_gem", ["userId", "gemId"]),

  // AI-generated or manual itineraries
  tripPlans: defineTable({
    userId: v.optional(v.id("users")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.string()), // ISO string or format e.g. "2026-10-15"
    endDate: v.optional(v.string()),
    isAI: v.optional(v.boolean()), // whether generated by AI or manually created
    isCustom: v.optional(v.boolean()), // whether it is a custom plan created/saved by the user
    status: v.optional(v.string()), // "planning" | "upcoming" | "completed"
    createdAt: v.optional(v.number()),
    itinerary: v.optional(v.array(
      v.object({
        dayNumber: v.number(),
        date: v.optional(v.string()),
        activities: v.array(
          v.object({
            time: v.string(), // e.g. "09:00 AM" or "Morning"
            title: v.string(),
            description: v.optional(v.string()),
            cost: v.optional(v.number()),
            currency: v.optional(v.string()),
            location: v.optional(v.string()),
            durationMinutes: v.optional(v.number()),
            destinationId: v.optional(v.id("destinations")),
            gemId: v.optional(v.id("hiddenGems")),
          })
        ),
      })
    )),
    destination: v.optional(v.string()),
    summary: v.optional(v.string()),
    travelers: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),

  // Travel expenses tracking
  expenses: defineTable({
    userId: v.optional(v.id("users")),
    tripId: v.string(), // linked to tripPlans _id or custom/mock trip string ID
    category: v.string(), // "Food" | "Stay" | "Transport" | "Tickets" | "Shopping" | "Other"
    amount: v.number(),
    currency: v.optional(v.string()), // e.g. "INR", "USD"
    date: v.string(), // YYYY-MM-DD
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_trip", ["tripId"]),

  // Audit log of all points transactions
  pointsLedger: defineTable({
    userId: v.id("users"),
    actionType: v.string(), // "submit_gem" | "gem_approved" | "review" | "blog"
    pointsEarned: v.number(), // positive or negative
    timestamp: v.number(),
    referenceId: v.optional(v.string()), // ID of entity associated (e.g. gemId)
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  // In-app notifications for users
  notifications: defineTable({
    userId: v.id("users"),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
    relatedSubmissionId: v.optional(v.id("hiddenGems")),
  })
    .index("by_user_unread", ["userId", "read"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Shared traveler journeys
  journeys: defineTable({
    title: v.string(),
    description: v.string(),
    duration: v.string(),
    stops: v.array(v.string()),
    author: v.id("users"),
    status: v.string(), // "pending" | "approved" | "rejected"
    approvedBy: v.optional(v.id("users")),
    pointsAwarded: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_author", ["author"]),

  // User preferences (language, currency settings)
  userPreferences: defineTable({
    userId: v.id("users"),
    language: v.string(),
    currency: v.string(),
  }).index("by_user", ["userId"]),

  // Saved itineraries mapping users to trip plans or journeys
  savedItineraries: defineTable({
    userId: v.id("users"),
    tripPlanId: v.optional(v.id("tripPlans")),
    journeyId: v.optional(v.id("journeys")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_trip", ["userId", "tripPlanId"])
    .index("by_user_journey", ["userId", "journeyId"]),

  // Stays marketplace table
  stays: defineTable({
    destinationId: v.string(), // Reference to destination or hidden-gem ID string
    type: v.string(), // "hotel" | "homestay" | "airbnb-style"
    name: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    pricePerNightINR: v.number(),
    maxGuests: v.number(),
    amenities: v.array(v.string()),
    hostName: v.string(),
    hostVerified: v.boolean(),
    rating: v.number(),
    reviewCount: v.number(),
    availabilityCalendar: v.optional(
      v.array(
        v.object({
          startDate: v.string(),
          endDate: v.string(),
          isBlocked: v.boolean(),
        })
      )
    ),
    latitude: v.number(),
    longitude: v.number(),
    createdAt: v.optional(v.number()),
  })
    .index("by_destination", ["destinationId"])
    .index("by_type", ["type"]),

  // Bookings made for stays
  stayBookings: defineTable({
    stayId: v.union(v.id("stays"), v.string()),
    userId: v.id("users"),
    checkIn: v.string(),
    checkOut: v.string(),
    guests: v.number(),
    totalPriceINR: v.number(),
    status: v.string(), // "confirmed" | "cancelled" | "completed"
    pointsEarned: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stay", ["stayId"]),
});


