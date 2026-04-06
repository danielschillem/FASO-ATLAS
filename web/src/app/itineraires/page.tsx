'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { itinerariesApi } from '@/lib/api'
import { ItineraryCard } from '@/components/itineraires/ItineraryCard'
import type { Itinerary, PaginatedResponse } from '@/types/models'
import Link from 'next/link'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'

const DIFFICULTIES = [
  { value: '',           label: 'Toutes' },
  { value: 'facile',     label: 'Facile' },
  { value: 'modéré',    label: 'Modéré' },
  { value: 'difficile',  label: 'Difficile' },
]

const DURATIONS = [
  { value: '',   label: 'Toutes durées' },
  { value: '5',  label: '≤ 5 jours' },
  { value: '7',  label: '≤ 7 jours' },
  { value: '10', label: '≤ 10 jours' },
]

export default function ItinerairesPage() {
  const [difficulty, setDifficulty] = useState('')
  const [duration,   setDuration]   = useState('')
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const { data, isLoading } = useQuery<PaginatedResponse<Itinerary>>({
    queryKey: ['itineraries', difficulty, duration],
    queryFn: async () => {
      const res = await itinerariesApi.list({
        difficulty: difficulty || undefined,
        duration: duration ? Number(duration) : undefined,
      })
      return res.data
    },
  })

  const itineraries = data?.data ?? []

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="bg-nuit pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-or text-sm font-medium uppercase tracking-widest">Planifier</span>
            <h1 className="font-serif text-4xl md:text-5xl text-blanc mt-2">Itinéraires</h1>
            <p className="text-sable-2 mt-3 max-w-xl">
              Des circuits conçus pour explorer le Burkina Faso à votre rythme — du safari au circuit culturel.
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/itineraires/nouveau"
              className="shrink-0 px-5 py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Créer un itinéraire
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-sable border-b border-sable-2 py-4 sticky top-nav z-30">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-3">
          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            {DIFFICULTIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-pill text-sm font-medium transition-colors',
                  difficulty === value
                    ? 'bg-rouge text-blanc shadow-sm'
                    : 'bg-blanc text-nuit border border-sable-2 hover:border-or/50'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-sable-2 hidden sm:block" />
          {/* Duration */}
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="px-3 py-1.5 bg-blanc border border-sable-2 rounded text-sm text-nuit focus:outline-none focus:border-or"
          >
            {DURATIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gris hidden sm:block">
            {data?.total ?? 0} itinéraire{(data?.total ?? 0) > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-card bg-sable animate-pulse h-80" />
            ))}
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🗺️</div>
            <p className="text-gris mb-6">Aucun itinéraire public pour ces critères.</p>
            {isAuthenticated && (
              <Link href="/itineraires/nouveau" className="px-5 py-2.5 bg-rouge text-blanc rounded font-medium hover:bg-rouge/90 transition-colors">
                Créer le premier
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((it) => (
              <ItineraryCard key={it.id} itinerary={it} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
