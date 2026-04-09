"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { establishmentsApi } from "@/lib/api";
import {
  BookingEstablishmentCard,
  BookingFiltersPanel,
  type BookingFilters,
} from "@/components/booking";
import { ReservationModal } from "@/components/reservation/ReservationModal";
import type { Establishment, PaginatedResponse } from "@/types/models";
import { Hotel, MapPin, SlidersHorizontal, X } from "lucide-react";
import { useAds } from "@/hooks/useAds";
import { AdBanner } from "@/components/ads";
import { clsx } from "clsx";

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const qCheckIn = searchParams.get("checkIn") ?? "";
  const qCheckOut = searchParams.get("checkOut") ?? "";
  const qGuests = Number(searchParams.get("guests")) || 2;
  const qRegionId = searchParams.get("regionId") ?? "";
  const qQuery = searchParams.get("q") ?? "";

  const [selectedEstab, setSelectedEstab] = useState<Establishment | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<BookingFilters>({
    type: "",
    stars: "",
    regionId: qRegionId,
    priceMin: "",
    priceMax: "",
    amenities: [],
    sort: "recommended",
  });

  const { data: bannerAds } = useAds("banner", "reservation", 1);

  // Fetch all establishments for client-side filtering (since API has limited params)
  const { data, isLoading } = useQuery<PaginatedResponse<Establishment>>({
    queryKey: ["establishments", filters.type, filters.stars, filters.regionId],
    queryFn: async () => {
      const res = await establishmentsApi.list({
        type: filters.type || undefined,
        stars: filters.stars ? Number(filters.stars) : undefined,
        regionId: filters.regionId ? Number(filters.regionId) : undefined,
        page: 1,
      });
      return res.data;
    },
  });

  const allEstablishments = data?.data ?? [];

  // Client-side filtering for price, amenities, search query
  const filtered = useMemo(() => {
    let items = [...allEstablishments];

    // Name search from URL
    if (qQuery) {
      const q = qQuery.toLowerCase();
      items = items.filter(
        (e) =>
          (e.place?.name ?? "").toLowerCase().includes(q) ||
          (e.place?.region?.name ?? "").toLowerCase().includes(q),
      );
    }

    // Price filter
    if (filters.priceMin) {
      items = items.filter((e) => e.priceMinFcfa >= Number(filters.priceMin));
    }
    if (filters.priceMax) {
      items = items.filter((e) => e.priceMinFcfa <= Number(filters.priceMax));
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      items = items.filter((e) =>
        filters.amenities.every((a) =>
          e.amenities?.some((ea) => ea.toLowerCase() === a),
        ),
      );
    }

    // Sort
    switch (filters.sort) {
      case "price_asc":
        items.sort((a, b) => a.priceMinFcfa - b.priceMinFcfa);
        break;
      case "price_desc":
        items.sort((a, b) => b.priceMinFcfa - a.priceMinFcfa);
        break;
      case "rating":
        items.sort((a, b) => (b.place?.rating ?? 0) - (a.place?.rating ?? 0));
        break;
      case "stars_desc":
        items.sort((a, b) => b.stars - a.stars);
        break;
    }

    return items;
  }, [allEstablishments, qQuery, filters]);

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="border-b border-sable-2 pt-8 sm:pt-10 pb-4 sm:pb-6">
        <div className="max-w-container mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-nuit">
            {qQuery ? `Résultats pour « ${qQuery} »` : "Hébergements"}
          </h1>
          <p className="text-gris mt-2 text-sm sm:text-base">
            {qCheckIn && (
              <span>
                {new Date(qCheckIn).toLocaleDateString("fr-FR")}
                {qCheckOut &&
                  ` → ${new Date(qCheckOut).toLocaleDateString("fr-FR")}`}
                {" · "}
              </span>
            )}
            {qGuests > 0 && (
              <span>
                {qGuests} voyageur{qGuests > 1 ? "s" : ""}
                {" · "}
              </span>
            )}
            <span className="font-semibold text-nuit">{filtered.length}</span>{" "}
            établissement{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Ad Banner */}
      {bannerAds?.[0] && <AdBanner ad={bannerAds[0]} />}

      {/* Mobile filter toggle */}
      <div className="lg:hidden sticky top-nav z-30 bg-blanc border-b border-sable-2 px-4 py-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-sable-2 rounded-lg text-sm font-medium hover:shadow-sm transition-shadow w-full justify-center"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtrer & trier
          {showFilters && <X className="w-4 h-4 ml-auto" />}
        </button>
      </div>

      {/* Main layout — Booking split */}
      <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar — desktop always visible, mobile conditional */}
          <div
            className={clsx(
              "w-72 shrink-0",
              showFilters
                ? "fixed inset-0 top-nav z-40 bg-blanc overflow-y-auto p-4 lg:relative lg:inset-auto lg:p-0 lg:bg-transparent"
                : "hidden lg:block",
            )}
          >
            {showFilters && (
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden mb-4 flex items-center gap-2 text-sm font-medium text-rouge"
              >
                <X className="w-4 h-4" /> Fermer les filtres
              </button>
            )}
            <BookingFiltersPanel
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setShowFilters(false);
              }}
              total={filtered.length}
              className="sticky top-[calc(var(--nav-h,72px)+1.5rem)]"
            />
          </div>

          {/* Results list */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card flex flex-col sm:flex-row overflow-hidden"
                  >
                    <div className="w-full sm:w-56 aspect-[4/3] sm:aspect-auto sm:h-48 skeleton" />
                    <div className="flex-1 p-5 space-y-3">
                      <div className="h-5 w-2/3 skeleton rounded" />
                      <div className="h-4 w-1/3 skeleton rounded" />
                      <div className="h-3 w-1/2 skeleton rounded" />
                      <div className="h-8 w-32 skeleton rounded mt-4 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-blanc rounded-2xl border border-sable-2/50 shadow-card py-20 text-center">
                <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hotel className="w-8 h-8 text-gris" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-nuit mb-2">
                  Aucun établissement trouvé
                </h3>
                <p className="text-gris text-sm mb-4">
                  Essayez de modifier vos filtres ou votre recherche.
                </p>
                <p className="text-sm text-gris">
                  Vous êtes propriétaire ?{" "}
                  <a
                    href="/register?role=owner"
                    className="text-rouge font-medium hover:underline"
                  >
                    Enregistrez votre établissement
                  </a>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((e) => (
                  <BookingEstablishmentCard
                    key={e.id}
                    establishment={e}
                    onReserve={setSelectedEstab}
                    checkIn={qCheckIn}
                    checkOut={qCheckOut}
                    guests={qGuests}
                  />
                ))}
              </div>
            )}

            {/* CTA */}
            {!isLoading && (
              <div className="mt-8 bg-blanc rounded-2xl border border-sable-2/50 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rouge/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-rouge" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-nuit">
                    Vous gérez un hébergement ?
                  </h3>
                  <p className="text-sm text-gris mt-1">
                    Inscrivez votre établissement gratuitement et touchez des
                    voyageurs du monde entier.
                  </p>
                </div>
                <a
                  href="/register?role=owner"
                  className="px-6 py-3 bg-rouge hover:bg-rouge-dark text-blanc font-bold rounded-lg transition-colors text-sm shrink-0"
                >
                  Enregistrer
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation modal */}
      {selectedEstab && (
        <ReservationModal
          establishment={selectedEstab}
          onClose={() => setSelectedEstab(null)}
        />
      )}
    </div>
  );
}
