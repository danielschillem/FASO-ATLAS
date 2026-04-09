-- ============================================================================
-- 015_seed_demo_data.sql
-- Données démo complémentaires : plus de lieux, établissements, reviews,
-- itinéraires et annonces publicitaires pour une expérience complète.
-- ============================================================================

-- ============================================================================
-- 1) LIEUX SUPPLÉMENTAIRES — couvrir toutes les 13 régions
-- ============================================================================
INSERT INTO places (name, slug, type, description, latitude, longitude, region_id, rating, tags, is_active) VALUES

-- ── Centre-Nord — Kaya & environs ────────────────────────────────────
('Forêt Classée de Dem', 'foret-dem', 'nature',
 'Forêt protégée à 15 km de Kaya. Écosystème de savane arbustive préservé, peuplé de singes, d''antilopes et de plus de 150 espèces d''oiseaux. Point de départ de randonnées pédestres.',
 13.1500, -1.0200, 5, 4.1, '{"forêt","oiseaux","randonnée","nature"}', TRUE),

('Mosquée du Vendredi de Kaya', 'mosquee-kaya', 'site',
 'Mosquée de style soudanais construite au XIXe siècle. Architecture en banco ornée de contreforts coniques. Lieu de culte actif, visites autorisées hors prières.',
 13.0920, -1.0830, 5, 4.0, '{"mosquée","banco","islam","architecture"}', TRUE),

-- ── Centre-Est — Tenkodogo ───────────────────────────────────────────
('Palais Royal de Tenkodogo', 'palais-tenkodogo', 'site',
 'Résidence du Tenkodogo Naaba, chef du plus ancien royaume Mossi fondé par Ouédraogo. Cérémonies traditionnelles chaque vendredi matin.',
 11.7800, -0.3700, 4, 4.3, '{"royauté","Mossi","histoire","tradition"}', TRUE),

('Grottes de Yobiri', 'grottes-yobiri', 'nature',
 'Grottes naturelles ornées de peintures rupestres millénaires. Abris sous roche utilisés par les populations pré-historiques du plateau Mossi.',
 11.6500, -0.5000, 4, 4.2, '{"grottes","rupestre","préhistoire","nature"}', TRUE),

-- ── Centre-Sud — Manga & Pô ─────────────────────────────────────────
('Réserve de Pô-Nazinga', 'reserve-po-nazinga', 'nature',
 'Zone tampon entre le Ranch de Nazinga et la ville de Pô. Savane arborée traversée par des pistes 4x4. Éléphants, babouins et phacochères en abondance.',
 11.2000, -1.5500, 7, 4.4, '{"safari","éléphants","savane","nature"}', TRUE),

-- ── Centre-Ouest — Koudougou ─────────────────────────────────────────
('Lac de Tenado', 'lac-tenado', 'nature',
 'Lac artificiel près de Ténado à 30 km de Koudougou. Pêche artisanale, oiseaux migrateurs et couchers de soleil spectaculaires sur l''eau.',
 12.1800, -2.5800, 6, 3.9, '{"lac","pêche","oiseaux","nature"}', TRUE),

-- ── Boucle du Mouhoun ────────────────────────────────────────────────
('Tombes Mystérieuses de Pobé-Mengao', 'tombes-pobe-mengao', 'site',
 'Site archéologique énigmatique : centaines de tumuli de pierre organisés en alignements, dont l''origine et la fonction restent débattues par les archéologues.',
 13.6000, -2.9000, 1, 4.1, '{"archéologie","tumuli","mystère","histoire"}', TRUE),

-- ── Sud-Ouest — Gaoua & environs ─────────────────────────────────────
('Ruines de Loropéni', 'ruines-loropeni-visite', 'site',
 'Inscrites au patrimoine mondial UNESCO (2009). Murailles de pierre de 6 mètres de haut, vestiges d''un ancien centre de commerce de l''or construit entre le XIe et le XVIIe siècle. Site le mieux préservé d''Afrique de l''Ouest.',
 10.2500, -3.5833, 13, 4.9, '{"UNESCO","archéologie","or","histoire","patrimoine"}', TRUE),

('Village Lobi de Kampti', 'village-lobi-kampti', 'culture',
 'Village traditionnel Lobi avec ses sukala (habitations fortifiées en terre). Architecture défensive unique : chaque maison est un petit fort avec toit-terrasse et accès par échelle amovible.',
 10.1300, -3.4600, 13, 4.3, '{"Lobi","sukala","terre","architecture","culture"}', TRUE),

-- ── Sahel — Dori & Gorom-Gorom ───────────────────────────────────────
('Marché de Gorom-Gorom', 'marche-gorom-gorom', 'culture',
 'Le plus célèbre marché du Sahel burkinabè, chaque jeudi. Rendez-vous des Touaregs, Peuls et Songhay. Bétail, artisanat en cuir et en argent, épices, sel gemme du désert.',
 14.4400, -0.2350, 12, 4.5, '{"marché","Touareg","Peul","sahel","commerce","culture"}', TRUE),

('Campement Touareg de l''Oudalan', 'campement-touareg-oudalan', 'culture',
 'Immersion dans la vie nomade touareg. Nuits sous tente, thé à la menthe, chameaux, randonnée dans les dunes. Expérience authentique dans le Sahel profond.',
 14.5000, -0.1000, 12, 4.4, '{"Touareg","désert","nomade","immersion","culture"}', TRUE),

-- ── Est — Diapaga & Pama ─────────────────────────────────────────────
('Parc National de Pama', 'parc-pama', 'nature',
 'Réserve de faune jouxtant les parcs W et d''Arly. Dernière population viable de guépards d''Afrique de l''Ouest. Éléphants, hippos et grandes antilopes.',
 11.3000, 0.9500, 8, 4.5, '{"guépard","éléphants","safari","faune","nature"}', TRUE),

-- ── Nord — Ouahigouya ────────────────────────────────────────────────
('Mare aux Caïmans de Sabcé', 'mare-caimans-sabce', 'nature',
 'Mare sacrée où les habitants cohabitent pacifiquement avec des caïmans. Les animaux sont nourris par les villageois et considérés comme protecteurs. Visites guidées par le chef de village.',
 13.2300, -1.5900, 10, 4.2, '{"sacré","caïmans","tradition","nature"}', TRUE),

-- ── Plateau-Central ──────────────────────────────────────────────────
('Ziniaré — Ville Natale de la Princesse Yennenga', 'ziniare-yennenga', 'site',
 'Ziniaré est traditionnellement considérée comme le fief de la princesse guerrière Yennenga, ancêtre mythique des Mossi. Le palais de Ziniaré abrite un petit musée consacré à la légende.',
 12.5833, -1.3000, 11, 4.1, '{"Yennenga","Mossi","légende","histoire"}', TRUE),

-- ── Hauts-Bassins — compléments ──────────────────────────────────────
('Guinguettes du Houet', 'guinguettes-houet', 'culture',
 'Bars en plein air à Bobo-Dioulasso où l''on déguste le chapalo (bière de mil rouge) et le bangui (vin de palme) tout en écoutant du balafon live. Ambiance festive garantie.',
 11.1810, -4.2900, 9, 4.3, '{"bar","chapalo","balafon","musique","culture"}', TRUE),

-- ── Cascades — compléments ───────────────────────────────────────────
('Pont de Liane de Boromo', 'pont-liane-boromo', 'nature',
 'Pont suspendu traditionnel en lianes tressées enjambant la rivière Mouhoun. Construction ancestrale renouvelée chaque saison sèche par les villageois. Traversée aventureuse.',
 11.7500, -2.9300, 2, 4.2, '{"pont","liane","rivière","aventure","nature"}', TRUE)

ON CONFLICT (slug) DO NOTHING;

-- Images pour les nouveaux lieux
INSERT INTO place_images (place_id, url, caption, sort_order)
SELECT p.id, i.url, i.caption, i.sort_order
FROM (VALUES
  ('marche-gorom-gorom', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800', 'Marché de Gorom-Gorom', 1),
  ('parc-pama', 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', 'Faune du Parc de Pama', 1),
  ('reserve-po-nazinga', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 'Éléphants dans la réserve', 1),
  ('village-lobi-kampti', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Sukala Lobi à Kampti', 1),
  ('guinguettes-houet', 'https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?w=800', 'Musique et chapalo à Bobo', 1),
  ('grottes-yobiri', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'Grottes de Yobiri', 1),
  ('pont-liane-boromo', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', 'Pont de liane sur le Mouhoun', 1)
) AS i(place_slug, url, caption, sort_order)
JOIN places p ON p.slug = i.place_slug
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 2) ÉTABLISSEMENTS SUPPLÉMENTAIRES (8 nouveaux)
-- ============================================================================

-- D'abord créer les places associées
INSERT INTO places (name, slug, type, description, latitude, longitude, region_id, rating, tags, is_active) VALUES
('Hôtel Ran', 'hotel-ran-ouaga', 'hotel',
 'Hôtel moderne dans le quartier de Koulouba. Chambres avec balcons, piscine sur le toit, restaurant panoramique en terrasse. Wi-Fi haut débit.',
 12.3650, -1.5150, 3, 4.5, '{"hôtel","piscine","moderne","restaurant"}', TRUE),

('Hôtel Dafra', 'hotel-dafra-bobo', 'hotel',
 'Hôtel 3 étoiles au bord du marigot Houet. Jardin tropical luxuriant, restaurant avec cuisine Sénoufo contemporaine.',
 11.1720, -4.3000, 9, 4.3, '{"hôtel","jardin","cuisine","Sénoufo"}', TRUE),

('Restaurant Le Gondwana', 'restaurant-gondwana', 'hotel',
 'Restaurant gastronomique fusionnant cuisine burkinabè et européenne. Terrasse ombragée, carte des vins, menu dégustation « Saveurs du Faso ».',
 12.3700, -1.5300, 3, 4.6, '{"restaurant","gastronomie","fusion","terrasse"}', TRUE),

('Auberge de Nazinga', 'auberge-nazinga', 'hotel',
 'Hébergement modeste à l''entrée du Ranch de Nazinga. Chambres simples, restauration locale, base idéale pour les safaris à petit budget.',
 11.1600, -1.6400, 7, 3.8, '{"auberge","safari","économique","nature"}', TRUE),

('Campement Sindou', 'campement-sindou', 'hotel',
 'Campement au pied des Pics de Sindou. Tentes aménagées avec vue sur les aiguilles de grès. Repas traditionnels Sénoufo préparés sur place.',
 10.7300, -5.1600, 2, 4.4, '{"camp","Sindou","vue","nature","Sénoufo"}', TRUE),

('Lodge du Sahel', 'lodge-sahel-dori', 'hotel',
 'Lodge écologique à Dori. Architecture en terre climatisée naturellement. Excursions en chameau, soirées astronomie dans le désert.',
 14.0350, -0.0300, 12, 4.2, '{"lodge","sahel","écologique","chameau"}', TRUE),

('Maison d''Hôtes Tiébélé', 'maison-hotes-tiebele', 'hotel',
 'Maison d''hôtes tenue par une famille Kassena. Chambres décorées de fresques traditionnelles. Cuisine maison (tô, riz gras, ragoût). Visites guidées des cours royales incluses.',
 11.1050, -0.9800, 4, 4.5, '{"gîte","Kassena","fresques","authentique"}', TRUE),

('Restaurant Eau Vive', 'restaurant-eau-vive-ouaga', 'hotel',
 'Institution de Ouagadougou depuis 1968. Cuisine burkinabè authentique servie par des religieuses. Terrasse sous les manguiers. L''adresse préférée des expatriés.',
 12.3680, -1.5240, 3, 4.4, '{"restaurant","authentique","terrasse","institution"}', TRUE)

ON CONFLICT (slug) DO NOTHING;

INSERT INTO establishments (place_id, type, price_min_fcfa, price_max_fcfa, stars, amenities, phone_number, email, website, is_available)
SELECT p.id, e.type, e.price_min, e.price_max, e.stars, e.amenities::text[], e.phone, e.email, e.website, TRUE
FROM (VALUES
  ('hotel-ran-ouaga',             'hotel',      55000, 150000, 4, '{"wifi","piscine","climatisation","restaurant","parking","gym"}', '+226 25 31 11 11', 'reservations@hotelran.bf', 'https://hotelran.bf'),
  ('hotel-dafra-bobo',            'hotel',      28000, 65000,  3, '{"wifi","climatisation","restaurant","jardin","parking"}', '+226 20 98 22 22', 'info@hoteldafra.bf', NULL),
  ('restaurant-gondwana',         'restaurant', 8000,  25000,  4, '{"wifi","terrasse","climatisation","bar","parking"}', '+226 25 33 44 44', 'gondwana@ouaga.bf', NULL),
  ('auberge-nazinga',             'gite',       12000, 28000,  2, '{"ventilateur","restauration","guide","parking"}', '+226 70 55 66 77', 'auberge.nazinga@gmail.com', NULL),
  ('campement-sindou',            'camp',       15000, 35000,  3, '{"tente","restauration","excursions","guide","feu de camp"}', '+226 76 88 99 00', 'campement.sindou@gmail.com', NULL),
  ('lodge-sahel-dori',            'gite',       25000, 60000,  3, '{"wifi","ventilateur","restaurant","excursions","astronomie"}', '+226 70 12 34 56', 'lodge.sahel@dori.bf', 'https://lodge-sahel-dori.bf'),
  ('maison-hotes-tiebele',        'gite',       18000, 40000,  3, '{"petit-déjeuner","visite guidée","terrasse","artisanat"}', '+226 70 44 55 66', 'tiebele.guesthouse@gmail.com', NULL),
  ('restaurant-eau-vive-ouaga',   'restaurant', 5000,  18000,  3, '{"terrasse","climatisation","parking","wifi"}', '+226 25 30 63 63', 'eauvive@ouaga.bf', NULL)
) AS e(place_slug, type, price_min, price_max, stars, amenities, phone, email, website)
JOIN places p ON p.slug = e.place_slug
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 3) REVIEWS DÉMO (variées, réalistes, couvrant plusieurs lieux)
-- ============================================================================

-- Créer des utilisateurs démo
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) VALUES
('aminata.ouedraogo@demo.bf', '$2a$10$demo-hash-do-not-use-1', 'Aminata', 'Ouédraogo', 'tourist', TRUE),
('ibrahim.traore@demo.bf', '$2a$10$demo-hash-do-not-use-2', 'Ibrahim', 'Traoré', 'tourist', TRUE),
('fatou.diallo@demo.bf', '$2a$10$demo-hash-do-not-use-3', 'Fatou', 'Diallo', 'tourist', TRUE),
('adama.sawadogo@demo.bf', '$2a$10$demo-hash-do-not-use-4', 'Adama', 'Sawadogo', 'tourist', TRUE),
('marie.dupont@demo.bf', '$2a$10$demo-hash-do-not-use-5', 'Marie', 'Dupont', 'tourist', TRUE),
('jean.kabore@demo.bf', '$2a$10$demo-hash-do-not-use-6', 'Jean', 'Kaboré', 'tourist', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Reviews
INSERT INTO reviews (user_id, place_id, rating, comment)
SELECT u.id, p.id, r.rating, r.comment
FROM (VALUES
  -- Cascades de Banfora
  ('aminata.ouedraogo@demo.bf', 'cascades-banfora', 5,
   'Absolument magnifique ! Les cascades sont encore plus belles en saison des pluies. Le chemin d''accès a été aménagé récemment. Prévoir de bonnes chaussures et de l''eau.'),
  ('ibrahim.traore@demo.bf', 'cascades-banfora', 4,
   'Très beau site naturel. Le guide local est indispensable pour comprendre la géologie. Petit bémol : pas de poubelles sur le site, emportez vos déchets.'),

  -- Pics de Sindou
  ('fatou.diallo@demo.bf', 'pics-sindou', 5,
   'Un paysage lunaire incroyable. Les formations rocheuses sont spectaculaires au coucher du soleil. Le guide Sénoufo nous a raconté les légendes de chaque pic.'),
  ('marie.dupont@demo.bf', 'pics-sindou', 5,
   'Mon coup de cœur du séjour au Burkina. Randonnée de 2h accessible à tous. Vue imprenable depuis le sommet. Photos exceptionnelles garanties.'),

  -- Tiébélé
  ('adama.sawadogo@demo.bf', 'tiebele-cours-royales', 5,
   'Les femmes Kassena sont d''incroyables artistes. Chaque motif peint sur les murs a une signification précise. Visite guidée passionnante de 2 heures. Un must.'),
  ('jean.kabore@demo.bf', 'tiebele-cours-royales', 4,
   'Site unique au monde. L''architecture en terre est magnifique. Un peu difficile d''accès en saison des pluies — prévoir un 4x4.'),

  -- Ranch de Nazinga
  ('ibrahim.traore@demo.bf', 'ranch-nazinga', 5,
   'Safari inoubliable. On a vu des éléphants à moins de 30 mètres ! Le lodge est confortable et le guide connaît parfaitement les habitudes des animaux.'),
  ('aminata.ouedraogo@demo.bf', 'ranch-nazinga', 4,
   'Excellente expérience. Lever à 5h pour le safari du matin, ça vaut le coup ! Piscine naturelle agréable l''après-midi. Rapport qualité/prix imbattable.'),

  -- Vieille Ville Bobo
  ('fatou.diallo@demo.bf', 'vieille-ville-bobo', 5,
   'Se perdre dans les ruelles du vieux Bobo est un bonheur. Les forgerons travaillent encore comme il y a des siècles. La mare aux poissons sacrés est fascinante.'),
  ('adama.sawadogo@demo.bf', 'vieille-ville-bobo', 4,
   'Quartier historique authentique. Prendre un guide local pour comprendre l''architecture et les traditions Bobo. Finir par un chapalo dans une guinguette.'),

  -- Grande Mosquée Bobo
  ('jean.kabore@demo.bf', 'grande-mosquee-bobo', 5,
   'Chef-d''œuvre d''architecture en banco. Les torons en bois qui dépassent donnent une silhouette unique. Visites autorisées entre les prières, respect de tenue demandé.'),

  -- Parc W
  ('marie.dupont@demo.bf', 'parc-w-niger', 4,
   'Parc immense et sauvage. Nous avons observé des éléphants, des buffles et un léopard au loin. Prévoir une bonne 4x4 et un guide expérimenté. Assez éloigné.'),
  ('ibrahim.traore@demo.bf', 'parc-w-niger', 5,
   'Le Parc W est le joyau caché du Burkina. La biodiversité est extraordinaire. J''ai passé 3 jours de pur émerveillement. Seul vrai safari d''Afrique de l''Ouest.'),

  -- Laongo
  ('aminata.ouedraogo@demo.bf', 'sculptures-laongo', 4,
   'Galerie en plein air unique en Afrique. Les sculptures monumentales sont impressionnantes. Site un peu dépourvu d''ombre — apporter chapeau et crème solaire.'),
  ('fatou.diallo@demo.bf', 'sculptures-laongo', 4,
   'Art contemporain au milieu de la brousse. Concept original. Certaines œuvres sont vraiment magnifiques. À seulement 35 km de Ouaga, facile d''accès.'),

  -- Lac Tengrela
  ('adama.sawadogo@demo.bf', 'lac-tengrela', 5,
   'Pirogue au milieu des lotus avec des hippos qui bâillent à 20 mètres. Moment magique au lever du soleil. Le piroguier connaît chaque hippopotame par son nom !'),

  -- Monument Héros Nationaux
  ('jean.kabore@demo.bf', 'monument-heros-nationaux', 4,
   'Lieu de mémoire émouvant dédié à Sankara. La vue panoramique depuis la tour vaut le déplacement. Musée bien documenté au rez-de-chaussée.'),

  -- Crocodiles de Sabou
  ('marie.dupont@demo.bf', 'crocodiles-sabou', 5,
   'Expérience surréaliste ! On pose le poulet sur le dos du crocodile et on se fait prendre en photo. Impressionnant comme les villageois vivent en harmonie avec eux.'),
  ('aminata.ouedraogo@demo.bf', 'crocodiles-sabou', 4,
   'Site unique au monde. Les crocodiles sont vraiment dociles. Le gardien explique bien les traditions. Petit droit d''entrée et pourboire pour le guide.'),

  -- Village Artisanal
  ('ibrahim.traore@demo.bf', 'village-artisanal-ouaga', 4,
   'Paradis de l''artisanat. Les bronziers à la cire perdue sont des virtuoses. Négocier est de rigueur mais les prix restent très raisonnables. Prévoir 2 heures minimum.'),

  -- Marché Gorom-Gorom
  ('fatou.diallo@demo.bf', 'marche-gorom-gorom', 5,
   'Le marché du jeudi est une explosion de couleurs et de cultures. Touaregs en indigo, femmes peules parées d''or, chameaux, sel gemme... Dépaysement total.'),

  -- Hotel Splendide review
  ('marie.dupont@demo.bf', 'hotel-splendide-ouaga', 4,
   'Très bon hôtel 4 étoiles. Piscine agréable, chambre spacieuse et propre. Restaurant correct. Staff aimable. Bon rapport qualité/prix pour la catégorie.'),

  -- Lodge Nazinga review
  ('adama.sawadogo@demo.bf', 'lodge-nazinga', 5,
   'Lodge parfait pour le safari. Réveil à 5h, café terrasse face à la savane puis départ en 4x4. Dîner aux étoiles le soir. Personnel aux petits soins des clients.')

) AS r(user_email, place_slug, rating, comment)
JOIN users u ON u.email = r.user_email
JOIN places p ON p.slug = r.place_slug
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 4) ANNONCES PUBLICITAIRES DÉMO
-- ============================================================================
INSERT INTO ads (title, partner_name, placement, image_url, link_url, alt_text, pages, is_active, starts_at, ends_at) VALUES
('Air Burkina — Vols Intérieurs',
 'Air Burkina',
 'banner',
 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600',
 'https://airburkina.bf',
 'Réservez vos vols Ouagadougou ↔ Bobo-Dioulasso à partir de 45 000 FCFA.',
 ARRAY['home'], TRUE, '2026-01-01', '2026-12-31'),

('ONTB — Office National du Tourisme',
 'ONTB',
 'sidebar',
 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
 'https://ontb.bf',
 'Découvrez le Burkina Faso avec l''Office National du Tourisme.',
 ARRAY['home','destinations'], TRUE, '2026-01-01', '2026-12-31'),

('Faso Dan Fani — Boutique en Ligne',
 'Faso Dan Fani',
 'card',
 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600',
 'https://fasodanfani.bf',
 'Achetez du Faso Dan Fani authentique tissé à la main.',
 ARRAY['destinations'], TRUE, '2026-01-01', '2026-12-31'),

('Safari Burkina Tours',
 'Safari Burkina',
 'card',
 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600',
 'https://safari-burkina.bf',
 'Circuits safari 3-7 jours. Nazinga, Arly, Parc W.',
 ARRAY['itineraires'], TRUE, '2026-01-01', '2026-12-31'),

('Coris Bank — Paiements Mobiles',
 'Coris Bank',
 'banner',
 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600',
 'https://corisbank.bf',
 'Payez vos réservations touristiques avec Coris Money.',
 ARRAY['reservation'], TRUE, '2026-01-01', '2026-12-31')

ON CONFLICT DO NOTHING;


-- ============================================================================
-- 5) ITINÉRAIRES SUPPLÉMENTAIRES
-- ============================================================================

-- Itinéraire 5 : Le Sahel Authentique (3 jours)
INSERT INTO itineraries (user_id, title, description, duration_days, difficulty, budget_fcfa, is_public)
SELECT u.id,
       'Le Sahel Authentique',
       'Trois jours d''immersion dans le Sahel burkinabè. Marché touareg de Gorom-Gorom, campements nomades, dunes de l''Oudalan et couchers de soleil à couper le souffle.',
       3, 'difficile', 200000, TRUE
FROM users u WHERE u.email = 'system@faso-atlas.bf'
ON CONFLICT DO NOTHING;

INSERT INTO itinerary_stops (itinerary_id, place_id, stop_order, day_number, duration, notes)
SELECT it.id, p.id, s.stop_order, s.day_number, s.duration, s.notes
FROM (VALUES
  ('marche-gorom-gorom',          1, 1, '4 heures',    'Arriver le jeudi matin pour le marché. Négocier bijoux touaregs en argent.'),
  ('campement-touareg-oudalan',   2, 1, '3 heures',    'Installation au campement. Thé à la menthe et coucher de soleil sur les dunes.'),
  ('dunes-oudalan',               3, 2, 'Journée',     'Randonnée dans les dunes tôt le matin. Rencontres avec les bergers Peuls.'),
  ('mare-oursi',                  4, 3, 'Demi-journée', 'Observation ornithologique à la Mare d''Oursi. Retour vers Dori.')
) AS s(place_slug, stop_order, day_number, duration, notes)
CROSS JOIN (SELECT id FROM itineraries WHERE title = 'Le Sahel Authentique' LIMIT 1) it
JOIN places p ON p.slug = s.place_slug
ON CONFLICT DO NOTHING;

-- Itinéraire 6 : Traditions Lobi & Sud-Ouest (3 jours)
INSERT INTO itineraries (user_id, title, description, duration_days, difficulty, budget_fcfa, is_public)
SELECT u.id,
       'Traditions Lobi & Sud-Ouest',
       'Découverte du peuple Lobi et de l''architecture défensive en terre. Ruines UNESCO de Loropéni, musée du Poni, village Lobi de Kampti et rencontres avec les artisans.',
       3, 'modéré', 180000, TRUE
FROM users u WHERE u.email = 'system@faso-atlas.bf'
ON CONFLICT DO NOTHING;

INSERT INTO itinerary_stops (itinerary_id, place_id, stop_order, day_number, duration, notes)
SELECT it.id, p.id, s.stop_order, s.day_number, s.duration, s.notes
FROM (VALUES
  ('musee-poni',                1, 1, '2 heures',    'Musée ethnographique de Gaoua. Introduction au monde Lobi.'),
  ('tombes-lobi',               2, 1, '2 heures',    'Tombes royales et statuaire funéraire. Guide local obligatoire.'),
  ('village-lobi-kampti',       3, 2, 'Journée',     'Journée dans un village Lobi. Découverte des sukala et de l''artisanat.'),
  ('ruines-loropeni-visite',    4, 3, 'Demi-journée', 'Site UNESCO des ruines de Loropéni. Guide sur place.')
) AS s(place_slug, stop_order, day_number, duration, notes)
CROSS JOIN (SELECT id FROM itineraries WHERE title = 'Traditions Lobi & Sud-Ouest' LIMIT 1) it
JOIN places p ON p.slug = s.place_slug
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 6) RÉSERVATIONS DÉMO
-- ============================================================================
INSERT INTO reservations (user_id, establishment_id, check_in_date, check_out_date, guests_count, total_price_fcfa, status, special_requests)
SELECT u.id, e.id, r.check_in::date, r.check_out::date, r.guests, r.price, r.status::VARCHAR, r.notes
FROM (VALUES
  ('aminata.ouedraogo@demo.bf', 'hotel-splendide-ouaga', '2026-05-10', '2026-05-13', 2, 135000, 'confirmed', 'Chambre avec vue, arrivée tardive vers 22h'),
  ('ibrahim.traore@demo.bf', 'lodge-nazinga', '2026-05-15', '2026-05-18', 1, 105000, 'confirmed', 'Safari matinal 5h chaque jour SVP'),
  ('fatou.diallo@demo.bf', 'campement-banfora', '2026-06-01', '2026-06-03', 3, 50000, 'pending', 'Excursion Pics de Sindou le jour 2'),
  ('marie.dupont@demo.bf', 'hotel-ran-ouaga', '2026-04-20', '2026-04-22', 2, 110000, 'completed', ''),
  ('adama.sawadogo@demo.bf', 'maison-hotes-tiebele', '2026-07-05', '2026-07-07', 4, 80000, 'pending', 'Arrivée en famille avec 2 enfants'),
  ('jean.kabore@demo.bf', 'hotel-dafra-bobo', '2026-04-01', '2026-04-04', 1, 84000, 'completed', 'Cuisine Sénoufo pour le dîner')
) AS r(user_email, estab_slug, check_in, check_out, guests, price, status, notes)
JOIN users u ON u.email = r.user_email
JOIN places p ON p.slug = r.estab_slug
JOIN establishments e ON e.place_id = p.id
ON CONFLICT DO NOTHING;
