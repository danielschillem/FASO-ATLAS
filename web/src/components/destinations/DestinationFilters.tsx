"use client";

import { clsx } from "clsx";

export type DestinationFilter = {
  type: string;
  regionId: string;
  sort: string;
};

const TYPES = [
  { value: "", label: "Tous" },
  { value: "site", label: "Sites touristiques" },
  { value: "nature", label: "Nature & Réserves" },
  { value: "culture", label: "Culture & Arts" },
  { value: "hotel", label: "Hébergements" },
];

const SORTS = [
  { value: "rating", label: "Mieux notés" },
  { value: "name", label: "Alphabétique" },
  { value: "newest", label: "Plus récents" },
];

interface Props {
  filters: DestinationFilter;
  onChange: (f: DestinationFilter) => void;
  regions: Array<{ id: number; name: string }>;
  total: number;
}

export function DestinationFilters({
  filters,
  onChange,
  regions,
  total,
}: Props) {
  const set = (key: keyof DestinationFilter, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="bg-blanc border-b border-sable-2 py-4 sticky top-nav z-30 shadow-sm">
      <div className="max-w-container mx-auto px-6 flex flex-wrap items-center gap-3">
        {/* Type filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set("type", value)}
              className={clsx(
                "btn-pill",
                filters.type === value
                  ? "btn-pill-active"
                  : "btn-pill-inactive",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-sable-2 hidden sm:block" />

        {/* Region filter */}
        <select
          title="Filtrer par région"
          value={filters.regionId}
          onChange={(e) => set("regionId", e.target.value)}
          className="px-4 py-2.5 bg-blanc border border-sable-2 rounded-lg text-sm text-nuit focus:outline-none focus:border-nuit"
        >
          <option value="">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r.id} value={String(r.id)}>
              {r.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          title="Trier les résultats"
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value)}
          className="px-4 py-2.5 bg-blanc border border-sable-2 rounded-lg text-sm text-nuit focus:outline-none focus:border-nuit"
        >
          {SORTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-gris hidden sm:block">
          <span className="font-semibold text-nuit">{total}</span> résultat
          {total > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
