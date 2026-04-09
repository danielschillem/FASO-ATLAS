"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { Establishment, EstablishmentType } from "@/types/models";
import { Building2, Eye, EyeOff, Trash2, Star, Search } from "lucide-react";

const TYPE_LABELS: Record<EstablishmentType, string> = {
  hotel: "Hôtel",
  restaurant: "Restaurant",
  gite: "Gîte",
  camp: "Campement",
};

export default function AdminEstablishmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Establishment[] }>({
    queryKey: ["admin-establishments"],
    queryFn: async () =>
      (await adminApi.listEstablishments({ limit: 200 })).data,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteEstablishment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-establishments"] });
      setDeleteConfirm(null);
    },
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      adminApi.toggleEstablishmentAvailable(id, available),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-establishments"] }),
  });

  const items = data?.data ?? [];
  const filtered = items.filter(
    (e) =>
      e.place?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: items.length,
    available: items.filter((e) => e.isAvailable).length,
    avgStars:
      items.length > 0
        ? (
            items.reduce((s, e) => s + (e.stars || 0), 0) / items.length
          ).toFixed(1)
        : "—",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">
            Gestion des établissements
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
          <p className="text-xs text-gris uppercase tracking-wide">
            Disponibles
          </p>
          <p className="text-2xl font-bold text-vert">{stats.available}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Étoiles moy.
          </p>
          <p className="text-2xl font-bold text-or">{stats.avgStars}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher un établissement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-or/50"
          />
        </div>
      </div>

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">
                  Établissement
                </th>
                <th className="px-4 py-3 font-medium text-gris">Type</th>
                <th className="px-4 py-3 font-medium text-gris">Étoiles</th>
                <th className="px-4 py-3 font-medium text-gris">Prix (FCFA)</th>
                <th className="px-4 py-3 font-medium text-gris">Statut</th>
                <th className="px-4 py-3 font-medium text-gris w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable-2">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-sable rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((e) => (
                    <tr
                      key={e.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-nuit">
                          {e.place?.name ?? `Lieu #${e.placeId}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-or/10 text-or">
                          {TYPE_LABELS[e.type] ?? e.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-or font-medium">
                          <Star className="w-3 h-3 fill-or" />
                          {e.stars || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gris">
                        {e.priceMinFcfa?.toLocaleString()} -{" "}
                        {e.priceMaxFcfa?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            toggleAvailable.mutate({
                              id: e.id,
                              available: !e.isAvailable,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            e.isAvailable
                              ? "bg-vert/10 text-vert hover:bg-vert/20"
                              : "bg-rouge/10 text-rouge hover:bg-rouge/20"
                          }`}
                        >
                          {e.isAvailable ? (
                            <>
                              <Eye className="w-3 h-3" /> Dispo
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Masqué
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteConfirm(e.id)}
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
            Aucun établissement trouvé.
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
              Cette action est irréversible.
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
