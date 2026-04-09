"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { favoritesApi } from "@/lib/api";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  targetId: number;
  targetType: "place" | "itinerary";
  className?: string;
}

export function FavoriteButton({
  targetId,
  targetType,
  className = "",
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) return;
    favoritesApi
      .check(targetId, targetType)
      .then((res) => setFavorited(res.data.favorited))
      .catch(() => {});
  }, [targetId, targetType, isAuthenticated]);

  const toggle = async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    try {
      const res = await favoritesApi.toggle(targetId, targetType);
      setFavorited(res.data.favorited);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-10 h-10 rounded-full bg-blanc/90 hover:bg-blanc flex items-center justify-center shadow-card transition-all ${className}`}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={favorited}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${favorited ? "fill-rouge text-rouge" : "text-nuit"}`}
      />
    </button>
  );
}
