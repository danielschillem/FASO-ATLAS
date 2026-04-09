"use client";

import { useCallback } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";
import type { Ad } from "@/types/models";
import { adsApi } from "@/lib/api";
import { useState } from "react";

interface Props {
  ad: Ad;
  className?: string;
}

export function AdBanner({ ad, className }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const handleClick = useCallback(() => {
    adsApi.trackClick(ad.id).catch(() => {});
  }, [ad.id]);

  if (dismissed) return null;

  return (
    <div
      className={clsx(
        "relative bg-sable border-y border-sable-2 overflow-hidden animate-fade-in",
        className,
      )}
    >
      <div className="max-w-container mx-auto px-6 py-4">
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="flex items-center gap-6 group"
        >
          {/* Image thumbnail */}
          <div className="hidden sm:block w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-sable-2">
            <img
              src={ad.imageUrl}
              alt={ad.altText || ad.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-neutral">
                Partenaire
              </span>
              <span className="text-xs text-gris">{ad.partnerName}</span>
            </div>
            <p className="font-semibold text-nuit group-hover:text-rouge transition-colors line-clamp-1">
              {ad.title}
            </p>
          </div>
        </a>

        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-gris hover:text-nuit transition-all rounded-full hover:bg-sable-2 active:scale-95"
          aria-label="Fermer la publicité"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
