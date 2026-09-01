"use client";

import React, { useState } from "react";
import { useUser } from "./UserContext";
import { BookOpen, Sparkles, CheckCircle, AlertCircle, Image as ImageIcon, Tag, Clock } from "lucide-react";

interface TravelerStoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "inline" | "page";
}

const CATEGORY_OPTIONS = [
  "Travelogue",
  "Solo Trip",
  "Food & Culture",
  "Road Trip",
  "Trekking & Hiking",
  "Budget Travel",
  "Hidden Destinations",
  "Cultural Insights",
  "Photography Journal",
];

export default function TravelerStoryForm({
  onSuccess,
  onCancel,
  variant = "inline",
}: TravelerStoryFormProps) {
  const { addBlog } = useUser();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travelogue");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Compute read time based on word count (approx 200 words per min)
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanCover = coverImage.trim();
    const cleanExcerpt = excerpt.trim();

    if (!cleanTitle) {
      setError("Please enter a story title.");
      return;
    }

    if (!cleanContent) {
      setError("Please write your traveler story content.");
      return;
    }

    setLoading(true);

    try {
      await addBlog({
        title: cleanTitle,
        content: cleanContent,
        category: category || "Travelogue",
        coverImage:
          cleanCover ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        excerpt: cleanExcerpt || cleanContent.slice(0, 150) + "...",
        readTime: estimatedReadTime,
      });

      setSuccess(true);
      setTitle("");
      setCoverImage("");
      setExcerpt("");
      setContent("");
      setCategory("Travelogue");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error publishing story:", err);
      setError(err.message || "Failed to publish traveler story. Please try again.");
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
            <BookOpen className="h-5 w-5 text-earth-terracotta" />
            <h3 className="font-serif text-xl font-bold text-earth-forest">Write a Traveler Story</h3>
          </div>
          <p className="text-xs text-earth-charcoal/70 font-light mt-1">
            Share your personal travelogue, guide, or adventure narrative with fellow explorers.
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full w-fit">
          <Sparkles className="h-3.5 w-3.5 text-earth-saffron" />
          <span>Earn +30 Points</span>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <span>Your traveler story has been published successfully!</span>
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
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="story-title" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Story Title *
            </label>
            <input
              id="story-title"
              name="storyTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lost in Zanskar: A Two-Week Trek Through Frozen Rivers"
              className="w-full p-3 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="story-category" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Category *
            </label>
            <div className="relative">
              <select
                id="story-category"
                name="storyCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors cursor-pointer appearance-none pr-8"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Tag className="h-4 w-4 text-earth-clay/50 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Cover Image URL & Preview */}
        <div className="space-y-2">
          <label htmlFor="story-cover" className="block font-bold uppercase tracking-wider text-earth-charcoal">
            Cover Image URL
          </label>
          <div className="relative">
            <input
              id="story-cover"
              name="storyCover"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... (Leave empty for default cover image)"
              className="w-full p-3 pl-9 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors"
            />
            <ImageIcon className="h-4 w-4 text-earth-clay/50 absolute left-3 top-3 pointer-events-none" />
          </div>

          {coverImage.trim() && (
            <div className="relative mt-2 aspect-[21/9] w-full max-h-48 overflow-hidden rounded border border-earth-clay/20 bg-stone-100">
              <img
                src={coverImage.trim()}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 font-bold uppercase rounded">
                Cover Preview
              </span>
            </div>
          )}
        </div>

        {/* Story Excerpt / Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="story-excerpt" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Short Summary / Excerpt
            </label>
            <span className="text-[10px] text-earth-clay/70">
              Brief hook displayed on story cards
            </span>
          </div>
          <input
            id="story-excerpt"
            name="storyExcerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A brief summary of your journey narrative..."
            className="w-full p-3 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="story-content" className="block font-bold uppercase tracking-wider text-earth-charcoal">
              Story Content *
            </label>
            <div className="flex items-center space-x-2 text-[10px] text-earth-clay">
              <Clock className="h-3 w-3" />
              <span>Est. {estimatedReadTime} min read ({wordCount} words)</span>
            </div>
          </div>
          <textarea
            id="story-content"
            name="storyContent"
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story here... Detail the journey, key experiences, local encounters, recommendations, and memorable moments."
            className="w-full p-3 bg-white border border-earth-clay/20 text-xs text-earth-charcoal focus:border-earth-terracotta focus:outline-none transition-colors leading-relaxed font-sans"
          />
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
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-earth-saffron" />
                <span>Publish Story (+30 PTS)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
