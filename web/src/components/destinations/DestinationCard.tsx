import Link from "next/link";
import { clsx } from "clsx";
import { Star, Heart, MapPin } from "lucide-react";
import type { Place } from "@/types/models";
import Image from "next/image";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectorIcon } from "@/components/ui/SectorIcon";

interface Props {
  place: Place;
  className?: string;
}

export function DestinationCard({ place, className }: Props) {
  return (
    <Link
      href={`/destinations/${place.slug}`}
      aria-label={place.name}
      className={clsx("group block", className)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-sable-2 shadow-card group-hover:shadow-card-hover transition-all duration-500">
        {place.images?.[0]?.url ? (
          <Image
            src={place.images[0].url}
            alt={place.images[0].caption || place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <PlaceholderImage type={place.type} label={place.name} />
        )}
        <div className="card-image-overlay" />
        {/* Sector icon */}
        <div className="absolute top-3 left-3">
          <SectorIcon
            type={place.type}
            size="sm"
            className="shadow-md !bg-blanc/90 backdrop-blur-sm"
          />
        </div>
        {/* Heart button */}
        <button
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-blanc/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:bg-blanc/40 active:scale-90"
          onClick={(e) => e.preventDefault()}
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-5 h-5 text-blanc" strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-nuit text-lg leading-snug line-clamp-1 group-hover:text-rouge transition-colors duration-300">
            {place.name}
          </h3>
          {place.rating > 0 && (
            <span className="flex items-center gap-1 text-sm font-semibold text-nuit bg-or/10 px-2 py-0.5 rounded-full shrink-0">
              <Star className="w-3.5 h-3.5 fill-or text-or" />
              {place.rating.toFixed(1)}
            </span>
          )}
        </div>

        {place.region?.name && (
          <p className="text-sm text-gris mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {place.region.name}
          </p>
        )}

        {place.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {place.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge badge-neutral text-[11px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
