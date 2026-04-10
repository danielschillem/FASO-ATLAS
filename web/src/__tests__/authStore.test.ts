import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/authStore";

const mockUser = {
  id: 1,
  email: "test@FasoTrip.bf",
  firstName: "Amadou",
  lastName: "Ouédraogo",
  phone: "+22670000000",
  role: "tourist" as const,
  avatarUrl: "",
  isVerified: true,
  createdAt: "2025-01-01T00:00:00Z",
};

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null });
    localStorage.clear();
  });

  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
  });

  it("setAuth stores user and token", () => {
    useAuthStore.getState().setAuth(mockUser, "tok_abc", "ref_xyz");
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe("tok_abc");
    expect(state.isAuthenticated()).toBe(true);
    expect(localStorage.getItem("accessToken")).toBe("tok_abc");
    expect(localStorage.getItem("refreshToken")).toBe("ref_xyz");
  });

  it("setAuth without refreshToken keeps existing", () => {
    localStorage.setItem("refreshToken", "old");
    useAuthStore.getState().setAuth(mockUser, "tok_new");
    expect(localStorage.getItem("refreshToken")).toBe("old");
  });

  it("logout clears everything", () => {
    useAuthStore.getState().setAuth(mockUser, "tok_abc", "ref_xyz");
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});
