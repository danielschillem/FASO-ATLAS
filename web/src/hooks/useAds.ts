"use client";

import { useQuery } from "@tanstack/react-query";
import { adsApi } from "@/lib/api";
import type { Ad, AdPlacement } from "@/types/models";

export function useAds(
  placement: AdPlacement,
  page?: string,
  limit?: number,
) {
  return useQuery<Ad[]>({
    queryKey: ["ads", placement, page, limit],
    queryFn: async () => {
      const { data } = await adsApi.getActive({ placement, page, limit });
      return data.data ?? data;
    },
    staleTime: 5 * 60_000, // 5 min — matches backend cache TTL
  });
}
