"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Hotel,
  Star,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Info,
  Gift,
  Wifi,
  Coffee,
  Car,
  Tv,
  Utensils,
  Sparkles,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";
import { useCurrency } from "@/components/CurrencyContext";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StayDetailPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const router = useRouter();

  const { stays, bookStay, destinations, hiddenGems, currentUser } = useUser();
  const { formatPrice } = useCurrency();

  // Find target stay
  const stay = useMemo(() => {
    return stays.find((s) => String(s.id) === String(rawId));
  }, [stays, rawId]);

  // Find linked destination/gem title
  const linkedPlace = useMemo(() => {
    if (!stay) return null;
    const dest = destinations.find((d) => String(d.id || (d as any)._id) === String(stay.destinationId));
    if (dest) return { id: dest.id || (dest as any)._id, title: dest.title, type: "destination" };
    const gem = hiddenGems.find((g) => String(g.id || (g as any)._id) === String(stay.destinationId));
    if (gem) return { id: gem.id || (gem as any)._id, title: gem.title, type: "hidden-gem" };
    return null;
  }, [stay, destinations, hiddenGems]);

  // Active gallery index
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Booking form state
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultCheckout = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(defaultCheckout);
  const [guests, setGuests] = useState(2);

  // Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calculate nights & total price
  const nights = useMemo(() => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  }, [checkIn, checkOut]);

  const totalPriceINR = useMemo(() => {
    if (!stay) return 0;
    return stay.pricePerNightINR * nights;
  }, [stay, nights]);

  // Handle booking submission
  const handleConfirmBooking = async () => {
    if (!stay) return;
    setIsSubmittingBooking(true);
    try {
      await bookStay({
        stayId: stay.id,
        checkIn,
        checkOut,
        guests,
        totalPriceINR,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setIsConfirmModalOpen(false);
        router.push("/dashboard?tab=trips&sub=stays");
      }, 1200);
    } catch (err) {
      console.error("Booking error:", err);
      setIsSubmittingBooking(false);
    }
  };

  if (!stay) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-white border border-earth-clay/15 shadow-md">
            <Hotel className="w-12 h-12 text-earth-terracotta mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-earth-forest">Stay Not Found</h2>
            <p className="font-sans text-xs text-earth-charcoal/70">
              The lodging guide you are looking for does not exist or has been updated.
            </p>
            <Link
              href="/stays"
              className="inline-block px-5 py-2.5 bg-earth-forest text-white text-xs font-bold uppercase tracking-wider"
            >
              Browse Stays
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-clay/15 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-earth-clay font-medium">
                <Link href="/stays" className="hover:text-earth-terracotta transition-colors">
                  Stays
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                {linkedPlace && (
                  <>
                    <Link
                      href={linkedPlace.type === "destination" ? `/destinations/${linkedPlace.id}` : `/hidden-gems/${linkedPlace.id}`}
                      className="hover:text-earth-terracotta transition-colors"
                    >
                      {linkedPlace.title}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
                <span className="text-earth-forest font-bold">{stay.name}</span>
              </div>

              <div className="flex items-center space-x-3">
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-earth-forest">
                  {stay.name}
                </h1>
                <span className="bg-earth-terracotta/10 text-earth-terracotta border border-earth-terracotta/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0">
                  {stay.type}
                </span>
              </div>
            </div>

            <Link
              href="/stays"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-earth-clay/20 bg-white text-earth-forest hover:border-earth-terracotta text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Stays</span>
            </Link>
          </div>

          {/* Photo Gallery Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Featured Photo */}
              <div className="lg:col-span-2 aspect-[16/10] overflow-hidden bg-stone-100 border border-earth-clay/15 relative group">
                <img
                  src={stay.images[activePhotoIdx] || stay.images[0]}
                  alt={stay.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Photo Thumbnails */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible">
                {stay.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`relative aspect-[16/10] flex-1 min-w-[120px] overflow-hidden border-2 transition-all cursor-pointer ${
                      activePhotoIdx === i
                        ? "border-earth-terracotta shadow-md scale-[1.02]"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details & Booking Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Details Column */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Overview Card */}
              <div className="bg-white border border-earth-clay/15 p-6 md:p-8 space-y-6 shadow-sm">
                
                <div className="flex items-center justify-between border-b border-earth-clay/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-earth-forest font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{stay.rating}</span>
                      <span className="text-earth-clay font-normal text-xs">({stay.reviewCount} traveler reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-earth-clay font-medium">
                    <Users className="w-4 h-4 text-earth-terracotta" />
                    <span>Up to {stay.maxGuests} Guests</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-earth-forest">
                    About this Lodging
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-earth-charcoal/80 leading-relaxed font-light">
                    {stay.description}
                  </p>
                </div>

                {/* Host Info Section */}
                <div className="bg-earth-sand/30 border border-earth-clay/15 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-earth-forest text-white font-serif font-bold text-base flex items-center justify-center shadow-sm">
                        {stay.hostName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-base font-bold text-earth-forest">
                            Hosted by {stay.hostName}
                          </span>
                        </div>
                        <span className="text-[11px] text-earth-clay font-sans">
                          SafarNama Trusted Local Partner
                        </span>
                      </div>
                    </div>

                    {stay.hostVerified && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-850 px-3 py-1 rounded-full border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Verified Host
                      </span>
                    )}
                  </div>
                </div>

                {/* Amenities List */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif text-base font-bold text-earth-forest">
                    Amenities & Included Services
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {stay.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 p-2.5 bg-earth-sand/20 border border-earth-clay/10 text-xs font-medium text-earth-charcoal"
                      >
                        <Check className="w-4 h-4 text-earth-terracotta shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Booking Card Column */}
            <div className="lg:col-span-5 sticky top-28">
              <div className="bg-white border border-earth-clay/20 p-6 md:p-8 space-y-6 shadow-xl">
                
                {/* Price Display */}
                <div className="flex items-baseline justify-between border-b border-earth-clay/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-earth-clay tracking-wider block">
                      Nightly Rate
                    </span>
                    <span className="font-serif text-2xl font-bold text-earth-forest font-mono">
                      {formatPrice(stay.pricePerNightINR)}
                      <span className="text-xs font-sans font-normal text-earth-clay"> / night</span>
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-1 border border-amber-200">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>+500 Explorer PTS</span>
                  </div>
                </div>

                {/* Date & Guest Selectors Form */}
                <div className="space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-earth-charcoal tracking-wider">
                        Check-In Date
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        min={todayStr}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs font-medium focus:outline-none focus:border-earth-terracotta"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-earth-charcoal tracking-wider">
                        Check-Out Date
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs font-medium focus:outline-none focus:border-earth-terracotta"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-earth-charcoal tracking-wider">
                      Number of Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs font-medium focus:outline-none focus:border-earth-terracotta cursor-pointer"
                    >
                      {[...Array(stay.maxGuests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? "Guest" : "Guests"} (Max {stay.maxGuests})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div className="bg-earth-sand/20 border border-earth-clay/10 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-earth-charcoal/80">
                      <span>{formatPrice(stay.pricePerNightINR)} × {nights} {nights === 1 ? "night" : "nights"}</span>
                      <span className="font-mono font-medium">{formatPrice(totalPriceINR)}</span>
                    </div>
                    <div className="flex justify-between text-earth-charcoal/80">
                      <span>Taxes & Service Fees</span>
                      <span className="font-mono font-medium text-emerald-700">Included</span>
                    </div>
                    <div className="border-t border-earth-clay/15 pt-2 flex justify-between font-bold text-earth-forest text-sm">
                      <span>Total Estimated Cost</span>
                      <span className="font-mono text-earth-terracotta text-base">{formatPrice(totalPriceINR)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="w-full py-3.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Hotel className="w-4 h-4" />
                    <span>Proceed to Confirm Booking</span>
                  </button>

                  <p className="text-[10px] text-earth-clay/70 text-center font-light">
                    Cancellation policy: Free cancellation up to 48 hours prior to check-in.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-earth-clay/20 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
            
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute top-4 right-4 text-earth-clay hover:text-earth-terracotta font-bold text-sm cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 text-center border-b border-earth-clay/10 pb-4">
              <div className="w-12 h-12 bg-earth-terracotta/10 text-earth-terracotta rounded-full flex items-center justify-center mx-auto mb-2">
                <Hotel className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-earth-forest">
                Confirm Stay Booking
              </h3>
              <p className="text-xs text-earth-charcoal/70 font-light">
                {stay.name}
              </p>
            </div>

            {/* DEMO BOOKING NOTE DISCLAIMER */}
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded space-y-1 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950">Demo booking — no real payment</strong>
                <span className="font-light leading-relaxed">
                  This booking will write directly to your SafarNama records and award 500 Explorer Points without requesting credit card or real payment information.
                </span>
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 space-y-2.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-earth-clay font-medium">Check-In:</span>
                <span className="font-bold text-earth-forest">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-clay font-medium">Check-Out:</span>
                <span className="font-bold text-earth-forest">{checkOut} ({nights} {nights === 1 ? "night" : "nights"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-clay font-medium">Guests:</span>
                <span className="font-bold text-earth-forest">{guests} {guests === 1 ? "Guest" : "Guests"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-clay font-medium">Host:</span>
                <span className="font-bold text-earth-forest">{stay.hostName}</span>
              </div>
              <div className="border-t border-earth-clay/15 pt-2 flex justify-between text-sm font-bold">
                <span>Total Amount:</span>
                <span className="font-mono text-earth-terracotta">{formatPrice(totalPriceINR)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2.5 border border-earth-clay/20 text-xs font-bold uppercase tracking-wider hover:bg-earth-sand/20 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingBooking}
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-2 shadow-sm"
              >
                {bookingSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Booking Confirmed!</span>
                  </>
                ) : isSubmittingBooking ? (
                  <span>Processing...</span>
                ) : (
                  <span>Confirm & Book Stay</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
