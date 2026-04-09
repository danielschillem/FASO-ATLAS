"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { establishmentsApi } from "@/lib/api";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import ReviewSection from "@/components/reviews/ReviewSection";
import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Establishment } from "@/types/models";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  Waves,
  Car,
  Snowflake,
  Wine,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Check,
  ChevronLeft,
  ThumbsUp,
  Share2,
  Heart,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const AMENITY_META: Record<string, { icon: LucideIcon; label: string }> = {
  wifi: { icon: Wifi, label: "WiFi gratuit" },
  piscine: { icon: Waves, label: "Piscine" },
  restaurant: { icon: UtensilsCrossed, label: "Restaurant" },
  parking: { icon: Car, label: "Parking gratuit" },
  climatisation: { icon: Snowflake, label: "Climatisation" },
  bar: { icon: Wine, label: "Bar" },
  spa: { icon: Sparkles, label: "Spa & Bien-être" },
  gym: { icon: Dumbbell, label: "Salle de sport" },
};

const TYPE_LABELS: Record<string, string> = {
  hotel: "Hôtel",
  restaurant: "Restaurant",
  gite: "Gîte & Résidence",
  camp: "Camp & Lodge",
};

export default function EstablishmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showModal, setShowModal] = useState(false);

  const { data: estab, isLoading } = useQuery<Establishment>({
    queryKey: ["establishment", id],
    queryFn: async () => (await establishmentsApi.get(Number(id))).data,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blanc pt-nav">
        <div className="max-w-container mx-auto px-4 sm:px-6 py-8">
          <div className="h-6 w-32 skeleton rounded mb-6" />
          <div className="h-80 skeleton rounded-2xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-2/3 skeleton rounded" />
              <div className="h-4 w-1/3 skeleton rounded" />
              <div className="h-32 skeleton rounded-xl" />
            </div>
            <div className="h-64 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!estab) {
    return (
      <div className="min-h-screen bg-blanc pt-nav flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-nuit mb-2">
            Établissement introuvable
          </h2>
          <Link
            href="/reservation"
            className="text-rouge font-medium hover:underline"
          >
            Retour aux hébergements
          </Link>
        </div>
      </div>
    );
  }

  const e = estab;
  const rating = e.place?.rating ?? 0;
  const reviewCount = e.place?.reviewCount ?? 0;

  const ratingLabel = (r: number) => {
    if (r >= 4.5) return "Exceptionnel";
    if (r >= 4) return "Superbe";
    if (r >= 3.5) return "Très bien";
    if (r >= 3) return "Bien";
    return "Correct";
  };

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Breadcrumb */}
      <div className="bg-blanc border-b border-sable-2">
        <div className="max-w-container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gris">
            <Link
              href="/reservation"
              className="flex items-center gap-1 text-gris hover:text-nuit font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Hébergements
            </Link>
            <span>/</span>
            <span className="text-nuit truncate">
              {e.place?.name ?? `#${e.id}`}
            </span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="max-w-container mx-auto px-4 sm:px-6 pt-4 pb-2">
        <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 shadow-card">
          {e.place?.images?.[0]?.url ? (
            <Image
              src={e.place.images[0].url}
              alt={e.place.images[0].caption || e.place?.name || ""}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <PlaceholderImage type={e.type} label={e.place?.name} />
          )}
          <div className="card-image-overlay" />

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full bg-blanc/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blanc/40 transition-all duration-300 active:scale-90"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5 text-blanc" strokeWidth={2} />
            </button>
            <button
              className="w-9 h-9 rounded-full bg-blanc/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blanc/40 transition-all duration-300 active:scale-90"
              aria-label="Sauvegarder"
            >
              <Heart className="w-5 h-5 text-blanc" strokeWidth={2} />
            </button>
          </div>

          {/* Stars badge */}
          {e.stars > 0 && (
            <div className="absolute top-4 left-4 flex items-center gap-0.5 bg-blanc/95 px-3 py-1.5 rounded-lg shadow-sm">
              {Array.from({ length: e.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-or text-or" />
              ))}
              <span className="ml-1 text-xs font-medium text-nuit">
                {TYPE_LABELS[e.type] ?? e.type}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title + rating */}
            <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-nuit">
                    {e.place?.name ?? `Établissement #${e.id}`}
                  </h1>
                  {e.place?.region?.name && (
                    <p className="text-gris flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4" />
                      {e.place.region.name}
                    </p>
                  )}
                </div>

                {/* Rating — Booking style */}
                {rating > 0 && (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold text-nuit">
                        {ratingLabel(rating)}
                      </span>
                      {reviewCount > 0 && (
                        <span className="block text-xs text-gris">
                          {reviewCount} avis
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 font-medium text-nuit">
                      <Star className="w-4 h-4 fill-or text-or" />
                      {rating.toFixed(1)}
                      <span className="text-gris font-normal text-sm">
                        ({reviewCount} avis)
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Availability */}
              {e.isAvailable && (
                <div className="flex items-center gap-2 mt-4 text-sm text-vert font-medium bg-vert/5 px-3 py-2 rounded-lg">
                  <ThumbsUp className="w-4 h-4" />
                  Disponible — Réservation immédiate possible
                </div>
              )}
            </div>

            {/* Description */}
            {e.place?.description && (
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6">
                <h2 className="text-lg font-bold text-nuit mb-3">
                  Description
                </h2>
                <p className="text-gris leading-relaxed whitespace-pre-line">
                  {e.place.description}
                </p>
              </div>
            )}

            {/* Amenities grid */}
            {e.amenities?.length > 0 && (
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6">
                <h2 className="text-lg font-bold text-nuit mb-4">
                  Équipements les plus demandés
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {e.amenities.map((a) => {
                    const meta = AMENITY_META[a.toLowerCase()] ?? null;
                    const Icon = meta?.icon ?? Check;
                    const label = meta?.label ?? a;
                    return (
                      <div
                        key={a}
                        className="flex items-center gap-3 p-3 bg-sable rounded-lg"
                      >
                        <Icon className="w-5 h-5 text-vert shrink-0" />
                        <span className="text-sm text-nuit font-medium">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact */}
            {(e.phone || e.email || e.website) && (
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6">
                <h2 className="text-lg font-bold text-nuit mb-4">Contact</h2>
                <div className="space-y-3">
                  {e.phone && (
                    <a
                      href={`tel:${e.phone}`}
                      className="flex items-center gap-3 text-sm text-nuit hover:text-rouge transition-colors"
                    >
                      <Phone className="w-4 h-4 text-gris" />
                      {e.phone}
                    </a>
                  )}
                  {e.email && (
                    <a
                      href={`mailto:${e.email}`}
                      className="flex items-center gap-3 text-sm text-nuit hover:text-rouge transition-colors"
                    >
                      <Mail className="w-4 h-4 text-gris" />
                      {e.email}
                    </a>
                  )}
                  {e.website && (
                    <a
                      href={e.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-rouge hover:underline"
                    >
                      <Globe className="w-4 h-4 text-gris" />
                      {e.website}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            {e.place && (
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6">
                <ReviewSection placeId={e.placeId} />
              </div>
            )}
          </div>

          {/* Sidebar — Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-[calc(var(--nav-h,72px)+1.5rem)] space-y-4">
              {/* Price card */}
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6">
                <div className="mb-4">
                  {e.priceMinFcfa > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-nuit">
                        {e.priceMinFcfa.toLocaleString("fr-FR")}
                        <span className="text-base font-normal text-gris ml-1">
                          FCFA
                        </span>
                      </div>
                      <p className="text-sm text-gris">par nuit</p>
                      {e.priceMaxFcfa > e.priceMinFcfa && (
                        <p className="text-xs text-gris mt-1">
                          jusqu&apos;à {e.priceMaxFcfa.toLocaleString("fr-FR")}{" "}
                          FCFA
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-semibold text-nuit">
                      Prix sur demande
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3.5 bg-rouge hover:bg-rouge-dark text-blanc font-bold rounded-xl transition-all duration-300 hover:shadow-glow flex items-center justify-center gap-2 text-lg"
                >
                  Réserver maintenant
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-xs text-gris mt-3">
                  Confirmation immédiate · Annulation gratuite
                </p>
              </div>

              {/* Quick info card */}
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-5">
                <h3 className="font-bold text-nuit text-sm mb-3">
                  Points forts
                </h3>
                <div className="space-y-2.5">
                  {e.stars > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-or" />
                      <span className="text-nuit">
                        {e.stars} étoile{e.stars > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <ThumbsUp className="w-4 h-4 text-vert" />
                      <span className="text-nuit">
                        Note {rating.toFixed(1)}/5 ({reviewCount} avis)
                      </span>
                    </div>
                  )}
                  {e.place?.region?.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-or" />
                      <span className="text-nuit">{e.place.region.name}</span>
                    </div>
                  )}
                  {e.amenities?.slice(0, 3).map((a) => {
                    const Icon = AMENITY_META[a.toLowerCase()]?.icon ?? Check;
                    return (
                      <div key={a} className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-vert" />
                        <span className="text-nuit">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation modal */}
      {showModal && (
        <ReservationModal
          establishment={e}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
