import { useMemo, useState } from 'react'
import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Download,
  Eye,
  Search,
  X,
  XCircle,
} from 'lucide-react'
import type { ApplicationStatus, Candidate } from '../../types'
import { db } from '../../services/store'
import { audit } from '../../services/audit'
import { createBadge, logEmail } from '../../features/badges/badgeService'
import { useCollection } from '../../hooks/useCollection'
import { downloadTextFile, fileSizeHuman, formatDateFr, toCsv } from '../../utils/helpers'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  PageHeader,
  Select,
  Spinner,
} from '../../components/ui'

const applicationMeta: Record<
  ApplicationStatus,
  { label: string; tone: 'gray' | 'gold' | 'green' | 'red' }
> = {
  SUBMITTED: { label: 'Soumise', tone: 'gray' },
  UNDER_REVIEW: { label: 'En examen', tone: 'gold' },
  SELECTED: { label: 'Sélectionnée', tone: 'green' },
  NOT_SELECTED: { label: 'Non retenue', tone: 'red' },
  WITHDRAWN: { label: 'Retirée', tone: 'gray' },
}

const statusFilterOptions: { value: 'ALL' | ApplicationStatus; label: string }[] = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'SUBMITTED', label: 'Soumise' },
  { value: 'UNDER_REVIEW', label: 'En examen' },
  { value: 'SELECTED', label: 'Sélectionnée' },
  { value: 'NOT_SELECTED', label: 'Non retenue' },
  { value: 'WITHDRAWN', label: 'Retirée' },
]

/** Bouton compact pour les actions de tableau (hérite du kit UI). */
function SmallButton({ className = '', ...props }: ComponentProps<typeof Button>) {
  return <Button className={`px-2.5! py-1! text-xs! ${className}`} {...props} />
}

type BusyState = { id: string; action: string } | null

const fullName = (c: Candidate) => `${c.lastName} ${c.firstName}`

/** Gestion des candidatures Challenger (route /admin/candidatures). */
export default function CandidatesAdminPage() {
  const { items, loading, error, refresh } = useCollection<Candidate>(() =>
    db.candidates.list(),
  )

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL')
  const [busy, setBusy] = useState<BusyState>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Candidate | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((c) => {
      const matchQuery =
        !q ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        fullName(c).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.projectTitle.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'ALL' || c.applicationStatus === statusFilter
      return matchQuery && matchStatus
    })
  }, [items, query, statusFilter])

  const isBusy = (c: Candidate, action: string) =>
    busy !== null && busy.id === c.id && busy.action === action

  async function runAction(fn: () => Promise<void>) {
    setActionError(null)
    try {
      await fn()
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'Une erreur est survenue. Veuillez réessayer.',
      )
    } finally {
      setBusy(null)
    }
  }

  function handleUnderReview(c: Candidate) {
    setBusy({ id: c.id, action: 'review' })
    void runAction(async () => {
      await db.candidates.update(c.id, { applicationStatus: 'UNDER_REVIEW' })
      await audit('candidate_under_review', 'candidate', c.id)
      await refresh()
    })
  }

  function handleAccept(c: Candidate) {
    setBusy({ id: c.id, action: 'accept' })
    void runAction(async () => {
      const badge = await createBadge(fullName(c).trim(), 'CHALLENGER', c.email, c.reference)
      await db.candidates.update(c.id, {
        applicationStatus: 'SELECTED',
        isChallenger: true,
        badgeToken: badge.secureToken,
      })
      await audit('candidate_selected', 'candidate', c.id, {
        badgeToken: badge.secureToken,
      })
      await logEmail(
        'CandidateSelected',
        c.email,
        'Félicitations — votre candidature est retenue (JSB 2027)',
        `Bonjour ${c.firstName}, nous avons le plaisir de vous annoncer que votre projet « ${c.projectTitle} » est retenu. Vous êtes officiellement challenger de la JSB 2027.`,
      )
      await refresh()
    })
  }

  function handleReject(c: Candidate) {
    setBusy({ id: c.id, action: 'reject' })
    void runAction(async () => {
      await db.candidates.update(c.id, { applicationStatus: 'NOT_SELECTED' })
      await audit('candidate_not_selected', 'candidate', c.id)
      await logEmail(
        'CandidateNotSelected',
        c.email,
        'Réponse à votre candidature — JSB 2027',
        `Bonjour ${c.firstName}, nous vous remercions pour votre candidature. Après examen, celle-ci n'a pas été retenue pour cette édition.`,
      )
      await refresh()
    })
  }

  function handleWithdraw(c: Candidate) {
    setBusy({ id: c.id, action: 'withdraw' })
    void runAction(async () => {
      await db.candidates.update(c.id, { applicationStatus: 'WITHDRAWN' })
      await audit('candidate_withdrawn', 'candidate', c.id)
      await refresh()
    })
  }

  function handleExport() {
    const rows: Record<string, unknown>[] = filtered.map((c) => ({
      'Référence': c.reference,
      'Candidat': fullName(c),
      'Email': c.email,
      'Téléphone': c.phone,
      'Fonction': c.status,
      'Établissement': c.institution,
      'Faculté': c.faculty,
      'École': c.school,
      'Programme': c.program,
      'Laboratoire': c.laboratory,
      'Titre du projet': c.projectTitle,
      'Type de projet': c.projectType,
      'Thème de recherche': c.researchTheme,
      'Statut': applicationMeta[c.applicationStatus].label,
      'Challenger': c.isChallenger ? 'Oui' : 'Non',
      'Prix du poster': c.wantsPosterAward ? 'Oui' : 'Non',
      'Document joint': c.hasDocument ? c.documentName ?? 'Oui' : 'Non',
      'Date de dépôt': formatDateFr(c.createdAt),
    }))
    downloadTextFile('candidatures.csv', toCsv(rows), 'text/csv')
  }

  const canReview = (c: Candidate) => ['SUBMITTED', 'UNDER_REVIEW'].includes(c.applicationStatus)
  const canWithdraw = (c: Candidate) =>
    c.applicationStatus === 'SUBMITTED' ||
    c.applicationStatus === 'UNDER_REVIEW' ||
    c.applicationStatus === 'NOT_SELECTED'

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Candidatures"
        subtitle="Examen des candidatures Challenger : sélection, badges et suivi des projets."
      />

      {actionError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Barre de recherche / filtres / export */}
      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700/40" />
            <Input
              className="pl-9"
              placeholder="Rechercher par nom, e-mail ou titre du projet…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            className="lg:w-60"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ApplicationStatus)}
            aria-label="Filtrer par statut de candidature"
          >
            {statusFilterOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </Card>

      <p className="mb-3 text-sm text-forest-700/60">
        {loading
          ? 'Chargement…'
          : `${filtered.length} candidature(s) affichée(s) sur ${items.length}`}
      </p>

      {loading && items.length === 0 ? (
        <Card>
          <LoadingState label="Chargement des candidatures…" />
        </Card>
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-forest-700/80">{error}</p>
            <Button variant="outline" onClick={() => void refresh()}>
              Réessayer
            </Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            message={
              items.length === 0
                ? 'Aucune candidature déposée pour le moment.'
                : 'Aucune candidature ne correspond à votre recherche.'
            }
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 bg-forest-50/70 text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Candidat</th>
                <th className="px-4 py-3">Projet</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Poster</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-forest-100/60 align-middle last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-forest-700/70">
                    {c.reference}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-medium text-forest-800">{fullName(c)}</p>
                    <p className="max-w-52 truncate text-xs text-forest-700/60">{c.email}</p>
                  </td>
                  <td className="max-w-72 px-4 py-3">
                    <p className="truncate font-medium text-forest-800" title={c.projectTitle}>
                      {c.projectTitle}
                    </p>
                    <p className="max-w-64 truncate text-xs text-forest-700/60">
                      {c.researchTheme}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge tone={applicationMeta[c.applicationStatus].tone}>
                      {applicationMeta[c.applicationStatus].label}
                    </Badge>
                    {c.isChallenger && (
                      <span className="mt-1 block text-xs font-semibold text-gold-500">
                        Challenger
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-forest-700/80">
                    {c.wantsPosterAward ? 'Oui' : 'Non'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-forest-700/80">
                    {formatDateFr(c.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-md flex-wrap items-center gap-1.5">
                      <SmallButton
                        variant="ghost"
                        onClick={() => setSelected(c)}
                        disabled={busy !== null}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Détails
                      </SmallButton>

                      {c.applicationStatus === 'SUBMITTED' && (
                        <SmallButton
                          variant="outline"
                          onClick={() => handleUnderReview(c)}
                          disabled={busy !== null}
                        >
                          {isBusy(c, 'review') ? (
                            <>
                              <Spinner className="h-3 w-3" />
                              Examen…
                            </>
                          ) : (
                            'Passer en examen'
                          )}
                        </SmallButton>
                      )}

                      {canReview(c) && (
                        <>
                          <SmallButton
                            onClick={() => handleAccept(c)}
                            disabled={busy !== null}
                          >
                            {isBusy(c, 'accept') ? (
                              <>
                                <Spinner className="h-3 w-3" />
                                Sélection…
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Accepter
                              </>
                            )}
                          </SmallButton>
                          <SmallButton
                            variant="danger"
                            onClick={() => handleReject(c)}
                            disabled={busy !== null}
                          >
                            {isBusy(c, 'reject') ? (
                              <>
                                <Spinner className="h-3 w-3" />
                                Rejet…
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                Rejeter
                              </>
                            )}
                          </SmallButton>
                        </>
                      )}

                      {canWithdraw(c) && (
                        <SmallButton
                          variant="ghost"
                          onClick={() => handleWithdraw(c)}
                          disabled={busy !== null}
                        >
                          {isBusy(c, 'withdraw') ? (
                            <>
                              <Spinner className="h-3 w-3" />
                              Retrait…
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" />
                              Retirer
                            </>
                          )}
                        </SmallButton>
                      )}

                      {c.badgeToken && (
                        <Link
                          to={`/verify/${c.badgeToken}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-forest-600 transition hover:bg-forest-50"
                        >
                          Voir badge
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ---- Modale de détail ---- */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/60 p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Détails de la candidature"
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest-500">{fullName(selected)}</h2>
                <p className="mt-0.5 font-mono text-xs text-forest-700/60">{selected.reference}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-forest-700/60 transition hover:bg-forest-50 hover:text-forest-700"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={applicationMeta[selected.applicationStatus].tone}>
                {applicationMeta[selected.applicationStatus].label}
              </Badge>
              {selected.isChallenger && <Badge tone="gold">Challenger</Badge>}
              {selected.badgeToken && <Badge tone="forest">Badge généré</Badge>}
            </div>

            <div className="mt-5 rounded-xl border border-forest-100 bg-forest-50/50 p-4">
              <h3 className="font-serif text-base font-bold text-forest-500">
                {selected.projectTitle}
              </h3>
              <p className="mt-1 text-xs text-forest-700/60">
                {selected.projectType} — {selected.researchTheme}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-forest-800">
                {selected.projectDescription}
              </p>
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">E-mail</dt>
                <dd className="mt-0.5 text-sm break-all text-forest-800">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Téléphone</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{selected.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Fonction</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{selected.status || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Établissement</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{selected.institution || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Faculté / École</dt>
                <dd className="mt-0.5 text-sm text-forest-800">
                  {[selected.faculty, selected.school].filter(Boolean).join(' — ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Programme</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{selected.program || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Laboratoire</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{selected.laboratory || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Date de dépôt</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{formatDateFr(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Prix du poster</dt>
                <dd className="mt-0.5 text-sm text-forest-800">
                  {selected.wantsPosterAward ? 'Inscrit' : 'Non inscrit'}
                </dd>
              </div>
              {selected.badgeToken && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Badge</dt>
                  <dd className="mt-0.5 text-sm text-forest-800">
                    <Link
                      to={`/verify/${selected.badgeToken}`}
                      className="font-semibold text-forest-600 underline hover:text-gold-500"
                    >
                      Voir le badge challenger
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {/* Document du projet */}
            <div className="mt-5 border-t border-forest-100 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                Document du projet
              </h3>
              {selected.hasDocument ? (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-forest-700/80">
                    {selected.documentName || 'Document joint'}
                    {selected.documentSize != null && (
                      <span className="text-forest-700/50"> — {fileSizeHuman(selected.documentSize)}</span>
                    )}
                  </p>
                  {selected.documentDataUrl ? (
                    <a
                      href={selected.documentDataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-600"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger le PDF
                    </a>
                  ) : (
                    <p className="text-xs text-forest-700/60">
                      Le fichier est enregistré mais n'est plus disponible au téléchargement.
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-forest-700/60">Aucun document joint.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
