"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  MapPin,
  BookOpen,
  Megaphone,
  ArrowLeft,
} from "lucide-react";
import { clsx } from "clsx";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/lieux", label: "Lieux", icon: MapPin },
  { href: "/admin/wiki", label: "Wiki", icon: BookOpen },
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

  useEffect(() => {
    if (!isAuthenticated() || user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated() || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen pt-nav bg-blanc flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-nuit border-r border-white/5 min-h-[calc(100vh-var(--nav-h))]">
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
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
