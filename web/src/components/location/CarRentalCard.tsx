"use client";

import type { CarRental } from "@/types/models";
import {
  Car,
  Fuel,
  Users,
  Settings2,
  MapPin,
  Phone,
  Check,
  Star,
} from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const CATEGORY_LABELS: Record<string, string> = {
  economique: "Économique",
  confort: "Confort",
  suv: "SUV / 4×4",
  luxe: "Luxe",
  utilitaire: "Utilitaire",
};

const CATEGORY_COLORS: Record<string, string> = {
  economique: "bg-vert/10 text-vert",
  confort: "bg-or/10 text-or",
  suv: "bg-nuit/10 text-nuit",
  luxe: "bg-rouge/10 text-rouge",
  utilitaire: "bg-gris/10 text-gris",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  manuelle: "Manuelle",
  automatique: "Auto",
};

const FUEL_LABELS: Record<string, string> = {
  essence: "Essence",
  diesel: "Diesel",
  hybride: "Hybride",
  electrique: "Électrique",
};

interface Props {
  car: CarRental;
  onContact: (car: CarRental) => void;
}

export function CarRentalCard({ car, onContact }: Props) {
  return (
    <div className="group rounded-2xl bg-blanc border border-sable-2/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Image / Placeholder */}
      <div className="relative aspect-[16/10] bg-sable-2">
        <PlaceholderImage type="site" label={`${car.brand} ${car.model}`} />
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full ${CATEGORY_COLORS[car.category] ?? "bg-sable text-gris"}`}
        >
          {CATEGORY_LABELS[car.category] ?? car.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-bold text-nuit text-lg leading-snug mb-1 group-hover:text-rouge transition-colors duration-300">
          {car.brand} {car.model}
          {car.year > 0 && (
            <span className="text-gris font-normal text-sm ml-1.5">
              {car.year}
            </span>
          )}
        </h3>

        {/* Location */}
        {car.city && (
          <p className="text-sm text-gris flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            {car.city}
            {car.region?.name && `, ${car.region.name}`}
          </p>
        )}

        {/* Specs row */}
        <div className="flex items-center gap-3 text-xs text-gris mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {car.seats} places
          </span>
          <span className="inline-flex items-center gap-1">
            <Settings2 className="w-3.5 h-3.5" />
            {TRANSMISSION_LABELS[car.transmission] ?? car.transmission}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" />
            {FUEL_LABELS[car.fuelType] ?? car.fuelType}
          </span>
        </div>

        {/* Features */}
        {car.features?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {car.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-sable rounded-full text-[11px] text-gris"
              >
                <Check className="w-3 h-3" strokeWidth={2} />
                {f}
              </span>
            ))}
            {car.features.length > 3 && (
              <span className="text-[11px] text-gris">
                +{car.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-2 pt-3 border-t border-sable-2">
          <div>
            <span className="text-xl font-bold text-nuit">
              {car.pricePerDay.toLocaleString("fr-FR")}
            </span>
            <span className="text-sm text-gris ml-1">FCFA / jour</span>
            {car.depositFcfa > 0 && (
              <p className="text-[11px] text-gris mt-0.5">
                Caution : {car.depositFcfa.toLocaleString("fr-FR")} FCFA
              </p>
            )}
          </div>
          <button
            onClick={() => onContact(car)}
            className="px-5 py-2.5 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-bold rounded-xl transition-all duration-300 hover:shadow-glow active:scale-[0.97] flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            Contacter
          </button>
        </div>
      </div>
    </div>
  );
}
