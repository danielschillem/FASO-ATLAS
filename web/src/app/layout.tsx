import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { I18nProvider } from "@/components/layout/I18nProvider";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Faso Atlas — Tourisme & Patrimoine du Burkina Faso",
    template: "%s · Faso Atlas",
  },
  description:
    "Explorez les destinations, l'histoire et la culture du Burkina Faso. Carte interactive, Atlas historique, Wiki Faso et réservations.",
  keywords:
    "Burkina Faso, tourisme, voyage, Ouagadougou, Bobo-Dioulasso, Nazinga, atlas, wiki",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fasoatlas.bf",
  ),
  openGraph: {
    title: "Faso Atlas — Découvrez le Burkina Faso",
    description:
      "La plateforme de référence pour explorer les destinations, le patrimoine historique et la culture du Pays des Hommes Intègres.",
    locale: "fr_BF",
    type: "website",
    siteName: "Faso Atlas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faso Atlas",
    description: "Découvrez le Pays des Hommes Intègres",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${sansFont.variable} ${serifFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Faso Atlas",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://fasoatlas.bf",
              description:
                "Plateforme de référence pour le tourisme et le patrimoine du Burkina Faso.",
              inLanguage: "fr",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fasoatlas.bf"}/destinations?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-rouge focus:text-blanc focus:rounded"
        >
          Aller au contenu principal
        </a>
        <QueryProvider>
          <I18nProvider>
            <Navbar />
            <GlobalSearch />
            <main id="main-content">{children}</main>
            <Footer />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
