'use client'

import { clsx } from 'clsx'

export type DestinationFilter = {
  type: string
  regionId: string
  sort: string
}

const TYPES = [
  { value: '',        label: 'Tous' },
  { value: 'site',    label: 'Sites touristiques' },
  { value: 'nature',  label: 'Nature & Réserves' },
  { value: 'culture', label: 'Culture & Arts' },
  { value: 'hotel',   label: 'Hébergements' },
]

const SORTS = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'name',   label: 'Alphabétique' },
  { value: 'newest', label: 'Plus récents' },
]

interface Props {
  filters: DestinationFilter
  onChange: (f: DestinationFilter) => void
  regions: Array<{ id: number; name: string }>
  total: number
}

export function DestinationFilters({ filters, onChange, regions, total }: Props) {
  const set = (key: keyof DestinationFilter, value: string) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="bg-sable border-b border-sable-2 py-4 sticky top-nav z-30">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-3">
        {/* Type filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set('type', value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-pill text-sm font-medium transition-colors',
                filters.type === value
                  ? 'bg-rouge text-blanc shadow-sm'
                  : 'bg-blanc text-nuit border border-sable-2 hover:border-or/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-sable-2 hidden sm:block" />

        {/* Region filter */}
        <select
          value={filters.regionId}
          onChange={(e) => set('regionId', e.target.value)}
          className="px-3 py-1.5 bg-blanc border border-sable-2 rounded text-sm text-nuit focus:outline-none focus:border-or"
        >
          <option value="">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r.id} value={String(r.id)}>{r.name}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value)}
          className="px-3 py-1.5 bg-blanc border border-sable-2 rounded text-sm text-nuit focus:outline-none focus:border-or"
        >
          {SORTS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <span className="ml-auto text-xs text-gris hidden sm:block">
          {total} résultat{total > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
