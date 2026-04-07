"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { destinationsApi } from "@/lib/api";
import type { Place } from "@/types/models";
import Link from "next/link";
import ReviewSection from "@/components/reviews/ReviewSection";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { JsonLd, placeJsonLd } from "@/components/seo/JsonLd";

const TYPE_LABELS = {
  site: "Site touristique",
  hotel: "Hébergement",
  nature: "Nature & Réserve",
  culture: "Culture & Arts",
};
const TYPE_COLORS = {
  site: "#C1272D",
  hotel: "#006B3C",
  nature: "#D4A017",
  culture: "#7C3BBF",
};

export default function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: place, isLoading } = useQuery<Place>({
    queryKey: ["destination", slug],
    queryFn: async () => (await destinationsApi.get(slug)).data,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-nav bg-blanc">
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-72 bg-sable rounded-card" />
          <div className="h-8 bg-sable rounded w-2/3" />
          <div className="h-4 bg-sable rounded w-1/3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-sable rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center">
        <div className="text-center">
          <p className="text-gris mb-4">Destination introuvable.</p>
          <Link href="/destinations" className="text-rouge hover:underline">
            ← Retour aux destinations
          </Link>
        </div>
      </div>
    );
  }

  const color = TYPE_COLORS[place.type] ?? "#C1272D";
  const label = TYPE_LABELS[place.type] ?? place.type;
  const heroImage = place.images?.[0]?.url;

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <JsonLd data={placeJsonLd(place)} />
      {/* Hero */}
      <div className="relative h-80 md:h-96 overflow-hidden bg-nuit">
        {heroImage ? (
          <img
            src={heroImage}
            alt={place.name}
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${color}33, #160A00)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-pill text-white text-xs font-medium mb-3"
                  style={{ backgroundColor: color }}
                >
                  {label}
                </span>
                <h1 className="font-serif text-3xl md:text-5xl text-blanc">
                  {place.name}
                </h1>
                {place.region?.name && (
                  <p className="text-sable-2 mt-2 text-sm flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {place.region.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton targetId={place.id} targetType="place" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Main */}
          <div className="flex-1">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1 text-sm text-gris hover:text-rouge mb-6 transition-colors"
            >
              ← Retour aux destinations
            </Link>

            {/* Rating row */}
            {place.rating > 0 && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-sable rounded-card">
                <div className="text-3xl font-serif text-or">
                  {place.rating.toFixed(1)}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={
                          s <= Math.round(place.rating) ? "#D4A017" : "#EDD9A3"
                        }
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gris mt-0.5">
                    {place.reviewCount} avis
                  </p>
                </div>
              </div>
            )}

            <h2 className="font-serif text-2xl text-nuit mb-4">À propos</h2>
            <p className="text-nuit leading-relaxed">{place.description}</p>

            {/* Tags */}
            {place.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-sable text-terre text-sm rounded-pill border border-sable-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Image gallery */}
            {place.images?.length > 1 && (
              <div className="mt-8">
                <h3 className="font-serif text-xl text-nuit mb-4">Galerie</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {place.images.slice(1).map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.caption || place.name}
                      className="w-full h-36 object-cover rounded-card"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection placeId={place.id} />

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-sable-2">
              <p className="text-sm text-gris mb-3">
                Partager cette destination
              </p>
              <ShareButtons
                url={typeof window !== "undefined" ? window.location.href : ""}
                title={place.name}
                description={place.description}
              />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            {/* Map preview card */}
            {place.lat && place.lng && (
              <div className="border border-sable-2 rounded-card overflow-hidden mb-4">
                <div className="bg-sable p-3 text-xs text-gris font-medium uppercase tracking-wider">
                  Localisation
                </div>
                <div className="bg-nuit/5 p-4 text-sm text-nuit space-y-1">
                  <p>
                    Latitude :{" "}
                    <span className="font-mono text-xs">
                      {place.lat.toFixed(4)}
                    </span>
                  </p>
                  <p>
                    Longitude :{" "}
                    <span className="font-mono text-xs">
                      {place.lng.toFixed(4)}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/carte?place=${place.id}`}
                  className="block text-center py-2.5 bg-rouge text-blanc text-sm font-medium hover:bg-rouge/90 transition-colors"
                >
                  Voir sur la carte →
                </Link>
              </div>
            )}

            {/* CTA */}
            <div
              className="rounded-card p-5 text-blanc"
              style={{
                background: `linear-gradient(135deg, ${color}, #160A00)`,
              }}
            >
              <p className="font-serif text-lg mb-2">Planifier votre visite</p>
              <p className="text-xs opacity-80 mb-4">
                Intégrez ce lieu dans votre itinéraire personnalisé.
              </p>
              <Link
                href="/itineraires/nouveau"
                className="block text-center py-2.5 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
              >
                Créer un itinéraire
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
