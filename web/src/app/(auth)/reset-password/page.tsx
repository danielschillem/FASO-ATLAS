"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 10) {
      setError("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch {
      setError("Lien invalide ou expiré. Veuillez refaire une demande.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-rouge/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C1272D"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl text-nuit mb-2">Lien invalide</h1>
          <p className="text-gris text-sm mb-6">
            Aucun token de réinitialisation trouvé. Veuillez refaire une
            demande.
          </p>
          <Link
            href="/forgot-password"
            className="px-5 py-2.5 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors"
          >
            Mot de passe oublié
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-vert/5 border border-vert/20 rounded-card p-6">
            <div className="mb-3 flex justify-center">
              <CheckCircle className="w-8 h-8 text-vert" />
            </div>
            <h2 className="font-serif text-xl text-nuit mb-2">
              Mot de passe réinitialisé
            </h2>
            <p className="text-gris text-sm">
              Votre mot de passe a été mis à jour avec succès.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-6 px-5 py-2.5 bg-rouge text-blanc text-sm font-medium rounded hover:bg-rouge/90 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-nuit">
            Nouveau mot de passe
          </h1>
          <p className="text-gris mt-2 text-sm">
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-sable border border-sable-2 rounded-card p-6 shadow-card space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={10}
              placeholder="Min. 10 caractères, 1 majuscule, 1 chiffre, 1 spécial"
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Retapez le mot de passe"
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm"
            />
          </div>

          {error && <p className="text-rouge text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors disabled:opacity-60"
          >
            {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
          </button>

          <p className="text-center text-sm text-gris">
            <Link
              href="/login"
              className="text-rouge hover:underline font-medium"
            >
              ← Retour à la connexion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center">
          <div className="animate-pulse text-gris">Chargement…</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
