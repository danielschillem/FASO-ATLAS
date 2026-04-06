'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Suspense } from 'react'

function RegisterForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const setAuth      = useAuthStore((s) => s.setAuth)
  const defaultRole  = searchParams.get('role') ?? 'tourist'

  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [role,      setRole]      = useState(defaultRole)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true); setError('')
    try {
      const res = await authApi.register({ email, password, firstName, lastName, role })
      setAuth(res.data.user, res.data.accessToken)
      router.push('/')
    } catch {
      setError('Cet email est déjà utilisé ou une erreur s\'est produite.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-nav bg-blanc flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-nuit">Créer un compte</h1>
          <p className="text-gris mt-2 text-sm">Rejoignez la communauté Faso Atlas</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-sable border border-sable-2 rounded-card p-6 shadow-card space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'tourist', label: '🧳 Voyageur' },
              { value: 'owner',   label: '🏨 Propriétaire' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`py-2.5 rounded text-sm font-medium border transition-colors ${
                  role === value
                    ? 'bg-rouge text-blanc border-rouge'
                    : 'bg-blanc text-nuit border-sable-2 hover:border-or/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-nuit block mb-1">Prénom *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-nuit block mb-1">Nom</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-nuit block mb-1">Mot de passe *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              placeholder="8 caractères minimum"
              className="w-full px-3 py-2.5 border border-sable-2 rounded bg-blanc text-nuit focus:outline-none focus:border-or text-sm" />
          </div>

          {error && <p className="text-rouge text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-rouge hover:bg-rouge/90 text-blanc font-medium rounded transition-colors disabled:opacity-60">
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gris">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-rouge hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
