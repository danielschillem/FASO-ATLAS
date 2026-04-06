'use client'

import { useState } from 'react'
import { reservationsApi } from '@/lib/api'
import type { Establishment } from '@/types/models'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

interface Props {
  establishment: Establishment
  onClose: () => void
}

export function ReservationModal({ establishment: e, onClose }: Props) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests,   setGuests]   = useState(1)
  const [notes,    setNotes]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  const nights = checkIn && checkOut
    ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0
  const total = nights * e.priceMinFcfa

  const handleSubmit = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!checkIn) { setError('Veuillez saisir une date d\'arrivée'); return }
    setLoading(true); setError('')
    try {
      await reservationsApi.create({
        establishmentId: e.id,
        checkInDate:     checkIn,
        checkOutDate:    checkOut || undefined,
        guestsCount:     guests,
        specialRequests: notes,
      })
      setSuccess(true)
    } catch {
      setError('Une erreur est survenue, veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-nuit/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blanc rounded-card shadow-faso w-full max-w-md z-10">
        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-vert/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
            <h3 className="font-serif text-2xl text-nuit mb-2">Réservation envoyée !</h3>
            <p className="text-gris mb-6">Votre demande a été transmise. L'établissement vous contactera pour confirmer.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-vert text-blanc rounded font-medium hover:bg-vert/90 transition-colors">
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-sable-2">
              <div>
                <h3 className="font-serif text-xl text-nuit">{e.place?.name}</h3>
                <p className="text-xs text-gris mt-0.5 capitalize">{e.type}</p>
              </div>
              <button onClick={onClose} className="text-gris hover:text-nuit transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gris font-medium block mb-1">Arrivée *</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border border-sable-2 rounded text-sm focus:outline-none focus:border-or"
                  />
                </div>
                <div>
                  <label className="text-xs text-gris font-medium block mb-1">Départ</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border border-sable-2 rounded text-sm focus:outline-none focus:border-or"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gris font-medium block mb-1">Nombre de personnes</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-sable-2 rounded text-sm focus:outline-none focus:border-or"
                />
              </div>

              <div>
                <label className="text-xs text-gris font-medium block mb-1">Demandes spéciales</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Régime alimentaire, accessibilité, arrivée tardive…"
                  className="w-full px-3 py-2 border border-sable-2 rounded text-sm focus:outline-none focus:border-or resize-none"
                />
              </div>

              {/* Price summary */}
              {nights > 0 && e.priceMinFcfa > 0 && (
                <div className="bg-sable rounded p-3 text-sm space-y-1">
                  <div className="flex justify-between text-gris">
                    <span>{e.priceMinFcfa.toLocaleString('fr-FR')} FCFA × {nights} nuit{nights > 1 ? 's' : ''}</span>
                    <span>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between font-semibold text-nuit border-t border-sable-2 pt-1">
                    <span>Total estimé</span>
                    <span className="text-vert">{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}

              {error && <p className="text-rouge text-sm">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-vert hover:bg-vert/90 text-blanc font-medium rounded transition-colors disabled:opacity-60"
              >
                {loading ? 'Envoi en cours…' : isAuthenticated ? 'Confirmer la réservation' : 'Se connecter pour réserver'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
