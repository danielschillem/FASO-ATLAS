CREATE TABLE IF NOT EXISTS atlas_events (
    id           BIGSERIAL PRIMARY KEY,
    era          VARCHAR(30) NOT NULL
                 CHECK (era IN ('mossi','bobo','colonial','independance','sankara')),
    year         INT,
    title        VARCHAR(255) NOT NULL,
    subtitle     VARCHAR(255),
    description  TEXT,
    tags         TEXT[],
    image_url    TEXT,
    gradient_css VARCHAR(200),
    sort_order   INT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ
);

-- Seed the 5 historical eras from the prototype
INSERT INTO atlas_events (era, year, title, subtitle, description, gradient_css, sort_order) VALUES
(
    'mossi', 1000,
    'Fondation des Royaumes Mossi',
    'Les cavaliers du Yatenga',
    'Vers l''an 1000, des cavaliers venus du nord fondent les puissants royaumes Mossi. Organisés autour du Mogho Naaba — "Roi du Monde" —, ces royaumes établissent une civilisation durable qui résiste aux empires voisins du Mali et de Songhaï. La société Mossi, hiérarchisée et militairement redoutable, domine le plateau central pendant cinq siècles.',
    'linear-gradient(135deg,#3D1C02 0%,#7C3B1E 50%,#C1272D 100%)',
    1
),
(
    'bobo', 1400,
    'Bobo-Dioulasso & la Route des Dioula',
    'Carrefour du commerce transsaharien',
    'Au XVème siècle, Bobo-Dioulasso devient un carrefour commercial majeur. Les marchands Dioula (Dyula) tissent des réseaux commerciaux reliant l''Afrique de l''Ouest, transportant or, cola, esclaves et sel. La Grande Mosquée, joyau de l''architecture soudano-sahélienne, est érigée à cette époque et témoigne de l''islamisation progressive de la région.',
    'linear-gradient(135deg,#2A1200 0%,#006B3C 50%,#D4A017 100%)',
    2
),
(
    'colonial', 1896,
    'Haute-Volta française',
    'La résistance de Boukary Koutou',
    'En 1896, les troupes françaises conquièrent le plateau mossi. La colonie de Haute-Volta est créée en 1919, démembrée en 1932, puis reconstituée en 1947. Cette période voit la transformation forcée des structures économiques, l''introduction du travail forcé et la résistance des chefferies traditionnelles. Boukary Koutou, le Mogho Naaba, négocie pour préserver l''autonomie mossi.',
    'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
    3
),
(
    'independance', 1960,
    'Indépendance de la Haute-Volta',
    '5 août 1960 — Maurice Yaméogo',
    'Le 5 août 1960, la Haute-Volta proclame son indépendance. Maurice Yaméogo devient le premier président. Le pays traverse une série de coups d''État militaires (1966, 1974, 1980, 1982) avant l''avènement de la révolution. Cette période est marquée par la construction des institutions nationales et la recherche d''une identité burkinabè.',
    'linear-gradient(135deg,#160A00 0%,#C1272D 40%,#006B3C 70%,#D4A017 100%)',
    4
),
(
    'sankara', 1984,
    'Thomas Sankara & la Révolution',
    'Le "Che Guevara africain" — 4 août 1984',
    'Le 4 août 1984, Thomas Sankara rebaptise la Haute-Volta "Burkina Faso" — "Pays des Hommes Intègres". Sa révolution promeut l''auto-suffisance alimentaire, la vaccination de masse, la reforestation, l''émancipation des femmes et la lutte contre la corruption. Assassiné le 15 octobre 1987, Sankara reste une icône panafricaine et sa vision continue d''inspirer une génération.',
    'linear-gradient(135deg,#3D1C02 0%,#C1272D 35%,#D4A017 65%,#006B3C 100%)',
    5
)
ON CONFLICT DO NOTHING;
