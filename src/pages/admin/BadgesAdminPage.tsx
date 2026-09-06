/**
 * Administration — Badges (route /admin/badges).
 * Liste, filtre par catégorie, révocation / réactivation et export CSV.
 * Les badges sont générés depuis les pages Participants / Candidatures / Sponsors / Organisations.
 */

import { useMemo, useState } from 'react'
import { Ban, Download, ExternalLink, RefreshCw, RotateCcw } from 'lucide-react'
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, Select } from '../../components/ui'
import { db } from '../../services/store'
import { audit } from '../../services/audit'
import { useCollection } from '../../hooks/useCollection'
import { badgeCategoryMeta, revokeBadge } from '../../features/badges/badgeService'
import { downloadTextFile, formatDateFr, toCsv } from '../../utils/helpers'
import type { BadgeCategory, BadgeDoc } from '../../types'

type CategoryFilter = 'TOUS' | BadgeCategory

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'TOUS', label: 'Toutes les catégories' },
  { value: 'PARTICIPANT', label: 'Participant' },
  { value: 'CHALLENGER', label: 'Challenger' },
  { value: 'ORGANISATION', label: 'Organisation' },
  { value: 'SPONSOR', label: 'Sponsor' },
]

export default function BadgesAdminPage() {
  const badgesColl = useCollection(() => db.badges.list(), [])
  const [filter, setFilter] = useState<CategoryFilter>('TOUS')
  const [busyId, setBusyId] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...badgesColl.items].sort((a, b) => b.createdAt - a.createdAt),
    [badgesColl.items],
  )

  const filtered = useMemo(
    () => (filter === 'TOUS' ? sorted : sorted.filter((b) => b.category === filter)),
    [sorted, filter],
  )

  const counts = useMemo(
    () => ({
      total: sorted.length,
      active: sorted.filter((b) => b.status === 'ACTIVE').length,
      revoked: sorted.filter((b) => b.status === 'REVOKED').length,
    }),
    [sorted],
  )

  async function handleRevoke(badge: BadgeDoc) {
    setBusyId(badge.id)
    try {
      await revokeBadge(badge.id)
      await audit('badge_revoke', 'badge', badge.id, {
        reference: badge.reference,
        fullName: badge.fullName,
        category: badge.category,
      })
      await badgesColl.refresh()
    } finally {
      setBusyId(null)
    }
  }

  async function handleReactivate(badge: BadgeDoc) {
    setBusyId(badge.id)
    try {
      await db.badges.update(badge.id, { status: 'ACTIVE' })
      await audit('badge_reactivate', 'badge', badge.id, {
        reference: badge.reference,
        fullName: badge.fullName,
        category: badge.category,
      })
      await badgesColl.refresh()
    } finally {
      setBusyId(null)
    }
  }

  function exportCsv() {
    const rows = filtered.map((b) => ({
      'Nom complet': b.fullName,
      'Catégorie': badgeCategoryMeta[b.category].label,
      'Référence': b.reference,
      'Statut': b.status,
      'E-mail': b.ownerEmail,
      'Lien de vérification': `${window.location.origin}/verify/${b.secureToken}`,
      'Émis le': formatDateFr(b.createdAt),
    }))
    downloadTextFile('badges-jsb2027.csv', toCsv(rows), 'text/csv')
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Badges"
        subtitle="Gestion des badges d’accès — vérification publique via lien sécurisé."
      />

      {/* Carte explicative */}
      <Card className="mb-6 border-gold-400/40 bg-gold-300/10">
        <p className="text-sm leading-relaxed text-forest-800">
          Les badges sont générés automatiquement depuis les pages Participants, Candidatures, Sponsors
          et Organisations. Une révocation rend immédiatement le badge invalide sur sa page de vérification
          publique.
        </p>
      </Card>

      {/* Statistiques */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Total badges</p>
          <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{counts.total}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Actifs</p>
          <p className="mt-1 font-serif text-3xl font-bold text-emerald-600">{counts.active}</p>
        </Card>
        <Card className="sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Révoqués</p>
          <p className="mt-1 font-serif text-3xl font-bold text-red-600">{counts.revoked}</p>
        </Card>
      </div>

      {/* Barre d'outils */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as CategoryFilter)}
            className="w-auto"
            aria-label="Filtrer par catégorie"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <span className="text-sm text-forest-700/60">{filtered.length} badge{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void badgesColl.refresh()}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {badgesColl.loading ? (
        <LoadingState label="Chargement des badges…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          message={
            filter === 'TOUS'
              ? 'Aucun badge généré pour le moment.'
              : 'Aucun badge dans cette catégorie pour le moment.'
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-forest-100 bg-forest-50/60">
                <tr>
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Titulaire</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Catégorie</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Référence</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Statut</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Date</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-forest-700/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100">
                {filtered.map((b) => {
                  const meta = badgeCategoryMeta[b.category]
                  const busy = busyId === b.id
                  return (
                    <tr key={b.id} className="hover:bg-forest-50/40">
                      <td className="px-6 py-3">
                        <p className="font-medium text-forest-800">{b.fullName}</p>
                        <p className="text-xs text-forest-700/50">{b.ownerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-700">
                          <span className={`h-2 w-2 rounded-full ${meta.bg}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-forest-700">{b.reference}</td>
                      <td className="px-4 py-3">
                        {b.status === 'ACTIVE' ? (
                          <Badge tone="green">Actif</Badge>
                        ) : (
                          <Badge tone="red">Révoqué</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-forest-700/70">{formatDateFr(b.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/verify/${b.secureToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-forest-500 transition hover:bg-forest-50"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Voir
                          </a>
                          {b.status === 'ACTIVE' ? (
                            <Button
                              variant="danger"
                              className="px-2.5! py-1! text-xs"
                              onClick={() => void handleRevoke(b)}
                              disabled={busy}
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Révoquer
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="px-2.5! py-1! text-xs"
                              onClick={() => void handleReactivate(b)}
                              disabled={busy}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Réactiver
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  )
}
