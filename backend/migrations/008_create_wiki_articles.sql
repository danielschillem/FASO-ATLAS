CREATE TABLE IF NOT EXISTS wiki_articles (
    id           BIGSERIAL PRIMARY KEY,
    slug         VARCHAR(255) UNIQUE NOT NULL,
    title        VARCHAR(255) NOT NULL,
    subtitle     VARCHAR(255),
    category     VARCHAR(100),
    lead_text    TEXT,
    body_html    TEXT,
    infobox_data JSONB,
    tags         TEXT[],
    author_id    BIGINT REFERENCES users(id),
    is_approved  BOOLEAN DEFAULT FALSE,
    view_count   INT DEFAULT 0,
    search_vec   TSVECTOR,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wiki_revisions (
    id         BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES wiki_articles(id),
    author_id  BIGINT REFERENCES users(id),
    body_html  TEXT,
    summary    VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure search_vec column exists (GORM AutoMigrate may have created the table without it)
ALTER TABLE wiki_articles ADD COLUMN IF NOT EXISTS search_vec TSVECTOR;

CREATE INDEX IF NOT EXISTS idx_wiki_approved ON wiki_articles(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki_articles(category);
CREATE INDEX IF NOT EXISTS idx_wiki_search   ON wiki_articles USING GIN(search_vec);

-- Full-text search trigger for wiki articles
CREATE OR REPLACE FUNCTION wiki_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vec := to_tsvector('french',
    coalesce(NEW.title,'') || ' ' ||
    coalesce(NEW.subtitle,'') || ' ' ||
    coalesce(NEW.lead_text,'') || ' ' ||
    coalesce(array_to_string(NEW.tags,' '),'')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wiki_search_trigger ON wiki_articles;
CREATE TRIGGER wiki_search_trigger
  BEFORE INSERT OR UPDATE ON wiki_articles
  FOR EACH ROW EXECUTE FUNCTION wiki_search_update();

-- Seed initial wiki articles (approved by system)
INSERT INTO wiki_articles (slug, title, subtitle, category, lead_text, body_html, infobox_data, tags, is_approved) VALUES
(
    'peuple-mossi',
    'Peuple Mossi',
    'Le peuple majoritaire du Burkina Faso',
    'Peuples & Langues',
    'Les Mossi (ou Moose) sont le groupe ethnique le plus important du Burkina Faso, représentant environ 40% de la population totale, soit près de 8 millions de personnes.',
    '<h2>Histoire</h2><p>Les Mossi sont descendants de cavaliers guerriers venus du nord vers le XIème siècle. Ils fondèrent plusieurs royaumes puissants dont le Royaume de Ouagadougou et le Royaume de Yatenga.</p><h2>Organisation sociale</h2><p>La société Mossi est fortement hiérarchisée. Le Mogho Naaba, roi suprême résidant à Ouagadougou, préside encore aujourd''hui des cérémonies traditionnelles hebdomadaires.</p><h2>Langue</h2><p>Le Mooré est parlé par plus de 8 millions de personnes au Burkina Faso. C''est l''une des langues nationales avec le Dioula et le Fulfuldé.</p>',
    '{"Population": "~8 millions", "Langue": "Mooré", "Religion": "Islam, Christianisme, Animisme", "Région": "Plateau central", "Capitale traditionnelle": "Ouagadougou"}',
    '{"mossi","mooré","peuple","burkina"}',
    TRUE
),
(
    'bogolan',
    'Bogolan',
    'Le tissu traditionnel burkinabè',
    'Culture & Arts',
    'Le Bogolan (ou Bogolanfini) est un tissu traditionnel d''Afrique de l''Ouest teint à l''argile fermentée, réputé pour ses motifs géométriques distinctifs en brun foncé sur fond beige.',
    '<h2>Technique</h2><p>Le tissu est d''abord teint avec des feuilles de N''gallama puis enduit d''argile fermentée. Les motifs sont obtenus en réservant certaines parties du tissu.</p><h2>Symbolisme</h2><p>Chaque motif raconte une histoire ou véhicule un message symbolique lié à la vie sociale, spirituelle ou guerrière de la communauté.</p>',
    '{"Origine": "Mali, Burkina Faso", "Matière": "Coton filé à la main", "Technique": "Teinture à l''argile", "Couleurs": "Brun, beige, noir"}',
    '{"bogolan","tissu","artisanat","culture","art"}',
    TRUE
),
(
    'fespaco',
    'FESPACO',
    'Festival Panafricain du Cinéma et de la Télévision de Ouagadougou',
    'Culture & Arts',
    'Le FESPACO est le plus grand festival de cinéma africain. Organisé tous les deux ans à Ouagadougou depuis 1969, il réunit des cinéastes du continent entier.',
    '<h2>Histoire</h2><p>Fondé en 1969 par un groupe de cinéphiles burkinabè, le FESPACO est devenu en cinquante ans la principale vitrine du cinéma africain dans le monde.</p><h2>Prix</h2><p>L''Étalon de Yennenga — cheval d''or — est la récompense suprême, symbole de la cavalière légendaire fondatrice du peuple Mossi.</p>',
    '{"Fondation": "1969", "Fréquence": "Biennale (années impaires)", "Lieu": "Ouagadougou", "Prix principal": "Étalon de Yennenga", "Participants": "50+ pays africains"}',
    '{"fespaco","cinéma","festival","ouagadougou","culture"}',
    TRUE
)
ON CONFLICT (slug) DO NOTHING;
