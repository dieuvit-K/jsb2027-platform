/**
 * Administration — Journal d'audit (route /admin/logs).
 * Liste chronologique des actions sensibles, recherche texte et pagination simple.
 */

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, History, Search } from 'lucide-react'
import { Button, Card, EmptyState, Input, LoadingState, PageHeader } from '../../components/ui'
import { db } from '../../services/store'
import { useCollection } from '../../hooks/useCollection'
import { formatDateTimeFr } from '../../utils/helpers'

const PAGE_SIZE = 20

/** « public_vote » → « Public Vote » */
function humanizeAction(action: string): string {
  if (!action) return '—'
  return action
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function AuditLogsAdminPage() {
  const logsColl = useCollection(() => db.auditLogs.list(), [])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const sorted = useMemo(
    () => [...logsColl.items].sort((a, b) => b.createdAt - a.createdAt),
    [logsColl.items],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.userEmail.toLowerCase().includes(q) ||
        l.resourceId.toLowerCase().includes(q) ||
        l.resourceType.toLowerCase().includes(q),
    )
  }, [sorted, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Journal d’audit"
        subtitle="Traçabilité des actions sensibles effectuées sur la plateforme."
      />

      {/* Recherche */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700/40" />
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Rechercher (action, e-mail, cible)…"
            className="pl-9"
            aria-label="Rechercher dans le journal d’audit"
          />
        </div>
        <span className="text-sm text-forest-700/60">
          {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {logsColl.loading ? (
        <LoadingState label="Chargement du journal…" />
      ) : rows.length === 0 ? (
        <EmptyState message="Aucune entrée de journal ne correspond à votre recherche." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-forest-100 bg-forest-50/60">
                <tr>
                  <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Date</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Utilisateur</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Action</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Type</th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Cible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100">
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-forest-50/40">
                    <td className="px-6 py-2.5 whitespace-nowrap text-forest-700/70">
                      {formatDateTimeFr(l.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-forest-700">{l.userEmail}</p>
                      <p className="text-xs text-forest-700/50">{l.userId}</p>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-forest-800">{humanizeAction(l.action)}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-700">
                        {l.resourceType}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-2.5 font-mono text-xs text-forest-700/70">
                      <span className="block break-all">{l.resourceId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest-100 px-6 py-3">
            <p className="text-xs text-forest-700/60">
              Page {safePage} sur {pageCount}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1}>
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button variant="outline" onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount}>
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-forest-700/50">
        <History className="h-4 w-4" />
        Les actions sensibles sont journalisées.
      </div>
    </main>
  )
}
