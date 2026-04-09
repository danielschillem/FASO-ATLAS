"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, mapApi } from "@/lib/api";
import type { Place, PlaceType, Region } from "@/types/models";
import {
  MapPin,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Star,
} from "lucide-react";

const TYPE_LABELS: Record<PlaceType, string> = {
  site: "Site touristique",
  hotel: "Hébergement",
  nature: "Nature",
  culture: "Culture",
};

type FormData = {
  name: string;
  slug: string;
  type: PlaceType;
  description: string;
  lat: string;
  lng: string;
  regionId: string;
  tags: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  name: "",
  slug: "",
  type: "site",
  description: "",
  lat: "",
  lng: "",
  regionId: "",
  tags: "",
  isActive: true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminLieuxPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Place[] }>({
    queryKey: ["admin-places"],
    queryFn: async () => (await adminApi.listPlaces({ limit: 200 })).data,
  });

  const { data: regionsData } = useQuery<{ data: Region[] }>({
    queryKey: ["regions"],
    queryFn: async () => (await mapApi.getRegions()).data,
  });

  const regions = regionsData?.data ?? [];

  const createMut = useMutation({
    mutationFn: (d: FormData) =>
      adminApi.createPlace({
        name: d.name,
        slug: d.slug,
        type: d.type,
        description: d.description,
        lat: parseFloat(d.lat) || 0,
        lng: parseFloat(d.lng) || 0,
        regionId: d.regionId ? parseInt(d.regionId) : null,
        tags: d.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive: d.isActive,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-places"] });
      setModal(null);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: FormData }) =>
      adminApi.updatePlace(id, {
        name: d.name,
        slug: d.slug,
        type: d.type,
        description: d.description,
        lat: parseFloat(d.lat) || 0,
        lng: parseFloat(d.lng) || 0,
        regionId: d.regionId ? parseInt(d.regionId) : null,
        tags: d.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive: d.isActive,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-places"] });
      setModal(null);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deletePlace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-places"] });
      setDeleteConfirm(null);
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminApi.togglePlaceActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-places"] }),
  });

  const places = data?.data ?? [];
  const filtered = places.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase()) ||
      (p.region?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (p: Place) => {
    setForm({
      name: p.name,
      slug: p.slug,
      type: p.type,
      description: p.description,
      lat: String(p.lat),
      lng: String(p.lng),
      regionId: p.regionId ? String(p.regionId) : "",
      tags: (p.tags ?? []).join(", "),
      isActive: p.isActive,
    });
    setEditId(p.id);
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

  const stats = {
    total: places.length,
    active: places.filter((p) => p.isActive).length,
    avgRating:
      places.length > 0
        ? (
            places.reduce((s, p) => s + (p.rating || 0), 0) / places.length
          ).toFixed(1)
        : "—",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">Gestion des lieux</h1>
          <span className="text-sm text-gris ml-2">({places.length})</span>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setModal("create");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-vert text-white rounded-lg hover:bg-vert/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouveau lieu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-nuit">{stats.total}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Actifs</p>
          <p className="text-2xl font-bold text-vert">{stats.active}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Note moy.</p>
          <p className="text-2xl font-bold text-or">{stats.avgRating}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un lieu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
        />
      </div>

      {/* Table */}
      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">Lieu</th>
                <th className="px-4 py-3 font-medium text-gris">Type</th>
                <th className="px-4 py-3 font-medium text-gris">Région</th>
                <th className="px-4 py-3 font-medium text-gris">Note</th>
                <th className="px-4 py-3 font-medium text-gris">Statut</th>
                <th className="px-4 py-3 font-medium text-gris w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sable-2">
              {isLoading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-sable rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-nuit">
                            {p.name}
                          </span>
                          <span className="block text-xs text-gris">
                            /{p.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-or/10 text-or">
                          {TYPE_LABELS[p.type] ?? p.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gris">
                        {p.region?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-or font-medium">
                          <Star className="w-3 h-3 fill-or" />
                          {p.rating ? p.rating.toFixed(1) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            toggleActive.mutate({
                              id: p.id,
                              active: !p.isActive,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            p.isActive
                              ? "bg-vert/10 text-vert hover:bg-vert/20"
                              : "bg-rouge/10 text-rouge hover:bg-rouge/20"
                          }`}
                        >
                          {p.isActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Actif
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Masqué
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-gris hover:text-rouge hover:bg-rouge/10 rounded transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
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
          <div className="py-12 text-center text-gris">Aucun lieu trouvé.</div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nuit/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-serif text-lg text-nuit mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gris mb-6">
              Cette action est irréversible. Le lieu et toutes ses données
              associées seront supprimés.
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

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-nuit/50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-sable-2">
              <h2 className="font-serif text-xl text-nuit">
                {modal === "create" ? "Nouveau lieu" : "Modifier le lieu"}
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
              {/* Name + Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: modal === "create" ? slugify(name) : f.slug,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                    placeholder="Ruines de Loropéni"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                    placeholder="ruines-de-loropeni"
                  />
                </div>
              </div>

              {/* Type + Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Type *
                  </label>
                  <select
                    title="Type de lieu"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as PlaceType,
                      }))
                    }
                    className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Région
                  </label>
                  <select
                    title="Région"
                    value={form.regionId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, regionId: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                  >
                    <option value="">— Aucune —</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50 resize-none"
                  placeholder="Description du lieu..."
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.lat}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lat: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                    placeholder="12.3456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.lng}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lng: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                    placeholder="-1.5167"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
                  placeholder="UNESCO, histoire, architecture"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-sable-2 text-vert focus:ring-vert"
                />
                <span className="text-sm text-nuit">
                  Lieu visible publiquement
                </span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-sable-2">
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
                  className="px-6 py-2 bg-rouge text-blanc rounded-xl text-sm font-bold hover:bg-rouge-dark transition-colors disabled:opacity-50"
                >
                  {createMut.isPending || updateMut.isPending
                    ? "Enregistrement..."
                    : modal === "create"
                      ? "Créer le lieu"
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
