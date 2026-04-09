"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi } from "@/lib/api";
import type { Reservation, ReservationStatus } from "@/types/models";
import { CalendarCheck, Search } from "lucide-react";

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-or/10 text-or",
  confirmed: "bg-vert/10 text-vert",
  cancelled: "bg-rouge/10 text-rouge",
  completed: "bg-nuit/10 text-nuit",
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const ALL_STATUSES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

export default function OwnerReservationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useQuery<{ data: Reservation[] }>({
    queryKey: ["owner-reservations"],
    queryFn: async () => (await ownerApi.listReservations()).data,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ownerApi.updateReservationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-reservations"] });
      qc.invalidateQueries({ queryKey: ["owner-stats"] });
    },
  });

  const items = data?.data ?? [];
  const filtered = items.filter((r) => {
    const matchSearch =
      (r.user?.firstName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.lastName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.establishment?.place?.name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus = statusFilter ? r.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: items.length,
    pending: items.filter((r) => r.status === "pending").length,
    confirmed: items.filter((r) => r.status === "confirmed").length,
    revenue: items
      .filter((r) => r.status !== "cancelled")
      .reduce((s, r) => s + (r.totalPriceFcfa || 0), 0),
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CalendarCheck className="w-6 h-6 text-or" />
        <h1 className="font-serif text-2xl text-nuit">Réservations reçues</h1>
        <span className="text-sm text-gris ml-2">({items.length})</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-nuit">{stats.total}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            En attente
          </p>
          <p className="text-2xl font-bold text-or">{stats.pending}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Confirmées
          </p>
          <p className="text-2xl font-bold text-vert">{stats.confirmed}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Revenus (FCFA)
          </p>
          <p className="text-2xl font-bold text-nuit">
            {stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher par client ou lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-or/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-or/50"
        >
          <option value="">Tous les statuts</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-sable-2 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sable text-left">
              <th className="px-4 py-3 font-medium text-gris">Client</th>
              <th className="px-4 py-3 font-medium text-gris">Lieu</th>
              <th className="px-4 py-3 font-medium text-gris">Check-in</th>
              <th className="px-4 py-3 font-medium text-gris">Voyageurs</th>
              <th className="px-4 py-3 font-medium text-gris">Montant</th>
              <th className="px-4 py-3 font-medium text-gris">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sable-2">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 bg-sable rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-sable/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-nuit">
                          {r.user
                            ? `${r.user.firstName} ${r.user.lastName}`
                            : `Client #${r.userId}`}
                        </span>
                        {r.user?.email && (
                          <span className="block text-xs text-gris">
                            {r.user.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gris">
                      {r.establishment?.place?.name ??
                        `Étab. #${r.establishmentId}`}
                    </td>
                    <td className="px-4 py-3 text-gris">
                      {new Date(r.checkInDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-gris">{r.guestsCount}</td>
                    <td className="px-4 py-3 font-medium text-nuit">
                      {r.totalPriceFcfa?.toLocaleString()} F
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          updateStatus.mutate({
                            id: r.id,
                            status: e.target.value,
                          })
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                          STATUS_STYLES[r.status] ?? "bg-sable text-gris"
                        }`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-gris">
            {items.length === 0
              ? "Aucune réservation pour le moment."
              : "Aucun résultat."}
          </div>
        )}
      </div>
    </div>
  );
}
