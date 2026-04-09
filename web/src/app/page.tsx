"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Map,
  Hotel,
  Compass,
  Landmark,
  Drama,
  Star,
  ArrowRight,
  Tent,
  UtensilsCrossed,
  TreePine,
  Heart,
  Home,
  Car,
  Sparkles,
  Globe,
  Users,
  Calendar,
} from "lucide-react";
import { BookingSearchBar } from "@/components/booking";
import type { LucideIcon } from "lucide-react";
import { statsApi, destinationsApi } from "@/lib/api";
import type { Place } from "@/types/models";
import { useAds } from "@/hooks/useAds";
import { AdBanner } from "@/components/ads";
import { SponsoredCard } from "@/components/ads";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectorIcon } from "@/components/ui/SectorIcon";
import Image from "next/image";

const STAT_ICONS = [
  { key: "totalPlaces", label: "Destinations", Icon: MapPin, suffix: "+" },
  { key: "totalRegions", label: "Régions", Icon: Map, suffix: "" },
  {
    key: "totalEstablishments",
    label: "Hébergements",
    Icon: Hotel,
    suffix: "+",
  },
  { key: "totalSymbols", label: "Symboles", Icon: Drama, suffix: "" },
] as const;

const CATEGORIES: Array<{
  href: string;
  label: string;
  Icon: LucideIcon;
  sector: string;
}> = [
  {
    href: "/destinations?type=site",
    label: "Sites",
    Icon: Landmark,
    sector: "site",
  },
  {
    href: "/destinations?type=nature",
    label: "Nature",
    Icon: TreePine,
    sector: "nature",
  },
  {
    href: "/destinations?type=culture",
    label: "Culture",
    Icon: Drama,
    sector: "culture",
  },
  {
    href: "/reservation?tab=hotel",
    label: "Hôtels",
    Icon: Hotel,
    sector: "hotel",
  },
  { href: "/reservation?tab=gite", label: "Gîtes", Icon: Home, sector: "gite" },
  {
    href: "/reservation?tab=restaurant",
    label: "Restaurants",
    Icon: UtensilsCrossed,
    sector: "restaurant",
  },
  { href: "/reservation?tab=camp", label: "Camps", Icon: Tent, sector: "camp" },
  { href: "/location", label: "Location", Icon: Car, sector: "transport" },
  {
    href: "/itineraires",
    label: "Itinéraires",
    Icon: Compass,
    sector: "itineraire",
  },
];

const MODULES = [
  {
    href: "/carte",
    title: "Carte interactive",
    desc: "Explorez les régions sur une carte avec pins GPS géolocalisés.",
    sector: "carte",
  },
  {
    href: "/destinations",
    title: "Destinations",
    desc: "Réserves UNESCO, cascades, marchés et lieux culturels incontournables.",
    sector: "site",
  },
  {
    href: "/itineraires",
    title: "Itinéraires",
    desc: "Circuits de 2 à 5 jours — safari, culture, nature avec étapes détaillées.",
    sector: "itineraire",
  },
  {
    href: "/reservation",
    title: "Réservations",
    desc: "Hôtels, gîtes et campements avec tarifs en FCFA et équipements.",
    sector: "hotel",
  },
  {
    href: "/atlas",
    title: "Atlas historique",
    desc: "Des royaumes Mossi à Sankara — événements sur 5 ères historiques.",
    sector: "atlas",
  },
  {
    href: "/wiki",
    title: "Wiki Faso",
    desc: "Encyclopédie : peuples, cuisine, festivals, géographie et plus.",
    sector: "wiki",
  },
];

export default function HomePage() {
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

  return (
    <>
      {/* ─── Hero — Premium immersive ─── */}
      <section className="relative pt-nav overflow-hidden">
        <div className="relative h-[480px] sm:h-[560px] md:h-[640px] lg:h-[700px]">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-nuit via-nuit-light to-nuit" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blanc to-transparent z-[1]" />

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-rouge/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-or/10 rounded-full blur-3xl animate-pulse-soft delay-300" />
          <div className="absolute top-40 right-20 w-48 h-48 bg-vert/10 rounded-full blur-3xl animate-pulse-soft delay-150" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blanc/10 backdrop-blur-sm rounded-full border border-blanc/20 text-blanc/80 text-sm mb-6 animate-fade-up">
              <Sparkles className="w-4 h-4 text-or" />
              <span>Le Pays des Hommes Intègres</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-blanc text-center leading-[1.05] mb-4 sm:mb-6 animate-fade-up delay-75">
              Explorez le
              <br />
              <span className="bg-gradient-to-r from-or via-or-vif to-or bg-clip-text text-transparent">
                Burkina Faso
              </span>
            </h1>
            <p className="text-blanc/60 text-base sm:text-lg md:text-xl text-center max-w-2xl mb-8 sm:mb-10 animate-fade-up delay-150 leading-relaxed">
              Destinations authentiques, hébergements de qualité et expériences
              culturelles inoubliables
            </p>

            {/* Search bar — Booking style tabs */}
            <div className="w-full animate-fade-up delay-225">
              <BookingSearchBar />
            </div>

            {/* Quick stats under search */}
            <div className="flex items-center gap-6 sm:gap-8 mt-8 animate-fade-up delay-300">
              <div className="flex items-center gap-2 text-blanc/40">
                <Globe className="w-4 h-4" />
                <span className="text-sm">13 régions</span>
              </div>
              <div className="w-px h-4 bg-blanc/20" />
              <div className="flex items-center gap-2 text-blanc/40">
                <Users className="w-4 h-4" />
                <span className="text-sm">22M habitants</span>
              </div>
              <div className="w-px h-4 bg-blanc/20 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2 text-blanc/40">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">365 jours de soleil</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories — Premium sector pills ─── */}
      <section className="bg-blanc border-b border-sable-2 relative z-10 -mt-6">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blanc rounded-2xl shadow-card border border-sable-2/50 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map(({ href, label, sector }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 text-gris hover:text-nuit transition-all duration-300 shrink-0 group pb-2 border-b-2 border-transparent hover:border-rouge"
                >
                  <SectorIcon
                    type={sector}
                    size="sm"
                    variant="gradient"
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-[11px] sm:text-xs font-semibold whitespace-nowrap tracking-wide">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats row — Premium counters ─── */}
      <section className="bg-blanc py-12 sm:py-16">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-bar mb-10 sm:mb-12 w-24" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {STAT_ICONS.map(({ key, label, Icon, suffix }) => (
              <div key={label} className="flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rouge/8 to-rouge/4 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-rouge" strokeWidth={1.8} />
                </div>
                <div>
                  <div className="stat-number">
                    {stats?.[key] ?? "—"}
                    {suffix}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ad banner ─── */}
      {bannerAds?.[0] && <AdBanner ad={bannerAds[0]} />}

      {/* ─── Featured places — Premium card grid ─── */}
      <section className="bg-sable section-tight">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <span className="text-sm font-semibold text-rouge tracking-wider uppercase mb-2 block">
                Sélection
              </span>
              <h2 className="text-display-xs md:text-display-sm font-display text-nuit">
                Coups de cœur
              </h2>
              <p className="text-gris mt-2 text-body-sm">
                Destinations les plus populaires du Burkina Faso
              </p>
            </div>
            <Link
              href="/destinations"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-rouge hover:text-rouge-dark group transition-colors"
            >
              Tout voir{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {highlights.length > 0
              ? highlights.slice(0, 6).flatMap((place, i) => {
                  const items = [];
                  items.push(
                    <Link
                      href={`/destinations/${place.slug}`}
                      key={place.id}
                      className="group"
                    >
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-card group-hover:shadow-card-hover transition-all duration-500">
                        {place.images?.[0]?.url ? (
                          <Image
                            src={place.images[0].url}
                            alt={place.images[0].caption || place.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        ) : (
                          <PlaceholderImage
                            type={place.type}
                            label={place.name}
                          />
                        )}
                        <div className="card-image-overlay" />
                        {/* Sector badge */}
                        <div className="absolute top-3 left-3">
                          <SectorIcon
                            type={place.type}
                            size="sm"
                            variant="filled"
                            className="shadow-md !bg-blanc/90 backdrop-blur-sm"
                          />
                        </div>
                        <button
                          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-blanc/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blanc/40 active:scale-90"
                          onClick={(ev) => ev.preventDefault()}
                          aria-label="Ajouter aux favoris"
                        >
                          <Heart
                            className="w-5 h-5 text-blanc"
                            strokeWidth={2}
                          />
                        </button>
                        {/* Bottom gradient text */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-nuit/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <p className="text-blanc/80 text-sm line-clamp-2">
                            {place.region?.name && `${place.region.name} · `}
                            {place.type}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-nuit leading-snug group-hover:text-rouge transition-colors duration-300 text-lg">
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
                              <span
                                key={tag}
                                className="badge badge-neutral text-[11px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>,
                  );
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
                    <div className="aspect-[4/3] rounded-2xl skeleton mb-4" />
                    <div className="h-5 w-2/3 skeleton rounded-lg mb-2" />
                    <div className="h-4 w-1/2 skeleton rounded-lg" />
                  </div>
                ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href="/destinations"
              className="btn-primary inline-flex items-center gap-2"
            >
              Toutes les destinations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Modules grid — Premium ─── */}
      <section className="bg-blanc section">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14">
            <span className="text-sm font-semibold text-vert tracking-wider uppercase mb-2 block">
              Plateforme
            </span>
            <h2 className="text-display-xs md:text-display-sm font-display text-nuit mb-3">
              Explorer Faso Atlas
            </h2>
            <p className="text-gris max-w-lg mx-auto text-body-sm">
              Carte interactive, atlas historique, wiki collaborative,
              réservations — tout pour découvrir le Burkina Faso.
            </p>
            <div className="gradient-bar w-16 mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {MODULES.map(({ href, title, desc, sector }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-5 p-6 bg-blanc rounded-2xl border border-sable-2/50 hover:shadow-card-hover hover:border-transparent hover:-translate-y-1 transition-all duration-300"
              >
                <SectorIcon
                  type={sector}
                  size="lg"
                  variant="gradient"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <h3 className="font-bold text-nuit text-lg mb-1.5 group-hover:text-rouge transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-gris leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA — Premium dark ─── */}
      <section className="section">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-nuit via-nuit-light to-nuit rounded-3xl p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-rouge/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-or/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vert/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blanc/10 rounded-full text-blanc/60 text-sm mb-6 border border-blanc/10">
                <Sparkles className="w-4 h-4 text-or" />
                Commencez l&apos;aventure
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-blanc mb-5 leading-tight">
                Prêt à voyager ?
              </h2>
              <p className="text-blanc/50 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                Créez votre compte pour planifier des itinéraires, réserver des
                hébergements et sauvegarder vos lieux favoris.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="btn-gradient px-10 py-4 text-lg"
                >
                  Créer un compte gratuit
                </Link>
                <Link
                  href="/atlas"
                  className="btn-outline px-10 py-4 border-blanc/20 hover:border-blanc/50 text-blanc hover:bg-blanc/5 text-lg"
                >
                  Explorer l&#39;Atlas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
