import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach access token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(undefined),
  );
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;
      if (!refreshToken) return Promise.reject(error);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        processQueue(null);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => api.post("/auth/register", data),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, newPassword }),
  requestVerification: () => api.post("/auth/request-verification"),
  verifyEmail: (token: string) => api.post("/auth/verify-email", { token }),
};

// Map
export const mapApi = {
  getPlaces: (params?: { type?: string; regionId?: number }) =>
    api.get("/map/places", {
      params: { type: params?.type, region_id: params?.regionId },
    }),
  getPlace: (id: number) => api.get(`/map/places/${id}`),
  getRegions: () => api.get("/map/regions"),
};

// Destinations
export const destinationsApi = {
  list: (params?: {
    type?: string;
    regionId?: number;
    page?: number;
    limit?: number;
  }) => api.get("/destinations", { params }),
  get: (slug: string) => api.get(`/destinations/${slug}`),
};

// Establishments
export const establishmentsApi = {
  list: (params?: {
    type?: string;
    stars?: number;
    regionId?: number;
    page?: number;
  }) => api.get("/establishments", { params }),
  get: (id: number) => api.get(`/establishments/${id}`),
};

// Itineraries
export const itinerariesApi = {
  list: (params?: { difficulty?: string; duration?: number; page?: number }) =>
    api.get("/itineraries", { params }),
  get: (id: number) => api.get(`/itineraries/${id}`),
  create: (data: object) => api.post("/itineraries", data),
  addStop: (itineraryId: number, data: object) =>
    api.post(`/itineraries/${itineraryId}/stops`, data),
  deleteStop: (itineraryId: number, stopId: number) =>
    api.delete(`/itineraries/${itineraryId}/stops/${stopId}`),
};

// Reservations
export const reservationsApi = {
  create: (data: object) => api.post("/reservations", data),
  myReservations: () => api.get("/reservations/me"),
  get: (id: number) => api.get(`/reservations/${id}`),
  cancel: (id: number) => api.put(`/reservations/${id}/cancel`),
};

// Atlas
export const atlasApi = {
  getEvents: (era?: string) =>
    api.get("/atlas/events", { params: era ? { era } : undefined }),
};

// Wiki
export const wikiApi = {
  listArticles: (params?: { category?: string; page?: number }) =>
    api.get("/wiki/articles", { params }),
  getArticle: (slug: string) => api.get(`/wiki/articles/${slug}`),
  createArticle: (data: object) => api.post("/wiki/articles", data),
  addRevision: (slug: string, data: { bodyHtml: string; summary: string }) =>
    api.post(`/wiki/articles/${slug}/revisions`, data),
};

// Symbols
export const symbolsApi = {
  list: () => api.get("/symbols"),
};

// Search
export const searchApi = {
  search: (q: string, type?: string) =>
    api.get("/search", { params: { q, type } }),
};

// Reviews
export const reviewsApi = {
  listByPlace: (placeId: number, params?: { page?: number; limit?: number }) =>
    api.get(`/reviews/places/${placeId}`, { params }),
  listByEstablishment: (
    estabId: number,
    params?: { page?: number; limit?: number },
  ) => api.get(`/reviews/establishments/${estabId}`, { params }),
  create: (data: {
    placeId?: number;
    establishmentId?: number;
    rating: number;
    comment: string;
  }) => api.post("/reviews", data),
  update: (id: number, data: { rating: number; comment: string }) =>
    api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};
