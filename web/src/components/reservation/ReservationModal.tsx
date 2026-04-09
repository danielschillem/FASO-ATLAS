"use client";

import { useState } from "react";
import { reservationsApi } from "@/lib/api";
import type { Establishment } from "@/types/models";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { CheckCircle, X, Users, Calendar, Star } from "lucide-react";

interface Props {
  establishment: Establishment;
  onClose: () => void;
}

export function ReservationModal({ establishment: e, onClose }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            86400000,
        )
      : 0;
  const total = nights * e.priceMinFcfa;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!checkIn) {
      setError("Veuillez saisir une date d'arrivée");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await reservationsApi.create({
        establishmentId: e.id,
        checkInDate: checkIn,
        checkOutDate: checkOut || undefined,
        guestsCount: guests,
        specialRequests: notes,
      });
      setSuccess(true);
    } catch {
      setError("Une erreur est survenue, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-nuit/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-blanc rounded-t-2xl sm:rounded-2xl shadow-modal w-full max-w-lg z-10 overflow-hidden max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto"
        style={{ animation: "modal-in 0.2s ease-out" }}
      >
        {success ? (
          <div className="p-6 sm:p-10 text-center">
            <div className="w-16 h-16 bg-vert/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-vert" />
            </div>
            <h3 className="text-2xl font-bold text-nuit mb-2">
              Réservation envoyée !
            </h3>
            <p className="text-gris mb-8">
              Votre demande a été transmise. L&apos;établissement vous
              contactera pour confirmer.
            </p>
            <button onClick={onClose} className="btn-primary w-full">
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sable-2">
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="w-8 h-8 rounded-full hover:bg-sable flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-nuit" />
              </button>
              <h3 className="font-semibold text-nuit">Réserver</h3>
              <div className="w-8" />
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Establishment info */}
              <div className="flex items-start gap-4 pb-6 border-b border-sable-2 mb-6">
                {e.place?.images?.[0]?.url && (
                  <img
                    src={e.place.images[0].url}
                    alt={e.place.name}
                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-nuit">{e.place?.name}</h4>
                  <p className="text-sm text-gris capitalize">{e.type}</p>
                  {e.stars > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: e.stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-or text-or" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date inputs — Airbnb style bordered boxes */}
              <div className="rounded-xl border border-sable-2 overflow-hidden mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-y sm:divide-y-0 divide-sable-2">
                  <div className="p-3">
                    <label className="text-[10px] font-bold text-nuit uppercase tracking-wider block mb-1">
                      Arrivée
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(ev) => setCheckIn(ev.target.value)}
                      aria-label="Date d'arrivée"
                      className="w-full text-sm text-nuit outline-none bg-transparent"
                    />
                  </div>
                  <div className="p-3">
                    <label className="text-[10px] font-bold text-nuit uppercase tracking-wider block mb-1">
                      Départ
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(ev) => setCheckOut(ev.target.value)}
                      aria-label="Date de départ"
                      className="w-full text-sm text-nuit outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div className="border-t border-sable-2 p-3">
                  <label className="text-[10px] font-bold text-nuit uppercase tracking-wider block mb-1">
                    Voyageurs
                  </label>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gris" />
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={guests}
                      onChange={(ev) => setGuests(Number(ev.target.value))}
                      aria-label="Nombre de voyageurs"
                      className="flex-1 text-sm text-nuit outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <textarea
                value={notes}
                onChange={(ev) => setNotes(ev.target.value)}
                rows={2}
                placeholder="Demandes spéciales (optionnel)"
                className="w-full px-4 py-3 border border-sable-2 rounded-xl text-sm text-nuit placeholder:text-gris-light outline-none focus:border-nuit transition-colors resize-none mb-4"
              />

              {/* Price summary */}
              {nights > 0 && e.priceMinFcfa > 0 && (
                <div className="space-y-2 mb-6 bg-sable rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gris">
                      {e.priceMinFcfa.toLocaleString("fr-FR")} FCFA x {nights}{" "}
                      nuit{nights > 1 ? "s" : ""}
                    </span>
                    <span className="text-nuit">
                      {total.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  {guests > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gris">{guests} voyageurs</span>
                      <span className="text-nuit">inclus</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-nuit border-t border-sable-2 pt-3 text-base">
                    <span>Total</span>
                    <span>{total.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-rouge text-sm mb-4 bg-rouge/5 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-rouge hover:bg-rouge-dark text-blanc font-semibold rounded-lg transition-colors disabled:opacity-60 text-base"
              >
                {loading
                  ? "Envoi en cours…"
                  : isAuthenticated
                    ? "Réserver"
                    : "Se connecter pour réserver"}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-gris text-center mt-3">
                  Vous devez être connecté pour effectuer une réservation.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
