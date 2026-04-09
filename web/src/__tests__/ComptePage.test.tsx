import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ComptePage from "@/app/compte/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/compte",
}));

// Mock api
const mockMe = vi.fn();
const mockMyReservations = vi.fn();
const mockOwnerReservations = vi.fn();

vi.mock("@/lib/api", () => ({
  authApi: {
    me: () => mockMe(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
  reservationsApi: {
    myReservations: (params: unknown) => mockMyReservations(params),
    ownerReservations: (params: unknown) => mockOwnerReservations(params),
    cancel: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

// Mock auth store
const mockUser = {
  id: 1,
  email: "test@fasoatlas.bf",
  firstName: "Amadou",
  lastName: "Ouédraogo",
  phone: "+22670000000",
  role: "tourist" as const,
  avatarUrl: "",
  isVerified: true,
  createdAt: "2025-01-01T00:00:00Z",
};

let currentMockUser = mockUser;
let currentMockToken: string | null = "tok_abc";

const storeState = {
  user: currentMockUser,
  accessToken: currentMockToken,
  isAuthenticated: () => !!currentMockToken,
  logout: vi.fn(),
  setAuth: vi.fn(),
};

vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector?: (s: Record<string, unknown>) => unknown) => {
    if (typeof selector === "function") return selector(storeState);
    return storeState;
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("ComptePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockUser;
    currentMockToken = "tok_abc";
    mockMyReservations.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 20 },
    });
    mockOwnerReservations.mockResolvedValue({
      data: { data: [], total: 0, page: 1, limit: 20 },
    });
  });

  it("renders user name and email", async () => {
    render(<ComptePage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/Amadou/)).toBeInTheDocument();
    });
    expect(screen.getByText("test@fasoatlas.bf")).toBeInTheDocument();
  });

  it("shows profile tab with editable fields", async () => {
    render(<ComptePage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/Amadou/)).toBeInTheDocument();
    });
    // Should have form inputs for profile
    const firstNameInput = screen.getByDisplayValue("Amadou");
    expect(firstNameInput).toBeInTheDocument();
  });

  it("shows role badge", async () => {
    render(<ComptePage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText(/Voyageur/i)).toBeInTheDocument();
    });
  });

  it("shows logout button", async () => {
    render(<ComptePage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Déconnexion")).toBeInTheDocument();
    });
  });

  it("shows favorites link", async () => {
    render(<ComptePage />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Favoris")).toBeInTheDocument();
    });
  });
});
