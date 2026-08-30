"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Script from "next/script";
import { Globe, AlertTriangle, RefreshCw, Info } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslateWidget() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initTranslateElement = useCallback(() => {
    try {
      const targetEl = document.getElementById("google_translate_element");
      if (!targetEl) return false;

      if (window.google?.translate?.TranslateElement) {
        // Prevent duplicate rendering glitches on re-mounts
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
        setStatus("ready");
        setErrorMessage(null);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("[GoogleTranslateWidget] Initialization error:", err);
      setStatus("error");
      setErrorMessage("Initialization failed: " + (err?.message || "Unknown error"));
      return false;
    }
  }, []);

  const handleScriptReady = useCallback(() => {
    // Attempt immediate initialization
    const initialized = initTranslateElement();

    // Set a verification timeout to catch silent failures or ad-blocker suppression
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => {
      const targetEl = document.getElementById("google_translate_element");
      const hasContent = targetEl && targetEl.children.length > 0;
      if (!hasContent && !window.google?.translate?.TranslateElement) {
        console.error(
          "[GoogleTranslateWidget] Google Translate script failed to initialize target DOM. Likely blocked by ad-blocker or privacy extension."
        );
        setStatus("error");
        setErrorMessage("Widget script loaded but widget element did not populate (likely ad-blocker interference).");
      } else {
        setStatus("ready");
      }
    }, 2500);
  }, [initTranslateElement]);

  const handleScriptError = useCallback((e: any) => {
    console.error("[GoogleTranslateWidget] Failed to load Google Translate script from translate.google.com:", e);
    setStatus("error");
    setErrorMessage("Failed to fetch script from translate.google.com. Likely blocked by ad-blocker or network security policy.");
  }, []);

  useEffect(() => {
    // Global callback definition MUST exist on window BEFORE or during script loading
    window.googleTranslateElementInit = () => {
      initTranslateElement();
    };

    // If google script is already present in window from previous route/mount
    if (window.google?.translate?.TranslateElement) {
      handleScriptReady();
    } else {
      // Set fallback timeout if script takes >5s or hangs
      checkTimeoutRef.current = setTimeout(() => {
        const targetEl = document.getElementById("google_translate_element");
        if (!targetEl || targetEl.children.length === 0) {
          if (!window.google?.translate?.TranslateElement) {
            console.warn("[GoogleTranslateWidget] Loading timed out after 5 seconds.");
            setStatus("error");
            setErrorMessage("Translation script loading timed out. Please verify your connection or browser extensions.");
          }
        }
      }, 5000);
    }

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [handleScriptReady, initTranslateElement]);

  const handleRetry = () => {
    setStatus("loading");
    setErrorMessage(null);
    if (window.google?.translate?.TranslateElement) {
      initTranslateElement();
    } else {
      // Force reload script if missing
      const existing = document.getElementById("google-translate-script");
      if (existing) {
        existing.remove();
      }
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.onload = () => handleScriptReady();
      script.onerror = (e) => handleScriptError(e);
      document.body.appendChild(script);
    }
  };

  return (
    <div className="space-y-2 bg-white p-3 border border-earth-clay/20 shadow-sm">
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onReady={handleScriptReady}
        onError={handleScriptError}
      />

      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-earth-clay flex items-center space-x-1.5">
          <Globe className="h-3.5 w-3.5 text-earth-terracotta" />
          <span>Page Language (Google Translate Engine)</span>
        </label>
        <span className="text-[9px] bg-earth-terracotta/10 text-earth-terracotta px-1.5 py-0.5 font-mono font-bold uppercase">
          Live Translator
        </span>
      </div>

      <div className="pt-1 min-h-[38px] flex items-center">
        {status === "loading" && (
          <div className="flex items-center space-x-2 text-xs text-earth-clay/70 animate-pulse">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-earth-terracotta" />
            <span>Loading translation widget...</span>
          </div>
        )}

        <div
          id="google_translate_element"
          className={`min-h-[38px] flex items-center w-full ${status === "error" ? "hidden" : "block"}`}
        />
      </div>

      {status === "error" && (
        <div className="p-3 bg-amber-50/90 border border-amber-200 text-xs space-y-2 rounded-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Translation Temporarily Unavailable</p>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
                {errorMessage || "The Google Translate widget could not be loaded."}
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between border-t border-amber-200/60">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-earth-terracotta text-white hover:bg-earth-terracotta/90 transition-colors shadow-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Retry Loading
            </button>
            <span className="text-[9px] text-amber-800/70 italic flex items-center gap-1">
              <Info className="h-3 w-3" />
              Check ad-blocker / privacy extensions
            </span>
          </div>
        </div>
      )}

      <p className="text-[9px] text-earth-clay/60 font-light font-sans">
        Translates static UI copy and page contents live using Google Translate.
      </p>
    </div>
  );
}

