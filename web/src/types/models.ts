export type UserRole = 'tourist' | 'owner' | 'admin'
export type PlaceType = 'site' | 'hotel' | 'nature' | 'culture'
export type EstablishmentType = 'hotel' | 'restaurant' | 'gite' | 'camp'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type HistoricalEra = 'mossi' | 'bobo' | 'colonial' | 'independance' | 'sankara'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: UserRole
  avatarUrl: string
  isVerified: boolean
  createdAt: string
}

export interface Region {
  id: number
  name: string
  capital: string
  code: string
}

export interface PlaceImage {
  id: number
  url: string
  caption: string
  sortOrder: number
}

export interface Place {
  id: number
  name: string
  slug: string
  type: PlaceType
  description: string
  lat: number
  lng: number
  regionId: number
  region: Region
  images: PlaceImage[]
  rating: number
  reviewCount: number
  tags: string[]
  isActive: boolean
}

export interface MapFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: number
    name: string
    slug: string
    type: PlaceType
    description: string
    rating: number
    reviewCount: number
    tags: string[]
    region: string
    images: PlaceImage[]
  }
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: MapFeature[]
}

export interface Establishment {
  id: number
  placeId: number
  place: Place
  type: EstablishmentType
  priceMinFcfa: number
  priceMaxFcfa: number
  stars: number
  amenities: string[]
  phone: string
  email: string
  website: string
  isAvailable: boolean
}

export interface ItineraryStop {
  id: number
  placeId: number
  place: Place
  order: number
  dayNumber: number
  duration: string
  notes: string
}

export interface Itinerary {
  id: number
  userId: number
  title: string
  description: string
  durationDays: number
  difficulty: string
  budgetFcfa: number
  isPublic: boolean
  stops: ItineraryStop[]
  createdAt: string
}

export interface Reservation {
  id: number
  userId: number
  establishmentId: number
  establishment: Establishment
  checkInDate: string
  checkOutDate: string
  guestsCount: number
  totalPriceFcfa: number
  status: ReservationStatus
  specialRequests: string
  createdAt: string
}

export interface AtlasEvent {
  id: number
  era: HistoricalEra
  year: number
  title: string
  subtitle: string
  description: string
  tags: string[]
  imageUrl: string
  gradientCss: string
  sortOrder: number
}

export interface WikiArticle {
  id: number
  slug: string
  title: string
  subtitle: string
  category: string
  leadText: string
  bodyHtml: string
  infoboxData: Record<string, string>
  tags: string[]
  authorId: number
  author: User
  isApproved: boolean
  viewCount: number
  createdAt: string
}

export interface Symbol {
  id: number
  name: string
  category: string
  description: string
  svgPath: string
  sortOrder: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface SearchResults {
  places?: Place[]
  establishments?: Establishment[]
  wiki?: WikiArticle[]
  itineraries?: Itinerary[]
}
