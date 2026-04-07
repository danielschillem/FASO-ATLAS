"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Reservation } from "@/types/models";
import { Hotel, Luggage, Calendar, Users } from "lucide-react";

const STATUS_STYLES = {
  pending: { label: "En attente", bg: "bg-or/10", text: "text-or" },
  confirmed: { label: "Confirmé", bg: "bg-vert/10", text: "text-vert" },
  cancelled: { label: "Annulé", bg: "bg-rouge/10", text: "text-rouge" },
  completed: { label: "Terminé", bg: "bg-gris/10", text: "text-gris" },
};

export default function ComptePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ["my-reservations"],
    queryFn: async () => (await reservationsApi.myReservations()).data,
    enabled: isAuthenticated(),
  });

  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-10 p-6 bg-sable rounded-card border border-sable-2">
          <div className="w-14 h-14 rounded-full bg-rouge text-blanc flex items-center justify-center font-serif text-xl">
            {user?.firstName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl text-nuit">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-gris text-sm">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blanc border border-sable-2 rounded-pill text-xs text-gris capitalize">
              {user?.role === "owner" ? (
                <span className="inline-flex items-center gap-1">
                  <Hotel className="w-3 h-3" /> Propriétaire
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Luggage className="w-3 h-3" /> Voyageur
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="px-4 py-2 text-sm text-gris border border-sable-2 rounded hover:border-rouge hover:text-rouge transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* Reservations */}
        <h2 className="font-serif text-2xl text-nuit mb-6">Mes réservations</h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-sable rounded-card animate-pulse"
              />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-sable-2 rounded-card">
            <p className="text-3xl mb-3">
              <Hotel className="w-8 h-8 text-gris mx-auto" />
            </p>
            <p className="text-gris">
              Vous n'avez aucune réservation pour le moment.
            </p>
            <a
              href="/reservation"
              className="inline-block mt-4 px-5 py-2.5 bg-rouge text-blanc rounded font-medium hover:bg-rouge/90 transition-colors text-sm"
            >
              Explorer les hébergements
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
              return (
                <div
                  key={r.id}
                  className="p-5 border border-sable-2 rounded-card bg-blanc flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-nuit truncate">
                      {r.establishment?.place?.name ?? `Réservation #${r.id}`}
                    </h3>
                    <p className="text-xs text-gris mt-0.5 capitalize">
                      {r.establishment?.type} ·{" "}
                      {r.establishment?.place?.region?.name}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gris">
                      <span>
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        {new Date(r.checkInDate).toLocaleDateString("fr-FR")}
                      </span>
                      {r.checkOutDate && (
                        <span>
                          →{" "}
                          {new Date(r.checkOutDate).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      <span>
                        <Users className="w-3.5 h-3.5 inline mr-1" />
                        {r.guestsCount} pers.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.totalPriceFcfa > 0 && (
                      <span className="text-sm font-semibold text-vert">
                        {r.totalPriceFcfa.toLocaleString("fr-FR")} FCFA
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-pill text-xs font-medium ${st.bg} ${st.text}`}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
