import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { QueryProvider } from '@/components/layout/QueryProvider'

export const metadata: Metadata = {
  title: 'Faso Atlas — Tourisme & Patrimoine du Burkina Faso',
  description: 'Explorez les destinations, l\'histoire et la culture du Burkina Faso. Carte interactive, Atlas historique, Wiki Faso et réservations.',
  keywords: 'Burkina Faso, tourisme, voyage, Ouagadougou, Bobo-Dioulasso, Nazinga, atlas, wiki',
  openGraph: {
    title: 'Faso Atlas',
    description: 'Découvrez le Pays des Hommes Intègres',
    locale: 'fr_BF',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <QueryProvider>
          <Navbar />
          <GlobalSearch />
          <main>{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  )
}
