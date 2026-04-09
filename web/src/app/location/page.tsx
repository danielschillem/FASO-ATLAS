"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { carRentalsApi, mapApi } from "@/lib/api";
import { CarRentalCard } from "@/components/location/CarRentalCard";
import type { CarRental, PaginatedResponse, Region } from "@/types/models";
import { clsx } from "clsx";
import {
  Car,
  Sparkles,
  Truck,
  Crown,
  Wrench,
  Gauge,
  Phone,
  MessageCircle,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CategoryTab =
  | ""
  | "economique"
  | "confort"
  | "suv"
  | "luxe"
  | "utilitaire";

const TABS: Array<{ type: CategoryTab; label: string; icon: LucideIcon }> = [
  { type: "", label: "Toutes", icon: Car },
  { type: "economique", label: "Économique", icon: Gauge },
  { type: "confort", label: "Confort", icon: Sparkles },
  { type: "suv", label: "SUV / 4×4", icon: Truck },
  { type: "luxe", label: "Luxe", icon: Crown },
  { type: "utilitaire", label: "Utilitaire", icon: Wrench },
];

export default function LocationPage() {
  const [category, setCategory] = useState<CategoryTab>("");
  const [regionId, setRegionId] = useState("");
  const [contactCar, setContactCar] = useState<CarRental | null>(null);

  const { data: regionsData } = useQuery<Region[]>({
    queryKey: ["regions"],
    queryFn: async () => (await mapApi.getRegions()).data,
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery<PaginatedResponse<CarRental>>({
    queryKey: ["car-rentals", category, regionId],
    queryFn: async () => {
      const res = await carRentalsApi.list({
        category: category || undefined,
        regionId: regionId ? Number(regionId) : undefined,
        limit: 20,
      });
      return res.data;
    },
  });

  const cars = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="border-b border-sable-2 pt-10 pb-6">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-nuit">
            Location de voitures
          </h1>
          <p className="text-gris mt-2">
            Louez un véhicule pour explorer le Burkina Faso en toute liberté —
            du petit citadin au 4×4 tout-terrain.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-blanc border-b border-sable-2">
        <div className="max-w-container mx-auto px-6 py-4">
          <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setCategory(type)}
                className={clsx(
                  "flex flex-col items-center gap-2 pb-2 border-b-2 transition-colors shrink-0",
                  category === type
                    ? "border-nuit text-nuit"
                    : "border-transparent text-gris hover:text-nuit",
                )}
              >
                <Icon className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-xs font-medium whitespace-nowrap">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-blanc border-b border-sable-2 py-3">
        <div className="max-w-container mx-auto px-6 flex items-center gap-4">
          <select
            title="Filtrer par région"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="input-field max-w-[200px] text-sm"
          >
            <option value="">Toutes les régions</option>
            {regionsData?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gris">
            {total} véhicule{total > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[16/10] rounded-xl skeleton mb-3" />
                <div className="h-5 w-2/3 skeleton rounded mb-2" />
                <div className="h-3 w-1/2 skeleton rounded mb-2" />
                <div className="h-3 w-1/3 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-gris" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-nuit mb-2">
              Aucun véhicule disponible
            </h3>
            <p className="text-gris text-sm">
              Aucun véhicule disponible pour ces critères.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarRentalCard key={car.id} car={car} onContact={setContactCar} />
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactCar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-nuit/50 backdrop-blur-sm p-4"
          onClick={() => setContactCar(null)}
        >
          <div
            className="bg-blanc rounded-2xl shadow-modal max-w-sm w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-nuit">
                  {contactCar.brand} {contactCar.model}
                </h3>
                <p className="text-sm text-gris">
                  {contactCar.pricePerDay.toLocaleString("fr-FR")} FCFA / jour
                </p>
              </div>
              <button
                onClick={() => setContactCar(null)}
                className="p-1 hover:bg-sable rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gris" />
              </button>
            </div>

            <div className="space-y-3">
              {contactCar.phone && (
                <a
                  href={`tel:${contactCar.phone}`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-vert text-blanc font-semibold rounded-xl hover:bg-vert/90 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Appeler {contactCar.phone}
                </a>
              )}
              {contactCar.whatsapp && (
                <a
                  href={`https://wa.me/${contactCar.whatsapp.replace(/[^0-9]/g, "")}?text=Bonjour, je suis intéressé par la location du ${contactCar.brand} ${contactCar.model} sur Faso Atlas.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-[#25D366] text-blanc font-semibold rounded-xl hover:bg-[#25D366]/90 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
            </div>

            {contactCar.depositFcfa > 0 && (
              <p className="text-xs text-gris mt-4 text-center">
                Caution requise :{" "}
                {contactCar.depositFcfa.toLocaleString("fr-FR")} FCFA
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
