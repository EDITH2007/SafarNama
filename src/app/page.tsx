"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AcquisitionZone from "@/components/AcquisitionZone";
import RetentionZone from "@/components/RetentionZone";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(hashId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />
      <main className="flex-grow">
        <Hero onSearch={setSearchQuery} />
        <AcquisitionZone searchQuery={searchQuery} />
        <RetentionZone 
          isLandingPage={true}
          onViewPlan={(journeyId) => router.push(`/dashboard?tab=planner&planId=${journeyId}`)} 
        />
      </main>
      <Footer />
    </div>
  );
}

