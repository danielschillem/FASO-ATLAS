'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { atlasApi } from '@/lib/api'
import type { AtlasEvent, HistoricalEra } from '@/types/models'
import { clsx } from 'clsx'

const ERA_YEARS: Record<HistoricalEra, string> = {
  mossi:        '~1000',
  bobo:         '~1400',
  colonial:     '1896',
  independance: '1960',
  sankara:      '1984',
}

export function AtlasTimeline() {
  const [selectedEra, setSelectedEra] = useState<HistoricalEra>('mossi')

  const { data: events = [] } = useQuery<AtlasEvent[]>({
    queryKey: ['atlas-events'],
    queryFn: async () => {
      const res = await atlasApi.getEvents()
      return res.data
    },
  })

  const activeEvent = events.find((e) => e.era === selectedEra)

  return (
    <section className="min-h-screen bg-nuit pt-nav">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <span className="text-or text-sm font-medium uppercase tracking-widest">Atlas historique</span>
          <h1 className="font-serif text-4xl md:text-5xl text-blanc mt-3 text-balance">
            Histoire du Burkina Faso
          </h1>
        </div>

        {/* Timeline navigation */}
        <div className="relative flex items-center justify-center mb-14">
          {/* Line */}
          <div className="absolute left-0 right-0 h-px bg-white/10 top-5 hidden md:block" />
          <div className="flex flex-wrap justify-center gap-4 md:gap-0 md:justify-between w-full max-w-3xl relative">
            {events.map((event) => (
              <button
                key={event.era}
                onClick={() => setSelectedEra(event.era)}
                className="relative flex flex-col items-center gap-2 group"
              >
                <div
                  className={clsx(
                    'w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-10',
                    selectedEra === event.era
                      ? 'border-or bg-or scale-125'
                      : 'border-white/30 bg-nuit group-hover:border-or-vif'
                  )}
                >
                  <span className="text-xs font-bold text-blanc">{event.sortOrder}</span>
                </div>
                <div className="text-center">
                  <span
                    className={clsx(
                      'text-xs font-medium transition-colors whitespace-nowrap',
                      selectedEra === event.era ? 'text-or-vif' : 'text-gris group-hover:text-sable'
                    )}
                  >
                    {ERA_YEARS[event.era]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature panel */}
        {activeEvent && (
          <div
            key={activeEvent.era}
            className="rounded-card overflow-hidden shadow-faso animate-in fade-in duration-500"
            style={{ background: activeEvent.gradientCss }}
          >
            <div className="p-8 md:p-14">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-pill text-or text-xs font-medium mb-4">
                {ERA_YEARS[activeEvent.era]}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-blanc mb-2">{activeEvent.title}</h2>
              <p className="text-or-vif font-medium mb-6">{activeEvent.subtitle}</p>
              <p className="text-sable-2 leading-relaxed max-w-3xl">{activeEvent.description}</p>
              {activeEvent.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {activeEvent.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white/10 rounded-pill text-xs text-sable-2">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
