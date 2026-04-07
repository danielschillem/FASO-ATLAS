"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
  backHref?: string;
  backLabel?: string;
}

export function ErrorState({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Veuillez réessayer.",
  retry,
  backHref,
  backLabel = "← Retour",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-rouge/10 rounded-full flex items-center justify-center mb-4">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C1272D"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="font-serif text-xl text-nuit mb-2">{title}</h3>
      <p className="text-gris text-sm max-w-md mb-6">{message}</p>
      <div className="flex gap-3">
        {retry && (
          <button
            onClick={retry}
            className="px-5 py-2.5 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors"
          >
            Réessayer
          </button>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="px-5 py-2.5 border border-sable-2 text-nuit text-sm font-medium rounded hover:border-or transition-colors"
          >
            {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  message = "Aucun r\u00e9sultat trouv\u00e9.",
  actionHref,
  actionLabel,
}: {
  icon?: ReactNode;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="text-center py-16 border border-dashed border-sable-2 rounded-card">
      <div className="mb-3 flex justify-center">
        {icon ?? <Search className="w-8 h-8 text-gris" />}
      </div>
      <p className="text-gris">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-block mt-4 px-5 py-2.5 bg-rouge text-blanc rounded font-medium hover:bg-rouge/90 transition-colors text-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
