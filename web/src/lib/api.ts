import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// Map
export const mapApi = {
  getPlaces: (params?: { type?: string; regionId?: number }) =>
    api.get('/map/places', { params: { type: params?.type, region_id: params?.regionId } }),
  getPlace: (id: number) => api.get(`/map/places/${id}`),
  getRegions: () => api.get('/map/regions'),
}

// Destinations
export const destinationsApi = {
  list: (params?: { type?: string; regionId?: number; page?: number; limit?: number }) =>
    api.get('/destinations', { params }),
  get: (slug: string) => api.get(`/destinations/${slug}`),
}

// Establishments
export const establishmentsApi = {
  list: (params?: { type?: string; stars?: number; regionId?: number; page?: number }) =>
    api.get('/establishments', { params }),
  get: (id: number) => api.get(`/establishments/${id}`),
}

// Itineraries
export const itinerariesApi = {
  list: (params?: { difficulty?: string; duration?: number; page?: number }) =>
    api.get('/itineraries', { params }),
  get: (id: number) => api.get(`/itineraries/${id}`),
  create: (data: object) => api.post('/itineraries', data),
  addStop: (itineraryId: number, data: object) =>
    api.post(`/itineraries/${itineraryId}/stops`, data),
  deleteStop: (itineraryId: number, stopId: number) =>
    api.delete(`/itineraries/${itineraryId}/stops/${stopId}`),
}

// Reservations
export const reservationsApi = {
  create: (data: object) => api.post('/reservations', data),
  myReservations: () => api.get('/reservations/me'),
  get: (id: number) => api.get(`/reservations/${id}`),
  cancel: (id: number) => api.put(`/reservations/${id}/cancel`),
}

// Atlas
export const atlasApi = {
  getEvents: (era?: string) =>
    api.get('/atlas/events', { params: era ? { era } : undefined }),
}

// Wiki
export const wikiApi = {
  listArticles: (params?: { category?: string; page?: number }) =>
    api.get('/wiki/articles', { params }),
  getArticle: (slug: string) => api.get(`/wiki/articles/${slug}`),
  createArticle: (data: object) => api.post('/wiki/articles', data),
  addRevision: (slug: string, data: { bodyHtml: string; summary: string }) =>
    api.post(`/wiki/articles/${slug}/revisions`, data),
}

// Symbols
export const symbolsApi = {
  list: () => api.get('/symbols'),
}

// Search
export const searchApi = {
  search: (q: string, type?: string) =>
    api.get('/search', { params: { q, type } }),
}
