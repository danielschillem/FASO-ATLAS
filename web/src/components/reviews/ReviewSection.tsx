"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, uploadApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Review, PaginatedResponse } from "@/types/models";
import { MessageCircle, Pencil, Trash2, ImagePlus } from "lucide-react";
import Image from "next/image";

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`${readonly ? "Note" : "Sélection"} : ${value} sur 5 étoiles`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={
            (readonly ? s <= Math.round(value) : s <= (hover || value))
              ? "#D4A017"
              : "#EDD9A3"
          }
          className={readonly ? "" : "cursor-pointer transition-colors"}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(s)}
          role={readonly ? undefined : "button"}
          aria-label={
            readonly ? undefined : `Donner ${s} étoile${s > 1 ? "s" : ""}`
          }
          tabIndex={readonly ? undefined : 0}
          onKeyDown={(e) => {
            if (!readonly && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onChange?.(s);
            }
          }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReviewSection({ placeId }: { placeId: number }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const currentUser = useAuthStore((s) => s.user);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editError, setEditError] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Review>>({
    queryKey: ["reviews", "place", placeId],
    queryFn: async () =>
      (await reviewsApi.listByPlace(placeId, { limit: 50 })).data,
  });
  const reviews = data?.data ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        placeId,
        rating,
        comment: comment.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "place", placeId],
      });
      queryClient.invalidateQueries({ queryKey: ["destination"] });
      setShowForm(false);
      setRating(0);
      setComment("");
      setImageUrls([]);
      setFormError("");
    },
    onError: () => {
      setFormError("Erreur lors de l'envoi. Veuillez réessayer.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      reviewsApi.update(editingId!, {
        rating: editRating,
        comment: editComment.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "place", placeId],
      });
      queryClient.invalidateQueries({ queryKey: ["destination"] });
      setEditingId(null);
      setEditRating(0);
      setEditComment("");
      setEditError("");
    },
    onError: () => {
      setEditError("Erreur lors de la modification.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "place", placeId],
      });
      queryClient.invalidateQueries({ queryKey: ["destination"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (rating === 0) {
      setFormError("Veuillez donner une note.");
      return;
    }
    if (!comment.trim()) {
      setFormError("Le commentaire ne peut pas être vide.");
      return;
    }
    mutation.mutate();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    if (editRating === 0) {
      setEditError("Veuillez donner une note.");
      return;
    }
    if (!editComment.trim()) {
      setEditError("Le commentaire ne peut pas être vide.");
      return;
    }
    updateMutation.mutate();
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditError("");
  };

  const handleDelete = (id: number) => {
    if (confirm("Supprimer cet avis ?")) {
      deleteMutation.mutate(id);
    }
  };

  const isOwner = (review: Review) =>
    currentUser && review.userId === currentUser.id;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-nuit">
          Avis
          {reviews.length > 0 && (
            <span className="text-gris text-lg ml-2">({reviews.length})</span>
          )}
        </h2>
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors"
          >
            Donner un avis
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-sable border border-sable-2 rounded-card p-5 mb-6 space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-nuit block mb-2">
              Votre note
            </label>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">
              Votre commentaire
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Partagez votre expérience…"
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm resize-none"
            />
          </div>
          {/* Photo upload */}
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">
              Photos (optionnel, max 5)
            </label>
            <div className="flex gap-2 flex-wrap">
              {imageUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls(imageUrls.filter((_, j) => j !== i))
                    }
                    className="absolute top-0 right-0 bg-rouge text-blanc text-xs w-5 h-5 flex items-center justify-center rounded-bl"
                  >
                    ×
                  </button>
                </div>
              ))}
              {imageUrls.length < 5 && (
                <label className="w-16 h-16 border-2 border-dashed border-sable-2 rounded-lg flex items-center justify-center cursor-pointer hover:border-or transition-colors">
                  <ImagePlus className="w-5 h-5 text-gris" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const res = await uploadApi.upload(file, "reviews");
                        setImageUrls([...imageUrls, res.data.url]);
                      } catch {
                        setFormError(
                          "Erreur lors du téléchargement de l'image.",
                        );
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="text-xs text-gris mt-1">Téléchargement…</p>
            )}
          </div>
          {formError && <p className="text-rouge text-sm">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment("");
                setImageUrls([]);
                setFormError("");
              }}
              className="px-4 py-2 text-sm text-nuit border border-sable-2 rounded hover:border-or transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Envoi…" : "Publier"}
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-sable rounded-card p-4 space-y-2">
              <div className="h-4 bg-sable-2 rounded w-1/4" />
              <div className="h-3 bg-sable-2 rounded w-full" />
              <div className="h-3 bg-sable-2 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gris text-sm border border-sable-2 rounded-card">
          <div className="mb-2 flex justify-center">
            <MessageCircle className="w-8 h-8 text-gris" />
          </div>
          Aucun avis pour le moment.
          {!isAuthenticated && (
            <p className="mt-1">
              <a href="/login" className="text-rouge hover:underline">
                Connectez-vous
              </a>{" "}
              pour être le premier à donner votre avis.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-sable border border-sable-2 rounded-card p-4"
            >
              {editingId === review.id ? (
                /* Inline edit form */
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-nuit block mb-1">
                      Note
                    </label>
                    <StarRating
                      value={editRating}
                      onChange={setEditRating}
                      size={24}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-nuit block mb-1">
                      Commentaire
                    </label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm resize-none"
                    />
                  </div>
                  {editError && (
                    <p className="text-rouge text-sm">{editError}</p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-sm text-nuit border border-sable-2 rounded hover:border-or transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-3 py-1.5 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors disabled:opacity-60"
                    >
                      {updateMutation.isPending ? "Envoi…" : "Enregistrer"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Read-only view */
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-nuit text-sm">
                        {review.user?.firstName ?? "Utilisateur"}{" "}
                        {review.user?.lastName?.charAt(0) ?? ""}.
                      </p>
                      <StarRating value={review.rating} readonly size={14} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gris">
                        {formatDate(review.createdAt)}
                      </span>
                      {isOwner(review) && (
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => startEdit(review)}
                            className="p-1 rounded hover:bg-rouge/10 text-gris hover:text-rouge transition-colors"
                            aria-label="Modifier mon avis"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1 rounded hover:bg-rouge/10 text-gris hover:text-rouge transition-colors disabled:opacity-50"
                            aria-label="Supprimer mon avis"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-nuit text-sm leading-relaxed">
                    {review.comment}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {review.images.map((img) => (
                        <div
                          key={img.id}
                          className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0"
                        >
                          <Image
                            src={img.url}
                            alt={img.caption || "Photo avis"}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
