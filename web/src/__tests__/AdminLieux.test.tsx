import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLieuxPage from "@/app/admin/lieux/page";
import type { Place } from "@/types/models";

// Mock api
const mockListPlaces = vi.fn();
const mockGetRegions = vi.fn();
const mockCreatePlace = vi.fn();
const mockDeletePlace = vi.fn();
const mockTogglePlaceActive = vi.fn();

vi.mock("@/lib/api", () => ({
  adminApi: {
    listPlaces: (...args: unknown[]) => mockListPlaces(...args),
    createPlace: (...args: unknown[]) => mockCreatePlace(...args),
    updatePlace: vi.fn(),
    deletePlace: (...args: unknown[]) => mockDeletePlace(...args),
    togglePlaceActive: (...args: unknown[]) => mockTogglePlaceActive(...args),
  },
  mapApi: {
    getRegions: () => mockGetRegions(),
  },
}));

const samplePlaces: Place[] = [
  {
    id: 1,
    name: "Ruines de Loropéni",
    slug: "ruines-de-loropeni",
    type: "culture",
    description: "Site UNESCO",
    lat: 10.23,
    lng: -3.58,
    regionId: 1,
    region: { id: 1, name: "Cascades", capital: "Banfora", code: "CAS" },
    images: [],
    rating: 4.8,
    reviewCount: 25,
    tags: ["UNESCO", "histoire"],
    isActive: true,
  },
  {
    id: 2,
    name: "Lac de Tengréla",
    slug: "lac-de-tengrela",
    type: "nature",
    description: "Lac aux hippopotames",
    lat: 10.7,
    lng: -4.8,
    regionId: 1,
    region: { id: 1, name: "Cascades", capital: "Banfora", code: "CAS" },
    images: [],
    rating: 4.2,
    reviewCount: 15,
    tags: ["nature", "hippopotames"],
    isActive: false,
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("AdminLieuxPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListPlaces.mockResolvedValue({
      data: { data: samplePlaces, total: 2, page: 1, limit: 200 },
    });
    mockGetRegions.mockResolvedValue({
      data: {
        data: [{ id: 1, name: "Cascades", capital: "Banfora", code: "CAS" }],
      },
    });
  });

  it("renders page title", async () => {
    render(<AdminLieuxPage />, { wrapper });
    expect(screen.getByText("Gestion des lieux")).toBeInTheDocument();
  });

  it("displays places from API", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Ruines de Loropéni")).toBeInTheDocument();
    });
    expect(screen.getByText("Lac de Tengréla")).toBeInTheDocument();
  });

  it("shows place count", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("(2)")).toBeInTheDocument();
    });
  });

  it("displays 'Nouveau lieu' button", () => {
    render(<AdminLieuxPage />, { wrapper });
    expect(screen.getByText("Nouveau lieu")).toBeInTheDocument();
  });

  it("opens create modal on button click", async () => {
    render(<AdminLieuxPage />, { wrapper });
    fireEvent.click(screen.getByText("Nouveau lieu"));
    expect(screen.getByText("Créer le lieu")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Ruines de Loropéni"),
    ).toBeInTheDocument();
  });

  it("closes modal on cancel", async () => {
    render(<AdminLieuxPage />, { wrapper });
    fireEvent.click(screen.getByText("Nouveau lieu"));
    expect(screen.getByText("Créer le lieu")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Annuler"));
    expect(screen.queryByText("Créer le lieu")).not.toBeInTheDocument();
  });

  it("filters places by search", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Ruines de Loropéni")).toBeInTheDocument();
    });
    const searchInput = screen.getByPlaceholderText("Rechercher un lieu...");
    fireEvent.change(searchInput, { target: { value: "tengréla" } });
    expect(screen.queryByText("Ruines de Loropéni")).not.toBeInTheDocument();
    expect(screen.getByText("Lac de Tengréla")).toBeInTheDocument();
  });

  it("shows active/inactive badges", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Ruines de Loropéni")).toBeInTheDocument();
    });
    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(screen.getByText("Masqué")).toBeInTheDocument();
  });

  it("shows stats cards", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
    expect(screen.getByText("Actifs")).toBeInTheDocument();
    expect(screen.getByText("Note moy.")).toBeInTheDocument();
  });

  it("shows delete confirmation dialog", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Ruines de Loropéni")).toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByTitle("Supprimer");
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText("Confirmer la suppression")).toBeInTheDocument();
  });

  it("displays type labels in French", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Culture")).toBeInTheDocument();
    });
    expect(screen.getByText("Nature")).toBeInTheDocument();
  });

  it("shows slug under place name", async () => {
    render(<AdminLieuxPage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("/ruines-de-loropeni")).toBeInTheDocument();
    });
  });
});
