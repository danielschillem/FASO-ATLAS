"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import type { WikiArticle } from "@/types/models";
import { clsx } from "clsx";
import { BookOpen } from "lucide-react";

const WIKI_CATEGORIES = [
  { id: "Peuples & Langues", label: "Peuples & Langues" },
  { id: "Culture & Arts", label: "Culture & Arts" },
  { id: "Géographie", label: "Géographie" },
  { id: "Histoire", label: "Histoire" },
];

export function WikiLayout() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data } = useQuery<{ data: WikiArticle[] }>({
    queryKey: ["wiki-articles", activeCategory],
    queryFn: async () => {
      const res = await wikiApi.listArticles({
        category: activeCategory || undefined,
      });
      return res.data;
    },
  });

  const { data: article } = useQuery<WikiArticle>({
    queryKey: ["wiki-article", selectedSlug],
    queryFn: async () => {
      const res = await wikiApi.getArticle(selectedSlug!);
      return res.data;
    },
    enabled: !!selectedSlug,
  });

  const articles = data?.data ?? [];

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      <div className="max-w-7xl mx-auto px-4 py-12 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="font-serif text-xl text-nuit mb-6">Wiki Faso</h2>
            <p className="text-xs text-gris mb-4">Encyclopédie collaborative</p>

            {WIKI_CATEGORIES.map((cat) => (
              <div key={cat.id} className="mb-4">
                <button
                  onClick={() =>
                    setActiveCategory(cat.id === activeCategory ? null : cat.id)
                  }
                  className={clsx(
                    "w-full text-left text-sm font-medium py-2 px-3 rounded transition-colors",
                    activeCategory === cat.id
                      ? "text-rouge bg-sable"
                      : "text-nuit hover:bg-sable",
                  )}
                >
                  {cat.label}
                </button>
              </div>
            ))}

            {/* Article list */}
            {articles.length > 0 && (
              <div className="mt-4 border-t border-sable-2 pt-4">
                {articles.map((a) => (
                  <button
                    key={a.slug}
                    onClick={() => setSelectedSlug(a.slug)}
                    className={clsx(
                      "w-full text-left text-sm py-1.5 px-3 rounded transition-colors",
                      selectedSlug === a.slug
                        ? "text-rouge font-medium"
                        : "text-gris hover:text-nuit",
                    )}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Article content */}
        <main className="flex-1 min-w-0">
          {article ? (
            <article>
              <header className="border-b border-sable-2 pb-6 mb-8">
                <span className="text-xs text-gris uppercase tracking-wider">
                  {article.category}
                </span>
                <h1 className="font-serif text-4xl text-nuit mt-2">
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p className="text-lg text-terre mt-1">{article.subtitle}</p>
                )}
                <p className="text-gris mt-3 leading-relaxed">
                  {article.leadText}
                </p>
              </header>

              {/* Infobox */}
              {article.infoboxData &&
                Object.keys(article.infoboxData).length > 0 && (
                  <div className="float-right ml-6 mb-6 w-64 border border-sable-2 rounded-card overflow-hidden">
                    <div className="bg-sable px-4 py-2 border-b border-sable-2">
                      <span className="text-xs font-medium text-terre uppercase tracking-wider">
                        {article.title}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(article.infoboxData).map(
                          ([key, val]) => (
                            <tr key={key} className="border-b border-sable-2">
                              <td className="px-3 py-2 font-medium text-nuit bg-sable/50 w-1/2">
                                {key}
                              </td>
                              <td className="px-3 py-2 text-gris">{val}</td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              <div
                className="wiki-body prose max-w-none clear-both"
                dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
              />

              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-sable-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-sable text-terre text-xs rounded-pill"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-terre" />
              </div>
              <h2 className="font-serif text-2xl text-nuit mb-2">Wiki Faso</h2>
              <p className="text-gris max-w-md mx-auto">
                Sélectionnez un article dans la barre latérale ou explorez par
                catégorie. Encyclopédie collaborative sur les peuples, la
                culture et la géographie du Burkina Faso.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
