"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  MapPin,
  BookOpen,
  Megaphone,
  Building2,
  Route,
  CalendarCheck,
  Car,
  Globe,
  Shapes,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { clsx } from "clsx";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/lieux", label: "Lieux", icon: MapPin },
  { href: "/admin/etablissements", label: "Établissements", icon: Building2 },
  { href: "/admin/itineraires", label: "Itinéraires", icon: Route },
  { href: "/admin/reservations", label: "Réservations", icon: CalendarCheck },
  { href: "/admin/location", label: "Location", icon: Car },
  { href: "/admin/regions", label: "Régions", icon: Globe },
  { href: "/admin/wiki", label: "Wiki", icon: BookOpen },
  { href: "/admin/symboles", label: "Symboles", icon: Shapes },
  { href: "/admin/publicites", label: "Publicités", icon: Megaphone },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated() || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen pt-nav bg-blanc lg:flex">
      {/* Mobile admin header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-nuit border-b border-white/5">
        <p className="text-or text-xs font-medium uppercase tracking-widest">
          Administration
        </p>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-blanc p-1"
          aria-label="Menu admin"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-nuit/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-full w-56 bg-nuit border-r border-white/5 pt-nav transition-transform duration-200 lg:static lg:translate-x-0 lg:min-h-[calc(100vh-var(--nav-h))] lg:shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4">
          <p className="text-or text-xs font-medium uppercase tracking-widest mb-6">
            Administration
          </p>
          <nav className="space-y-1">
            {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-or/10 text-or"
                      : "text-sable-2/70 hover:text-blanc hover:bg-white/5",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 pt-6 border-t border-white/10">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-gris hover:text-blanc transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour au site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
