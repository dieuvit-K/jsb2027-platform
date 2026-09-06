import { useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, EmptyState, Input, LoadingState, PageHeader, Select } from '../../components/ui'
import { db } from '../../services/store'
import type { SponsorRequestStatus, SponsorshipRequest } from '../../types'
import { audit } from '../../services/audit'
import { createBadge, logEmail } from '../../features/badges/badgeService'
import { useCollection } from '../../hooks/useCollection'
import { downloadTextFile, formatDateFr, makeReference, toCsv } from '../../utils/helpers'

const STATUS_LABELS: Record<SponsorRequestStatus, string> = {
  PENDING: 'En attente',
  REVIEWING: 'En examen',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

const STATUS_TONES: Record<SponsorRequestStatus, 'gold' | 'forest' | 'green' | 'red'> = {
  PENDING: 'gold',
  REVIEWING: 'forest',
  APPROVED: 'green',
  REJECTED: 'red',
}

type StatusFilter = 'ALL' | SponsorRequestStatus

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'REVIEWING', label: 'En examen' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'REJECTED', label: 'Rejetés' },
]

type Notice = { kind: 'success' | 'error'; text: string }

export default function SponsorsAdminPage() {
  const { items, loading, refresh } = useCollection(() => db.sponsorshipRequests.list(), [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const timerRef = useRef<number | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((r) => (filter === 'ALL' ? true : r.status === filter))
      .filter((r) => (q === '' ? true : r.organizationName.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [items, query, filter])

  const activeCount = items.filter((r) => r.status === 'APPROVED').length
  const pendingCount = items.filter((r) => r.status === 'PENDING').length

  function flash(kind: Notice['kind'], text: string) {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setNotice({ kind, text })
    timerRef.current = window.setTimeout(() => setNotice(null), 6000)
  }

  async function transition(req: SponsorshipRequest, next: SponsorRequestStatus) {
    const name = req.organizationName.trim() || req.contactPerson.trim()
    if (next === 'APPROVED' && !window.confirm(`Approuver le sponsoring de « ${name} » ? Un badge sponsor sera émis.`)) return
    if (next === 'REJECTED' && !window.confirm(`Rejeter la demande de sponsoring de « ${name} » ?`)) return
    setBusyId(req.id)
    setNotice(null)
    try {
      if (next === 'APPROVED') {
        await db.sponsorshipRequests.update(req.id, { status: 'APPROVED' })
        const badge = await createBadge(name, 'SPONSOR', req.email, makeReference('B'))
        await db.sponsorshipRequests.update(req.id, { badgeToken: badge.secureToken })
        await audit('sponsor.approved', 'sponsorshipRequest', req.id, {
          from: req.status,
          to: 'APPROVED',
          badgeId: badge.id,
        })
        await logEmail(
          'SponsorApproved',
          req.email,
          'Votre partenariat est approuvé — JSB 2027',
          `Bonjour ${req.contactPerson || name}, le sponsoring de ${name} est approuvé. Votre badge de partenaire est disponible (${badge.secureToken.slice(0, 8)}…).`,
        )
      } else if (next === 'REJECTED') {
        await db.sponsorshipRequests.update(req.id, { status: 'REJECTED' })
        await audit('sponsor.rejected', 'sponsorshipRequest', req.id, { from: req.status, to: 'REJECTED' })
        await logEmail(
          'SponsorRejected',
          req.email,
          'Votre demande de sponsoring — JSB 2027',
          `Bonjour ${req.contactPerson || name}, votre demande de sponsoring pour ${name} n'a pas pu être retenue pour cette édition.`,
        )
      } else {
        await db.sponsorshipRequests.update(req.id, { status: 'REVIEWING' })
        await audit('sponsor.reviewing', 'sponsorshipRequest', req.id, { from: req.status, to: 'REVIEWING' })
      }
      await refresh()
      flash('success', `Statut mis à jour : « ${STATUS_LABELS[next]} ».`)
    } catch (e) {
      flash('error', e instanceof Error ? e.message : "Une erreur est survenue lors de la mise à jour.")
    } finally {
      setBusyId(null)
    }
  }

  function exportCsv() {
    const rows = filtered.map((r) => ({
      Structure: r.organizationName,
      Contact: r.contactPerson,
      'Adresse e-mail': r.email,
      Téléphone: r.phone,
      'Type de structure': r.structureType,
      'Type de soutien': r.supportType,
      Description: r.description,
      'Contribution proposée': r.proposedContribution,
      Statut: STATUS_LABELS[r.status],
      'Date de demande': formatDateFr(r.createdAt),
    }))
    downloadTextFile('sponsors-jsb2027.csv', toCsv(rows), 'text/csv')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Sponsors" subtitle="Demandes de sponsoring, examen et suivi des partenaires." />
        <Button variant="outline" type="button" onClick={exportCsv} disabled={filtered.length === 0}>
          Exporter CSV
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-gold-400/50 bg-gold-300/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-500">Sponsors actifs (APPROVED)</p>
          <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{activeCount}</p>
          <p className="mt-1 text-xs text-forest-700/70">
            {items.filter((r) => r.status === 'APPROVED').map((r) => r.organizationName).join(', ') || 'Aucun sponsor actif'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Demandes en attente</p>
          <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{pendingCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Total des demandes</p>
          <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{items.length}</p>
        </Card>
      </div>

      {notice && (
        <p
          className={`mb-4 rounded-lg border px-4 py-2 text-sm font-medium ${
            notice.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.text}
        </p>
      )}

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            type="search"
            placeholder="Rechercher par structure…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher par structure"
          />
          <Select value={filter} onChange={(e) => setFilter(e.target.value as StatusFilter)} aria-label="Filtrer par statut">
            {FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Chargement des demandes…" />
      ) : filtered.length === 0 ? (
        <EmptyState message="Aucune demande de sponsoring ne correspond à ces critères." />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const busy = busyId === r.id
            return (
              <Card key={r.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-forest-500">{r.organizationName}</h2>
                    <p className="text-xs text-forest-700/60">Demande du {formatDateFr(r.createdAt)}</p>
                  </div>
                  <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Contact</dt>
                    <dd className="mt-0.5 text-forest-800">{r.contactPerson}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">E-mail</dt>
                    <dd className="mt-0.5 text-forest-800">{r.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Téléphone</dt>
                    <dd className="mt-0.5 text-forest-800">{r.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Type de structure</dt>
                    <dd className="mt-0.5 text-forest-800">{r.structureType || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Type de soutien</dt>
                    <dd className="mt-0.5 text-forest-800">{r.supportType || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Contribution proposée</dt>
                    <dd className="mt-0.5 text-forest-800">{r.proposedContribution || '—'}</dd>
                    <dd className="text-xs italic text-forest-700/60">Proposition du sponsor — montant à confirmer, sans engagement.</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Description</dt>
                    <dd className="mt-0.5 whitespace-pre-line text-forest-800">{r.description || '—'}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-forest-100 pt-4">
                  {r.status === 'PENDING' && (
                    <Button variant="outline" type="button" disabled={busy} onClick={() => transition(r, 'REVIEWING')}>
                      En examen
                    </Button>
                  )}
                  {(r.status === 'PENDING' || r.status === 'REVIEWING') && (
                    <>
                      <Button variant="secondary" type="button" disabled={busy} onClick={() => transition(r, 'APPROVED')}>
                        Approuver
                      </Button>
                      <Button variant="danger" type="button" disabled={busy} onClick={() => transition(r, 'REJECTED')}>
                        Rejeter
                      </Button>
                    </>
                  )}
                  {busy && <span className="text-xs text-forest-700/60">Traitement en cours…</span>}
                  {r.status === 'APPROVED' && (
                    <p className="text-xs text-forest-700/70">
                      {r.badgeToken ? '✓ Badge sponsor émis et e-mail envoyé.' : 'Badge sponsor non émis.'}
                    </p>
                  )}
                  {r.status === 'REJECTED' && (
                    <p className="text-xs text-forest-700/70">Demande refusée — un e-mail d’information a été envoyé.</p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
