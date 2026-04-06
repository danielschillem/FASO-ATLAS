'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { destinationsApi, mapApi } from '@/lib/api'
import { DestinationCard } from '@/components/destinations/DestinationCard'
import { DestinationFilters, type DestinationFilter } from '@/components/destinations/DestinationFilters'
import type { Place, PaginatedResponse, Region } from '@/types/models'

const PAGE_SIZE = 12

export default function DestinationsPage() {
  const [filters, setFilters] = useState<DestinationFilter>({ type: '', regionId: '', sort: 'rating' })
  const [page, setPage] = useState(1)

  // Reset page on filter change
  useEffect(() => setPage(1), [filters])

  const { data: regionsData } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: async () => (await mapApi.getRegions()).data,
    staleTime: Infinity,
  })

  const { data, isLoading } = useQuery<PaginatedResponse<Place>>({
    queryKey: ['destinations', filters, page],
    queryFn: async () => {
      const res = await destinationsApi.list({
        type: filters.type || undefined,
        regionId: filters.regionId ? Number(filters.regionId) : undefined,
        page,
        limit: PAGE_SIZE,
      })
      return res.data
    },
  })

  const places = data?.data ?? []
  const total  = data?.total ?? 0
  const pages  = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="bg-nuit pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-or text-sm font-medium uppercase tracking-widest">Explorer</span>
          <h1 className="font-serif text-4xl md:text-5xl text-blanc mt-2">Destinations</h1>
          <p className="text-sable-2 mt-3 max-w-xl mx-auto">
            Sites UNESCO, réserves naturelles, marchés traditionnels et hauts lieux culturels du Burkina Faso.
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
      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-card bg-sable animate-pulse h-72" />
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
            <p className="text-gris">Aucune destination trouvée pour ces filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map((place) => (
              <DestinationCard key={place.id} place={place} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-sable-2 rounded text-sm text-nuit disabled:opacity-40 hover:border-or transition-colors"
            >
              ← Précédent
            </button>
            <span className="px-4 py-2 text-sm text-gris">
              Page {page} / {pages}
            </span>
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-sable-2 rounded text-sm text-nuit disabled:opacity-40 hover:border-or transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
