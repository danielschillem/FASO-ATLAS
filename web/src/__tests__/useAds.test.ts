import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAds } from "@/hooks/useAds";
import type { Ad } from "@/types/models";
import React from "react";

const mockGetActive = vi.fn();
vi.mock("@/lib/api", () => ({
  adsApi: {
    getActive: (...args: unknown[]) => mockGetActive(...args),
  },
}));

const sampleAds: Ad[] = [
  {
    id: 1,
    title: "Hôtel Laico",
    partnerName: "Laico",
    placement: "banner",
    imageUrl: "https://example.com/laico.jpg",
    linkUrl: "https://laico.com",
    altText: "Hôtel Laico Ouagadougou",
    pages: ["home"],
    isActive: true,
    priority: 10,
    impressions: 100,
    clicks: 5,
    createdAt: "2025-01-01T00:00:00Z",
  },
];

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: qc }, children);
  };
}

describe("useAds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches ads by placement and page", async () => {
    mockGetActive.mockResolvedValue({ data: { data: sampleAds } });
    const { result } = renderHook(() => useAds("banner", "home", 1), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual(sampleAds));
    expect(mockGetActive).toHaveBeenCalledWith({
      placement: "banner",
      page: "home",
      limit: 1,
    });
  });

  it("returns empty array when no ads", async () => {
    mockGetActive.mockResolvedValue({ data: { data: [] } });
    const { result } = renderHook(() => useAds("sidebar", "wiki", 2), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it("handles API returning flat data (no nested .data)", async () => {
    mockGetActive.mockResolvedValue({ data: sampleAds });
    const { result } = renderHook(() => useAds("card", "destinations"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toEqual(sampleAds));
  });
});
