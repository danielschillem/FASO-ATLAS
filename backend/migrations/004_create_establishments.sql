CREATE TABLE IF NOT EXISTS establishments (
    id              BIGSERIAL PRIMARY KEY,
    place_id        BIGINT REFERENCES places(id) NOT NULL,
    owner_id        BIGINT REFERENCES users(id),
    type            VARCHAR(20) CHECK (type IN ('hotel','restaurant','gite','camp')),
    price_min_fcfa  BIGINT,
    price_max_fcfa  BIGINT,
    stars           SMALLINT CHECK (stars BETWEEN 1 AND 5),
    amenities       TEXT[],
    phone_number    VARCHAR(20),
    email           VARCHAR(255),
    website         TEXT,
    is_available    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reviews (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT REFERENCES users(id),
    place_id         BIGINT REFERENCES places(id),
    establishment_id BIGINT REFERENCES establishments(id),
    rating           SMALLINT CHECK (rating BETWEEN 1 AND 5),
    comment          TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);
