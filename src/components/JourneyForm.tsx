"use client";

import React, { useState } from "react";
import { useUser } from "./UserContext";
import { Plus, Trash2, CheckCircle, Route, Clock, Sparkles, MapPin, AlertCircle } from "lucide-react";

interface JourneyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "inline" | "page";
}

export default function JourneyForm({ onSuccess, onCancel, variant = "inline" }: JourneyFormProps) {
  const { submitJourney } = useUser();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [stops, setStops] = useState<string[]>(["", ""]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddStop = () => {
    setStops((prev) => [...prev, ""]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 1) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, value: string) => {
    setStops((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const cleanTitle = title.trim();
    const cleanDuration = duration.trim();
    const cleanDesc = description.trim();
    const validStops = stops.map((s) => s.trim()).filter(Boolean);

    if (!cleanTitle) {
      setError("Please enter a title for your journey.");
      return;
    }
    if (!cleanDuration) {
      setError("Please enter the total duration (e.g. '5 Days').");
      return;
    }
    if (!cleanDesc) {
      setError("Please enter a description or overview for your journey.");
      return;
    }
    if (validStops.length === 0) {
      setError("Please provide at least one route stop/destination.");
      return;
    }

    setLoading(true);

    try {
      await submitJourney({
        title: cleanTitle,
        duration: cleanDuration,
        description: cleanDesc,
        stops: validStops,
      });

      setSuccess(true);
      setTitle("");
      setDuration("");
      setDescription("");
      setStops(["", ""]);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error submitting journey:", err);
      setError(err.message || "Failed to submit journey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white border border-earth-clay/15 p-6 md:p-8 shadow-sm space-y-6 ${
        variant === "page" ? "max-w-3xl mx-auto rounded-lg" : ""
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-earth-clay/10 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-earth-terracotta" />
            <h3 className="font-serif text-xl font-bold text-earth-forest">Share Journey Route</h3>
          </div>
          <p className="text-xs text-earth-charcoal/70 font-light mt-1">
            Publish your multi-stop itinerary or road trip route for the explorer community.
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full w-fit">
          <Sparkles className="h-3.5 w-3.5 text-earth-saffron" />
          <span>Earn +100 Points on Approval</span>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <span>Your journey route has been submitted successfully and sent for moderation!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
        {/* Title & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="journey-title" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Journey Title *
            </label>
            <input
              id="journey-title"
              name="journeyTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 5-Day Spiti Circuit & High Passes"
              className="w-full p-3 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="journey-duration" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Duration *
            </label>
            <div className="relative">
              <input
                id="journey-duration"
                name="journeyDuration"
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 5 Days / 4 Nights"
                className="w-full p-3 pr-8 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors"
              />
              <Clock className="h-4 w-4 text-earth-clay/50 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Route Overview */}
        <div className="space-y-1.5">
          <label htmlFor="journey-description" className="block font-bold uppercase tracking-wider text-earth-charcoal">
            Journey Story & Route Overview *
          </label>
          <textarea
            id="journey-description"
            name="journeyDescription"
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the terrain, scenic highlights, best stops, road conditions, and practical travel tips for this route..."
            className="w-full p-3 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors leading-relaxed"
          />
        </div>

        {/* Dynamic Route Stops */}
        <div className="space-y-3 pt-2 border-t border-earth-clay/10">
          <div className="flex items-center justify-between">
            <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Route Destinations / Waypoints *
            </label>
            <span className="text-[10px] text-earth-clay/70">
              List stops in sequential order of travel
            </span>
          </div>

          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-earth-sand border border-earth-clay/20 text-earth-forest font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={stop}
                    onChange={(e) => handleStopChange(idx, e.target.value)}
                    placeholder={`Stop #${idx + 1} (e.g. ${
                      idx === 0 ? "Manali" : idx === 1 ? "Keylong" : "Leh"
                    })`}
                    className="w-full p-2.5 pl-8 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors"
                  />
                  <MapPin className="h-3.5 w-3.5 text-earth-clay/50 absolute left-2.5 top-3 pointer-events-none" />
                </div>
                {stops.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    className="p-2 text-earth-clay hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove stop"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddStop}
            className="mt-2 px-3 py-1.5 bg-earth-sand border border-earth-clay/30 hover:border-earth-terracotta text-earth-forest text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Waypoint / Stop</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-earth-clay/10">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-earth-clay/30 hover:bg-earth-sand/50 text-earth-charcoal font-bold uppercase tracking-wider text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs cursor-pointer transition-colors flex items-center space-x-2 shadow-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-earth-saffron" />
                <span>Submit Journey (+100 PTS)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
