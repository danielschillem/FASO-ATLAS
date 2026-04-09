"use client";

import type { Establishment } from "@/types/models";
import {
  Star,
  MapPin,
  Wifi,
  Waves,
  Car,
  Snowflake,
  Wine,
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Check,
  ThumbsUp,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import Image from "next/image";
import Link from "next/link";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  piscine: Waves,
  restaurant: UtensilsCrossed,
  parking: Car,
  climatisation: Snowflake,
  bar: Wine,
  spa: Sparkles,
  gym: Dumbbell,
};

const TYPE_LABELS: Record<string, string> = {
  hotel: "Hôtel",
  restaurant: "Restaurant",
  gite: "Gîte",
  camp: "Camp & Lodge",
};

interface Props {
  establishment: Establishment;
  onReserve: (e: Establishment) => void;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export function BookingEstablishmentCard({
  establishment: e,
  onReserve,
  checkIn,
  checkOut,
  guests,
}: Props) {
  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              86400000,
          ),
        )
      : 1;
  const totalPrice = e.priceMinFcfa * nights;

  const ratingLabel = (r: number) => {
    if (r >= 4.5) return "Exceptionnel";
    if (r >= 4) return "Superbe";
    if (r >= 3.5) return "Très bien";
    if (r >= 3) return "Bien";
    return "Correct";
  };

  const rating = e.place?.rating ?? 0;
  const reviewCount = e.place?.reviewCount ?? 0;

  return (
    <div className="group bg-blanc border border-sable-2/50 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-500 flex flex-col sm:flex-row">
      {/* Image */}
      <div className="relative w-full sm:w-56 md:w-64 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-auto">
        <Link href={`/reservation/${e.id}`}>
          {e.place?.images?.[0]?.url ? (
            <Image
              src={e.place.images[0].url}
              alt={e.place.images[0].caption || e.place?.name || ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 256px"
            />
          ) : (
            <PlaceholderImage type={e.type} label={e.place?.name} />
          )}
        </Link>
        <button
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-blanc/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blanc/40 active:scale-90"
          onClick={(ev) => ev.stopPropagation()}
          aria-label="Sauvegarder"
        >
          <Heart className="w-5 h-5 text-blanc" strokeWidth={2} />
        </button>
        {/* Stars badge */}
        {e.stars > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-blanc/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
            {Array.from({ length: e.stars }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-or text-or" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 min-w-0">
        <div className="flex-1">
          {/* Title + Type */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <Link
                href={`/reservation/${e.id}`}
                className="text-lg font-bold text-nuit hover:text-rouge transition-colors duration-300 line-clamp-1"
              >
                {e.place?.name ?? `Établissement #${e.id}`}
              </Link>
              <span className="text-xs text-gris ml-2">
                {TYPE_LABELS[e.type] ?? e.type}
              </span>
            </div>

            {/* Rating badge — Booking style */}
            {rating > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden md:block">
                  <span className="text-sm font-semibold text-nuit">
                    {ratingLabel(rating)}
                  </span>
                  {reviewCount > 0 && (
                    <span className="block text-xs text-gris">
                      {reviewCount} avis
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-nuit bg-or/10 px-2.5 py-1 rounded-full shrink-0">
                  <Star className="w-3.5 h-3.5 fill-or text-or" />
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          {e.place?.region?.name && (
            <p className="text-sm text-gris flex items-center gap-1 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              {e.place.region.name}
            </p>
          )}

          {/* Amenities */}
          {e.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
              {e.amenities.slice(0, 5).map((a) => {
                const Icon = AMENITY_ICONS[a.toLowerCase()] ?? Check;
                return (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 text-xs text-vert-dark"
                  >
                    <Icon className="w-3 h-3" strokeWidth={2} />
                    {a}
                  </span>
                );
              })}
              {e.amenities.length > 5 && (
                <span className="text-xs text-gris">
                  +{e.amenities.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Availability tag */}
          {e.isAvailable && (
            <div className="flex items-center gap-1.5 text-xs text-vert font-medium mb-2">
              <ThumbsUp className="w-3.5 h-3.5" />
              Disponible — réservation immédiate
            </div>
          )}
        </div>

        {/* Price + CTA — bottom right */}
        <div className="flex items-end justify-between pt-3 border-t border-sable-2 mt-auto">
          <div className="text-xs text-gris">
            {nights > 1 && (
              <span>
                {nights} nuits, {guests ?? 2} voyageur
                {(guests ?? 2) > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="text-right">
            {e.priceMinFcfa > 0 ? (
              <>
                <div className="text-2xl font-bold text-nuit">
                  {totalPrice.toLocaleString("fr-FR")}{" "}
                  <span className="text-sm font-normal text-gris">FCFA</span>
                </div>
                <p className="text-xs text-gris">
                  {nights > 1
                    ? `${e.priceMinFcfa.toLocaleString("fr-FR")} FCFA / nuit`
                    : "par nuit"}
                </p>
              </>
            ) : (
              <p className="text-sm text-gris font-medium">Prix sur demande</p>
            )}
            <button
              onClick={() => onReserve(e)}
              className="mt-2 px-5 py-2.5 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-glow active:scale-[0.97]"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
