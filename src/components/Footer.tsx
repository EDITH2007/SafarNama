"use client";

import { useState } from "react";
import { Compass, Send, ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-earth-forest text-earth-sand border-t border-earth-clay/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <Compass className="h-6 w-6 text-earth-saffron" />
              <span className="font-serif text-2xl tracking-widest font-bold text-earth-sand uppercase">
                SafarNama
              </span>
            </div>
            <p className="font-sans text-sm text-earth-sand/75 leading-relaxed font-light">
              A community-first portal documenting the stories, trails, and secrets of the Indian Subcontinent. Designed for curious travelers.
            </p>
            <p className="font-sans text-xs text-earth-sand/50">
              © {new Date().getFullYear()} SafarNama. Made with care for India's heritage.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-widest text-earth-saffron uppercase">
              Explore
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-earth-sand/80 font-light">
              <li>
                <a href="#destinations" className="hover:text-earth-saffron transition-colors">
                  Official Destinations
                </a>
              </li>
              <li>
                <a href="#hidden-gems" className="hover:text-earth-saffron transition-colors">
                  Community Hidden Gems
                </a>
              </li>
              <li>
                <a href="/traveler-stories" className="hover:text-earth-saffron transition-colors">
                  Traveler Stories
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="hover:text-earth-saffron transition-colors">
                  Leader Board
                </a>
              </li>
            </ul>
          </div>

          {/* Guidelines/Submit */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-widest text-earth-saffron uppercase">
              Community
            </h4>
            <ul className="space-y-2.5 font-sans text-sm text-earth-sand/80 font-light">
              <li>
                <a href="#" className="hover:text-earth-saffron transition-colors">
                  Submit a Gem
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-earth-saffron transition-colors">
                  Community Code
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-earth-saffron transition-colors">
                  Points & Badges
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-earth-saffron transition-colors">
                  Moderator Queue
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-widest text-earth-saffron uppercase">
              Chronicle
            </h4>
            <p className="font-sans text-sm text-earth-sand/75 font-light leading-relaxed">
              Subscribe to receive weekly curated logs of recently discovered routes.
            </p>
            {subscribed ? (
              <div className="p-3 bg-earth-sand/10 border border-earth-saffron/20 text-earth-saffron text-sm font-medium">
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="px-4 py-2.5 rounded-none border border-earth-sand/20 bg-earth-sand/5 text-earth-sand text-sm font-sans focus:outline-none focus:border-earth-saffron w-full"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-earth-terracotta text-earth-sand rounded-none font-sans text-xs font-semibold uppercase tracking-wider hover:bg-earth-saffron hover:text-earth-forest transition-all duration-300 flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
