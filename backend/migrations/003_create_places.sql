CREATE TABLE IF NOT EXISTS places (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) UNIQUE NOT NULL,
    type         VARCHAR(20) NOT NULL CHECK (type IN ('site','hotel','nature','culture')),
    description  TEXT,
    latitude     DOUBLE PRECISION NOT NULL,
    longitude    DOUBLE PRECISION NOT NULL,
    region_id    BIGINT REFERENCES regions(id),
    rating       NUMERIC(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    tags         TEXT[],
    is_active    BOOLEAN DEFAULT TRUE,
    search_vec   TSVECTOR,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS place_images (
    id         BIGSERIAL PRIMARY KEY,
    place_id   BIGINT REFERENCES places(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    caption    VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure search_vec column exists (GORM AutoMigrate may have created the table without it)
ALTER TABLE places ADD COLUMN IF NOT EXISTS search_vec TSVECTOR;

CREATE INDEX IF NOT EXISTS idx_places_type     ON places(type);
CREATE INDEX IF NOT EXISTS idx_places_region   ON places(region_id);
CREATE INDEX IF NOT EXISTS idx_places_search   ON places USING GIN(search_vec);
CREATE INDEX IF NOT EXISTS idx_places_active   ON places(is_active);

-- Full-text search trigger (French dictionary)
CREATE OR REPLACE FUNCTION places_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vec := to_tsvector('french',
    coalesce(NEW.name,'') || ' ' ||
    coalesce(NEW.description,'') || ' ' ||
    coalesce(array_to_string(NEW.tags,' '),'')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS places_search_trigger ON places;
CREATE TRIGGER places_search_trigger
  BEFORE INSERT OR UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION places_search_update();

-- Seed representative places with GPS coordinates
INSERT INTO places (name, slug, type, description, latitude, longitude, region_id, rating, tags) VALUES
    ('Grand Marché de Ouagadougou',  'grand-marche-ouagadougou', 'culture', 'Le plus grand marché de Ouagadougou, véritable cœur commercial et culturel de la capitale.', 12.3647, -1.5334, 3, 4.7, '{"commerce","culture","artisanat"}'),
    ('Ranch de Gibier de Nazinga',   'ranch-nazinga',             'nature',  'Réserve animalière abritant éléphants, buffles, hipopotames et de nombreuses espèces sauvages.', 11.1500, -1.6500, 7, 4.9, '{"safari","nature","wildlife","UNESCO"}'),
    ('Grande Mosquée de Bobo',       'grande-mosquee-bobo',       'site',    'Mosquée soudano-sahélienne emblématique de Bobo-Dioulasso, construite au XIVème siècle.', 11.1771, -4.2979, 9, 4.8, '{"architecture","islam","histoire"}'),
    ('Ruines de Loropéni',           'ruines-loropeni',           'site',    'Site du patrimoine mondial de l''UNESCO. Ruines d''une cité fortifiée datant du XIème siècle.', 10.0824, -3.4865, 13, 4.6, '{"UNESCO","archéologie","histoire"}'),
    ('Karfiguéla - Cascades de Banfora', 'cascades-banfora',      'nature',  'Magnifiques cascades tropicales au cœur d''une végétation luxuriante près de Banfora.', 10.6333, -4.8167, 2, 4.8, '{"cascades","nature","randonnée"}'),
    ('Pics de Sindou',               'pics-sindou',               'nature',  'Formations rocheuses spectaculaires sculptées par l''érosion, habitées par les Sénoufo.', 10.5667, -5.1333, 2, 4.7, '{"géologie","randonnée","culture"}'),
    ('Dôme de Fabedougou',           'dome-fabedougou',           'nature',  'Collines de grès rouge aux formes sphériques uniques près de Banfora.', 10.7500, -4.7000, 2, 4.5, '{"géologie","nature"}'),
    ('FESPACO - Ouagadougou',        'fespaco-ouagadougou',       'culture', 'Festival Panafricain du Cinéma et de la Télévision de Ouagadougou — le plus grand festival de cinéma d''Afrique.', 12.3714, -1.5297, 3, 4.9, '{"cinéma","culture","festival"}'),
    ('Musée National du Burkina Faso', 'musee-national',           'culture', 'Collections permanentes sur les arts, l''histoire et les traditions des peuples du Burkina Faso.', 12.3669, -1.5248, 3, 4.5, '{"musée","histoire","art"}'),
    ('Lac Tengrela',                 'lac-tengrela',              'nature',  'Lac aux lotus roses habité par des hippopotames en liberté, à quelques kilomètres de Banfora.', 10.6000, -4.7833, 2, 4.6, '{"lac","hippopotames","nature"}')
ON CONFLICT (slug) DO NOTHING;
