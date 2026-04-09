"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi, mapApi, destinationsApi } from "@/lib/api";
import type {
  Establishment,
  EstablishmentType,
  Place,
  Region,
} from "@/types/models";
import {
  Building2,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Star,
  Search,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

const TYPE_LABELS: Record<EstablishmentType, string> = {
  hotel: "Hôtel",
  restaurant: "Restaurant",
  gite: "Gîte",
  camp: "Campement",
};

type FormData = {
  placeId: string;
  type: EstablishmentType;
  priceMinFcfa: string;
  priceMaxFcfa: string;
  stars: string;
  amenities: string;
  phone: string;
  email: string;
  website: string;
};

const emptyForm: FormData = {
  placeId: "",
  type: "hotel",
  priceMinFcfa: "",
  priceMaxFcfa: "",
  stars: "3",
  amenities: "",
  phone: "",
  email: "",
  website: "",
};

export default function OwnerEstablishmentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Establishment[] }>({
    queryKey: ["owner-establishments"],
    queryFn: async () =>
      (await ownerApi.listEstablishments({ limit: 200 })).data,
  });

  // Load places for the place selector in the create form
  const { data: placesData } = useQuery<{ data: Place[] }>({
    queryKey: ["all-places-list"],
    queryFn: async () => (await destinationsApi.list({ limit: 200 })).data,
  });
  const places = placesData?.data ?? [];

  const createMut = useMutation({
    mutationFn: (d: FormData) =>
      ownerApi.createEstablishment({
        placeId: parseInt(d.placeId),
        type: d.type,
        priceMinFcfa: parseInt(d.priceMinFcfa) || 0,
        priceMaxFcfa: parseInt(d.priceMaxFcfa) || 0,
        stars: parseInt(d.stars) || 3,
        amenities: d.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        phone: d.phone,
        email: d.email,
        website: d.website,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-establishments"] });
      qc.invalidateQueries({ queryKey: ["owner-stats"] });
      setModal(null);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: FormData }) =>
      ownerApi.updateEstablishment(id, {
        type: d.type,
        priceMinFcfa: parseInt(d.priceMinFcfa) || 0,
        priceMaxFcfa: parseInt(d.priceMaxFcfa) || 0,
        stars: parseInt(d.stars) || 3,
        amenities: d.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        phone: d.phone,
        email: d.email,
        website: d.website,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-establishments"] });
      setModal(null);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => ownerApi.deleteEstablishment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-establishments"] });
      qc.invalidateQueries({ queryKey: ["owner-stats"] });
      setDeleteConfirm(null);
    },
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      ownerApi.updateEstablishment(id, { isAvailable: available }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["owner-establishments"] }),
  });

  const items = data?.data ?? [];
  const filtered = items.filter(
    (e) =>
      (e.place?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (e: Establishment) => {
    setForm({
      placeId: String(e.placeId),
      type: e.type,
      priceMinFcfa: String(e.priceMinFcfa),
      priceMaxFcfa: String(e.priceMaxFcfa),
      stars: String(e.stars),
      amenities: (e.amenities ?? []).join(", "),
      phone: e.phone ?? "",
      email: e.email ?? "",
      website: e.website ?? "",
    });
    setEditId(e.id);
    setModal("edit");
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (modal === "edit" && editId) {
      updateMut.mutate({ id: editId, d: form });
    } else {
      createMut.mutate(form);
    }
  };

  const stats = {
    total: items.length,
    available: items.filter((e) => e.isAvailable).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">Mes établissements</h1>
          <span className="text-sm text-gris ml-2">({stats.total})</span>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setModal("create");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-vert text-white rounded-lg hover:bg-vert/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouvel établissement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-nuit">{stats.total}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Disponibles
          </p>
          <p className="text-2xl font-bold text-vert">{stats.available}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rouge/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-sable-2 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sable text-left">
              <th className="px-4 py-3 font-medium text-gris">Lieu</th>
              <th className="px-4 py-3 font-medium text-gris">Type</th>
              <th className="px-4 py-3 font-medium text-gris">Étoiles</th>
              <th className="px-4 py-3 font-medium text-gris">Prix (FCFA)</th>
              <th className="px-4 py-3 font-medium text-gris">Contact</th>
              <th className="px-4 py-3 font-medium text-gris">Statut</th>
              <th className="px-4 py-3 font-medium text-gris w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sable-2">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 bg-sable rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-sable/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-nuit">
                        {e.place?.name ?? `Lieu #${e.placeId}`}
                      </span>
                      <span className="block text-xs text-gris">
                        {e.place?.region?.name ?? ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-or/10 text-or">
                        {TYPE_LABELS[e.type] ?? e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-or font-medium">
                        <Star className="w-3 h-3 fill-or" />
                        {e.stars || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gris text-xs">
                      {e.priceMinFcfa?.toLocaleString()} -{" "}
                      {e.priceMaxFcfa?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gris">
                        {e.phone && (
                          <span title={e.phone}>
                            <Phone className="w-3 h-3" />
                          </span>
                        )}
                        {e.email && (
                          <span title={e.email}>
                            <Mail className="w-3 h-3" />
                          </span>
                        )}
                        {e.website && (
                          <span title={e.website}>
                            <Globe className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          toggleAvailable.mutate({
                            id: e.id,
                            available: !e.isAvailable,
                          })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          e.isAvailable
                            ? "bg-vert/10 text-vert hover:bg-vert/20"
                            : "bg-rouge/10 text-rouge hover:bg-rouge/20"
                        }`}
                      >
                        {e.isAvailable ? (
                          <>
                            <Eye className="w-3 h-3" /> Dispo
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
                          onClick={() => openEdit(e)}
                          className="p-1.5 text-gris hover:text-rouge hover:bg-rouge/10 rounded transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(e.id)}
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
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-gris">
            {items.length === 0
              ? "Vous n'avez pas encore d'établissement. Créez-en un !"
              : "Aucun résultat."}
          </div>
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
              L&apos;établissement et ses réservations seront supprimés.
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
                {modal === "create"
                  ? "Nouvel établissement"
                  : "Modifier l'établissement"}
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
              {/* Place selector (only for creation) */}
              {modal === "create" && (
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Lieu associé *
                  </label>
                  <select
                    required
                    value={form.placeId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, placeId: e.target.value }))
                    }
                    className="input-field"
                  >
                    <option value="">— Sélectionner un lieu —</option>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.region?.name ?? ""})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        type: e.target.value as EstablishmentType,
                      }))
                    }
                    className="input-field"
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
                    Étoiles
                  </label>
                  <select
                    value={form.stars}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stars: e.target.value }))
                    }
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {"★".repeat(s)} ({s})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Prix min (FCFA)
                  </label>
                  <input
                    type="number"
                    value={form.priceMinFcfa}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceMinFcfa: e.target.value }))
                    }
                    placeholder="15000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Prix max (FCFA)
                  </label>
                  <input
                    type="number"
                    value={form.priceMaxFcfa}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceMaxFcfa: e.target.value }))
                    }
                    placeholder="75000"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Site web
                  </label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, website: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Équipements (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={form.amenities}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amenities: e.target.value }))
                  }
                  placeholder="WiFi, Piscine, Parking, Climatisation..."
                  className="input-field"
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
