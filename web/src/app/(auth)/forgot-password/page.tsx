"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-nuit">Mot de passe oublié</h1>
          <p className="text-gris mt-2 text-sm">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="bg-vert/5 border border-vert/20 rounded-card p-6 text-center">
            <div className="mb-3 flex justify-center">
              <Mail className="w-8 h-8 text-vert" />
            </div>
            <h2 className="font-serif text-xl text-nuit mb-2">Email envoyé</h2>
            <p className="text-gris text-sm">
              Si un compte existe avec l&#39;adresse{" "}
              <strong className="text-nuit">{email}</strong>, vous recevrez un
              lien de réinitialisation.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-rouge hover:underline text-sm font-medium"
            >
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-sable border border-sable-2 rounded-card p-6 shadow-card space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-nuit block mb-1">
                Adresse email
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

            {error && <p className="text-rouge text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors disabled:opacity-60"
            >
              {loading ? "Envoi…" : "Envoyer le lien"}
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
        )}
      </div>
    </div>
  );
}
