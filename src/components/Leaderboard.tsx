"use client";

import { useUser } from "./UserContext";
import { Award, Sparkles, ShieldCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function Leaderboard({ isLandingPage = false }: { isLandingPage?: boolean }) {
  const { leaderboard, currentUser } = useUser();

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Helper to render tier badge
  const renderTierBadge = (tier: "Bronze" | "Silver" | "Gold") => {
    switch (tier) {
      case "Gold":
        return (
          <span className="px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider border border-[#f3d082] bg-[#fdf6e2] text-[#d69e2e] inline-block shadow-sm">
            Gold
          </span>
        );
      case "Silver":
        return (
          <span className="px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider border border-[#ccd2d8] bg-[#f0f2f5] text-[#5c6873] inline-block shadow-sm">
            Silver
          </span>
        );
      case "Bronze":
      default:
        return (
          <span className="px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider border border-[#d8c3b7] bg-[#fbf5f0] text-[#8c5230] inline-block shadow-sm">
            Bronze
          </span>
        );
    }
  };

  const convexUsers = useQuery(api.users.getLeaderboard);

  // Loading state (skeleton loader) to avoid blank screens while Convex resolves
  if (convexUsers === undefined) {
    return (
      <div className="bg-white border border-earth-clay/10 p-6 space-y-6">
        <h3 className="font-serif text-base font-bold text-earth-charcoal flex items-center space-x-2 pb-3 border-b border-earth-clay/5">
          <Award className="h-5 w-5 text-earth-saffron animate-pulse" />
          <span>Top Spotters Leaderboard</span>
        </h3>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-earth-clay/5 bg-earth-sand/5">
              <div className="flex items-center space-x-3 w-full">
                <div className="h-6 w-6 bg-earth-clay/10 shrink-0" />
                <div className="h-9 w-9 rounded-full bg-earth-clay/10 shrink-0" />
                <div className="flex-grow space-y-1.5">
                  <div className="h-3 bg-earth-clay/15 w-24" />
                  <div className="h-2.5 bg-earth-clay/10 w-12" />
                </div>
              </div>
              <div className="h-3 bg-earth-clay/15 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const leaderboardData = (convexUsers && convexUsers.length > 0)
    ? convexUsers.map(u => ({
        rank: u.rank,
        name: u.name,
        tier: u.tier as "Bronze" | "Silver" | "Gold",
        points: u.points,
        isVerified: u.isVerified,
        isCurrentUser: currentUser ? u.name === currentUser.name : false
      }))
    : leaderboard;

  const displayLeaderboard = isLandingPage ? leaderboardData.slice(0, 5) : leaderboardData;
  const topThree = leaderboardData.slice(0, 3);
  const currentUserRankInfo = leaderboardData.find((u) => u.isCurrentUser);
  const isCurrentUserInTopThree = currentUserRankInfo && currentUserRankInfo.rank <= 3;

  return (
    <div className="bg-white border border-earth-clay/10 p-6 space-y-6">
      {/* Title */}
      <h3 className="font-serif text-base font-bold text-earth-charcoal flex items-center space-x-2 pb-3 border-b border-earth-clay/5">
        <Award className="h-5 w-5 text-earth-saffron" />
        <span>Top Spotters Leaderboard</span>
      </h3>

      {/* Ranks list */}
      <div className="space-y-3">
        {displayLeaderboard.map((u) => {
          const initials = getInitials(u.name);
          const isTopThree = u.rank <= 3;
          
          return (
            <div
              key={`${u.rank}-${u.name}`}
              className={`flex items-center justify-between p-3 border transition-all duration-200 ${
                u.isCurrentUser
                  ? "bg-earth-sand/70 border-earth-terracotta/40 shadow-sm"
                  : "bg-earth-sand/10 border-earth-clay/5 hover:border-earth-clay/15"
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Rank Badge */}
                <span
                  className={`h-6 w-6 flex items-center justify-center font-sans text-[10px] font-bold shrink-0 ${
                    u.rank === 1
                      ? "bg-[#fdf6e2] text-[#d69e2e] border border-[#f3d082]"
                      : u.rank === 2
                      ? "bg-[#f0f2f5] text-[#5c6873] border border-[#ccd2d8]"
                      : u.rank === 3
                      ? "bg-[#fbf5f0] text-[#8c5230] border border-[#d8c3b7]"
                      : "bg-white text-earth-charcoal/70 border border-earth-clay/10"
                  }`}
                >
                  {u.rank}
                </span>

                {/* Initials Circle */}
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs font-sans shrink-0 border ${
                    u.tier === "Gold"
                      ? "bg-earth-saffron/10 border-earth-saffron/30 text-earth-saffron"
                      : u.tier === "Silver"
                      ? "bg-slate-100 border-slate-300 text-slate-700"
                      : "bg-orange-50 border-orange-200 text-[#8c5230]"
                  }`}
                >
                  {initials}
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-1">
                    <span className="font-sans text-xs font-bold text-earth-charcoal">
                      {u.name}
                    </span>
                    {u.isVerified && (
                      <span title="Verified Explorer">
                        <ShieldCheck
                          className="h-3.5 w-3.5 text-blue-500 fill-blue-50 shrink-0"
                        />
                      </span>
                    )}
                  </div>
                  <div>{renderTierBadge(u.tier)}</div>
                </div>
              </div>
              
              <span className="font-sans text-xs font-bold text-earth-terracotta">
                {u.points} PTS
              </span>
            </div>
          );
        })}
      </div>

      {isLandingPage && (
        <div className="pt-2 text-center border-t border-earth-clay/5">
          <Link
            href="/leaderboard"
            className="inline-flex items-center space-x-1 font-sans text-xs font-bold text-earth-terracotta hover:text-earth-forest uppercase tracking-widest transition-colors duration-200 cursor-pointer"
          >
            <span>View Full Leader Board</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Persistent rank drawer for user if not in top 3 */}
      {!isCurrentUserInTopThree && currentUserRankInfo && currentUser && (
        <div className="pt-4 border-t border-earth-clay/10 space-y-4">
          <div className="flex items-center justify-between text-xs font-sans text-earth-clay font-medium">
            <span>Your Standing</span>
            <span className="text-earth-charcoal font-bold">Rank #{currentUserRankInfo.rank}</span>
          </div>

          <div className="bg-earth-forest text-earth-sand p-4 border border-earth-clay/5 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4.5 w-4.5 text-earth-saffron shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="font-sans text-xs font-bold text-white">
                    {currentUser.name}
                  </span>
                  {currentUser.isVerified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-earth-saffron fill-earth-forest shrink-0" />
                  )}
                </div>
                <div>{renderTierBadge(currentUser.tier)}</div>
              </div>
            </div>
            <span className="font-sans text-sm font-bold text-earth-saffron">
              {currentUser.points} PTS
            </span>
          </div>

          {/* Progress details */}
          <div className="space-y-1.5">
            {currentUser.tier !== "Gold" ? (
              (() => {
                const nextTierName = currentUser.tier === "Bronze" ? "Silver" : "Gold";
                const targetPoints = currentUser.tier === "Bronze" ? 1000 : 2500;
                const pointsToNext = targetPoints - currentUser.points;
                const percent = Math.min(100, (currentUser.points / targetPoints) * 100);

                return (
                  <>
                    <div className="w-full bg-earth-sand h-2 border border-earth-clay/10 overflow-hidden relative">
                      <div
                        className="bg-earth-terracotta h-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="font-sans text-[10px] text-earth-clay text-right font-medium">
                      {pointsToNext} points to next tier ({nextTierName})
                    </p>
                  </>
                );
              })()
            ) : (
              <p className="font-sans text-[10px] text-earth-saffron text-center font-bold">
                🎉 You have reached the highest tier (Gold)!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
