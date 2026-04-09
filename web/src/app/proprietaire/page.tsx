"use client";

import { useQuery } from "@tanstack/react-query";
import { ownerApi } from "@/lib/api";
import {
  Building2,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Banknote,
} from "lucide-react";

interface OwnerStats {
  totalEstablishments: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  revenue: number;
}

export default function OwnerDashboardPage() {
  const { data, isLoading } = useQuery<OwnerStats>({
    queryKey: ["owner-stats"],
    queryFn: async () => (await ownerApi.getStats()).data,
  });

  const stats = data ?? {
    totalEstablishments: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    revenue: 0,
  };

  const cards = [
    {
      label: "Établissements",
      value: stats.totalEstablishments,
      icon: Building2,
      color: "text-or",
      bg: "bg-or/10",
    },
    {
      label: "Réservations totales",
      value: stats.totalReservations,
      icon: CalendarCheck,
      color: "text-nuit",
      bg: "bg-nuit/10",
    },
    {
      label: "En attente",
      value: stats.pendingReservations,
      icon: Clock,
      color: "text-or",
      bg: "bg-or/10",
    },
    {
      label: "Confirmées",
      value: stats.confirmedReservations,
      icon: CheckCircle2,
      color: "text-vert",
      bg: "bg-vert/10",
    },
    {
      label: "Revenus (FCFA)",
      value: stats.revenue.toLocaleString(),
      icon: Banknote,
      color: "text-vert",
      bg: "bg-vert/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-nuit">Tableau de bord</h1>
        <p className="text-sm text-gris mt-1">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-sable-2 rounded-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className="text-xs text-gris uppercase tracking-wide mb-1">
              {label}
            </p>
            {isLoading ? (
              <div className="h-8 w-20 bg-sable rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-nuit">{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white border border-sable-2 rounded-card p-6">
        <h2 className="font-serif text-lg text-nuit mb-2">Bienvenue !</h2>
        <p className="text-sm text-gris leading-relaxed">
          Depuis cet espace, vous pouvez gérer vos établissements (hôtels,
          gîtes, restaurants, campements), suivre les réservations de vos
          clients et mettre à jour vos informations. Utilisez le menu latéral
          pour naviguer.
        </p>
      </div>
    </div>
  );
}
