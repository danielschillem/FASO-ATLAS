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
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_itinerary_stops_itinerary ON itinerary_stops(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_public ON itineraries(is_public) WHERE is_public = TRUE;

-- Rename "order" to "stop_order" if GORM AutoMigrate created it with the wrong name
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='itinerary_stops' AND column_name='order')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='itinerary_stops' AND column_name='stop_order')
  THEN
    ALTER TABLE itinerary_stops RENAME COLUMN "order" TO stop_order;
  END IF;
END $$;
