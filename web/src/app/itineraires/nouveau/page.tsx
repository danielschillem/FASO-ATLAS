"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { itinerariesApi, destinationsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Place, PaginatedResponse } from "@/types/models";
import { MapPin } from "lucide-react";

const DIFFICULTIES = ["facile", "modéré", "difficile"];

interface StopDraft {
  key: number;
  placeId: number | null;
  placeName: string;
  dayNumber: number;
  order: number;
  duration: string;
  notes: string;
}

export default function NouvelItinerairePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [difficulty, setDifficulty] = useState("modéré");
  const [budgetFcfa, setBudgetFcfa] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [stops, setStops] = useState<StopDraft[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextKey, setNextKey] = useState(1);

  // Load places for stop picker
  const { data: placesData } = useQuery<PaginatedResponse<Place>>({
    queryKey: ["places-for-stops"],
    queryFn: async () => (await destinationsApi.list({ limit: 200 })).data,
  });
  const places = placesData?.data ?? [];

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
      // 1. Create itinerary
      const res = await itinerariesApi.create({
        title: title.trim(),
        description: description.trim(),
        durationDays,
        difficulty,
        budgetFcfa,
        isPublic,
      });
      const itineraryId = res.data.id;

      // 2. Add stops
      for (const stop of stops) {
        if (!stop.placeId) continue;
        await itinerariesApi.addStop(itineraryId, {
          placeId: stop.placeId,
          order: stop.order,
          dayNumber: stop.dayNumber,
          duration: stop.duration,
          notes: stop.notes,
        });
      }

      router.push(`/itineraires/${itineraryId}`);
    } catch {
      setError("Erreur lors de la création. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="border-b border-sable-2 pt-10 pb-6">
        <div className="max-w-container mx-auto px-6">
          <Link
            href="/itineraires"
            className="text-gris text-sm hover:text-nuit transition-colors"
          >
            ← Retour aux itinéraires
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-nuit mt-4">
            Créer un itinéraire
          </h1>
          <p className="text-gris mt-2">
            Concevez votre circuit personnalisé à travers le Burkina Faso.
          </p>
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
              <label className="text-sm font-medium text-nuit block mb-1">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex : Circuit des cascades du sud-ouest"
                className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-nuit block mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Décrivez votre itinéraire…"
                className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-nuit block mb-1">
                  Durée (jours)
                </label>
                <input
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
                <label className="text-sm font-medium text-nuit block mb-1">
                  Difficulté
                </label>
                <select
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
                <label className="text-sm font-medium text-nuit block mb-1">
                  Budget (FCFA)
                </label>
                <input
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter une étape
              </button>
            </div>

            {stops.length === 0 && (
              <div className="text-center py-8 text-gris text-sm">
                <div className="mb-2 flex justify-center">
                  <MapPin className="w-8 h-8 text-gris" />
                </div>
                Aucune étape ajoutée. Cliquez sur &quot;Ajouter une étape&quot;
                pour commencer.
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
                        value={stop.placeId ?? ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const p = places.find((pl) => pl.id === id);
                          updateStop(stop.key, "placeId", id || null);
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
              href="/itineraires"
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
                  Création…
                </>
              ) : (
                "Créer l'itinéraire"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
