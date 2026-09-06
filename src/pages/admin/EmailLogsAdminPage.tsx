import { useMemo } from 'react'
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader } from '../../components/ui'
import { db } from '../../services/store'
import { useCollection } from '../../hooks/useCollection'
import { downloadTextFile, formatDateTimeFr, toCsv } from '../../utils/helpers'

const TEMPLATE_LABELS: Record<string, string> = {
  RegistrationConfirmation: 'Confirmation d’inscription',
  CandidateSubmissionConfirmation: 'Confirmation de candidature',
  CandidateSelected: 'Candidat sélectionné',
  CandidateNotSelected: 'Candidat non retenu',
  SponsorRequestReceived: 'Demande sponsor reçue',
  SponsorApproved: 'Sponsor approuvé',
  RegistrationConfirmed: 'Inscription confirmée',
}

function templateLabel(template: string): string {
  return TEMPLATE_LABELS[template] ?? template
}

export default function EmailLogsAdminPage() {
  const { items, loading } = useCollection(() => db.emailLogs.list(), [])

  const sorted = useMemo(() => [...items].sort((a, b) => b.createdAt - a.createdAt), [items])
  const recipients = useMemo(() => new Set(sorted.map((e) => e.to)).size, [sorted])

  function exportCsv() {
    const rows = sorted.map((e) => ({
      Modèle: templateLabel(e.template),
      Destinataire: e.to,
      Sujet: e.subject,
      'Aperçu du corps': e.bodyPreview,
      Date: formatDateTimeFr(e.createdAt),
      Envoyé: e.sent ? 'Oui' : 'Non (journalisé)',
    }))
    downloadTextFile('emails-jsb2027.csv', toCsv(rows), 'text/csv')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Journal des e-mails" subtitle="Historique des e-mails générés par la plateforme." />
        <Button variant="outline" type="button" onClick={exportCsv} disabled={sorted.length === 0}>
          Exporter CSV
        </Button>
      </div>

      <Card className="mb-6 border-gold-400/50 bg-gold-300/10 p-4">
        <p className="text-sm font-medium text-forest-700">
          📮 E-mails journalisés (mode démo locale). L’envoi réel sera branché en production.
        </p>
        <p className="mt-1 text-xs text-forest-700/60">
          {sorted.length} e-mail{sorted.length > 1 ? 's' : ''} journalisé{sorted.length > 1 ? 's' : ''} · {recipients}{' '}
          destinataire{recipients > 1 ? 's' : ''} distinct{recipients > 1 ? 's' : ''}
        </p>
      </Card>

      {loading ? (
        <LoadingState label="Chargement du journal…" />
      ) : sorted.length === 0 ? (
        <EmptyState message="Aucun e-mail journalisé pour le moment. Les e-mails apparaîtront ici dès qu’une action les déclenchera." />
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="forest">{templateLabel(e.template)}</Badge>
                  <Badge tone={e.sent ? 'green' : 'gray'}>{e.sent ? 'Envoyé' : 'Journalisé (démo)'}</Badge>
                </div>
                <span className="text-xs text-forest-700/60">{formatDateTimeFr(e.createdAt)}</span>
              </div>
              <p className="mt-2 font-semibold text-forest-800">{e.subject}</p>
              <p className="mt-0.5 text-xs text-forest-700/60">
                À : <span className="font-medium text-forest-700">{e.to}</span>
              </p>
              <p className="mt-2 whitespace-pre-line border-l-2 border-forest-100 pl-3 text-sm italic text-forest-700/80">
                {e.bodyPreview || '—'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
