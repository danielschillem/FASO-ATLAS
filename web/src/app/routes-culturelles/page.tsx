"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { clsx } from "clsx";
import {
  CULTURAL_ROUTES,
  type CulturalRoute,
} from "@/components/map/CulturalRouteMap";
import { MapPin, Eye, EyeOff, ExternalLink } from "lucide-react";

const CulturalRouteMap = dynamic(
  () => import("@/components/map/CulturalRouteMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-sable rounded-card">
        <div className="w-8 h-8 border-2 border-rouge border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
);

const UMAP_LINKS: Record<string, string> = {
  balafon: "https://umap.openstreetmap.fr/fr/map/route-du-balafon_906480",
  masques: "https://umap.openstreetmap.fr/fr/map/route-des-masques_900177",
  tissu: "https://umap.openstreetmap.fr/fr/map/route-du-tissu_902686",
};

export default function RoutesCulturellesPage() {
  const [activeRoute, setActiveRoute] = useState<CulturalRoute>(
    CULTURAL_ROUTES[0],
  );
  const [showTourist, setShowTourist] = useState(true);
  const [showOthers, setShowOthers] = useState(false);

  return (
    <main className="mt-nav min-h-screen bg-sable">
      {/* Hero Section */}
      <section className="bg-nuit text-blanc py-16">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <p className="text-or text-sm font-medium uppercase tracking-wider mb-3">
            Patrimoine culturel
          </p>
          <h1 className="font-serif text-display-sm md:text-display text-blanc mb-4">
            Routes culturelles
          </h1>
          <p className="text-gris-light max-w-2xl text-lg leading-relaxed">
            Explorez trois itinéraires patrimoniaux uniques à travers la région
            des Hauts-Bassins — du son du balafon aux masques sacrés, en passant
            par le tissage du Faso Danfani.
          </p>
        </div>
      </section>

      {/* Route Selector Tabs */}
      <div className="max-w-container mx-auto px-4 sm:px-6 -mt-6">
        <div className="flex flex-wrap gap-3">
          {CULTURAL_ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => setActiveRoute(route)}
              className={clsx(
                "flex items-center gap-2 px-5 py-3 rounded-pill text-sm font-medium",
                "transition-all duration-200 shadow-card",
                activeRoute.id === route.id
                  ? "text-blanc scale-105"
                  : "bg-blanc text-nuit hover:shadow-card-hover hover:scale-[1.02]",
              )}
              style={
                activeRoute.id === route.id
                  ? { backgroundColor: route.color }
                  : undefined
              }
            >
              <span className="text-lg">
                <route.Icon className="w-5 h-5" />
              </span>
              {route.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Info Layout */}
      <div className="max-w-container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Map */}
          <div className="bg-blanc rounded-card shadow-card overflow-hidden h-[300px] sm:h-[450px] lg:h-[620px]">
            <CulturalRouteMap
              activeRoute={activeRoute}
              showSitesTouristiques={showTourist}
              showAutreSites={showOthers}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Route info card */}
            <div
              className="rounded-card p-6 text-blanc"
              style={{
                background: `linear-gradient(135deg, ${activeRoute.color}, #160A00)`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">
                  <activeRoute.Icon className="w-8 h-8" />
                </span>
                <h2 className="font-serif text-xl font-bold">
                  {activeRoute.name}
                </h2>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                {activeRoute.description}
              </p>
              <a
                href={UMAP_LINKS[activeRoute.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-4 text-xs opacity-70 hover:opacity-100 transition-opacity underline"
              >
                Voir sur uMap <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Layer toggles */}
            <div className="bg-blanc rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-nuit mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Couches
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-brun cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ backgroundColor: activeRoute.color }}
                    >
                      <svg
                        className="w-3 h-3 text-blanc"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  Sites phares
                  <span
                    className="ml-auto w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeRoute.color }}
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-brun cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTourist}
                    onChange={() => setShowTourist(!showTourist)}
                    className="sr-only"
                  />
                  <div
                    className={clsx(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      showTourist
                        ? "border-transparent"
                        : "border-gris-light bg-blanc",
                    )}
                    style={
                      showTourist
                        ? { backgroundColor: activeRoute.color }
                        : undefined
                    }
                  >
                    {showTourist && (
                      <svg
                        className="w-3 h-3 text-blanc"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  Sites touristiques
                  {showTourist ? (
                    <Eye className="w-3.5 h-3.5 ml-auto text-gris" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 ml-auto text-gris-light" />
                  )}
                </label>

                {activeRoute.autreSites && (
                  <label className="flex items-center gap-3 text-sm text-brun cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOthers}
                      onChange={() => setShowOthers(!showOthers)}
                      className="sr-only"
                    />
                    <div
                      className={clsx(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        showOthers
                          ? "border-transparent"
                          : "border-gris-light bg-blanc",
                      )}
                      style={
                        showOthers
                          ? { backgroundColor: activeRoute.color }
                          : undefined
                      }
                    >
                      {showOthers && (
                        <svg
                          className="w-3 h-3 text-blanc"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    Toutes les localités
                    {showOthers ? (
                      <Eye className="w-3.5 h-3.5 ml-auto text-gris" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 ml-auto text-gris-light" />
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-blanc rounded-card shadow-card p-5">
              <h3 className="text-sm font-semibold text-nuit mb-3">Légende</h3>
              <div className="space-y-2 text-xs text-brun">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: activeRoute.color }}
                  >
                    <span className="text-blanc">
                      <activeRoute.Icon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  Site phare
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: activeRoute.color }}
                  >
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: activeRoute.color }}
                    >
                      T
                    </span>
                  </div>
                  Site touristique
                </div>
                {activeRoute.autreSites && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 flex justify-center">
                      <div
                        className="w-3 h-3 rounded-full opacity-50"
                        style={{ backgroundColor: activeRoute.color }}
                      />
                    </div>
                    Autre localité
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-6 flex justify-center">
                    <div
                      className="w-6 h-0.5"
                      style={{
                        backgroundColor: activeRoute.color,
                        borderTop: `2px dashed ${activeRoute.color}`,
                      }}
                    />
                  </div>
                  Tracé de la route
                </div>
              </div>
            </div>

            {/* Source */}
            <p className="text-[11px] text-gris px-1">
              Données : uMap / OpenStreetMap · Ministère de la Culture du
              Burkina Faso
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
