"use client";

import React, { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@/components/UserContext";
import ExplorerBadge from "@/components/badges/ExplorerBadge";
import { CrowdLevel, CROWD_CONFIG } from "@/components/badges/CrowdBadge";
import {
  Users,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface CrowdReportFormProps {
  destinationId?: string;
  gemId?: string;
  destinationName: string;
  onReportSubmitted?: () => void;
  className?: string;
}

export default function CrowdReportForm({
  destinationId,
  gemId,
  destinationName,
  onReportSubmitted,
  className = "",
}: CrowdReportFormProps) {
  const { currentUser } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<CrowdLevel>("moderate");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const submitCrowdReportMutation = useMutation(api.destinations.submitCrowdReport);

  const points = currentUser?.points || 0;
  const tier = (currentUser?.tier || "").toLowerCase();
  const isGoldExplorerOrHigher =
    tier === "gold" || tier === "platinum" || points >= 2500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.id === "loading") {
      setErrorMsg("Please sign in to submit a crowd report.");
      return;
    }
    if (!isGoldExplorerOrHigher) {
      setErrorMsg("Gold Explorer+ status (2,500+ PTS) is required to submit verified crowd reports.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        await submitCrowdReportMutation({
          destinationId: destinationId ? (destinationId as Id<"destinations">) : undefined,
          gemId: gemId ? (gemId as Id<"hiddenGems">) : undefined,
          crowdLevel: selectedLevel,
          note: note.trim() || undefined,
        });

        setSuccessMsg("Thank you! Your crowd report was saved and +15 PTS added to your profile.");
        setNote("");
        if (onReportSubmitted) onReportSubmitted();
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to submit crowd report.");
      }
    });
  };

  return (
    <div
      className={`bg-white border border-earth-clay/10 p-6 md:p-8 shadow-lg space-y-6 font-sans ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-earth-clay/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-earth-forest">
            <Users className="h-5 w-5 text-earth-terracotta" />
            <h3 className="font-serif text-lg font-bold">
              Submit Explorer Crowd Report
            </h3>
          </div>
          <p className="text-xs text-earth-charcoal/70 font-light mt-0.5">
            Help travelers plan by reporting current seasonal crowd levels for{" "}
            <span className="font-semibold">{destinationName}</span>.
          </p>
        </div>

        {/* Tier badge indicator */}
        <div className="shrink-0 flex items-center space-x-1.5 bg-earth-sand px-3 py-1.5 border border-earth-clay/15">
          <ExplorerBadge tier={currentUser?.tier || "Bronze"} size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-earth-forest">
            {currentUser?.tier || "Bronze"} Explorer
          </span>
        </div>
      </div>

      {isGoldExplorerOrHigher ? (
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Crowd Level Radio Chips */}
          <div className="space-y-2">
            <label className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
              Current Crowd Level Rating *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["low", "moderate", "high", "overcrowded"] as CrowdLevel[]).map(
                (lvl) => {
                  const cfg = CROWD_CONFIG[lvl];
                  const isSelected = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`p-3 text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? `ring-2 ring-earth-forest ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass} shadow-md`
                          : "bg-white border-earth-clay/20 text-earth-charcoal/80 hover:border-earth-clay/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-earth-forest" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block">
                          {cfg.shortLabel}
                        </span>
                        <span className="text-[9px] opacity-75 line-clamp-1">
                          {lvl === "low"
                            ? "Quiet & calm"
                            : lvl === "moderate"
                            ? "Normal traffic"
                            : lvl === "high"
                            ? "Busy queues"
                            : "Heavy congestion"}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Crowd Note */}
          <div className="space-y-1.5">
            <label htmlFor="crowd-report-note" className="block font-bold text-earth-charcoal uppercase tracking-wider text-[10px]">
              Observations & Advice (Optional)
            </label>
            <textarea
              id="crowd-report-note"
              name="crowdReportNote"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Visit before 8 AM to avoid tour bus arrivals. Parking is packed by noon."
              className="w-full p-3 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-forest font-light text-earth-charcoal resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2 border-t border-earth-clay/5">
            <div className="flex items-center space-x-1 text-[10px] text-earth-terracotta font-semibold uppercase tracking-wider">
              <Award className="h-3.5 w-3.5" />
              <span>Earn +15 PTS on submission</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm rounded-none disabled:opacity-50 flex items-center space-x-2"
            >
              {isPending ? (
                <span>Saving Report...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Crowd Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Restricted Lock Callout for non-Gold users */
        <div className="p-5 bg-earth-sand/40 border border-earth-clay/15 space-y-3">
          <div className="flex items-center space-x-2 text-earth-terracotta">
            <Lock className="h-4 w-4" />
            <h4 className="font-serif text-sm font-bold">
              Gold Explorer+ Status Required
            </h4>
          </div>
          <p className="text-xs text-earth-charcoal/70 font-light leading-relaxed">
            Community crowd report submissions are reserved for verified{" "}
            <span className="font-semibold text-earth-forest">
              Gold Explorer (2,500+ PTS)
            </span>{" "}
            members to maintain rating integrity. You currently have{" "}
            <span className="font-bold text-earth-terracotta">{points} PTS</span>.
          </p>
          <div className="pt-2 flex items-center space-x-4">
            <Link
              href="/hidden-gems"
              className="inline-flex items-center space-x-1 px-4 py-2 bg-earth-forest hover:bg-earth-terracotta text-white text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Submit Gems (+100 PTS)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
