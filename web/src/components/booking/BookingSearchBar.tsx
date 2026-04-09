"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { mapApi } from "@/lib/api";
import type { Region } from "@/types/models";
import {
  Hotel,
  MapPin,
  Compass,
  Car,
  CalendarDays,
  Users,
  Search,
  ChevronDown,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { clsx } from "clsx";

type SearchTab = "hebergements" | "destinations" | "itineraires" | "location";

const TABS: Array<{
  id: SearchTab;
  label: string;
  icon: typeof Hotel;
}> = [
  { id: "hebergements", label: "Hébergements", icon: Hotel },
  { id: "destinations", label: "Destinations", icon: MapPin },
  { id: "itineraires", label: "Voyages", icon: Compass },
  { id: "location", label: "Location voiture", icon: Car },
];

interface GuestState {
  adults: number;
  children: number;
  rooms: number;
}

export function BookingSearchBar() {
  const router = useRouter();
  const [tab, setTab] = useState<SearchTab>("hebergements");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<GuestState>({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [regionId, setRegionId] = useState("");
  const guestsRef = useRef<HTMLDivElement>(null);

  const { data: regions } = useQuery<Region[]>({
    queryKey: ["regions"],
    queryFn: async () => (await mapApi.getRegions()).data,
    staleTime: Infinity,
  });

  // Close guests dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setGuestsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    switch (tab) {
      case "hebergements":
        if (destination) params.set("q", destination);
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        if (regionId) params.set("regionId", regionId);
        params.set("guests", String(guests.adults + guests.children));
        params.set("rooms", String(guests.rooms));
        router.push(`/reservation?${params.toString()}`);
        break;
      case "destinations":
        if (destination) params.set("q", destination);
        if (regionId) params.set("regionId", regionId);
        router.push(
          destination
            ? `/search?q=${encodeURIComponent(destination)}`
            : `/destinations?${params.toString()}`,
        );
        break;
      case "itineraires":
        if (destination) params.set("q", destination);
        router.push(`/itineraires?${params.toString()}`);
        break;
      case "location":
        if (checkIn) params.set("pickupDate", checkIn);
        if (checkOut) params.set("returnDate", checkOut);
        if (regionId) params.set("regionId", regionId);
        router.push(`/location?${params.toString()}`);
        break;
    }
  };

  const updateGuests = (field: keyof GuestState, delta: number) => {
    setGuests((prev) => {
      const mins: Record<keyof GuestState, number> = {
        adults: 1,
        children: 0,
        rooms: 1,
      };
      const maxs: Record<keyof GuestState, number> = {
        adults: 30,
        children: 10,
        rooms: 10,
      };
      return {
        ...prev,
        [field]: Math.min(
          maxs[field],
          Math.max(mins[field], prev[field] + delta),
        ),
      };
    });
  };

  const guestSummary = `${guests.adults + guests.children} voyageur${
    guests.adults + guests.children > 1 ? "s" : ""
  } · ${guests.rooms} chambre${guests.rooms > 1 ? "s" : ""}`;

  const today = new Date().toISOString().split("T")[0];

  const showDates = tab === "hebergements" || tab === "location";

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              tab === id
                ? "bg-blanc text-nuit shadow-card"
                : "text-blanc/70 hover:text-blanc hover:bg-blanc/10",
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch}>
        <div className="bg-blanc rounded-2xl shadow-premium border border-sable-2/50">
          <div className="bg-blanc rounded-2xl flex flex-col lg:flex-row lg:items-stretch divide-y lg:divide-y-0 lg:divide-x divide-sable-2">
            {/* Destination / Query */}
            <div className="flex-[2] relative">
              <label className="block px-4 pt-3 pb-0">
                <span className="text-[11px] font-bold text-nuit uppercase tracking-wider">
                  {tab === "location"
                    ? "Lieu de prise en charge"
                    : "Destination"}
                </span>
              </label>
              <div className="flex items-center px-4 pb-3">
                <MapPin className="w-5 h-5 text-rouge shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder={
                    tab === "location"
                      ? "Ouagadougou, Bobo-Dioulasso..."
                      : "Où allez-vous ?"
                  }
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-sm text-nuit placeholder:text-gris outline-none bg-transparent font-medium"
                />
                {destination && (
                  <button
                    type="button"
                    onClick={() => setDestination("")}
                    aria-label="Effacer la destination"
                    className="ml-1 text-gris hover:text-nuit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Region quick select */}
              {regions && regions.length > 0 && (
                <div className="px-4 pb-3 -mt-1">
                  <select
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    aria-label="Région"
                    className="text-xs text-gris bg-sable rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="">Toutes les régions</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Check-in / Pickup date */}
            {showDates && (
              <div className="flex-1 min-w-0">
                <label className="block px-4 pt-3 pb-0">
                  <span className="text-[11px] font-bold text-nuit uppercase tracking-wider">
                    {tab === "location" ? "Prise en charge" : "Arrivée"}
                  </span>
                </label>
                <div className="flex items-center px-4 pb-3">
                  <CalendarDays className="w-5 h-5 text-rouge shrink-0 mr-2" />
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    aria-label="Date d'arrivée"
                    className="w-full text-sm text-nuit outline-none bg-transparent font-medium"
                  />
                </div>
              </div>
            )}

            {/* Check-out / Return date */}
            {showDates && (
              <div className="flex-1 min-w-0">
                <label className="block px-4 pt-3 pb-0">
                  <span className="text-[11px] font-bold text-nuit uppercase tracking-wider">
                    {tab === "location" ? "Retour" : "Départ"}
                  </span>
                </label>
                <div className="flex items-center px-4 pb-3">
                  <CalendarDays className="w-5 h-5 text-rouge shrink-0 mr-2" />
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || today}
                    onChange={(e) => setCheckOut(e.target.value)}
                    aria-label="Date de départ"
                    className="w-full text-sm text-nuit outline-none bg-transparent font-medium"
                  />
                </div>
              </div>
            )}

            {/* Guests / Rooms selector */}
            {tab === "hebergements" && (
              <div className="flex-1 min-w-0 relative" ref={guestsRef}>
                <label className="block px-4 pt-3 pb-0">
                  <span className="text-[11px] font-bold text-nuit uppercase tracking-wider">
                    Voyageurs
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setGuestsOpen(!guestsOpen)}
                  className="flex items-center gap-2 px-4 pb-3 w-full"
                >
                  <Users className="w-5 h-5 text-rouge shrink-0" />
                  <span className="text-sm text-nuit font-medium truncate">
                    {guestSummary}
                  </span>
                  <ChevronDown
                    className={clsx(
                      "w-4 h-4 text-gris ml-auto shrink-0 transition-transform",
                      guestsOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Guests dropdown */}
                {guestsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-blanc rounded-2xl shadow-modal border border-sable-2/50 p-4 z-50">
                    {(
                      [
                        {
                          key: "adults" as const,
                          label: "Adultes",
                          desc: "",
                        },
                        {
                          key: "children" as const,
                          label: "Enfants",
                          desc: "0 – 17 ans",
                        },
                        {
                          key: "rooms" as const,
                          label: "Chambres",
                          desc: "",
                        },
                      ] as const
                    ).map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3 border-b border-sable-2 last:border-0"
                      >
                        <div>
                          <span className="text-sm font-medium text-nuit">
                            {label}
                          </span>
                          {desc && (
                            <span className="block text-xs text-gris">
                              {desc}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateGuests(key, -1)}
                            aria-label={`Réduire ${label}`}
                            className="w-8 h-8 rounded-full border border-sable-2 flex items-center justify-center hover:border-nuit transition-colors disabled:opacity-30"
                            disabled={
                              guests[key] <= (key === "children" ? 0 : 1)
                            }
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-nuit">
                            {guests[key]}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateGuests(key, 1)}
                            aria-label={`Ajouter ${label}`}
                            className="w-8 h-8 rounded-full border border-sable-2 flex items-center justify-center hover:border-nuit transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setGuestsOpen(false)}
                      className="mt-3 w-full py-2 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-bold rounded-lg transition-colors"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Search button */}
            <div className="flex items-center p-2 lg:p-1.5">
              <button
                type="submit"
                className="w-full lg:w-auto px-6 py-3.5 bg-rouge hover:bg-rouge-dark text-blanc font-bold rounded-xl transition-all duration-300 hover:shadow-glow flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="lg:hidden">Rechercher</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
