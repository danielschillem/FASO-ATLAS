import type { Establishment } from '@/types/models'
import { clsx } from 'clsx'

const TYPE_LABELS = { hotel: 'Hôtel', restaurant: 'Restaurant', gite: 'Gîte', camp: 'Camp' }
const TYPE_ICONS  = { hotel: '🏨', restaurant: '🍽️', gite: '🏡', camp: '⛺' }
const AMENITY_ICONS: Record<string, string> = {
  'wifi': '📶', 'piscine': '🏊', 'restaurant': '🍽️', 'parking': '🚗',
  'climatisation': '❄️', 'bar': '🍹', 'spa': '💆', 'gym': '🏋️',
}

interface Props {
  establishment: Establishment
  onReserve: (e: Establishment) => void
}

export function EstablishmentCard({ establishment: e, onReserve }: Props) {
  const image = e.place?.images?.[0]?.url
  const typeLabel = TYPE_LABELS[e.type] ?? e.type
  const typeIcon  = TYPE_ICONS[e.type]  ?? '🏢'

  return (
    <div className="group rounded-card border border-sable-2 bg-blanc shadow-card hover:shadow-faso transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-sable overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={e.place?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sable to-sable-2 flex items-center justify-center text-4xl opacity-60">
            {typeIcon}
          </div>
        )}
        {/* Type badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-nuit/80 backdrop-blur-sm text-blanc text-xs rounded-pill">
          {typeLabel}
        </span>
        {/* Stars */}
        {e.stars > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-or/90 text-nuit text-xs font-bold rounded-pill">
            {'★'.repeat(e.stars)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-nuit leading-tight mb-1 line-clamp-2 group-hover:text-vert transition-colors">
          {e.place?.name ?? `Établissement #${e.id}`}
        </h3>

        {e.place?.region?.name && (
          <p className="text-xs text-gris mb-3 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {e.place.region.name}
          </p>
        )}

        {/* Amenities */}
        {e.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {e.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-xs text-gris flex items-center gap-1">
                {AMENITY_ICONS[a.toLowerCase()] ?? '✓'} {a}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-sable-2 flex items-center justify-between gap-3">
          <div>
            {e.priceMinFcfa > 0 ? (
              <>
                <span className="font-semibold text-nuit text-lg">
                  {e.priceMinFcfa.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs text-gris ml-1">FCFA / nuit</span>
              </>
            ) : (
              <span className="text-xs text-gris">Prix sur demande</span>
            )}
          </div>
          <button
            onClick={() => onReserve(e)}
            className="px-4 py-2 bg-vert hover:bg-vert/90 text-blanc text-sm font-medium rounded transition-colors shrink-0"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  )
}
