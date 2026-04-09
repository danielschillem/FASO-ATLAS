"use client";

import { useQuery } from "@tanstack/react-query";
import { destinationsApi } from "@/lib/api";
import type { Place } from "@/types/models";
import Link from "next/link";
import ReviewSection from "@/components/reviews/ReviewSection";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { JsonLd, placeJsonLd } from "@/components/seo/JsonLd";
import { Star, MapPin, ArrowLeft, Share, Grid3X3 } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import Image from "next/image";

export default function DestinationDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: place, isLoading } = useQuery<Place>({
    queryKey: ["destination", slug],
    queryFn: async () => (await destinationsApi.get(slug)).data,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-nav bg-blanc">
        <div className="max-w-container mx-auto px-6 py-10">
          {/* Skeleton gallery */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden mb-8">
            <div className="col-span-2 row-span-2 skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
          <div className="h-8 w-2/3 skeleton rounded mb-4" />
          <div className="h-4 w-1/3 skeleton rounded mb-8" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 skeleton rounded" />
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
          <Link
            href="/destinations"
            className="text-rouge font-medium hover:underline"
          >
            ← Retour aux destinations
          </Link>
        </div>
      </div>
    );
  }

  const images = place.images ?? [];
  const heroImage = images[0]?.url;
  const galleryImages = images.slice(1, 5);

  return (
    <div className="min-h-screen pt-nav bg-blanc">
      <JsonLd data={placeJsonLd(place)} />

      {/* ─── Photo Gallery — Airbnb 1+4 grid ─── */}
      <div className="max-w-container mx-auto px-6 pt-6">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[280px] md:h-[420px] rounded-xl overflow-hidden">
          {/* Main image */}
          <div className="col-span-2 row-span-2 relative bg-sable-2 cursor-pointer group">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={place.name}
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
            ) : (
              <PlaceholderImage type={place.type} label={place.name} />
            )}
          </div>
          {/* Secondary images */}
          {galleryImages.length > 0
            ? galleryImages.map((img, i) => (
                <div
                  key={img.id}
                  className="relative bg-sable-2 cursor-pointer group overflow-hidden"
                >
                  <Image
                    src={img.url}
                    alt={img.caption || place.name}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                  {i === galleryImages.length - 1 && images.length > 5 && (
                    <div className="absolute inset-0 bg-nuit/40 flex items-center justify-center">
                      <span className="flex items-center gap-1 text-blanc text-sm font-medium">
                        <Grid3X3 className="w-4 h-4" />+{images.length - 5}{" "}
                        photos
                      </span>
                    </div>
                  )}
                </div>
              ))
            : [0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-sable-2">
                  <PlaceholderImage
                    type={place.type}
                    className="w-full h-full"
                  />
                </div>
              ))}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 text-sm text-gris hover:text-nuit mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Destinations
            </Link>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-nuit">
                {place.name}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <FavoriteButton targetId={place.id} targetType="place" />
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
              {place.rating > 0 && (
                <span className="flex items-center gap-1 font-medium text-nuit">
                  <Star className="w-4 h-4 fill-nuit" />
                  {place.rating.toFixed(1)}
                  <span className="text-gris font-normal">
                    ({place.reviewCount} avis)
                  </span>
                </span>
              )}
              {place.region?.name && (
                <span className="flex items-center gap-1 text-gris">
                  <MapPin className="w-3.5 h-3.5" />
                  {place.region.name}
                </span>
              )}
              <span className="text-gris capitalize px-2 py-0.5 bg-sable rounded-full text-xs">
                {place.type}
              </span>
            </div>

            {/* Divider */}
            <div className="border-b border-sable-2 mb-6" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-nuit mb-3">À propos</h2>
              <p className="text-brun leading-relaxed">{place.description}</p>
            </div>

            {/* Tags */}
            {place.tags?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-nuit mb-3">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-sable text-nuit text-sm rounded-full border border-sable-2"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extra gallery */}
            {images.length > 5 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-nuit mb-3">Galerie</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.slice(5).map((img) => (
                    <div
                      key={img.id}
                      className="h-40 rounded-xl overflow-hidden relative"
                    >
                      <Image
                        src={img.url}
                        alt={img.caption || place.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-sable-2 mb-8" />

            {/* Reviews */}
            <ReviewSection placeId={place.id} />

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-sable-2">
              <div className="flex items-center gap-2 mb-3">
                <Share className="w-4 h-4 text-nuit" />
                <span className="text-sm font-semibold text-nuit">
                  Partager
                </span>
              </div>
              <ShareButtons
                url={typeof window !== "undefined" ? window.location.href : ""}
                title={place.name}
                description={place.description}
              />
            </div>
          </div>

          {/* Sidebar — Airbnb sticky booking card */}
          <aside className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              {/* Location card */}
              {place.lat && place.lng && (
                <div className="border border-sable-2 rounded-xl overflow-hidden mb-4 shadow-card">
                  <div className="p-5">
                    <h4 className="font-semibold text-nuit mb-3">
                      Localisation
                    </h4>
                    <div className="text-sm text-gris space-y-1 mb-4">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {place.region?.name ?? "Burkina Faso"}
                      </p>
                      <p className="text-xs text-gris-light font-mono">
                        {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                      </p>
                    </div>
                    <Link
                      href={`/carte?place=${place.id}`}
                      className="block w-full py-3 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-semibold rounded-lg text-center transition-colors"
                    >
                      Voir sur la carte
                    </Link>
                  </div>
                </div>
              )}

              {/* CTA card */}
              <div className="border border-sable-2 rounded-xl p-5 shadow-card">
                <h4 className="font-semibold text-nuit mb-2">
                  Planifier votre visite
                </h4>
                <p className="text-sm text-gris mb-4">
                  Intégrez ce lieu dans votre itinéraire personnalisé.
                </p>
                <Link
                  href="/itineraires/nouveau"
                  className="block w-full py-3 bg-nuit hover:bg-brun text-blanc text-sm font-semibold rounded-lg text-center transition-colors"
                >
                  Créer un itinéraire
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
