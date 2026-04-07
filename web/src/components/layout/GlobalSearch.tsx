"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchApi } from "@/lib/api";
import type { SearchResults } from "@/types/models";
import { clsx } from "clsx";
import Link from "next/link";

const TYPE_COLORS = {
  site: "#C1272D",
  hotel: "#006B3C",
  nature: "#D4A017",
  culture: "#7C3BBF",
};
const CATEGORY_FILTERS = [
  { value: "", label: "Tout" },
  { value: "place", label: "Lieux" },
  { value: "establishment", label: "Séjours" },
  { value: "wiki", label: "Wiki" },
  { value: "itinerary", label: "Itinéraires" },
];

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalResults = results
    ? (results.places?.length ?? 0) +
      (results.establishments?.length ?? 0) +
      (results.wiki?.length ?? 0) +
      (results.itineraries?.length ?? 0)
    : 0;

  const search = useCallback(async (q: string, cat: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await searchApi.search(q, cat || undefined);
      setResults(res.data);
      setOpen(true);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value, category), 320);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="sticky top-nav z-40 bg-sable/90 backdrop-blur-sm border-b border-sable-2 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gris"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => totalResults > 0 && setOpen(true)}
            onKeyDown={handleEnter}
            placeholder="Rechercher un lieu, une étape, un article…"
            aria-label="Rechercher parmi les lieux, étapes et articles"
            className="w-full pl-9 pr-10 py-2 bg-blanc border border-sable-2 rounded text-sm text-nuit focus:outline-none focus:border-or placeholder:text-gris"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-rouge border-t-transparent rounded-full animate-spin" />
          )}
          {query && !loading && (
            <button
              onClick={() => {
                setQuery("");
                setResults(null);
                setOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gris hover:text-nuit"
              aria-label="Effacer la recherche"
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="hidden sm:flex items-center gap-1.5">
          {CATEGORY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setCategory(value);
                if (query.trim().length >= 2) search(query, value);
              }}
              className={clsx(
                "px-3 py-1.5 rounded-pill text-xs font-medium transition-colors",
                category === value
                  ? "bg-rouge text-blanc"
                  : "bg-blanc text-nuit border border-sable-2 hover:border-or/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown results */}
      {open && results && totalResults > 0 && (
        <div
          className="absolute left-0 right-0 bg-blanc border-b border-sable-2 shadow-faso max-h-80 overflow-y-auto"
          role="region"
          aria-label="Résultats de recherche"
          aria-live="polite"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 divide-y divide-sable-2">
            {/* Places */}
            {(results.places?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-medium uppercase tracking-wider mb-2">
                  Lieux
                </p>
                {results.places!.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/destinations/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-1.5 hover:bg-sable rounded px-2 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: TYPE_COLORS[p.type] ?? "#8A7060",
                      }}
                    />
                    <span className="text-sm text-nuit flex-1">{p.name}</span>
                    <span className="text-xs text-gris">{p.region?.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Establishments */}
            {(results.establishments?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-medium uppercase tracking-wider mb-2">
                  Hébergements
                </p>
                {results.establishments!.slice(0, 3).map((e) => (
                  <Link
                    key={e.id}
                    href={`/reservation`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-1.5 hover:bg-sable rounded px-2 transition-colors"
                  >
                    <span className="text-sm">🏨</span>
                    <span className="text-sm text-nuit flex-1">
                      {e.place?.name}
                    </span>
                    <span className="text-xs text-vert">
                      {e.priceMinFcfa?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Wiki */}
            {(results.wiki?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-medium uppercase tracking-wider mb-2">
                  Wiki Faso
                </p>
                {results.wiki!.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={`/wiki/${a.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-1.5 hover:bg-sable rounded px-2 transition-colors"
                  >
                    <span className="text-sm">📖</span>
                    <span className="text-sm text-nuit flex-1">{a.title}</span>
                    <span className="text-xs text-gris">{a.category}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Itineraries */}
            {(results.itineraries?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-medium uppercase tracking-wider mb-2">
                  Itinéraires
                </p>
                {results.itineraries!.slice(0, 3).map((it) => (
                  <Link
                    key={it.id}
                    href={`/itineraires/${it.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-1.5 hover:bg-sable rounded px-2 transition-colors"
                  >
                    <span className="text-sm">🗺️</span>
                    <span className="text-sm text-nuit flex-1">{it.title}</span>
                    <span className="text-xs text-gris">
                      {it.durationDays}j
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No results */}
      {open && query.trim().length >= 2 && !loading && totalResults === 0 && (
        <div className="absolute left-0 right-0 bg-blanc border-b border-sable-2 shadow-faso py-6 text-center text-sm text-gris">
          Aucun résultat pour « {query} »
        </div>
      )}
    </div>
  );
}
