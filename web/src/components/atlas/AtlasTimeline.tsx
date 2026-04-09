"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { atlasApi } from "@/lib/api";
import type { AtlasEvent, HistoricalEra } from "@/types/models";
import { clsx } from "clsx";
import {
  Landmark,
  Compass,
  Scale,
  Sun,
  Megaphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─── Era metadata ─── */
interface EraInfo {
  key: HistoricalEra;
  label: string;
  period: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  Icon: LucideIcon;
  summary: string;
}

const ERAS: EraInfo[] = [
  {
    key: "mossi",
    label: "Royaumes Mossi",
    period: "Xe – XVe siècle",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
    Icon: Landmark,
    summary:
      "Les cavaliers du Yatenga fondent l'une des civilisations les plus durables d'Afrique de l'Ouest, organisée autour du Mogho Naaba.",
  },
  {
    key: "bobo",
    label: "Empires de l'Ouest",
    period: "XIVe – XVIIIe siècle",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    Icon: Compass,
    summary:
      "Les Dioula, Bobo et Gourmantché bâtissent des réseaux commerciaux et des royaumes puissants à travers la Boucle du Niger.",
  },
  {
    key: "colonial",
    label: "Ère coloniale",
    period: "1896 – 1960",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
    Icon: Scale,
    summary:
      "De la conquête française à la Haute-Volta, un demi-siècle de résistance, de révoltes et de lutte pour la restitution du territoire.",
  },
  {
    key: "independance",
    label: "Indépendance",
    period: "1960 – 1983",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500",
    Icon: Sun,
    summary:
      "La Haute-Volta accède à la souveraineté. Instabilité politique, coups d'État et quête d'identité nationale.",
  },
  {
    key: "sankara",
    label: "Révolution & Renouveau",
    period: "1983 – Aujourd'hui",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
    Icon: Megaphone,
    summary:
      "De la Révolution de 1983 aux dynamiques de résilience de 2026 : refondations institutionnelles, défis sécuritaires et recompositions économiques.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   BASE ENCYCLOPÉDIQUE — Histoire du Territoire burkinabè (~900 → 2026)
   Couvre: politique · économie · commerce · culture · société · sécurité
   ───────────────────────────────────────────────────────────────────────── */
const REFERENCE_EVENTS: AtlasEvent[] = [
  /* ═══════════════════════  ÈRE 1 : ROYAUMES MOSSI  ═══════════════════════ */
  {
    id: 9001,
    era: "mossi",
    year: 900,
    sortOrder: 10,
    title: "Origines des Mossi",
    subtitle: "Migration des cavaliers Dagomba depuis le nord",
    description:
      "Vers le IXe siècle, une cavalerie issue des populations Dagomba (actuel Ghana) remonte vers le nord. Leur chef Ouédraogo — né de la princesse Yennenga et du chasseur Rialé — fonde à Tenkodogo le premier noyau du futur empire mossi. La légende de Yennenga, fille du roi Nedega qui s'enfuit à cheval pour épouser l'homme qu'elle aime, reste le mythe fondateur de l'identité mossi. Ce récit oral, transmis par les griots, tient lieu d'acte de naissance de la civilisation.",
    tags: ["Yennenga", "Ouédraogo", "origines", "cavaliers", "Dagomba"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9002,
    era: "mossi",
    year: 1050,
    sortOrder: 11,
    title: "Formation des cinq royaumes mossi",
    subtitle: "Ouagadougou · Yatenga · Tenkodogo · Fada N'Gourma · Gurma",
    description:
      "Au XIe siècle se structurent les cinq grands royaumes mossi. Ouagadougou (Mogho Naaba = «Roi du Monde») et Yatenga deviennent les plus puissants. L'organisation sociale repose sur le «Naam» — l'autorité politique héréditaire — et les «Tansoba» (chefs de guerre). La société est stratifiée : Nakomse (nobles), Tengabisi (autochtones gardiens de la terre), Yiyense (artisans-forgerons) et Rimdamba (esclaves). L'économie agraire (mil, sorgho, coton) est complétée par un artisanat local développé.",
    tags: ["Naam", "royaumes", "Mogho Naaba", "institutions", "société"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9003,
    era: "mossi",
    year: 1100,
    sortOrder: 12,
    title: "Le système politique & juridique mossi",
    subtitle: "Un modèle de gouvernance africaine sans équivalent",
    description:
      "Le Mogho Naaba de Ouagadougou tient une cour régulière — le «Naab Yiisgu» (cérémonie du vendredi) — qui régule les conflits, fixe les impôts (en nature : bétail, mil, tissu) et lève les armées. Les provinces sont gérées par des «Nakomse» nommés directement. La justice coutumière distingue les litiges familiaux (réglés par les anciens) des crimes graves (tranchés par le Naaba). Ce système politique survivra à la colonisation et fonctionnaire encore cérémoniellemet aujourd'hui.",
    tags: ["gouvernance", "justice coutumière", "impôts", "Nakomse"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9004,
    era: "mossi",
    year: 1328,
    sortOrder: 13,
    title: "Razzia mossi sur Tombouctou",
    subtitle: "Les Mossi défient l'empire du Mali (1328)",
    description:
      "En 1328, les cavaliers du royaume de Yatenga lancent une audacieuse razzia jusqu'à Tombouctou, alors joyau de l'Empire du Mali sous Mansa Moussa. La ville est pillée pendant plusieurs semaines avant que les troupes maliennes ne reprennent le contrôle. Cet événement démontre la puissance militaire des Mossi et établit une frontière de facto entre leur territoire et les grands empires sahéliens. Les Mossi résisteront aussi aux offensives du Songhaï au XVe siècle, préservant leur indépendance.",
    tags: ["Tombouctou", "Mali", "guerre", "Yatenga", "résistance"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9005,
    era: "mossi",
    year: 1450,
    sortOrder: 14,
    title: "Commerce et routes caravanières",
    subtitle: "Le plateau central dans les réseaux d'échange sahéliens",
    description:
      "Malgré leur réputation guerrière, les Mossi participent activement aux échanges commerciaux. Les marchés de Ouagadougou, Koudougou et Kaya attirent des caravanes de marchands Dioula portant cola, sel, coton et métaux. En échange, les Mossi exportent esclaves, chevaux et artisanat. La «Route du Sahel» relie Tombouctou à Salaga (Ghana) en traversant le territoire mossi. Les forgerons (Yiyense) produisent houes, flèches et ornements échangés sur tout l'espace régional.",
    tags: ["commerce", "caravanes", "Dioula", "économie", "artisanat"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9006,
    era: "mossi",
    year: 1500,
    sortOrder: 15,
    title: "Résistance à l'Islam et syncrétisme",
    subtitle:
      "Les Mossi refusent l'islamisation forcée tout en absorbant l'influence musulmane",
    description:
      "Contrairement à la plupart de leurs voisins, les Mossi résistent à l'islamisation. En 1498-1499, le Songhaï d'Askia Mohamed tente d'imposer l'islam par la guerre sainte mais échoue. Les Mossi développent un syncrétisme original : certains commerçants et lettrés adoptent l'islam, mais les structures politiques et spirituelles ancestrales (culte des ancêtres, sacrifices, initiation) demeurent dominantes. Cette résistance culturelle explique la richesse rituelle du Burkina Faso contemporain.",
    tags: ["Islam", "syncrétisme", "résistance", "Askia Mohamed", "religion"],
    imageUrl: "",
    gradientCss: "",
  },

  /* ═══════════════  ÈRE 2 : EMPIRES DE L'OUEST & COMMERCE  ═══════════════ */
  {
    id: 9010,
    era: "bobo",
    year: 1400,
    sortOrder: 20,
    title: "Bobo-Dioulasso : capitale commerciale de l'Ouest",
    subtitle: "Carrefour des routes entre savane et Sahel",
    description:
      "Fondée par les Bobo-Fing (populations autochtones), la ville de Bobo-Dioulasso s'impose comme carrefour commercial majeur. Les marchands Dioula (Dyula) — commerçants itinérants mandingues — en font leur base d'opération. Ils commercialisent la cola vers le nord, l'or vers le Maghreb et les esclaves vers la côte. La ville développe des quartiers spécialisés : artisans tisserands, forgerons, tanneurs. L'architecture en banco (latérite + argile) crée des maisons-entrepôts caractéristiques.",
    tags: ["Bobo-Dioulasso", "Dioula", "commerce", "banco", "architecture"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9011,
    era: "bobo",
    year: 1490,
    sortOrder: 21,
    title: "Construction de la Grande Mosquée de Bobo",
    subtitle: "Chef-d'œuvre de l'architecture soudano-sahélienne",
    description:
      "La Grande Mosquée de Dioulassoba est érigée vers la fin du XVe siècle par la communauté Dioula islamisée. Bâtie entièrement en banco (terre crue stabilisée), ses minarets coniques surmontés de pointes en bois font partie des structures soudano-sahéliennes les mieux conservées d'Afrique de l'Ouest. Elle témoigne de l'islamisation progressive de Bobo par les réseaux marchands Dioula. La mosquée est toujours en usage et classée patrimoine national.",
    tags: ["mosquée", "architecture", "banco", "Islam", "patrimoine"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9012,
    era: "bobo",
    year: 1591,
    sortOrder: 22,
    title: "Chute du Songhaï et recomposition commerciale",
    subtitle:
      "Les invasions marocaines bouleversent les routes transsahariennes",
    description:
      "En 1591, les armées marocaines d'Aḥmad al-Manṣūr détruisent l'empire du Songhaï à la bataille de Tondibi. Tombouctou tombe. Les grandes routes caravanières sahéliennes sont disloquées. Pour le territoire burkinabè, cela signifie une réorientation des flux commerciaux vers les côtes atlantiques (échanges avec les comptoirs européens). Les Dioula diversifient leurs routes et renforcent les liaisons avec Asante (Ghana), Ghana présent et Côte d'Ivoire.",
    tags: ["Songhaï", "Maroc", "routes commerciales", "recomposition"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9013,
    era: "bobo",
    year: 1650,
    sortOrder: 23,
    title: "Le peuple Lobi : gardiens des frontières du Sud-Ouest",
    subtitle: "Une civilisation sans chefferie dans la Volta Noire",
    description:
      "Au XVIIe siècle, les Lobi (et Birifor, Dagara, Gan) occupent le Sud-Ouest de l'actuel Burkina Faso. Société sans chef centralisé, gouvernée par les anciens et les «thil» (esprits protecteurs), les Lobi organisent leur économie autour de la chasse, de l'agriculture sur brûlis et de l'extraction artisanale d'or dans la Volta Noire. Leurs maisons-forteresses en banco sans ouverture extérieure témoignent d'une société en résistance permanente. Ils résisteront farouchement à la colonisation française.",
    tags: ["Lobi", "résistance", "or", "société sans chefferie", "Volta Noire"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9014,
    era: "bobo",
    year: 1700,
    sortOrder: 24,
    title: "Les Peul dans le Sahel burkinabè",
    subtitle: "Pastoralisme, Islam et réseaux commerciaux à longue distance",
    description:
      "Les communautés peules (Fulbé) s'installent au XVIIIe siècle dans le Sahel burkinabè (Dori, Djibo, Séno). Pasteurs semi-nomades pratiquant la transhumance, ils possèdent les plus grands troupeaux de la région et contrôlent une partie du commerce de bétail vers la côte. Islamisés, ils participent aux réseaux commerciaux trans-sahéliens. À Dori, des lettrés peuls copient des manuscrits islamiques. La langue fulfuldé devient une lingua franca sahélienne.",
    tags: ["Peul", "Fulbé", "Islam", "pastoralisme", "Dori"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9015,
    era: "bobo",
    year: 1740,
    sortOrder: 25,
    title: "Le Royaume Gourmantché de Fada N'Gourma",
    subtitle: "Puissance politique et carrefour de l'Est",
    description:
      "Le peuple Gourmantché fonde le royaume de Nungu (Fada N'Gourma) vers le XVIe siècle, qui atteint son apogée au XVIIIe. Situé à la croisée des routes entre le Niger, le bassin de la Volta et le Ghana, ce royaume lève tribut sur les marchands de passage. Les Gourmantché développent une culture matérielle distincte : céramiques ornées, bronzes, tissages. Ils seront parmi les derniers à résister à la pénétration militaire française en 1895.",
    tags: ["Gourmantché", "Fada", "Nungu", "Est", "commerce"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9016,
    era: "bobo",
    year: 1790,
    sortOrder: 26,
    title: "Artisanat et économie pré-coloniale",
    subtitle: "Forgerons, tisserands et teinturiers structurent l'économie",
    description:
      "À la veille de la colonisation, l'économie du territoire repose sur une agriculture diversifiée (mil, sorgho, igname, coton), l'élevage bovin-ovin, et un artisanat spécialisé. Les Forgerons (caste endogame) fabriquent outils agricoles, armes et bijoux. Les tisserands fabriquent le «Faso Dan Fani» (proto-version). Les teinturiers à l'indigo de Koudougou et Bobo-Dioulasso exportent leurs pagnes jusqu'au Sahel. Le marché de Pouytenga est déjà un carrefour régional.",
    tags: ["artisanat", "forge", "tissage", "indigo", "économie rurale"],
    imageUrl: "",
    gradientCss: "",
  },

  /* ══════════════════════  ÈRE 3 : ÈRE COLONIALE  ═══════════════════════════ */
  {
    id: 9020,
    era: "colonial",
    year: 1895,
    sortOrder: 30,
    title: "Conquête militaire française",
    subtitle: "La pénétration coloniale : 1895-1898",
    description:
      "Entre 1895 et 1898, les troupes coloniales françaises imposent leur domination par une série d'expéditions militaires. La colonne Voulet-Chanoine avance par la violence extrême (massacres documentés). Le Mogho Naaba Wobgo résiste mais doit se réfugier en Gold Coast britannique (actuel Ghana) en 1896 après la défaite de Ouagadougou. Son successeur Sigiri accepte un protectorat de façade. Le capitaine Binger, premier à traverser la région en 1887, avait préparé le terrain diplomatique.",
    tags: [
      "conquête",
      "Voulet-Chanoine",
      "Mogho Naaba Wobgo",
      "résistance militaire",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9021,
    era: "colonial",
    year: 1897,
    sortOrder: 31,
    title: "Résistance du Yatenga et des Lobi",
    subtitle: "Les peuples de l'ouest et du nord refusent la soumission",
    description:
      "Le royaume du Yatenga résiste plus longtemps. Son Naaba Baogho tente d'organiser une coalition de résistance. Dans le Sud-Ouest, les Lobi opposent une résistance armée tenace jusqu'en 1903 — leurs maisons-forteresses nécessitent des sièges prolongés. La répression coloniale inclut: destructions de villages, pillages des greniers, saisie du bétail, travaux forcés. Ces traumatismes fondateurs expliquent la mémoire historique de méfiance vis-à-vis de l'État dans certaines régions.",
    tags: ["Yatenga", "Lobi", "résistance", "répression", "sud-ouest"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9022,
    era: "colonial",
    year: 1904,
    sortOrder: 32,
    title: "Travail forcé et économie coloniale",
    subtitle: "Le «prestaire» : exploitation systématique des populations",
    description:
      "L'économie coloniale repose sur le travail forcé («prestations») et l'impôt de capitation payé en argent — ce qui oblige les hommes à migrer vers les plantations ivoiriennes ou ghanéennes pour trouver du numéraire. La Haute-Volta devient ainsi un réservoir de main-d'œuvre pour le reste de l'AOF. Les grandes plantations de cacao de Côte d'Ivoire sont construites sur le dos des travailleurs burkinabè. La migration Mossi vers le sud commence à cette époque et perdurera un siècle.",
    tags: [
      "travail forcé",
      "impôt",
      "migration",
      "Côte d'Ivoire",
      "économie coloniale",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9023,
    era: "colonial",
    year: 1919,
    sortOrder: 33,
    title: "Création de la colonie de Haute-Volta",
    subtitle: "1er mars 1919 — naissance officielle du territoire",
    description:
      "Par le décret du 1er mars 1919, la France crée officiellement la colonie de Haute-Volta, séparée du Haut-Sénégal-Niger (futur Mali) dont elle faisait partie depuis 1904. La capitale est fixée à Ouagadougou. Les 60 «cercles» administratifs recoupent partiellement les anciennes frontières des royaumes. La colonie couvre 274 000 km². Edouard Hesling, premier gouverneur, fixe comme priorité le développement du coton — culture imposée qui détourne les paysans des vivres.",
    tags: ["Haute-Volta", "1919", "colonie", "Hesling", "coton"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9024,
    era: "colonial",
    year: 1915,
    sortOrder: 34,
    title: "Révolte de la Volta-Bani (1915-1916)",
    subtitle: "La plus grande insurrection anti-coloniale de l'AOF",
    description:
      "En novembre 1915, les peuples Bwa, Marka et Dafing des cercles de Dédougou, San et Tougan se soulèvent contre la conscription militaire forcée pour la Première Guerre mondiale, le travail forcé et les réquisitions brutales. Plus de 100 000 personnes prennent les armes. La répression française est dévastatrice : 30 000 à 50 000 morts, villages rasés, greniers brûlés, chefs exécutés. Les rebelles utilisent la tactique des villages-forteresses. Cette révolte reste le soulèvement armé le plus important de l'histoire pré-indépendance.",
    tags: ["Volta-Bani", "Bwa", "insurrection", "conscription", "1915"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9025,
    era: "colonial",
    year: 1932,
    sortOrder: 35,
    title: "Démembrement de la Haute-Volta (5 sept. 1932)",
    subtitle: "Le territoire efface — puis restitué 15 ans plus tard",
    description:
      "Le 5 septembre 1932, pour des raisons économiques (réduction des coûts administratifs, facilitation de l'accès à la main-d'œuvre ivoirienne), la France démembre la Haute-Volta et répartit son territoire entre la Côte d'Ivoire, le Soudan français et le Niger. Cette dissolution traumatise les chefferies mossi qui perdent leur reconnaissance administrative. Les migrations vers le sud s'accélèrent. 15 ans de revendications, notamment du Mogho Naaba Koom et du député Félix Houphouët-Boigny, mèneront à la reconstitution.",
    tags: ["démembrement", "1932", "Côte d'Ivoire", "Mogho Naaba Koom"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9026,
    era: "colonial",
    year: 1944,
    sortOrder: 36,
    title: "Conférence de Brazzaville et mutations coloniales",
    subtitle: "Premières ouvertures vers l'émancipation politique africaine",
    description:
      "En janvier-février 1944, la Conférence de Brazzaville réunit les gouverneurs coloniaux sous la direction du général de Gaulle. Bien qu'elle exclue l'indépendance, elle préconise une plus grande association des populations africaines à la gestion coloniale. Ces orientations débouchent sur la Constitution de 1946 qui crée l'Union française et accorde la citoyenneté française à tous les ressortissants. Pour la Haute-Volta, cela se traduit par les premières élections de représentants à l'Assemblée nationale française.",
    tags: ["Brazzaville", "émancipation", "Union française", "citoyenneté"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9027,
    era: "colonial",
    year: 1947,
    sortOrder: 37,
    title: "Reconstitution de la Haute-Volta (4 sept. 1947)",
    subtitle: "Le retour d'une identité administrative et politique",
    description:
      "Après 15 ans de démembrement, la Haute-Volta est reconstituée le 4 septembre 1947. Cette victoire est celle du Mogho Naaba Koom II, des élites mossi et du mouvement politique nascent. Gérard Kango Ouédraogo et d'autres militants avaient porté la cause à Paris. La reconstitution coïncide avec l'émergence d'une classe politique africaine au sein du système colonial. Le Mouvement Démocratique Voltaïque (MDV) et d'autres partis commencent à structurer la vie politique.",
    tags: ["reconstitution", "1947", "Mogho Naaba Koom", "partis politiques"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9028,
    era: "colonial",
    year: 1956,
    sortOrder: 38,
    title: "Loi Defferre et autonomie interne",
    subtitle: "Vers la gestion directe par les élites africaines",
    description:
      "La loi-cadre Defferre (1956) accorde une autonomie interne aux territoires de l'AOF. Des élections au suffrage universel sont organisées. En Haute-Volta, le Rassemblement Démocratique Africain (RDA) de Maurice Yaméogo, affilié au parti d'Houphouët-Boigny, domine. Yaméogo devient chef de gouvernement en 1958. Sur le plan économique, les premières infrastructures modernes se développent : chemin de fer Abidjan-Ouagadougou achevé en 1954, réseau routier, premières écoles secondaires.",
    tags: ["Defferre", "autonomie", "Yaméogo", "RDA", "chemin de fer"],
    imageUrl: "",
    gradientCss: "",
  },

  /* ══════════════════════  ÈRE 4 : INDÉPENDANCE  ════════════════════════════ */
  {
    id: 9030,
    era: "independance",
    year: 1960,
    sortOrder: 40,
    title: "Indépendance — 5 août 1960",
    subtitle: "Maurice Yaméogo, premier président de la République",
    description:
      "Le 5 août 1960 à minuit, la République de Haute-Volta proclame son indépendance. Maurice Yaméogo devient le premier président. Il adopte rapidement un régime autoritaire : interdiction des partis d'opposition (1958), mariage civil controversé. L'économie reste dépendante : exportations de bétail et coton, aide française, migrations économiques vers la Côte d'Ivoire (200 000 Voltaïques par an). La constitution de 1960 est calquée sur le modèle gaulliste. La France maintient une présence militaire et économique omniprésente.",
    tags: ["indépendance", "Yaméogo", "1960", "constitution", "dépendance"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9031,
    era: "independance",
    year: 1966,
    sortOrder: 41,
    title: "Premier coup d'État — Général Lamizana (3 janv. 1966)",
    subtitle: "Les syndicats et l'armée renversent Yaméogo",
    description:
      "Le 3 janvier 1966, au terme de grèves massives des syndicats (CGT-V, SYNTER) dénonçant l'austérité, la corruption et les dépenses somptuaires de Yaméogo, le général Sangoulé Lamizana prend le pouvoir sans violence. Yaméogo est arrêté, jugé et emprisonné. Lamizana dirigera le pays jusqu'en 1980, alternant périodes militaires et civiles (Constitutions de 1967, 1970, 1977). Cette instabilité institutionnelle chronique reflète les contradictions entre élites militaires, syndicats et chefferies traditionnelles.",
    tags: ["Lamizana", "coup d'État", "syndicats", "1966", "Yaméogo"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9032,
    era: "independance",
    year: 1969,
    sortOrder: 42,
    title: "Naissance du FESPACO (1969)",
    subtitle: "Ouagadougou, capitale mondiale du cinéma africain",
    description:
      "Le Festival Panafricain du Cinéma de Ouagadougou (FESPACO) est créé en 1969. À l'origine simple «semaine du cinéma africain», il devient biennal en 1972 et continental. Il réunit cinéastes africains de tout le continent et de la diaspora. Son «Étalon de Yennenga» (grand prix en or) est la récompense cinématographique la plus prestigieuse d'Afrique. Le FESPACO positionne Ouagadougou comme capitale culturelle africaine et contribue à l'industrie locale (hôtellerie, artisanat, services).",
    tags: ["FESPACO", "cinéma", "Étalon de Yennenga", "culture", "Ouagadougou"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9033,
    era: "independance",
    year: 1973,
    sortOrder: 43,
    title: "Grande sécheresse du Sahel (1968-1974)",
    subtitle: "Crise alimentaire et humanitaire majeure",
    description:
      "La sécheresse sahélienne de 1968-1974 est catastrophique pour la Haute-Volta. Le cheptel est décimé (40 à 60% du bétail mort), les récoltes s'effondrent, la famine frappe le Sahel voltaïque (Dori, Djibo, Ouahigouya). Des centaines de milliers de personnes fuient vers les villes ou le sud. Cette crise révèle la fragilité structurelle de l'économie voltaïque, entièrement tributaire des aléas climatiques. Elle accélère la conscience nationale de la nécessité d'une politique d'autosuffisance alimentaire — idée que Sankara reprendra 10 ans plus tard.",
    tags: ["sécheresse", "Sahel", "famine", "1973", "autosuffisance"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9034,
    era: "independance",
    year: 1975,
    sortOrder: 44,
    title: "Économie de la dépendance structurelle",
    subtitle: "Aide internationale, migrations et exportations primaires",
    description:
      "Dans les années 1970, la Haute-Volta est l'un des pays les plus pauvres du monde (rang 126/130 selon l'IDH 1975). L'économie repose sur l'agriculture vivrière (80% de la population), les exportations de coton (20 000 tonnes/an), de bétail et d'or artisanal. Les transferts des migrants voltaïques en Côte d'Ivoire (2 millions de personnes) constituent la première source de devises. L'aide publique au développement représente 40% du budget national. Cette dépendance sera le cœur de la critique sankariste.",
    tags: ["économie", "dépendance", "migrants", "aide", "coton"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9035,
    era: "independance",
    year: 1980,
    sortOrder: 45,
    title: "Coup d'État du colonel Zerbo (25 nov. 1980)",
    subtitle: "Succession de juntes : Zerbo puis Ouédraogo (1982)",
    description:
      "Le 25 novembre 1980, le colonel Saye Zerbo renverse la troisième République de Lamizana. Son régime, le CMRPN (Comité Militaire de Redressement pour le Progrès National), suspend la constitution, interdit les syndicats. Il est à son tour renversé le 7 novembre 1982 par le Conseil du Salut du Peuple (CSP) dirigé par le médecin-commandant Jean-Baptiste Ouédraogo. C'est dans ce contexte qu'émerge Thomas Sankara, nommé secrétaire d'État à l'Information puis Premier ministre (janv. 1983).",
    tags: ["Zerbo", "CMRPN", "Ouédraogo", "CSP", "instabilité"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9036,
    era: "independance",
    year: 1983,
    sortOrder: 46,
    title: "Thomas Sankara : Prime ministre et arrestation (mai 1983)",
    subtitle: "La montée d'un leader charismatique avant la révolution",
    description:
      "Nommé Premier ministre le 10 janvier 1983 par Ouédraogo, Thomas Sankara est une personnalité déjà célèbre : guitariste, parachutiste de légende, orateur exceptionnel. Ses discours anti-impérialistes et sa proximité avec les populations créent une ferveur populaire immédiate. En mai 1983, sous pression française et de la droite militaire, Ouédraogo le fait arrêter. Cette arrestation déclenche la mobilisation populaire et militaire qui aboutira au coup du 4 août.",
    tags: [
      "Sankara",
      "Premier ministre",
      "arrestation",
      "charisma",
      "populaire",
    ],
    imageUrl: "",
    gradientCss: "",
  },

  /* ══════════════════  ÈRE 5 : RÉVOLUTION, COMPAORÉ, TRANSITION  ════════════ */
  {
    id: 9040,
    era: "sankara",
    year: 1983,
    sortOrder: 50,
    title: "Révolution du 4 août 1983",
    subtitle: "Le CNR prend le pouvoir — Thomas Sankara, président",
    description:
      "Le 4 août 1983, des commandos dirigés par Blaise Compaoré libèrent Sankara. Le Conseil National de la Révolution (CNR) est proclamé. Sankara devient chef de l'État à 33 ans. Son programme révolutionnaire est immédiatement radical : dissolution des partis, des syndicats, des structures bourgeoises. Des Comités de Défense de la Révolution (CDR) organisés dans chaque quartier, village et administration deviennent les instruments du pouvoir populaire et de la mobilisation sociale.",
    tags: ["CNR", "révolution", "CDR", "4 août", "programme"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9041,
    era: "sankara",
    year: 1984,
    sortOrder: 51,
    title: "Burkina Faso : le changement de nom (4 août 1984)",
    subtitle: "De la Haute-Volta au «Pays des Hommes Intègres»",
    description:
      "Le 4 août 1984, au premier anniversaire de la révolution, Sankara rebaptise solenellement le pays «Burkina Faso» — «Burkina» du mooré (hommes intègres/dignes) et «Faso» du dioula (patrie/pays ancestral). Le drapeau rouge et vert avec étoile dorée remplace le tricolore voltaïque. L'hymne «Une seule nuit» de Thomas Sankara lui-même remplace «Fière Volta». Ce renommage est un acte politique fort : effacement du passé colonial français, affirmation d'une personnalité nationale africaine souveraine.",
    tags: [
      "Burkina Faso",
      "renommage",
      "mooré",
      "dioula",
      "souveraineté culturelle",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9042,
    era: "sankara",
    year: 1984,
    sortOrder: 52,
    title: "Discours historique à l'ONU (4 oct. 1984)",
    subtitle: "Sankara dénonce la dette néocoloniale devant le monde",
    description:
      "Le 4 octobre 1984, Sankara prononce à l'Assemblée générale des Nations Unies un discours qui fera date : il dénonce la dette africaine comme «une arme conquise ingénieusement» pour maintenir la dépendance, propose un front uni anti-dette, critique l'aide internationale conditionnnelle et appelle à une nouvelle architecture économique mondiale. Ce discours est regardé comme l'un des plus importants prononcés à l'ONU par un chef d'État africain. Il est toujours étudié dans les universités du continent.",
    tags: [
      "ONU",
      "dette",
      "discours",
      "impérialisme",
      "souveraineté économique",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9043,
    era: "sankara",
    year: 1985,
    sortOrder: 53,
    title: "Réformes sociales révolutionnaires",
    subtitle: "Santé, éducation, femmes, forêts : résultats mesurables",
    description:
      "En 4 ans, la révolution Sankara réalise : vaccination de 2,5 millions d'enfants en 8 jours (rougeole, méningite, fièvre jaune) — record mondial ; taux de scolarisation primaire passé de 6% à 22% ; construction de 350 écoles et 55 maternités par la mobilisation populaire ; loi interdisant l'excision et les mariages forcés (1983) ; plantation de 10 millions d'arbres pour freiner la désertification ; autosuffisance céréalière atteinte en 1986 (blé local doublé). Les femmes entrent massivement dans la vie publique (30% des postes CDR).",
    tags: [
      "vaccination",
      "éducation",
      "femmes",
      "reforestation",
      "autosuffisance",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9044,
    era: "sankara",
    year: 1985,
    sortOrder: 54,
    title: "Guerre des pauvres contre le Mali (déc. 1985)",
    subtitle: "Le conflit de l'Agacher : 5 jours de guerre frontalière",
    description:
      "Du 25 au 30 décembre 1985, une bataille frontalière éclate dans la bande de l'Agacher, zone riche en manganèse et uranium disputée avec le Mali. Après quelques jours de combats (environ 60 morts des deux côtés), un cessez-le-feu est signé sous médiation nigériane. La Cour internationale de Justice de La Haye tranchera le différend en 1986 en divisant le territoire en deux. Cet épisode illustre la fragilité des frontières héritées de la colonisation dans le Sahel.",
    tags: ["Agacher", "Mali", "frontière", "guerre", "Cour internationale"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9045,
    era: "sankara",
    year: 1987,
    sortOrder: 55,
    title: "Assassinat de Thomas Sankara (15 oct. 1987)",
    subtitle: "Blaise Compaoré prend le pouvoir — «Rectification»",
    description:
      "Le 15 octobre 1987, alors que le Conseil de l'Entente se réunit au Conseil de l'Entente à Ouagadougou, des soldats ouvrent le feu. Sankara et douze de ses compagnons sont assassinés. Blaise Compaoré arrive au pouvoir, proclamant la «Rectification» — continuité révolutionnaire de façade. La dépouille de Sankara est enterrée à la va-vite sans autopsie. Des décennies après, le tribunal militaire burkinabè reconnaîtra Compaoré coupable en absentia (2022). Sankara reste une icône panafricaine incontournable.",
    tags: ["assassinat", "Compaoré", "rectification", "15 octobre", "héritage"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9046,
    era: "sankara",
    year: 1991,
    sortOrder: 56,
    title: "Constitution de 1991 — IVe République",
    subtitle: "Multipartisme sous contrôle : 27 ans de Compaoré",
    description:
      "La Constitution du 11 juin 1991, adoptée par référendum, instaure un régime présidentiel multipartiste. Son parti, le Congrès pour la Démocratie et le Progrès (CDP), domine la vie politique. Les élections, régulières mais contestées, donnent des majorités confortables au pouvoir. Le Burkina développe une image internationale de «stabilité»: médiateur dans les crises ivoiriennes (2001-2011) et maliennes. Le pays reçoit d'importantes aides et investissements. Mais une corruption systémique s'installe.",
    tags: ["Constitution", "CDP", "Compaoré", "multipartisme", "médiation"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9047,
    era: "sankara",
    year: 1994,
    sortOrder: 57,
    title: "Intégration à l'UEMOA et dévaluation du FCFA",
    subtitle: "Choc économique et repositionnement commercial",
    description:
      "En janvier 1994, le franc CFA est dévalué de 50% sur pression du FMI et de la France. Le Burkina rejoint l'UEMOA (Union Économique et Monétaire Ouest-Africaine) créée en 1994. La dévaluation stimule les exportations (coton, or, sésame) mais renchérit les importations, pénalisant les classes populaires urbaines. Dans la décennie suivante, l'or devient la première source d'exportation, devant le coton. La production aurifère passe de quelques tonnes à plus de 20 tonnes/an en 2005.",
    tags: ["UEMOA", "dévaluation", "FCFA", "or", "coton"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9048,
    era: "sankara",
    year: 1998,
    sortOrder: 58,
    title: "Assassinat du journaliste Norbert Zongo (13 déc. 1998)",
    subtitle: "Le tournant dans la conscience démocratique burkinabè",
    description:
      "Le 13 décembre 1998, Norbert Zongo, directeur du journal «L'Indépendant» et journaliste d'investigation reconnu, est assassiné avec trois compagnons sur la route de Sapouy. Il enquêtait sur la mort en garde à vue de David Ouédraogo, chauffeur du frère de Compaoré. Cette affaire déclenche une mobilisation civique sans précédent : marches populaires, Mourvement du Peuple, Collectif d'Organisations Démocratiques de Masse. La presse indépendante burkinabè devient l'une des plus dynamiques d'Afrique.",
    tags: [
      "Zongo",
      "journalisme",
      "assassinat",
      "liberté de presse",
      "mobilisation",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9049,
    era: "sankara",
    year: 2000,
    sortOrder: 59,
    title: "Essor du coton et de l'or : économie 2000-2010",
    subtitle: "Le Burkina devient premier producteur africain de coton",
    description:
      "Dans les années 2000, le Burkina Faso devient le premier producteur africain de coton avec 600 000 à 700 000 tonnes par an. La filière emploie 3,5 millions de personnes. Parallèlement, l'exploitation minière industrielle d'or décolle avec l'arrivée de multinationales (IAMGOLD, Endeavour Mining). En 2010, l'or dépasse le coton comme premier produit d'exportation. Le pays produit 25 tonnes d'or par an. Ces richesses alimentent la croissance mais les bénéfices restent insuffisamment redistribués.",
    tags: ["coton", "or", "mines", "exportations", "croissance"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9050,
    era: "sankara",
    year: 2010,
    sortOrder: 60,
    title: "SIAO et rayonnement artisanal africain",
    subtitle: "Le Salon International de l'Artisanat de Ouagadougou",
    description:
      "Fondé en 1988, le SIAO (Salon International de l'Artisanat de Ouagadougou) devient biennal en 1993 et s'affirme comme le plus grand salon d'artisanat africain. Il valorise bronziers, tisserands, potiers, bijoutiers, maroquiniers d'une cinquantaine de pays. Les artisans burkinabè — notamment en bronze, en bogolan et en Faso Dan Fani — exportent vers l'Europe et l'Amérique du Nord. L'artisanat représente 15% du PIB et emploie 15% de la population active.",
    tags: ["SIAO", "artisanat", "bronziers", "Faso Dan Fani", "exportation"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9051,
    era: "sankara",
    year: 2011,
    sortOrder: 61,
    title: "Mutineries militaires et soulèvements urbains (2011)",
    subtitle: "Prélude à l'insurrection — fractures du système Compaoré",
    description:
      "De mars à juin 2011, une série de mutineries militaires éclatent à Ouagadougou, Bobo-Dioulasso, Koudougou et Fada N'Gourma : soldats réclamant rémunérations et primes impayées. Simultanément, des manifestations civiles protestent contre la cherté de la vie et la mort d'un étudiant en garde à vue. Compaoré est contraint de limoger son Premier ministre et son chef d'état-major. Ces événements fragilisent durablement le régime et préfigurent l'effondrement de 2014.",
    tags: ["mutineries", "2011", "contestation", "Compaoré fragilisé"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9052,
    era: "sankara",
    year: 2014,
    sortOrder: 62,
    title: "Insurrection populaire d'octobre 2014",
    subtitle: "30-31 octobre : Compaoré chasse par le peuple après 27 ans",
    description:
      "En octobre 2014, Compaoré tente de modifier l'article 37 de la Constitution pour briguer un 5e mandat. Le 28 octobre, les syndicats et partis d'opposition appellent à manifester. Les 30 et 31 octobre, des centaines de milliers de Burkinabè envahissent Ouagadougou. L'Assemblée nationale est incendiée. La RTB (télévision nationale) est prise d'assaut. Le 31 octobre, Compaoré démissionne et fuit en Côte d'Ivoire. Une transition militaire puis civile s'amorce sous Yacouba Isaac Zida puis Michel Kafando. C'est l'un des rares cas où un peuple africain chasse son dictateur par une insurrection non armée réussie.",
    tags: ["insurrection", "2014", "Compaoré", "article 37", "transition"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9053,
    era: "sankara",
    year: 2015,
    sortOrder: 63,
    title: "Tentative de coup d'État du RSP (sept. 2015)",
    subtitle:
      "Le Régiment de Sécurité Présidentielle tente de bloquer la transition",
    description:
      "Le 16 septembre 2015, à quelques semaines des premières élections libres depuis 1991, le Régiment de Sécurité Présidentielle (RSP) — garde personnelle de Compaoré — renverse le gouvernement de transition. Le président Kafando est arrêté. Un soulèvement populaire immédiat et la pression internationale forcent le RSP à reculer en moins d'une semaine. Le gouvernement est restauré, le RSP dissout. Le 29 novembre 2015, Roch Marc Christian Kaboré (MPP) est élu président au premier tour avec 53,49% des voix.",
    tags: ["RSP", "coup d'État", "Kafando", "Kaboré", "élections libres"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9054,
    era: "sankara",
    year: 2016,
    sortOrder: 64,
    title: "Premières attaques terroristes à Ouagadougou (janv. 2016)",
    subtitle: "Le Burkina bascule dans la crise sécuritaire sahélienne",
    description:
      "Le 15 janvier 2016, une attaque contre l'hôtel Splendid et le café Cappuccino de Ouagadougou fait 30 morts, dont de nombreux ressortissants étrangers. Revendiquée par AQMI, cette attaque marque l'entrée du Burkina dans une spirale sécuritaire majeure. Les attaques se multiplient ensuite dans le Sahel (province de l'Oudalan, Soum, Kénédougou) puis s'étendent progressivement au centre, à l'est et à l'ouest. Entre 2016 et 2020, le nombre de déplacés internes passe de quelques milliers à 1 million.",
    tags: ["terrorisme", "Splendid", "AQMI", "Sahel", "déplacés"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9055,
    era: "sankara",
    year: 2019,
    sortOrder: 65,
    title: "Explosion de la crise sécuritaire et humanitaire",
    subtitle: "2 millions de déplacés, école et santé paralysés dans le nord",
    description:
      "Entre 2019 et 2021, la situation sécuritaire s'emballe dans le Sahel, le Nord et l'Est. Des centaines d'attaques contre des villages, des convois militaires, des marchés et des lieux de culte (églises, mosquées). Des régions entières deviennent inaccessibles. 4 000 écoles ferment (400 000 enfants privés de scolarité). Des centres de santé abandonnés. Le personnel humanitaire est visé. Plus de 2 millions de personnes déplacées. L'économie des zones touchées s'effondre : filières coton-or stoppées, marchés vides.",
    tags: [
      "crise sécuritaire",
      "déplacés",
      "écoles fermées",
      "humanitaire",
      "Sahel",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9056,
    era: "sankara",
    year: 2020,
    sortOrder: 66,
    title: "Élections présidentielles — Roch Kaboré réélu",
    subtitle: "Scrutin maintenu malgré la crise : 57,87% pour Kaboré",
    description:
      "Le 22 novembre 2020, malgré la crise sécuritaire, les élections présidentielles et législatives se tiennent. Roch Marc Christian Kaboré est réélu dès le premier tour avec 57,87% des voix, devant Eddie Komboïgo (CDP, 15,5%). Près de 20% des bureaux de vote n'ouvrent pas dans les zones à risque. La participation est de 51%. Son second mandat sera marqué par l'aggravation continue de la crise sécuritaire et des pressions politico-militaires croissantes.",
    tags: [
      "élections",
      "Kaboré",
      "2020",
      "sécurité",
      "démocratie sous pression",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9057,
    era: "sankara",
    year: 2022,
    sortOrder: 67,
    title: "Coup d'État du lieutenant-colonel Damiba (24 janv. 2022)",
    subtitle: "Le MPSR renverse Kaboré — premier coup depuis 2014",
    description:
      "Le 24 janvier 2022, le lieutenant-colonel Paul-Henri Sandaogo Damiba et le Mouvement Patriotique pour la Sauvegarde et la Restauration (MPSR) renversent Kaboré, invoquant l'incapacité du gouvernement à répondre à la crise sécuritaire. Kaboré est placé en résidence surveillée. Damiba est acclamé par une partie de la population exaspérée par l'insécurité. La CEDEAO impose des sanctions. La France reste prudemment engagée. Damiba promet une «transition» vers des élections.",
    tags: ["MPSR", "Damiba", "coup d'État", "janvier 2022", "CEDEAO"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9058,
    era: "sankara",
    year: 2022,
    sortOrder: 68,
    title: "Second coup d'État — capitaine Ibrahim Traoré (30 sept. 2022)",
    subtitle: "«Ibra» renverse Damiba — rupture diplomatique avec la France",
    description:
      "Le 30 septembre 2022, le capitaine Ibrahim Traoré (34 ans) renverse Damiba, accusé de ne pas avoir amélioré la situation sécuritaire. Avec un discours ouvertement panafricaniste et anti-français, Traoré expulse les forces Sabre françaises présentes depuis 2009, ferme RFI et France 24, et se rapproche de la Russie (Wagner puis Africa Corps). L'Alliance des États du Sahel (AES) est créée avec le Mali et le Niger en septembre 2023 — retrait officiel de la CEDEAO en février 2025.",
    tags: ["Traoré", "IB", "coup d'État", "France expulsion", "AES", "Russie"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9059,
    era: "sankara",
    year: 2023,
    sortOrder: 69,
    title: "Alliance des États du Sahel (AES) — sept. 2023",
    subtitle: "Burkina-Mali-Niger : souveraineté et sécurité collective",
    description:
      "Le 16 septembre 2023 est créée l'Alliance des États du Sahel (AES) réunissant Burkina Faso, Mali et Niger. Elle vise une coopération militaire, économique et diplomatique commune, en rupture avec les institutions CEDEAO. Un bataillon unifié est déployé. Les trois États font face à des sanctions économiques de la CEDEAO. En février 2025, après avoir quitté officiellement la CEDEAO, ils procèdent à la création d'une «Confédération des États du Sahel». Le Burkina réoriente ses partenariats vers la Russie, la Chine, la Turquie et d'autres acteurs.",
    tags: ["AES", "Confédération", "CEDEAO", "Mali", "Niger", "souveraineté"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9060,
    era: "sankara",
    year: 2024,
    sortOrder: 70,
    title: "Opération Naaba Koom et reconquête territoriale",
    subtitle: "Offensive militaire nationale dans les zones rouges",
    description:
      "En 2024, les Forces Armées Nationales du Burkina Faso (FANBF) lancent plusieurs offensives pour reconquérir les territoires sous contrôle de groupes armés. Les Volontaires pour la Défense de la Patrie (VDP) — supplétifs civils armés — jouent un rôle croissant. Simultanément, l'aide humanitaire est déployée dans les zones libérées pour restaurer services éducatifs et sanitaires. La presse internatonale documente des allégations d'abus dans certaines opérations. La situation reste volatile avec 2,1 millions de personnes déplacées.",
    tags: [
      "FANBF",
      "VDP",
      "opérations militaires",
      "reconquête",
      "populations déplacées",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9061,
    era: "sankara",
    year: 2024,
    sortOrder: 71,
    title: "Procès Sankara : justice mémorielle (janv. 2022 → 2024)",
    subtitle: "Compaoré condamné à perpétuité en absentia",
    description:
      "Après 35 ans d'attente, le procès de l'assassinat de Thomas Sankara s'est tenu. En avril 2022, Blaise Compaoré (exilé en Côte d'Ivoire) est condamné à perpétuité en absentia, ainsi que son ex-aide de camp Hyacinthe Kafando. Plusieurs officiers militaires sont condamnés à des peines allant de 10 ans à la perpétuité. Le verdict constitue une reconnaissance officielle de l'assassinat d'État. La famille et les compagnons de Sankara ont obtenu une réhabilitation symbolique. Sa dépouille a été ré-inhumée officiellement.",
    tags: [
      "procès Sankara",
      "Compaoré condamné",
      "justice",
      "mémoire",
      "réhabilitation",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9062,
    era: "sankara",
    year: 2025,
    sortOrder: 72,
    title: "Réformes économiques et Pan-Africanisme économique",
    subtitle: "Valorisation des ressources minières et transformation locale",
    description:
      "En 2024-2025, le gouvernement de transition annonce la révision du code minier pour accroître la part nationale dans l'exploitation de l'or (objectif : 30% de participation de l'État). Des initiatives de transformation locale du coton en textile et du sésame en huile sont lancées. Le projet «Burkina Faso Mine d'Or» vise à capter plus de valeur ajoutée sur le sol national. L'agriculture est soutenue via des subventions d'engrais et des programmes d'irrigation dans les vallées de la Volta Blanche et de la Volta Noire.",
    tags: ["mines", "coton", "transformation", "code minier", "agriculture"],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9063,
    era: "sankara",
    year: 2025,
    sortOrder: 73,
    title: "Infrastructures et développement 2025",
    subtitle: "Routes, énergie solaire et connectivité numérique",
    description:
      "2025 voit la poursuite du programme routier national : réhabilitation de l'axe Ouagadougou-Fada-Pama-Niger, construction de la route Bobo-Diébougou. L'énergie solaire se déploie avec le projet de centrale de Ziniaré (30 MW) et des mini-réseaux ruraux. Le taux d'électrification ruralenatteint 20%. Le mobile money (Orange Money, Moov Africa) équipe 60% des adultes et révolutionne les transferts d'argents, les paiements marchands et l'accès aux services financiers dans les zones rurales.",
    tags: [
      "routes",
      "énergie solaire",
      "numérique",
      "mobile money",
      "infrastructure",
    ],
    imageUrl: "",
    gradientCss: "",
  },
  {
    id: 9064,
    era: "sankara",
    year: 2026,
    sortOrder: 74,
    title: "Burkina Faso 2026 : transition et horizon",
    subtitle: "Cap sur la paix, la reconstruction et la souveraineté intégrale",
    description:
      "À la date d'aujourd'hui (avril 2026), le Burkina Faso poursuit sa transition sous la direction du capitaine Ibrahim Traoré. Des discussions sont en cours sur le calendrier électoral. La situation sécuritaire montre des signes d'amélioration dans certaines zones mais reste préoccupante dans d'autres. L'économie nationale amorce une reprise prudente : production de coton à 300 000 tonnes (contre 600 000 avant la crise), production d'or maintenue à 50 tonnes/an. La société civile, les artistes et les universitaires jouent un rôle de reconstruction identitaire et mémorielle face aux défis immenses qui attendent le Pays des Hommes Intègres.",
    tags: ["2026", "transition", "Traoré", "reconstruction", "espoir"],
    imageUrl: "",
    gradientCss: "",
  },
];

function getEraInfo(era: HistoricalEra): EraInfo {
  return ERAS.find((e) => e.key === era) ?? ERAS[0];
}

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} av. J.-C.`;
  if (year <= 1500) return `~${year}`;
  return String(year);
}

/* ─── Main component ─── */
export function AtlasTimeline() {
  const [activeEra, setActiveEra] = useState<HistoricalEra>("mossi");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: rawEvents = [], isLoading } = useQuery<AtlasEvent[]>({
    queryKey: ["atlas-events"],
    queryFn: async () => (await atlasApi.getEvents()).data,
    staleTime: 60_000,
  });

  // Base locale + API pour garantir une chronologie complète et robuste.
  const events = useMemo(() => {
    const combined = [...REFERENCE_EVENTS, ...rawEvents];
    const seen = new Set<string>();
    return combined
      .filter((e) => {
        const key = `${e.era}:${e.year}:${e.title.trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.year - b.year;
      });
  }, [rawEvents]);

  // Group events by era
  const eventsByEra = useMemo(() => {
    const map: Record<string, AtlasEvent[]> = {};
    for (const e of events) {
      if (!map[e.era]) map[e.era] = [];
      map[e.era].push(e);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.year - b.year);
    }
    return map;
  }, [events]);

  const currentEra = getEraInfo(activeEra);
  const currentEvents = eventsByEra[activeEra] ?? [];

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeEra]);

  const eraIndex = ERAS.findIndex((e) => e.key === activeEra);
  const prevEra = eraIndex > 0 ? ERAS[eraIndex - 1] : null;
  const nextEra = eraIndex < ERAS.length - 1 ? ERAS[eraIndex + 1] : null;

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      {/* ─── Hero ─── */}
      <section className="border-b border-sable-2">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rouge/5 border border-rouge/10 mb-6">
            <BookOpen className="w-4 h-4 text-rouge" />
            <span className="text-rouge text-xs font-semibold uppercase tracking-[0.2em]">
              Atlas historique
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-nuit leading-tight mb-3">
            Mille ans d&apos;histoire
          </h1>
          <p className="text-gris text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            De la Haute-Volta coloniale au Burkina Faso contemporain de 2026,
            explorez les repères politiques, économiques, commerciaux, culturels
            et sociaux qui structurent l&apos;histoire nationale.
          </p>
        </div>
      </section>

      {/* ─── Era selector ─── */}
      <div className="sticky top-[64px] z-30 bg-blanc/80 backdrop-blur-xl border-b border-sable-2/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {ERAS.map((era) => {
              const isActive = activeEra === era.key;
              const count = (eventsByEra[era.key] ?? []).length;
              return (
                <button
                  key={era.key}
                  onClick={() => {
                    setActiveEra(era.key);
                    setExpandedEvent(null);
                  }}
                  className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? clsx(era.bg, era.text, era.border, "border shadow-sm")
                      : "text-gris hover:bg-sable hover:text-nuit",
                  )}
                >
                  <era.Icon className="w-4 h-4" strokeWidth={1.8} />
                  <span>{era.label}</span>
                  <span
                    className={clsx(
                      "text-[11px] ml-0.5",
                      isActive ? "opacity-60" : "text-gris-2",
                    )}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Era panel ─── */}
      <section ref={panelRef} className="bg-sable">
        {/* Era intro card */}
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-2">
          <div
            className={clsx(
              "rounded-2xl border p-6 sm:p-8",
              currentEra.bg,
              currentEra.border,
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div
                className={clsx(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border",
                  currentEra.border,
                  "bg-blanc",
                )}
              >
                <currentEra.Icon
                  className={clsx("w-7 h-7", currentEra.text)}
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="font-serif text-2xl sm:text-3xl text-nuit">
                    {currentEra.label}
                  </h2>
                  <span
                    className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      currentEra.border,
                      currentEra.text,
                    )}
                  >
                    {currentEra.period}
                  </span>
                </div>
                <p className="text-gris leading-relaxed max-w-2xl">
                  {currentEra.summary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Events vertical timeline ─── */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {isLoading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-16 h-5 skeleton rounded" />
                  <div className="flex-1 h-32 skeleton rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div
                className={clsx(
                  "absolute left-[76px] sm:left-[92px] top-0 bottom-0 w-px",
                  currentEra.border.replace("border-", "bg-"),
                )}
              />

              <div className="space-y-0">
                {currentEvents.map((event, idx) => {
                  const isExpanded = expandedEvent === event.sortOrder;
                  const isLast = idx === currentEvents.length - 1;

                  return (
                    <div key={event.sortOrder} className="relative flex group">
                      {/* Year column */}
                      <div className="w-[60px] sm:w-[76px] shrink-0 pt-6 text-right pr-4">
                        <span
                          className={clsx(
                            "font-mono text-sm font-bold transition-colors",
                            isExpanded ? "text-nuit" : "text-gris",
                          )}
                        >
                          {formatYear(event.year)}
                        </span>
                      </div>

                      {/* Timeline dot */}
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className="h-6" />
                        <div
                          className={clsx(
                            "w-3.5 h-3.5 rounded-full border-[3px] border-blanc transition-all duration-300 z-10 shadow-sm",
                            currentEra.dot,
                            isExpanded ? "scale-150" : "group-hover:scale-125",
                          )}
                        />
                        {!isLast && (
                          <div
                            className={clsx(
                              "w-px flex-1 min-h-[12px]",
                              currentEra.border.replace("border-", "bg-"),
                            )}
                          />
                        )}
                      </div>

                      {/* Event card */}
                      <div className="flex-1 pl-5 pb-6">
                        <button
                          onClick={() =>
                            setExpandedEvent(
                              isExpanded ? null : event.sortOrder,
                            )
                          }
                          className={clsx(
                            "w-full text-left rounded-xl transition-all duration-300 border bg-blanc",
                            isExpanded
                              ? clsx(currentEra.border, "shadow-md")
                              : "border-sable-2/60 shadow-sm hover:shadow-md hover:border-sable-2",
                          )}
                        >
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h3
                                  className={clsx(
                                    "font-serif text-lg sm:text-xl transition-colors",
                                    isExpanded ? "text-nuit" : "text-nuit/80",
                                  )}
                                >
                                  {event.title}
                                </h3>
                                <p
                                  className={clsx(
                                    "text-sm mt-0.5",
                                    currentEra.text,
                                    isExpanded ? "opacity-100" : "opacity-60",
                                  )}
                                >
                                  {event.subtitle}
                                </p>
                              </div>
                              <ChevronDown
                                className={clsx(
                                  "w-5 h-5 shrink-0 text-gris transition-transform duration-300 mt-1",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </div>

                            <div
                              className={clsx(
                                "overflow-hidden transition-all duration-500",
                                isExpanded
                                  ? "max-h-[400px] opacity-100 mt-4"
                                  : "max-h-0 opacity-0",
                              )}
                            >
                              <div className="border-t border-sable-2 pt-4">
                                <p className="text-gris leading-relaxed text-[15px]">
                                  {event.description}
                                </p>
                                {event.tags && event.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {event.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-sable text-gris border border-sable-2"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─── Era navigation ─── */}
        <div className="border-t border-sable-2">
          <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
            {prevEra ? (
              <button
                onClick={() => {
                  setActiveEra(prevEra.key);
                  setExpandedEvent(null);
                }}
                className="flex items-center gap-3 group"
              >
                <ChevronLeft className="w-5 h-5 text-gris group-hover:text-nuit transition-colors" />
                <div className="text-left">
                  <span className="block text-[10px] text-gris uppercase tracking-wider">
                    Ère précédente
                  </span>
                  <span className="block text-sm text-nuit/70 group-hover:text-nuit transition-colors font-medium">
                    {prevEra.label}
                  </span>
                </div>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5">
              {ERAS.map((era) => (
                <button
                  key={era.key}
                  title={era.label}
                  aria-label={era.label}
                  onClick={() => {
                    setActiveEra(era.key);
                    setExpandedEvent(null);
                  }}
                  className={clsx(
                    "h-2 rounded-full transition-all",
                    activeEra === era.key
                      ? clsx("w-6", era.dot)
                      : "w-2 bg-sable-2 hover:bg-gris/30",
                  )}
                />
              ))}
            </div>

            {nextEra ? (
              <button
                onClick={() => {
                  setActiveEra(nextEra.key);
                  setExpandedEvent(null);
                }}
                className="flex items-center gap-3 group"
              >
                <div className="text-right">
                  <span className="block text-[10px] text-gris uppercase tracking-wider">
                    Ère suivante
                  </span>
                  <span className="block text-sm text-nuit/70 group-hover:text-nuit transition-colors font-medium">
                    {nextEra.label}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gris group-hover:text-nuit transition-colors" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* ─── Chronological overview ─── */}
      <section className="border-t border-sable-2 bg-blanc">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl text-nuit mb-2">
              Chronologie complète
            </h2>
            <p className="text-gris text-sm">
              {events.length} événements majeurs jusqu&apos;en 2026
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ERAS.map((era) => {
              const eraEvents = eventsByEra[era.key] ?? [];
              const isActive = activeEra === era.key;
              return (
                <button
                  key={era.key}
                  onClick={() => {
                    setActiveEra(era.key);
                    setExpandedEvent(null);
                    panelRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={clsx(
                    "text-left rounded-xl p-4 border transition-all duration-300",
                    isActive
                      ? clsx(era.bg, era.border, "shadow-md")
                      : "bg-sable border-sable-2/60 hover:bg-sable/80 hover:border-sable-2 hover:shadow-sm",
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        era.bg,
                        era.border,
                        "border",
                      )}
                    >
                      <era.Icon
                        className={clsx("w-4 h-4", era.text)}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-nuit">
                        {era.label}
                      </span>
                      <span className="block text-[10px] text-gris">
                        {era.period}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {eraEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.sortOrder}
                        className="flex items-baseline gap-2"
                      >
                        <span className="text-[11px] font-mono text-gris-2 shrink-0 w-10">
                          {formatYear(e.year)}
                        </span>
                        <span className="text-xs text-gris truncate">
                          {e.title}
                        </span>
                      </div>
                    ))}
                    {eraEvents.length > 3 && (
                      <span className="text-[10px] text-gris-2 block pl-12">
                        +{eraEvents.length - 3} de plus
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
