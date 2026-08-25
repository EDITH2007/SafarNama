"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useUser } from "./UserContext";

export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface CurrencySymbolInfo {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  position: "before" | "after";
}

export const CURRENCY_MAP: Record<SupportedCurrency, CurrencySymbolInfo> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", position: "before" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", position: "before" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", position: "before" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", position: "before" },
  AED: { code: "AED", symbol: "AED ", name: "UAE Dirham", position: "before" },
};

const DEFAULT_RATES: Record<SupportedCurrency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
};

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (code: SupportedCurrency) => Promise<void>;
  rates: Record<SupportedCurrency, number>;
  isLoadingRates: boolean;
  formatPrice: (
    amountInINR: number,
    options?: { hideSymbol?: boolean; precision?: number }
  ) => string;
  convertCurrency: (
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency
  ) => number;
  symbolInfo: CurrencySymbolInfo;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { currentUser, updateUserPreferences } = useUser();
  const [rates, setRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_RATES);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Site-wide display currency synced with Convex user preference
  const userCurrency = (currentUser?.currency as SupportedCurrency) || "INR";
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(userCurrency);

  useEffect(() => {
    if (currentUser?.currency && (currentUser.currency as SupportedCurrency) !== selectedCurrency) {
      setSelectedCurrency(currentUser.currency as SupportedCurrency);
    }
  }, [currentUser?.currency]);

  // Fetch server-side cached exchange rates
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("/api/exchange-rates");
        if (res.ok) {
          const data = await res.json();
          if (data?.rates) {
            setRates((prev) => ({
              ...prev,
              ...data.rates,
            }));
          }
        }
      } catch (err) {
        console.warn("Using default exchange rates fallback:", err);
      } finally {
        setIsLoadingRates(false);
      }
    }
    fetchRates();
  }, []);

  const changeCurrency = async (newCurrency: SupportedCurrency) => {
    setSelectedCurrency(newCurrency);
    try {
      await updateUserPreferences({ currency: newCurrency });
    } catch (err) {
      console.error("Failed to persist currency preference to Convex:", err);
    }
  };

  // Convert arbitrary amount between ANY pair of currencies
  const convertCurrency = (
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency
  ): number => {
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) return 0;
    const fromRate = rates[from] || DEFAULT_RATES[from] || 1;
    const toRate = rates[to] || DEFAULT_RATES[to] || 1;
    
    // Convert to INR first, then convert from INR to target currency
    const amountInINR = amount / fromRate;
    return amountInINR * toRate;
  };

  // Format price in the user's active site-wide DISPLAY currency (reads userPreferences.currency)
  const formatPrice = (
    amountInINR: number,
    options?: { hideSymbol?: boolean; precision?: number }
  ): string => {
    const converted = convertCurrency(amountInINR, "INR", selectedCurrency);
    const info = CURRENCY_MAP[selectedCurrency] || CURRENCY_MAP.INR;

    let formattedNum: string;
    if (options?.precision !== undefined) {
      formattedNum = converted.toFixed(options.precision);
    } else if (selectedCurrency === "INR") {
      formattedNum = Math.round(converted).toLocaleString("en-IN");
    } else {
      if (converted >= 100) {
        formattedNum = Math.round(converted).toLocaleString("en-US");
      } else {
        formattedNum = converted.toLocaleString("en-US", {
          minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        });
      }
    }

    if (options?.hideSymbol) {
      return formattedNum;
    }

    return info.position === "before"
      ? `${info.symbol}${formattedNum}`
      : `${formattedNum} ${info.symbol}`;
  };

  const symbolInfo = useMemo(() => {
    return CURRENCY_MAP[selectedCurrency] || CURRENCY_MAP.INR;
  }, [selectedCurrency]);

  return (
    <CurrencyContext.Provider
      value={{
        currency: selectedCurrency,
        setCurrency: changeCurrency,
        rates,
        isLoadingRates,
        formatPrice,
        convertCurrency,
        symbolInfo,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
