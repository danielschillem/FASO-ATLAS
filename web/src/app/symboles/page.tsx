"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { symbolsApi } from "@/lib/api";
import type { Symbol as SymbolModel } from "@/types/models";
import { clsx } from "clsx";
import {
  Crown,
  Flag,
  Music2,
  Palette,
  Drama,
  TreePine,
  Sparkles,
  Users,
  Scroll,
  ChevronDown,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";

/* ─── Category metadata ─── */
interface CategoryInfo {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  accent: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    key: "légende",
    label: "Légendes fondatrices",
    Icon: Crown,
    color: "#7C3B1E",
    accent: "#F0B429",
  },
  {
    key: "drapeau",
    label: "Emblèmes nationaux",
    Icon: Flag,
    color: "#1A5632",
    accent: "#6EE7B7",
  },
  {
    key: "hymne",
    label: "Hymne & Chants",
    Icon: Music2,
    color: "#742A2A",
    accent: "#FC8181",
  },
  {
    key: "artisanat",
    label: "Artisanat & Textile",
    Icon: Palette,
    color: "#5B3A1E",
    accent: "#FBBF24",
  },
  {
    key: "masque",
    label: "Masques sacrés",
    Icon: Drama,
    color: "#2D3748",
    accent: "#90CDF4",
  },
  {
    key: "festival",
    label: "Festivals & Célébrations",
    Icon: Sparkles,
    color: "#553C9A",
    accent: "#D6BCFA",
  },
  {
    key: "musique",
    label: "Instruments de musique",
    Icon: Music2,
    color: "#9C4221",
    accent: "#FBD38D",
  },
  {
    key: "institution",
    label: "Institutions traditionnelles",
    Icon: Shield,
    color: "#1A365D",
    accent: "#63B3ED",
  },
  {
    key: "nature",
    label: "Nature & Ressources",
    Icon: TreePine,
    color: "#22543D",
    accent: "#9AE6B4",
  },
  {
    key: "tradition",
    label: "Traditions sociales",
    Icon: Users,
    color: "#702459",
    accent: "#FBB6CE",
  },
];

function getCategoryInfo(cat: string): CategoryInfo {
  return (
    CATEGORIES.find((c) => c.key === cat) ?? {
      key: cat,
      label: cat,
      Icon: Scroll,
      color: "#2D3748",
      accent: "#CBD5E0",
    }
  );
}

/* ─── Real images for each symbol (by sortOrder) ─── */
const SYMBOL_IMAGES: Record<number, { src: string; credit: string }> = {
  1: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Yennenga_statue_ouagadougou.jpg/800px-Yennenga_statue_ouagadougou.jpg",
    credit: "Statue de Yennenga, Ouagadougou",
  },
  2: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/1280px-Flag_of_Burkina_Faso.svg.png",
    credit: "Drapeau du Burkina Faso",
  },
  3: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Coat_of_arms_of_Burkina_Faso.svg/800px-Coat_of_arms_of_Burkina_Faso.svg.png",
    credit: "Armoiries du Burkina Faso",
  },
  4: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Bogolan_mali.jpg/800px-Bogolan_mali.jpg",
    credit: "Bogolan traditionnel",
  },
  5: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Masque_bwa_-_Mus%C3%A9e_Africain_de_Lyon.jpg/800px-Masque_bwa_-_Mus%C3%A9e_Africain_de_Lyon.jpg",
    credit: "Masque Bwa — Musée Africain de Lyon",
  },
  6: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/SIAO_2004.jpg/800px-SIAO_2004.jpg",
    credit: "SIAO — Ouagadougou",
  },
  7: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Balafon_Burkina_Faso.jpg/800px-Balafon_Burkina_Faso.jpg",
    credit: "Balafon, Burkina Faso",
  },
  8: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Djembe_drum.jpg/800px-Djembe_drum.jpg",
    credit: "Djembé traditionnel",
  },
  9: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Mogho_Naba_1930.jpg/800px-Mogho_Naba_1930.jpg",
    credit: "Mogho Naaba, cérémonie traditionnelle",
  },
  10: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Vitellaria_paradoxa_MS4195.jpg/800px-Vitellaria_paradoxa_MS4195.jpg",
    credit: "Arbre à karité (Vitellaria paradoxa)",
  },
  11: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Faso_Dan_Fani_cloth.jpg/800px-Faso_Dan_Fani_cloth.jpg",
    credit: "Faso Dan Fani, tissage artisanal",
  },
  12: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Ouagadougou_market.jpg/800px-Ouagadougou_market.jpg",
    credit: "Scène communautaire, Ouagadougou",
  },
};

/* ─── Main component ─── */
export default function SymbolesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedSymbol, setExpandedSymbol] = useState<number | null>(null);

  const { data: rawSymbols = [], isLoading } = useQuery<SymbolModel[]>({
    queryKey: ["symbols"],
    queryFn: async () => (await symbolsApi.list()).data,
  });

  // Deduplicate by sortOrder
  const symbols = useMemo(() => {
    const seen = new Set<number>();
    return rawSymbols
      .filter((s) => {
        if (seen.has(s.sortOrder)) return false;
        seen.add(s.sortOrder);
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [rawSymbols]);

  // Group by category (preserving category order from CATEGORIES)
  const grouped = useMemo(() => {
    const map: Record<string, SymbolModel[]> = {};
    for (const s of symbols) {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    }
    return map;
  }, [symbols]);

  // Ordered category keys that actually have symbols
  const categoryKeys = useMemo(
    () => CATEGORIES.map((c) => c.key).filter((k) => grouped[k]),
    [grouped],
  );

  // Filter symbols if a category is selected
  const displayedCategories = activeCategory
    ? categoryKeys.filter((k) => k === activeCategory)
    : categoryKeys;

  return (
    <div className="min-h-screen bg-sable pt-nav">
      {/* ─── Hero ─── */}
      <section className="relative bg-nuit overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-or" />
            <span className="text-or text-xs font-semibold uppercase tracking-[0.2em]">
              Patrimoine vivant
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-blanc leading-tight mb-4">
            Symboles du Burkina Faso
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Emblèmes, légendes, artisanat et traditions — les symboles qui
            forgent l&apos;identité du Pays des Hommes Intègres.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <span className="block text-2xl font-bold text-blanc">
                {symbols.length}
              </span>
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Symboles
              </span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-blanc">
                {categoryKeys.length}
              </span>
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Catégories
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category filter bar ─── */}
      <div className="sticky top-[64px] z-30 bg-blanc/80 backdrop-blur-xl border-b border-sable-2/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setActiveCategory(null);
                setExpandedSymbol(null);
              }}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                !activeCategory
                  ? "bg-nuit text-blanc shadow-md"
                  : "bg-sable text-gris hover:bg-sable-2",
              )}
            >
              Tous
            </button>
            {categoryKeys.map((key) => {
              const cat = getCategoryInfo(key);
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(isActive ? null : key);
                    setExpandedSymbol(null);
                  }}
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "text-blanc shadow-md"
                      : "bg-sable text-gris hover:bg-sable-2",
                  )}
                  style={isActive ? { backgroundColor: cat.color } : undefined}
                >
                  <cat.Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {cat.label}
                  <span
                    className={clsx(
                      "text-xs ml-0.5",
                      isActive ? "text-white/60" : "text-gris-2",
                    )}
                  >
                    ({(grouped[key] ?? []).length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Grouped symbol cards ─── */}
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl skeleton h-64" />
            ))}
          </div>
        ) : (
          displayedCategories.map((catKey) => {
            const cat = getCategoryInfo(catKey);
            const catSymbols = grouped[catKey] ?? [];
            return (
              <section key={catKey}>
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: cat.color }}
                  >
                    <cat.Icon
                      className="w-5 h-5 text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-nuit">
                      {cat.label}
                    </h2>
                    <span className="text-xs text-gris">
                      {catSymbols.length} symbole
                      {catSymbols.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Symbol cards */}
                <div className="space-y-4">
                  {catSymbols.map((symbol) => {
                    const isExpanded = expandedSymbol === symbol.sortOrder;
                    const img = SYMBOL_IMAGES[symbol.sortOrder];

                    return (
                      <div
                        key={symbol.sortOrder}
                        className={clsx(
                          "rounded-2xl border bg-blanc transition-all duration-300 overflow-hidden",
                          isExpanded
                            ? "border-sable-2 shadow-lg"
                            : "border-sable-2/50 shadow-sm hover:shadow-md hover:border-sable-2",
                        )}
                      >
                        {/* Clickable header row */}
                        <button
                          onClick={() =>
                            setExpandedSymbol(
                              isExpanded ? null : symbol.sortOrder,
                            )
                          }
                          className="w-full text-left p-5 sm:p-6 flex items-center gap-4"
                        >
                          {/* Thumbnail */}
                          <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-sable-2/50"
                            style={{ backgroundColor: cat.color + "11" }}
                          >
                            {img ? (
                              <Image
                                src={img.src}
                                alt={symbol.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <cat.Icon
                                  className="w-7 h-7"
                                  style={{ color: cat.color }}
                                  strokeWidth={1.5}
                                />
                              </div>
                            )}
                          </div>

                          {/* Title & category */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-lg sm:text-xl text-nuit leading-snug">
                              {symbol.name}
                            </h3>
                            <span
                              className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                              style={{
                                backgroundColor: cat.accent + "22",
                                color: cat.color,
                              }}
                            >
                              {symbol.category}
                            </span>
                          </div>

                          {/* Chevron */}
                          <ChevronDown
                            className={clsx(
                              "w-5 h-5 text-gris shrink-0 transition-transform duration-300",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </button>

                        {/* Expanded content */}
                        <div
                          className={clsx(
                            "overflow-hidden transition-all duration-500",
                            isExpanded
                              ? "max-h-[800px] opacity-100"
                              : "max-h-0 opacity-0",
                          )}
                        >
                          <div className="border-t border-sable-2/50">
                            {/* Large image */}
                            {img && (
                              <div className="relative w-full aspect-[21/9] bg-sable overflow-hidden">
                                <Image
                                  src={img.src}
                                  alt={symbol.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <span className="absolute bottom-3 right-4 text-[10px] text-white/60 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  {img.credit}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            <div className="p-5 sm:p-6">
                              <p className="text-gris leading-relaxed text-[15px]">
                                {symbol.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* ─── Bottom overview ─── */}
      <section className="bg-nuit border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-serif text-2xl text-blanc text-center mb-10">
            Tous les symboles par catégorie
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryKeys.map((catKey) => {
              const cat = getCategoryInfo(catKey);
              const catSymbols = grouped[catKey] ?? [];
              return (
                <button
                  key={catKey}
                  onClick={() => {
                    setActiveCategory(catKey);
                    setExpandedSymbol(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-left rounded-xl p-4 border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: cat.color }}
                  >
                    <cat.Icon
                      className="w-4 h-4 text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="block text-sm font-semibold text-blanc mb-1">
                    {cat.label}
                  </span>
                  <div className="space-y-1">
                    {catSymbols.map((s) => (
                      <span
                        key={s.sortOrder}
                        className="block text-[11px] text-white/40 truncate"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
