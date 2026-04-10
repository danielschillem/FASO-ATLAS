-- 018: Mise à jour des régions — passage de 13 à 17 régions (réforme de juillet 2025)
-- Les 13 anciennes régions sont renommées selon les nouvelles appellations locales
-- 4 nouvelles régions sont créées : Sirba, Soum, Tapoa, Sourou

-- ===========================================
-- 1) Renommer les 13 régions existantes
-- ===========================================
UPDATE regions SET name = 'Guiriko',    code = '01-GK'  WHERE code = 'HB';          -- Hauts-Bassins → Guiriko
UPDATE regions SET name = 'Bankui',     code = '02-BK'  WHERE code = 'BM';          -- Boucle du Mouhoun → Bankui
UPDATE regions SET name = 'Liptako',    code = '03-LP'  WHERE code = 'SA';          -- Sahel → Liptako
UPDATE regions SET name = 'Goulmou',    code = '04-GM'  WHERE code = 'EST';         -- Est → Goulmou
UPDATE regions SET name = 'Djôrô',      code = '05-DJ'  WHERE code = 'SO';          -- Sud-Ouest → Djôrô
UPDATE regions SET name = 'Kuilsé',     code = '06-KS'  WHERE code = 'CEN-NORD';   -- Centre-Nord → Kuilsé
UPDATE regions SET name = 'Nando',      code = '07-ND'  WHERE code = 'CEN-OUEST';  -- Centre-Ouest → Nando
UPDATE regions SET name = 'Oubri',      code = '08-OB'  WHERE code = 'PC';          -- Plateau-Central → Oubri
UPDATE regions SET name = 'Yaadga',     code = '09-YA'  WHERE code = 'NORD';        -- Nord → Yaadga
UPDATE regions SET name = 'Nakambé',    code = '10-NK'  WHERE code = 'CEN-EST';     -- Centre-Est → Nakambé
UPDATE regions SET name = 'Kadiogo',    code = '11-KD'  WHERE code = 'CE';          -- Centre → Kadiogo
UPDATE regions SET name = 'Tannounyan', code = '12-TN'  WHERE code = 'CA';          -- Cascades → Tannounyan
UPDATE regions SET name = 'Nazinon',    code = '13-NZ'  WHERE code = 'CEN-SUD';    -- Centre-Sud → Nazinon

-- ===========================================
-- 2) Ajouter les 4 nouvelles régions
-- ===========================================
INSERT INTO regions (name, capital, code) VALUES
    ('Sirba',   'Bogandé',  '14-SR'),
    ('Soum',    'Djibo',    '15-SM'),
    ('Tapoa',   'Diapaga',  '16-TP'),
    ('Sourou',  'Tougan',   '17-SU')
ON CONFLICT (code) DO NOTHING;
