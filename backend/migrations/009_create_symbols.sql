CREATE TABLE IF NOT EXISTS symbols (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50),
    description TEXT,
    svg_path    TEXT,
    sort_order  INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

-- Seed cultural symbols of Burkina Faso
INSERT INTO symbols (name, category, description, sort_order) VALUES
    ('L''Étalon de Yennenga',   'légende',   'La cavalière Yennenga, fille du roi Dagomba Nedega, est la mère fondatrice du peuple Mossi. Son cheval blanc symbolise la liberté et la force du peuple burkinabè. L''Étalon de Yennenga est aussi le nom du prix suprême du FESPACO.', 1),
    ('Le Drapeau National',     'drapeau',   'Le drapeau du Burkina Faso est composé de deux bandes horizontales — rouge (en haut) et verte (en bas) — avec une étoile jaune au centre. Le rouge symbolise la révolution, le vert l''espoir et l''agriculture, l''or la richesse minière.', 2),
    ('L''Hymne National',       'hymne',     'Le "Ditanyè" (Hymne de la Victoire) est l''hymne national depuis la révolution de 1984. Composé sous Thomas Sankara, il appelle à la dignité, au travail et à la construction d''une nation libre.', 3),
    ('Le Bogolan',              'artisanat', 'Tissu traditionnel aux motifs géométriques, teint à l''argile fermentée. Symbole de l''identité culturelle burkinabè et de l''artisanat africain.', 4),
    ('Le Masque Nwantantay',    'masque',    'Masque planche des Bwa du Burkina Faso, utilisé lors des cérémonies d''initiation. Sa forme verticale distinctive peut atteindre plusieurs mètres de hauteur.', 5),
    ('La Nuit Culturelle',      'festival',  'Les Nuits Atypiques de Koudougou et le SIAO (Salon International de l''Artisanat de Ouagadougou) sont des événements culturels majeurs qui célèbrent la créativité africaine.', 6)
ON CONFLICT DO NOTHING;
