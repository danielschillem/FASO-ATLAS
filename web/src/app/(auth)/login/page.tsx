"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      router.push("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
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
          </div>
          <h1 className="font-serif text-3xl text-nuit">Connexion</h1>
          <p className="text-gris mt-2 text-sm">
            Accédez à votre espace Faso Atlas
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-sable border border-sable-2 rounded-card p-6 shadow-card space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@example.com"
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
            />
          </div>

          {error && <p className="text-rouge text-sm">{error}</p>}

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-gris hover:text-rouge transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gris">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-rouge hover:underline font-medium"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
