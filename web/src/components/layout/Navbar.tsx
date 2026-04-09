"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import {
  Heart,
  Shield,
  Globe,
  Menu,
  X,
  Search,
  User,
  Building2,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/carte", label: "Carte" },
  { href: "/destinations", label: "Destinations" },
  { href: "/routes-culturelles", label: "Routes culturelles" },
  { href: "/itineraires", label: "Itinéraires" },
  { href: "/reservation", label: "Réservation" },
  { href: "/location", label: "Location" },
  { href: "/atlas", label: "Atlas" },
  { href: "/wiki", label: "Wiki" },
  { href: "/symboles", label: "Symboles" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-nav glass border-b border-sable-2/80"
        role="banner"
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Faso Atlas — Accueil"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              className="sm:w-8 sm:h-8"
            >
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
            <span className="text-lg sm:text-xl font-bold text-nuit tracking-tight">
              Faso<span className="text-rouge">Atlas</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200",
                  pathname.startsWith(href)
                    ? "text-nuit bg-sable"
                    : "text-gris hover:text-nuit hover:bg-sable",
                )}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <LocaleSwitcher />

            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 border border-sable-2 rounded-full hover:shadow-card focus-visible:ring-2 focus-visible:ring-rouge/50 transition-all duration-200"
                >
                  <Menu className="w-4 h-4 text-gris" />
                  <span className="w-8 h-8 rounded-full bg-nuit flex items-center justify-center text-blanc text-sm font-bold">
                    {user?.firstName?.[0] ?? "U"}
                  </span>
                </button>

                {/* User dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-blanc rounded-xl shadow-modal border border-sable-2 py-2 z-50 animate-scale-in origin-top-right">
                      <div className="px-4 py-2 border-b border-sable-2">
                        <p className="text-sm font-semibold text-nuit">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gris">{user?.email}</p>
                      </div>
                      <Link
                        href="/compte"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-nuit hover:bg-sable transition-colors"
                      >
                        Mon compte
                      </Link>
                      <Link
                        href="/favoris"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-nuit hover:bg-sable transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Mes favoris
                      </Link>
                      {(user?.role === "owner" || user?.role === "admin") && (
                        <Link
                          href="/proprietaire"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-nuit hover:bg-sable transition-colors"
                        >
                          <Building2 className="w-4 h-4" />
                          Espace propriétaire
                        </Link>
                      )}
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-nuit hover:bg-sable transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Administration
                        </Link>
                      )}
                      <div className="border-t border-sable-2 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gris hover:bg-sable transition-colors"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-nuit hover:bg-sable px-4 py-2.5 rounded-full transition-all duration-200 active:scale-[0.97]"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:block px-4 py-2.5 bg-rouge hover:bg-rouge-dark text-blanc text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] hover:shadow-md"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              className="lg:hidden p-2 text-nuit hover:bg-sable rounded-full ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-nuit/40 backdrop-blur-sm" />
          <nav
            className="absolute top-nav right-0 w-full sm:w-80 bg-blanc border-l border-sable-2 h-[calc(100dvh-var(--nav-h))] p-4 sm:p-6 overflow-y-auto shadow-modal animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                    pathname.startsWith(href)
                      ? "text-rouge bg-rouge/5"
                      : "text-nuit hover:bg-sable",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-sable-2 space-y-2">
              {isAuthenticated() ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="w-10 h-10 rounded-full bg-nuit flex items-center justify-center text-blanc font-bold">
                      {user?.firstName?.[0] ?? "U"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-nuit">
                        {user?.firstName}
                      </p>
                      <p className="text-xs text-gris">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/favoris"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm text-nuit hover:bg-sable rounded-lg"
                  >
                    Mes favoris
                  </Link>
                  {(user?.role === "owner" || user?.role === "admin") && (
                    <Link
                      href="/proprietaire"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm text-nuit hover:bg-sable rounded-lg font-medium"
                    >
                      Espace propriétaire
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm text-nuit hover:bg-sable rounded-lg font-medium"
                    >
                      Administration
                    </Link>
                  )}
                  <Link
                    href="/compte"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm text-nuit hover:bg-sable rounded-lg"
                  >
                    Mon compte
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-gris hover:bg-sable rounded-lg"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm text-nuit hover:bg-sable rounded-lg"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block mx-4 py-3 bg-rouge text-blanc text-sm font-semibold rounded-lg text-center"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
