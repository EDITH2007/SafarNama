"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin } from "lucide-react";

// Dynamically import ThreeParticles with SSR disabled to prevent hydration issues
const ThreeParticles = dynamic(() => import("./ThreeParticles"), { ssr: false });

interface HeroProps {
  onSearch: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 px-4">
      {/* 3D background */}
      <ThreeParticles />

      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 select-none">
        <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-saffron bg-earth-sand/10 px-4 py-1.5 border border-earth-saffron/20 inline-block">
          India's Premier Discovery Network
        </span>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-earth-sand leading-tight">
          Discover the Unseen <br />
          <span className="text-earth-saffron">Subcontinent</span>
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-earth-sand/80 max-w-2xl mx-auto font-light leading-relaxed">
          A community-driven chronicle of hidden gems, regional cultures, and authentic itineraries curated by local explorers.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-0.5 bg-earth-sand shadow-2xl p-1.5 border border-earth-clay/10 transition-all duration-300"
        >
          <div className="flex-1 flex items-center px-4 py-3 space-x-2 text-earth-charcoal">
            <Search className="h-5 w-5 text-earth-clay/60 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations (e.g. Munnar, Hampi, Ladakh)..."
              className="bg-transparent text-sm w-full font-sans focus:outline-none placeholder-earth-clay/50"
            />
          </div>
          <div className="h-full w-[1px] bg-earth-clay/10 hidden sm:block self-center mx-2" />
          <button
            type="submit"
            className="px-8 py-3.5 bg-earth-terracotta hover:bg-earth-forest text-earth-sand font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none shrink-0"
          >
            Explore
          </button>
        </form>

        {/* Short suggestion pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-earth-sand/70 text-xs font-sans tracking-wide">
          <span className="flex items-center space-x-1"><MapPin className="h-3 w-3 text-earth-saffron" /> <span>Trending:</span></span>
          {["Hampi Cliffs", "Zanskar Cave", "Munnar Tea Hills", "Gandikota Gorge"].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                onSearch(tag);
              }}
              className="px-3 py-1 bg-white/5 border border-white/10 hover:border-earth-saffron hover:text-earth-saffron transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Shadow overlay at bottom to transition smoothly to light sand background */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-earth-sand to-transparent pointer-events-none" />
    </section>
  );
}
