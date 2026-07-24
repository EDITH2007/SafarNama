"use client";

import { useState } from "react";
import { Star, BookOpen, MessageSquare, Route, ChevronRight, ShieldCheck, CheckCircle } from "lucide-react";
import { useUser } from "./UserContext";
import Leaderboard from "./Leaderboard";
import Link from "next/link";
import ExplorerBadge from "./badges/ExplorerBadge";

interface RetentionZoneProps {
  onViewPlan?: (journeyId: string) => void;
  isLandingPage?: boolean;
}

export default function RetentionZone({ onViewPlan, isLandingPage = false }: RetentionZoneProps) {
  const [activeStoryTab, setActiveStoryTab] = useState<"Journeys" | "Reviews" | "Blogs">("Journeys");
  const [selectedReadBlog, setSelectedReadBlog] = useState<any | null>(null);
  const { journeys, reviews, blogs } = useUser();

  // Filter out flagged reviews and blogs from public view
  const visibleReviews = reviews.filter((r) => !r.flagged);
  const visibleBlogs = blogs.filter((b) => !b.flagged);

  const displayJourneys = isLandingPage ? journeys.slice(0, 2) : journeys;
  const displayReviews = isLandingPage ? visibleReviews.slice(0, 2) : visibleReviews;
  const displayBlogs = isLandingPage ? visibleBlogs.slice(0, 2) : visibleBlogs;

  const storyTabs = [
    { id: "Journeys", name: "Journeys", icon: Route },
    { id: "Reviews", name: "Reviews", icon: MessageSquare },
    { id: "Blogs", name: "Blogs", icon: BookOpen },
  ] as const;

  // Helper to color tier label
  const getTierColorClass = (tier: "Bronze" | "Silver" | "Gold" | "Platinum") => {
    switch (tier) {
      case "Platinum":
        return "text-sky-600";
      case "Gold":
        return "text-[#d69e2e]";
      case "Silver":
        return "text-slate-500 border-slate-200";
      case "Bronze":
      default:
        return "text-[#8c5230]";
    }
  };

  const renderStoriesContent = () => {
    switch (activeStoryTab) {
      case "Journeys":
        return (
          <div className="space-y-6">
            {displayJourneys.map((j) => (
              <div
                key={j.id}
                className="bg-white border border-earth-clay/10 p-6 flex flex-col justify-between hover:border-earth-terracotta/30 transition-all duration-300 relative"
              >
                {j.completed && (
                  <span className="absolute top-4 right-4 bg-earth-forest/15 text-earth-forest border border-earth-forest/20 px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest flex items-center space-x-1">
                    <CheckCircle className="h-2.5 w-2.5 fill-current" />
                    <span>Completed (+50 pts)</span>
                  </span>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider ${
                      j.type === "AI-Generated" 
                        ? "bg-earth-saffron/15 text-earth-clay" 
                        : "bg-earth-terracotta/15 text-earth-terracotta"
                    }`}>
                      {j.type}
                    </span>
                    <span className="font-sans text-xs text-earth-clay/70 font-medium">
                      {j.duration}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-earth-charcoal">
                    {j.title}
                  </h4>
                  <p className="font-sans text-xs text-earth-charcoal/70 font-light leading-relaxed">
                    {j.description}
                  </p>

                  {/* Route Steps Visual */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {j.stops.map((stop, idx) => (
                      <div key={stop} className="flex items-center text-[10px] font-sans text-earth-charcoal/80 font-medium bg-earth-sand px-2 py-1 border border-earth-clay/5">
                        <span>{stop}</span>
                        {idx < j.stops.length - 1 && (
                          <ChevronRight className="h-3 w-3 text-earth-clay/40 ml-1.5 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-earth-clay/5 flex items-center justify-between text-xs text-earth-clay">
                  <span>Curated by {j.author}</span>
                  <button 
                    onClick={() => onViewPlan && onViewPlan(j.id)}
                    className="text-earth-terracotta font-semibold hover:underline flex items-center space-x-0.5 cursor-pointer bg-transparent border-0"
                  >
                    <span>View Plan</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case "Reviews":
        return (
          <div className="space-y-6">
            {displayReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-earth-clay/10 p-6 space-y-4 hover:border-earth-terracotta/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-earth-saffron">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < r.rating ? "fill-current" : "text-earth-clay/20"
                          }`}
                        />
                      ))}
                    </div>
                    <h4 className="font-serif text-base font-bold text-earth-charcoal">
                      {r.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-sans text-earth-clay/60">
                    {r.date}
                  </span>
                </div>

                <p className="font-sans text-xs text-earth-charcoal/80 font-light leading-relaxed">
                  "{r.text}"
                </p>

                <div className="pt-4 border-t border-earth-clay/5 flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center space-x-1.5 text-earth-clay">
                    <span className="font-bold text-earth-charcoal flex items-center space-x-1">
                      <span>{r.author}</span>
                      {r.authorVerified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-50 shrink-0" />
                      )}
                    </span>
                    <span>•</span>
                    <ExplorerBadge tier={r.authorTier} size={18} showTooltip />
                    <span className={`uppercase text-[9px] font-bold ${getTierColorClass(r.authorTier)}`}>
                      {r.authorTier} Explorer
                    </span>
                  </div>
                  <span className="text-earth-clay/80 font-medium bg-earth-sand px-2 py-0.5 border border-earth-clay/5 text-[10px]">
                    {r.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case "Blogs":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayBlogs.map((b) => (
              <article
                key={b.id}
                className="group flex flex-col bg-white border border-earth-clay/10 hover:border-earth-terracotta/30 transition-all duration-300"
              >
                <div
                  onClick={() => setSelectedReadBlog(b)}
                  className="aspect-[16/10] overflow-hidden bg-stone-100 relative cursor-pointer"
                >
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute bottom-4 left-4 bg-earth-sand/90 text-earth-charcoal px-2.5 py-0.5 font-sans text-[10px] font-medium border border-earth-clay/15">
                    {b.date}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4
                      onClick={() => setSelectedReadBlog(b)}
                      className="font-serif text-base font-bold text-earth-charcoal line-clamp-2 group-hover:text-earth-terracotta transition-colors cursor-pointer"
                    >
                      {b.title}
                    </h4>
                    <p className="font-sans text-xs text-earth-charcoal/70 line-clamp-3 leading-relaxed font-light">
                      {b.content}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-earth-clay/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ExplorerBadge tier={b.authorTier} size={24} showTooltip />
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1">
                          <span className="font-sans text-[11px] font-semibold text-earth-charcoal/90">
                            {b.author}
                          </span>
                          {b.authorVerified && (
                            <ShieldCheck className="h-3 w-3 text-blue-500 fill-blue-50 shrink-0" />
                          )}
                        </div>
                        <span className={`text-[8px] font-sans font-bold uppercase tracking-wider ${getTierColorClass(b.authorTier)}`}>
                          {b.authorTier} Explorer
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReadBlog(b)}
                      className="font-sans text-xs font-semibold text-earth-terracotta uppercase tracking-wider flex items-center space-x-0.5 cursor-pointer bg-transparent border-0"
                    >
                      <span>Read Story</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        );
    }
  };

  return (
    <section id="stories" className="bg-earth-sand py-24 border-t border-earth-clay/10 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLandingPage ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-3">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-terracotta">
                  Logbook & Chronicles
                </span>
                <h2 className="font-serif text-4xl font-bold tracking-tight text-earth-forest">
                  Traveler Stories
                </h2>
                <p className="font-sans text-sm text-earth-charcoal/70 font-light leading-relaxed max-w-xl">
                  Browse detailed routes, local assessments, and personal travelogues shared by our explorer community.
                </p>
              </div>

              <div className="flex border-b border-earth-clay/10 pb-2">
                {storyTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeStoryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveStoryTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[10px] transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "border-earth-terracotta text-earth-terracotta"
                          : "border-transparent text-earth-charcoal/60 hover:text-earth-charcoal"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">{renderStoriesContent()}</div>

              <div className="pt-4 text-center">
                <Link
                  href="/traveler-stories"
                  className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-earth-terracotta hover:text-earth-forest uppercase tracking-widest transition-colors duration-200 cursor-pointer"
                >
                  <span>View All Traveler Stories</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div id="leaderboard" className="space-y-8 lg:sticky lg:top-28 scroll-mt-28">
              <div className="space-y-3">
                <span className="font-sans text-xs font-semibold uppercase tracking-widest text-earth-terracotta">
                  Honors & Standings
                </span>
                <h2 className="font-serif text-4xl font-bold tracking-tight text-earth-forest">
                  Explorer Ranks
                </h2>
                <p className="font-sans text-sm text-earth-charcoal/70 font-light leading-relaxed">
                  Celebrating members of the community who submit and verify hidden gems across India.
                </p>
              </div>

              <Leaderboard isLandingPage={true} />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex border-b border-earth-clay/10 pb-2">
              {storyTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeStoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStoryTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[10px] transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-earth-terracotta text-earth-terracotta"
                        : "border-transparent text-earth-charcoal/60 hover:text-earth-charcoal"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">{renderStoriesContent()}</div>
          </div>
        )}
      </div>

      {selectedReadBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white border border-earth-clay/20 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col rounded-none relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setSelectedReadBlog(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-earth-charcoal px-3 py-1.5 border border-earth-clay/10 transition-colors shadow-sm cursor-pointer font-bold text-xs uppercase"
              aria-label="Close reader"
            >
              ✕ Close
            </button>

            <div className="h-48 sm:h-64 w-full overflow-hidden bg-stone-100 relative shrink-0">
              <img
                src={selectedReadBlog.coverImage}
                alt={selectedReadBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex items-end p-6">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  {selectedReadBlog.title}
                </h3>
              </div>
            </div>

            <div className="px-6 py-4 bg-earth-sand/30 border-b border-earth-clay/10 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <ExplorerBadge tier={selectedReadBlog.authorTier} size={32} showTooltip />
                <div>
                  <div className="font-bold text-earth-charcoal flex items-center space-x-1">
                    <span>{selectedReadBlog.author}</span>
                    {selectedReadBlog.authorVerified && (
                      <span className="text-blue-500 text-[10px]" title="Verified Explorer">✓</span>
                    )}
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-earth-clay/70">
                    {selectedReadBlog.authorTier} Explorer
                  </span>
                </div>
              </div>
              
              <span className="text-[10px] text-earth-clay font-medium uppercase tracking-widest font-sans">
                {selectedReadBlog.date}
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 font-sans text-sm text-earth-charcoal/90 leading-relaxed font-light whitespace-pre-line space-y-4">
              {selectedReadBlog.content}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
