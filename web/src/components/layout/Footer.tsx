import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

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
      { href: "/routes-culturelles", label: "Routes culturelles" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/reservation", label: "Réserver un séjour" },
      { href: "/location", label: "Location de voiture" },
      { href: "/register", label: "Enregistrer un établissement" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-nuit text-blanc/80" role="contentinfo">
      {/* Gradient bar top */}
      <div className="gradient-bar" />

      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Logo variant="full" size={32} dark />
            </div>
            <p className="text-sm text-blanc/50 leading-relaxed mb-6">
              Découvrez le Burkina Faso — destinations, patrimoine et culture du
              Pays des Hommes Intègres.
            </p>
            <div className="flex gap-2">
              <div className="w-6 h-4 rounded-sm bg-rouge" />
              <div className="w-6 h-4 rounded-sm bg-or" />
              <div className="w-6 h-4 rounded-sm bg-vert" />
            </div>
          </div>

          {/* Navigation columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-blanc font-bold text-sm mb-5 tracking-wide uppercase">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-blanc/40 hover:text-blanc transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-blanc/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-blanc/30">
          <span>
            © {new Date().getFullYear()} Faso Trip. Tous droits réservés.
          </span>
          <span className="flex items-center gap-2">
            Fait avec fierté pour le Burkina Faso
            <span className="inline-flex gap-0.5">
              <span className="w-3 h-2 rounded-sm bg-rouge" />
              <span className="w-3 h-2 rounded-sm bg-or" />
              <span className="w-3 h-2 rounded-sm bg-vert" />
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
