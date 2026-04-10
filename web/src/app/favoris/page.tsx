"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { favoritesApi, mapApi, itinerariesApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Favorite, Place, Itinerary } from "@/types/models";
import { Heart, MapPin, Compass, Trash2 } from "lucide-react";
import Link from "next/link";

export default function FavorisPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: favData, refetch } = useQuery<{
    data: Favorite[];
    total: number;
  }>({
    queryKey: ["favorites"],
    queryFn: async () => (await favoritesApi.list({ limit: 100 })).data,
    enabled: isAuthenticated(),
  });

  const { data: placesData } = useQuery<Place[]>({
    queryKey: ["all-places-for-favs"],
    queryFn: async () => {
      const res = await mapApi.getPlaces();
      return res.data?.features
        ? res.data.features.map(
            (f: {
              properties: Record<string, unknown>;
              geometry: { coordinates: [number, number] };
            }) => ({
              ...f.properties,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            }),
          )
        : res.data;
    },
    enabled: isAuthenticated(),
  });

  const { data: itinerariesData } = useQuery<Itinerary[]>({
    queryKey: ["all-itineraries-for-favs"],
    queryFn: async () => {
      const res = await itinerariesApi.list();
      return res.data?.data ?? res.data;
    },
    enabled: isAuthenticated(),
  });

  const favorites = favData?.data ?? [];
  const places = placesData ?? [];
  const itineraries = itinerariesData ?? [];

  const placeFavs = favorites
    .filter((f) => f.targetType === "place")
    .map((f) => ({
      ...f,
      place: places.find((p) => p.id === f.targetId),
    }));

  const itineraryFavs = favorites
    .filter((f) => f.targetType === "itinerary")
    .map((f) => ({
      ...f,
      itinerary: itineraries.find((it) => it.id === f.targetId),
    }));

  const handleRemove = async (targetId: number, targetType: string) => {
    try {
      await favoritesApi.toggle(targetId, targetType);
      refetch();
    } catch {
      // silently fail
    }
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <div className="border-b border-sable-2 pt-10 pb-6">
        <div className="max-w-container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-nuit">
            Mes favoris
          </h1>
          <p className="text-gris mt-2">
            {favorites.length} élément{favorites.length !== 1 ? "s" : ""}{" "}
            sauvegardé{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {favorites.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-sable-2 rounded-card">
            <Heart className="w-10 h-10 text-gris mx-auto mb-3" />
            <p className="text-gris mb-2">
              Vous n&apos;avez aucun favori pour le moment.
            </p>
            <Link
              href="/destinations"
              className="inline-block mt-3 px-5 py-2.5 bg-rouge text-blanc rounded font-medium hover:bg-rouge/90 transition-colors text-sm"
            >
              Explorer les destinations
            </Link>
          </div>
        ) : (
          <>
            {/* Places */}
            {placeFavs.length > 0 && (
              <section className="mb-10">
                <h2 className="font-serif text-2xl text-nuit mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rouge" />
                  Destinations ({placeFavs.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {placeFavs.map((f) => (
                    <div
                      key={f.id}
                      className="group relative border border-sable-2 rounded-2xl overflow-hidden bg-blanc shadow-card hover:shadow-faso transition-shadow"
                    >
                      <Link
                        href={`/destinations/${f.place?.slug ?? f.targetId}`}
                        className="block p-5"
                      >
                        <h3 className="font-medium text-nuit group-hover:text-rouge transition-colors">
                          {f.place?.name ?? `Lieu #${f.targetId}`}
                        </h3>
                        <p className="text-xs text-gris mt-1 capitalize">
                          {f.place?.type} · {f.place?.region?.name ?? ""}
                        </p>
                        {f.place?.rating ? (
                          <p className="text-xs text-or mt-2">
                            {f.place.rating.toFixed(1)} / 5
                          </p>
                        ) : null}
                      </Link>
                      <button
                        onClick={() => handleRemove(f.targetId, "place")}
                        className="absolute top-3 right-3 p-2 rounded-full bg-blanc/80 hover:bg-rouge/10 text-gris hover:text-rouge transition-colors"
                        aria-label="Retirer des favoris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itineraries */}
            {itineraryFavs.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl text-nuit mb-5 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-vert" />
                  Itinéraires ({itineraryFavs.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {itineraryFavs.map((f) => (
                    <div
                      key={f.id}
                      className="group relative border border-sable-2 rounded-2xl overflow-hidden bg-blanc shadow-card hover:shadow-faso transition-shadow"
                    >
                      <Link
                        href={`/itineraires/${f.itinerary?.id ?? f.targetId}`}
                        className="block p-5"
                      >
                        <h3 className="font-medium text-nuit group-hover:text-vert transition-colors">
                          {f.itinerary?.title ?? `Itinéraire #${f.targetId}`}
                        </h3>
                        {f.itinerary && (
                          <p className="text-xs text-gris mt-1">
                            {f.itinerary.durationDays} jour
                            {f.itinerary.durationDays > 1 ? "s" : ""} ·{" "}
                            {f.itinerary.difficulty}
                          </p>
                        )}
                      </Link>
                      <button
                        onClick={() => handleRemove(f.targetId, "itinerary")}
                        className="absolute top-3 right-3 p-2 rounded-full bg-blanc/80 hover:bg-rouge/10 text-gris hover:text-rouge transition-colors"
                        aria-label="Retirer des favoris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
