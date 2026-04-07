"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const NAV_LINKS = [
  { href: "/carte", label: "Carte" },
  { href: "/destinations", label: "Destinations" },
  { href: "/itineraires", label: "Itinéraires" },
  { href: "/reservation", label: "Réservation" },
  { href: "/atlas", label: "Atlas historique" },
  { href: "/wiki", label: "Wiki Faso" },
  { href: "/symboles", label: "Symboles" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-nav bg-nuit/95 backdrop-blur-sm border-b border-white/5"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="Faso Atlas — Accueil"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#D4A017" strokeWidth="1.5" />
            <rect x="8" y="12" width="16" height="2" fill="#C1272D" />
            <rect x="8" y="18" width="16" height="2" fill="#006B3C" />
            <polygon points="16,6 18,11 16,10 14,11" fill="#F0B429" />
          </svg>
          <span className="font-serif text-xl text-blanc tracking-wide">
            Faso <span className="text-or">Atlas</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-2 text-sm font-medium rounded transition-colors duration-200",
                pathname.startsWith(href)
                  ? "text-or-vif bg-white/5"
                  : "text-sable-2 hover:text-blanc hover:bg-white/5",
              )}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated() ? (
            <>
              <Link
                href="/compte"
                className="text-sm text-sable-2 hover:text-blanc transition-colors"
              >
                {user?.firstName}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gris hover:text-blanc transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-sable-2 hover:text-blanc transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-rouge hover:bg-rouge/90 text-blanc text-sm font-medium rounded transition-colors"
              >
                Planifier
              </Link>
            </>
          )}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
