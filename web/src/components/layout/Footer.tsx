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
    <footer className="bg-sable border-t border-sable-2" role="contentinfo">
      <div className="max-w-container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle
                  cx="16"
                  cy="16"
                  r="15"
                  stroke="#E63946"
                  strokeWidth="1.5"
                />
                <rect x="8" y="12" width="16" height="2" fill="#E63946" />
                <rect x="8" y="18" width="16" height="2" fill="#008751" />
                <polygon points="16,6 18,11 16,10 14,11" fill="#F0B429" />
              </svg>
              <span className="text-lg font-bold text-nuit">
                Faso<span className="text-rouge">Atlas</span>
              </span>
            </div>
            <p className="text-sm text-gris leading-relaxed">
              La plateforme de référence pour explorer le tourisme, le
              patrimoine et la culture du Burkina Faso.
            </p>
            <div className="flex mt-4 rounded overflow-hidden w-10 h-6 border border-sable-2">
              <div className="flex-1 bg-rouge" />
              <div className="flex-1 bg-vert" />
            </div>
          </div>

          {/* Navigation columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-nuit font-semibold text-sm mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gris hover:text-nuit hover:underline transition-all duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-sable-2 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gris">
          <span>
            © {new Date().getFullYear()} Faso Atlas. Tous droits réservés.
          </span>
          <span className="flex items-center gap-1">
            Fait avec fierté pour le Burkina Faso
            <span className="inline-flex ml-1 rounded overflow-hidden w-5 h-3 align-middle border border-sable-2">
              <span className="flex-1 bg-rouge" />
              <span className="flex-1 bg-vert" />
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
