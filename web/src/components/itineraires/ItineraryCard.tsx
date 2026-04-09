import Link from "next/link";
import type { Itinerary } from "@/types/models";

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  facile: { bg: "#006B3C", text: "Facile" },
  modéré: { bg: "#D4A017", text: "Modéré" },
  difficile: { bg: "#C1272D", text: "Difficile" },
};

interface Props {
  itinerary: Itinerary;
}

export function ItineraryCard({ itinerary }: Props) {
  const diff =
    DIFFICULTY_COLORS[itinerary.difficulty as keyof typeof DIFFICULTY_COLORS] ??
    DIFFICULTY_COLORS["modéré"];
  const firstStop = itinerary.stops?.[0];
  const lastStop = itinerary.stops?.[itinerary.stops.length - 1];

  return (
    <div className="group rounded-2xl bg-blanc border border-sable-2/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col overflow-hidden">
      {/* Header gradient */}
      <div className="gradient-bar" />

      <div className="p-5 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-3 py-1 bg-nuit text-blanc text-xs font-semibold rounded-full">
            {itinerary.durationDays} jour{itinerary.durationDays > 1 ? "s" : ""}
          </span>
          <span
            className={`px-3 py-1 text-blanc text-xs font-semibold rounded-full`}
            style={{ backgroundColor: diff.bg }}
          >
            {diff.text}
          </span>
          {itinerary.budgetFcfa > 0 && (
            <span className="ml-auto text-xs text-gris">
              ~{itinerary.budgetFcfa.toLocaleString("fr-FR")} FCFA
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl text-nuit mb-2 group-hover:text-rouge transition-colors line-clamp-2">
          {itinerary.title}
        </h3>
        <p className="text-sm text-gris leading-relaxed line-clamp-2 mb-4">
          {itinerary.description}
        </p>

        {/* Stops preview */}
        {itinerary.stops?.length > 0 && (
          <div className="flex-1 mb-4">
            <p className="text-xs text-gris uppercase tracking-wider font-medium mb-2">
              {itinerary.stops.length} étape
              {itinerary.stops.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-1.5">
              {itinerary.stops.slice(0, 3).map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sable text-nuit text-xs flex items-center justify-center font-medium shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-nuit truncate">
                    {stop.place?.name ?? `Étape ${i + 1}`}
                  </span>
                  {stop.duration && (
                    <span className="text-gris text-xs ml-auto shrink-0">
                      {stop.duration}
                    </span>
                  )}
                </div>
              ))}
              {itinerary.stops.length > 3 && (
                <p className="text-xs text-gris pl-7">
                  +{itinerary.stops.length - 3} autre
                  {itinerary.stops.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Route summary */}
        {firstStop && lastStop && firstStop.id !== lastStop.id && (
          <div className="text-xs text-gris flex items-center gap-1 mb-4">
            <span>{firstStop.place?.name}</span>
            <span>→</span>
            <span>{lastStop.place?.name}</span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/itineraires/${itinerary.id}`}
          className="mt-auto block text-center py-2.5 bg-rouge hover:bg-rouge/90 text-blanc text-sm font-semibold rounded-full transition-all shadow-sm hover:shadow-md"
        >
          Voir l'itinéraire
        </Link>
      </div>
    </div>
  );
}
