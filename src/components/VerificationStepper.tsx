"use client";

import React from "react";
import { Check } from "lucide-react";

interface VerificationStepperProps {
  status: "submitted" | "in_review" | "verified" | "pending" | "approved";
}

export default function VerificationStepper({ status: rawStatus }: VerificationStepperProps) {
  // Map legacy statuses
  const status: "submitted" | "in_review" | "verified" = 
    rawStatus === "approved" || rawStatus === "verified"
      ? "verified"
      : rawStatus === "in_review"
      ? "in_review"
      : "submitted";

  const steps = [
    { label: "Submitted", value: "submitted" },
    { label: "Community Review", value: "in_review" },
    { label: "Verified Safar Gem", value: "verified" },
  ];

  const getStepState = (index: number): "completed" | "current" | "future" => {
    if (status === "verified") {
      return "completed";
    }
    if (status === "in_review") {
      if (index === 0) return "completed";
      if (index === 1) return "current";
      return "future";
    }
    // status === "submitted"
    if (index === 0) return "current";
    return "future";
  };

  return (
    <div className="relative max-w-[250px] w-full mx-auto py-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between w-full relative gap-4 sm:gap-2">
        {/* Connecting line for horizontal desktop */}
        <div className="hidden sm:block absolute top-4 left-[16.66%] right-[16.66%] h-0.5 bg-stone-200 -z-10">
          <div 
            className="h-full bg-earth-terracotta transition-all duration-500" 
            style={{ 
              width: status === "verified" ? "100%" : status === "in_review" ? "50%" : "0%" 
            }} 
          />
        </div>

        {/* Connecting line for vertical mobile */}
        <div className="block sm:hidden absolute left-[16px] top-4 bottom-4 w-0.5 bg-stone-200 -z-10">
          <div 
            className="w-full bg-earth-terracotta transition-all duration-500" 
            style={{ 
              height: status === "verified" ? "100%" : status === "in_review" ? "50%" : "0%" 
            }} 
          />
        </div>

        {steps.map((step, index) => {
          const state = getStepState(index);
          
          return (
            <div key={step.value} className="flex flex-row sm:flex-col items-center sm:text-center flex-1 z-10 w-full gap-3 sm:gap-0">
              {/* Dot */}
              <div className="relative shrink-0">
                {state === "current" && (
                  <div className="absolute -inset-1.5 rounded-full border-2 border-earth-terracotta/30 animate-pulse" />
                )}
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    state === "completed"
                      ? "bg-earth-terracotta border-earth-terracotta text-white"
                      : state === "current"
                      ? "bg-earth-terracotta border-earth-terracotta text-white shadow-sm"
                      : "bg-white border-stone-200 text-stone-400"
                  }`}
                >
                  {state === "completed" ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] font-bold font-sans">{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Label */}
              <span 
                className={`text-[9px] font-sans font-bold tracking-tight uppercase leading-tight sm:mt-2 text-left sm:text-center max-w-[150px] sm:max-w-[70px] ${
                  state === "completed" || state === "current"
                    ? "text-earth-charcoal"
                    : "text-stone-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
