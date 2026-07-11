"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AcquisitionZone from "@/components/AcquisitionZone";
import RetentionZone from "@/components/RetentionZone";
import Footer from "@/components/Footer";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />
      <main className="flex-grow">
        <Hero onSearch={setSearchQuery} />
        <AcquisitionZone searchQuery={searchQuery} />
        <RetentionZone />
      </main>
      <Footer />
    </div>
  );
}
