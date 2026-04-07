import Link from "next/link";
import { clsx } from "clsx";
import type { Place } from "@/types/models";

const TYPE_COLORS = {
  site: { bg: "#C1272D", label: "Site touristique" },
  hotel: { bg: "#006B3C", label: "Hébergement" },
  nature: { bg: "#D4A017", label: "Nature" },
  culture: { bg: "#7C3BBF", label: "Culture" },
};

interface Props {
  place: Place;
  className?: string;
}

export function DestinationCard({ place, className }: Props) {
  const typeInfo = TYPE_COLORS[place.type] ?? TYPE_COLORS.site;
  const image = place.images?.[0]?.url;

  return (
    <Link
      href={`/destinations/${place.slug}`}
      aria-label={`${place.name} — ${typeInfo.label}${place.rating > 0 ? `, note ${place.rating.toFixed(1)}/5` : ""}`}
      className={clsx(
        "group flex flex-col rounded-card overflow-hidden border border-sable-2 bg-blanc shadow-card hover:shadow-faso transition-all duration-300 hover:-translate-y-1",
        className,
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-sable">
        {image ? (
          <img
            src={image}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${typeInfo.bg}22, ${typeInfo.bg}44)`,
            }}
          >
            <div
              className="w-12 h-12 rounded-full opacity-30"
              style={{ backgroundColor: typeInfo.bg }}
            />
          </div>
        )}
        {/* Type badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-pill text-white text-xs font-medium"
          style={{ backgroundColor: typeInfo.bg }}
        >
          {typeInfo.label}
        </span>
        {/* Rating */}
        {place.rating > 0 && (
          <span
            className="absolute bottom-3 right-3 px-2 py-1 bg-nuit/80 backdrop-blur-sm rounded text-or text-xs font-medium flex items-center gap-1"
            aria-label={`Note : ${place.rating.toFixed(1)} sur 5`}
          >
            <span aria-hidden="true">★</span> {place.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg text-nuit leading-tight group-hover:text-rouge transition-colors line-clamp-2">
            {place.name}
          </h3>
        </div>

        {place.region?.name && (
          <p className="text-xs text-gris mb-2 flex items-center gap-1">
            <svg
              width="12"
              height="12"
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

        <p className="text-sm text-gris leading-relaxed line-clamp-2 flex-1">
          {place.description}
        </p>

        {/* Tags */}
        {place.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-sable text-terre text-xs rounded-pill"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {place.reviewCount > 0 && (
          <p className="text-xs text-gris mt-3">{place.reviewCount} avis</p>
        )}
      </div>
    </Link>
  );
}
