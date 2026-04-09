import type { Establishment } from "@/types/models";
import {
  Hotel,
  UtensilsCrossed,
  Home,
  Tent,
  Wifi,
  Waves,
  Car,
  Snowflake,
  Wine,
  Sparkles,
  Dumbbell,
  Building,
  Star,
  Check,
  MapPin,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const TYPE_LABELS: Record<string, string> = {
  hotel: "Hôtel",
  restaurant: "Restaurant",
  gite: "Gîte",
  camp: "Camp",
};
const TYPE_ICONS: Record<string, LucideIcon> = {
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  gite: Home,
  camp: Tent,
};
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

interface Props {
  establishment: Establishment;
  onReserve: (e: Establishment) => void;
}

export function EstablishmentCard({ establishment: e, onReserve }: Props) {
  const typeLabel = TYPE_LABELS[e.type] ?? e.type;
  const TypeIcon = TYPE_ICONS[e.type] ?? Building;

  return (
    <div className="group cursor-pointer" onClick={() => onReserve(e)}>
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-sable-2">
        <PlaceholderImage type={e.type} label={e.place?.name} />
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center"
          onClick={(ev) => ev.stopPropagation()}
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-6 h-6 text-blanc drop-shadow-md hover:scale-110 transition-transform" />
        </button>
        {/* Stars */}
        {e.stars > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-0.5 bg-blanc/90 backdrop-blur-sm px-2 py-1 rounded-full">
            {Array.from({ length: e.stars }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-or text-or" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-nuit leading-snug line-clamp-1">
            {e.place?.name ?? `Établissement #${e.id}`}
          </h3>
          <span className="text-xs text-gris bg-sable px-2 py-0.5 rounded-full shrink-0">
            {typeLabel}
          </span>
        </div>

        {e.place?.region?.name && (
          <p className="text-sm text-gris mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {e.place.region.name}
          </p>
        )}

        {/* Amenities */}
        {e.amenities?.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {e.amenities.slice(0, 4).map((a) => {
              const Icon = AMENITY_ICONS[a.toLowerCase()] ?? Check;
              return (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-sable rounded-full text-xs text-gris"
                >
                  <Icon className="w-3 h-3" strokeWidth={1.5} /> {a}
                </span>
              );
            })}
            {e.amenities.length > 4 && (
              <span className="text-xs text-gris">
                +{e.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-3 pt-3 border-t border-sable-2 flex items-end justify-between">
          {e.priceMinFcfa > 0 ? (
            <div>
              <span className="text-lg font-bold text-nuit">
                {e.priceMinFcfa.toLocaleString("fr-FR")}
              </span>
              <span className="text-sm text-gris"> FCFA</span>
              <span className="text-xs text-gris block">par nuit</span>
            </div>
          ) : (
            <p className="text-sm text-gris">Prix sur demande</p>
          )}
          <button
            onClick={(ev) => {
              ev.stopPropagation();
              onReserve(e);
            }}
            className="px-4 py-2 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-semibold rounded-lg transition-colors"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
}
