import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReviewSection from "@/components/reviews/ReviewSection";
import type { Review } from "@/types/models";

// Mock api
const mockListByPlace = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
vi.mock("@/lib/api", () => ({
  reviewsApi: {
    listByPlace: (...args: unknown[]) => mockListByPlace(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// Mock auth store
const mockIsAuthenticated = vi.fn(() => false);
const mockUser = vi.fn(() => null as { id: number } | null);
vi.mock("@/store/authStore", () => ({
  useAuthStore: (
    selector: (s: {
      isAuthenticated: () => boolean;
      user: { id: number } | null;
    }) => unknown,
  ) =>
    selector({
      isAuthenticated: mockIsAuthenticated,
      user: mockUser(),
    }),
}));

const sampleReviews: Review[] = [
  {
    id: 1,
    userId: 10,
    user: {
      id: 10,
      email: "amadou@test.bf",
      firstName: "Amadou",
      lastName: "Ouédraogo",
      phone: "",
      role: "tourist",
      avatarUrl: "",
      isVerified: true,
      createdAt: "2025-01-01T00:00:00Z",
    },
    placeId: 1,
    rating: 5,
    comment: "Magnifique expérience !",
    createdAt: "2025-06-15T10:00:00Z",
  },
  {
    id: 2,
    userId: 20,
    user: {
      id: 20,
      email: "fatou@test.bf",
      firstName: "Fatou",
      lastName: "Traoré",
      phone: "",
      role: "tourist",
      avatarUrl: "",
      isVerified: true,
      createdAt: "2025-02-01T00:00:00Z",
    },
    placeId: 1,
    rating: 3,
    comment: "Correct mais peut mieux faire.",
    createdAt: "2025-07-20T14:00:00Z",
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("ReviewSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
    mockUser.mockReturnValue(null);
  });

  it("shows loading skeleton initially", () => {
    mockListByPlace.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ReviewSection placeId={1} />, { wrapper });
    expect(screen.getByText("Avis")).toBeInTheDocument();
  });

  it("displays reviews from API", async () => {
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Magnifique expérience !")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Correct mais peut mieux faire."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Amadou/)).toBeInTheDocument();
    expect(screen.getByText(/Fatou/)).toBeInTheDocument();
  });

  it("shows empty state for unauthenticated user", async () => {
    mockListByPlace.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(
        screen.getByText("Aucun avis pour le moment."),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Connectez-vous")).toBeInTheDocument();
  });

  it("hides 'Donner un avis' button when not authenticated", async () => {
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Magnifique expérience !")).toBeInTheDocument();
    });
    expect(screen.queryByText("Donner un avis")).not.toBeInTheDocument();
  });

  it("shows 'Donner un avis' button when authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Donner un avis")).toBeInTheDocument();
    });
  });

  it("opens form when 'Donner un avis' clicked", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockListByPlace.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Donner un avis")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Donner un avis"));
    expect(screen.getByText("Votre note")).toBeInTheDocument();
    expect(screen.getByText("Votre commentaire")).toBeInTheDocument();
    expect(screen.getByText("Publier")).toBeInTheDocument();
  });

  it("validates empty rating on submit", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockListByPlace.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Donner un avis")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Donner un avis"));
    fireEvent.click(screen.getByText("Publier"));
    expect(screen.getByText("Veuillez donner une note.")).toBeInTheDocument();
  });

  it("validates empty comment on submit", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockListByPlace.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Donner un avis")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Donner un avis"));
    // Click 4th star
    const stars = screen.getAllByRole("button", { name: /Donner \d+ étoile/ });
    fireEvent.click(stars[3]);
    fireEvent.click(screen.getByText("Publier"));
    expect(
      screen.getByText("Le commentaire ne peut pas être vide."),
    ).toBeInTheDocument();
  });

  it("cancels form and resets state", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockListByPlace.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Donner un avis")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Donner un avis"));
    expect(screen.getByText("Publier")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Annuler"));
    expect(screen.queryByText("Publier")).not.toBeInTheDocument();
    expect(screen.getByText("Donner un avis")).toBeInTheDocument();
  });

  it("displays review count in header", async () => {
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("(2)")).toBeInTheDocument();
    });
  });

  it("shows edit/delete buttons only for own review", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockUser.mockReturnValue({ id: 10 }); // matches sampleReviews[0].userId
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Magnifique expérience !")).toBeInTheDocument();
    });
    // Own review has edit button
    const editButtons = screen.getAllByLabelText("Modifier mon avis");
    expect(editButtons).toHaveLength(1);
    const deleteButtons = screen.getAllByLabelText("Supprimer mon avis");
    expect(deleteButtons).toHaveLength(1);
  });

  it("opens inline edit form when edit button is clicked", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockUser.mockReturnValue({ id: 10 });
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Magnifique expérience !")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText("Modifier mon avis"));
    expect(screen.getByText("Enregistrer")).toBeInTheDocument();
    expect(screen.getByText("Annuler")).toBeInTheDocument();
  });

  it("calls delete API when delete button is clicked", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockUser.mockReturnValue({ id: 10 });
    mockDelete.mockResolvedValue({});
    mockListByPlace.mockResolvedValue({
      data: { data: sampleReviews, total: 2, page: 1, limit: 50 },
    });
    // Mock confirm dialog
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ReviewSection placeId={1} />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Magnifique expérience !")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText("Supprimer mon avis"));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });
});
