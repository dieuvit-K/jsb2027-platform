import { useMemo, useState } from 'react'
import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  QrCode,
  Search,
  UserCheck,
  X,
} from 'lucide-react'
import type { Participant, RegistrationStatus } from '../../types'
import { db } from '../../services/store'
import { audit } from '../../services/audit'
import { createBadge, logEmail } from '../../features/badges/badgeService'
import { useCollection } from '../../hooks/useCollection'
import { downloadTextFile, formatDateFr, toCsv } from '../../utils/helpers'
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

const registrationMeta: Record<
  RegistrationStatus,
  { label: string; tone: 'gold' | 'green' | 'forest' }
> = {
  REGISTERED: { label: 'Inscrit', tone: 'gold' },
  CONFIRMED: { label: 'Confirmé', tone: 'green' },
  ATTENDED: { label: 'Attendu', tone: 'forest' },
}

const statusFilterOptions: { value: 'ALL' | RegistrationStatus; label: string }[] = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'REGISTERED', label: 'Inscrit' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'ATTENDED', label: 'Attendu' },
]

/** Bouton compact pour les actions de tableau (hérite du kit UI). */
function SmallButton({ className = '', ...props }: ComponentProps<typeof Button>) {
  return <Button className={`px-2.5! py-1! text-xs! ${className}`} {...props} />
}

type BusyState = { id: string; action: string } | null

/** Gestion des inscriptions des participants (route /admin/participants). */
export default function ParticipantsAdminPage() {
  const { items, loading, error, refresh } = useCollection<Participant>(() =>
    db.participants.list(),
  )

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | RegistrationStatus>('ALL')
  const [busy, setBusy] = useState<BusyState>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Participant | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((p) => {
      const matchQuery =
        !q ||
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'ALL' || p.registrationStatus === statusFilter
      return matchQuery && matchStatus
    })
  }, [items, query, statusFilter])

  const isBusy = (p: Participant, action: string) =>
    busy !== null && busy.id === p.id && busy.action === action

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

  function handleConfirm(p: Participant) {
    setBusy({ id: p.id, action: 'confirm' })
    void runAction(async () => {
      await db.participants.update(p.id, {
        registrationStatus: 'CONFIRMED',
        registrationStatusHistory: [
          ...(p.registrationStatusHistory ?? []),
          { from: p.registrationStatus, to: 'CONFIRMED', at: Date.now() },
        ],
      })
      await audit('participant_confirmed', 'participant', p.id)
      await logEmail(
        'RegistrationConfirmed',
        p.email,
        'Inscription confirmée — JSB 2027',
        `Bonjour ${p.firstName}, votre inscription à la JSB 2027 est confirmée. Nous vous attendons le jour de l'événement.`,
      )
      await refresh()
    })
  }

  function handleMarkPresent(p: Participant) {
    setBusy({ id: p.id, action: 'present' })
    void runAction(async () => {
      await db.participants.update(p.id, { attendance: 'PRESENT' })
      await audit('participant_marked_present', 'participant', p.id)
      await refresh()
    })
  }

  function handleGenerateBadge(p: Participant) {
    setBusy({ id: p.id, action: 'badge' })
    void runAction(async () => {
      const badge = await createBadge(
        `${p.firstName} ${p.lastName}`.trim(),
        'PARTICIPANT',
        p.email,
        p.reference,
      )
      await db.participants.update(p.id, { badgeToken: badge.secureToken })
      await audit('participant_badge_generated', 'participant', p.id, {
        badgeToken: badge.secureToken,
      })
      await logEmail(
        'BadgeGenerated',
        p.email,
        'Votre badge de participant — JSB 2027',
        `Bonjour ${p.firstName}, votre badge est disponible sur la plateforme (lien de vérification : /verify/${badge.secureToken}).`,
      )
      await refresh()
    })
  }

  function handleExport() {
    const rows: Record<string, unknown>[] = filtered.map((p) => ({
      'Référence': p.reference,
      'Nom complet': `${p.lastName} ${p.firstName}`,
      'Prénom': p.firstName,
      'Nom': p.lastName,
      'Email': p.email,
      'Téléphone': p.phone,
      'Fonction': p.status,
      'Établissement': p.institution,
      'Faculté': p.faculty,
      'Programme': p.program,
      'Laboratoire': p.laboratory,
      'Statut d’inscription': registrationMeta[p.registrationStatus].label,
      'Présence pointée': p.attendance === 'PRESENT' ? 'Oui' : 'Non',
      'Attestation souhaitée': p.wantsCertificate ? 'Oui' : 'Non',
      'Date d’inscription': formatDateFr(p.createdAt),
      'Badge généré': p.badgeToken ? 'Oui' : 'Non',
    }))
    downloadTextFile('participants.csv', toCsv(rows), 'text/csv')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Participants"
        subtitle="Gestion des inscriptions à la JSB 2027 : confirmation, présence et badges."
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
              placeholder="Rechercher par nom, prénom ou e-mail…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            className="lg:w-60"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | RegistrationStatus)}
            aria-label="Filtrer par statut d'inscription"
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
          : `${filtered.length} participant(s) affiché(s) sur ${items.length}`}
      </p>

      {loading && items.length === 0 ? (
        <Card>
          <LoadingState label="Chargement des participants…" />
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
                ? 'Aucun participant inscrit pour le moment.'
                : 'Aucun participant ne correspond à votre recherche.'
            }
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-100 bg-forest-50/70 text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Nom complet</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Établissement</th>
                <th className="px-4 py-3">Inscription</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-forest-100/60 align-middle last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-forest-700/70">
                    {p.reference}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-forest-800">
                    {p.lastName} {p.firstName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-forest-700/80">{p.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={registrationMeta[p.registrationStatus].tone}>
                        {registrationMeta[p.registrationStatus].label}
                      </Badge>
                      {p.attendance === 'PRESENT' && <Badge tone="green">Présent</Badge>}
                    </div>
                  </td>
                  <td className="max-w-44 truncate px-4 py-3 text-forest-700/80">{p.institution}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-forest-700/80">
                    {formatDateFr(p.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {p.badgeToken ? <Badge tone="green">Généré</Badge> : <span className="text-forest-700/40">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SmallButton
                        variant="ghost"
                        onClick={() => setSelected(p)}
                        disabled={busy !== null}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Détails
                      </SmallButton>

                      {p.registrationStatus === 'REGISTERED' && (
                        <SmallButton
                          variant="secondary"
                          onClick={() => handleConfirm(p)}
                          disabled={busy !== null}
                        >
                          {isBusy(p, 'confirm') ? (
                            <>
                              <Spinner className="h-3 w-3" />
                              Confirmation…
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirmer
                            </>
                          )}
                        </SmallButton>
                      )}

                      {p.registrationStatus === 'CONFIRMED' && p.attendance !== 'PRESENT' && (
                        <SmallButton
                          variant="outline"
                          onClick={() => handleMarkPresent(p)}
                          disabled={busy !== null}
                        >
                          {isBusy(p, 'present') ? (
                            <>
                              <Spinner className="h-3 w-3" />
                              Pointage…
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              Marquer présent
                            </>
                          )}
                        </SmallButton>
                      )}

                      {!p.badgeToken && (
                        <SmallButton
                          onClick={() => handleGenerateBadge(p)}
                          disabled={busy !== null}
                        >
                          {isBusy(p, 'badge') ? (
                            <>
                              <Spinner className="h-3 w-3" />
                              Génération…
                            </>
                          ) : (
                            <>
                              <QrCode className="h-3.5 w-3.5" />
                              Générer badge
                            </>
                          )}
                        </SmallButton>
                      )}

                      {p.badgeToken && (
                        <Link
                          to={`/verify/${p.badgeToken}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-forest-600 transition hover:bg-forest-50"
                        >
                          <QrCode className="h-3.5 w-3.5" />
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
          aria-label="Détails du participant"
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest-500">
                  {selected.lastName} {selected.firstName}
                </h2>
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
              <Badge tone={registrationMeta[selected.registrationStatus].tone}>
                {registrationMeta[selected.registrationStatus].label}
              </Badge>
              {selected.attendance === 'PRESENT' && <Badge tone="green">Présent sur place</Badge>}
              {selected.badgeToken && <Badge tone="forest">Badge généré</Badge>}
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
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Faculté</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{selected.faculty || '—'}</dd>
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
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Inscrit le</dt>
                <dd className="mt-0.5 text-sm text-forest-800">{formatDateFr(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Attestation souhaitée</dt>
                <dd className="mt-0.5 text-sm text-forest-800">
                  {selected.wantsCertificate ? 'Oui' : 'Non'}
                </dd>
              </div>
              {selected.badgeToken && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Badge</dt>
                  <dd className="mt-0.5 text-sm text-forest-800">
                    <Link to={`/verify/${selected.badgeToken}`} className="font-semibold text-forest-600 underline hover:text-gold-500">
                      Voir le badge
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {selected.registrationStatusHistory &&
              selected.registrationStatusHistory.length > 0 && (
                <div className="mt-5 border-t border-forest-100 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">
                    Historique du statut
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {selected.registrationStatusHistory.map((h, i) => (
                      <li key={i} className="text-sm text-forest-700/80">
                        <span className="font-semibold text-forest-700">{h.from}</span> →{' '}
                        <span className="font-semibold text-forest-700">{h.to}</span>{' '}
                        <span className="text-forest-700/50">— {formatDateFr(h.at)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  )
}
