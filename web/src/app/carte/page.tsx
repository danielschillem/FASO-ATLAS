import dynamic from 'next/dynamic'

// Leaflet requires client-side rendering — no SSR
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-72px)] mt-nav">
      <div className="w-10 h-10 border-2 border-rouge border-t-transparent rounded-full animate-spin" />
    </div>
  )}
)

export const metadata = {
  title: 'Carte interactive · Faso Atlas',
  description: 'Explorez le Burkina Faso sur la carte interactive — sites touristiques, hébergements, réserves naturelles et lieux culturels.',
}

export default function CartePage() {
  return <InteractiveMap />
}
