"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Review, PaginatedResponse } from "@/types/models";

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

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery<PaginatedResponse<Review>>({
    queryKey: ["reviews", "place", placeId],
    queryFn: async () =>
      (await reviewsApi.listByPlace(placeId, { limit: 50 })).data,
  });
  const reviews = data?.data ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({ placeId, rating, comment: comment.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "place", placeId],
      });
      queryClient.invalidateQueries({ queryKey: ["destination"] });
      setShowForm(false);
      setRating(0);
      setComment("");
      setFormError("");
    },
    onError: () => {
      setFormError("Erreur lors de l'envoi. Veuillez réessayer.");
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
          {formError && <p className="text-rouge text-sm">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment("");
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
          <div className="text-3xl mb-2">💬</div>
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
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-nuit text-sm">
                    {review.user?.firstName ?? "Utilisateur"}{" "}
                    {review.user?.lastName?.charAt(0) ?? ""}.
                  </p>
                  <StarRating value={review.rating} readonly size={14} />
                </div>
                <span className="text-xs text-gris">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <p className="text-nuit text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
