"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { establishmentsApi } from "@/lib/api";
import { EstablishmentCard } from "@/components/reservation/EstablishmentCard";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import type { Establishment, PaginatedResponse } from "@/types/models";
import { clsx } from "clsx";
import {
  Hotel,
  Home,
  UtensilsCrossed,
  Tent,
  Star,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAds } from "@/hooks/useAds";
import { AdBanner } from "@/components/ads";

type TabType = "hotel" | "gite" | "restaurant" | "camp";

const TABS: Array<{
  type: TabType;
  label: string;
  icon: LucideIcon;
}> = [
  { type: "hotel", label: "Hôtels", icon: Hotel },
  { type: "gite", label: "Gîtes & Résidences", icon: Home },
  { type: "restaurant", label: "Restaurants", icon: UtensilsCrossed },
  { type: "camp", label: "Camps & Lodges", icon: Tent },
];

const STARS_OPTIONS = [
  { value: "", label: "Toutes catégories" },
  { value: "3", label: "3 étoiles +" },
  { value: "4", label: "4 étoiles +" },
  { value: "5", label: "5 étoiles" },
];

export default function ReservationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("hotel");
  const [stars, setStars] = useState("");
  const [selectedEstab, setSelectedEstab] = useState<Establishment | null>(
    null,
  );

  const { data: bannerAds } = useAds("banner", "reservation", 1);

  const { data, isLoading } = useQuery<PaginatedResponse<Establishment>>({
    queryKey: ["establishments", activeTab, stars],
    queryFn: async () => {
      const res = await establishmentsApi.list({
        type: activeTab,
        stars: stars ? Number(stars) : undefined,
        page: 1,
      });
      return res.data;
    },
  });

  const establishments = data?.data ?? [];

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="border-b border-sable-2 pt-10 pb-6">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-nuit">
            Hébergements
          </h1>
          <p className="text-gris mt-2">
            Hôtels, gîtes, restaurants et camps au Burkina Faso
          </p>
        </div>
      </div>

      {/* Tabs — Airbnb category bar */}
      <div className="bg-blanc border-b border-sable-2 sticky top-nav z-30 shadow-sm">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-center gap-8 overflow-x-auto py-4">
            {TABS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 pb-2 border-b-2 shrink-0 transition-colors",
                  activeTab === type
                    ? "border-nuit text-nuit"
                    : "border-transparent text-gris hover:text-nuit hover:border-sable-2",
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-xs font-medium whitespace-nowrap">
                  {label}
                </span>
              </button>
            ))}

            {/* Filter button */}
            <div className="ml-auto shrink-0">
              <div className="flex items-center gap-2 px-4 py-2 border border-sable-2 rounded-xl text-sm hover:shadow-sm transition-shadow">
                <SlidersHorizontal className="w-4 h-4 text-nuit" />
                <select
                  value={stars}
                  onChange={(e) => setStars(e.target.value)}
                  aria-label="Filtrer par catégorie d'étoiles"
                  className="bg-transparent text-nuit outline-none text-sm cursor-pointer"
                >
                  {STARS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      {bannerAds?.[0] && <AdBanner ad={bannerAds[0]} />}

      {/* Grid */}
      <div className="max-w-container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/3] rounded-xl skeleton mb-3" />
                <div className="h-4 w-2/3 skeleton rounded mb-2" />
                <div className="h-3 w-1/2 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : establishments.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4">
              <Hotel className="w-8 h-8 text-gris" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-nuit mb-2">
              Aucun établissement trouvé
            </h3>
            <p className="text-gris text-sm">
              Vous êtes propriétaire ?{" "}
              <a
                href="/register"
                className="text-rouge font-medium hover:underline"
              >
                Enregistrez votre établissement
              </a>
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gris mb-6">
              <span className="font-semibold text-nuit">
                {data?.total ?? 0}
              </span>{" "}
              établissement{(data?.total ?? 0) > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {establishments.map((e) => (
                <EstablishmentCard
                  key={e.id}
                  establishment={e}
                  onReserve={setSelectedEstab}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA pour propriétaires */}
      <div className="bg-sable py-16">
        <div className="max-w-container mx-auto px-6">
          <div className="bg-blanc rounded-2xl overflow-hidden border border-sable-2 flex flex-col md:flex-row">
            <div className="flex-1 p-10 md:p-14">
              <div className="w-12 h-12 rounded-xl bg-rouge/5 flex items-center justify-center mb-5">
                <Hotel className="w-6 h-6 text-rouge" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-nuit mb-3">
                Vous gérez un établissement ?
              </h2>
              <p className="text-gris mb-6 max-w-md leading-relaxed">
                Rejoignez plus de {data?.total ?? "..."} établissements qui font
                confiance à Faso Atlas pour atteindre les voyageurs du monde
                entier.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/register?role=owner"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rouge hover:bg-rouge-dark text-blanc font-semibold rounded-lg transition-colors"
                >
                  Enregistrer mon établissement
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="hidden md:block w-80 bg-gradient-to-br from-sable to-sable-2 p-10 flex-shrink-0">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-vert/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-vert" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nuit">
                      Visibilité
                    </p>
                    <p className="text-xs text-gris">
                      Touchez des milliers de voyageurs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-or/10 flex items-center justify-center">
                    <SlidersHorizontal
                      className="w-5 h-5 text-or"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nuit">Gestion</p>
                    <p className="text-xs text-gris">
                      Gérez vos réservations simplement
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rouge/10 flex items-center justify-center">
                    <Hotel className="w-5 h-5 text-rouge" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-nuit">Gratuit</p>
                    <p className="text-xs text-gris">
                      Aucun frais d'inscription
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation modal */}
      {selectedEstab && (
        <ReservationModal
          establishment={selectedEstab}
          onClose={() => setSelectedEstab(null)}
        />
      )}
    </div>
  );
}
