"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import {
  Users,
  MapPin,
  Hotel,
  Compass,
  BookOpen,
  Calendar,
  BarChart3,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalPlaces: number;
  totalEstablishments: number;
  totalItineraries: number;
  totalArticles: number;
  totalReservations: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await adminApi.getStats()).data,
  });

  const cards = stats
    ? [
        {
          label: "Utilisateurs",
          value: stats.totalUsers,
          icon: Users,
          color: "text-rouge",
          bg: "bg-rouge/10",
        },
        {
          label: "Lieux",
          value: stats.totalPlaces,
          icon: MapPin,
          color: "text-vert",
          bg: "bg-vert/10",
        },
        {
          label: "Établissements",
          value: stats.totalEstablishments,
          icon: Hotel,
          color: "text-or",
          bg: "bg-or/10",
        },
        {
          label: "Itinéraires",
          value: stats.totalItineraries,
          icon: Compass,
          color: "text-nuit",
          bg: "bg-nuit/10",
        },
        {
          label: "Articles wiki",
          value: stats.totalArticles,
          icon: BookOpen,
          color: "text-rouge",
          bg: "bg-rouge/10",
        },
        {
          label: "Réservations",
          value: stats.totalReservations,
          icon: Calendar,
          color: "text-vert",
          bg: "bg-vert/10",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="w-6 h-6 text-or" />
        <h1 className="font-serif text-2xl text-nuit">Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-card bg-sable animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="p-5 rounded-card border border-sable-2 bg-blanc hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}
                >
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <span className="text-sm text-gris font-medium">{c.label}</span>
              </div>
              <p className="font-serif text-3xl text-nuit">
                {c.value.toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
