import Link from "next/link";

const COLUMNS = [
  {
    title: "Découvrir",
    links: [
      { href: "/carte", label: "Carte interactive" },
      { href: "/destinations", label: "Destinations" },
      { href: "/itineraires", label: "Itinéraires" },
      { href: "/symboles", label: "Symboles culturels" },
    ],
  },
  {
    title: "Savoir",
    links: [
      { href: "/atlas", label: "Atlas historique" },
      { href: "/wiki", label: "Wiki Faso" },
    ],
  },
  {
    title: "Partenaires",
    links: [
      { href: "/reservation", label: "Réserver un séjour" },
      { href: "/register", label: "Enregistrer mon établissement" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-nuit text-sable-2 pt-16 pb-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle
                  cx="16"
                  cy="16"
                  r="15"
                  stroke="#D4A017"
                  strokeWidth="1.5"
                />
                <rect x="8" y="12" width="16" height="2" fill="#C1272D" />
                <rect x="8" y="18" width="16" height="2" fill="#006B3C" />
                <polygon points="16,6 18,11 16,10 14,11" fill="#F0B429" />
              </svg>
              <span className="font-serif text-lg text-blanc">
                Faso <span className="text-or">Atlas</span>
              </span>
            </div>
            <p className="text-sm text-gris leading-relaxed">
              La plateforme de référence pour explorer le tourisme, le
              patrimoine et la culture du Burkina Faso.
            </p>
            {/* Mini flag */}
            <div className="flex mt-4 rounded overflow-hidden w-10 h-6 border border-white/10">
              <div className="flex-1 bg-rouge" />
              <div className="flex-1 bg-vert" />
            </div>
          </div>

          {/* Navigation columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-blanc font-medium text-sm mb-4 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gris hover:text-sable transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gris">
          <span>
            © {new Date().getFullYear()} Faso Atlas. Tous droits réservés.
          </span>
          <span>Fait avec fierté pour le Burkina Faso 🇧🇫</span>
        </div>
      </div>
    </footer>
  );
}
