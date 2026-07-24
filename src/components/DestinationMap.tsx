"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Destination } from "@/app/data/mockData";

interface DestinationMapProps {
  destinations: Destination[];
  activeDestinationId: string | null;
}

// Component to handle dynamic map recentering / flying when active destination changes
function MapRecenter({ activeDest }: { activeDest: Destination | null }) {
  const map = useMap();

  useEffect(() => {
    if (activeDest && activeDest.geo) {
      map.flyTo([activeDest.geo.lat, activeDest.geo.lng], 7, {
        duration: 1.2,
      });
    }
  }, [activeDest, map]);

  return null;
}

export default function DestinationMap({
  destinations,
  activeDestinationId,
}: DestinationMapProps) {
  // Find currently active destination if any
  const activeDest = useMemo(() => {
    if (!activeDestinationId) return null;
    return destinations.find((d) => d.id === activeDestinationId) || null;
  }, [activeDestinationId, destinations]);

  // Create custom marker icons
  const createCustomIcon = (isActive: boolean) => {
    if (typeof window === "undefined") return null as any;

    return L.divIcon({
      html: `
        <div class="custom-marker-wrapper ${isActive ? "marker-bounce-active" : ""}" style="width: 32px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.25));">
            <!-- Teardrop Pin Body -->
            <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="#c05621" stroke="#fdfbf7" stroke-width="2"/>
            <!-- Inner white dot representing the pin center -->
            <circle cx="16" cy="16" r="6" fill="#fdfbf7" />
          </svg>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [32, 44],
      iconAnchor: [16, 44],
      popupAnchor: [0, -42],
    });
  };

  const handleMarkerClick = (destId: string) => {
    const cardElement = document.getElementById(`dest-card-${destId}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-earth-clay/10 shadow-lg relative z-10 bg-white">
      {/* Embed local animation CSS */}
      <style>{`
        @keyframes marker-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
        }
        .marker-bounce-active {
          animation: marker-bounce 0.6s ease-out infinite;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {destinations.map((dest) => {
          if (!dest.geo || typeof dest.geo.lat !== "number" || typeof dest.geo.lng !== "number") {
            return null;
          }

          const isActive = dest.id === activeDestinationId;

          return (
            <Marker
              key={dest.id}
              position={[dest.geo.lat, dest.geo.lng]}
              icon={createCustomIcon(isActive)}
              eventHandlers={{
                click: () => handleMarkerClick(dest.id),
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 max-w-[220px] font-sans text-earth-charcoal">
                  {dest.photos && dest.photos[0] && (
                    <img
                      src={dest.photos[0]}
                      alt={dest.title}
                      className="w-full h-24 object-cover rounded border border-earth-clay/5"
                    />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-earth-forest leading-tight">
                      {dest.title}
                    </h4>
                    <p className="text-[11px] text-earth-clay font-medium uppercase tracking-wider">
                      {dest.location}
                    </p>
                    <p className="text-xs text-earth-charcoal/70 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapRecenter activeDest={activeDest} />
      </MapContainer>
    </div>
  );
}
