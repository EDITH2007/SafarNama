"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Compass, User, ShieldCheck } from "lucide-react";
import { useUser } from "./UserContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser } = useUser();

  const isDashboard = pathname === "/dashboard";

  const navItems = [
    { name: "Destinations", href: isDashboard ? "/#destinations" : "#destinations" },
    { name: "Hidden Gems", href: isDashboard ? "/#hidden-gems" : "#hidden-gems" },
    { name: "Traveler Stories", href: isDashboard ? "/#stories" : "#stories" },
    { name: "Leaderboard", href: isDashboard ? "/#leaderboard" : "#leaderboard" },
  ];

  // Helper to render mini tier badge
  const renderMiniTierBadge = (tier: "Bronze" | "Silver" | "Gold") => {
    switch (tier) {
      case "Gold":
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-[#f3d082] bg-[#fdf6e2] text-[#d69e2e] shadow-sm scale-90 origin-left">
            Gold
          </span>
        );
      case "Silver":
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-[#ccd2d8] bg-[#f0f2f5] text-[#5c6873] shadow-sm scale-90 origin-left">
            Silver
          </span>
        );
      case "Bronze":
      default:
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider border border-[#d8c3b7] bg-[#fbf5f0] text-[#8c5230] shadow-sm scale-90 origin-left">
            Bronze
          </span>
        );
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-earth-sand/90 backdrop-blur-md border-b border-earth-clay/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Compass className="h-6 w-6 text-earth-terracotta" />
              <span className="font-serif text-2xl tracking-widest font-bold text-earth-forest uppercase">
                SafarNama
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-sans text-sm font-medium text-earth-charcoal/80 hover:text-earth-terracotta tracking-wider transition-colors duration-200 uppercase"
              >
                {item.name}
              </a>
            ))}
            <div className="h-4 w-[1px] bg-earth-clay/20" />
            
            {/* User status card / Toggle Dashboard */}
            <Link
              href={isDashboard ? "/" : "/dashboard"}
              className="flex items-center space-x-3 p-1.5 px-3 border border-earth-clay/25 bg-white hover:border-earth-terracotta/40 hover:bg-earth-sand/20 transition-all duration-200 group"
            >
              {/* Avatar Circle */}
              <div className="h-7 w-7 rounded-full bg-earth-terracotta/15 flex items-center justify-center font-bold text-[10px] text-earth-terracotta font-sans border border-earth-terracotta/25 group-hover:bg-earth-terracotta group-hover:text-white transition-all duration-200">
                {currentUser.avatar}
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-sans text-[11px] font-bold text-earth-charcoal group-hover:text-earth-terracotta transition-colors">
                    {currentUser.name}
                  </span>
                  {currentUser.isVerified && (
                    <ShieldCheck className="h-3 w-3 text-blue-500 fill-blue-50 shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-1.5 leading-none">
                  {renderMiniTierBadge(currentUser.tier)}
                  <span className="text-[10px] text-earth-terracotta font-bold">
                    {currentUser.points} PTS
                  </span>
                </div>
              </div>
            </Link>

            {/* Dashboard Navigation Action */}
            <Link
              href={isDashboard ? "/" : "/dashboard"}
              className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-none"
            >
              {isDashboard ? "View Site" : "Dashboard"}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-earth-charcoal hover:text-earth-terracotta p-2 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-earth-clay/10 bg-earth-sand/98 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-3 rounded-none font-sans text-sm font-medium text-earth-charcoal hover:bg-earth-clay/5 hover:text-earth-terracotta tracking-wider uppercase"
              >
                {item.name}
              </a>
            ))}
            <div className="px-3 pt-4 border-t border-earth-clay/10 space-y-3">
              {/* User profile details in mobile menu */}
              <div className="flex items-center space-x-3 p-2 bg-white border border-earth-clay/10">
                <div className="h-8 w-8 rounded-full bg-earth-terracotta/15 flex items-center justify-center font-bold text-xs text-earth-terracotta font-sans">
                  {currentUser.avatar}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="font-sans text-xs font-bold text-earth-charcoal">{currentUser.name}</span>
                    {currentUser.isVerified && (
                      <ShieldCheck className="h-3 w-3 text-blue-500 fill-blue-50 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {renderMiniTierBadge(currentUser.tier)}
                    <span className="text-[10px] text-earth-terracotta font-bold">{currentUser.points} PTS</span>
                  </div>
                </div>
              </div>
              <Link
                href={isDashboard ? "/" : "/dashboard"}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full px-5 py-3 rounded-none bg-earth-forest text-white font-sans text-xs font-semibold uppercase tracking-widest hover:bg-earth-terracotta transition-all duration-200"
              >
                {isDashboard ? "Return to Site" : "Go to Dashboard"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
