-- ============================================================================
-- 017_phase2_enrichment.sql
-- Phase 2 — Enrichissement : review images, recherche géographique, notifications
-- ============================================================================

-- ============================================================================
-- 1) TABLE review_images — photos attachées aux avis
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_images (
    id          BIGSERIAL PRIMARY KEY,
    review_id   BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    caption     VARCHAR(255) DEFAULT '',
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);

-- ============================================================================
-- 2) TABLE notifications — notifications utilisateur
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL, -- 'reservation_confirmed', 'reservation_cancelled', 'review_reply', 'departure_reminder'
    title       VARCHAR(255) NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB DEFAULT '{}',
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- 3) Colonne fcm_token sur users — pour les push notifications mobiles
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255) DEFAULT '';

-- ============================================================================
-- 4) Fonction haversine — recherche géographique par proximité
-- ============================================================================
CREATE OR REPLACE FUNCTION haversine_distance(
    lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
    SELECT 6371 * 2 * ASIN(SQRT(
        POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
        COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
        POWER(SIN(RADIANS(lon2 - lon1) / 2), 2)
    ))
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- Index géospatial (btree sur lat/lng pour bounding box pré-filtrage)
CREATE INDEX IF NOT EXISTS idx_places_lat_lng ON places(latitude, longitude);

-- ============================================================================
-- 5) Images supplémentaires — enrichir les établissements sans images
-- ============================================================================
INSERT INTO place_images (place_id, url, caption, sort_order)
SELECT p.id, i.url, i.caption, i.sort_order
FROM (VALUES
  -- Hôtels Ouagadougou
  ('hotel-splendide-ouaga', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'Hall de l''Hôtel Splendide', 1),
  ('hotel-splendide-ouaga', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'Piscine de l''Hôtel Splendide', 2),
  ('hotel-relax-ouaga', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'Chambre de l''Hôtel Relax', 1),
  ('hotel-relax-ouaga', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', 'Jardin tropical', 2),
  ('auberge-karitier-ouaga', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800', 'Bungalow en matériaux locaux', 1),

  -- Bobo-Dioulasso
  ('hotel-entente-bobo', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', 'Façade coloniale de l''Hôtel L''Entente', 1),
  ('hotel-entente-bobo', 'https://images.unsplash.com/photo-1590490360182-c33d955c3795?w=800', 'Cour intérieure', 2),

  -- Banfora & Cascades
  ('campement-banfora', 'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=800', 'Cases en banco du campement', 1),
  ('campement-banfora', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'Feu de camp au crépuscule', 2),

  -- Lodge Nazinga
  ('lodge-nazinga', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800', 'Vue sur la savane depuis le lodge', 1),
  ('lodge-nazinga', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'Safari au lever du soleil', 2),

  -- Hôtel Ran
  ('hotel-ran-ouaga', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', 'Piscine rooftop de l''Hôtel Ran', 1),
  ('hotel-ran-ouaga', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800', 'Chambre deluxe avec vue', 2),

  -- Hôtel Dafra Bobo
  ('hotel-dafra-bobo', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', 'Jardin luxuriant de l''Hôtel Dafra', 1),

  -- Restaurant Gondwana
  ('restaurant-gondwana', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', 'Terrasse gastronomique du Gondwana', 1),
  ('restaurant-gondwana', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', 'Plat fusion Saveurs du Faso', 2),

  -- Campement Sindou
  ('campement-sindou', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800', 'Tentes aménagées face aux Pics', 1),

  -- Lodge Sahel Dori
  ('lodge-sahel-dori', 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800', 'Architecture en terre du Lodge', 1),
  ('lodge-sahel-dori', 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800', 'Nuit étoilée dans le Sahel', 2),

  -- Maison d'hôtes Tiébélé
  ('maison-hotes-tiebele', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Fresques traditionnelles Kassena', 1),

  -- Restaurant Eau Vive
  ('restaurant-eau-vive-ouaga', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 'Terrasse sous les manguiers', 1),

  -- Auberge Nazinga
  ('auberge-nazinga', 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800', 'Hébergement simple à Nazinga', 1),

  -- Lieux culturels / nature sans images
  ('mare-hippopotames-bala', 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800', 'Hippopotames dans la mare de Bala', 1),
  ('foret-kou', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', 'Piscines naturelles de la Forêt de Kou', 1),
  ('village-artisanal-ouaga', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', 'Artisans bronziers au Village', 1),
  ('cathedrale-ouagadougou', 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800', 'Cathédrale en latérite', 1),
  ('mare-poissons-sacres', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 'Mare aux Poissons Sacrés', 1),
  ('musee-bobo', 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=800', 'Collection de masques au Musée', 1),
  ('reserve-arly', 'https://images.unsplash.com/photo-1535338454528-1b22dc446882?w=800', 'Éléphants dans la Réserve d''Arly', 1),
  ('chutes-tapoa', 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8673?w=800', 'Chutes de la Tapoa', 1),
  ('palais-yatenga-naaba', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Palais du Yatenga Naaba', 1),
  ('nuits-atypiques-koudougou', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800', 'Festival Nuits Atypiques', 1),
  ('dunes-oudalan', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800', 'Dunes sahéliennes de l''Oudalan', 1),
  ('mare-oursi', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 'Zone humide de la Mare d''Oursi', 1),
  ('falaises-boromo', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Escarpements rocheux de Boromo', 1),
  ('hippos-mouhoun', 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800', 'Hippopotames du Mouhoun', 1),
  ('tombes-lobi', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Sites funéraires Lobi', 1),
  ('musee-poni', 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=800', 'Musée du Poni', 1),
  ('marche-bestiaux-kaya', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', 'Marché aux bestiaux', 1),
  ('parc-manga', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', 'Parc verdoyant de Manga', 1),

  -- Lieux de 015_seed_demo_data sans images
  ('foret-dem', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', 'Forêt protégée de Dem', 1),
  ('mosquee-kaya', 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800', 'Mosquée de style soudanais', 1),
  ('palais-tenkodogo', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Palais Royal de Tenkodogo', 1),
  ('lac-tenado', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 'Coucher de soleil sur le Lac', 1),
  ('tombes-pobe-mengao', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Tumuli de Pobé-Mengao', 1),
  ('ruines-loropeni-visite', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Ruins_of_Lorop%C3%A9ni.jpg/800px-Ruins_of_Lorop%C3%A9ni.jpg', 'Murailles UNESCO de Loropéni', 1),
  ('village-lobi-kampti', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Sukala fortifié Lobi', 1),
  ('campement-touareg-oudalan', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800', 'Campement Touareg', 1),
  ('parc-pama', 'https://images.unsplash.com/photo-1535338454528-1b22dc446882?w=800', 'Faune du Parc de Pama', 1),
  ('mare-caimans-sabce', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800', 'Mare sacrée de Sabcé', 1),
  ('ziniare-yennenga', 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800', 'Ziniaré — terre de Yennenga', 1)
) AS i(place_slug, url, caption, sort_order)
JOIN places p ON p.slug = i.place_slug
ON CONFLICT DO NOTHING;
