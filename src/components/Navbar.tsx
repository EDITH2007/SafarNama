"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Compass, User, ShieldCheck, Bell } from "lucide-react";
import { useUser } from "./UserContext";
import ExplorerBadge from "./badges/ExplorerBadge";

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function NotificationBell() {
  const { notifications, markNotificationsAsRead } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative h-[46px] w-[46px] flex items-center justify-center bg-white border border-earth-clay/20 shadow-sm hover:bg-earth-sand/20 text-earth-charcoal/80 hover:text-earth-terracotta transition-all duration-200 focus:outline-none cursor-pointer rounded-none"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center bg-earth-terracotta text-[9px] font-bold text-white rounded-full leading-none shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-earth-clay/15 shadow-2xl z-50 py-1 origin-top-right transform scale-100 transition-all rounded-none">
          <div className="px-4 py-2.5 border-b border-earth-clay/10 flex justify-between items-center bg-earth-sand/35">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-earth-forest">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[9px] bg-earth-terracotta/10 text-earth-terracotta px-1.5 py-0.5 font-bold uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-earth-clay/5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 transition-colors hover:bg-earth-sand/20 ${
                    !notif.read ? "bg-earth-sand/10 font-medium" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!notif.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-earth-terracotta animate-pulse" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-earth-charcoal/90 leading-normal font-sans">
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-earth-clay/60 font-light font-sans">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-earth-clay/50 text-xs font-sans font-light">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isLoading, logout, leaderboard } = useUser();

  const userInLeaderboard = leaderboard?.find(
    (u) => u.isCurrentUser || u.name === currentUser?.name
  );
  const currentUserRank = userInLeaderboard?.rank || "-";

  const isHome = pathname === "/";

  const navItems = [
    { name: "Destinations", href: isHome ? "#destinations" : "/destinations" },
    { name: "Hidden Gems", href: isHome ? "#hidden-gems" : "/hidden-gems" },
    { name: "Traveler Stories", href: "/traveler-stories" },
    { name: "Leader Board", href: "/leaderboard" },
  ];

  // Helper to render mini tier badge
  const renderMiniTierBadge = (tier: "Bronze" | "Silver" | "Gold" | "Platinum") => {
    return <ExplorerBadge tier={tier} size={20} showTooltip />;
  };

  return (
    <nav className="sticky top-0 z-50 bg-earth-sand/90 backdrop-blur-md border-b border-earth-clay/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <Compass className="h-5 w-5 text-earth-terracotta" />
              <span className="font-serif text-xl tracking-widest font-bold text-earth-forest uppercase">
                SafarNama
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-sans text-xs font-bold text-earth-charcoal/80 hover:text-earth-terracotta tracking-widest transition-colors duration-200 uppercase"
              >
                {item.name}
              </a>
            ))}
            <div className="h-4 w-[1px] bg-earth-clay/25 mx-2" />
            
            {isLoading ? (
              <div className="h-8 w-24 bg-earth-clay/10 animate-pulse rounded-none" />
            ) : isAuthenticated && currentUser ? (
              <div className="flex items-center space-x-3.5">
                {/* Notification Bell */}
                <NotificationBell />

                {/* User status card */}
                <div
                  className="flex items-center space-x-3 p-1.5 px-3 border border-earth-clay/20 bg-white shadow-sm"
                >
                  {/* Avatar Circle */}
                  <div className="h-8 w-8 rounded-full bg-earth-terracotta/10 flex items-center justify-center font-bold text-xs text-earth-terracotta font-sans border border-earth-terracotta/20 shrink-0">
                    {currentUser.avatar}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className="font-sans text-xs font-bold text-earth-charcoal">
                        {currentUser.name}
                      </span>
                      {currentUser.isVerified && (
                        <ShieldCheck className="h-3 w-3 text-blue-500 fill-blue-50 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 leading-none mt-0.5">
                      {renderMiniTierBadge(currentUser.tier)}
                      <span className="text-[10px] text-earth-terracotta font-bold shrink-0">
                        {currentUser.points} PTS
                      </span>
                      <span className="text-[10px] text-earth-forest font-bold shrink-0">
                        Rank #{currentUserRank}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Button */}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-none text-center"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="px-4 py-2 border border-earth-forest text-earth-forest hover:bg-earth-forest hover:text-white font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-none"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-earth-terracotta hover:bg-earth-saffron hover:text-earth-forest text-white font-sans text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-none"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 md:hidden">
            {isAuthenticated && currentUser && (
              <NotificationBell />
            )}
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
                className="block px-3 py-3 rounded-none font-sans text-xs font-bold text-earth-charcoal hover:bg-earth-clay/5 hover:text-earth-terracotta tracking-widest uppercase"
              >
                {item.name}
              </a>
            ))}
             <div className="px-3 pt-4 border-t border-earth-clay/10 space-y-3">
              {isLoading ? (
                <div className="h-8 w-full bg-earth-clay/10 animate-pulse rounded-none" />
              ) : isAuthenticated && currentUser ? (
                <>
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
                      <div className="flex items-center space-x-2">
                        {renderMiniTierBadge(currentUser.tier)}
                        <span className="text-[10px] text-earth-terracotta font-bold">{currentUser.points} PTS</span>
                        <span className="text-[10px] text-earth-forest font-bold">Rank #{currentUserRank}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-5 py-3 rounded-none bg-earth-forest text-white font-sans text-xs font-semibold uppercase tracking-widest hover:bg-earth-terracotta transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-5 py-3 border border-earth-forest text-earth-forest font-sans text-xs font-semibold uppercase tracking-widest hover:bg-earth-forest hover:text-white transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-5 py-3 bg-earth-terracotta text-white font-sans text-xs font-semibold uppercase tracking-widest hover:bg-earth-saffron hover:text-earth-forest transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
