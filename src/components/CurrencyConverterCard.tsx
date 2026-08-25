"use client";

import React, { useState, useMemo } from "react";
import { useCurrency, SupportedCurrency, CURRENCY_MAP } from "./CurrencyContext";
import { ArrowLeftRight, Calculator, RefreshCw } from "lucide-react";

export default function CurrencyConverterCard() {
  const { convertCurrency, isLoadingRates, rates } = useCurrency();

  const [amount, setAmount] = useState<number | string>(100);
  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>("USD");
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>("INR");

  const numericAmount = useMemo(() => {
    const parsed = typeof amount === "number" ? amount : parseFloat(amount);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [amount]);

  const convertedResult = useMemo(() => {
    return convertCurrency(numericAmount, fromCurrency, toCurrency);
  }, [numericAmount, fromCurrency, toCurrency, convertCurrency]);

  const unitRate = useMemo(() => {
    return convertCurrency(1, fromCurrency, toCurrency);
  }, [fromCurrency, toCurrency, convertCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatValue = (val: number, code: SupportedCurrency) => {
    const info = CURRENCY_MAP[code] || CURRENCY_MAP.INR;
    const formatted = val.toLocaleString("en-US", {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return info.position === "before" ? `${info.symbol}${formatted}` : `${formatted} ${info.symbol}`;
  };

  return (
    <div className="bg-white border border-earth-clay/15 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-earth-clay/10 pb-3">
        <h4 className="font-serif text-base font-bold text-earth-forest flex items-center gap-2">
          <Calculator className="h-4.5 w-4.5 text-earth-terracotta" />
          <span>Standalone Currency Converter</span>
        </h4>
        <span className="text-[9px] bg-earth-forest/10 text-earth-forest px-2 py-0.5 font-mono font-bold uppercase">
          Live Rates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end font-sans text-xs">
        {/* Amount Input */}
        <div className="md:col-span-3 space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-clay">
            Amount
          </label>
          <input
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs font-mono font-bold text-earth-charcoal focus:outline-none focus:border-earth-terracotta"
          />
        </div>

        {/* From Currency */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-clay">
            From
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value as SupportedCurrency)}
            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs font-semibold text-earth-charcoal focus:outline-none focus:border-earth-terracotta cursor-pointer"
          >
            <option value="INR">INR (₹ Rupee)</option>
            <option value="USD">USD ($ Dollar)</option>
            <option value="EUR">EUR (€ Euro)</option>
            <option value="GBP">GBP (£ Pound)</option>
            <option value="AED">AED (د.إ Dirham)</option>
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-0 flex justify-center pb-1">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Currencies"
            className="p-2.5 bg-earth-sand/50 hover:bg-earth-sand border border-earth-clay/20 text-earth-forest transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* To Currency */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-earth-clay">
            To
          </label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
            className="w-full p-2.5 bg-white border border-earth-clay/20 text-xs font-semibold text-earth-charcoal focus:outline-none focus:border-earth-terracotta cursor-pointer"
          >
            <option value="INR">INR (₹ Rupee)</option>
            <option value="USD">USD ($ Dollar)</option>
            <option value="EUR">EUR (€ Euro)</option>
            <option value="GBP">GBP (£ Pound)</option>
            <option value="AED">AED (د.إ Dirham)</option>
          </select>
        </div>
      </div>

      {/* Result Display Box */}
      <div className="bg-earth-sand/30 border border-earth-clay/15 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="text-[9px] uppercase font-bold text-earth-clay tracking-wider">
            Converted Value
          </span>
          <div className="font-mono text-xl md:text-2xl font-bold text-earth-forest">
            {formatValue(numericAmount, fromCurrency)} ={" "}
            <span className="text-earth-terracotta">{formatValue(convertedResult, toCurrency)}</span>
          </div>
        </div>

        <div className="text-center sm:text-right text-[10px] text-earth-clay font-mono space-y-0.5">
          <div>
            1 {fromCurrency} = {unitRate.toFixed(4)} {toCurrency}
          </div>
          <div className="text-[9px] text-earth-clay/60 font-light font-sans">
            Rates cached & revalidated every ~6 hours
          </div>
        </div>
      </div>
    </div>
  );
}
