"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { adsApi, uploadApi } from "@/lib/api";
import type { Ad, AdPlacement } from "@/types/models";
import {
  Megaphone,
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  BarChart3,
  MousePointerClick,
} from "lucide-react";

const PLACEMENT_LABELS: Record<AdPlacement, string> = {
  banner: "Bandeau",
  card: "Carte sponsorisée",
  sidebar: "Sidebar",
};

const PAGE_OPTIONS = [
  "home",
  "destinations",
  "reservation",
  "atlas",
  "wiki",
  "itineraires",
  "carte",
];

type FormData = {
  title: string;
  partnerName: string;
  placement: AdPlacement;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  pages: string[];
  priority: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: FormData = {
  title: "",
  partnerName: "",
  placement: "card",
  imageUrl: "",
  linkUrl: "",
  altText: "",
  pages: [],
  priority: 0,
  isActive: true,
  startsAt: "",
  endsAt: "",
};

export default function AdminPublicitesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<{ data: Ad[]; total: number }>({
    queryKey: ["admin-ads"],
    queryFn: async () => (await adsApi.list({ limit: 100 })).data,
  });

  const ads = data?.data ?? [];

  const createMut = useMutation({
    mutationFn: (d: FormData) =>
      adsApi.create({
        ...d,
        startsAt: d.startsAt || null,
        endsAt: d.endsAt || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-ads"] });
      closeForm();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: number; d: FormData }) =>
      adsApi.update(id, {
        ...d,
        startsAt: d.startsAt || null,
        endsAt: d.endsAt || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-ads"] });
      closeForm();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-ads"] }),
  });

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function openEdit(ad: Ad) {
    setForm({
      title: ad.title,
      partnerName: ad.partnerName,
      placement: ad.placement,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      altText: ad.altText,
      pages: ad.pages ?? [],
      priority: ad.priority,
      isActive: ad.isActive,
      startsAt: ad.startsAt?.slice(0, 16) ?? "",
      endsAt: ad.endsAt?.slice(0, 16) ?? "",
    });
    setEditingId(ad.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMut.mutate({ id: editingId, d: form });
    } else {
      createMut.mutate(form);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.upload(file, "ads");
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setUploading(false);
    }
  }

  function togglePage(page: string) {
    setForm((f) => ({
      ...f,
      pages: f.pages.includes(page)
        ? f.pages.filter((p) => p !== page)
        : [...f.pages, page],
    }));
  }

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const ctr =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : "0";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-or" />
          <h1 className="font-serif text-2xl text-nuit">Régie publicitaire</h1>
          <span className="text-sm text-gris ml-2">({ads.length})</span>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle publicité
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Impressions totales",
            value: totalImpressions.toLocaleString("fr-FR"),
            icon: BarChart3,
            color: "text-nuit",
            bg: "bg-nuit/10",
          },
          {
            label: "Clics totaux",
            value: totalClicks.toLocaleString("fr-FR"),
            icon: MousePointerClick,
            color: "text-vert",
            bg: "bg-vert/10",
          },
          {
            label: "Taux de clic (CTR)",
            value: `${ctr}%`,
            icon: Megaphone,
            color: "text-or",
            bg: "bg-or/10",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-card border border-sable-2 bg-blanc"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className="text-xs text-gris">{s.label}</span>
            </div>
            <div className="text-xl font-bold text-nuit">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nuit/40 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-blanc rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-modal-in"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-nuit">
                {editingId ? "Modifier la publicité" : "Nouvelle publicité"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                title="Fermer"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sable transition-colors"
              >
                <X className="w-5 h-5 text-gris" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Titre
                </label>
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Ex: Hôtel Laïco — -20% cet été"
                />
              </div>

              {/* Partner name */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Nom du partenaire
                </label>
                <input
                  required
                  maxLength={120}
                  value={form.partnerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, partnerName: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Ex: Hôtel Laïco Ouaga 2000"
                />
              </div>

              {/* Placement + priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Type d&#39;emplacement
                  </label>
                  <select
                    title="Type d'emplacement"
                    value={form.placement}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        placement: e.target.value as AdPlacement,
                      }))
                    }
                    className="input-field"
                  >
                    <option value="card">Carte sponsorisée</option>
                    <option value="banner">Bandeau horizontal</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Priorité (0-100)
                  </label>
                  <input
                    type="number"
                    title="Priorité"
                    min={0}
                    max={100}
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        priority: Number(e.target.value),
                      }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                    className="flex-1 input-field"
                    placeholder="URL de l'image ou uploader"
                  />
                  <label className="btn-outline px-4 py-2.5 cursor-pointer text-sm">
                    {uploading ? "..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Aperçu"
                    className="mt-2 h-24 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  URL de destination
                </label>
                <input
                  required
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkUrl: e.target.value }))
                  }
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              {/* Alt text */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-1">
                  Texte alternatif
                </label>
                <input
                  value={form.altText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, altText: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Description de l'image"
                />
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-medium text-nuit mb-2">
                  Pages d&#39;affichage
                </label>
                <div className="flex flex-wrap gap-2">
                  {PAGE_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePage(p)}
                      className={clsx(
                        "btn-pill",
                        form.pages.includes(p)
                          ? "btn-pill-active bg-rouge text-blanc"
                          : "btn-pill-inactive",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Début de campagne
                  </label>
                  <input
                    type="datetime-local"
                    title="Début de campagne"
                    value={form.startsAt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startsAt: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nuit mb-1">
                    Fin de campagne
                  </label>
                  <input
                    type="datetime-local"
                    title="Fin de campagne"
                    value={form.endsAt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endsAt: e.target.value }))
                    }
                    className="input-field"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-sable-2 text-rouge focus:ring-rouge"
                />
                <span className="text-sm text-nuit font-medium">
                  Publicité active
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-sable-2">
              <button
                type="button"
                onClick={closeForm}
                className="px-5 py-2.5 text-sm font-medium text-gris hover:text-nuit transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                className="px-6 py-2.5 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {editingId ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="border border-sable-2 rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sable text-left">
              <th className="px-4 py-3 font-medium text-gris">Publicité</th>
              <th className="px-4 py-3 font-medium text-gris">Type</th>
              <th className="px-4 py-3 font-medium text-gris">Pages</th>
              <th className="px-4 py-3 font-medium text-gris">Impressions</th>
              <th className="px-4 py-3 font-medium text-gris">Clics</th>
              <th className="px-4 py-3 font-medium text-gris">Statut</th>
              <th className="px-4 py-3 font-medium text-gris w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sable-2">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 bg-sable rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : ads.map((ad) => (
                  <tr
                    key={ad.id}
                    className="hover:bg-sable/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-sable-2"
                          />
                        )}
                        <div>
                          <div className="font-medium text-nuit">
                            {ad.title}
                          </div>
                          <div className="text-xs text-gris">
                            {ad.partnerName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gris">
                      {PLACEMENT_LABELS[ad.placement]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(ad.pages ?? []).map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 bg-sable rounded text-[10px] font-medium text-nuit"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-nuit font-medium">
                      {ad.impressions.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-nuit font-medium">
                      {ad.clicks.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          ad.isActive
                            ? "bg-vert/10 text-vert"
                            : "bg-rouge/10 text-rouge"
                        }`}
                      >
                        {ad.isActive ? (
                          <>
                            <Eye className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sable transition-colors text-gris hover:text-nuit"
                          title="Voir le lien"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEdit(ad)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sable transition-colors text-gris hover:text-nuit"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Supprimer cette publicité ?"))
                              deleteMut.mutate(ad.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rouge/10 transition-colors text-gris hover:text-rouge"
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
    </div>
  );
}
