/**
 * Page publique de vérification d'une attestation (route /verify/certificate/:token).
 * Affiche les informations minimales de contrôle de l'attestation officielle.
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, CheckCheck, XCircle } from 'lucide-react'
import { Card, LoadingState } from '../components/ui'
import { findCertificateByToken } from '../features/certificates/certificateService'
import { formatDateFr } from '../utils/helpers'
import { eventSettings } from '../config/event'
import type { CertificateDoc } from '../types'

export default function VerifyCertificatePage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<CertificateDoc | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const found = token ? await findCertificateByToken(token) : null
        if (!cancelled) setCertificate(found)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {loading ? (
        <LoadingState label="Vérification de l’attestation…" />
      ) : !certificate ? (
        <Card className="border-red-200 bg-red-50 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-9 w-9 text-red-600" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-red-700">Attestation introuvable</h1>
          <p className="mt-2 text-sm text-red-700/80">
            Aucune attestation ne correspond à ce code de vérification.
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
          {/* Cadre officiel double bordure forest/gold */}
          <div className="rounded-3xl border-4 border-double border-gold-400 bg-gold-300/10 p-2 sm:p-3">
            <div className="rounded-2xl border border-forest-100 bg-white px-5 py-10 text-center shadow-sm sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-500">
                <BadgeCheck className="h-8 w-8 text-gold-400" />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
                Attestation officielle — JSB 2027
              </p>

              <p className="mt-6 font-serif text-3xl font-bold text-forest-800">
                {certificate.fullName}
              </p>

              <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full bg-forest-100 px-3 py-1 text-sm font-semibold text-forest-700">
                  {certificate.category}
                </span>
                {certificate.status && (
                  <span className="inline-flex items-center rounded-full bg-gold-300/30 px-3 py-1 text-sm font-semibold text-gold-500">
                    {certificate.status}
                  </span>
                )}
              </div>

              <div className="mx-auto mt-6 flex max-w-md flex-col items-center justify-center gap-2 text-sm text-forest-700/80 sm:flex-row sm:gap-8">
                <p>
                  Référence : <span className="font-mono font-medium text-forest-700">{certificate.reference}</span>
                </p>
                <p>
                  Émise le : <span className="font-medium text-forest-700">{formatDateFr(certificate.createdAt)}</span>
                </p>
              </div>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                <CheckCheck className="h-4 w-4" />
                Document vérifié — valide
              </div>

              <p className="mt-5 text-xs text-forest-700/50">
                {eventSettings.name} · {eventSettings.edition}
              </p>
            </div>
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
