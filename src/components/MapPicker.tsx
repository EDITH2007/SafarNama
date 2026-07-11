"use client";

import React, { useState, useRef } from "react";
import { MapPin, Compass } from "lucide-react";

interface MapPickerProps {
  onSelectLocation: (lat: number, lng: number, regionName: string) => void;
}

interface Hotspot {
  name: string;
  state: string;
  x: number; // percentage
  y: number; // percentage
  lat: number;
  lng: number;
}

const REGIONAL_HOTSPOTS: Hotspot[] = [
  { name: "Leh Valley", state: "Ladakh", x: 42, y: 12, lat: 34.1526, lng: 77.5771 },
  { name: "Munnar Hills", state: "Kerala", x: 38, y: 88, lat: 10.0889, lng: 77.0595 },
  { name: "Ancient Hampi", state: "Karnataka", x: 37, y: 72, lat: 15.3350, lng: 76.4600 },
  { name: "Gokarna Cliffs", state: "Karnataka", x: 32, y: 75, lat: 14.5479, lng: 74.3188 },
  { name: "Lonar Crater", state: "Maharashtra", x: 43, y: 55, lat: 19.9760, lng: 76.5073 },
  { name: "Kaziranga Plains", state: "Assam", x: 88, y: 35, lat: 26.5775, lng: 93.1711 },
  { name: "Gandikota Canyon", state: "Andhra Pradesh", x: 44, y: 76, lat: 15.0279, lng: 78.2878 },
  { name: "Valley of Flowers", state: "Uttarakhand", x: 48, y: 22, lat: 30.7280, lng: 79.6053 },
  { name: "Thar Dunes", state: "Rajasthan", x: 22, y: 34, lat: 26.9124, lng: 70.9083 },
  { name: "Pristine Havelock", state: "Andaman & Nicobar", x: 80, y: 85, lat: 12.0305, lng: 92.9876 }
];

export default function MapPicker({ onSelectLocation }: MapPickerProps) {
  const [marker, setMarker] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Convert screen coordinates to realistic India boundaries
    // Latitude range: ~8 N to ~37 N (Bottom to Top)
    // Longitude range: ~68 E to ~97 E (Left to Right)
    const lat = Number((37.6 - (y / 100) * (37.6 - 8.0)).toFixed(4));
    const lng = Number((68.7 + (x / 100) * (97.2 - 68.7)).toFixed(4));

    // Find if user clicked very close to an existing hotspot to snap it
    let regionName = `Coordinates (${lat}, ${lng})`;
    let snappedHotspot = REGIONAL_HOTSPOTS.find(
      (h) => Math.abs(h.x - x) < 3.5 && Math.abs(h.y - y) < 3.5
    );

    if (snappedHotspot) {
      regionName = `${snappedHotspot.name}, ${snappedHotspot.state}`;
      setMarker({
        x: snappedHotspot.x,
        y: snappedHotspot.y,
        lat: snappedHotspot.lat,
        lng: snappedHotspot.lng,
      });
      onSelectLocation(snappedHotspot.lat, snappedHotspot.lng, regionName);
      setSelectedRegionName(regionName);
    } else {
      setMarker({ x, y, lat, lng });
      onSelectLocation(lat, lng, regionName);
      setSelectedRegionName(regionName);
    }
  };

  const selectHotspot = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    const regionName = `${hotspot.name}, ${hotspot.state}`;
    setMarker({
      x: hotspot.x,
      y: hotspot.y,
      lat: hotspot.lat,
      lng: hotspot.lng,
    });
    onSelectLocation(hotspot.lat, hotspot.lng, regionName);
    setSelectedRegionName(regionName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="font-semibold text-earth-charcoal uppercase tracking-wider flex items-center space-x-1">
          <Compass className="h-4 w-4 text-earth-terracotta shrink-0 animate-spin" />
          <span>Interactive Location Coordinates Picker</span>
        </span>
        {selectedRegionName && (
          <span className="font-bold text-earth-terracotta bg-earth-terracotta/5 px-2 py-0.5 border border-earth-terracotta/10">
            Selected: {selectedRegionName}
          </span>
        )}
      </div>

      <div
        ref={mapRef}
        onClick={handleMapClick}
        className="relative aspect-[4/3] w-full bg-[#182a1d] overflow-hidden border border-earth-clay/15 cursor-crosshair group shadow-inner"
      >
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Abstract India Map Outline Styling */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="text-center space-y-2">
            <span className="font-serif font-black tracking-widest text-8xl text-earth-sand select-none uppercase leading-none block">
              Safar
            </span>
            <span className="font-serif font-black tracking-widest text-8xl text-earth-saffron select-none uppercase leading-none block">
              Nama
            </span>
          </div>
        </div>

        {/* Dynamic Hotspots mapping */}
        {REGIONAL_HOTSPOTS.map((hotspot) => (
          <button
            key={hotspot.name}
            type="button"
            onClick={(e) => selectHotspot(hotspot, e)}
            onMouseEnter={() => setHoveredHotspot(hotspot)}
            onMouseLeave={() => setHoveredHotspot(null)}
            className="absolute h-3 w-3 bg-earth-saffron border border-white rounded-full -translate-x-1/2 -translate-y-1/2 hover:scale-150 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none z-20 shadow-[0_0_10px_#d69e2e]"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          />
        ))}

        {/* Custom Marker Pin */}
        {marker && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 z-30 pointer-events-none text-earth-terracotta"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          >
            <div className="relative">
              <MapPin className="h-6 w-6 fill-earth-sand stroke-earth-terracotta filter drop-shadow-md animate-bounce" />
              {/* Pulsing ring underneath */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-1.5 bg-black/30 rounded-full blur-[1px] -z-10 animate-ping" />
            </div>
          </div>
        )}

        {/* Hotspot Tooltip */}
        {hoveredHotspot && (
          <div
            className="absolute bg-stone-900 border border-white/10 text-white p-2 text-[10px] font-sans pointer-events-none z-40 -translate-y-full -translate-x-1/2"
            style={{
              left: `${hoveredHotspot.x}%`,
              top: `${hoveredHotspot.y - 4}%`,
            }}
          >
            <div className="font-bold text-earth-saffron">{hoveredHotspot.name}</div>
            <div className="text-stone-300 font-light">{hoveredHotspot.state}</div>
            <div className="text-[8px] text-stone-400 font-mono mt-1">
              Lat: {hoveredHotspot.lat}, Lng: {hoveredHotspot.lng}
            </div>
          </div>
        )}

        {/* Instructions banner overlay */}
        <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-sm border border-white/5 px-2 py-1 text-[8px] font-sans text-earth-sand/70 uppercase tracking-widest pointer-events-none select-none">
          Click any spot or orange node on the map canvas to generate Lat/Lng coordinates
        </div>
      </div>
    </div>
  );
}
