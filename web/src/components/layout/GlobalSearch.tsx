"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchApi } from "@/lib/api";
import type { SearchResults } from "@/types/models";
import { clsx } from "clsx";
import Link from "next/link";
import { Hotel, BookOpen, Map, X, Search, MapPin } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  site: "#E63946",
  hotel: "#008751",
  nature: "#F0B429",
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
      className="sticky top-nav z-40 bg-blanc border-b border-sable-2"
    >
      <div className="max-w-container mx-auto px-6 py-3 flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gris w-4 h-4"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => totalResults > 0 && setOpen(true)}
            onKeyDown={handleEnter}
            placeholder="Rechercher un lieu, un séjour, un article…"
            aria-label="Rechercher"
            className="w-full pl-10 pr-10 py-2.5 bg-sable border border-sable-2 rounded-full text-sm text-nuit focus:outline-none focus:border-nuit focus:bg-blanc placeholder:text-gris-light transition-colors"
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
              <X className="w-4 h-4" aria-hidden="true" />
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
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                category === value
                  ? "bg-nuit text-blanc"
                  : "text-gris hover:text-nuit hover:bg-sable border border-transparent hover:border-sable-2",
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
          <div className="max-w-container mx-auto px-6 py-3 divide-y divide-sable-2">
            {/* Places */}
            {(results.places?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-semibold uppercase tracking-wider mb-2">
                  Lieux
                </p>
                {results.places!.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/destinations/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 hover:bg-sable rounded-lg px-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sable flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-rouge" />
                    </div>
                    <span className="text-sm text-nuit flex-1 font-medium">
                      {p.name}
                    </span>
                    <span className="text-xs text-gris">{p.region?.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Establishments */}
            {(results.establishments?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-semibold uppercase tracking-wider mb-2">
                  Hébergements
                </p>
                {results.establishments!.slice(0, 3).map((e) => (
                  <Link
                    key={e.id}
                    href={`/reservation`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 hover:bg-sable rounded-lg px-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-vert-light flex items-center justify-center shrink-0">
                      <Hotel className="w-4 h-4 text-vert" />
                    </div>
                    <span className="text-sm text-nuit flex-1 font-medium">
                      {e.place?.name}
                    </span>
                    <span className="text-xs text-vert font-medium">
                      {e.priceMinFcfa?.toLocaleString("fr-FR")} FCFA
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Wiki */}
            {(results.wiki?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-semibold uppercase tracking-wider mb-2">
                  Wiki Faso
                </p>
                {results.wiki!.slice(0, 3).map((a) => (
                  <Link
                    key={a.id}
                    href={`/wiki/${a.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 hover:bg-sable rounded-lg px-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-or-pale flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-or" />
                    </div>
                    <span className="text-sm text-nuit flex-1 font-medium">
                      {a.title}
                    </span>
                    <span className="text-xs text-gris">{a.category}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Itineraries */}
            {(results.itineraries?.length ?? 0) > 0 && (
              <div className="py-2">
                <p className="text-xs text-gris font-semibold uppercase tracking-wider mb-2">
                  Itinéraires
                </p>
                {results.itineraries!.slice(0, 3).map((it) => (
                  <Link
                    key={it.id}
                    href={`/itineraires/${it.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 py-2 hover:bg-sable rounded-lg px-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sable flex items-center justify-center shrink-0">
                      <Map className="w-4 h-4 text-terre" />
                    </div>
                    <span className="text-sm text-nuit flex-1 font-medium">
                      {it.title}
                    </span>
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
        <div className="absolute left-0 right-0 bg-blanc border-b border-sable-2 shadow-faso py-8 text-center text-sm text-gris">
          Aucun résultat pour « {query} »
        </div>
      )}
    </div>
  );
}
