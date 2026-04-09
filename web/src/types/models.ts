export type UserRole = "tourist" | "owner" | "admin";
export type PlaceType = "site" | "hotel" | "nature" | "culture";
export type EstablishmentType = "hotel" | "restaurant" | "gite" | "camp";
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";
export type HistoricalEra =
  | "mossi"
  | "bobo"
  | "colonial"
  | "independance"
  | "sankara";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Region {
  id: number;
  name: string;
  capital: string;
  code: string;
}

export interface PlaceImage {
  id: number;
  url: string;
  caption: string;
  sortOrder: number;
}

export interface Place {
  id: number;
  name: string;
  slug: string;
  type: PlaceType;
  description: string;
  lat: number;
  lng: number;
  regionId: number;
  region: Region;
  images: PlaceImage[];
  rating: number;
  reviewCount: number;
  tags: string[];
  isActive: boolean;
}

export interface MapFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: number;
    name: string;
    slug: string;
    type: PlaceType;
    description: string;
    rating: number;
    reviewCount: number;
    tags: string[];
    region: string;
    images: PlaceImage[];
  };
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

export interface Establishment {
  id: number;
  placeId: number;
  place: Place;
  type: EstablishmentType;
  priceMinFcfa: number;
  priceMaxFcfa: number;
  stars: number;
  amenities: string[];
  phone: string;
  email: string;
  website: string;
  isAvailable: boolean;
}

export interface ItineraryStop {
  id: number;
  placeId: number;
  place: Place;
  order: number;
  dayNumber: number;
  duration: string;
  notes: string;
}

export interface Itinerary {
  id: number;
  userId: number;
  title: string;
  description: string;
  durationDays: number;
  difficulty: string;
  budgetFcfa: number;
  isPublic: boolean;
  stops: ItineraryStop[];
  createdAt: string;
}

export interface Reservation {
  id: number;
  userId: number;
  user?: User;
  establishmentId: number;
  establishment: Establishment;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPriceFcfa: number;
  status: ReservationStatus;
  specialRequests: string;
  createdAt: string;
}

export interface AtlasEvent {
  id: number;
  era: HistoricalEra;
  year: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  imageUrl: string;
  gradientCss: string;
  sortOrder: number;
}

export interface WikiRevision {
  id: number;
  articleId: number;
  authorId: number;
  author?: User;
  bodyHtml: string;
  summary: string;
  createdAt: string;
}

export interface WikiArticle {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  leadText: string;
  bodyHtml: string;
  infoboxData: Record<string, string>;
  tags: string[];
  authorId: number;
  author: User;
  isApproved: boolean;
  viewCount: number;
  revisions?: WikiRevision[];
  createdAt: string;
}

export interface Symbol {
  id: number;
  name: string;
  category: string;
  description: string;
  svgPath: string;
  sortOrder: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchResults {
  places?: Place[];
  establishments?: Establishment[];
  wiki?: WikiArticle[];
  itineraries?: Itinerary[];
}

export interface Review {
  id: number;
  userId: number;
  user: User;
  placeId?: number;
  establishmentId?: number;
  rating: number;
  comment: string;
  images?: ReviewImage[];
  createdAt: string;
}

export interface ReviewImage {
  id: number;
  reviewId: number;
  url: string;
  caption: string;
  sortOrder: number;
}

export type NotificationType =
  | "reservation_confirmed"
  | "reservation_cancelled"
  | "departure_reminder"
  | "review_reply"
  | "new_review";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  targetId: number;
  targetType: "place" | "itinerary";
  createdAt: string;
}

export type AdPlacement = "banner" | "card" | "sidebar";

export interface Ad {
  id: number;
  title: string;
  partnerName: string;
  placement: AdPlacement;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  pages: string[];
  priority: number;
  impressions: number;
  clicks: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

export type CarCategory =
  | "economique"
  | "confort"
  | "suv"
  | "luxe"
  | "utilitaire";

export interface CarRental {
  id: number;
  ownerId: number;
  regionId: number;
  region: Region;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  seats: number;
  transmission: string;
  fuelType: string;
  pricePerDay: number;
  depositFcfa: number;
  features: string[];
  imageUrl: string;
  phone: string;
  whatsapp: string;
  isAvailable: boolean;
  lat: number;
  lng: number;
  city: string;
  createdAt: string;
}
