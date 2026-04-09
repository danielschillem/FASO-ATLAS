"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { Itinerary } from "@/types/models";
import {
  Route,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Clock,
  MapPin,
} from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  facile: "bg-vert/10 text-vert",
  modéré: "bg-or/10 text-or",
  difficile: "bg-rouge/10 text-rouge",
};

export default function AdminItinerairesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Itinerary[] }>({
    queryKey: ["admin-itineraries"],
    queryFn: async () => (await adminApi.listItineraries({ limit: 200 })).data,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteItinerary(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-itineraries"] });
      setDeleteConfirm(null);
    },
  });

  const togglePublic = useMutation({
    mutationFn: ({ id, isPublic }: { id: number; isPublic: boolean }) =>
      adminApi.toggleItineraryPublic(id, isPublic),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-itineraries"] }),
  });

  const items = data?.data ?? [];
  const filtered = items.filter(
    (it) =>
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.difficulty.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: items.length,
    public: items.filter((it) => it.isPublic).length,
    avgDuration:
      items.length > 0
        ? (
            items.reduce((s, it) => s + (it.durationDays || 0), 0) /
            items.length
          ).toFixed(0)
        : "—",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Route className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">
            Gestion des itinéraires
          </h1>
          <span className="text-sm text-gris ml-2">({items.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-nuit">{stats.total}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Publics</p>
          <p className="text-2xl font-bold text-vert">{stats.public}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Durée moy. (j)
          </p>
          <p className="text-2xl font-bold text-or">{stats.avgDuration}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher un itinéraire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
          />
        </div>
      </div>

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">Itinéraire</th>
                <th className="px-4 py-3 font-medium text-gris">Difficulté</th>
                <th className="px-4 py-3 font-medium text-gris">Durée</th>
                <th className="px-4 py-3 font-medium text-gris">Étapes</th>
                <th className="px-4 py-3 font-medium text-gris">Budget</th>
                <th className="px-4 py-3 font-medium text-gris">Visibilité</th>
                <th className="px-4 py-3 font-medium text-gris w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable-2">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-4 bg-sable rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((it) => (
                    <tr
                      key={it.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-nuit">
                          {it.title}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            DIFFICULTY_COLORS[it.difficulty] ??
                            "bg-sable text-gris"
                          }`}
                        >
                          {it.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-gris">
                          <Clock className="w-3 h-3" />
                          {it.durationDays}j
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-gris">
                          <MapPin className="w-3 h-3" />
                          {it.stops?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gris">
                        {it.budgetFcfa?.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            togglePublic.mutate({
                              id: it.id,
                              isPublic: !it.isPublic,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            it.isPublic
                              ? "bg-vert/10 text-vert hover:bg-vert/20"
                              : "bg-rouge/10 text-rouge hover:bg-rouge/20"
                          }`}
                        >
                          {it.isPublic ? (
                            <>
                              <Eye className="w-3 h-3" /> Public
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Privé
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteConfirm(it.id)}
                          className="p-1.5 text-gris hover:text-rouge hover:bg-rouge/10 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-gris">
            Aucun itinéraire trouvé.
          </div>
        )}
      </div>

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nuit/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-serif text-lg text-nuit mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gris mb-6">
              L&apos;itinéraire et toutes ses étapes seront supprimés.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gris hover:text-nuit transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="px-4 py-2 bg-rouge text-white rounded-lg text-sm font-medium hover:bg-rouge/90 transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
