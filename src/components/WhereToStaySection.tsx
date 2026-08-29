"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Hotel, Star, Users, MapPin, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { useUser } from "@/components/UserContext";
import { useCurrency } from "@/components/CurrencyContext";

interface WhereToStayProps {
  destinationId: string;
  destinationName: string;
  location?: string;
}

export default function WhereToStaySection({
  destinationId,
  destinationName,
  location,
}: WhereToStayProps) {
  const { stays } = useUser();
  const { formatPrice } = useCurrency();

  // Filter stays matching destinationId or matching location substring
  const destinationStays = stays.filter((stay) => {
    if (stay.destinationId === destinationId) return true;
    if (location && stay.description.toLowerCase().includes(location.toLowerCase())) return true;
    if (stay.name.toLowerCase().includes(destinationName.toLowerCase())) return true;
    return false;
  });

  // Fallback: if no specific stay matched this destinationId, show 2-3 popular stays so the section is rich
  const displayStays = destinationStays.length > 0 ? destinationStays : stays.slice(0, 3);

  return (
    <section className="mt-12 pt-10 border-t border-earth-clay/15 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-earth-terracotta/10 text-earth-terracotta text-xs font-bold uppercase tracking-widest rounded-full mb-2">
            <Hotel className="w-3.5 h-3.5" />
            <span>Destination-Native Lodging</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-earth-forest">
            Where to Stay in {destinationName}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-earth-charcoal/70 font-light mt-1 max-w-2xl">
            Authentic homestays, eco-resorts, and boutique cottages selected specifically for visitors exploring {destinationName}.
          </p>
        </div>

        <Link
          href={`/stays?destinationId=${destinationId}`}
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-earth-terracotta hover:text-earth-forest transition-colors self-start sm:self-auto group"
        >
          <span>View All Stays</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {displayStays.map((stay, idx) => (
          <motion.div
            key={stay.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-white border border-earth-clay/15 hover:border-earth-terracotta/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image & Type Badge */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={stay.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                  alt={stay.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20">
                  {stay.type}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-earth-forest text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{stay.rating}</span>
                  <span className="text-stone-400 text-[10px]">({stay.reviewCount})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <h3 className="font-serif text-lg font-bold text-earth-charcoal group-hover:text-earth-terracotta transition-colors line-clamp-1">
                  {stay.name}
                </h3>
                <p className="font-sans text-xs text-earth-charcoal/70 line-clamp-2 leading-relaxed font-light">
                  {stay.description}
                </p>

                {/* Host Info */}
                <div className="flex items-center justify-between pt-2 border-t border-earth-clay/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-earth-sand border border-earth-clay/20 flex items-center justify-center font-serif text-[10px] font-bold text-earth-forest">
                      {stay.hostName.charAt(0)}
                    </div>
                    <span className="text-earth-charcoal/80 font-medium text-[11px] truncate max-w-[110px]">
                      {stay.hostName}
                    </span>
                  </div>

                  {stay.hostVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200" title="SafarNama Verified Host">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified Host
                    </span>
                  )}
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {stay.amenities.slice(0, 3).map((amenity, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium bg-earth-sand/50 text-earth-charcoal/80 px-2 py-0.5 rounded border border-earth-clay/10"
                    >
                      {amenity}
                    </span>
                  ))}
                  {stay.amenities.length > 3 && (
                    <span className="text-[9px] font-medium text-earth-clay/70 px-1 py-0.5">
                      +{stay.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Action */}
            <div className="p-5 pt-0 flex items-center justify-between border-t border-earth-clay/10 mt-3 pt-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-clay block">Starting from</span>
                <span className="font-serif text-lg font-bold text-earth-forest font-mono">
                  {formatPrice(stay.pricePerNightINR)}
                  <span className="text-xs font-sans font-normal text-earth-clay/80"> / night</span>
                </span>
              </div>

              <Link
                href={`/stays/${stay.id}`}
                className="px-3.5 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Book Stay
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
