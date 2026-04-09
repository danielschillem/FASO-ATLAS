"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Map,
  Hotel,
  Compass,
  Scroll,
  BookOpen,
  Landmark,
  Drama,
  Search,
  Star,
  ArrowRight,
  ChevronRight,
  Tent,
  UtensilsCrossed,
  TreePine,
  Heart,
  Home,
  Car,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { statsApi, destinationsApi } from "@/lib/api";
import type { Place } from "@/types/models";
import { useAds } from "@/hooks/useAds";
import { AdBanner } from "@/components/ads";
import { SponsoredCard } from "@/components/ads";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const STAT_ICONS = [
  { key: "totalPlaces", label: "Destinations", Icon: MapPin },
  { key: "totalRegions", label: "Régions", Icon: Map },
  { key: "totalEstablishments", label: "Hébergements", Icon: Hotel },
  { key: "totalSymbols", label: "Symboles", Icon: Drama },
] as const;

const CATEGORIES: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: "/destinations?type=site", label: "Sites", Icon: Landmark },
  { href: "/destinations?type=nature", label: "Nature", Icon: TreePine },
  { href: "/destinations?type=culture", label: "Culture", Icon: Drama },
  { href: "/reservation?tab=hotel", label: "Hôtels", Icon: Hotel },
  { href: "/reservation?tab=gite", label: "Gîtes", Icon: Home },
  {
    href: "/reservation?tab=restaurant",
    label: "Restaurants",
    Icon: UtensilsCrossed,
  },
  { href: "/reservation?tab=camp", label: "Camps", Icon: Tent },
  { href: "/location", label: "Location", Icon: Car },
  { href: "/itineraires", label: "Itinéraires", Icon: Compass },
];

const MODULES = [
  {
    href: "/carte",
    title: "Carte interactive",
    desc: "Explorez les régions sur une carte avec pins GPS géolocalisés.",
    Icon: Map,
  },
  {
    href: "/destinations",
    title: "Destinations",
    desc: "Réserves UNESCO, cascades, marchés et lieux culturels incontournables.",
    Icon: Landmark,
  },
  {
    href: "/itineraires",
    title: "Itinéraires",
    desc: "Circuits de 2 à 5 jours — safari, culture, nature avec étapes détaillées.",
    Icon: Compass,
  },
  {
    href: "/reservation",
    title: "Réservations",
    desc: "Hôtels, gîtes et campements avec tarifs en FCFA et équipements.",
    Icon: Hotel,
  },
  {
    href: "/atlas",
    title: "Atlas historique",
    desc: "Des royaumes Mossi à Sankara — événements sur 5 ères historiques.",
    Icon: Scroll,
  },
  {
    href: "/wiki",
    title: "Wiki Faso",
    desc: "Encyclopédie : peuples, cuisine, festivals, géographie et plus.",
    Icon: BookOpen,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => statsApi.get().then((r) => r.data),
    staleTime: 60_000,
  });

  const { data: highlightsData } = useQuery({
    queryKey: ["highlights"],
    queryFn: () =>
      destinationsApi.list({ limit: 6 }).then((r) => r.data.data ?? r.data),
    staleTime: 60_000,
  });

  const highlights: Place[] = Array.isArray(highlightsData)
    ? highlightsData
    : [];

  const { data: bannerAds } = useAds("banner", "home", 1);
  const { data: cardAds } = useAds("card", "home", 2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* ─── Hero — Airbnb search-first ─── */}
      <section className="relative pt-nav overflow-hidden">
        <div className="relative h-[520px] md:h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-br from-vert/30 via-rouge/20 to-or/30" />
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <MapPin className="w-64 h-64 text-blanc" strokeWidth={0.5} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-nuit/60 via-nuit/30 to-nuit/70" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-blanc text-center leading-tight mb-4 animate-fade-up">
              Explorez le Burkina Faso
            </h1>
            <p className="text-blanc/80 text-lg md:text-xl text-center max-w-xl mb-8 animate-fade-up delay-75">
              Destinations, hébergements et expériences au Pays des Hommes
              Intègres
            </p>

            {/* Search bar — Airbnb style */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-2xl animate-fade-up delay-150"
            >
              <div className="flex items-center bg-blanc/95 backdrop-blur-sm rounded-full shadow-modal p-2 pl-6 hover:bg-blanc transition-colors duration-200">
                <Search className="w-5 h-5 text-gris shrink-0" />
                <input
                  type="text"
                  placeholder="Où voulez-vous aller ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-nuit placeholder:text-gris-light outline-none bg-transparent text-lg"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-rouge hover:bg-rouge-dark text-blanc font-semibold rounded-full transition-all duration-200 hover:shadow-md active:scale-[0.97]"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Categories — Airbnb icon-pills ─── */}
      <section className="bg-blanc border-b border-sable-2">
        <div className="max-w-container mx-auto px-6 py-6">
          <div className="flex items-center gap-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 text-gris hover:text-nuit transition-colors shrink-0 group pb-2 border-b-2 border-transparent hover:border-nuit"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats row ─── */}
      <section className="bg-blanc py-10 border-b border-sable-2">
        <div className="max-w-container mx-auto px-6">
          <div className="gradient-bar mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STAT_ICONS.map(({ key, label, Icon }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rouge/5 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-rouge" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-nuit">
                    {stats?.[key] ?? "—"}
                  </div>
                  <div className="text-sm text-gris">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ad banner ─── */}
      {bannerAds?.[0] && <AdBanner ad={bannerAds[0]} />}

      {/* ─── Featured places — Airbnb card grid ─── */}
      <section className="bg-blanc section">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-nuit">
                Coups de cœur
              </h2>
              <p className="text-gris mt-1">Destinations les plus populaires</p>
            </div>
            <Link
              href="/destinations"
              className="hidden md:flex items-center gap-1 text-sm font-semibold text-nuit hover:underline"
            >
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.length > 0
              ? highlights.slice(0, 6).flatMap((place, i) => {
                  const items = [];
                  items.push(
                    <Link
                      href={`/destinations/${place.slug}`}
                      key={place.id}
                      className="group"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-card transition-shadow duration-300">
                        <PlaceholderImage
                          type={place.type}
                          label={place.name}
                        />
                        <button
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-95"
                          onClick={(ev) => ev.preventDefault()}
                          aria-label="Ajouter aux favoris"
                        >
                          <Heart className="w-6 h-6 text-blanc drop-shadow-md hover:scale-110 transition-transform" />
                        </button>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-nuit leading-snug">
                            {place.name}
                          </h3>
                          {place.region?.name && (
                            <p className="text-sm text-gris mt-0.5">
                              {place.region.name}
                            </p>
                          )}
                          <p className="text-sm text-gris mt-0.5 capitalize">
                            {place.type}
                          </p>
                        </div>
                        {place.rating > 0 && (
                          <span className="flex items-center gap-1 text-sm font-medium text-nuit shrink-0">
                            <Star className="w-4 h-4 fill-or text-or" />
                            {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </Link>,
                  );
                  // Insert sponsored card after the 3rd real card
                  if (i === 2 && cardAds?.[0]) {
                    items.push(
                      <SponsoredCard
                        key={`ad-${cardAds[0].id}`}
                        ad={cardAds[0]}
                      />,
                    );
                  }
                  return items;
                })
              : [0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <div className="aspect-[4/3] rounded-xl skeleton mb-3" />
                    <div className="h-4 w-2/3 skeleton rounded mb-2" />
                    <div className="h-3 w-1/2 skeleton rounded" />
                  </div>
                ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/destinations"
              className="btn-secondary inline-flex items-center gap-2"
            >
              Toutes les destinations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Modules grid ─── */}
      <section className="bg-sable section">
        <div className="max-w-container mx-auto px-6">
          <div className="mb-10">
            <div className="gradient-bar w-16 mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-nuit">
              Explorer Faso Atlas
            </h2>
            <p className="text-gris mt-2 max-w-lg">
              Carte interactive, atlas historique, wiki collaborative,
              réservations — tout pour découvrir le Burkina Faso.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map(({ href, title, desc, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 p-5 bg-blanc rounded-xl border border-sable-2 hover:shadow-card hover:border-transparent transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-rouge/5 flex items-center justify-center shrink-0 group-hover:bg-rouge/10 transition-colors">
                  <Icon className="w-5 h-5 text-rouge" />
                </div>
                <div>
                  <h3 className="font-semibold text-nuit mb-1 group-hover:text-rouge transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-gris leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-blanc section">
        <div className="max-w-container mx-auto px-6">
          <div className="bg-nuit rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-blanc mb-4">
                Prêt à voyager ?
              </h2>
              <p className="text-blanc/60 mb-8 max-w-lg mx-auto">
                Créez votre compte pour planifier des itinéraires, réserver des
                hébergements et sauvegarder vos lieux favoris.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="btn-primary px-8 py-3.5 hover:shadow-lg"
                >
                  Créer un compte gratuit
                </Link>
                <Link
                  href="/atlas"
                  className="btn-outline px-8 py-3.5 border-blanc/20 hover:border-blanc/50 text-blanc hover:bg-blanc/5"
                >
                  Explorer l&#39;Atlas historique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
