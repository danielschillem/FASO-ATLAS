"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapApi } from "@/lib/api";
import type { Region } from "@/types/models";
import {
  SlidersHorizontal,
  Star,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { clsx } from "clsx";

export interface BookingFilters {
  type: string;
  stars: string;
  regionId: string;
  priceMin: string;
  priceMax: string;
  amenities: string[];
  sort: string;
}

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "hotel", label: "Hôtels" },
  { value: "gite", label: "Gîtes & Résidences" },
  { value: "restaurant", label: "Restaurants" },
  { value: "camp", label: "Camps & Lodges" },
];

const STAR_OPTIONS = [5, 4, 3, 2, 1];

const AMENITY_LIST = [
  "WiFi",
  "Piscine",
  "Restaurant",
  "Parking",
  "Climatisation",
  "Bar",
  "Spa",
  "Gym",
];

const PRICE_RANGES = [
  { label: "0 – 15 000 FCFA", min: "0", max: "15000" },
  { label: "15 000 – 35 000 FCFA", min: "15000", max: "35000" },
  { label: "35 000 – 75 000 FCFA", min: "35000", max: "75000" },
  { label: "75 000+ FCFA", min: "75000", max: "" },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommandés" },
  { value: "price_asc", label: "Prix (croissant)" },
  { value: "price_desc", label: "Prix (décroissant)" },
  { value: "rating", label: "Les mieux notés" },
  { value: "stars_desc", label: "Étoiles (décroissant)" },
];

interface Props {
  filters: BookingFilters;
  onChange: (f: BookingFilters) => void;
  total: number;
  className?: string;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-sable-2 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-nuit mb-3"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-gris" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gris" />
        )}
      </button>
      {open && children}
    </div>
  );
}

export function BookingFiltersPanel({
  filters,
  onChange,
  total,
  className,
}: Props) {
  const { data: regions } = useQuery<Region[]>({
    queryKey: ["regions"],
    queryFn: async () => (await mapApi.getRegions()).data,
    staleTime: Infinity,
  });

  const activeCount = [
    filters.type,
    filters.stars,
    filters.regionId,
    filters.priceMin || filters.priceMax,
    filters.amenities.length > 0 ? "a" : "",
  ].filter(Boolean).length;

  const reset = () =>
    onChange({
      type: "",
      stars: "",
      regionId: "",
      priceMin: "",
      priceMax: "",
      amenities: [],
      sort: "recommended",
    });

  const toggleAmenity = (a: string) => {
    const lower = a.toLowerCase();
    const current = filters.amenities;
    onChange({
      ...filters,
      amenities: current.includes(lower)
        ? current.filter((x) => x !== lower)
        : [...current, lower],
    });
  };

  return (
    <aside
      className={clsx(
        "bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-5",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-nuit" />
          <span className="font-bold text-nuit">Filtrer par :</span>
        </div>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-rouge hover:text-rouge-dark font-medium"
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>

      <p className="text-xs text-gris mb-4">
        <span className="font-semibold text-nuit">{total}</span> établissement
        {total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
      </p>

      {/* Sort */}
      <FilterSection title="Trier par">
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          aria-label="Trier par"
          className="w-full text-sm border border-sable-2 rounded-lg px-3 py-2 outline-none focus:border-nuit transition-colors"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Type */}
      <FilterSection title="Type d'hébergement">
        <div className="space-y-2">
          {TYPE_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={filters.type === value}
                onChange={() => onChange({ ...filters, type: value })}
                className="accent-rouge"
              />
              <span className="text-nuit">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Stars */}
      <FilterSection title="Classement par étoiles">
        <div className="space-y-2">
          {STAR_OPTIONS.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={filters.stars === String(s)}
                onChange={() =>
                  onChange({
                    ...filters,
                    stars: filters.stars === String(s) ? "" : String(s),
                  })
                }
                className="accent-rouge"
              />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: s }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-or text-or" />
                ))}
              </span>
              <span className="text-gris">
                {s} étoile{s > 1 ? "s" : ""}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Budget par nuit">
        <div className="space-y-2">
          {PRICE_RANGES.map(({ label, min, max }) => {
            const active = filters.priceMin === min && filters.priceMax === max;
            return (
              <label
                key={label}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="price"
                  checked={active}
                  onChange={() =>
                    onChange({
                      ...filters,
                      priceMin: active ? "" : min,
                      priceMax: active ? "" : max,
                    })
                  }
                  className="accent-rouge"
                />
                <span className="text-nuit">{label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Region */}
      {regions && regions.length > 0 && (
        <FilterSection title="Région" defaultOpen={false}>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="region"
                value=""
                checked={!filters.regionId}
                onChange={() => onChange({ ...filters, regionId: "" })}
                className="accent-rouge"
              />
              <span className="text-nuit">Toutes</span>
            </label>
            {regions.map((r) => (
              <label
                key={r.id}
                className="flex items-center gap-2 cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="region"
                  value={r.id}
                  checked={filters.regionId === String(r.id)}
                  onChange={() =>
                    onChange({ ...filters, regionId: String(r.id) })
                  }
                  className="accent-rouge"
                />
                <span className="text-nuit">{r.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Amenities */}
      <FilterSection title="Équipements" defaultOpen={false}>
        <div className="space-y-2">
          {AMENITY_LIST.map((a) => (
            <label
              key={a}
              className="flex items-center gap-2 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={filters.amenities.includes(a.toLowerCase())}
                onChange={() => toggleAmenity(a)}
                className="accent-rouge"
              />
              <span className="text-nuit">{a}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
