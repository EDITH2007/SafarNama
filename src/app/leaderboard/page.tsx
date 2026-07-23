"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import { Award } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />
      
      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-earth-forest text-earth-sand py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 z-0" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-full mb-2">
              <Award className="h-6 w-6 text-earth-saffron" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-white">
              Explorer Leader Board
            </h1>
            <p className="font-sans text-sm md:text-base text-earth-sand/80 max-w-2xl mx-auto font-light leading-relaxed">
              Honoring members of the SafarNama community who submit, verify, and document the hidden gems of the Indian subcontinent.
            </p>
          </div>
        </section>

        {/* Leaderboard content */}
        <section className="py-12 md:py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <Leaderboard isLandingPage={false} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
