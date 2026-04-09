"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { Symbol } from "@/types/models";
import { Shapes, Plus, Pencil, Trash2, X, Search } from "lucide-react";

type FormData = {
  name: string;
  category: string;
  description: string;
  svgPath: string;
  sortOrder: string;
};

const emptyForm: FormData = {
  name: "",
  category: "",
  description: "",
  svgPath: "",
  sortOrder: "0",
};

export default function AdminSymbolesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Symbol[] }>({
    queryKey: ["admin-symbols"],
    queryFn: async () => (await adminApi.listSymbols()).data,
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) =>
      adminApi.createSymbol({
        name: d.name,
        category: d.category,
        description: d.description,
        svgPath: d.svgPath,
        sortOrder: parseInt(d.sortOrder) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-symbols"] });
      setModal(null);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: FormData }) =>
      adminApi.updateSymbol(id, {
        name: d.name,
        category: d.category,
        description: d.description,
        svgPath: d.svgPath,
        sortOrder: parseInt(d.sortOrder) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-symbols"] });
      setModal(null);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteSymbol(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-symbols"] });
      setDeleteConfirm(null);
    },
  });

  const items = data?.data ?? [];
  const filtered = items.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const categories = Array.from(
    new Set(items.map((s) => s.category).filter(Boolean)),
  );

  const openEdit = (s: Symbol) => {
    setForm({
      name: s.name,
      category: s.category,
      description: s.description,
      svgPath: s.svgPath,
      sortOrder: String(s.sortOrder),
    });
    setEditId(s.id);
    setModal("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === "edit" && editId) {
      updateMut.mutate({ id: editId, d: form });
    } else {
      createMut.mutate(form);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shapes className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">
            Gestion des symboles
          </h1>
          <span className="text-sm text-gris ml-2">({items.length})</span>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setModal("create");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-vert text-white rounded-lg hover:bg-vert/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouveau symbole
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-nuit">{items.length}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Catégories
          </p>
          <p className="text-2xl font-bold text-or">{categories.length}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher un symbole..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
          />
        </div>
      </div>

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">Aperçu</th>
                <th className="px-4 py-3 font-medium text-gris">Nom</th>
                <th className="px-4 py-3 font-medium text-gris">Catégorie</th>
                <th className="px-4 py-3 font-medium text-gris">Ordre</th>
                <th className="px-4 py-3 font-medium text-gris w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable-2">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-4">
                        <div className="h-4 bg-sable rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {s.svgPath ? (
                          <svg
                            viewBox="0 0 24 24"
                            className="w-8 h-8 text-or"
                            fill="currentColor"
                          >
                            <path d={s.svgPath} />
                          </svg>
                        ) : (
                          <div className="w-8 h-8 bg-sable rounded flex items-center justify-center text-xs text-gris">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-nuit">
                            {s.name}
                          </span>
                          {s.description && (
                            <span className="block text-xs text-gris truncate max-w-xs">
                              {s.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-or/10 text-or">
                          {s.category || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gris">{s.sortOrder}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-1.5 text-gris hover:text-rouge hover:bg-rouge/10 rounded transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(s.id)}
                            className="p-1.5 text-gris hover:text-rouge hover:bg-rouge/10 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-gris">
            Aucun symbole trouvé.
          </div>
        )}
      </div>

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nuit/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-serif text-lg text-nuit mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gris mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gris hover:text-nuit transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="px-4 py-2 bg-rouge text-white rounded-lg text-sm font-medium hover:bg-rouge/90 transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nuit/50">
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-sable-2">
              <h2 className="font-serif text-xl text-nuit">
                {modal === "create" ? "Nouveau symbole" : "Modifier le symbole"}
              </h2>
              <button
                title="Fermer"
                onClick={() => {
                  setModal(null);
                  setEditId(null);
                  setForm(emptyForm);
                }}
                className="p-1.5 text-gris hover:text-nuit rounded-lg hover:bg-sable transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Catégorie
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="Ex: animal, masque, motif..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  SVG Path (d=&quot;...&quot;)
                </label>
                <textarea
                  value={form.svgPath}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, svgPath: e.target.value }))
                  }
                  rows={3}
                  className="input-field resize-none font-mono text-xs"
                  placeholder="M12 2C6.48 2 2 6.48..."
                />
                {form.svgPath && (
                  <div className="mt-2 p-3 bg-sable rounded-lg flex items-center gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-10 h-10 text-or"
                      fill="currentColor"
                    >
                      <path d={form.svgPath} />
                    </svg>
                    <span className="text-xs text-gris">Aperçu</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Ordre d&apos;affichage
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                  className="input-field w-28"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-sable-2">
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    setEditId(null);
                    setForm(emptyForm);
                  }}
                  className="px-4 py-2 text-sm text-gris hover:text-nuit transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="px-6 py-2 bg-vert text-white rounded-lg text-sm font-medium hover:bg-vert/90 transition-colors disabled:opacity-50"
                >
                  {createMut.isPending || updateMut.isPending
                    ? "Enregistrement..."
                    : modal === "create"
                      ? "Créer"
                      : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
