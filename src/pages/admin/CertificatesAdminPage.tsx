/**
 * Administration — Attestations (route /admin/attestations).
 * Génération des attestations pour les participants éligibles (présence PRESENT
 * ou inscription CONFIRMED), liste des attestations générées, export CSV.
 */

import { useMemo, useState } from 'react'
import { Download, ExternalLink, FileCheck2, Users } from 'lucide-react'
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader } from '../../components/ui'
import { db } from '../../services/store'
import { audit } from '../../services/audit'
import { useCollection } from '../../hooks/useCollection'
import { logEmail } from '../../features/badges/badgeService'
import { createCertificate, verifyCertificateUrl } from '../../features/certificates/certificateService'
import { downloadTextFile, formatDateFr, toCsv } from '../../utils/helpers'
import type { Participant } from '../../types'

function isEligible(p: Participant): boolean {
  return p.attendance === 'PRESENT' || p.registrationStatus === 'CONFIRMED'
}

export default function CertificatesAdminPage() {
  const participantsColl = useCollection(() => db.participants.list(), [])
  const certificatesColl = useCollection(() => db.certificates.list(), [])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const eligible = useMemo(
    () => [...participantsColl.items].sort((a, b) => a.lastName.localeCompare(b.lastName)).filter(isEligible),
    [participantsColl.items],
  )

  const coveredRefs = useMemo(
    () => new Set(certificatesColl.items.map((c) => c.reference)),
    [certificatesColl.items],
  )

  const toGenerate = useMemo(() => eligible.filter((p) => !coveredRefs.has(p.reference)), [eligible, coveredRefs])

  const certificates = useMemo(
    () => [...certificatesColl.items].sort((a, b) => b.createdAt - a.createdAt),
    [certificatesColl.items],
  )

  async function handleGenerate(p: Participant) {
    setBusyId(p.id)
    setError(null)
    try {
      const fullName = `${p.firstName} ${p.lastName}`
      const cert = await createCertificate(fullName, 'Participant', 'Présent', p.reference)
      await audit('certificate_generate', 'certificate', cert.id, {
        reference: cert.reference,
        fullName: cert.fullName,
        email: p.email,
      })
      await logEmail(
        'CertificateAvailable',
        p.email,
        'Votre attestation JSB 2027 est disponible',
        `Votre attestation officielle est disponible ici : ${verifyCertificateUrl(cert.secureToken)}`,
      )
      await certificatesColl.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'La génération de l’attestation a échoué.')
    } finally {
      setBusyId(null)
    }
  }

  function exportCsv() {
    const rows = certificates.map((c) => ({
      'Nom complet': c.fullName,
      'Catégorie': c.category,
      'Statut': c.status,
      'Référence': c.reference,
      'Lien de vérification': verifyCertificateUrl(c.secureToken),
      'Émise le': formatDateFr(c.createdAt),
    }))
    downloadTextFile('attestations-jsb2027.csv', toCsv(rows), 'text/csv')
  }

  const loading = participantsColl.loading || certificatesColl.loading

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Attestations"
        subtitle="Génération et suivi des attestations officielles des participants."
      />

      {/* Rappel */}
      <Card className="mb-6 border-gold-400/40 bg-gold-300/10">
        <p className="text-sm leading-relaxed text-forest-800">
          L’attestation est prévue pour tous les participants conformément aux règles de l’événement
          (inscription confirmée ou présence constatée le jour J).
        </p>
      </Card>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistiques */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Participants éligibles</p>
          <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{eligible.length}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Attestations à générer</p>
          <p className="mt-1 font-serif text-3xl font-bold text-gold-500">{toGenerate.length}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Attestations générées</p>
          <p className="mt-1 font-serif text-3xl font-bold text-emerald-600">{certificates.length}</p>
        </Card>
      </div>

      {loading ? (
        <LoadingState label="Chargement des données…" />
      ) : (
        <div className="space-y-6">
          {/* Participants éligibles sans attestation */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-forest-500" />
              <h2 className="font-serif text-xl font-bold text-forest-500">
                Génération des attestations
              </h2>
            </div>
            {toGenerate.length === 0 ? (
              <EmptyState message="Tous les participants éligibles disposent déjà d’une attestation." />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-forest-100 bg-forest-50/60">
                      <tr>
                        <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Participant</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Inscription</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Présence</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Référence</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-forest-700/60">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-100">
                      {toGenerate.map((p) => (
                        <tr key={p.id} className="hover:bg-forest-50/40">
                          <td className="px-6 py-3">
                            <p className="font-medium text-forest-800">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-xs text-forest-700/50">{p.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            {p.registrationStatus === 'CONFIRMED' ? (
                              <Badge tone="green">Confirmée</Badge>
                            ) : (
                              <Badge tone="gray">{p.registrationStatus}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.attendance === 'PRESENT' ? (
                              <Badge tone="green">Présent</Badge>
                            ) : (
                              <Badge tone="gray">Non pointé</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-forest-700">{p.reference}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="secondary"
                              className="px-3! py-1.5! text-xs"
                              onClick={() => void handleGenerate(p)}
                              disabled={busyId === p.id}
                            >
                              <FileCheck2 className="h-4 w-4" />
                              {busyId === p.id ? 'Génération…' : 'Générer l’attestation'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>

          {/* Attestations générées */}
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-bold text-forest-500">
                Attestations générées
              </h2>
              <Button variant="outline" onClick={exportCsv} disabled={certificates.length === 0}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            {certificates.length === 0 ? (
              <EmptyState message="Aucune attestation n’a encore été générée." />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-b border-forest-100 bg-forest-50/60">
                      <tr>
                        <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Titulaire</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Catégorie</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Référence</th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Émise le</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-forest-700/60">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-100">
                      {certificates.map((c) => (
                        <tr key={c.id} className="hover:bg-forest-50/40">
                          <td className="px-6 py-3 font-medium text-forest-800">{c.fullName}</td>
                          <td className="px-4 py-3">
                            <Badge tone="forest">{c.category}</Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-forest-700">{c.reference}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-forest-700/70">{formatDateFr(c.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={`/verify/certificate/${c.secureToken}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-forest-500 transition hover:bg-forest-50"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Vérifier
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
