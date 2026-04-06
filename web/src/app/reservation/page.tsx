'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { establishmentsApi } from '@/lib/api'
import { EstablishmentCard } from '@/components/reservation/EstablishmentCard'
import { ReservationModal } from '@/components/reservation/ReservationModal'
import type { Establishment, PaginatedResponse } from '@/types/models'
import { clsx } from 'clsx'

type TabType = 'hotel' | 'gite' | 'restaurant' | 'camp'

const TABS: Array<{ type: TabType; label: string; icon: string }> = [
  { type: 'hotel',      label: 'Hôtels',               icon: '🏨' },
  { type: 'gite',       label: 'Gîtes & Résidences',   icon: '🏡' },
  { type: 'restaurant', label: 'Restaurants',           icon: '🍽️' },
  { type: 'camp',       label: 'Camps & Lodges',        icon: '⛺' },
]

const STARS_OPTIONS = [
  { value: '', label: 'Toutes catégories' },
  { value: '3', label: '3★ et +' },
  { value: '4', label: '4★ et +' },
  { value: '5', label: '5★' },
]

export default function ReservationPage() {
  const [activeTab,    setActiveTab]    = useState<TabType>('hotel')
  const [stars,        setStars]        = useState('')
  const [selectedEstab, setSelectedEstab] = useState<Establishment | null>(null)

  const { data, isLoading } = useQuery<PaginatedResponse<Establishment>>({
    queryKey: ['establishments', activeTab, stars],
    queryFn: async () => {
      const res = await establishmentsApi.list({
        type:  activeTab,
        stars: stars ? Number(stars) : undefined,
        page:  1,
      })
      return res.data
    },
  })

  const establishments = data?.data ?? []

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="bg-nuit pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-or text-sm font-medium uppercase tracking-widest">Séjourner</span>
          <h1 className="font-serif text-4xl md:text-5xl text-blanc mt-2">Réservation</h1>
          <p className="text-sable-2 mt-3 max-w-xl mx-auto">
            Hôtels, gîtes, restaurants et camps au Burkina Faso — tarifs en FCFA, paiement sur place.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-sable border-b border-sable-2 sticky top-nav z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto">
            {TABS.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={clsx(
                  'flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 shrink-0 transition-colors',
                  activeTab === type
                    ? 'border-rouge text-rouge'
                    : 'border-transparent text-gris hover:text-nuit'
                )}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}

            {/* Stars filter */}
            <div className="ml-auto shrink-0 py-3">
              <select
                value={stars}
                onChange={(e) => setStars(e.target.value)}
                className="px-3 py-1.5 bg-blanc border border-sable-2 rounded text-sm text-nuit focus:outline-none focus:border-or"
              >
                {STARS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-card bg-sable animate-pulse h-72" />
            ))}
          </div>
        ) : establishments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🏡</p>
            <p className="text-gris">Aucun établissement trouvé.</p>
            <p className="text-sm text-gris mt-2">
              Vous êtes propriétaire ?{' '}
              <a href="/register" className="text-rouge hover:underline">Enregistrez votre établissement</a>
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gris mb-6">
              {data?.total ?? 0} établissement{(data?.total ?? 0) > 1 ? 's' : ''} disponible{(data?.total ?? 0) > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {establishments.map((e) => (
                <EstablishmentCard key={e.id} establishment={e} onReserve={setSelectedEstab} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA pour propriétaires */}
      <div className="bg-gradient-to-r from-terre to-nuit py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sable-2 text-sm mb-2">Vous gérez un établissement au Burkina Faso ?</p>
          <h2 className="font-serif text-3xl text-blanc mb-4">Rejoignez Faso Atlas</h2>
          <p className="text-gris mb-6">
            Plus de 320 établissements font déjà confiance à notre plateforme pour atteindre les voyageurs.
          </p>
          <a
            href="/register?role=owner"
            className="inline-block px-6 py-3 bg-or hover:bg-or-vif text-nuit font-semibold rounded transition-colors"
          >
            Enregistrer mon établissement
          </a>
        </div>
      </div>

      {/* Reservation modal */}
      {selectedEstab && (
        <ReservationModal
          establishment={selectedEstab}
          onClose={() => setSelectedEstab(null)}
        />
      )}
    </div>
  )
}
