import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

const mockCheck = vi.fn();
const mockToggle = vi.fn();
vi.mock("@/lib/api", () => ({
  favoritesApi: {
    check: (...args: unknown[]) => mockCheck(...args),
    toggle: (...args: unknown[]) => mockToggle(...args),
  },
}));

const mockIsAuthenticated = vi.fn(() => false);
vi.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: mockIsAuthenticated,
  }),
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
  });

  it("renders nothing when not authenticated", () => {
    const { container } = render(
      <FavoriteButton targetId={1} targetType="place" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders heart button when authenticated", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockCheck.mockResolvedValue({ data: { favorited: false } });
    render(<FavoriteButton targetId={1} targetType="place" />);
    await waitFor(() => {
      expect(screen.getByLabelText("Ajouter aux favoris")).toBeInTheDocument();
    });
  });

  it("shows filled heart when favorited", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockCheck.mockResolvedValue({ data: { favorited: true } });
    render(<FavoriteButton targetId={1} targetType="place" />);
    await waitFor(() => {
      expect(screen.getByLabelText("Retirer des favoris")).toBeInTheDocument();
    });
  });

  it("toggles favorite on click", async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockCheck.mockResolvedValue({ data: { favorited: false } });
    mockToggle.mockResolvedValue({ data: { favorited: true } });
    render(<FavoriteButton targetId={5} targetType="itinerary" />);
    await waitFor(() => {
      expect(screen.getByLabelText("Ajouter aux favoris")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText("Ajouter aux favoris"));
    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledWith(5, "itinerary");
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Retirer des favoris")).toBeInTheDocument();
    });
  });
});
