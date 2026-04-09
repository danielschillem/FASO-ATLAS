"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import type { SearchResults } from "@/types/models";
import Link from "next/link";
import { Search, MapPin, Hotel, BookOpen, Compass, Star } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  site: "bg-rouge/10 text-rouge",
  hotel: "bg-vert/10 text-vert",
  nature: "bg-or/10 text-or",
  culture: "bg-nuit/10 text-nuit",
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const { data: results, isLoading } = useQuery<SearchResults>({
    queryKey: ["search-results", q],
    queryFn: async () => (await searchApi.search(q)).data,
    enabled: q.length >= 2,
  });

  const totalResults = results
    ? (results.places?.length ?? 0) +
      (results.establishments?.length ?? 0) +
      (results.wiki?.length ?? 0) +
      (results.itineraries?.length ?? 0)
    : 0;

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <div className="border-b border-sable-2 pt-10 pb-6">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-nuit">
            Résultats de recherche
          </h1>
          {q && (
            <p className="text-gris mt-2">
              {isLoading
                ? "Recherche en cours…"
                : `${totalResults} résultat${totalResults !== 1 ? "s" : ""} pour « ${q} »`}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {!q && (
          <p className="text-center text-gris py-16">
            Utilisez la barre de recherche pour trouver des lieux, hébergements,
            articles ou itinéraires.
          </p>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-sable rounded-card animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && q && totalResults === 0 && (
          <div className="text-center py-16">
            <Search className="w-10 h-10 text-gris mx-auto mb-3" />
            <p className="text-gris">Aucun résultat pour « {q} ».</p>
            <p className="text-sm text-gris mt-1">
              Essayez un terme plus général ou vérifiez l&apos;orthographe.
            </p>
          </div>
        )}

        {results && totalResults > 0 && (
          <div className="space-y-8">
            {/* Places */}
            {(results.places?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-serif text-xl text-nuit mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rouge" />
                  Lieux ({results.places!.length})
                </h2>
                <div className="space-y-3">
                  {results.places!.map((p) => (
                    <Link
                      key={p.id}
                      href={`/destinations/${p.slug}`}
                      className="block p-4 border border-sable-2 rounded-card hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-nuit">{p.name}</h3>
                          <p className="text-xs text-gris mt-0.5 capitalize">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-pill text-xs mr-2 ${TYPE_COLORS[p.type] ?? "bg-gris/10 text-gris"}`}
                            >
                              {p.type}
                            </span>
                            {p.region?.name}
                          </p>
                          {p.description && (
                            <p className="text-sm text-gris mt-2 line-clamp-2">
                              {p.description}
                            </p>
                          )}
                        </div>
                        {p.rating > 0 && (
                          <span className="flex items-center gap-1 text-sm text-or font-medium shrink-0">
                            <Star className="w-4 h-4 fill-current" />
                            {p.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Establishments */}
            {(results.establishments?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-serif text-xl text-nuit mb-4 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-vert" />
                  Hébergements ({results.establishments!.length})
                </h2>
                <div className="space-y-3">
                  {results.establishments!.map((e) => (
                    <Link
                      key={e.id}
                      href="/reservation"
                      className="block p-4 border border-sable-2 rounded-card hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-nuit">
                            {e.place?.name}
                          </h3>
                          <p className="text-xs text-gris mt-0.5 capitalize">
                            {e.type} · {e.place?.region?.name}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-vert shrink-0">
                          {e.priceMinFcfa?.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Wiki */}
            {(results.wiki?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-serif text-xl text-nuit mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rouge" />
                  Articles Wiki ({results.wiki!.length})
                </h2>
                <div className="space-y-3">
                  {results.wiki!.map((a) => (
                    <Link
                      key={a.id}
                      href={`/wiki`}
                      className="block p-4 border border-sable-2 rounded-card hover:shadow-card transition-shadow"
                    >
                      <h3 className="font-medium text-nuit">{a.title}</h3>
                      <p className="text-xs text-gris mt-0.5">{a.category}</p>
                      {a.leadText && (
                        <p className="text-sm text-gris mt-2 line-clamp-2">
                          {a.leadText}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Itineraries */}
            {(results.itineraries?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-serif text-xl text-nuit mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-or" />
                  Itinéraires ({results.itineraries!.length})
                </h2>
                <div className="space-y-3">
                  {results.itineraries!.map((it) => (
                    <Link
                      key={it.id}
                      href={`/itineraires/${it.id}`}
                      className="block p-4 border border-sable-2 rounded-card hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-nuit">{it.title}</h3>
                          <p className="text-xs text-gris mt-0.5">
                            {it.durationDays} jour
                            {it.durationDays > 1 ? "s" : ""} · {it.difficulty}
                          </p>
                        </div>
                        {it.budgetFcfa > 0 && (
                          <span className="text-sm text-or font-medium shrink-0">
                            {it.budgetFcfa.toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResultsContent />
    </Suspense>
  );
}
