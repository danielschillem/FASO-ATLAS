"use client";

import { useQuery } from "@tanstack/react-query";
import { symbolsApi } from "@/lib/api";
import type { Symbol } from "@/types/models";
import { Landmark, Flag, Music, Palette, Drama, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SYMBOL_ICONS: LucideIcon[] = [
  Landmark,
  Flag,
  Music,
  Palette,
  Drama,
  Moon,
];

export default function SymbolesPage() {
  const { data: symbols = [], isLoading } = useQuery<Symbol[]>({
    queryKey: ["symbols"],
    queryFn: async () => (await symbolsApi.list()).data,
  });

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* Header */}
      <div className="bg-gradient-to-br from-nuit via-brun to-terre py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-or text-sm font-medium uppercase tracking-widest">
            Identité nationale
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-blanc mt-3">
            Symboles du Burkina
          </h1>
          <p className="text-sable-2 mt-4 max-w-xl mx-auto leading-relaxed">
            Les emblèmes, légendes et symboles culturels qui forgent l'identité
            du Pays des Hommes Intègres.
          </p>
          {/* Mini flag */}
          <div className="flex justify-center mt-6 gap-0 rounded overflow-hidden w-20 mx-auto border border-white/10">
            <div className="h-8 w-10 bg-rouge" />
            <div className="h-8 w-10 bg-vert" />
          </div>
        </div>
      </div>

      {/* Symbols grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-card bg-sable animate-pulse h-52"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {symbols.map((symbol, i) => (
              <div
                key={symbol.id}
                className="flex gap-5 p-6 rounded-card border border-sable-2 bg-blanc shadow-card hover:shadow-faso transition-shadow"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rouge/10 to-or/10 border border-sable-2 flex items-center justify-center shrink-0">
                  {(() => {
                    const Icon = SYMBOL_ICONS[i % SYMBOL_ICONS.length];
                    return <Icon className="w-6 h-6 text-terre" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-serif text-xl text-nuit">
                      {symbol.name}
                    </h3>
                    {symbol.category && (
                      <span className="px-2 py-0.5 bg-sable text-gris text-xs rounded-pill capitalize shrink-0">
                        {symbol.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gris leading-relaxed">
                    {symbol.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
