-- 018: Mise à jour des régions — passage de 13 à 17 régions (réforme de juillet 2025)
-- Les 13 anciennes régions sont renommées selon les nouvelles appellations locales
-- 4 nouvelles régions sont créées : Sirba, Soum, Tapoa, Sourou

-- ===========================================
-- 1) Renommer les 13 régions existantes (idempotent)
-- ===========================================
UPDATE regions SET name = 'Guiriko',    code = '01-GK'  WHERE code = 'HB'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '01-GK');
UPDATE regions SET name = 'Bankui',     code = '02-BK'  WHERE code = 'BM'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '02-BK');
UPDATE regions SET name = 'Liptako',    code = '03-LP'  WHERE code = 'SA'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '03-LP');
UPDATE regions SET name = 'Goulmou',    code = '04-GM'  WHERE code = 'EST'       AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '04-GM');
UPDATE regions SET name = 'Djôrô',      code = '05-DJ'  WHERE code = 'SO'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '05-DJ');
UPDATE regions SET name = 'Kuilsé',     code = '06-KS'  WHERE code = 'CEN-NORD' AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '06-KS');
UPDATE regions SET name = 'Nando',      code = '07-ND'  WHERE code = 'CEN-OUEST' AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '07-ND');
UPDATE regions SET name = 'Oubri',      code = '08-OB'  WHERE code = 'PC'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '08-OB');
UPDATE regions SET name = 'Yaadga',     code = '09-YA'  WHERE code = 'NORD'      AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '09-YA');
UPDATE regions SET name = 'Nakambé',    code = '10-NK'  WHERE code = 'CEN-EST'   AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '10-NK');
UPDATE regions SET name = 'Kadiogo',    code = '11-KD'  WHERE code = 'CE'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '11-KD');
UPDATE regions SET name = 'Tannounyan', code = '12-TN'  WHERE code = 'CA'        AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '12-TN');
UPDATE regions SET name = 'Nazinon',    code = '13-NZ'  WHERE code = 'CEN-SUD'   AND NOT EXISTS (SELECT 1 FROM regions WHERE code = '13-NZ');

-- ===========================================
-- 2) Ajouter les 4 nouvelles régions
-- ===========================================
INSERT INTO regions (name, capital, code) VALUES
    ('Sirba',   'Bogandé',  '14-SR'),
    ('Soum',    'Djibo',    '15-SM'),
    ('Tapoa',   'Diapaga',  '16-TP'),
    ('Sourou',  'Tougan',   '17-SU')
ON CONFLICT (code) DO NOTHING;
