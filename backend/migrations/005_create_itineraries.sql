CREATE TABLE IF NOT EXISTS itineraries (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id),
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    duration_days INT,
    difficulty    VARCHAR(30) DEFAULT 'modéré',
    budget_fcfa   BIGINT,
    is_public     BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS itinerary_stops (
    id           BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT REFERENCES itineraries(id) ON DELETE CASCADE,
    place_id     BIGINT REFERENCES places(id),
    stop_order   INT NOT NULL,
    day_number   INT NOT NULL,
    duration     VARCHAR(50),
    notes        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_stops_itinerary ON itinerary_stops(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_public ON itineraries(is_public) WHERE is_public = TRUE;
