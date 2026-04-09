"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wikiApi, adminApi } from "@/lib/api";
import type { WikiArticle, WikiRevision } from "@/types/models";
import { BookOpen, Check, X, FileText } from "lucide-react";

export default function AdminWikiPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ data: WikiArticle[] }>({
    queryKey: ["admin-wiki"],
    queryFn: async () => (await wikiApi.listArticles()).data,
  });

  const toggleApproved = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      adminApi.toggleArticleApproved(id, approved),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-wiki"] }),
  });

  const approveRevision = useMutation({
    mutationFn: (revisionId: number) => wikiApi.approveRevision(revisionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-wiki"] }),
  });

  const articles = data?.data ?? [];

  // Collect pending revisions from all articles
  const pendingRevisions: (WikiRevision & {
    articleTitle: string;
    articleSlug: string;
  })[] = [];
  for (const a of articles) {
    for (const r of a.revisions ?? []) {
      pendingRevisions.push({
        ...r,
        articleTitle: a.title,
        articleSlug: a.slug,
      });
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-6 h-6 text-or" />
        <h1 className="font-serif text-2xl text-nuit">Modération Wiki</h1>
        <span className="text-sm text-gris ml-2">({articles.length})</span>
      </div>

      {/* Pending Revisions */}
      {pendingRevisions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-or" />
            <h2 className="font-serif text-lg text-nuit">
              Révisions en attente ({pendingRevisions.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingRevisions.map((r) => (
              <div
                key={r.id}
                className="p-4 border border-or/30 bg-or/5 rounded-card flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-nuit text-sm">
                    {r.articleTitle}
                  </p>
                  <p className="text-xs text-gris mt-0.5">
                    {r.summary || "Aucun résumé"} ·{" "}
                    {r.author
                      ? `${r.author.firstName} ${r.author.lastName}`
                      : "Anonyme"}{" "}
                    · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <button
                  onClick={() => approveRevision.mutate(r.id)}
                  disabled={approveRevision.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-vert/10 text-vert hover:bg-vert/20 rounded text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
                >
                  <Check className="w-3 h-3" /> Appliquer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">Article</th>
                <th className="px-4 py-3 font-medium text-gris">Catégorie</th>
                <th className="px-4 py-3 font-medium text-gris">Auteur</th>
                <th className="px-4 py-3 font-medium text-gris">Vues</th>
                <th className="px-4 py-3 font-medium text-gris">Statut</th>
                <th className="px-4 py-3 font-medium text-gris w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable-2">
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-sable rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : articles.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-nuit">{a.title}</p>
                        <p className="text-xs text-gris mt-0.5 line-clamp-1">
                          {a.leadText}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gris">{a.category}</td>
                      <td className="px-4 py-3 text-gris">
                        {a.author
                          ? `${a.author.firstName} ${a.author.lastName}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gris">
                        {a.viewCount.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-medium ${
                            a.isApproved
                              ? "bg-vert/10 text-vert"
                              : "bg-or/10 text-or"
                          }`}
                        >
                          {a.isApproved ? (
                            <>
                              <Check className="w-3 h-3" /> Approuvé
                            </>
                          ) : (
                            "En attente"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            toggleApproved.mutate({
                              id: a.id,
                              approved: !a.isApproved,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            a.isApproved
                              ? "bg-rouge/10 text-rouge hover:bg-rouge/20"
                              : "bg-vert/10 text-vert hover:bg-vert/20"
                          }`}
                        >
                          {a.isApproved ? (
                            <>
                              <X className="w-3 h-3" /> Révoquer
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" /> Approuver
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
