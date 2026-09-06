/**
 * Administration — Vote du public (route /admin/vote).
 * Ouverture/fermeture du vote, statistiques, classement officiel et export CSV.
 * Tant que le vote est ouvert, les compteurs détaillés restent masqués.
 */

import { useEffect, useMemo, useState } from 'react'
import { Download, Lock, RefreshCw, Vote } from 'lucide-react'
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader } from '../../components/ui'
import { db, settingsApi } from '../../services/store'
import { audit } from '../../services/audit'
import { useCollection } from '../../hooks/useCollection'
import { downloadTextFile, formatDateTimeFr, toCsv } from '../../utils/helpers'
import type { EventSettings } from '../../types'

const RECENT_LIMIT = 50

/** Masque partiellement l'e-mail : a***@domaine */
function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return email
  return `${email[0]}***@${email.slice(at + 1)}`
}

export default function VotesAdminPage() {
  const votesColl = useCollection(() => db.votes.list(), [])
  const candidatesColl = useCollection(() => db.candidates.list(), [])

  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    void settingsApi.get().then((s) => {
      if (!cancelled) setSettings(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const votingOpen = settings?.votingOpen ?? false

  const eligible = useMemo(
    () => candidatesColl.items.filter((c) => c.applicationStatus === 'SELECTED'),
    [candidatesColl.items],
  )

  const candById = useMemo(
    () => new Map(candidatesColl.items.map((c) => [c.id, c] as const)),
    [candidatesColl.items],
  )

  const sortedVotes = useMemo(
    () => [...votesColl.items].sort((a, b) => b.createdAt - a.createdAt),
    [votesColl.items],
  )

  const totalVotes = sortedVotes.length

  const ranking = useMemo(() => {
    const counts = eligible.map((c) => ({
      candidate: c,
      count: sortedVotes.filter((v) => v.candidateId === c.id).length,
    }))
    return counts.sort((a, b) => b.count - a.count)
  }, [eligible, sortedVotes])

  const maxCount = Math.max(0, ...ranking.map((r) => r.count))

  const recentVotes = sortedVotes.slice(0, RECENT_LIMIT)

  async function toggleVote() {
    setBusy(true)
    try {
      const next = !votingOpen
      const updated = await settingsApi.update({ votingOpen: next })
      setSettings(updated)
      await audit(next ? 'vote_open' : 'vote_close', 'settings', 'jsb-2027', { votingOpen: next })
    } finally {
      setBusy(false)
    }
  }

  function exportCsv() {
    const rows = sortedVotes.map((v) => {
      const c = candById.get(v.candidateId)
      return {
        'E-mail': v.email,
        'Projet': c?.projectTitle ?? 'Projet inconnu',
        'Référence candidat': c?.reference ?? '',
        'Vérifié': v.verified ? 'Oui' : 'Non',
        'Date': formatDateTimeFr(v.createdAt),
      }
    })
    downloadTextFile('votes-public-jsb2027.csv', toCsv(rows), 'text/csv')
  }

  const loading = votesColl.loading || candidatesColl.loading || !settings

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Vote du public"
        subtitle="Administration du Coup de cœur du public — une adresse e-mail = un vote."
      />

      {loading ? (
        <LoadingState label="Chargement des données du vote…" />
      ) : (
        <div className="space-y-6">
          {/* Carte d'ouverture / fermeture */}
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-500">
                <Vote className="h-5 w-5 text-gold-400" />
              </div>
              <div>
                <p className="font-semibold text-forest-800">Vote du public — Coup de cœur</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-forest-700/70">
                  Statut :
                  <Badge tone={votingOpen ? 'green' : 'gray'}>{votingOpen ? 'Ouvert' : 'Fermé'}</Badge>
                  <span className="text-xs">Clôture annoncée : {settings?.votingClose ?? 'À confirmer'}</span>
                </div>
              </div>
            </div>
            <Button variant={votingOpen ? 'secondary' : 'primary'} onClick={() => void toggleVote()} disabled={busy}>
              {votingOpen ? 'Fermer le vote' : 'Ouvrir le vote'}
            </Button>
          </Card>

          {/* Statistiques globales */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Total des votes</p>
              <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{totalVotes}</p>
              <p className="mt-1 text-xs text-forest-700/60">vote{totalVotes > 1 ? 's' : ''} enregistré{totalVotes > 1 ? 's' : ''}</p>
            </Card>
            <Card className="sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Projets éligibles</p>
              <p className="mt-1 font-serif text-3xl font-bold text-forest-500">{eligible.length}</p>
              <p className="mt-1 text-xs text-forest-700/60">challengers sélectionnés</p>
            </Card>
            <Card className="sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/50">Dernier vote</p>
              <p className="mt-1 font-serif text-lg font-bold text-forest-500">
                {sortedVotes.length > 0 ? formatDateTimeFr(sortedVotes[0].createdAt) : '—'}
              </p>
              <p className="mt-1 text-xs text-forest-700/60">horodatage du vote le plus récent</p>
            </Card>
          </div>

          {/* Résultats officiels */}
          {votingOpen ? (
            <Card className="flex items-start gap-3 border-gold-400/60 bg-gold-300/10">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
              <div>
                <p className="font-semibold text-forest-800">Résultats masqués jusqu’à la clôture officielle</p>
                <p className="mt-1 text-sm leading-relaxed text-forest-700/70">
                  Le vote est encore ouvert : le classement et le détail des votes par projet ne sont pas
                  affichés. Ils seront publiés ici après la fermeture du vote.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-bold text-forest-500">Classement officiel</h2>
                <span className="text-xs text-forest-700/60">Établi après la clôture du vote</span>
              </div>
              {ranking.length === 0 ? (
                <EmptyState message="Aucun projet éligible au vote pour le moment." />
              ) : totalVotes === 0 ? (
                <EmptyState message="Aucun vote enregistré pour le moment." />
              ) : (
                <ol className="space-y-4">
                  {ranking.map((r, i) => (
                    <li key={r.candidate.id} className="rounded-xl bg-forest-50/60 px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="min-w-0 flex-1 text-sm font-medium text-forest-800">
                          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest-500 font-serif text-xs font-bold text-gold-400">
                            {i + 1}
                          </span>
                          {r.candidate.firstName} {r.candidate.lastName} — {r.candidate.projectTitle}
                        </p>
                        <p className="text-sm font-bold text-forest-500">
                          {r.count} voix
                        </p>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-100">
                        <div
                          className="h-full rounded-full bg-gold-400 transition-all"
                          style={{ width: `${maxCount > 0 ? Math.round((r.count / maxCount) * 100) : 0}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          )}

          {/* Votes récents */}
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-forest-500">Derniers votes enregistrés</h2>
                <p className="text-xs text-forest-700/60">
                  {recentVotes.length > 0 && sortedVotes.length > RECENT_LIMIT
                    ? `Affichage des ${recentVotes.length} plus récents sur ${sortedVotes.length}`
                    : `${sortedVotes.length} vote${sortedVotes.length > 1 ? 's' : ''} au total`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    void votesColl.refresh()
                    void candidatesColl.refresh()
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </Button>
                <Button variant="outline" onClick={exportCsv} disabled={sortedVotes.length === 0}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-y border-forest-100 bg-forest-50/60">
                  <tr>
                    <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">E-mail</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Projet</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-forest-700/60">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100">
                  {recentVotes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-forest-700/60">
                        Aucun vote enregistré pour le moment.
                      </td>
                    </tr>
                  ) : (
                    recentVotes.map((v) => {
                      const c = candById.get(v.candidateId)
                      return (
                        <tr key={v.id} className="hover:bg-forest-50/40">
                          <td className="px-6 py-2.5 font-mono text-xs text-forest-700">{maskEmail(v.email)}</td>
                          <td className="px-4 py-2.5 text-forest-700">
                            {c ? `${c.firstName} ${c.lastName} — ${c.projectTitle}` : 'Projet inconnu'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-forest-700/70">{formatDateTimeFr(v.createdAt)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="text-xs text-forest-700/50">
            Contrôles : un vote par e-mail, vérification par code (démo locale).
          </p>
        </div>
      )}
    </main>
  )
}
