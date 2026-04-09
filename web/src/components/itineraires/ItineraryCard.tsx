import Link from "next/link";
import type { Itinerary } from "@/types/models";
import { ArrowRight } from "lucide-react";

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
    <div className="group rounded-2xl bg-blanc border border-sable-2/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 flex flex-col overflow-hidden">
      {/* Header gradient */}
      <div className="gradient-bar" />

      <div className="p-6 flex flex-col flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1.5 bg-nuit text-blanc text-xs font-bold rounded-full tracking-wide">
            {itinerary.durationDays} jour{itinerary.durationDays > 1 ? "s" : ""}
          </span>
          <span
            className="px-3 py-1.5 text-blanc text-xs font-bold rounded-full"
            style={{ backgroundColor: diff.bg }}
          >
            {diff.text}
          </span>
          {itinerary.budgetFcfa > 0 && (
            <span className="ml-auto text-xs font-semibold text-gris bg-sable px-3 py-1 rounded-full">
              ~{itinerary.budgetFcfa.toLocaleString("fr-FR")} FCFA
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-xl text-nuit mb-2 group-hover:text-rouge transition-colors duration-300 line-clamp-2 font-bold">
          {itinerary.title}
        </h3>
        <p className="text-sm text-gris leading-relaxed line-clamp-2 mb-5">
          {itinerary.description}
        </p>

        {/* Stops preview */}
        {itinerary.stops?.length > 0 && (
          <div className="flex-1 mb-5">
            <p className="text-xs text-gris uppercase tracking-widest font-bold mb-3">
              {itinerary.stops.length} étape
              {itinerary.stops.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-2">
              {itinerary.stops.slice(0, 3).map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-rouge/8 text-rouge text-xs flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-nuit font-medium truncate">
                    {stop.place?.name ?? `Étape ${i + 1}`}
                  </span>
                  {stop.duration && (
                    <span className="text-gris-light text-xs ml-auto shrink-0">
                      {stop.duration}
                    </span>
                  )}
                </div>
              ))}
              {itinerary.stops.length > 3 && (
                <p className="text-xs text-gris-light pl-9">
                  +{itinerary.stops.length - 3} autre
                  {itinerary.stops.length - 3 > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Route summary */}
        {firstStop && lastStop && firstStop.id !== lastStop.id && (
          <div className="text-xs text-gris flex items-center gap-1.5 mb-5 bg-sable px-3 py-2 rounded-xl">
            <span className="font-medium">{firstStop.place?.name}</span>
            <span className="text-gris-light">→</span>
            <span className="font-medium">{lastStop.place?.name}</span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/itineraires/${itinerary.id}`}
          className="mt-auto flex items-center justify-center gap-2 py-3 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-glow group-hover:gap-3"
        >
          Voir l&apos;itinéraire
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
