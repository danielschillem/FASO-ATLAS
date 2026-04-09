import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Remove Content-Type on GET requests — it's unnecessary and triggers CORS preflight
api.interceptors.request.use((config) => {
  if (config.method === "get") {
    delete config.headers["Content-Type"];
  }
  return config;
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
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl?: string;
  }) => api.put("/auth/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
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
  }) =>
    api.get("/destinations", {
      params: {
        type: params?.type,
        region_id: params?.regionId,
        page: params?.page,
        limit: params?.limit,
      },
    }),
  get: (slug: string) => api.get(`/destinations/${slug}`),
};

// Establishments
export const establishmentsApi = {
  list: (params?: {
    type?: string;
    stars?: number;
    regionId?: number;
    page?: number;
  }) =>
    api.get("/establishments", {
      params: {
        type: params?.type,
        stars: params?.stars,
        region_id: params?.regionId,
        page: params?.page,
      },
    }),
  get: (id: number) => api.get(`/establishments/${id}`),
};

// Itineraries
export const itinerariesApi = {
  list: (params?: { difficulty?: string; duration?: number; page?: number }) =>
    api.get("/itineraries", { params }),
  get: (id: number) => api.get(`/itineraries/${id}`),
  create: (data: object) => api.post("/itineraries", data),
  update: (id: number, data: object) => api.put(`/itineraries/${id}`, data),
  delete: (id: number) => api.delete(`/itineraries/${id}`),
  addStop: (itineraryId: number, data: object) =>
    api.post(`/itineraries/${itineraryId}/stops`, data),
  deleteStop: (itineraryId: number, stopId: number) =>
    api.delete(`/itineraries/${itineraryId}/stops/${stopId}`),
};

// Reservations
export const reservationsApi = {
  create: (data: object) => api.post("/reservations", data),
  myReservations: () => api.get("/reservations/me"),
  ownerReservations: () => api.get("/reservations/owner"),
  get: (id: number) => api.get(`/reservations/${id}`),
  cancel: (id: number) => api.put(`/reservations/${id}/cancel`),
  updateStatus: (id: number, status: string) =>
    api.put(`/reservations/${id}/status`, { status }),
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
  approveRevision: (revisionId: number) =>
    api.put(`/wiki/revisions/${revisionId}/approve`),
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

// Public Stats
export const statsApi = {
  get: () => api.get("/stats"),
};

// Favorites
export const favoritesApi = {
  check: (targetId: number, type: string) =>
    api.get(`/favorites/check/${targetId}`, { params: { type } }),
  toggle: (targetId: number, targetType: string) =>
    api.post("/favorites/toggle", { targetId, targetType }),
  list: (params?: { type?: string; offset?: number; limit?: number }) =>
    api.get("/favorites", { params }),
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

// Admin
export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  listUsers: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/users", { params }),
  updateUserRole: (id: number, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  // Places CRUD
  listPlaces: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/places", { params }),
  getPlace: (id: number) => api.get(`/admin/places/${id}`),
  createPlace: (data: {
    name: string;
    slug: string;
    type: string;
    description: string;
    lat: number;
    lng: number;
    regionId?: number | null;
    tags?: string[];
    isActive?: boolean;
  }) => api.post("/admin/places", data),
  updatePlace: (
    id: number,
    data: {
      name?: string;
      slug?: string;
      type?: string;
      description?: string;
      lat?: number;
      lng?: number;
      regionId?: number | null;
      tags?: string[];
      isActive?: boolean;
    },
  ) => api.put(`/admin/places/${id}`, data),
  deletePlace: (id: number) => api.delete(`/admin/places/${id}`),
  togglePlaceActive: (id: number, active: boolean) =>
    api.put(`/admin/places/${id}/active`, { active }),
  toggleArticleApproved: (id: number, approved: boolean) =>
    api.put(`/admin/wiki/articles/${id}/approved`, { approved }),
};

// Ads (régie pub)
export const adsApi = {
  getActive: (params: {
    placement: "banner" | "card" | "sidebar";
    page?: string;
    limit?: number;
  }) => api.get("/ads", { params }),
  trackClick: (id: number) => api.post(`/ads/${id}/click`),
  // Admin
  list: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/ads", { params }),
  get: (id: number) => api.get(`/admin/ads/${id}`),
  create: (data: {
    title: string;
    partnerName: string;
    placement: string;
    imageUrl: string;
    linkUrl: string;
    altText?: string;
    pages?: string[];
    priority?: number;
    isActive?: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
  }) => api.post("/admin/ads", data),
  update: (
    id: number,
    data: {
      title?: string;
      partnerName?: string;
      placement?: string;
      imageUrl?: string;
      linkUrl?: string;
      altText?: string;
      pages?: string[];
      priority?: number;
      isActive?: boolean;
      startsAt?: string | null;
      endsAt?: string | null;
    },
  ) => api.put(`/admin/ads/${id}`, data),
  delete: (id: number) => api.delete(`/admin/ads/${id}`),
};

// Car Rentals (location de voitures)
export const carRentalsApi = {
  list: (params?: {
    category?: string;
    regionId?: number;
    seats?: number;
    page?: number;
    limit?: number;
  }) =>
    api.get("/car-rentals", {
      params: {
        category: params?.category,
        region_id: params?.regionId,
        seats: params?.seats,
        page: params?.page,
        limit: params?.limit,
      },
    }),
  get: (id: number) => api.get(`/car-rentals/${id}`),
};

// Upload
export const uploadApi = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("image", file);
    if (folder) formData.append("folder", folder);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
