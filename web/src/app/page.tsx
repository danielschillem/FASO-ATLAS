import Link from 'next/link'

const STATS = [
  { value: '45+',  label: 'Sites touristiques' },
  { value: '13',   label: 'Régions' },
  { value: '320+', label: 'Établissements' },
  { value: '60+',  label: 'Ethnies' },
]

const MODULES = [
  { href: '/carte',        title: 'Carte interactive',   desc: 'Explorez le Burkina Faso avec des pins GPS réels sur les 13 régions.',     color: '#C1272D' },
  { href: '/destinations', title: 'Destinations',        desc: 'Sites UNESCO, réserves naturelles, marchés et lieux culturels.',           color: '#006B3C' },
  { href: '/itineraires',  title: 'Itinéraires',         desc: 'Planifiez votre voyage de 5 à 10 jours avec des guides certifiés.',        color: '#D4A017' },
  { href: '/reservation',  title: 'Réservations',        desc: 'Hôtels, gîtes et restaurants avec tarifs en FCFA.',                       color: '#7C3B1E' },
  { href: '/atlas',        title: 'Atlas historique',    desc: 'Des royaumes Mossi à la révolution Sankara — 5 grandes ères.',            color: '#C1272D' },
  { href: '/wiki',         title: 'Wiki Faso',           desc: 'Encyclopédie collaborative — peuples, arts, géographie, culture.',         color: '#006B3C' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-nuit">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-110 animate-[zoom_22s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-nuit/60 via-nuit/40 to-nuit" />
        <div className="absolute inset-0 bg-pattern-geo" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-nav text-center">
          <span className="inline-block px-4 py-1.5 bg-or/20 border border-or/30 rounded-pill text-or text-sm mb-6 tracking-wide">
            Pays des Hommes Intègres
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-blanc leading-tight mb-6">
            Découvrez le
            <br />
            <span className="text-or">Burkina Faso</span>
          </h1>
          <p className="text-sable-2 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme de référence pour explorer les destinations, le patrimoine historique et la culture burkinabè.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/carte"
              className="px-8 py-3.5 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors"
            >
              Explorer la carte
            </Link>
            <Link
              href="/atlas"
              className="px-8 py-3.5 border border-or/50 hover:border-or text-sable hover:text-blanc font-medium rounded transition-colors"
            >
              Atlas historique
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-serif text-3xl text-or-vif font-bold">{value}</div>
                <div className="text-sable-2 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="bg-blanc py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-rouge text-sm font-medium uppercase tracking-widest">Tout dans une plateforme</span>
            <h2 className="font-serif text-4xl text-nuit mt-3">Explorer Faso Atlas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(({ href, title, desc, color }) => (
              <Link
                key={href}
                href={href}
                className="group p-6 bg-sable rounded-card shadow-card hover:shadow-faso border border-sable-2 hover:border-or/30 transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-full mb-4 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: color + '20', border: `2px solid ${color}30` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <h3 className="font-serif text-xl text-nuit mb-2 group-hover:text-rouge transition-colors">{title}</h3>
                <p className="text-sm text-gris leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
