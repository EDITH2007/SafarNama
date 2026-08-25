"use client";

import React, { useEffect, useState } from "react";
import { Globe, Info } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslateWidget() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // If google translate script is already initialized and element loaded
    if (window.google?.translate?.TranslateElement) {
      initTranslateElement();
      setIsLoaded(true);
      return;
    }

    // Callback function invoked when Google Translate script loads
    window.googleTranslateElementInit = () => {
      initTranslateElement();
      setIsLoaded(true);
    };

    // Check if script tag is already in DOM
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        setLoadError(true);
        console.warn("Google Translate script failed to load.");
      };
      document.body.appendChild(script);
    } else if (window.googleTranslateElementInit) {
      window.googleTranslateElementInit();
    }
  }, []);

  const initTranslateElement = () => {
    try {
      const targetEl = document.getElementById("google_translate_element");
      if (targetEl && window.google?.translate?.TranslateElement) {
        // Prevent duplicate rendering
        targetEl.innerHTML = "";
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,es,fr,de,ja,zh-CN,ar,ru,it,pt",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    } catch (err) {
      console.warn("Google Translate initialization warning:", err);
    }
  };

  return (
    <div className="space-y-2 bg-white p-3 border border-earth-clay/20 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-earth-clay flex items-center space-x-1.5">
          <Globe className="h-3.5 w-3.5 text-earth-terracotta" />
          <span>Page Language (Google Translate Engine)</span>
        </label>
        <span className="text-[9px] bg-earth-terracotta/10 text-earth-terracotta px-1.5 py-0.5 font-mono font-bold uppercase">
          Live Translator
        </span>
      </div>

      <div className="pt-1">
        <div id="google_translate_element" className="min-h-[38px] flex items-center" />
      </div>

      {loadError && (
        <p className="text-[10px] text-red-600 flex items-center gap-1 font-sans">
          <Info className="h-3 w-3" />
          <span>Google Translate widget failed to load. Check internet connection.</span>
        </p>
      )}

      <p className="text-[9px] text-earth-clay/60 font-light font-sans">
        Translates static UI copy and page contents live using Google Translate.
      </p>
    </div>
  );
}
