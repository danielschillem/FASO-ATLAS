"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { destinationsApi, mapApi } from "@/lib/api";
import { DestinationCard } from "@/components/destinations/DestinationCard";
import { SponsoredCard } from "@/components/ads";
import {
  DestinationFilters,
  type DestinationFilter,
} from "@/components/destinations/DestinationFilters";
import type { Place, PaginatedResponse, Region } from "@/types/models";
import { Search } from "lucide-react";
import { useAds } from "@/hooks/useAds";

const PAGE_SIZE = 12;

export default function DestinationsPage() {
  const [filters, setFilters] = useState<DestinationFilter>({
    type: "",
    regionId: "",
    sort: "rating",
  });
  const [page, setPage] = useState(1);

  // Reset page on filter change
  useEffect(() => setPage(1), [filters]);

  const { data: regionsData } = useQuery<Region[]>({
    queryKey: ["regions"],
    queryFn: async () => (await mapApi.getRegions()).data,
    staleTime: Infinity,
  });

  const { data, isLoading, isError, refetch } = useQuery<
    PaginatedResponse<Place>
  >({
    queryKey: ["destinations", filters, page],
    queryFn: async () => {
      const res = await destinationsApi.list({
        type: filters.type || undefined,
        regionId: filters.regionId ? Number(filters.regionId) : undefined,
        page,
        limit: PAGE_SIZE,
      });
      return res.data;
    },
    retry: 2,
  });

  const places = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE_SIZE);
  const { data: cardAds } = useAds("card", "destinations", 1);

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="border-b border-sable-2 pt-8 sm:pt-10 pb-4 sm:pb-6">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-nuit">
            Destinations
          </h1>
          <p className="text-gris mt-2">
            Sites UNESCO, réserves naturelles, marchés traditionnels et hauts
            lieux culturels du Burkina Faso.
          </p>
        </div>
      </div>

      {/* Filters */}
      <DestinationFilters
        filters={filters}
        onChange={setFilters}
        regions={regionsData ?? []}
        total={total}
      />

      {/* Grid */}
      <div className="max-w-container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/3] rounded-xl skeleton mb-3" />
                <div className="h-4 w-2/3 skeleton rounded mb-2" />
                <div className="h-3 w-1/2 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-rouge/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-rouge" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-nuit mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gris text-sm mb-4">
              Impossible de charger les destinations. Veuillez réessayer.
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-rouge text-blanc rounded-lg text-sm font-medium hover:bg-rouge-dark transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gris" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-nuit mb-2">
              Aucun résultat
            </h3>
            <p className="text-gris text-sm">
              Aucune destination trouvée pour ces filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {places.map((place, i) => (
              <React.Fragment key={place.id}>
                <DestinationCard place={place} />
                {i === 3 && page === 1 && cardAds?.[0] && (
                  <SponsoredCard ad={cardAds[0]} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-5 py-2.5 border border-nuit rounded-lg text-sm text-nuit font-medium disabled:opacity-30 disabled:border-sable-2 hover:bg-sable transition-all"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-sm text-gris">
              {page} / {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 border border-nuit rounded-lg text-sm text-nuit font-medium disabled:opacity-30 disabled:border-sable-2 hover:bg-sable transition-all"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
