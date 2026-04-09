"use client";

import { useCallback } from "react";
import { clsx } from "clsx";
import { Megaphone } from "lucide-react";
import type { Ad } from "@/types/models";
import { adsApi } from "@/lib/api";

interface Props {
  ad: Ad;
  className?: string;
}

export function AdSidebar({ ad, className }: Props) {
  const handleClick = useCallback(() => {
    adsApi.trackClick(ad.id).catch(() => {});
  }, [ad.id]);

  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={clsx(
        "group block rounded-card border border-sable-2 overflow-hidden hover:shadow-card-hover transition-all duration-300 focus-visible:ring-2 focus-visible:ring-rouge/50 focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="relative aspect-[3/2] bg-sable-2 overflow-hidden">
        <img
          src={ad.imageUrl}
          alt={ad.altText || ad.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          loading="lazy"
        />
      </div>
      <div className="p-4 bg-blanc">
        <div className="flex items-center gap-1.5 mb-2">
          <Megaphone className="w-3 h-3 text-gris" />
          <span className="badge badge-neutral">
            Sponsorisé
          </span>
        </div>
        <p className="font-semibold text-sm text-nuit line-clamp-2 leading-snug">
          {ad.title}
        </p>
        <p className="text-xs text-gris mt-1">{ad.partnerName}</p>
      </div>
    </a>
  );
}
