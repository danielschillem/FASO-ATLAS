"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type { Region } from "@/types/models";
import { Globe, Plus, Pencil, Trash2, X, Search } from "lucide-react";

type FormData = {
  name: string;
  capital: string;
  code: string;
};

const emptyForm: FormData = { name: "", capital: "", code: "" };

export default function AdminRegionsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Region[] }>({
    queryKey: ["admin-regions"],
    queryFn: async () => (await adminApi.listRegions()).data,
  });

  const createMut = useMutation({
    mutationFn: (d: FormData) => adminApi.createRegion(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-regions"] });
      setModal(null);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: FormData }) =>
      adminApi.updateRegion(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-regions"] });
      setModal(null);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteRegion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-regions"] });
      setDeleteConfirm(null);
    },
  });

  const items = data?.data ?? [];
  const filtered = items.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.capital?.toLowerCase().includes(search.toLowerCase()) ||
      r.code?.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (r: Region) => {
    setForm({ name: r.name, capital: r.capital, code: r.code });
    setEditId(r.id);
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
          <Globe className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">Gestion des régions</h1>
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
          Nouvelle région
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher une région..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-or/50"
          />
        </div>
      </div>

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">Nom</th>
                <th className="px-4 py-3 font-medium text-gris">Capitale</th>
                <th className="px-4 py-3 font-medium text-gris">Code</th>
                <th className="px-4 py-3 font-medium text-gris w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable-2">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-4 py-4">
                        <div className="h-4 bg-sable rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-nuit">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-gris">{r.capital}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-or/10 text-or font-mono">
                          {r.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 text-gris hover:text-or hover:bg-or/10 rounded transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(r.id)}
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
            Aucune région trouvée.
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
              Attention : supprimer une région peut affecter les lieux et
              établissements qui y sont rattachés.
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
          <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-sable-2">
              <h2 className="font-serif text-xl text-nuit">
                {modal === "create" ? "Nouvelle région" : "Modifier la région"}
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
                  Capitale
                </label>
                <input
                  type="text"
                  value={form.capital}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capital: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Ex: BFA-CEN"
                  className="input-field font-mono"
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
