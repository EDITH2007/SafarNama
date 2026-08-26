export interface CrowdData {
  crowdLevel: "low" | "moderate" | "high" | "overcrowded" | string;
  bestTimeToVisit?: string;
  crowdSourceNote?: string;
  reportCount?: number;
  updatedAt?: number;
}

export function getCrowdData(entity?: { crowdData?: CrowdData; bestTimeToVisit?: string; title?: string; location?: string }): CrowdData {
  if (entity?.crowdData && entity.crowdData.crowdLevel) {
    return entity.crowdData;
  }

  const title = (entity?.title || "").toLowerCase();
  const location = (entity?.location || "").toLowerCase();

  if (title.includes("amritsar") || location.includes("amritsar")) {
    return {
      crowdLevel: "high",
      bestTimeToVisit: "Early morning (4:00–6:00 AM) or Oct–Mar",
      crowdSourceNote: "Golden Temple complex experiences heavy footfall from mid-morning to evening.",
      reportCount: 35,
    };
  }

  if (title.includes("mumbai") || location.includes("mumbai")) {
    return {
      crowdLevel: "high",
      bestTimeToVisit: "Sunrise or late night, Oct–Mar",
      crowdSourceNote: "Gateway of India & Marine Drive experience high footfall during peak weekend hours.",
      reportCount: 30,
    };
  }

  if (title.includes("radhanagar") || location.includes("havelock")) {
    return {
      crowdLevel: "overcrowded",
      bestTimeToVisit: "Early morning (7:00–9:30 AM) or shoulder season",
      crowdSourceNote: "Peak afternoon cruise ship arrivals cause 10x visitor volume.",
      reportCount: 42,
    };
  }

  if (title.includes("hampi") || location.includes("hampi")) {
    return {
      crowdLevel: "high",
      bestTimeToVisit: "Sunrise (5:30–7:30 AM) or Oct–Jan",
      crowdSourceNote: "Vittala Temple complex gets heavily congested by noon.",
      reportCount: 28,
    };
  }

  if (title.includes("munnar") || location.includes("munnar")) {
    return {
      crowdLevel: "moderate",
      bestTimeToVisit: "Early morning (6:30–9:00 AM) or Nov–Feb",
      crowdSourceNote: "Peak season sees 4x visitor volume vs shoulder months.",
      reportCount: 14,
    };
  }

  if (title.includes("kaziranga") || location.includes("kaziranga")) {
    return {
      crowdLevel: "low",
      bestTimeToVisit: "First slot morning safari (6:00 AM), Nov–Apr",
      crowdSourceNote: "Daily safari entry caps keep crowds low and wildlife experiences intimate.",
      reportCount: 19,
    };
  }

  if (title.includes("gokarna") || location.includes("gokarna")) {
    return {
      crowdLevel: "low",
      bestTimeToVisit: "Late afternoon for cliff trek, Oct–Mar",
      crowdSourceNote: "Far less commercialized than North Goa; secluded coves maintain a calm vibe.",
      reportCount: 22,
    };
  }

  return {
    crowdLevel: "moderate",
    bestTimeToVisit: entity?.bestTimeToVisit || "October to March",
    crowdSourceNote: "Community & seasonal baseline crowd rating.",
    reportCount: 10,
  };
}

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
  crowdData?: CrowdData;
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
  bestTimeToVisit?: string;
  howToReach?: string;
  nearbyAttractions?: string[];
  tips?: string[];
  photoGallery?: string[];
  crowdData?: CrowdData;
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
  type: "Custom Plan" | "Official Guide" | "Community Route" | "AI-Generated" | "Manual";
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
    geo: { lat: 10.0889, lng: 77.0595 },
    photos: ["https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80"],
    category: "Hills",
    addedBy: "Admin",
    rating: 4.8,
    bestTimeToVisit: "September to May",
    crowdData: {
      crowdLevel: "moderate",
      bestTimeToVisit: "Early morning (6:30–9:00 AM) or Nov–Feb",
      crowdSourceNote: "Peak season sees 4x visitor volume vs shoulder months; early morning offers serene tea garden views.",
      reportCount: 14,
    },
  },
  {
    id: "dest-2",
    title: "Ruins of Hampi",
    description: "Step back into the golden era of the Vijayanagara Empire amidst boulder-strewn hills and monolithic temples.",
    location: "Hampi, Karnataka",
    state: "Karnataka",
    geo: { lat: 15.3350, lng: 76.4600 },
    photos: ["https://images.unsplash.com/photo-1600100398055-124e57517a9e?auto=format&fit=crop&w=800&q=80"],
    category: "Heritage",
    addedBy: "Admin",
    rating: 4.9,
    bestTimeToVisit: "October to February",
    crowdData: {
      crowdLevel: "high",
      bestTimeToVisit: "Sunrise (5:30–7:30 AM) or Oct–Jan",
      crowdSourceNote: "Vittala Temple complex gets heavily congested by noon; visit Anegundi side for quieter ruins.",
      reportCount: 28,
    },
  },
  {
    id: "dest-3",
    title: "Radhanagar Beach",
    description: "Award-winning turquoise waters and white sand, framed by deep green mahua forests on Havelock Island.",
    location: "Havelock Island, Andaman",
    state: "Andaman & Nicobar",
    geo: { lat: 12.0304, lng: 92.9876 },
    photos: ["https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80"],
    category: "Beaches",
    addedBy: "Admin",
    rating: 4.7,
    bestTimeToVisit: "November to April",
    crowdData: {
      crowdLevel: "overcrowded",
      bestTimeToVisit: "Early morning (7:00–9:30 AM) or shoulder season",
      crowdSourceNote: "Peak afternoon cruise ship arrivals cause 10x visitor volume; check out Kalapathar Beach for tranquility.",
      reportCount: 42,
    },
  },
  {
    id: "dest-4",
    title: "Kaziranga Forest",
    description: "Wild grasslands sanctuary, sanctuary to the world's largest population of great Indian one-horned rhinoceroses.",
    location: "Kaziranga, Assam",
    state: "Assam",
    geo: { lat: 26.5775, lng: 93.1711 },
    photos: ["https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80"],
    category: "Wildlife",
    addedBy: "Admin",
    rating: 4.6,
    bestTimeToVisit: "November to April",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "First slot morning safari (6:00 AM), Nov–Apr",
      crowdSourceNote: "Daily safari entry caps keep crowds low and wildlife experiences intimate.",
      reportCount: 19,
    },
  },
  {
    id: "dest-5",
    title: "Gokarna Cliffs",
    description: "Pristine rocky coastlines meeting sandy beaches, offering a relaxed alternative to crowded tourist centers.",
    location: "Gokarna, Karnataka",
    state: "Karnataka",
    geo: { lat: 14.5479, lng: 74.3188 },
    photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"],
    category: "Offbeat",
    addedBy: "Admin",
    rating: 4.5,
    bestTimeToVisit: "October to March",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Late afternoon for cliff trek, Oct–Mar",
      crowdSourceNote: "Far less commercialized than North Goa; secluded coves maintain a calm vibe year-round.",
      reportCount: 22,
    },
  },
  {
    id: "dest-6",
    title: "Gateway of India & Marine Drive",
    description: "Historic waterfront monument and iconic coastal promenade in South Mumbai facing the Arabian Sea.",
    location: "Mumbai, Maharashtra",
    state: "Maharashtra",
    geo: { lat: 18.9220, lng: 72.8347 },
    photos: ["https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80"],
    category: "Heritage",
    addedBy: "Admin",
    rating: 4.8,
    bestTimeToVisit: "November to February",
    crowdData: {
      crowdLevel: "overcrowded",
      bestTimeToVisit: "Sunrise (6:00–7:30 AM) or late night weekdays",
      crowdSourceNote: "Peak weekend footfalls at Gateway & Promenade cause extreme congestion.",
      reportCount: 38,
    },
  }
];

export const mockHiddenGems: HiddenGem[] = [
  {
    id: "gem-1",
    title: "Gandikota Grand Canyon",
    description: "A stunning gorge carved by the Pennar River through red granite rocks, resembling the American Grand Canyon.",
    location: "Kadapa, Andhra Pradesh",
    state: "Andhra Pradesh",
    geo: { lat: 14.8011, lng: 78.2664 },
    photo: "https://images.unsplash.com/photo-1626590212990-2e40026e6cb5?auto=format&fit=crop&w=800&q=80",
    category: "Offbeat",
    submittedBy: "Aarav Sharma",
    submitterTier: "Silver",
    submitterVerified: false,
    pointsAwarded: 100,
    createdAt: "July 2026",
    status: "verified",
    bestTimeToVisit: "October to March",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Sunset (5:00–6:30 PM), Oct–Mar",
      crowdSourceNote: "Uncrowded red canyon trail; pristine alternative to commercial hill stations.",
      reportCount: 8,
    },
  },
  {
    id: "gem-2",
    title: "Phugtal Cave Monastery",
    description: "A 12th-century Buddhist monastery built directly into the cliffside of a remote gorge in southeastern Zanskar.",
    location: "Zanskar, Ladakh",
    state: "Ladakh",
    geo: { lat: 33.1711, lng: 77.2356 },
    photo: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    category: "Offbeat",
    submittedBy: "Tenzing Norgay",
    submitterTier: "Gold",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "June 2026",
    status: "verified",
    bestTimeToVisit: "June to September",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Early morning hike, Jun–Sep",
      crowdSourceNote: "Requires a 2-hour foot trek; virtually zero tourist crowd.",
      reportCount: 5,
    },
  },
  {
    id: "gem-3",
    title: "Lonar Crater Lake",
    description: "A hyper-saline alkaline lake created by a meteorite impact during the Pleistocene Epoch, surrounded by temples.",
    location: "Buldhana, Maharashtra",
    state: "Maharashtra",
    geo: { lat: 19.9763, lng: 76.5096 },
    photo: "https://images.unsplash.com/photo-1583143874828-de3d288be51a?auto=format&fit=crop&w=800&q=80",
    category: "Offbeat",
    submittedBy: "Priya Patel",
    submitterTier: "Silver",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "May 2026",
    status: "verified",
    bestTimeToVisit: "November to February",
    crowdData: {
      crowdLevel: "moderate",
      bestTimeToVisit: "Morning perimeter trek, Nov–Feb",
      crowdSourceNote: "Peaceful geological marvel; modest weekend family visits.",
      reportCount: 12,
    },
  },
  {
    id: "gem-4",
    title: "Karnala Fort & Bird Sanctuary",
    description: "A quiet hill fort and lush bird sanctuary nestled in the Western Ghats near Panvel, perfect for peaceful nature walks.",
    location: "Panvel, Maharashtra",
    state: "Maharashtra",
    geo: { lat: 18.8958, lng: 73.1169 },
    photo: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    category: "Trek",
    submittedBy: "Vikram Rane",
    submitterTier: "Silver",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "August 2026",
    status: "verified",
    bestTimeToVisit: "October to March",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Early morning (7:00–10:00 AM), Oct–Mar",
      crowdSourceNote: "Serene nature trail; minimal weekend crowds compared to Mumbai city spots.",
      reportCount: 9,
    },
  },
  {
    id: "gem-5",
    title: "Rajmachi Fort & Kondana Caves",
    description: "Historic twin fort plateau overlooking deep green valleys and ancient Buddhist rock-cut caves near Karjat.",
    location: "Karjat, Maharashtra",
    state: "Maharashtra",
    geo: { lat: 18.8268, lng: 73.3986 },
    photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    category: "Historical Ruins",
    submittedBy: "Neha Deshmukh",
    submitterTier: "Gold",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "August 2026",
    status: "verified",
    bestTimeToVisit: "Sunrise or monsoon shoulder season",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Sunrise or monsoon shoulder season",
      crowdSourceNote: "Uncrowded mountain citadel path offering panoramic misty valley vistas.",
      reportCount: 11,
    },
  },
  {
    id: "gem-6",
    title: "Anegundi Ancient Village",
    description: "The quieter, mythical predecessor to Hampi across the Tungabhadra river, featuring ancient cave art and tranquil banana plantations.",
    location: "Koppal, Karnataka",
    state: "Karnataka",
    geo: { lat: 15.3524, lng: 76.4851 },
    photo: "https://images.unsplash.com/photo-1600100398055-124e57517a9e?auto=format&fit=crop&w=800&q=80",
    category: "Heritage",
    submittedBy: "Kavita Reddy",
    submitterTier: "Silver",
    submitterVerified: true,
    pointsAwarded: 100,
    createdAt: "August 2026",
    status: "verified",
    bestTimeToVisit: "Morning hours (7:00–10:30 AM)",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Morning hours (7:00–10:30 AM)",
      crowdSourceNote: "Cross via coracle boat for a peaceful heritage walk away from crowded Hampi temple queues.",
      reportCount: 15,
    },
  },
  {
    id: "gem-7",
    title: "Kalapathar Beach Cove",
    description: "A secluded beach with black rocks framing serene, crystal-clear turquoise waters on Havelock Island.",
    location: "Havelock Island, Andaman",
    state: "Andaman & Nicobar",
    geo: { lat: 11.9880, lng: 93.0030 },
    photo: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    category: "Secret Beach",
    submittedBy: "Deepak Ray",
    submitterTier: "Bronze",
    submitterVerified: false,
    pointsAwarded: 100,
    createdAt: "August 2026",
    status: "verified",
    bestTimeToVisit: "Early morning sunrise",
    crowdData: {
      crowdLevel: "low",
      bestTimeToVisit: "Early morning sunrise",
      crowdSourceNote: "Uncrowded pristine coast; peaceful escape from Radhanagar tourist congestion.",
      reportCount: 7,
    },
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
    type: "Official Guide",
    description: "A tailored, high-altitude acclimatization itinerary visiting Leh monasteries, Pangong Lake, and Nubra Valley.",
    stops: ["Leh Palace", "Hemis Monastery", "Khardung La Pass", "Hunder Dunes", "Pangong Lake"],
    author: "SafarNama Official",
    completed: false
  },
  {
    id: "journey-2",
    title: "Weekend Coastal Trek in Gokarna",
    duration: "3 Days",
    type: "Community Route",
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
