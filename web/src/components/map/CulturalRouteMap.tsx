"use client";

import { useEffect, useRef, useCallback } from "react";
import { Music2, Drama, Scissors } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Route definitions ────────────────────────────────────── */
export interface CulturalRoute {
  id: string;
  name: string;
  color: string;
  Icon: LucideIcon;
  emoji: string;
  description: string;
  sitesPhares: string; // GeoJSON filename
  autreSites?: string; // optional secondary sites
  sitesTouristiques: string;
  routes: string[]; // route line GeoJSON filenames
}

export const CULTURAL_ROUTES: CulturalRoute[] = [
  {
    id: "balafon",
    name: "Route du Balafon",
    color: "#FCD116",
    Icon: Music2,
    emoji: "\u{1F3B5}",
    description:
      "Le balafon, inscrit au patrimoine immatériel de l'UNESCO, résonne à travers les provinces du Houet, Kénédougou et Tuy. Découvrez les différentes traditions : Dioula, Senoufo, Sambla, Bwa…",
    sitesPhares: "balafon_sites_phares.json",
    autreSites: "balafon_autres_sites.json",
    sitesTouristiques: "balafon_sites_touristiques.json",
    routes: [
      "balafon_route_est.json",
      "balafon_route_ouest.json",
      "balafon_route_nord.json",
    ],
  },
  {
    id: "masques",
    name: "Route des Masques",
    color: "#006B3C",
    Icon: Drama,
    emoji: "\u{1F3AD}",
    description:
      "Les masques sacrés du Burkina Faso — en fibres, en feuilles ou en tissu — animent les cérémonies rituelles des peuples Bobo, Bwa et Senoufo dans la région Guiriko.",
    sitesPhares: "masques_principales.json",
    autreSites: "masques_autres.json",
    sitesTouristiques: "masques_sites_touristiques.json",
    routes: [
      "masques_route_est.json",
      "masques_route_ouest.json",
      "masques_route_nord.json",
    ],
  },
  {
    id: "tissu",
    name: "Route du Tissu",
    color: "#7C3BBF",
    Icon: Scissors,
    emoji: "\u{2702}\u{FE0F}",
    description:
      "Le Faso Danfani et le Bogolan racontent l'histoire textile du Burkina Faso. Suivez le fil du coton à travers les ateliers de tissage et teinture de l'Ouest.",
    sitesPhares: "tissu_sites_phares.json",
    sitesTouristiques: "tissu_sites_touristiques.json",
    routes: [
      "tissu_route_est.json",
      "tissu_route_ouest.json",
      "tissu_route_nord.json",
    ],
  },
];

/* ── Map component props ──────────────────────────────────── */
interface CulturalRouteMapProps {
  activeRoute: CulturalRoute;
  showSitesTouristiques?: boolean;
  showAutreSites?: boolean;
}

/* ── GeoJSON fetcher ──────────────────────────────────────── */
async function fetchGeoJSON(filename: string) {
  const res = await fetch(`/data/${filename}`);
  if (!res.ok) return null;
  return res.json();
}

function buildMarkerSvg(color: string): string {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 13.5C13.933 13.5 15.5 11.933 15.5 10C15.5 8.067 13.933 6.5 12 6.5C10.067 6.5 8.5 8.067 8.5 10C8.5 11.933 10.067 13.5 12 13.5Z" stroke="white" stroke-width="1.8"/>
    <path d="M12 21C12 21 5 15.25 5 10A7 7 0 1 1 19 10C19 15.25 12 21 12 21Z" stroke="white" stroke-width="1.8"/>
  </svg>`;
}

/* ── Extract display name for a feature ───────────────────── */
function featureName(props: Record<string, unknown>): string {
  return (
    (props.name as string) ||
    (props.Nom as string) ||
    (props.LOCALITE as string) ||
    (props.Commune_Ph as string) ||
    (props.COMMUNE as string) ||
    (props.Commune as string) ||
    "Site"
  );
}

function featureType(props: Record<string, unknown>): string {
  return (
    (props.TYPE as string) ||
    (props.TYPES as string) ||
    (props.CATEGORIE as string) ||
    ""
  );
}

function featureProvince(props: Record<string, unknown>): string {
  return (props.Province as string) || (props.PROVINCE as string) || "";
}

/* ── Extract image URL from uMap description ──────────────── */
function extractImage(props: Record<string, unknown>): string | null {
  const img = props.Image as string | undefined;
  if (img && img.startsWith("http")) return img;
  const desc = (props.description as string) || "";
  const match = desc.match(/\{\{(https?:\/\/[^}]+)\}\}/);
  return match ? match[1] : null;
}

/* ── Component ────────────────────────────────────────────── */
export default function CulturalRouteMap({
  activeRoute,
  showSitesTouristiques = true,
  showAutreSites = false,
}: CulturalRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup[]>([]);

  /* Clear all layers */
  const clearLayers = useCallback(() => {
    layersRef.current.forEach((lg) => lg.clearLayers());
    layersRef.current = [];
  }, []);

  /* Initialize map once */
  useEffect(() => {
    if (!mapRef.current) return;

    let destroyed = false;

    const init = async () => {
      const L = (await import("leaflet")).default;

      if (destroyed || !mapRef.current) return;

      // Cleanup previous
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      // Center on Hauts-Bassins region
      const map = L.map(mapRef.current, {
        center: [11.2, -4.3],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      mapInstance.current = map;
    };

    init();

    return () => {
      destroyed = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  /* Load route data whenever activeRoute changes */
  useEffect(() => {
    if (!mapInstance.current) return;

    let cancelled = false;

    const loadData = async () => {
      const L = (await import("leaflet")).default;
      const map = mapInstance.current!;

      clearLayers();

      const route = activeRoute;
      const color = route.color;

      /* ── Route lines ──────────────────────────────────── */
      for (const routeFile of route.routes) {
        const data = await fetchGeoJSON(routeFile);
        if (!data || cancelled) continue;

        const layer = L.geoJSON(data, {
          style: () => ({
            color,
            weight: 4,
            opacity: 0.8,
            dashArray: routeFile.includes("circuit") ? undefined : "8 6",
          }),
        }).addTo(map);
        layersRef.current.push(layer);
      }

      /* ── Sites phares (main markers) ──────────────────── */
      const sitesData = await fetchGeoJSON(route.sitesPhares);
      if (sitesData && !cancelled) {
        const layer = L.geoJSON(sitesData, {
          pointToLayer: (_feature, latlng) => {
            return L.marker(latlng, {
              icon: L.divIcon({
                className: "",
                html: `<div style="
                  width:36px;height:36px;border-radius:50%;
                  background:${color};border:3px solid white;
                  box-shadow:0 2px 8px rgba(0,0,0,.35);
                  display:flex;align-items:center;justify-content:center;
                  cursor:pointer;
                  transition:transform .2s;
                " onmouseenter="this.style.transform='scale(1.2)'"
                   onmouseleave="this.style.transform='scale(1)'"
                >
                  ${buildMarkerSvg(color)}
                </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
              }),
            });
          },
          onEachFeature: (feature, featureLayer) => {
            const p = feature.properties || {};
            const name = featureName(p);
            const type = featureType(p);
            const province = featureProvince(p);
            const img = extractImage(p);

            featureLayer.bindPopup(
              `<div style="min-width:200px;font-family:var(--font-sans),sans-serif;">
                ${img ? `<img src="${encodeURI(img)}" alt="${name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;margin:-14px -20px 8px -20px;width:calc(100% + 40px);" onerror="this.style.display='none'" />` : ""}
                <p style="font-weight:700;font-size:14px;margin:0 0 4px;">${name}</p>
                ${type ? `<p style="font-size:12px;color:#717171;margin:0 0 2px;">${type}</p>` : ""}
                ${province ? `<p style="font-size:11px;color:#B0B0B0;margin:0;">Province : ${province}</p>` : ""}
              </div>`,
              { maxWidth: 280 },
            );
          },
        }).addTo(map);
        layersRef.current.push(layer);
      }

      /* ── Sites touristiques ───────────────────────────── */
      if (showSitesTouristiques) {
        const touristData = await fetchGeoJSON(route.sitesTouristiques);
        if (touristData && !cancelled) {
          const layer = L.geoJSON(touristData, {
            pointToLayer: (_feature, latlng) => {
              return L.marker(latlng, {
                icon: L.divIcon({
                  className: "",
                  html: `<div style="
                    width:24px;height:24px;border-radius:50%;
                    background:white;border:2px solid ${color};
                    box-shadow:0 1px 4px rgba(0,0,0,.25);
                    display:flex;align-items:center;justify-content:center;
                    font-size:12px;cursor:pointer;
                  "><span style="color:${color};font-weight:bold;">T</span></div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                }),
              });
            },
            onEachFeature: (feature, featureLayer) => {
              const p = feature.properties || {};
              const name = featureName(p);
              featureLayer.bindPopup(
                `<div style="font-family:var(--font-sans),sans-serif;">
                  <p style="font-weight:600;font-size:13px;margin:0;">${name}</p>
                  <p style="font-size:11px;color:#717171;margin:2px 0 0;">Site touristique</p>
                </div>`,
              );
            },
          }).addTo(map);
          layersRef.current.push(layer);
        }
      }

      /* ── Autres sites (small dots) ────────────────────── */
      if (showAutreSites && route.autreSites) {
        const autresData = await fetchGeoJSON(route.autreSites);
        if (autresData && !cancelled) {
          const layer = L.geoJSON(autresData, {
            pointToLayer: (_feature, latlng) => {
              return L.circleMarker(latlng, {
                radius: 5,
                fillColor: color,
                fillOpacity: 0.5,
                color: color,
                weight: 1,
                opacity: 0.7,
              });
            },
            onEachFeature: (feature, featureLayer) => {
              const p = feature.properties || {};
              const name = featureName(p);
              const type = featureType(p);
              featureLayer.bindPopup(
                `<div style="font-family:var(--font-sans),sans-serif;">
                  <p style="font-weight:600;font-size:12px;margin:0;">${name}</p>
                  ${type ? `<p style="font-size:11px;color:#717171;margin:2px 0 0;">${type}</p>` : ""}
                </div>`,
              );
            },
          }).addTo(map);
          layersRef.current.push(layer);
        }
      }

      /* ── Fit bounds to all loaded data ────────────────── */
      if (!cancelled && layersRef.current.length > 0) {
        const allBounds = L.featureGroup(layersRef.current);
        const bounds = allBounds.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 11 });
        }
      }
    };

    // Slight delay to let the map fully render
    const timer = setTimeout(loadData, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeRoute, showSitesTouristiques, showAutreSites, clearLayers]);

  return (
    <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-card" />
  );
}
