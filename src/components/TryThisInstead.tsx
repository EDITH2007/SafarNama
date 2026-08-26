"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, MapPin, Compass } from "lucide-react";
import { HiddenGem } from "@/app/data/mockData";
import CrowdBadge from "@/components/badges/CrowdBadge";
import { calculateHaversineDistance, formatDistance } from "@/utils/geo";

export const INITIAL_RADIUS_KM = 150;
export const FALLBACK_RADIUS_KM = 300;

interface TryThisInsteadProps {
  currentDestinationName: string;
  currentDestinationGeo?: { lat: number; lng: number };
  category?: string;
  state?: string;
  hiddenGems: HiddenGem[];
  className?: string;
}

export default function TryThisInstead({
  currentDestinationName,
  currentDestinationGeo,
  category,
  state,
  hiddenGems,
  className = "",
}: TryThisInsteadProps) {
  const destLat = currentDestinationGeo?.lat;
  const destLng = currentDestinationGeo?.lng;
  const hasValidGeo = typeof destLat === "number" && typeof destLng === "number";

  // Filter low or moderate crowd hidden gems
  const lowCrowdGems = hiddenGems.filter((gem) => {
    const isLowOrMod =
      !gem.crowdData ||
      gem.crowdData.crowdLevel === "low" ||
      gem.crowdData.crowdLevel === "moderate";
    return isLowOrMod;
  });

  // Calculate distance for gems with valid coordinates
  const gemsWithDistance = lowCrowdGems
    .map((gem) => {
      const gemLat = gem.geo?.lat;
      const gemLng = gem.geo?.lng;
      const dist =
        hasValidGeo && typeof gemLat === "number" && typeof gemLng === "number"
          ? calculateHaversineDistance(destLat!, destLng!, gemLat, gemLng)
          : Infinity;
      return { gem, distanceKm: dist };
    })
    .filter((item) => isFinite(item.distanceKm));

  // 1. Primary search: within 150 km
  let nearbyItems = gemsWithDistance.filter((item) => item.distanceKm <= INITIAL_RADIUS_KM);
  let searchRadiusUsed = INITIAL_RADIUS_KM;

  // 2. Fallback search: widen to 300 km if no gems found in 150 km
  if (nearbyItems.length === 0) {
    nearbyItems = gemsWithDistance.filter((item) => item.distanceKm <= FALLBACK_RADIUS_KM);
    searchRadiusUsed = FALLBACK_RADIUS_KM;
  }

  // Sort by closest distance first
  nearbyItems.sort((a, b) => a.distanceKm - b.distanceKm);

  // Pick top 2 alternatives
  const recommendedItems = nearbyItems.slice(0, 2);

  return (
    <div
      className={`bg-gradient-to-br from-earth-forest via-[#1b3823] to-[#0f2416] text-earth-sand p-6 md:p-8 shadow-2xl border-2 border-earth-saffron/30 space-y-6 relative overflow-hidden ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-earth-saffron/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-sand/15 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-earth-saffron/20 border border-earth-saffron/40 text-earth-saffron font-sans text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            Signature SafarNama Feature
          </div>
          <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
            Escape the Crowds: Try This Instead
          </h3>
          <p className="font-sans text-xs text-earth-sand/75 font-light leading-relaxed">
            <span className="font-semibold text-earth-saffron">{currentDestinationName}</span> experiences high visitor congestion right now. Skip the tourist trap and explore these pristine, low-crowd community alternatives:
          </p>
        </div>
      </div>

      {/* Alternative Hidden Gems Grid or Empty State */}
      {recommendedItems.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-earth-sand/20 p-8 text-center space-y-4 backdrop-blur-sm">
          <Compass className="h-10 w-10 text-earth-saffron/60 animate-pulse mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <h4 className="font-serif text-lg font-bold text-white">
              No nearby low-crowd alternatives yet
            </h4>
            <p className="font-sans text-xs text-earth-sand/70 font-light leading-relaxed">
              We couldn&apos;t find any community-verified hidden gems within {FALLBACK_RADIUS_KM} km of{" "}
              <span className="font-semibold text-earth-saffron">{currentDestinationName}</span>.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/hidden-gems/submit"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-earth-saffron hover:bg-earth-saffron/90 text-earth-forest font-sans text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span>Submit a Hidden Gem (+100 PTS)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendedItems.map(({ gem, distanceKm }) => (
            <div
              key={gem.id}
              className="group bg-white/10 hover:bg-white/15 border border-earth-sand/15 hover:border-earth-saffron/50 p-4 transition-all duration-300 flex flex-col justify-between space-y-4 backdrop-blur-sm"
            >
              <div className="space-y-3">
                <div className="relative aspect-[16/9] overflow-hidden bg-stone-900 border border-earth-sand/10">
                  <img
                    src={gem.photo}
                    alt={gem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <CrowdBadge
                      crowdLevel={gem.crowdData?.crowdLevel || "low"}
                      variant="pill"
                      showNoteTooltip={false}
                    />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-earth-sand px-2.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider border border-white/10">
                    Verified Gem
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-sans font-medium text-earth-saffron">
                    <div className="flex items-center space-x-1 truncate max-w-[60%]">
                      <MapPin className="h-3 w-3 shrink-0 text-earth-terracotta" />
                      <span className="truncate">{gem.location}</span>
                    </div>
                    {isFinite(distanceKm) && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-earth-saffron/20 text-earth-saffron border border-earth-saffron/30 font-bold text-[10px] uppercase tracking-wider shrink-0">
                        <Compass className="h-3 w-3" />
                        <span>{formatDistance(distanceKm)} away</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-lg font-bold text-white group-hover:text-earth-saffron transition-colors">
                    {gem.title}
                  </h4>
                  <p className="font-sans text-xs text-earth-sand/80 line-clamp-2 leading-relaxed font-light">
                    {gem.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-earth-sand/10 flex items-center justify-between">
                <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-earth-sand/60">
                  {gem.category}
                </span>
                <Link
                  href={`/hidden-gems/${gem.id}`}
                  className="font-sans text-xs font-bold text-earth-saffron group-hover:translate-x-1 transition-transform duration-200 uppercase tracking-wider flex items-center space-x-1"
                >
                  <span>Explore Gem</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

