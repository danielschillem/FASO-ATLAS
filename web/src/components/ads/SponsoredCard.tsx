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

export function SponsoredCard({ ad, className }: Props) {
  const handleClick = useCallback(() => {
    adsApi.trackClick(ad.id).catch(() => {});
  }, [ad.id]);

  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={clsx("group block", className)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-sable-2 shadow-sm group-hover:shadow-card transition-shadow duration-300">
        <img
          src={ad.imageUrl}
          alt={ad.altText || ad.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {/* Sponsored badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 glass-dark text-blanc text-[10px] font-medium uppercase tracking-wider rounded-full">
          <Megaphone className="w-3 h-3" />
          Sponsorisé
        </span>
      </div>

      {/* Content — matches DestinationCard layout */}
      <div>
        <h3 className="font-semibold text-nuit leading-snug line-clamp-1 group-hover:text-rouge transition-colors duration-200">
          {ad.title}
        </h3>
        <p className="text-sm text-gris mt-0.5">{ad.partnerName}</p>
      </div>
    </a>
  );
}
