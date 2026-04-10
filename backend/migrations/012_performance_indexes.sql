-- Performance indexes for Faso Trip API
-- Targets the most common query patterns identified in repository layer

-- Places: filtered by type, region, active status, ordered by rating
CREATE INDEX IF NOT EXISTS idx_places_type ON places (type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_places_region_id ON places (region_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_places_active_rating ON places (is_active, rating DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_places_slug ON places (slug) WHERE deleted_at IS NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_places_search_vec ON places USING gin (search_vec) WHERE deleted_at IS NULL AND is_active = true;

-- Place images: fetched by place_id (Preload)
CREATE INDEX IF NOT EXISTS idx_place_images_place_id ON place_images (place_id) WHERE deleted_at IS NULL;

-- Establishments: filtered by type, stars, availability
CREATE INDEX IF NOT EXISTS idx_establishments_type ON establishments (type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_establishments_available ON establishments (is_available) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_establishments_stars ON establishments (stars) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_establishments_place_id ON establishments (place_id) WHERE deleted_at IS NULL;

-- Itineraries: filtered by public, difficulty, duration
CREATE INDEX IF NOT EXISTS idx_itineraries_public ON itineraries (is_public) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_itineraries_difficulty ON itineraries (difficulty) WHERE deleted_at IS NULL AND is_public = true;
CREATE INDEX IF NOT EXISTS idx_itineraries_duration ON itineraries (duration_days) WHERE deleted_at IS NULL AND is_public = true;

-- Itinerary stops: fetched by itinerary_id, ordered
CREATE INDEX IF NOT EXISTS idx_itinerary_stops_itin ON itinerary_stops (itinerary_id, stop_order) WHERE deleted_at IS NULL;

-- Wiki articles: filtered by category, approved, ordered by views
CREATE INDEX IF NOT EXISTS idx_wiki_articles_category ON wiki_articles (category) WHERE deleted_at IS NULL AND is_approved = true;
CREATE INDEX IF NOT EXISTS idx_wiki_articles_slug ON wiki_articles (slug) WHERE deleted_at IS NULL AND is_approved = true;
CREATE INDEX IF NOT EXISTS idx_wiki_articles_views ON wiki_articles (view_count DESC) WHERE deleted_at IS NULL AND is_approved = true;
CREATE INDEX IF NOT EXISTS idx_wiki_articles_search_vec ON wiki_articles USING gin (search_vec) WHERE deleted_at IS NULL AND is_approved = true;

-- Atlas events: ordered by sort_order, year; filtered by era
CREATE INDEX IF NOT EXISTS idx_atlas_events_era ON atlas_events (era, sort_order, year);

-- Symbols: ordered by sort_order
CREATE INDEX IF NOT EXISTS idx_symbols_sort ON symbols (sort_order) WHERE deleted_at IS NULL;

-- Reservations: filtered by user, establishment, status
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_establishment ON reservations (establishment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status) WHERE deleted_at IS NULL;

-- Reviews: fetched by place or establishment
CREATE INDEX IF NOT EXISTS idx_reviews_place ON reviews (place_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_establishment ON reviews (establishment_id) WHERE deleted_at IS NULL;

-- Favorites: user lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_favorites_target ON favorites (target_type, target_id) WHERE deleted_at IS NULL;

-- Refresh tokens: lookup by token hash
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id) WHERE deleted_at IS NULL;

-- Regions: rarely filtered but used in JOINs
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions (name) WHERE deleted_at IS NULL;
