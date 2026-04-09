"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { wikiApi } from "@/lib/api";
import type { WikiArticle } from "@/types/models";
import { clsx } from "clsx";
import {
  BookOpen,
  Landmark,
  TrendingUp,
  Theater,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { useAds } from "@/hooks/useAds";
import { AdSidebar } from "@/components/ads";

/* ─────────────────────────────────────────────────────────────────────────
   ENCYCLOPÉDIE NATIONALE — Dossiers thématiques de référence
   Sources : données officielles INSD, rapport IDH PNUD, Banque Mondiale,
   archives nationales burkinabè, revues académiques (Journal of West African
   History, Politique africaine, etc.)
   ───────────────────────────────────────────────────────────────────────── */
const NATIONAL_DOSSIER = [
  {
    title: "Politique et institutions (1919-2026)",
    Icon: Landmark,
    lead: "Du premier État colonial de Haute-Volta (1919) à la Confédération des États du Sahel (2025), le Burkina Faso a traversé douze régimes politiques différents en 65 ans d'histoire postcoloniale : six républiques, huit coups d'État, et une insurrection populaire victorieuse le 31 octobre 2014.",
    points: [
      "1919-1960 — Haute-Volta coloniale : créée le 1er mars 1919, dissoute par la France le 5 septembre 1932 et répartie entre Côte d'Ivoire, Soudan français et Niger, la colonie est reconstituée le 4 septembre 1947 après mobilisation du Mogho Naaba Koom et des élites politiques. Elle accède à l'indépendance le 5 août 1960 sous Maurice Yaméogo, premier président.",
      "1966-1983 — trois constitutions, trois coups d'État : Lamizana (1966-1980) alterne régimes militaires et civils. Zerbo (1980-1982) suspend toutes les libertés. Ouédraogo (1982-1983) tente une normalisation, nommant Thomas Sankara Premier ministre en janvier 1983 avant de le faire arrêter en mai, précipitant la révolution du 4 août.",
      "1983-1987 — Révolution sankariste : le Conseil National de la Révolution (CNR) engage des réformes profondes. En quatre ans : 2,5 millions d'enfants vaccinés en 8 jours, taux de scolarisation doublé, 10 millions d'arbres plantés, autosuffisance céréalière atteinte. Assassinat de Sankara le 15 octobre 1987 par un commando dirigé par son compagnon Blaise Compaoré.",
      "1987-2014 — 27 ans de Compaoré : la Constitution de 1991 instaure un multipartisme formel. Le CDP gouverne sans partage malgré des élections régulières. Le Burkina devient médiateur des crises ivoiriennes (2001-2011) et maliennes. Mais la corruption s'installe et les institutions restent fragiles, comme le révèle l'affaire Norbert Zongo (1998).",
      "2014-2022 — rupture et démocratisation : l'insurrection du 31 octobre 2014 chasse Compaoré après que les Burkinabè aient brûlé l'Assemblée nationale pour bloquer la révision de l'article 37 (limitation des mandats). RSP dissous (2015). Kaboré élu en 2015 (53%), réélu en 2020 (57%). Coup de Damiba en janvier 2022, suivi du coup de Traoré en septembre 2022.",
      "2022-2026 — AES et souveraineté : le capitaine Ibrahim Traoré (34 ans) oriente le Burkina vers la rupture avec la France, le retrait de la CEDEAO, et la création de l'Alliance des États du Sahel (AES) avec Mali et Niger, transformée en Confédération en 2025.",
    ],
  },
  {
    title: "Économie, commerce et ressources naturelles",
    Icon: TrendingUp,
    lead: "Avec un PIB de 20,3 milliards USD (2023), un revenu par habitant de 840 USD et une population de 23,5 millions d'habitants, le Burkina Faso est la 10e économie de l'UEMOA. Paradoxal, ce pays figure dans le bas de l'IDH mondial (184e sur 193) tout en possédant les premières réserves aurifères d'Afrique de l'Ouest et une agriculture nourricière remarquablement diverse.",
    points: [
      "Or — première exportation : le Burkina produit 50 à 60 tonnes d'or par an (valeur : 3 milliards USD). Principales mines : Essakane (IAMGOLD, province de l'Oudalan, 14 t/an), Houndé (Endeavour Mining, 200 000 oz/an), Karma (West African Resources), Bissa-Bouly (Nordgold). Le nouveau code minier (2025) vise 30% de participation de l'État. L'orpaillage artisanal (garampan) mobilise 1 million de personnes.",
      "Coton — moteur rural : premier producteur africain de coton en 2003 avec 732 000 tonnes. La SOFITEX (70% de la filière), Faso Coton (Sud-Ouest) et SOCOMA (Est) encadrent 3,5 millions de paysans. La production est tombée à 300 000 tonnes en 2023 à cause de la crise sécuritaire dans la boucle du Mouhoun. Objectif de transformation locale en fils et tissu.",
      "Élevage — troisième producteur UEMOA : cheptel de 9 millions de bovins, 15 millions de caprins, 10 millions d'ovins. Exportation bétail sur pied vers Côte d'Ivoire, Ghana, Nigeria : 100 millions USD/an. Le marché de Pouytenga (province de Kouritenga) est le plus grand marché de bétail de l'Afrique de l'Ouest francophone avec 20 000 têtes par semaine.",
      "Corridors commerciaux : axe Ouagadougou-Abidjan (1 100 km, Port d'Abidjan), corridor Ouaga-Tema (1 050 km, Port de Tema, Ghana), axe Ouaga-Dakar (1 800 km). La voie ferrée Abidjan-Ouagadougou (1 174 km, inaugurée 1954) est gérée par la SITARAIL. Ces corridors drainent 80% des importations burkinabè (produits manufacturés, hydrocarbures, équipements).",
      "Finances et numérique : budget national 2024 de 3,1 milliards USD (dépenses) ; pression fiscale à 14% du PIB. Dette publique à 55% du PIB. Mobile money : 12 millions d'utilisateurs actifs (Orange Money, Moov Africa) ; 60 milliards FCFA de transactions par jour. Les transferts de la diaspora (Europe, Côte d'Ivoire, États-Unis) représentent 1,4 milliard USD par an, soit 7% du PIB.",
    ],
  },
  {
    title: "Culture, patrimoine et créations contemporaines",
    Icon: Theater,
    lead: "Pays de 60 ethnies, 70 langues et de civilisations millénaires, le Burkina Faso est reconnu comme l'une des capitales culturelles de l'Afrique subsaharienne. Son patrimoine n'est pas un héritage figé mais un organisme vivant, continuellement réinterprété par les artistes, les cinéastes, les griots et les artisans contemporains.",
    points: [
      "FESPACO (Festival Panafricain du Cinéma, 1969) : biennal depuis 1972, l'Étalon de Yennenga est la récompense cinématographique la plus convoitée d'Afrique. 350 films en compétition, 5 000 professionnels accrédités, 400 000 spectateurs. Lauréats emblématiques : Idrissa Ouédraogo (Tilai, 1990), Gaston Kaboré (Wend Kuuni, 1982), Apolline Traoré (Frontières, 2017). Le cinéma burkinabè produit 30 à 50 films/an.",
      "SIAO (Salon International de l'Artisanat de Ouagadougou, 1988) : biennal, 10 000 exposants de 60 pays. Artisans phares : bronziers de Ouagadougou (figurines à la cire perdue inspirées des masques ancestraux), tisserands de Koudougou (Faso Dan Fani — étoffe de la patrie, patronnée par Sankara), potières de Bankuy et forgerons de Dori.",
      "Masques sacrés : le pays Bwa (Dédougou), le pays Bobo-Fing, le pays Lobi et le pays Nuna conservent les plus riches traditions masquées d'Afrique de l'Ouest. Masques-planches Bwa (3 m de haut, représentant le serpent cosmogonique), masques-papillons (vie/mort), masques Do (association initiatique). Sortent lors des rites agraires, funèbres et d'initiation.",
      "Musiques vivantes : balafon (instrument à lames de calebasse, tradition Bwamu-Mandingue), kora des griots du Mouhoun, tam-tams cérémoniels. Musiques contemporaines : le reggae burkinabè de Bil Aka Kora et Victor Démé dépasse les frontières ; Floby (zouglou), Smockey (hip-hop engagé). Le Balafon de Bafing (Banfora) est candidat au patrimoine immatériel UNESCO.",
      "Faso Dan Fani — tissu national : tissu de coton à bandes multicolores tissé sur métier traditionnel (kpelen). Imposé par Sankara aux fonctionnaires comme acte de souveraineté économique, il mobilise 30 000 familles de tisserands du Centre-Ouest. Exporté vers l'Europe (marchés bio-éthiques) et la diaspora. Symbole vivant d'une philosophie économique : «consommons ce que nous produisons».",
    ],
  },
  {
    title: "Crise sécuritaire et cohésion sociale",
    Icon: ShieldAlert,
    lead: "La crise sécuritaire burkinabè (depuis 2015) est la plus grave de l'histoire postcoloniale du pays. De 2016 à 2024, plus de 20 000 civils et combattants ont perdu la vie, 2,1 millions de personnes ont été déplacées, 6 000 écoles et 200 centres de santé ont fermé. Cette crise révèle des fractures structurelles — pauvreté, marginalisation des zones pastorales, emprise des réseaux jihadistes — mais aussi une résilience exceptionnelle des communautés.",
    points: [
      "Chronologie : 2015 (premières attaques GSIM/JNIM au Sahel, nord), 2016 (attentat Splendid Hotel/Cappuccino Ouagadougou : 30 morts), 2018-2019 (extension à l'Est, Centre-Nord), 2021 (massacre de Solhan, 160 civils tués — le plus meurtrier de l'histoire burkinabè), 2022 (sièges de Djibo et Titao), 2023 (attaque de Karma, 50 morts), 2024 (front du Centre-Ouest).",
      "Acteurs armés : Groupe de Soutien à l'Islam et aux Musulmans (GSIM/JNIM, affilié AQMI, dirigé par Iyad Ag Ghaly) et État Islamique au Grand Sahara (EIGS). Ces groupes exploitent les tensions ethniques (Peuls vs agriculteurs), le banditisme résiduel, le vide de l'État dans les zones enclavées, et les griefs sociaux des communautés marginalisées.",
      "Forces de défense : les Forces Armées Nationales du Burkina Faso (FANBF), les Volontaires pour la Défense de la Patrie (VDP — 60 000 civils armés, loi janvier 2020), et depuis 2023 des éléments d'Africa Corps (ex-Wagner, Russia). Des allégations de violations des droits humains ont été documentées par HRW et Amnesty dans certaines opérations.",
      "Parenté à plaisanterie — bouclier social : entre ethnies voisines (Mossi-Bissa, Dioula-Bobo, Peuls-Dogons), ce mécanisme ancestral d'«insultes affectueuses» cède la place à l'entraide réelle en temps de crise. Les déplacés sont accueillis dans les familles, les marchés partagés, les puits ouverts. Ce tissu communautaire reste le premier filet de protection sociale.",
      "Populations déplacées : 2,1 millions d'IDP (Internally Displaced Persons) en 2024, dont 60% d'enfants et de femmes. Concentrés à Ouagadougou (300 000), Dori, Kaya, Kongoussi, Titao. 300 sites formels et informels. L'UNHCR, le PAM et les ONG nationales (ASMADE, SOS Sahel) coordonnent une réponse sous-financée (50% des besoins couverts).",
    ],
  },
  {
    title: "Éducation, savoirs et gouvernance",
    Icon: GraduationCap,
    lead: "Avec un taux d'alphabétisation de 46% (2023), le Burkina Faso compte encore 10 millions d'adultes non alphabétisés. Pourtant, depuis l'indépendance, d'immenses progrès ont été réalisés : taux de scolarisation primaire passé de 6% en 1960 à 22% sous Sankara (1987) puis à 85% en 2019 — avant de reculer à 68% en 2023 à cause des fermetures d'écoles dans les zones d'insécurité.",
    points: [
      "Système éducatif national : 15 000 écoles primaires (dont 30% privées/communautaires), 3 000 collèges-lycées, 5 universités publiques (Université Thomas-Sankara — ex-Ouaga I, Université Nazi Boni de Bobo-Dioulasso, Université Norbert-Zongo de Koudougou, Université Joseph-Ki-Zerbo, Université de Dédougou) et 120+ établissements supérieurs privés. 400 000 bacheliers par an.",
      "Langues et éducation bilingue : le français reste langue officielle d'enseignement. 500 écoles bilingues (français + mooré, dioula ou fulfuldé) montrent de meilleurs résultats aux évaluations de lecture et mathématiques. Le débat national sur l'introduction des langues nationales au baccalauréat gagne du terrain.",
      "Recherche nationale : l'IRSS (Institut de Recherche en Sciences de la Santé) mène des travaux reconnus mondialement sur le paludisme (essais de vaccin RTS,S), la méningite (protocoles OMS), la drépanocytose. L'INERA (agriculture) développe des variétés de maïs et sorgho résistantes à la sécheresse. Le CEDRES (économie) alimente les politiques publiques budgétaires.",
      "Radios communautaires — premier média : 200 radios locales diffusent en mooré, dioula, fulfuldé, bwamu, gourmantché des informations sanitaires, agricoles, judiciaires et civiques. Pour 80% des Burkinabè, la radio reste le premier média d'information, loin devant la télévision (40%) et internet (25%). La RNB (Radio Nationale du Burkina) émet en 12 langues.",
      "Gouvernance locale : 351 communes (dont 49 urbaines), 13 régions, 45 provinces, 350 départements. Le Code général des collectivités territoriales (1998, révisé 2004) transfère des compétences éducatives, sanitaires et infrastructurelles aux communes. Mais les ressources financières locales restent limitées à 5% des dépenses publiques totales. La décentralisation reste incomplète.",
    ],
  },
];

export function WikiLayout() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch all articles (unfiltered) to derive categories dynamically
  const { data: allData } = useQuery<{ data: WikiArticle[] }>({
    queryKey: ["wiki-articles-all"],
    queryFn: async () => {
      const res = await wikiApi.listArticles();
      return res.data;
    },
  });

  const categories = useMemo(() => {
    const allArticles = allData?.data ?? [];
    const unique = Array.from(
      new Set(allArticles.map((a) => a.category).filter(Boolean)),
    );
    return unique.sort();
  }, [allData]);

  const { data } = useQuery<{ data: WikiArticle[] }>({
    queryKey: ["wiki-articles", activeCategory],
    queryFn: async () => {
      const res = await wikiApi.listArticles({
        category: activeCategory || undefined,
      });
      return res.data;
    },
  });

  const { data: article } = useQuery<WikiArticle>({
    queryKey: ["wiki-article", selectedSlug],
    queryFn: async () => {
      const res = await wikiApi.getArticle(selectedSlug!);
      return res.data;
    },
    enabled: !!selectedSlug,
  });

  const articles = data?.data ?? [];

  const { data: sidebarAds } = useAds("sidebar", "wiki", 1);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-blanc pt-nav">
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-sable rounded-lg text-sm font-medium text-nuit"
        >
          <BookOpen className="w-4 h-4" />
          {sidebarOpen ? "Masquer le menu" : "Afficher le menu"}
        </button>

        {/* Sidebar */}
        <aside
          className={clsx(
            "w-full md:w-64 md:shrink-0",
            sidebarOpen ? "block" : "hidden md:block",
          )}
        >
          <div className="sticky top-24">
            <h2 className="font-serif text-xl text-nuit mb-6">Wiki Faso</h2>
            <p className="text-xs text-gris mb-4">Encyclopédie collaborative</p>

            {categories.map((cat) => (
              <div key={cat} className="mb-4">
                <button
                  onClick={() =>
                    setActiveCategory(cat === activeCategory ? null : cat)
                  }
                  className={clsx(
                    "w-full text-left text-sm font-medium py-2 px-3 rounded transition-colors",
                    activeCategory === cat
                      ? "text-rouge bg-sable"
                      : "text-nuit hover:bg-sable",
                  )}
                >
                  {cat}
                </button>
              </div>
            ))}

            {/* Article list */}
            {articles.length > 0 && (
              <div className="mt-4 border-t border-sable-2 pt-4">
                {articles.map((a) => (
                  <button
                    key={a.slug}
                    onClick={() => setSelectedSlug(a.slug)}
                    className={clsx(
                      "w-full text-left text-sm py-1.5 px-3 rounded transition-colors",
                      selectedSlug === a.slug
                        ? "text-rouge font-medium"
                        : "text-gris hover:text-nuit",
                    )}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            )}

            {/* Ad Sidebar */}
            {sidebarAds?.[0] && (
              <div className="mt-6">
                <AdSidebar ad={sidebarAds[0]} />
              </div>
            )}
          </div>
        </aside>

        {/* Article content */}
        <main className="flex-1 min-w-0">
          {article ? (
            <article>
              <header className="border-b border-sable-2 pb-6 mb-8">
                <span className="text-xs text-gris uppercase tracking-wider">
                  {article.category}
                </span>
                <h1 className="font-serif text-4xl text-nuit mt-2">
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p className="text-lg text-terre mt-1">{article.subtitle}</p>
                )}
                <p className="text-gris mt-3 leading-relaxed">
                  {article.leadText}
                </p>
              </header>

              {/* Infobox */}
              {article.infoboxData &&
                Object.keys(article.infoboxData).length > 0 && (
                  <div className="w-full sm:float-right sm:ml-6 mb-6 sm:w-64 border border-sable-2 rounded-card overflow-hidden">
                    <div className="bg-sable px-4 py-2 border-b border-sable-2">
                      <span className="text-xs font-medium text-terre uppercase tracking-wider">
                        {article.title}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.entries(article.infoboxData).map(
                          ([key, val]) => (
                            <tr key={key} className="border-b border-sable-2">
                              <td className="px-3 py-2 font-medium text-nuit bg-sable/50 w-1/2">
                                {key}
                              </td>
                              <td className="px-3 py-2 text-gris">{val}</td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              <div
                className="wiki-body prose max-w-none clear-both"
                dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
              />

              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-sable-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-sable text-terre text-xs rounded-pill"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-sable rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-terre" />
              </div>
              <h2 className="font-serif text-2xl text-nuit mb-2">Wiki Faso</h2>
              <p className="text-gris max-w-2xl mx-auto mb-10">
                Base encyclopédique locale: repères historiques, politiques,
                économiques, commerciaux, culturels et sociaux du Burkina Faso
                jusqu&apos;en 2026.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
                {NATIONAL_DOSSIER.map(({ title, lead, points, Icon }) => (
                  <section
                    key={title}
                    className="border border-sable-2 rounded-card bg-blanc p-6"
                  >
                    <h3 className="font-semibold text-nuit mb-3 flex items-center gap-2 text-base">
                      <Icon className="w-4 h-4 text-rouge shrink-0" />
                      {title}
                    </h3>
                    <p className="text-sm text-terre leading-relaxed mb-4 border-l-2 border-rouge/30 pl-3 italic">
                      {lead}
                    </p>
                    <ul className="space-y-2.5">
                      {points.map((point) => (
                        <li
                          key={point}
                          className="text-sm text-gris leading-relaxed flex gap-2"
                        >
                          <span className="text-rouge mt-1 shrink-0 text-xs">
                            ▸
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
