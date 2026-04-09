-- ============================================================================
-- 011_seed_complete_data.sql
-- Phase 8 — Contenu & Données réelles du Burkina Faso
-- 
-- Ce fichier complète les données de base déjà existantes dans les
-- migrations 002-009 avec du contenu riche et vérifié.
-- ============================================================================

-- ============================================================================
-- 1) RÉGIONS — mise à jour avec GeoJSON (centres géographiques)
-- ============================================================================
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-3.4199,11.5684]}' WHERE code = 'BM';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-4.7167,10.6333]}' WHERE code = 'CA';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-1.5197,12.3714]}' WHERE code = 'CE';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-0.3688,11.7786]}' WHERE code = 'CEN-EST';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-1.0842,13.0909]}' WHERE code = 'CEN-NORD';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-2.3625,12.2487]}' WHERE code = 'CEN-OUEST';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-1.0667,11.6667]}' WHERE code = 'CEN-SUD';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[0.3499,12.0628]}' WHERE code = 'EST';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-4.2979,11.1771]}' WHERE code = 'HB';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-2.4262,13.5822]}' WHERE code = 'NORD';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-1.2966,12.5833]}' WHERE code = 'PC';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-0.0350,14.0354]}' WHERE code = 'SA';
UPDATE regions SET geo_json = '{"type":"Point","coordinates":[-3.1776,10.3264]}' WHERE code = 'SO';

-- ============================================================================
-- 2) LIEUX TOURISTIQUES — ajout de lieux supplémentaires (coordonnées GPS vérifiées)
-- ============================================================================
INSERT INTO places (name, slug, type, description, latitude, longitude, region_id, rating, tags) VALUES

-- ── Cascades ─────────────────────────────────────────────────────────
('Mare aux Hippopotames', 'mare-hippopotames-bala', 'nature',
 'Réserve de biosphère UNESCO. Cette mare permanente abrite une importante colonie d''hippopotames, des crocodiles et plus de 200 espèces d''oiseaux. Située dans la forêt classée du Kou.',
 11.4167, -4.1500, 2, 4.7, '{"UNESCO","biosphère","hippos","oiseaux","nature"}'),

('Forêt Classée de Kou', 'foret-kou', 'nature',
 'Source du fleuve Kou jaillissant de la roche. Forêt galerie luxuriante, lieu de baignade populaire avec piscines naturelles au milieu d''une végétation tropicale dense.',
 11.1833, -4.4333, 2, 4.5, '{"forêt","baignade","source","nature"}'),

-- ── Centre (Ouagadougou) ─────────────────────────────────────────────
('Monument des Héros Nationaux', 'monument-heros-nationaux', 'site',
 'Mémorial moderne dédié à Thomas Sankara et aux héros de l''indépendance. Tour imposante offrant une vue panoramique sur Ouagadougou.',
 12.3731, -1.5292, 3, 4.6, '{"mémorial","Sankara","histoire","architecture"}'),

('Parc Bangr-Wéoogo', 'parc-bangr-weogo', 'nature',
 'Forêt urbaine sacrée au cœur de Ouagadougou. Ancien bois sacré des rois Mossi, c''est aujourd''hui un parc de 265 hectares abritant une forêt relique, un musée et un zoo.',
 12.3800, -1.5000, 3, 4.4, '{"parc","forêt","zoo","Mossi","nature"}'),

('Village Artisanal de Ouagadougou', 'village-artisanal-ouaga', 'culture',
 'Centre d''artisanat regroupant plus de 500 artisans : bronziers, tisserands, sculpteurs, cordonniers. Lieu idéal pour découvrir et acheter l''artisanat burkinabè authentique.',
 12.3550, -1.5200, 3, 4.5, '{"artisanat","bronze","bogolan","commerce","culture"}'),

('Cathédrale de l''Immaculée Conception', 'cathedrale-ouagadougou', 'site',
 'Plus grande cathédrale d''Afrique de l''Ouest au moment de sa construction (1934). Architecture coloniale remarquable en latérite, dominant le centre-ville.',
 12.3660, -1.5275, 3, 4.3, '{"cathédrale","architecture","colonial","religion"}'),

-- ── Hauts-Bassins (Bobo-Dioulasso) ───────────────────────────────────
('Vieille Ville de Bobo', 'vieille-ville-bobo', 'culture',
 'Quartier historique Kibidwé, cœur ancestral de Bobo-Dioulasso. Ruelles étroites, maisons en banco, forgerons traditionnels et le sacré bois de la mare aux poissons sacrés.',
 11.1780, -4.2920, 9, 4.7, '{"histoire","banco","tradition","Bobo","culture"}'),

('Mare aux Poissons Sacrés de Bobo', 'mare-poissons-sacres', 'culture',
 'Site sacré au cœur du vieux Bobo. Les silures géants sont considérés comme les protecteurs de la ville. Il est interdit de les pêcher ; on les nourrit lors de cérémonies rituelles.',
 11.1775, -4.2925, 9, 4.6, '{"sacré","poissons","tradition","rituel","culture"}'),

('Musée Communal de Bobo-Dioulasso', 'musee-bobo', 'culture',
 'Musée ethnographique présentant les cultures Bobo, Sénoufo et Dioula. Collections de masques cérémonials, instruments de musique, textiles et objets rituels.',
 11.1760, -4.2945, 9, 4.4, '{"musée","masques","ethnographie","culture"}'),

-- ── Est (Fada N''Gourma & environs) ──────────────────────────────────
('Parc W du Niger', 'parc-w-niger', 'nature',
 'Parc transfrontalier UNESCO (Bénin–Burkina–Niger). L''un des derniers refuges du guépard et du lycaon d''Afrique de l''Ouest. Lions, éléphants, buffles, hippos.',
 11.9000, 2.0000, 8, 4.8, '{"UNESCO","parc","lions","éléphants","safari","wildlife"}'),

('Réserve d''Arly', 'reserve-arly', 'nature',
 'Parc national jouxtant le Parc W. Écosystème de savane arbustive abritant éléphants, lions, buffles et antilopes. Un des meilleurs spots d''observation de la faune d''Afrique de l''Ouest.',
 11.5833, 1.4667, 8, 4.6, '{"safari","éléphants","lions","faune","nature"}'),

('Tapoa - Chutes d''eau', 'chutes-tapoa', 'nature',
 'Chutes spectaculaires de la rivière Tapoa à l''entrée du Parc W. En saison des pluies, le débit est impressionnant. Point de rendez-vous des éléphants en saison sèche.',
 12.0500, 2.0333, 8, 4.5, '{"cascades","rivière","éléphants","nature"}'),

-- ── Nord (Ouahigouya) ────────────────────────────────────────────────
('Palais du Yatenga Naaba', 'palais-yatenga-naaba', 'site',
 'Résidence du roi du Yatenga à Ouahigouya. Le Yatenga est l''un des plus anciens royaumes Mossi. Des cérémonies traditionnelles ont encore lieu chaque vendredi.',
 13.5825, -2.4260, 10, 4.4, '{"royauté","Mossi","Yatenga","tradition","histoire"}'),

('Crocodiles Sacrés de Sabou', 'crocodiles-sabou', 'culture',
 'À Sabou, les crocodiles sont sacrés. Les villageois vivent en harmonie avec des dizaines de crocodiles du Nil. Les visiteurs peuvent s''approcher et les toucher — guidés par un gardien.',
 12.0667, -1.5833, 6, 4.7, '{"crocodiles","sacré","animaux","tradition","culture"}'),

-- ── Centre-Ouest (Koudougou) ─────────────────────────────────────────
('Nuits Atypiques de Koudougou', 'nuits-atypiques-koudougou', 'culture',
 'Festival de musiques du monde, danse et théâtre organisé chaque année à Koudougou. Réunit artistes locaux et internationaux dans une atmosphère unique.',
 12.2500, -2.3600, 6, 4.5, '{"festival","musique","danse","culture"}'),

-- ── Sahel ─────────────────────────────────────────────────────────────
('Dunes de l''Oudalan', 'dunes-oudalan', 'nature',
 'Paysages sahéliens grandioses avec dunes de sable vif, végétation éparse et campements de bergers Peuls. Le point le plus septentrional du Burkina touche le Sahara.',
 14.4000, -0.2000, 12, 4.3, '{"sahel","dunes","désert","Peul","nature"}'),

('Mare d''Oursi', 'mare-oursi', 'nature',
 'Importante zone humide du Sahel. Lieu de transhumance pour les troupeaux Peuls. Observatoire ornithologique avec des espèces de passage trans-sahariennes.',
 14.6667, -0.4667, 12, 4.2, '{"oiseaux","sahel","transhumance","Peul","nature"}'),

-- ── Boucle du Mouhoun ────────────────────────────────────────────────
('Falaises de Bandiagara burkinabè', 'falaises-boromo', 'nature',
 'Prolongement sud des falaises du Pays Dogon. Escarpements rocheux spectaculaires, grottes troglodytiques et villages accrochés à la roche.',
 11.7500, -2.9167, 1, 4.4, '{"falaises","géologie","grottes","randonnée"}'),

('Hippopotames du Mouhoun', 'hippos-mouhoun', 'nature',
 'Le fleuve Mouhoun (Volta Noire) abrite des colonies d''hippopotames observables depuis les berges. Paysages de savane arborée luxuriante.',
 11.3333, -3.5000, 1, 4.3, '{"hippos","fleuve","savane","nature"}'),

-- ── Sud-Ouest ────────────────────────────────────────────────────────
('Tombes royales de Lobi', 'tombes-lobi', 'site',
 'Sites funéraires du peuple Lobi dans la région de Gaoua. Architecture en terre séchée, statuaire funéraire et rites animistes encore pratiqués.',
 10.3333, -3.1833, 13, 4.3, '{"Lobi","funéraire","animisme","histoire"}'),

('Musée du Poni', 'musee-poni', 'culture',
 'Musée ethnographique de Gaoua consacré au peuple Lobi. Reconstitution de l''habitat traditionnel en terre, collection de statuettes votives et objets rituels.',
 10.3264, -3.1776, 13, 4.4, '{"musée","Lobi","ethnographie","terre","culture"}'),

-- ── Plateau-Central ──────────────────────────────────────────────────
('Laongo - Sculptures sur Granit', 'sculptures-laongo', 'culture',
 'Site de sculpture en plein air : des artistes du monde entier ont taillé d''immenses blocs de granit. Galerie à ciel ouvert unique en Afrique, à 35 km de Ouagadougou.',
 12.5300, -1.3500, 11, 4.6, '{"sculpture","granit","art","plein air","culture"}'),

-- ── Centre-Nord (Kaya) ───────────────────────────────────────────────
('Marché aux Bestiaux de Kaya', 'marche-bestiaux-kaya', 'culture',
 'L''un des plus grands marchés à bétail d''Afrique de l''Ouest. Ambiance saisissante chaque semaine avec les bergers Peuls et Mossi venus de toute la région.',
 13.0909, -1.0842, 5, 4.2, '{"marché","bétail","Peul","commerce","culture"}'),

-- ── Centre-Est ───────────────────────────────────────────────────────
('Tiébélé - Cours Royales Peintes', 'tiebele-cours-royales', 'culture',
 'Village du peuple Kassena célèbre pour ses habitations décorées de fresques géométriques peintes par les femmes. Classé au patrimoine mondial en attente. Chaque motif a une signification précise.',
 11.1000, -0.9833, 4, 4.8, '{"peinture","Kassena","architecture","tradition","UNESCO","culture"}'),

-- ── Centre-Sud ───────────────────────────────────────────────────────
('Parc Urbain de Manga', 'parc-manga', 'nature',
 'Espace vert de la capitale du Centre-Sud. Balades ombragées, petit zoo et vue sur les collines de latérite environnantes.',
 11.6667, -1.0667, 7, 3.9, '{"parc","détente","nature"}')

ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 3) IMAGES des lieux (URLs Unsplash/Wikimedia Creative Commons)
-- ============================================================================
INSERT INTO place_images (place_id, url, caption, sort_order)
SELECT p.id, i.url, i.caption, i.sort_order
FROM (VALUES
  -- Grand Marché
  ('grand-marche-ouagadougou', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Étals colorés du Grand Marché', 1),
  ('grand-marche-ouagadougou', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', 'Artisanat et tissus', 2),
  -- Nazinga
  ('ranch-nazinga', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'Éléphants à Nazinga', 1),
  ('ranch-nazinga', 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800', 'Savane au crépuscule', 2),
  -- Mosquée Bobo
  ('grande-mosquee-bobo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Grande_mosqu%C3%A9e_de_Bobo-Dioulasso.jpg/800px-Grande_mosqu%C3%A9e_de_Bobo-Dioulasso.jpg', 'Grande Mosquée de Bobo-Dioulasso', 1),
  -- Loropéni
  ('ruines-loropeni', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Ruins_of_Lorop%C3%A9ni.jpg/800px-Ruins_of_Lorop%C3%A9ni.jpg', 'Ruines de Loropéni — UNESCO', 1),
  -- Cascades Banfora
  ('cascades-banfora', 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8673?w=800', 'Cascades de Karfiguéla', 1),
  -- Pics de Sindou
  ('pics-sindou', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Sindou_peaks.jpg/800px-Sindou_peaks.jpg', 'Pics de Sindou', 1),
  -- Dôme Fabedougou
  ('dome-fabedougou', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'Formations rocheuses de Fabedougou', 1),
  -- FESPACO
  ('fespaco-ouagadougou', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 'Festival FESPACO', 1),
  -- Musée National
  ('musee-national', 'https://images.unsplash.com/photo-1575223970966-76ae61ee7838?w=800', 'Musée National du Burkina Faso', 1),
  -- Lac Tengrela
  ('lac-tengrela', 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800', 'Lac Tengrela — lotus et hippos', 1),
  -- Tiébélé
  ('tiebele-cours-royales', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Ti%C3%A9b%C3%A9l%C3%A9_Cour_Royale.jpg/800px-Ti%C3%A9b%C3%A9l%C3%A9_Cour_Royale.jpg', 'Cours Royales Peintes de Tiébélé', 1),
  -- Crocodiles de Sabou
  ('crocodiles-sabou', 'https://images.unsplash.com/photo-1585095595833-70f1ac5714c3?w=800', 'Crocodile sacré de Sabou', 1),
  -- Sculptures Laongo
  ('sculptures-laongo', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', 'Sculptures sur granit de Laongo', 1),
  -- Parc W
  ('parc-w-niger', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', 'Lion dans le Parc W', 1),
  -- Vieille Ville Bobo
  ('vieille-ville-bobo', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Ruelles du vieux Bobo', 1),
  -- Monument Héros
  ('monument-heros-nationaux', 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800', 'Monument des Héros Nationaux', 1),
  -- Bangr-Weogo
  ('parc-bangr-weogo', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', 'Forêt de Bangr-Wéoogo', 1)
) AS i(place_slug, url, caption, sort_order)
JOIN places p ON p.slug = i.place_slug
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4) ÉTABLISSEMENTS (hôtels, restaurants, gîtes réels)
-- ============================================================================

-- On a besoin d'un utilisateur « admin/system » pour les places liées aux établissements
-- Les places référencées ci-dessous doivent exister (ID trouvé par slug)

-- ── Ouagadougou ──────────────────────────────────────────────────────
INSERT INTO places (name, slug, type, description, latitude, longitude, region_id, rating, tags)
VALUES
('Hôtel Splendide', 'hotel-splendide-ouaga', 'hotel',
 'Hôtel 4 étoiles au cœur de Ouagadougou. Piscine, restaurant gastronomique, salles de conférence. Vue sur le palais présidentiel.',
 12.3700, -1.5250, 3, 4.4, '{"hôtel","luxe","piscine","restaurant"}'),

('Hôtel Relax', 'hotel-relax-ouaga', 'hotel',
 'Hôtel de charme dans le quartier de la Patte d''Oie. Chambres climatisées, jardin tropical, petit-déjeuner burkinabè inclus.',
 12.3580, -1.5400, 3, 4.1, '{"hôtel","charme","jardin"}'),

('Auberge le Karitier', 'auberge-karitier-ouaga', 'hotel',
 'Auberge familiale et écologique au bord du barrage. Bungalows en matériaux locaux, cuisine traditionnelle, ambiance paisible.',
 12.3900, -1.5100, 3, 4.3, '{"auberge","écologique","traditionnel"}'),

-- ── Bobo-Dioulasso ──────────────────────────────────────────────────
('Hôtel L''Entente', 'hotel-entente-bobo', 'hotel',
 'Le plus ancien hôtel de Bobo-Dioulasso, rénové avec goût. Architecture coloniale, cour intérieure, restaurant réputé pour sa cuisine locale.',
 11.1790, -4.2960, 9, 4.2, '{"hôtel","colonial","restaurant","histoire"}'),

('Campement de Banfora', 'campement-banfora', 'hotel',
 'Hébergement rustique à proximité des Cascades de Karfiguéla. Cases en banco, feux de camp, excursions guidées vers les Pics de Sindou.',
 10.6330, -4.7600, 2, 4.5, '{"camp","nature","cascades","rustique"}'),

-- ── Nazinga ──────────────────────────────────────────────────────────
('Ranch Lodge Nazinga', 'lodge-nazinga', 'hotel',
 'Lodge au cœur du Ranch de Gibier de Nazinga. Chambres avec vue sur la savane, safaris guidés à l''aube, piscine naturelle.',
 11.1520, -1.6480, 7, 4.6, '{"lodge","safari","nature","piscine"}')

ON CONFLICT (slug) DO NOTHING;

-- Maintenant créer les établissements liés
INSERT INTO establishments (place_id, type, price_min_fcfa, price_max_fcfa, stars, amenities, phone_number, email, website, is_available)
SELECT p.id, e.type, e.price_min, e.price_max, e.stars, e.amenities::text[], e.phone, e.email, e.website, TRUE
FROM (VALUES
  ('hotel-splendide-ouaga',  'hotel', 45000, 120000, 4, '{"wifi","piscine","climatisation","restaurant","parking"}', '+226 25 30 60 60', 'info@splendide-ouaga.bf', 'https://splendide-ouaga.bf'),
  ('hotel-relax-ouaga',      'hotel', 25000, 55000,  3, '{"wifi","climatisation","petit-déjeuner","jardin"}', '+226 25 36 20 20', 'contact@relax-ouaga.bf', NULL),
  ('auberge-karitier-ouaga', 'gite',  15000, 35000,  3, '{"wifi","ventilateur","cuisine","terrasse"}', '+226 70 20 10 10', 'karitier@gmail.com', NULL),
  ('hotel-entente-bobo',     'hotel', 30000, 75000,  3, '{"wifi","climatisation","restaurant","bar","parking"}', '+226 20 97 11 11', 'entente@bobo.bf', 'https://hotel-entente-bobo.bf'),
  ('campement-banfora',      'camp',  10000, 25000,  2, '{"excursions","feu de camp","restauration","guide"}', '+226 76 50 30 30', 'campement.banfora@gmail.com', NULL),
  ('lodge-nazinga',          'gite',  35000, 85000,  4, '{"safari","piscine","restaurant","guide","jumelles"}', '+226 70 60 40 40', 'lodge@nazinga.bf', 'https://nazinga-lodge.bf')
) AS e(place_slug, type, price_min, price_max, stars, amenities, phone, email, website)
JOIN places p ON p.slug = e.place_slug
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5) ARTICLES WIKI — articles supplémentaires richement documentés
-- ============================================================================
INSERT INTO wiki_articles (slug, title, subtitle, category, lead_text, body_html, infobox_data, tags, is_approved) VALUES

-- Thomas Sankara
('thomas-sankara',
 'Thomas Sankara',
 'Le « Che Guevara africain » (1949-1987)',
 'Histoire',
 'Thomas Isidore Noël Sankara (21 décembre 1949 — 15 octobre 1987) fut le président du Burkina Faso de 1983 à 1987. Figure emblématique du panafricanisme, il mena une révolution sociale profonde qui transforma le pays.',
 '<h2>Jeunesse et formation</h2>
<p>Né à Yako d''un père Peul et d''une mère Mossi, Thomas Sankara est élevé dans une famille modeste de treize enfants. Brillant élève, il intègre le Prytanée militaire de Kadiogo puis l''Académie militaire d''Antsirabé à Madagascar, où il est marqué par les courants révolutionnaires de l''époque.</p>

<h2>Prise du pouvoir</h2>
<p>Le 4 août 1983, Sankara accède au pouvoir par un coup d''État populaire. Secrétaire d''État à l''Information puis Premier ministre, il est déjà une figure charismatique avant sa prise de pouvoir.</p>

<h2>La Révolution (1983-1987)</h2>
<p>Sankara rebaptise la Haute-Volta « Burkina Faso » — « Pays des Hommes Intègres » en mooré et dioula — le 4 août 1984. Ses réformes :</p>
<ul>
<li><strong>Campagne de vaccination</strong> : 2,5 millions d''enfants vaccinés en une semaine</li>
<li><strong>Alphabétisation</strong> : taux de scolarisation passé de 6% à 22%</li>
<li><strong>Droits des femmes</strong> : interdiction de l''excision et des mariages forcés</li>
<li><strong>Reforestation</strong> : 10 millions d''arbres plantés pour stopper la désertification</li>
<li><strong>Auto-suffisance</strong> : production de blé doublée en 3 ans</li>
</ul>

<h2>Discours à l''ONU</h2>
<p>Le 4 octobre 1984, Sankara prononce un discours historique à l''Assemblée générale des Nations Unies, dénonçant la dette néocoloniale et l''impérialisme. Ce discours reste l''un des plus cités de l''histoire de l''ONU.</p>

<h2>Assassinat</h2>
<p>Le 15 octobre 1987, Thomas Sankara est assassiné lors d''un coup d''État mené par Blaise Compaoré, son ancien frère d''armes. Son héritage continue d''inspirer les mouvements sociaux en Afrique et dans le monde.</p>',
 '{"Naissance": "21 décembre 1949, Yako", "Décès": "15 octobre 1987, Ouagadougou", "Fonction": "Président (1983-1987)", "Parti": "CNR", "Devise": "La patrie ou la mort, nous vaincrons", "Sépulture": "Cimetière de Dagnoën"}',
 '{"Sankara","révolution","histoire","président","panafricanisme"}',
 TRUE),

-- La Cuisine Burkinabè
('cuisine-burkinabe',
 'Cuisine Burkinabè',
 'Saveurs et traditions culinaires du Faso',
 'Culture & Arts',
 'La cuisine burkinabè est riche en saveurs, basée sur les céréales (mil, sorgho, maïs, riz), les sauces à base de légumes, d''arachide ou de karité, et les viandes grillées. Chaque ethnie apporte ses spécialités uniques.',
 '<h2>Plats emblématiques</h2>
<ul>
<li><strong>Tô</strong> : Pâte de mil ou de maïs, plat de base accompagné de sauce gombo, sauce arachide ou sauce feuilles. Le tô est au Burkina ce que le pain est à la France.</li>
<li><strong>Riz gras</strong> : Riz cuit dans une sauce tomate avec viande ou poisson, légumes et épices. Plat festif incontournable.</li>
<li><strong>Poulet bicyclette</strong> : Poulet fermier grillé à la braise, servi avec des frites d''igname ou de l''attiéké. Son nom vient du mode de transport des éleveurs.</li>
<li><strong>Ragout d''igname</strong> : Igname pilée servie avec une sauce claire à la viande de bœuf.</li>
<li><strong>Babenda</strong> : Plat mossi à base de riz, feuilles de baobab et soumbala (condiment fermenté).</li>
</ul>

<h2>Boissons</h2>
<ul>
<li><strong>Dolo</strong> : Bière de mil traditionnelle, brassée par les « dolotières » (femmes brasseuses). Centre de la vie sociale villageoise.</li>
<li><strong>Zoom-koom</strong> : Boisson rafraîchissante à base de farine de mil, sucre et eau. Parfumée au gingembre ou au tamarin.</li>
<li><strong>Bissap</strong> : Infusion de fleurs d''hibiscus, servie fraîche. Rouge rubis, acidulée et désaltérante.</li>
</ul>

<h2>Le Beurre de Karité</h2>
<p>Le karité est l''arbre sacré du Burkina. Son beurre est utilisé en cuisine (friture, sauces), en cosmétique et en médecine traditionnelle. La récolte et la transformation sont un savoir-faire exclusivement féminin.</p>',
 '{"Céréales de base": "Mil, sorgho, maïs, riz", "Boisson nationale": "Dolo (bière de mil)", "Condiment clé": "Soumbala", "Fruit emblématique": "Karité"}',
 '{"cuisine","gastronomie","tô","dolo","karité","culture"}',
 TRUE),

-- Les Masques du Burkina
('masques-burkina',
 'Les Masques du Burkina Faso',
 'Tradition vivante de la mascarade rituelle',
 'Culture & Arts',
 'Le Burkina Faso possède l''une des plus riches traditions de masques d''Afrique. Les masques sont portés lors de cérémonies funéraires, d''initiation, de récolte et de purification. Chaque ethnie — Bwa, Mossi, Bobo, Nuna, Lobi — a développé un style unique.',
 '<h2>Les masques Bwa (Nwantantay)</h2>
<p>Les masques planches des Bwa sont parmi les plus spectaculaires d''Afrique. Pouvant atteindre 2 à 3 mètres de hauteur, ils sont couverts de motifs géométriques peints en noir, blanc et rouge. Chaque motif (damier, croissant, losange) a une signification morale ou spirituelle. Les masques représentent le monde naturel et surnaturel.</p>

<h2>Les masques Bobo</h2>
<p>Le masque de buffle Bobo (« Do ») est associé au dieu créateur Wuro. Porté lors des rituels agraires, il assure la fertilité des champs. Les masques de fibres végétales, portés par les initiés, symbolisent les esprits de la brousse.</p>

<h2>Les masques Mossi</h2>
<p>Le masque Wan-Pelegha (masque rouge) est utilisé lors des funérailles des chefs Mossi. Les masques antilopes (Wango) représentent les esprits protecteurs du clan et sont sortis lors des grandes cérémonies de la chefferie.</p>

<h2>Rôle social</h2>
<p>Les masques ne sont pas de simples objets d''art. Ils incarnent les ancêtres, les esprits de la nature et les valeurs morales. Leur sortie est un événement collectif qui renforce la cohésion sociale et transmet les savoirs aux jeunes générations.</p>

<h2>Conservation</h2>
<p>Le Musée National du Burkina Faso et le Musée de la Musique de Ouagadougou abritent d''importantes collections. De nombreux masques ont été restitués par des musées européens ces dernières années.</p>',
 '{"Principales ethnies": "Bwa, Bobo, Mossi, Nuna, Lobi", "Matériaux": "Bois, fibres, pigments", "Occasions": "Funérailles, initiation, récoltes", "Musées": "Musée National, Musée de Manega"}',
 '{"masques","Bwa","Bobo","Mossi","rituel","art","culture"}',
 TRUE),

-- Langues du Burkina
('langues-burkina',
 'Langues du Burkina Faso',
 'Mosaïque linguistique de plus de 60 langues',
 'Peuples & Langues',
 'Le Burkina Faso compte plus de 60 langues parlées sur son territoire. Le français est la langue officielle, héritée de la colonisation, mais trois langues nationales sont reconnues : le mooré, le dioula (jula) et le fulfuldé.',
 '<h2>Langue officielle</h2>
<p>Le <strong>français</strong> est la langue de l''administration, de l''enseignement et des médias officiels. Cependant, seule une minorité de la population le maîtrise pleinement.</p>

<h2>Langues nationales</h2>
<ul>
<li><strong>Mooré</strong> : Langue des Mossi, parlée par ~50% de la population. Langue véhiculaire du plateau central et des villes. « Burkina » vient du mooré (« hommes d''honneur »).</li>
<li><strong>Dioula (Jula)</strong> : Langue mandé parlée dans l''ouest (Bobo-Dioulasso). Langue du commerce et de l''islam. « Faso » vient du dioula (« pays/patrie »).</li>
<li><strong>Fulfuldé</strong> : Langue des Peuls, parlée dans le nord et l''est. Langue pastorale et poétique, riche d''une littérature orale épique.</li>
</ul>

<h2>Autres langues importantes</h2>
<p>Bissa, Gourmanchéma, Bobo, San, Lobi, Dagara, Nuni, Kasséna, Bwamu... Chaque groupe ethnique a préservé sa langue, véhicule de savoirs ancestraux, de proverbes et de contes.</p>

<h2>Politique linguistique</h2>
<p>Le Burkina Faso mène des programmes d''éducation bilingue (français + langue locale) et de valorisation des langues nationales dans les médias radiophoniques.</p>',
 '{"Langue officielle": "Français", "Langues nationales": "Mooré, Dioula, Fulfuldé", "Nombre de langues": "60+", "Famille dominante": "Niger-Congo"}',
 '{"langues","mooré","dioula","fulfuldé","français","linguistique"}',
 TRUE),

-- Architecture en terre
('architecture-terre',
 'Architecture en Terre du Burkina',
 'L''art de construire avec le banco',
 'Patrimoine',
 'L''architecture en terre crue (banco) est une tradition millénaire au Burkina Faso. Des mosquées soudanaises aux cases peintes Kassena, le banco — mélange d''argile, de paille et d''eau — produit des bâtiments à la fois esthétiques, écologiques et adaptés au climat sahélien.',
 '<h2>Techniques de construction</h2>
<p>La construction en banco utilise des briques moulées à la main, séchées au soleil, puis assemblées avec un mortier de terre. Les murs épais (50 à 80 cm) offrent une excellente isolation thermique : frais en journée, chauds la nuit.</p>

<h2>La Grande Mosquée de Bobo-Dioulasso</h2>
<p>Chef-d''œuvre de l''architecture soudano-sahélienne, cette mosquée en banco hérissée de poutres en bois (torons) a été construite au XIVème siècle. Les torons servent d''échafaudage permanent pour les réparations annuelles.</p>

<h2>Les Cases Peintes Kassena (Tiébélé)</h2>
<p>Les femmes Kassena décorent les murs de terre de motifs géométriques aux couleurs naturelles : noir (graphite), blanc (kaolin), rouge (latérite). Chaque motif raconte une histoire ou protège la maison des mauvais esprits.</p>

<h2>Enjeux contemporains</h2>
<p>L''architecture en terre connaît un regain d''intérêt avec l''architecte burkinabè <strong>Francis Kéré</strong>, lauréat du prix Pritzker 2022 (le « Nobel de l''architecture »). Ses réalisations (école de Gando, Assemblée nationale du Burkina) prouvent que le banco peut être à la fois traditionnel et avant-gardiste.</p>',
 '{"Matériau": "Banco (terre crue)", "Sites majeurs": "Mosquée de Bobo, Tiébélé, Gando", "Architecte célèbre": "Francis Kéré (Pritzker 2022)", "UNESCO": "Ruines de Loropéni"}',
 '{"architecture","terre","banco","Kéré","Tiébélé","Bobo","patrimoine"}',
 TRUE),

-- Peuple Peul
('peuple-peul',
 'Peuple Peul',
 'Les pasteurs nomades du Sahel',
 'Peuples & Langues',
 'Les Peuls (ou Fulbé) sont un peuple de pasteurs semi-nomades présent dans tout le Sahel, du Sénégal au Cameroun. Au Burkina Faso, ils représentent environ 10% de la population et vivent principalement dans les régions du Nord, du Sahel et de l''Est.',
 '<h2>Mode de vie</h2>
<p>La transhumance rythme la vie peule : la migration saisonnière des troupeaux de zébus entre pâturages secs et humides. Le bétail est un marqueur social, un capital et une fierté identitaire. Un Peul est d''abord évalué par la taille de son troupeau.</p>

<h2>Le Pulaaku</h2>
<p>Le <em>Pulaaku</em> est le code moral qui définit l''identité peule : retenue (<em>semteende</em>), courage (<em>ngorgu</em>), patience (<em>munyal</em>) et sagesse (<em>hakkille</em>). Ce code éthique guide les comportements sociaux et les relations interpersonnelles.</p>

<h2>Art et culture</h2>
<p>Les femmes peules sont réputées pour leurs parures : boucles d''oreilles en or torsadé, tatouages faciaux, coiffures élaborées. Le <em>Gerewol</em> est un festival de beauté masculine où les jeunes hommes se maquillent et dansent pour séduire.</p>

<h2>Au Burkina Faso</h2>
<p>Les Peuls du Burkina sont concentrés dans le Sahel (Dori, Djibo), le Yatenga et le Séno. Ils pratiquent un Islam teinté de traditions animistes et jouent un rôle économique central via le commerce de bétail aux marchés de Kaya, Pouytenga et Djibo.</p>',
 '{"Population au Burkina": "~2 millions", "Langue": "Fulfuldé", "Religion": "Islam sunnite", "Mode de vie": "Pasteurs semi-nomades", "Régions": "Sahel, Nord, Est"}',
 '{"Peul","Fulbé","fulfuldé","pastoral","sahel","transhumance"}',
 TRUE)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 6) ÉVÉNEMENTS ATLAS — compléter avec des événements détaillés par ère
-- ============================================================================
INSERT INTO atlas_events (era, year, title, subtitle, description, tags, gradient_css, sort_order) VALUES

-- Ère Mossi (ajouts)
('mossi', 1100,
 'Fondation du Royaume de Ouagadougou',
 'Ouédraogo, premier roi Mossi',
 'Selon la tradition orale, Ouédraogo, fils de la princesse Yennenga et du chasseur Rialé, fonde le premier royaume Mossi. Il établit sa cour à Tenkodogo avant que ses descendants ne fondent les royaumes de Ouagadougou et du Yatenga. Le système politique Mossi — l''un des plus structurés d''Afrique — survit encore aujourd''hui sous forme cérémonielle.',
 '{"Mossi","Ouédraogo","Yennenga","royaume"}',
 'linear-gradient(135deg,#3D1C02 0%,#7C3B1E 50%,#C1272D 100%)', 10),

('mossi', 1328,
 'Razzia Mossi sur Tombouctou',
 'Les cavaliers Mossi défient l''Empire du Mali',
 'En 1328, les cavaliers Mossi lancent un raid audacieux contre Tombouctou, alors sous domination de l''Empire du Mali de Mansa Moussa. Bien que le raid soit repoussé, il démontre la puissance militaire des royaumes Mossi et leur capacité à défier les grands empires sahéliens.',
 '{"Mossi","Tombouctou","Mali","guerre"}',
 'linear-gradient(135deg,#3D1C02 0%,#7C3B1E 50%,#C1272D 100%)', 11),

-- Ère Bobo (ajouts)
('bobo', 1600,
 'Les Royaumes Gourmantché',
 'Fada N''Gourma, carrefour de l''Est',
 'Le peuple Gourmantché fonde le royaume de Nungu (Fada N''Gourma) au XVIème siècle. À la croisée des routes commerciales entre le Niger et le Ghana, ce royaume développe une culture distincte mêlant influences Mossi, Haoussa et locales. Les Gourmantché résisteront farouchement à la colonisation française.',
 '{"Gourmantché","Fada","royaume","commerce"}',
 'linear-gradient(135deg,#2A1200 0%,#006B3C 50%,#D4A017 100%)', 12),

('bobo', 1730,
 'Apogée du Royaume de Kong',
 'L''empire Dioula aux portes du Burkina',
 'Le royaume de Kong (actuelle Côte d''Ivoire), fondé par des marchands Dioula, étend son influence jusqu''à Bobo-Dioulasso. Les réseaux commerciaux Dioula relient les mines d''or de la Volta Noire aux marchés du nord. Bobo-Dioulasso devient un centre islamique et commerçant majeur.',
 '{"Kong","Dioula","commerce","islam"}',
 'linear-gradient(135deg,#2A1200 0%,#006B3C 50%,#D4A017 100%)', 13),

-- Ère Coloniale (ajouts)
('colonial', 1915,
 'Révolte de la Volta-Bani',
 'Soulèvement anti-colonial de 1915-1916',
 'La plus grande révolte anti-coloniale d''Afrique de l''Ouest éclate en novembre 1915. Les peuples Bwa, Marka et Dafing se soulèvent contre le travail forcé et la conscription militaire imposée par la France pendant la Première Guerre mondiale. La répression est sanglante : villages rasés, leaders exécutés. Cette révolte est un moment fondateur de la conscience nationale burkinabè.',
 '{"révolte","Bwa","colonial","résistance","1915"}',
 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', 14),

('colonial', 1947,
 'Reconstitution de la Haute-Volta',
 'Le territoire renaît après 15 ans de démembrement',
 'Après avoir été démantelée et répartie entre le Soudan français, le Niger et la Côte d''Ivoire en 1932 pour faciliter l''exploitation de la main-d''œuvre, la Haute-Volta est reconstituée le 4 septembre 1947 sous la pression des notables Mossi et des élus africains. Le Mogho Naaba Koom joue un rôle clé dans cette restauration.',
 '{"Haute-Volta","colonisation","Mogho Naaba","reconstitution"}',
 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', 15),

-- Ère Indépendance (ajouts)
('independance', 1966,
 'Coup d''État de Lamizana',
 'Première alternance militaire',
 'Le 3 janvier 1966, le général Sangoulé Lamizana renverse Maurice Yaméogo dans un coup d''État pacifique soutenu par la population, excédée par la corruption. Lamizana dirigera le pays pendant 14 ans (1966-1980), alternant entre régimes militaires et civils. C''est sous son pouvoir que le FESPACO est créé en 1969.',
 '{"Lamizana","coup d''État","FESPACO","1966"}',
 'linear-gradient(135deg,#160A00 0%,#C1272D 40%,#006B3C 70%,#D4A017 100%)', 16),

-- Ère Sankara (ajouts)
('sankara', 1987,
 'Assassinat et Rectification',
 'Blaise Compaoré prend le pouvoir (15 octobre 1987)',
 'Le 15 octobre 1987, Thomas Sankara est assassiné avec douze compagnons lors d''un putsch orchestré par Blaise Compaoré. Ce dernier instaure le « Front populaire » et dirige le pays pendant 27 ans (1987-2014). L''insurrection populaire d''octobre 2014 mettra fin à son règne.',
 '{"Compaoré","assassinat","Sankara","1987","rectification"}',
 'linear-gradient(135deg,#3D1C02 0%,#C1272D 35%,#D4A017 65%,#006B3C 100%)', 17),

('sankara', 2014,
 'Insurrection Populaire',
 '30-31 octobre 2014 — La chute de Compaoré',
 'Les 30 et 31 octobre 2014, des centaines de milliers de Burkinabè descendent dans les rues pour empêcher la modification de la Constitution qui aurait permis à Blaise Compaoré de briguer un nouveau mandat. L''Assemblée nationale est prise d''assaut et incendiée. Compaoré fuit en Côte d''Ivoire. La transition démocratique aboutit à l''élection de Roch Marc Christian Kaboré en 2015.',
 '{"insurrection","2014","Compaoré","démocratie","transition"}',
 'linear-gradient(135deg,#3D1C02 0%,#C1272D 35%,#D4A017 65%,#006B3C 100%)', 18)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7) SYMBOLES CULTURELS — compléments
-- ============================================================================
INSERT INTO symbols (name, category, description, sort_order) VALUES
('Le Balafon', 'musique',
 'Xylophone traditionnel en bois de caïlcédrat avec des calebasses en résonateurs. Instrument sacré chez les Sénoufo et les Bobo, inscrit au patrimoine immatériel de l''UNESCO. Le « Balafon sacré de Sosso Bala » est le plus ancien connu.',
 7),
('Le Djembé', 'musique',
 'Tambour en bois recouvert de peau de chèvre. Instrument de communication et de fête, le djembé rythme les cérémonies, les travaux collectifs et les festivités. Chaque rythme porte un nom et un message.',
 8),
('Le Mogho Naaba', 'institution',
 'Le roi des Mossi, résidant à Ouagadougou, préside chaque vendredi la cérémonie du « Naab Yiisgu » (faux départ symbolique). Cette cérémonie rappelle le serment du roi de ne jamais abandonner son peuple. Le Mogho Naaba reste le gardien de la tradition Mossi.',
 9),
('Le Karité', 'nature',
 'L''arbre à karité (Vitellaria paradoxa) est véritablement sacré au Burkina Faso. Son beurre nourrit, soigne et embellit. Seules les femmes sont autorisées à récolter et transformer les noix. Le Burkina est le premier producteur mondial de karité.',
 10),
('Le Faso Dan Fani', 'artisanat',
 'Le « pagne tissé de la patrie » est un tissu en coton filé et tissé à la main selon des techniques ancestrales. Chaque motif de bandes colorées a un nom et une signification. Porté avec fierté, c''est un symbole d''identité nationale promu par Thomas Sankara.',
 11),
('La Parenté à Plaisanterie', 'tradition',
 'La « Rakiré » est un système social de plaisanterie ritualisée entre certains groupes ethniques (ex : Mossi et Samo). Ces échanges de moqueries préviennent les conflits et renforcent la cohésion sociale. C''est un mécanisme de paix inédit en Afrique de l''Ouest.',
 12)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8) ITINÉRAIRES TOURISTIQUES PUBLICS
-- ============================================================================

-- Créer un utilisateur système pour les itinéraires par défaut
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
VALUES ('system@faso-atlas.bf', '$2a$10$invalid-hash-system-user-do-not-login', 'Faso', 'Atlas', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Itinéraire 1 : Grand Tour des Cascades (3 jours)
INSERT INTO itineraries (user_id, title, description, duration_days, difficulty, budget_fcfa, is_public)
SELECT u.id,
       'Grand Tour des Cascades',
       'Circuit de 3 jours au cœur de la région des Cascades. Découvrez les merveilles naturelles de Banfora : cascades de Karfiguéla, Pics de Sindou, Lac Tengrela et Dôme de Fabedougou.',
       3, 'modéré', 150000, TRUE
FROM users u WHERE u.email = 'system@faso-atlas.bf'
ON CONFLICT DO NOTHING;

-- Stops pour le Grand Tour des Cascades
INSERT INTO itinerary_stops (itinerary_id, place_id, "order", day_number, duration, notes)
SELECT it.id, p.id, s."order", s.day_number, s.duration, s.notes
FROM (VALUES
  ('cascades-banfora',   1, 1, '3 heures',  'Arrivée aux cascades de Karfiguéla. Baignade possible en saison sèche.'),
  ('dome-fabedougou',    2, 1, '2 heures',  'Route vers le Dôme. Coucher de soleil spectaculaire sur les roches sphériques.'),
  ('lac-tengrela',       3, 2, '3 heures',  'Pirogue sur le lac aux lotus. Observation des hippopotames au petit matin.'),
  ('pics-sindou',        4, 2, '3 heures',  'Randonnée parmi les aiguilles de grès. Guide Sénoufo recommandé.'),
  ('mare-hippopotames-bala', 5, 3, '4 heures', 'Excursion à la Mare aux Hippopotames (réserve UNESCO).')
) AS s(place_slug, "order", day_number, duration, notes)
CROSS JOIN (SELECT id FROM itineraries WHERE title = 'Grand Tour des Cascades' LIMIT 1) it
JOIN places p ON p.slug = s.place_slug
ON CONFLICT DO NOTHING;

-- Itinéraire 2 : Ouagadougou Culturel (2 jours)
INSERT INTO itineraries (user_id, title, description, duration_days, difficulty, budget_fcfa, is_public)
SELECT u.id,
       'Ouagadougou — Capitale Culturelle',
       'Deux jours pour explorer la capitale du Burkina Faso : musées, marchés, monuments et artisanat. Un concentré de culture burkinabè accessible à pied.',
       2, 'facile', 75000, TRUE
FROM users u WHERE u.email = 'system@faso-atlas.bf'
ON CONFLICT DO NOTHING;

INSERT INTO itinerary_stops (itinerary_id, place_id, "order", day_number, duration, notes)
SELECT it.id, p.id, s."order", s.day_number, s.duration, s.notes
FROM (VALUES
  ('musee-national',           1, 1, '2 heures',  'Collections permanentes : archéologie, masques, instruments de musique.'),
  ('grand-marche-ouagadougou', 2, 1, '2 heures',  'Le Grand Marché. Négocier les tissus Faso Dan Fani et le bogolan.'),
  ('village-artisanal-ouaga',  3, 1, '2 heures',  'Observer les bronziers travailler avec la technique de la cire perdue.'),
  ('monument-heros-nationaux', 4, 2, '1 heure',   'Visite du mémorial Thomas Sankara. Vue panoramique sur la ville.'),
  ('parc-bangr-weogo',         5, 2, '3 heures',  'Balade dans la forêt sacrée. Petit zoo et musée de la nature.'),
  ('cathedrale-ouagadougou',   6, 2, '30 minutes', 'Pause à la cathédrale en latérite, cœur historique de la ville.')
) AS s(place_slug, "order", day_number, duration, notes)
CROSS JOIN (SELECT id FROM itineraries WHERE title = 'Ouagadougou — Capitale Culturelle' LIMIT 1) it
JOIN places p ON p.slug = s.place_slug
ON CONFLICT DO NOTHING;

-- Itinéraire 3 : Safari & Nature (5 jours)
INSERT INTO itineraries (user_id, title, description, duration_days, difficulty, budget_fcfa, is_public)
SELECT u.id,
       'Safari Burkina — De Nazinga au Parc W',
       'Circuit nature de 5 jours à travers les plus grandes réserves animalières du Burkina Faso. Éléphants, lions, hippos et plus de 300 espèces d''oiseaux.',
       5, 'difficile', 350000, TRUE
FROM users u WHERE u.email = 'system@faso-atlas.bf'
ON CONFLICT DO NOTHING;

INSERT INTO itinerary_stops (itinerary_id, place_id, "order", day_number, duration, notes)
SELECT it.id, p.id, s."order", s.day_number, s.duration, s.notes
FROM (VALUES
  ('ranch-nazinga',    1, 1, 'Journée',   'Safari matinal (5h-9h). Éléphants presque garantis. Lodge le soir.'),
  ('ranch-nazinga',    2, 2, 'Demi-journée', 'Deuxième safari. Points d''eau où se rassemblent buffles et antilopes.'),
  ('reserve-arly',     3, 3, 'Journée',   'Route vers la Réserve d''Arly. Safari guidé en 4x4.'),
  ('parc-w-niger',     4, 4, 'Journée',   'Parc W — secteur Burkina. Possibilité d''observer des lions.'),
  ('chutes-tapoa',     5, 5, 'Demi-journée', 'Chutes de la Tapoa. Retour en fin de journée.')
) AS s(place_slug, "order", day_number, duration, notes)
CROSS JOIN (SELECT id FROM itineraries WHERE title = 'Safari Burkina — De Nazinga au Parc W' LIMIT 1) it
JOIN places p ON p.slug = s.place_slug
ON CONFLICT DO NOTHING;

-- Itinéraire 4 : Route de l'Art & Patrimoine (4 jours)
INSERT INTO itineraries (user_id, title, description, duration_days, difficulty, budget_fcfa, is_public)
SELECT u.id,
       'Route de l''Art & du Patrimoine',
       'Circuit de 4 jours sur les traces de l''art burkinabè : sculptures de Laongo, cours peintes de Tiébélé, masques de Bobo et ruines de Loropéni (UNESCO).',
       4, 'modéré', 200000, TRUE
FROM users u WHERE u.email = 'system@faso-atlas.bf'
ON CONFLICT DO NOTHING;

INSERT INTO itinerary_stops (itinerary_id, place_id, "order", day_number, duration, notes)
SELECT it.id, p.id, s."order", s.day_number, s.duration, s.notes
FROM (VALUES
  ('sculptures-laongo',       1, 1, '3 heures',  'Sculptures monumentales en granit. Emporter de l''eau et un chapeau.'),
  ('tiebele-cours-royales',   2, 1, '3 heures',  'Cours Royales Peintes. Les femmes Kassena guident elles-mêmes la visite.'),
  ('grande-mosquee-bobo',     3, 2, 'Journée',   'Route vers Bobo. Visite de la Grande Mosquée puis de la vieille ville.'),
  ('vieille-ville-bobo',      4, 3, 'Demi-journée', 'Quartier Kibidwé, forgerons, mare aux poissons sacrés.'),
  ('ruines-loropeni',         5, 4, 'Journée',   'Route vers Loropéni. Site UNESCO — prévoir guides sur place.')
) AS s(place_slug, "order", day_number, duration, notes)
CROSS JOIN (SELECT id FROM itineraries WHERE title = 'Route de l''Art & du Patrimoine' LIMIT 1) it
JOIN places p ON p.slug = s.place_slug
ON CONFLICT DO NOTHING;
