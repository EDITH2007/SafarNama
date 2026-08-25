"use client";

import React from "react";
import { Expense } from "./UserContext";
import { Journey } from "../app/data/mockData";

interface DonutChartProps {
  expenses: Expense[];
}

interface BarChartProps {
  journeys: Journey[];
  expenses: Expense[];
}

const CATEGORY_COLORS: Record<Expense["category"], string> = {
  Food: "#d69e2e", // saffron
  Stay: "#8c5230", // clay
  Transport: "#c05621", // terracotta
  Tickets: "#1c3d27", // forest green
  Shopping: "#e53e3e", // red
  Other: "#718096", // charcoal/gray
};

export function CategoryDonutChart({ expenses }: DonutChartProps) {
  // Aggregate expenses by category
  const totals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<Expense["category"], number>);

  const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

  if (grandTotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-earth-clay/20 bg-earth-sand/5 text-center min-h-[220px]">
        <p className="font-sans text-xs text-earth-charcoal/60 font-light">
          No expenses recorded for this trip yet. Add details above to draw the chart.
        </p>
      </div>
    );
  }

  // Calculate percentages and angles
  const categoriesList = Object.entries(totals).map(([category, amount]) => ({
    category: category as Expense["category"],
    amount,
    percentage: (amount / grandTotal) * 100,
  }));

  // SVG parameters
  const size = 160;
  const strokeWidth = 24;
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159

  let accumulatedPercentage = 0;

  return (
    <div className="bg-earth-sand/20 border border-earth-clay/10 p-6 flex flex-col md:flex-row items-center gap-8">
      {/* SVG Donut */}
      <div className="relative h-[160px] w-[160px] shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Base circle background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#edf2f7"
            strokeWidth={strokeWidth}
          />
          {categoriesList.map((item) => {
            const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
            const strokeDasharray = `${circumference}`;
            const rotationOffset = (accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += item.percentage;

            return (
              <circle
                key={item.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={CATEGORY_COLORS[item.category]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transformOrigin: "center",
                  transform: `rotate(${(rotationOffset / circumference) * 360}deg)`,
                  transition: "all 0.5s ease-in-out",
                }}
              />
            );
          })}
        </svg>

        {/* Center Text label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-sans pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-earth-clay/60 tracking-wider">Total spent</span>
          <span className="text-sm font-bold text-earth-charcoal font-mono mt-0.5">
            ₹{grandTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Donut Legend */}
      <div className="flex-1 space-y-2.5 font-sans w-full">
        <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest border-b border-earth-clay/5 pb-1">
          Expenses Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {categoriesList.map((item) => (
            <div key={item.category} className="flex items-center space-x-2 text-xs">
              <span
                className="h-3 w-3 shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-earth-charcoal">{item.category}</span>
                <span className="text-[10px] text-earth-clay font-mono">
                  ₹{item.amount.toLocaleString("en-IN")} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TripExpensesBarChart({ journeys, expenses }: BarChartProps) {
  // Map journeys and aggregate expenses
  const journeyMap = new Map<string, string>();
  journeys.forEach((j) => {
    journeyMap.set(j.id, j.title.replace(/Itinerary/gi, "").replace(/Trek/gi, "").trim() || "Trip");
  });

  // Calculate totals per trip
  const tripTotalsMap = new Map<string, { title: string; total: number }>();

  // Add all journeys to map
  journeys.forEach((j) => {
    const title = j.title.replace(/Itinerary/gi, "").replace(/Trek/gi, "").trim() || "Trip";
    tripTotalsMap.set(j.id, { title, total: 0 });
  });

  // Aggregate expenses
  expenses.forEach((e) => {
    const existing = tripTotalsMap.get(e.tripId);
    if (existing) {
      existing.total += e.amount;
    } else {
      tripTotalsMap.set(e.tripId, {
        title: `Trip (${e.tripId.slice(0, 6)})`,
        total: e.amount,
      });
    }
  });

  let tripTotals = Array.from(tripTotalsMap.entries()).map(([id, val]) => ({
    id,
    title: val.title,
    total: val.total,
  }));

  // Filter to trips with expenses if available, or keep top journeys
  const activeTripTotals = tripTotals.filter((t) => t.total > 0);
  const displayTrips = (activeTripTotals.length > 0 ? activeTripTotals : tripTotals).slice(0, 8);

  const overallTotal = displayTrips.reduce((sum, curr) => sum + curr.total, 0);
  const maxExpense = Math.max(...displayTrips.map((t) => t.total), 1);

  if (overallTotal === 0) {
    return (
      <div className="bg-earth-sand/20 border border-earth-clay/10 p-6 text-center space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest border-b border-earth-clay/5 pb-1 font-sans">
          Combined Spending Comparison
        </h4>
        <p className="font-sans text-xs text-earth-charcoal/60 font-light">
          No expenses recorded across trips yet. Select a trip or add expenses to compare trip spending.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-earth-sand/20 border border-earth-clay/10 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-earth-clay/10 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-earth-forest font-sans">
          Cost Comparison Across Trips (INR)
        </h4>
        <span className="text-[10px] font-bold text-earth-terracotta bg-white px-2 py-0.5 border border-earth-clay/15">
          {displayTrips.length} Active Trips
        </span>
      </div>

      <div className="flex items-end justify-around h-48 pt-8 pb-3 border-b border-earth-clay/10 font-sans gap-2 overflow-x-auto">
        {displayTrips.map((trip) => {
          const barHeight = Math.max((trip.total / maxExpense) * 120, 8);

          return (
            <div key={trip.id} className="flex flex-col items-center group flex-1 min-w-[60px] max-w-[120px] space-y-2">
              <div className="relative w-full flex justify-center items-end">
                {/* Cost bubble indicator */}
                <span className="absolute -top-7 text-[9px] font-bold text-earth-terracotta bg-white px-1.5 py-0.5 border border-earth-clay/15 shadow-sm font-mono whitespace-nowrap">
                  ₹{trip.total >= 1000 ? `${(trip.total / 1000).toFixed(1)}k` : trip.total.toLocaleString("en-IN")}
                </span>

                {/* Vertical bar */}
                <div
                  className="w-7 sm:w-10 bg-earth-forest hover:bg-earth-terracotta transition-all duration-300 shadow-md rounded-t-sm"
                  style={{ height: `${barHeight}px` }}
                />
              </div>

              {/* Label */}
              <span className="text-[10px] text-earth-charcoal font-semibold text-center truncate w-full" title={trip.title}>
                {trip.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
