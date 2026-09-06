import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  Handshake,
  QrCode,
  Users,
  Vote,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AuditLogEntry } from '../../types'
import { db } from '../../services/store'
import { formatDateTimeFr } from '../../utils/helpers'
import { Button, Card, EmptyState, LoadingState, PageHeader } from '../../components/ui'

interface DashboardStats {
  participants: number
  participantsConfirmed: number
  candidates: number
  candidatesSubmitted: number
  candidatesSelected: number
  sponsorsApproved: number
  sponsorsTotal: number
  badges: number
  votes: number
  certificates: number
  organizations: number
  organizationsApproved: number
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'forest',
}: {
  label: string
  value: number
  hint?: string
  icon: LucideIcon
  accent?: 'forest' | 'gold'
}) {
  const iconBox =
    accent === 'gold' ? 'bg-gold-300/30 text-gold-500' : 'bg-forest-100 text-forest-600'
  return (
    <Card className="flex items-center gap-4">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBox}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-forest-700/60">
          {label}
        </p>
        <p className="font-serif text-2xl font-bold text-forest-500">{value}</p>
        {hint && <p className="truncate text-xs text-forest-700/60">{hint}</p>}
      </div>
    </Card>
  )
}

const quickActions: { to: string; label: string; description: string; icon: LucideIcon }[] = [
  { to: '/admin/participants', label: 'Participants', description: 'Inscriptions et badges', icon: Users },
  { to: '/admin/candidatures', label: 'Candidatures', description: 'Examen et sélection des challengers', icon: ClipboardList },
  { to: '/admin/badges', label: 'Badges', description: 'Badges générés et vérification', icon: QrCode },
  { to: '/admin/attestations', label: 'Attestations', description: 'Attestations de participation', icon: BadgeCheck },
]

function formatAction(action: string): string {
  const words = action.replace(/_/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Tableau de bord d'administration (route /admin). */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [
          participants,
          candidates,
          sponsorshipRequests,
          badges,
          votes,
          certificates,
          organizations,
          auditLogs,
        ] = await Promise.all([
          db.participants.list(),
          db.candidates.list(),
          db.sponsorshipRequests.list(),
          db.badges.list(),
          db.votes.list(),
          db.certificates.list(),
          db.organizations.list(),
          db.auditLogs.list(),
        ])
        if (cancelled) return
        setStats({
          participants: participants.length,
          participantsConfirmed: participants.filter((p) => p.registrationStatus === 'CONFIRMED')
            .length,
          candidates: candidates.length,
          candidatesSubmitted: candidates.filter((c) => c.applicationStatus === 'SUBMITTED')
            .length,
          candidatesSelected: candidates.filter((c) => c.applicationStatus === 'SELECTED').length,
          sponsorsApproved: sponsorshipRequests.filter((s) => s.status === 'APPROVED').length,
          sponsorsTotal: sponsorshipRequests.length,
          badges: badges.length,
          votes: votes.length,
          certificates: certificates.length,
          organizations: organizations.length,
          organizationsApproved: organizations.filter((o) => o.status === 'APPROVED').length,
        })
        setAuditEntries(
          [...auditLogs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
        )
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erreur lors du chargement des statistiques.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  if (loading && !stats) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme JSB 2027." />
        <LoadingState label="Chargement des statistiques…" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme JSB 2027." />
        <Card>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-forest-700/80">
              {error ?? 'Impossible de charger les statistiques.'}
            </p>
            <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const statCards: {
    label: string
    value: number
    hint?: string
    icon: LucideIcon
    accent?: 'forest' | 'gold'
  }[] = [
    {
      label: 'Participants',
      value: stats.participants,
      hint: `${stats.participantsConfirmed} confirmé(s)`,
      icon: Users,
    },
    {
      label: 'Candidatures',
      value: stats.candidates,
      hint: `${stats.candidatesSubmitted} soumise(s) · ${stats.candidatesSelected} sélectionnée(s)`,
      icon: ClipboardList,
      accent: 'gold',
    },
    {
      label: 'Sponsors',
      value: stats.sponsorsApproved,
      hint: `${stats.sponsorsTotal} demande(s) reçue(s)`,
      icon: Handshake,
    },
    {
      label: 'Badges générés',
      value: stats.badges,
      hint: 'badge(s) actif(s)',
      icon: QrCode,
      accent: 'gold',
    },
    { label: 'Votes', value: stats.votes, hint: 'vote(s) exprimé(s)', icon: Vote },
    {
      label: 'Attestations',
      value: stats.certificates,
      hint: 'attestation(s) délivrée(s)',
      icon: BadgeCheck,
    },
    {
      label: 'Organisations',
      value: stats.organizations,
      hint: `${stats.organizationsApproved} membre(s) approuvé(s)`,
      icon: Building2,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble des inscriptions, candidatures et activités de la plateforme JSB 2027."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Actions rapides */}
        <Card className="lg:col-span-1">
          <h2 className="font-serif text-lg font-bold text-forest-500">Actions rapides</h2>
          <p className="mt-1 text-sm text-forest-700/60">Accéder aux sections de gestion.</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {quickActions.map((qa) => (
              <Link
                key={qa.to}
                to={qa.to}
                className="group flex items-start gap-3 rounded-xl border border-forest-100 p-3 transition hover:border-gold-300/70 hover:bg-forest-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-600">
                  <qa.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-forest-700">{qa.label}</span>
                  <span className="block text-xs text-forest-700/60">{qa.description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 self-center text-forest-700/30 transition group-hover:text-gold-500" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-forest-500">Activité récente</h2>
              <p className="mt-1 text-sm text-forest-700/60">
                Les 5 dernières actions enregistrées dans le journal d'audit.
              </p>
            </div>
            <Activity className="h-5 w-5 shrink-0 text-forest-700/30" />
          </div>

          {auditEntries.length === 0 ? (
            <div className="mt-4">
              <EmptyState message="Aucune activité enregistrée pour le moment." />
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-forest-100">
              {auditEntries.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-forest-600">
                    <Activity className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-forest-700">
                      {formatAction(entry.action)}
                    </p>
                    <p className="truncate text-xs text-forest-700/60">
                      {entry.userEmail} — {entry.resourceType} {entry.resourceId}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-forest-700/50">
                    {formatDateTimeFr(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
