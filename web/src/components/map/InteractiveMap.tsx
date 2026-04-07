"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapApi } from "@/lib/api";
import type { GeoJSONCollection, MapFeature, PlaceType } from "@/types/models";
import { clsx } from "clsx";

const PIN_COLORS: Record<PlaceType, string> = {
  site: "#C1272D",
  hotel: "#006B3C",
  nature: "#D4A017",
  culture: "#7C3BBF",
};

const PIN_LABELS: Record<PlaceType, string> = {
  site: "Sites touristiques",
  hotel: "Hébergements",
  nature: "Nature & Réserves",
  culture: "Culture & Arts",
};

type FilterType = PlaceType | "all";

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<import("leaflet").Map | null>(null);
  const markersLayer = useRef<import("leaflet").LayerGroup | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(
    null,
  );

  const { data: geojson, isLoading } = useQuery<GeoJSONCollection>({
    queryKey: ["map-places", activeFilter],
    queryFn: async () => {
      const res = await mapApi.getPlaces({
        type: activeFilter === "all" ? undefined : activeFilter,
      });
      return res.data;
    },
  });

  // Initialize Leaflet (client-only)
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Burkina Faso center: ~12.3°N, -1.5°W
      leafletMap.current = L.map(mapRef.current!, {
        center: [12.3647, -1.5334],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(leafletMap.current);

      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    };

    initMap();

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!geojson || !leafletMap.current || !markersLayer.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      markersLayer.current!.clearLayers();

      geojson.features.forEach((feature) => {
        const { properties, geometry } = feature;
        const [lng, lat] = geometry.coordinates;
        const color = PIN_COLORS[properties.type];

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:32px; height:32px; border-radius:50%;
              background:${color}; border:2.5px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,.3);
              display:flex; align-items:center; justify-content:center;
              cursor:pointer; transition:transform .2s;
            " onmouseenter="this.style.transform='scale(1.25)'" onmouseleave="this.style.transform='scale(1)'">
              <span style="color:white;font-size:11px;font-weight:bold;font-family:Outfit,sans-serif;">
                ${properties.type === "site" ? "★" : properties.type === "hotel" ? "⌂" : properties.type === "nature" ? "♣" : "♦"}
              </span>
            </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([lat, lng], { icon })
          .on("click", () => setSelectedFeature(feature))
          .addTo(markersLayer.current!);
      });
    };

    updateMarkers();
  }, [geojson]);

  return (
    <div className="flex h-[calc(100vh-72px)] mt-nav overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-blanc border-r border-sable-2 flex flex-col overflow-y-auto shrink-0">
        <div className="p-4 border-b border-sable-2">
          <h2 className="font-serif text-xl text-nuit mb-1">
            Carte interactive
          </h2>
          <p className="text-xs text-gris">Burkina Faso · 13 régions</p>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-gris uppercase tracking-wider mb-3">
            Filtrer par type
          </p>
          <button
            onClick={() => setActiveFilter("all")}
            className={clsx(
              "w-full text-left px-3 py-2 rounded text-sm transition-colors",
              activeFilter === "all"
                ? "bg-nuit text-blanc"
                : "text-nuit hover:bg-sable",
            )}
          >
            Tous les lieux
          </button>
          {(Object.keys(PIN_COLORS) as PlaceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2",
                activeFilter === type
                  ? "bg-nuit text-blanc"
                  : "text-nuit hover:bg-sable",
              )}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: PIN_COLORS[type] }}
              />
              {PIN_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Selected place detail */}
        {selectedFeature && (
          <div className="mt-auto border-t border-sable-2 p-4">
            <div
              className="rounded-card p-3 text-blanc text-sm mb-2"
              style={{
                background: `linear-gradient(135deg, ${PIN_COLORS[selectedFeature.properties.type]}, #160A00)`,
              }}
            >
              <p className="font-semibold">{selectedFeature.properties.name}</p>
              <p className="text-xs opacity-80">
                {selectedFeature.properties.region}
              </p>
            </div>
            <p className="text-xs text-gris line-clamp-3">
              {selectedFeature.properties.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-or text-sm">
                ★ {selectedFeature.properties.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gris">
                ({selectedFeature.properties.reviewCount} avis)
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Map container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-blanc/70">
            <div className="w-8 h-8 border-2 border-rouge border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
