"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, mapApi } from "@/lib/api";
import type { CarRental, CarCategory, Region } from "@/types/models";
import {
  Car,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Search,
} from "lucide-react";

const CATEGORY_LABELS: Record<CarCategory, string> = {
  economique: "Économique",
  confort: "Confort",
  suv: "SUV",
  luxe: "Luxe",
  utilitaire: "Utilitaire",
};

type FormData = {
  brand: string;
  model: string;
  year: string;
  category: CarCategory;
  seats: string;
  transmission: string;
  fuelType: string;
  pricePerDay: string;
  depositFcfa: string;
  features: string;
  phone: string;
  whatsapp: string;
  city: string;
  regionId: string;
  isAvailable: boolean;
};

const emptyForm: FormData = {
  brand: "",
  model: "",
  year: new Date().getFullYear().toString(),
  category: "economique",
  seats: "5",
  transmission: "manuelle",
  fuelType: "essence",
  pricePerDay: "",
  depositFcfa: "0",
  features: "",
  phone: "",
  whatsapp: "",
  city: "",
  regionId: "",
  isAvailable: true,
};

export default function AdminLocationPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: CarRental[] }>({
    queryKey: ["admin-car-rentals"],
    queryFn: async () => (await adminApi.listCarRentals({ limit: 200 })).data,
  });

  const { data: regionsData } = useQuery<{ data: Region[] }>({
    queryKey: ["regions"],
    queryFn: async () => (await mapApi.getRegions()).data,
  });
  const regions = regionsData?.data ?? [];

  const createMut = useMutation({
    mutationFn: (d: FormData) =>
      adminApi.createCarRental({
        brand: d.brand,
        model: d.model,
        year: parseInt(d.year) || 0,
        category: d.category,
        seats: parseInt(d.seats) || 5,
        transmission: d.transmission,
        fuelType: d.fuelType,
        pricePerDay: parseInt(d.pricePerDay) || 0,
        depositFcfa: parseInt(d.depositFcfa) || 0,
        features: d.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        phone: d.phone,
        whatsapp: d.whatsapp,
        city: d.city,
        regionId: d.regionId ? parseInt(d.regionId) : null,
        isAvailable: d.isAvailable,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-car-rentals"] });
      setModal(null);
      setForm(emptyForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: FormData }) =>
      adminApi.updateCarRental(id, {
        brand: d.brand,
        model: d.model,
        year: parseInt(d.year) || 0,
        category: d.category,
        seats: parseInt(d.seats) || 5,
        transmission: d.transmission,
        fuelType: d.fuelType,
        pricePerDay: parseInt(d.pricePerDay) || 0,
        depositFcfa: parseInt(d.depositFcfa) || 0,
        features: d.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        phone: d.phone,
        whatsapp: d.whatsapp,
        city: d.city,
        regionId: d.regionId ? parseInt(d.regionId) : null,
        isAvailable: d.isAvailable,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-car-rentals"] });
      setModal(null);
      setEditId(null);
      setForm(emptyForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminApi.deleteCarRental(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-car-rentals"] });
      setDeleteConfirm(null);
    },
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      adminApi.toggleCarRentalAvailable(id, available),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-car-rentals"] }),
  });

  const items = data?.data ?? [];
  const filtered = items.filter(
    (c) =>
      `${c.brand} ${c.model}`.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (c: CarRental) => {
    setForm({
      brand: c.brand,
      model: c.model,
      year: String(c.year),
      category: c.category,
      seats: String(c.seats),
      transmission: c.transmission,
      fuelType: c.fuelType,
      pricePerDay: String(c.pricePerDay),
      depositFcfa: String(c.depositFcfa),
      features: (c.features ?? []).join(", "),
      phone: c.phone,
      whatsapp: c.whatsapp,
      city: c.city,
      regionId: c.regionId ? String(c.regionId) : "",
      isAvailable: c.isAvailable,
    });
    setEditId(c.id);
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
          <Car className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">
            Gestion des véhicules
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
          Nouveau véhicule
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-nuit">{items.length}</p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Disponibles
          </p>
          <p className="text-2xl font-bold text-vert">
            {items.filter((c) => c.isAvailable).length}
          </p>
        </div>
        <div className="bg-white border border-sable-2 rounded-card p-4">
          <p className="text-xs text-gris uppercase tracking-wide">
            Prix moy./jour
          </p>
          <p className="text-2xl font-bold text-or">
            {items.length > 0
              ? Math.round(
                  items.reduce((s, c) => s + c.pricePerDay, 0) / items.length,
                ).toLocaleString()
              : "—"}{" "}
            F
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gris" />
          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-sable-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-or/50"
          />
        </div>
      </div>

      <div className="border border-sable-2 rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead>
              <tr className="bg-sable text-left">
                <th className="px-4 py-3 font-medium text-gris">Véhicule</th>
                <th className="px-4 py-3 font-medium text-gris">Catégorie</th>
                <th className="px-4 py-3 font-medium text-gris">Ville</th>
                <th className="px-4 py-3 font-medium text-gris">Prix/jour</th>
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
                : filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-sable/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-nuit">
                          {c.brand} {c.model}
                        </span>
                        <span className="block text-xs text-gris">
                          {c.year}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-or/10 text-or">
                          {CATEGORY_LABELS[c.category] ?? c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gris">{c.city || "—"}</td>
                      <td className="px-4 py-3 font-medium text-nuit">
                        {c.pricePerDay?.toLocaleString()} F
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            toggleAvailable.mutate({
                              id: c.id,
                              available: !c.isAvailable,
                            })
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            c.isAvailable
                              ? "bg-vert/10 text-vert hover:bg-vert/20"
                              : "bg-rouge/10 text-rouge hover:bg-rouge/20"
                          }`}
                        >
                          {c.isAvailable ? (
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
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gris hover:text-or hover:bg-or/10 rounded transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(c.id)}
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
            Aucun véhicule trouvé.
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
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-sable-2">
              <h2 className="font-serif text-xl text-nuit">
                {modal === "create"
                  ? "Nouveau véhicule"
                  : "Modifier le véhicule"}
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Marque *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.model}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, model: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Année
                  </label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, year: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Catégorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as CarCategory,
                      }))
                    }
                    className="input-field"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Transmission
                  </label>
                  <select
                    value={form.transmission}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        transmission: e.target.value,
                      }))
                    }
                    className="input-field"
                  >
                    <option value="manuelle">Manuelle</option>
                    <option value="automatique">Automatique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Places
                  </label>
                  <input
                    type="number"
                    value={form.seats}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, seats: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Prix/jour (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.pricePerDay}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pricePerDay: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Caution (FCFA)
                  </label>
                  <input
                    type="number"
                    value={form.depositFcfa}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, depositFcfa: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, whatsapp: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Région
                  </label>
                  <select
                    value={form.regionId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, regionId: e.target.value }))
                    }
                    className="input-field"
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

              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Équipements (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={form.features}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, features: e.target.value }))
                  }
                  placeholder="Climatisation, GPS, Bluetooth..."
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isAvailable: e.target.checked }))
                  }
                  className="rounded border-sable-2"
                />
                <label htmlFor="isAvailable" className="text-sm text-nuit">
                  Disponible à la location
                </label>
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
