"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { itinerariesApi, destinationsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Itinerary, Place, PaginatedResponse } from "@/types/models";
import { MapPin } from "lucide-react";

const DIFFICULTIES = ["facile", "modéré", "difficile"];

interface StopDraft {
  key: number;
  id?: number;
  placeId: number | null;
  placeName: string;
  dayNumber: number;
  order: number;
  duration: string;
  notes: string;
}

export default function EditItinerairePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: itinerary, isLoading } = useQuery<Itinerary>({
    queryKey: ["itinerary", id],
    queryFn: async () => (await itinerariesApi.get(Number(id))).data,
  });

  const { data: placesData } = useQuery<PaginatedResponse<Place>>({
    queryKey: ["places-for-stops"],
    queryFn: async () => (await destinationsApi.list({ limit: 200 })).data,
  });
  const places = placesData?.data ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [difficulty, setDifficulty] = useState("modéré");
  const [budgetFcfa, setBudgetFcfa] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [stops, setStops] = useState<StopDraft[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextKey, setNextKey] = useState(1000);
  const [initialized, setInitialized] = useState(false);

  // Pre-fill form when itinerary loads
  useEffect(() => {
    if (itinerary && !initialized) {
      setTitle(itinerary.title);
      setDescription(itinerary.description ?? "");
      setDurationDays(itinerary.durationDays);
      setDifficulty(itinerary.difficulty);
      setBudgetFcfa(itinerary.budgetFcfa ?? 0);
      setIsPublic(itinerary.isPublic ?? true);
      setStops(
        (itinerary.stops ?? []).map((s, i) => ({
          key: i,
          id: s.id,
          placeId: s.placeId,
          placeName: s.place?.name ?? "",
          dayNumber: s.dayNumber,
          order: s.order,
          duration: s.duration ?? "",
          notes: s.notes ?? "",
        })),
      );
      setInitialized(true);
    }
  }, [itinerary, initialized]);

  // Redirect if not owner
  useEffect(() => {
    if (itinerary && user && itinerary.userId !== user.id) {
      router.replace(`/itineraires/${id}`);
    }
  }, [itinerary, user, id, router]);

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        key: nextKey,
        placeId: null,
        placeName: "",
        dayNumber: 1,
        order: prev.length + 1,
        duration: "2h",
        notes: "",
      },
    ]);
    setNextKey((k) => k + 1);
  };

  const removeStop = (key: number) => {
    setStops((prev) =>
      prev.filter((s) => s.key !== key).map((s, i) => ({ ...s, order: i + 1 })),
    );
  };

  const updateStop = (key: number, field: keyof StopDraft, value: unknown) => {
    setStops((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    setSaving(true);
    try {
      const itinId = Number(id);

      // 1. Update itinerary metadata
      await itinerariesApi.update(itinId, {
        title: title.trim(),
        description: description.trim(),
        durationDays,
        difficulty,
        budgetFcfa,
        isPublic,
      });

      // 2. Remove old stops that were deleted
      const oldStopIds = (itinerary?.stops ?? []).map((s) => s.id);
      const keptStopIds = stops.filter((s) => s.id).map((s) => s.id!);
      for (const oldId of oldStopIds) {
        if (!keptStopIds.includes(oldId)) {
          await itinerariesApi.deleteStop(itinId, oldId);
        }
      }

      // 3. Add new stops (those without an existing id)
      for (const stop of stops) {
        if (!stop.placeId) continue;
        if (!stop.id) {
          await itinerariesApi.addStop(itinId, {
            placeId: stop.placeId,
            order: stop.order,
            dayNumber: stop.dayNumber,
            duration: stop.duration,
            notes: stop.notes,
          });
        }
      }

      router.push(`/itineraires/${id}`);
    } catch {
      setError("Erreur lors de la mise à jour. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blanc pt-nav">
        <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-8 bg-sable rounded w-1/3" />
          <div className="h-64 bg-sable rounded-card" />
          <div className="h-48 bg-sable rounded-card" />
        </div>
      </div>
    );
  }

  if (!itinerary || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="border-b border-sable-2 pt-10 pb-6">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href={`/itineraires/${id}`}
            className="text-gris text-sm hover:text-nuit transition-colors"
          >
            ← Retour à l&apos;itinéraire
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-nuit mt-4">
            Modifier l&apos;itinéraire
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <section className="bg-sable border border-sable-2 rounded-card p-6 space-y-4">
            <h2 className="font-serif text-xl text-nuit">
              Informations générales
            </h2>

            <div>
              <label htmlFor="edit-title" className="text-sm font-medium text-nuit block mb-1">
                Titre *
              </label>
              <input
                id="edit-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
              />
            </div>

            <div>
              <label htmlFor="edit-description" className="text-sm font-medium text-nuit block mb-1">
                Description
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="edit-duration" className="text-sm font-medium text-nuit block mb-1">
                  Durée (jours)
                </label>
                <input
                  id="edit-duration"
                  type="number"
                  value={durationDays}
                  onChange={(e) =>
                    setDurationDays(Math.max(1, Number(e.target.value)))
                  }
                  min={1}
                  max={30}
                  className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-difficulty" className="text-sm font-medium text-nuit block mb-1">
                  Difficulté
                </label>
                <select
                  id="edit-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit-budget" className="text-sm font-medium text-nuit block mb-1">
                  Budget (FCFA)
                </label>
                <input
                  id="edit-budget"
                  type="number"
                  value={budgetFcfa || ""}
                  onChange={(e) => setBudgetFcfa(Number(e.target.value))}
                  min={0}
                  placeholder="Optionnel"
                  className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-nuit cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-sable-2 text-rouge focus:ring-or"
              />
              Rendre cet itinéraire public
            </label>
          </section>

          {/* Stops */}
          <section className="bg-sable border border-sable-2 rounded-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-nuit">Étapes</h2>
              <button
                type="button"
                onClick={addStop}
                className="px-4 py-2 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors flex items-center gap-1.5"
              >
                + Ajouter une étape
              </button>
            </div>

            {stops.length === 0 && (
              <div className="text-center py-8 text-gris text-sm">
                <MapPin className="w-8 h-8 text-gris mx-auto mb-2" />
                Aucune étape. Cliquez sur &quot;Ajouter une étape&quot;.
              </div>
            )}

            <div className="space-y-4">
              {stops.map((stop, idx) => (
                <div
                  key={stop.key}
                  className="bg-blanc border border-sable-2 rounded-card p-4 relative"
                >
                  <div className="absolute -left-3 top-4 w-6 h-6 bg-rouge text-blanc rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gris block mb-1">
                        Lieu *
                      </label>
                      <select
                        title="Sélectionner un lieu"
                        value={stop.placeId ?? ""}
                        onChange={(e) => {
                          const pid = Number(e.target.value);
                          const p = places.find((pl) => pl.id === pid);
                          updateStop(stop.key, "placeId", pid || null);
                          updateStop(stop.key, "placeName", p?.name ?? "");
                        }}
                        className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit text-sm focus:outline-none focus:border-or"
                      >
                        <option value="">— Choisir un lieu —</option>
                        {places.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}{" "}
                            {p.region?.name ? `(${p.region.name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gris block mb-1">
                        Jour n°
                      </label>
                      <input
                        type="number"
                        value={stop.dayNumber}
                        onChange={(e) =>
                          updateStop(
                            stop.key,
                            "dayNumber",
                            Math.max(1, Number(e.target.value)),
                          )
                        }
                        min={1}
                        max={durationDays}
                        className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit text-sm focus:outline-none focus:border-or"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gris block mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={stop.duration}
                        onChange={(e) =>
                          updateStop(stop.key, "duration", e.target.value)
                        }
                        placeholder="Ex : 2h, demi-journée"
                        className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit text-sm focus:outline-none focus:border-or"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-gris block mb-1">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={stop.notes}
                        onChange={(e) =>
                          updateStop(stop.key, "notes", e.target.value)
                        }
                        placeholder="Notes optionnelles…"
                        className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit text-sm focus:outline-none focus:border-or"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStop(stop.key)}
                    className="absolute top-3 right-3 p-1 text-gris hover:text-rouge transition-colors"
                    title="Supprimer cette étape"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Error + Submit */}
          {error && (
            <p className="text-rouge text-sm bg-rouge/5 border border-rouge/20 rounded p-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <Link
              href={`/itineraires/${id}`}
              className="px-5 py-3 border border-sable-2 text-nuit font-medium rounded hover:border-or transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      fill="currentColor"
                    />
                  </svg>
                  Enregistrement…
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
