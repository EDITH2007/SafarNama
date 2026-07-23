"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RetentionZone from "@/components/RetentionZone";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

export default function TravelerStoriesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-earth-forest text-earth-sand py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 z-0" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-full mb-2">
              <BookOpen className="h-6 w-6 text-earth-saffron" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
              Traveler Stories & Chronicles
            </h1>
            <p className="font-sans text-sm md:text-base text-earth-sand/80 max-w-2xl mx-auto font-light leading-relaxed">
              Explore the complete log of routes, local itineraries, assessments, and personal travelogues shared by our explorer community.
            </p>
          </div>
        </section>

        {/* Stories List (RetentionZone in non-landing mode shows full lists and no sidebar) */}
        <RetentionZone 
          isLandingPage={false}
          onViewPlan={(journeyId) => router.push(`/dashboard?tab=planner&planId=${journeyId}`)} 
        />
      </main>

      <Footer />
    </div>
  );
}
