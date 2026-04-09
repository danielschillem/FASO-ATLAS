-- Location de voitures
CREATE TABLE IF NOT EXISTS car_rentals (
    id              BIGSERIAL PRIMARY KEY,
    owner_id        BIGINT REFERENCES users(id),
    region_id       BIGINT REFERENCES regions(id),
    brand           VARCHAR(50) NOT NULL,
    model           VARCHAR(50) NOT NULL,
    year            SMALLINT,
    category        VARCHAR(20) CHECK (category IN ('economique','confort','suv','luxe','utilitaire')) NOT NULL,
    seats           SMALLINT DEFAULT 5,
    transmission    VARCHAR(15) CHECK (transmission IN ('manuelle','automatique')) DEFAULT 'manuelle',
    fuel_type       VARCHAR(15) CHECK (fuel_type IN ('essence','diesel','hybride','electrique')) DEFAULT 'essence',
    price_per_day   BIGINT NOT NULL,
    deposit_fcfa    BIGINT DEFAULT 0,
    features        TEXT[],
    image_url       TEXT,
    phone           VARCHAR(20),
    whatsapp        VARCHAR(20),
    is_available    BOOLEAN DEFAULT TRUE,
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    city            VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_car_rentals_category ON car_rentals(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_car_rentals_region ON car_rentals(region_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_car_rentals_available ON car_rentals(is_available) WHERE deleted_at IS NULL;

-- Seed data
INSERT INTO car_rentals (owner_id, region_id, brand, model, year, category, seats, transmission, fuel_type, price_per_day, deposit_fcfa, features, image_url, phone, whatsapp, is_available, lat, lng, city)
SELECT u.id, v.region_id, v.brand, v.model, v.year, v.category, v.seats, v.transmission, v.fuel_type, v.price_per_day, v.deposit_fcfa, v.features, v.image_url, v.phone, v.whatsapp, v.is_available, v.lat, v.lng, v.city
FROM (VALUES
  (1, 'Toyota', 'Corolla', 2023, 'confort', 5, 'automatique', 'essence', 25000, 100000, ARRAY['climatisation','bluetooth','GPS','assurance'], NULL::TEXT, '+226 70 00 00 01', '+226 70 00 00 01', true, 12.3714, -1.5197, 'Ouagadougou'),
  (1, 'Toyota', 'Hilux', 2022, 'suv', 5, 'manuelle', 'diesel', 45000, 200000, ARRAY['4x4','climatisation','galerie de toit','treuil'], NULL::TEXT, '+226 70 00 00 02', '+226 70 00 00 02', true, 12.3714, -1.5197, 'Ouagadougou'),
  (1, 'Renault', 'Kwid', 2024, 'economique', 5, 'manuelle', 'essence', 15000, 50000, ARRAY['climatisation','radio FM','USB'], NULL::TEXT, '+226 70 00 00 03', '+226 70 00 00 03', true, 12.3714, -1.5197, 'Ouagadougou'),
  (2, 'Toyota', 'Land Cruiser', 2021, 'luxe', 7, 'automatique', 'diesel', 75000, 500000, ARRAY['4x4','climatisation','cuir','GPS','caméra de recul','assurance tout risque'], NULL::TEXT, '+226 70 00 00 04', '+226 70 00 00 04', true, 11.1771, -4.2979, 'Bobo-Dioulasso'),
  (2, 'Suzuki', 'Alto', 2023, 'economique', 4, 'manuelle', 'essence', 12000, 30000, ARRAY['climatisation','radio'], NULL::TEXT, '+226 70 00 00 05', '+226 70 00 00 05', true, 11.1771, -4.2979, 'Bobo-Dioulasso'),
  (1, 'Hyundai', 'Tucson', 2022, 'suv', 5, 'automatique', 'essence', 40000, 150000, ARRAY['climatisation','bluetooth','caméra de recul','GPS'], NULL::TEXT, '+226 70 00 00 06', '+226 70 00 00 06', true, 12.3714, -1.5197, 'Ouagadougou'),
  (3, 'Toyota', 'Yaris', 2023, 'confort', 5, 'automatique', 'essence', 20000, 75000, ARRAY['climatisation','bluetooth','USB'], NULL::TEXT, '+226 70 00 00 07', '+226 70 00 00 07', true, 12.2742, -2.0747, 'Koudougou'),
  (1, 'Mercedes-Benz', 'Classe V', 2021, 'luxe', 8, 'automatique', 'diesel', 90000, 600000, ARRAY['climatisation zone','cuir','wifi','chauffeur disponible','assurance tout risque'], NULL::TEXT, '+226 70 00 00 08', '+226 70 00 00 08', true, 12.3714, -1.5197, 'Ouagadougou'),
  (2, 'Mitsubishi', 'L200', 2022, 'utilitaire', 5, 'manuelle', 'diesel', 35000, 100000, ARRAY['4x4','benne','climatisation','robuste'], NULL::TEXT, '+226 70 00 00 09', '+226 70 00 00 09', true, 11.1771, -4.2979, 'Bobo-Dioulasso'),
  (1, 'Kia', 'Picanto', 2024, 'economique', 5, 'manuelle', 'essence', 13000, 40000, ARRAY['climatisation','bluetooth','USB','économique'], NULL::TEXT, '+226 70 00 00 10', '+226 70 00 00 10', true, 12.3714, -1.5197, 'Ouagadougou')
) AS v(region_id, brand, model, year, category, seats, transmission, fuel_type, price_per_day, deposit_fcfa, features, image_url, phone, whatsapp, is_available, lat, lng, city)
CROSS JOIN (SELECT id FROM users WHERE email = 'system@faso-atlas.bf' LIMIT 1) u
ON CONFLICT DO NOTHING;
