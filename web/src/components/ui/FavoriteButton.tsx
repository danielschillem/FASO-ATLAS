"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

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
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) return;
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorites/check/${targetId}?type=${targetType}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
      .then((r) => r.json())
      .then((data) => setFavorited(data.favorited))
      .catch(() => {});
  }, [targetId, targetType, isAuthenticated, accessToken]);

  const toggle = async () => {
    if (!isAuthenticated()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/favorites/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ targetId, targetType }),
        },
      );
      const data = await res.json();
      setFavorited(data.favorited);
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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={favorited ? "#C1272D" : "none"}
        stroke={favorited ? "#C1272D" : "#160A00"}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
