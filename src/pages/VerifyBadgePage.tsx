/**
 * Page publique de vérification d'un badge (route /verify/:token).
 * N'affiche QUE les informations minimales de contrôle (nom, catégorie,
 * référence, édition) — jamais de téléphone, e-mail ou projet.
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, LoadingState } from '../components/ui'
import { badgeCategoryMeta, findBadgeByToken, qrDataUrl } from '../features/badges/badgeService'
import { formatDateFr } from '../utils/helpers'
import { eventSettings } from '../config/event'
import type { BadgeDoc } from '../types'

export default function VerifyBadgePage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [badge, setBadge] = useState<BadgeDoc | null>(null)
  const [qr, setQr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        if (!token) {
          setBadge(null)
          return
        }
        const found = await findBadgeByToken(token)
        if (cancelled) return
        setBadge(found)
        if (found && found.status === 'ACTIVE') {
          try {
            const data = await qrDataUrl(`${window.location.origin}/verify/${token}`)
            if (!cancelled) setQr(data)
          } catch {
            /* QR code non généré — la vérification reste valide. */
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  const meta = badge ? badgeCategoryMeta[badge.category] : null

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {loading ? (
        <LoadingState label="Vérification du badge…" />
      ) : !badge ? (
        <Card className="border-red-200 bg-red-50 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-9 w-9 text-red-600" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-red-700">Badge introuvable</h1>
          <p className="mt-2 text-sm text-red-700/80">
            Aucun badge correspondant à ce code de vérification.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-forest-500 px-6 py-2.5 text-sm font-semibold text-forest-500 transition hover:bg-forest-50"
            >
              ← Retour au site
            </Link>
          </div>
        </Card>
      ) : badge.status === 'REVOKED' ? (
        <Card className="border-red-200 bg-red-50 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-9 w-9 text-red-600" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-red-700">Ce badge a été révoqué.</h1>
          <p className="mt-2 text-sm text-red-700/80">
            Ce badge n’est plus valide pour la JSB 2027.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-forest-500 px-6 py-2.5 text-sm font-semibold text-forest-500 transition hover:bg-forest-50"
            >
              ← Retour au site
            </Link>
          </div>
        </Card>
      ) : (
        <div>
          <Card className="overflow-hidden p-0">
            {/* Bandeau vert de validation */}
            <div className="border-b-4 border-double border-gold-400 bg-forest-500 px-6 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/25">
                <CheckCircle2 className="h-8 w-8 text-emerald-300" />
              </div>
              <h1 className="mt-3 font-serif text-3xl font-bold text-white">Badge valide</h1>
              <p className="mt-1 text-sm text-forest-100">Ce badge est actif et authentifié.</p>
            </div>

            {/* Informations minimales */}
            <div className="divide-y divide-forest-100 px-6 sm:px-8">
              <div className="flex items-start gap-4 py-4">
                <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                  Titulaire
                </span>
                <p className="font-serif text-lg font-bold text-forest-800">{badge.fullName}</p>
              </div>

              <div className="flex items-center gap-4 py-4">
                <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                  Catégorie
                </span>
                {meta && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-sm font-semibold text-forest-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.bg}`} />
                    {meta.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 py-4">
                <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                  Référence
                </span>
                <p className="font-mono text-sm text-forest-700">{badge.reference}</p>
              </div>

              <div className="flex items-center gap-4 py-4">
                <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                  Édition
                </span>
                <p className="text-sm font-medium text-forest-700">
                  JSB 2027 · {eventSettings.edition}
                </p>
              </div>

              <div className="flex items-center gap-4 py-4">
                <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                  Émis le
                </span>
                <p className="text-sm text-forest-700/80">{formatDateFr(badge.createdAt)}</p>
              </div>
            </div>
          </Card>

          {/* QR code de contrôle */}
          <div className="mt-6 flex flex-col items-center gap-2">
            {qr ? (
              <img
                src={qr}
                alt="QR code de vérification officielle"
                className="h-28 w-28 rounded-lg border border-forest-100 bg-white p-1.5 shadow-sm"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-forest-200 text-xs text-forest-700/50">
                QR indisponible
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">
              Vérification officielle
            </p>
            <p className="text-xs text-forest-700/50">
              Scannez ce code pour vérifier le badge sur le site officiel.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-forest-500 px-6 py-2.5 text-sm font-semibold text-forest-500 transition hover:bg-forest-50"
            >
              ← Retour au site
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
