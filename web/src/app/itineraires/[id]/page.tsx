"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itinerariesApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Itinerary } from "@/types/models";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export default function ItineraireDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const { data: itinerary, isLoading } = useQuery<Itinerary>({
    queryKey: ["itinerary", id],
    queryFn: async () => (await itinerariesApi.get(Number(id))).data,
  });

  const deleteMutation = useMutation({
    mutationFn: () => itinerariesApi.delete(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["itineraries"] });
      router.push("/itineraires");
    },
  });

  const isOwner = user && itinerary && user.id === itinerary.userId;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-nav bg-blanc">
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-10 bg-sable rounded w-1/2" />
          <div className="h-5 bg-sable rounded w-1/3" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-sable rounded-full shrink-0" />
              <div className="flex-1 h-20 bg-sable rounded-card" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!itinerary) return null;

  // Group stops by day
  const byDay = (itinerary.stops ?? []).reduce<
    Record<number, typeof itinerary.stops>
  >((acc, stop) => {
    if (!acc[stop.dayNumber]) acc[stop.dayNumber] = [];
    acc[stop.dayNumber].push(stop);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      {/* Hero */}
      <div className="bg-gradient-to-br from-nuit via-brun to-terre py-14">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            href="/itineraires"
            className="inline-flex items-center gap-1 text-sable-2 hover:text-blanc text-sm mb-6 transition-colors"
          >
            ← Tous les itinéraires
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blanc/10 rounded-pill text-sable-2 text-xs">
              {itinerary.durationDays} jour
              {itinerary.durationDays > 1 ? "s" : ""}
            </span>
            <span className="px-3 py-1 bg-blanc/10 rounded-pill text-sable-2 text-xs capitalize">
              {itinerary.difficulty}
            </span>
            {itinerary.budgetFcfa > 0 && (
              <span className="px-3 py-1 bg-or/20 rounded-pill text-or text-xs">
                ~{itinerary.budgetFcfa.toLocaleString("fr-FR")} FCFA
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-nuit">
            {itinerary.title}
          </h1>
          {itinerary.description && (
            <p className="text-sable-2 mt-3 max-w-2xl leading-relaxed">
              {itinerary.description}
            </p>
          )}
          {isOwner && (
            <div className="flex gap-3 mt-5">
              <Link
                href={`/itineraires/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-or hover:bg-or/80 text-nuit text-sm font-medium rounded transition-colors"
              >
                <Pencil className="w-4 h-4" /> Modifier
              </Link>
              <button
                disabled={deleting || deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Supprimer définitivement cet itinéraire ?")) {
                    setDeleting(true);
                    deleteMutation.mutate();
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rouge/20 hover:bg-rouge/40 text-rouge text-sm font-medium rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Day-by-day stops */}
          <div className="md:col-span-2 space-y-8">
            {Object.entries(byDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, stops]) => (
                <div key={day}>
                  <h2 className="font-serif text-2xl text-nuit mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-rouge text-blanc text-sm flex items-center justify-center">
                      {day}
                    </span>
                    Jour {day}
                  </h2>
                  <div className="space-y-4 ml-4 border-l-2 border-sable-2 pl-6">
                    {stops
                      .sort((a, b) => a.order - b.order)
                      .map((stop, i) => (
                        <div key={stop.id} className="relative">
                          <div className="absolute -left-9 top-3 w-4 h-4 rounded-full bg-or border-2 border-blanc" />
                          <div className="bg-sable rounded-card p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-xs text-gris">
                                  Étape {i + 1}
                                </span>
                                <h3 className="font-medium text-nuit">
                                  {stop.place?.name ?? `Lieu ${stop.placeId}`}
                                </h3>
                                {stop.place?.region?.name && (
                                  <p className="text-xs text-gris mt-0.5">
                                    {stop.place.region.name}
                                  </p>
                                )}
                              </div>
                              {stop.duration && (
                                <span className="shrink-0 px-2 py-0.5 bg-blanc border border-sable-2 rounded text-xs text-gris">
                                  {stop.duration}
                                </span>
                              )}
                            </div>
                            {stop.notes && (
                              <p className="text-sm text-gris mt-2 leading-relaxed">
                                {stop.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Sidebar summary */}
          <aside className="space-y-4">
            <div className="border border-sable-2 rounded-card p-5">
              <h3 className="font-serif text-lg text-nuit mb-4">Résumé</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gris">Durée</dt>
                  <dd className="font-medium text-nuit">
                    {itinerary.durationDays} jours
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gris">Difficulté</dt>
                  <dd className="font-medium text-nuit capitalize">
                    {itinerary.difficulty}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gris">Étapes</dt>
                  <dd className="font-medium text-nuit">
                    {itinerary.stops?.length ?? 0}
                  </dd>
                </div>
                {itinerary.budgetFcfa > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gris">Budget</dt>
                    <dd className="font-medium text-nuit">
                      {itinerary.budgetFcfa.toLocaleString("fr-FR")} FCFA
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <Link
              href="/reservation"
              className="block text-center py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors"
            >
              Réserver un séjour
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
