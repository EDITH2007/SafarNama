export interface Destination {
  id: string;
  title: string;
  description: string;
  location: string;
  state: string;
  photos: string[];
  category: string;
  addedBy: string;
  rating: number;
  bestTimeToVisit?: string;
  howToReach?: string;
  nearbyAttractions?: string[];
  tips?: string[];
  photoGallery?: string[];
  geo?: {
    lat: number;
    lng: number;
  };
}

export interface HiddenGem {
  id: string;
  title: string;
  description: string;
  location: string;
  state: string;
  photo: string;
  category: string;
  submittedBy: string;
  submitterTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  submitterVerified: boolean;
  pointsAwarded: number;
  createdAt: string;
  status: "submitted" | "in_review" | "verified" | "rejected" | "pending" | "approved";
  rejectionReason?: string;
  geo?: {
    lat: number;
    lng: number;
  };
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  author: string;
  authorImage?: string;
  authorTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  authorVerified: boolean;
  date: string;
  flagged?: boolean;
}

export interface Review {
  id: string;
  title: string;
  text: string;
  rating: number;
  author: string;
  authorTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  authorVerified: boolean;
  location: string;
  date: string;
  flagged?: boolean;
}

export interface Journey {
  id: string;
  title: string;
  duration: string;
  type: "AI-Generated" | "Manual";
  description: string;
  stops: string[];
  author: string;
  completed?: boolean;
  rawPlan?: any;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  isVerified: boolean;
  isCurrentUser?: boolean;
}

// Points Constants
export const POINTS = {
  SUBMIT_GEM: 100, // given upon approval
  WRITE_REVIEW: 30, // given immediately
  WRITE_BLOG: 30, // given immediately
  COMPLETE_TRIP: 50, // given when a trip plan is marked completed
};

// Tier thresholds
export const getTier = (points: number): "Bronze" | "Silver" | "Gold" | "Platinum" => {
  if (points >= 5000) return "Platinum";
  if (points >= 2500) return "Gold";
  if (points >= 1000) return "Silver";
  return "Bronze";
};

export const CATEGORIES = ["All", "Hills", "Beaches", "Heritage", "Wildlife", "Spiritual", "Trek", "Trekking", "Waterfall", "Desert", "Camping", "Offbeat", "Adventure", "Food & Local Cuisine", "Photography Spot", "Family-Friendly", "Solo Travel", "Offbeat/Remote", "Historical Ruins", "Sunset/Sunrise Point"];

export const mockDestinations: Destination[] = [
  {
    id: "dest-1",
    title: "Munnar Tea Hills",
    description: "Lush green rolling hills, misty trails, and sprawling organic tea estates in the heart of Kerala.",
    location: "Munnar, Kerala",
    state: "Kerala",
    photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"],
    category: "Hills",
    addedBy: "Admin",
    rating: 4.8,
  },
  {
    id: "dest-2",
    title: "Ruins of Hampi",
    description: "Step back into the golden era of the Vijayanagara Empire amidst boulder-strewn hills and monolithic temples.",
    location: "Hampi, Karnataka",
    state: "Karnataka",
    photos: ["https://images.unsplash.com/photo-1600100398055-124e57517a9e?auto=format&fit=crop&w=800&q=80"],
    category: "Heritage",
    addedBy: "Admin",
    rating: 4.9,
  },
  {
    id: "dest-3",
    title: "Radhanagar Beach",
    description: "Award-winning turquoise waters and white sand, framed by deep green mahua forests on Havelock Island.",
    location: "Havelock Island, Andaman",
    state: "Andaman & Nicobar",
    photos: ["https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80"],
    category: "Beaches",
    addedBy: "Admin",
    rating: 4.7,
  },
  {
    id: "dest-4",
    title: "Kaziranga Forest",
    description: "Wild grasslands sanctuary, sanctuary to the world's largest population of great Indian one-horned rhinoceroses.",
    location: "Kaziranga, Assam",
    state: "Assam",
    photos: ["https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80"],
    category: "Wildlife",
    addedBy: "Admin",
    rating: 4.6,
  },
  {
    id: "dest-5",
    title: "Gokarna Cliffs",
    description: "Pristine rocky coastlines meeting sandy beaches, offering a relaxed alternative to crowded tourist centers.",
    location: "Gokarna, Karnataka",
    state: "Karnataka",
    photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"],
    category: "Offbeat",
    addedBy: "Admin",
    rating: 4.5,
  }
];

export const mockHiddenGems: HiddenGem[] = [
  {
    id: "gem-1",
    title: "Gandikota Grand Canyon",
    description: "A stunning gorge carved by the Pennar River through red granite rocks, resembling the American Grand Canyon.",
    location: "Kadapa, Andhra Pradesh",
    state: "Andhra Pradesh",
    photo: "https://images.unsplash.com/photo-1626590212990-2e40026e6cb5?auto=format&fit=crop&w=800&q=80",
    category: "Offbeat",
    submittedBy: "Aarav Sharma",
    submitterTier: "Silver",
    submitterVerified: false,
    pointsAwarded: 100,
    createdAt: "July 2026",
    status: "verified",
  },
  {
    id: "gem-2",
    title: "Phugtal Cave Monastery",
    description: "A 12th-century Buddhist monastery built directly into the cliffside of a remote gorge in southeastern Zanskar.",
    location: "Zanskar, Ladakh",
    state: "Ladakh",
    photo: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    category: "Offbeat",
    submittedBy: "Tenzing Norgay",
    submitterTier: "Gold",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "June 2026",
    status: "verified",
  },
  {
    id: "gem-3",
    title: "Lonar Crater Lake",
    description: "A hyper-saline alkaline lake created by a meteorite impact during the Pleistocene Epoch, surrounded by temples.",
    location: "Buldhana, Maharashtra",
    state: "Maharashtra",
    photo: "https://images.unsplash.com/photo-1583143874828-de3d288be51a?auto=format&fit=crop&w=800&q=80",
    category: "Offbeat",
    submittedBy: "Priya Patel",
    submitterTier: "Silver",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "May 2026",
    status: "verified",
  }
];

export const mockBlogs: Blog[] = [
  {
    id: "blog-1",
    title: "Backpacking Solo through the Ruins of Hampi",
    content: "Hampi has a way of slowing down time. Wandering through the ancient bazaars, climbing Matanga Hill for sunrise, and crossing the Tungabhadra river on a coracle feel like steps into another universe entirely...",
    coverImage: "https://images.unsplash.com/photo-1600100398055-124e57517a9e?auto=format&fit=crop&w=800&q=80",
    author: "Aarav Sharma",
    authorImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
    authorTier: "Silver",
    authorVerified: false,
    date: "July 08, 2026"
  },
  {
    id: "blog-2",
    title: "Chasing Quietude: Finding Gokarna's Secret Half Moon Beach",
    content: "If you hike over the rocky cliffs from Om Beach, you'll find a cove untouched by commercial shacks. Half Moon Beach offers pristine sand, relative isolation, and a stellar view of bioluminescent plankton at night...",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    author: "Sneha Gupta",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    authorTier: "Bronze",
    authorVerified: false,
    date: "June 29, 2026"
  }
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    title: "A green paradise that heals",
    text: "Waking up to the smell of fresh tea leaves in Munnar was life-changing. Avoid the main tourist spots during peak hours and just walk through the tea estate paths instead. Make sure to wear leach guards if it's raining!",
    rating: 5,
    author: "Priya Patel",
    authorTier: "Silver",
    authorVerified: true,
    location: "Munnar Tea Hills",
    date: "2 days ago"
  },
  {
    id: "rev-2",
    title: "Spectacular gorge but hard to reach",
    text: "Gandikota Grand Canyon is awe-inspiring, especially during golden hour. The rock climbing path to get a good viewpoint is a bit slippery, and facilities are sparse, but the pure sunset over the red canyon makes up for it.",
    rating: 4,
    author: "Rohan Das",
    authorTier: "Bronze",
    authorVerified: false,
    location: "Gandikota Grand Canyon",
    date: "1 week ago"
  }
];

export const mockJourneys: Journey[] = [
  {
    id: "journey-1",
    title: "5 Days in Mystical Ladakh Itinerary",
    duration: "5 Days",
    type: "AI-Generated",
    description: "A tailored, high-altitude acclimatization itinerary visiting Leh monasteries, Pangong Lake, and Nubra Valley.",
    stops: ["Leh Palace", "Hemis Monastery", "Khardung La Pass", "Hunder Dunes", "Pangong Lake"],
    author: "AI Travel Assistant",
    completed: false
  },
  {
    id: "journey-2",
    title: "Weekend Coastal Trek in Gokarna",
    duration: "3 Days",
    type: "Manual",
    description: "A scenic beach-hopping trek passing through Kudle Beach, Om Beach, Half Moon Beach, and Paradise Beach.",
    stops: ["Kudle Beach", "Om Beach Hike", "Half Moon Cove", "Paradise Beach Camping"],
    author: "Sneha Gupta",
    completed: false
  }
];

export const mockLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Tenzing Norgay", tier: "Gold", points: 2600, isVerified: true },
  { rank: 2, name: "Aarav Sharma", tier: "Silver", points: 1200, isVerified: false },
  { rank: 3, name: "Priya Patel", tier: "Silver", points: 1050, isVerified: true },
  { rank: 4, name: "Sneha Gupta", tier: "Bronze", points: 180, isVerified: false, isCurrentUser: true }
];
