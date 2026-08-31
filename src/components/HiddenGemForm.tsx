"use client";

import React, { useState } from "react";
import { Compass, Gift, ShieldAlert, Check, MapPin } from "lucide-react";
import { CATEGORIES } from "@/app/data/mockData";
import { useUser } from "@/components/UserContext";
import MapPicker from "@/components/MapPicker";

interface HiddenGemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "modal" | "inline";
  className?: string;
}

export default function HiddenGemForm({
  onSuccess,
  onCancel,
  variant = "inline",
  className = "",
}: HiddenGemFormProps) {
  const { submitGem } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [stateName, setStateName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Offbeat"]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidImageUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    return /^https?:\/\/.+/i.test(trimmed) || /^data:image\/.+/i.test(trimmed);
  };

  const handleMapSelectLocation = (selectedLat: number, selectedLng: number, regionName: string) => {
    setLat(selectedLat.toString());
    setLng(selectedLng.toString());

    if (regionName && regionName.includes(",")) {
      const [cityPart, statePart] = regionName.split(",");
      if (!location) setLocation(cityPart.trim());
      if (!stateName && statePart) setStateName(statePart.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !stateName.trim() || !photoUrl.trim() || !lat || !lng) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!isValidImageUrl(photoUrl)) {
      setErrorMsg("Please enter a valid image URL starting with http://, https://, or data:image/");
      return;
    }
    if (selectedCategories.length === 0) {
      setErrorMsg("Please select at least one vibe category.");
      return;
    }
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setErrorMsg("Please enter valid numeric coordinates.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setShowSuccessMsg(false);

      await submitGem({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        state: stateName.trim(),
        category: selectedCategories.join(", "),
        photo: photoUrl.trim(),
        geo: { lat: parsedLat, lng: parsedLng },
      });

      setShowSuccessMsg(true);
      setIsSubmitting(false);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error submitting gem:", err);
      setIsSubmitting(false);
      setErrorMsg(err.message || "Failed to submit hidden gem spot.");
    }
  };

  const availableCategories = CATEGORIES.filter((c) => c !== "All");

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Info */}
      <div className="space-y-1.5 border-b border-earth-clay/10 pb-4">
        <h3 className="font-serif text-xl md:text-2xl font-bold text-earth-forest flex items-center space-x-2">
          <Compass className="h-6 w-6 text-earth-terracotta shrink-0" />
          <span>Submit a Hidden Gem</span>
        </h3>
        <p className="font-sans text-xs text-earth-charcoal/70 font-light leading-relaxed">
          Spot discoveries are submitted directly to the moderation queue. Upon admin review &amp; verification, you will earn <span className="font-bold text-earth-terracotta">+100 Explorer Points</span>.
        </p>
      </div>

      {showSuccessMsg ? (
        <div className="p-6 bg-earth-forest/10 border border-earth-forest text-earth-forest text-center space-y-4 animate-in fade-in duration-300">
          <Gift className="h-10 w-10 text-earth-saffron mx-auto animate-bounce" />
          <h4 className="font-serif text-lg font-bold">Spot Submitted Successfully!</h4>
          <p className="font-sans text-xs font-light leading-relaxed">
            Your submission is now <span className="font-bold uppercase tracking-wider text-earth-terracotta bg-earth-terracotta/5 px-2 py-0.5 border border-earth-terracotta/10">Pending Approval</span>. It will appear on the map and public lists once reviewed by an administrator. You&apos;ll earn <span className="font-bold text-earth-terracotta">+100 points</span> upon approval!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center space-x-2 rounded-none animate-in fade-in duration-300">
              <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Map Picker Section */}
          <div className="space-y-1.5 bg-earth-sand/10 border border-earth-clay/15 p-3.5">
            <MapPicker onSelectLocation={handleMapSelectLocation} />
          </div>

          {/* Title & Category Vibe Row */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="gem-spot-name" className="block font-bold uppercase tracking-wider text-earth-charcoal">
                Spot Name *
              </label>
              <input
                id="gem-spot-name"
                name="gemSpotName"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gandikota Grand Canyon"
                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
              />
            </div>

            {/* Vibe Categories selector */}
            <div className="space-y-1.5 border border-earth-clay/10 p-3 bg-earth-sand/5">
              <label className="block font-bold uppercase tracking-wider text-earth-charcoal">
                Vibe Categories * (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-2 bg-white border border-earth-clay/20">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                        } else {
                          setSelectedCategories([...selectedCategories, cat]);
                        }
                      }}
                      className={`px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider transition-all border rounded-none cursor-pointer ${
                        isSelected
                          ? "bg-earth-terracotta border-earth-terracotta text-white shadow-sm"
                          : "bg-white border-earth-clay/10 text-earth-charcoal/85 hover:border-earth-terracotta hover:text-earth-terracotta"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location & State Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="gem-city" className="block font-bold uppercase tracking-wider text-earth-charcoal">
                City / District *
              </label>
              <input
                id="gem-city"
                name="gemCity"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kadapa"
                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="gem-state" className="block font-bold uppercase tracking-wider text-earth-charcoal">
                State *
              </label>
              <input
                id="gem-state"
                name="gemState"
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. Andhra Pradesh"
                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
              />
            </div>
          </div>

          {/* Numeric Lat / Lng Coordinates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="gem-lat" className="block font-bold uppercase tracking-wider text-earth-charcoal">
                Latitude Coordinate *
              </label>
              <input
                id="gem-lat"
                name="gemLat"
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g. 14.8011"
                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="gem-lng" className="block font-bold uppercase tracking-wider text-earth-charcoal">
                Longitude Coordinate *
              </label>
              <input
                id="gem-lng"
                name="gemLng"
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g. 78.2664"
                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
              />
            </div>
          </div>

          {/* Photo URL & Live Thumbnail Preview */}
          <div className="space-y-2 border border-earth-clay/10 p-3 bg-earth-sand/5">
            <div className="space-y-1">
              <label htmlFor="gem-photo-url" className="block font-bold uppercase tracking-wider text-earth-charcoal">
                Photo URL *
              </label>
              <input
                id="gem-photo-url"
                name="gemPhotoUrl"
                type="text"
                required
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta"
              />
            </div>

            {photoUrl && !isValidImageUrl(photoUrl) && (
              <p className="text-red-600 text-[10px] font-semibold animate-pulse">
                ⚠️ Please enter a valid URL starting with http://, https://, or data:image/
              </p>
            )}

            {photoUrl && isValidImageUrl(photoUrl) && (
              <div className="mt-2 space-y-1 animate-in fade-in duration-200">
                <span className="text-[9px] font-bold text-earth-forest uppercase tracking-wider block flex items-center space-x-1">
                  <Check className="h-3 w-3 text-green-600" />
                  <span>Image URL Validated</span>
                </span>
                <div className="h-24 w-36 overflow-hidden border border-earth-clay/20 bg-white shadow-sm relative">
                  <img
                    src={photoUrl}
                    alt="Live spot thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description & Details */}
          <div className="space-y-1">
            <label htmlFor="gem-description" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Description &amp; Details *
            </label>
            <textarea
              id="gem-description"
              name="gemDescription"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes this spot a hidden gem, how to reach, or best time to visit..."
              className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs focus:outline-none focus:border-earth-terracotta resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 border border-earth-clay/20 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-earth-sand transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !title.trim() ||
                !description.trim() ||
                !location.trim() ||
                !stateName.trim() ||
                !photoUrl.trim() ||
                !lat ||
                !lng ||
                !isValidImageUrl(photoUrl) ||
                selectedCategories.length === 0
              }
              className="px-6 py-2.5 bg-earth-terracotta hover:bg-earth-forest disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-200"
            >
              {isSubmitting ? "Submitting Spot..." : "Submit Discovery (+100 PTS)"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
