import Link from "next/link";
import { clsx } from "clsx";
import { Star, Heart, MapPin } from "lucide-react";
import type { Place } from "@/types/models";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

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
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-sable-2 shadow-sm group-hover:shadow-card transition-shadow duration-300">
        <PlaceholderImage type={place.type} label={place.name} />
        {/* Heart button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 active:scale-95"
          onClick={(e) => e.preventDefault()}
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-6 h-6 text-blanc drop-shadow-md hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-nuit leading-snug line-clamp-1 group-hover:text-rouge transition-colors duration-200">
            {place.name}
          </h3>
          {place.rating > 0 && (
            <span className="flex items-center gap-1 text-sm font-medium text-nuit shrink-0">
              <Star className="w-3.5 h-3.5 fill-or text-or" />
              {place.rating.toFixed(1)}
            </span>
          )}
        </div>

        {place.region?.name && (
          <p className="text-sm text-gris mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {place.region.name}
          </p>
        )}

        <p className="text-sm text-gris mt-0.5 capitalize">{place.type}</p>

        {place.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {place.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge badge-neutral">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
