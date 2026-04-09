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
    imageUrls?: string[];
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

  // Establishments
  listEstablishments: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/establishments", { params }),
  toggleEstablishmentAvailable: (id: number, available: boolean) =>
    api.put(`/admin/establishments/${id}/available`, { available }),
  deleteEstablishment: (id: number) =>
    api.delete(`/admin/establishments/${id}`),

  // Itineraries
  listItineraries: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/itineraries", { params }),
  toggleItineraryPublic: (id: number, isPublic: boolean) =>
    api.put(`/admin/itineraries/${id}/public`, { public: isPublic }),
  deleteItinerary: (id: number) => api.delete(`/admin/itineraries/${id}`),

  // Reservations
  listReservations: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/reservations", { params }),
  updateReservationStatus: (id: number, status: string) =>
    api.put(`/admin/reservations/${id}/status`, { status }),

  // Car Rentals
  listCarRentals: (params?: { page?: number; limit?: number }) =>
    api.get("/admin/car-rentals", { params }),
  createCarRental: (data: object) => api.post("/admin/car-rentals", data),
  updateCarRental: (id: number, data: object) =>
    api.put(`/admin/car-rentals/${id}`, data),
  deleteCarRental: (id: number) => api.delete(`/admin/car-rentals/${id}`),
  toggleCarRentalAvailable: (id: number, available: boolean) =>
    api.put(`/admin/car-rentals/${id}/available`, { available }),

  // Regions
  listRegions: () => api.get("/admin/regions"),
  createRegion: (data: { name: string; capital: string; code: string }) =>
    api.post("/admin/regions", data),
  updateRegion: (
    id: number,
    data: { name?: string; capital?: string; code?: string },
  ) => api.put(`/admin/regions/${id}`, data),
  deleteRegion: (id: number) => api.delete(`/admin/regions/${id}`),

  // Symbols
  listSymbols: () => api.get("/admin/symbols"),
  createSymbol: (data: {
    name: string;
    category: string;
    description: string;
    svgPath: string;
    sortOrder: number;
  }) => api.post("/admin/symbols", data),
  updateSymbol: (
    id: number,
    data: {
      name?: string;
      category?: string;
      description?: string;
      svgPath?: string;
      sortOrder?: number;
    },
  ) => api.put(`/admin/symbols/${id}`, data),
  deleteSymbol: (id: number) => api.delete(`/admin/symbols/${id}`),
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

// Owner dashboard
export const ownerApi = {
  getStats: () => api.get("/owner/stats"),
  listEstablishments: (params?: { page?: number; limit?: number }) =>
    api.get("/owner/establishments", { params }),
  getEstablishment: (id: number) => api.get(`/owner/establishments/${id}`),
  createEstablishment: (data: {
    placeId: number;
    type: string;
    priceMinFcfa: number;
    priceMaxFcfa: number;
    stars: number;
    amenities: string[];
    phone: string;
    email: string;
    website: string;
  }) => api.post("/owner/establishments", data),
  updateEstablishment: (
    id: number,
    data: {
      type?: string;
      priceMinFcfa?: number;
      priceMaxFcfa?: number;
      stars?: number;
      amenities?: string[];
      phone?: string;
      email?: string;
      website?: string;
      isAvailable?: boolean;
    },
  ) => api.put(`/owner/establishments/${id}`, data),
  deleteEstablishment: (id: number) =>
    api.delete(`/owner/establishments/${id}`),
  listReservations: () => api.get("/owner/reservations"),
  updateReservationStatus: (id: number, status: string) =>
    api.put(`/owner/reservations/${id}/status`, { status }),
};

// Notifications
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get("/notifications", { params }),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

// Nearby (geospatial search)
export const nearbyApi = {
  places: (params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }) => api.get("/nearby/places", { params }),
  establishments: (params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }) => api.get("/nearby/establishments", { params }),
};
