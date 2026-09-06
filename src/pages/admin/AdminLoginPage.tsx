import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import { Button, Field, Input, Spinner } from '../../components/ui'
import { authApi } from '../../services/auth'
import { audit } from '../../services/audit'

/** Page de connexion à l'espace d'administration (route /admin/login).
 *  Compte de démonstration : admin@jsb2027.org / jsb2027. */
export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Déjà connecté → direction le tableau de bord.
  if (authApi.session()) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse e-mail.')
      return
    }
    if (!password) {
      setError('Veuillez renseigner votre mot de passe.')
      return
    }

    setLoading(true)
    try {
      const result = await authApi.login(email, password)
      if (result.ok && result.user) {
        await audit('auth_login', 'user', result.user.id, { email: result.user.email })
        navigate('/admin', { replace: true })
        return
      }
      setError(result.error ?? 'Connexion impossible. Veuillez réessayer.')
    } catch {
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-forest-900 via-forest-700 to-forest-500 px-4 py-12">
      {/* Décor doré discret */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-gold-300/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-500 font-serif text-base font-bold text-gold-400">
              JSB
            </span>
          </div>
          <h1 className="mt-4 text-center font-serif text-2xl font-bold text-forest-500">
            Espace administration
          </h1>
          <p className="mt-1 text-center text-sm text-forest-700/60">
            Journée des Sciences Biologiques — JSB 2027
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <Field label="Adresse e-mail" required>
              <Input
                type="email"
                autoComplete="email"
                placeholder="admin@jsb2027.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </Field>

            <Field label="Mot de passe" required>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-forest-100 bg-forest-50 px-3 py-2.5 text-xs text-forest-700/80">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" />
            <p>
              <span className="font-semibold text-forest-700">Compte de démonstration :</span>{' '}
              admin@jsb2027.org — mot de passe : jsb2027
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
          <p className="text-xs text-white/50">
            Fondation École Ké Bien — École Ké Futa (EKBF)
          </p>
        </div>
      </div>
    </div>
  )
}
