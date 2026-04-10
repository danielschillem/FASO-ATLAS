CREATE TABLE IF NOT EXISTS regions (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    capital    VARCHAR(100),
    code       VARCHAR(10) UNIQUE,
    geo_json   JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Seed the 17 administrative regions of Burkina Faso
INSERT INTO regions (name, capital, code) VALUES
    ('Boucle du Mouhoun',   'Dédougou',        'BM'),
    ('Cascades',            'Banfora',          'CA'),
    ('Centre',              'Ouagadougou',      'CE'),
    ('Centre-Est',          'Tenkodogo',        'CEN-EST'),
    ('Centre-Nord',         'Kaya',             'CEN-NORD'),
    ('Centre-Ouest',        'Koudougou',        'CEN-OUEST'),
    ('Centre-Sud',          'Manga',            'CEN-SUD'),
    ('Est',                 'Fada N''Gourma',   'EST'),
    ('Hauts-Bassins',       'Bobo-Dioulasso',   'HB'),
    ('Nord',                'Ouahigouya',       'NORD'),
    ('Plateau-Central',     'Ziniaré',          'PC'),
    ('Sahel',               'Dori',             'SA'),
    ('Sud-Ouest',           'Gaoua',            'SO')
ON CONFLICT (code) DO NOTHING;
