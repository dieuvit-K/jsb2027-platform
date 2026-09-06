import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Badge, Button, Card, EmptyState, Field, Input, LoadingState, PageHeader } from '../../components/ui'
import { db } from '../../services/store'
import type { OrganizationMember } from '../../types'
import { audit } from '../../services/audit'
import { createBadge, logEmail } from '../../features/badges/badgeService'
import { useCollection } from '../../hooks/useCollection'
import { downloadTextFile, formatDateFr, isValidEmail, isValidPhone, makeReference, toCsv } from '../../utils/helpers'

const STATUS_LABELS: Record<OrganizationMember['status'], string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
}

const STATUS_TONES: Record<OrganizationMember['status'], 'gold' | 'green' | 'red'> = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
}

type Notice = { kind: 'success' | 'error'; text: string }

const EMPTY_FORM = { fullName: '', email: '', phone: '', role: '', structure: '' }

export default function OrganizationsAdminPage() {
  const { items, loading, refresh } = useCollection(() => db.organizations.list(), [])
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({})
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const timerRef = useRef<number | null>(null)

  const sorted = useMemo(() => [...items].sort((a, b) => b.createdAt - a.createdAt), [items])
  const approvedCount = items.filter((m) => m.status === 'APPROVED').length

  function flash(kind: Notice['kind'], text: string) {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setNotice({ kind, text })
    timerRef.current = window.setTimeout(() => setNotice(null), 6000)
  }

  function validate(): boolean {
    const next: Partial<Record<keyof typeof EMPTY_FORM, string>> = {}
    if (!form.fullName.trim()) next.fullName = 'Veuillez renseigner le nom complet.'
    if (!isValidEmail(form.email)) next.email = 'Veuillez renseigner une adresse e-mail valide.'
    if (form.phone.trim() && !isValidPhone(form.phone)) next.phone = 'Numéro de téléphone invalide.'
    if (!form.role.trim()) next.role = 'Veuillez renseigner le rôle.'
    if (!form.structure.trim()) next.structure = 'Veuillez renseigner la structure.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setNotice(null)
    try {
      const doc = await db.organizations.add({
        editionId: 'jsb-2027',
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role.trim(),
        structure: form.structure.trim(),
        status: 'PENDING',
      })
      await audit('organization.manual_add', 'organization', doc.id, { fullName: doc.fullName, status: 'PENDING' })
      setForm(EMPTY_FORM)
      await refresh()
      flash('success', `« ${doc.fullName} » ajouté(e) en attente d’approbation.`)
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Une erreur est survenue lors de l’ajout.')
    } finally {
      setSaving(false)
    }
  }

  async function approve(member: OrganizationMember) {
    if (!window.confirm(`Approuver « ${member.fullName} » en tant que membre Organisation ? Un badge sera émis.`)) return
    setBusyId(member.id)
    setNotice(null)
    try {
      const badge = await createBadge(member.fullName, 'ORGANISATION', member.email, makeReference('B'))
      await db.organizations.update(member.id, { status: 'APPROVED', badgeToken: badge.secureToken })
      await audit('organization.approved', 'organization', member.id, {
        from: member.status,
        to: 'APPROVED',
        badgeId: badge.id,
      })
      await logEmail(
        'OrganizationApproved',
        member.email,
        'Votre accréditation Organisation — JSB 2027',
        `Bonjour ${member.fullName}, votre statut Organisation (${member.structure}) a été approuvé par un administrateur. Votre badge est disponible.`,
      )
      await refresh()
      flash('success', `« ${member.fullName} » approuvé(e) — badge émis et e-mail envoyé.`)
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Une erreur est survenue lors de l’approbation.')
    } finally {
      setBusyId(null)
    }
  }

  async function reject(member: OrganizationMember) {
    if (!window.confirm(`Rejeter la demande d’organisation de « ${member.fullName} » ?`)) return
    setBusyId(member.id)
    setNotice(null)
    try {
      await db.organizations.update(member.id, { status: 'REJECTED' })
      await audit('organization.rejected', 'organization', member.id, { from: member.status, to: 'REJECTED' })
      await logEmail(
        'OrganizationRejected',
        member.email,
        'Votre demande Organisation — JSB 2027',
        `Bonjour ${member.fullName}, votre demande d’accréditation Organisation n’a pas été retenue pour cette édition.`,
      )
      await refresh()
      flash('success', `Demande de « ${member.fullName} » rejetée.`)
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Une erreur est survenue lors du rejet.')
    } finally {
      setBusyId(null)
    }
  }

  function exportCsv() {
    const rows = sorted.map((m) => ({
      'Nom complet': m.fullName,
      'Adresse e-mail': m.email,
      Téléphone: m.phone,
      Rôle: m.role,
      Structure: m.structure,
      Statut: STATUS_LABELS[m.status],
      'Date d’ajout': formatDateFr(m.createdAt),
    }))
    downloadTextFile('organisations-jsb2027.csv', toCsv(rows), 'text/csv')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Organisations" subtitle="Membres et partenaires officiels accrédités par l’administration." />
        <Button variant="outline" type="button" onClick={exportCsv} disabled={sorted.length === 0}>
          Exporter CSV
        </Button>
      </div>

      <Card className="mb-6 border-gold-400/50 bg-gold-300/10 p-4">
        <p className="text-sm font-medium text-forest-700">
          ⚠️ Le statut Organisation est attribué uniquement par un administrateur. Aucune auto-inscription publique ne peut
          octroyer ce statut — chaque membre est validé ici après examen.
        </p>
      </Card>

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

      <Card className="mb-8">
        <h2 className="font-serif text-xl font-bold text-forest-500">Ajouter un membre manuellement</h2>
        <p className="mt-1 text-sm text-forest-700/70">
          Le membre ajouté reçoit le statut « En attente » — l’approbation (avec badge) reste manuelle.
        </p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleAdd} noValidate>
          <Field label="Nom complet" required error={errors.fullName}>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Ex : Grâce MABIALA"
              autoComplete="off"
            />
          </Field>
          <Field label="Adresse e-mail" required error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="prenom.nom@exemple.org"
              autoComplete="off"
            />
          </Field>
          <Field label="Téléphone" error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+242 06 000 00 00"
              autoComplete="off"
            />
          </Field>
          <Field label="Rôle" required error={errors.role}>
            <Input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Ex : Coordinateur, Membre du comité…"
              autoComplete="off"
            />
          </Field>
          <Field label="Structure" required error={errors.structure} hint="Comité d’organisation, institution partenaire…">
            <Input
              value={form.structure}
              onChange={(e) => setForm({ ...form, structure: e.target.value })}
              placeholder="Ex : Comité d’organisation JSB"
              autoComplete="off"
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? 'Ajout en cours…' : 'Ajouter le membre'}
            </Button>
          </div>
        </form>
      </Card>

      {loading ? (
        <LoadingState label="Chargement des organisations…" />
      ) : sorted.length === 0 ? (
        <EmptyState message="Aucun membre d’organisation enregistré." />
      ) : (
        <>
          <p className="mb-4 text-sm text-forest-700/70">
            {sorted.length} membre{sorted.length > 1 ? 's' : ''} · {approvedCount} approuvé{approvedCount > 1 ? 's' : ''}
          </p>
          <div className="space-y-4">
            {sorted.map((m) => {
              const busy = busyId === m.id
              return (
                <Card key={m.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-lg font-bold text-forest-500">{m.fullName}</h2>
                      <p className="text-xs text-forest-700/60">
                        {m.role} · {m.structure} — ajouté(e) le {formatDateFr(m.createdAt)}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONES[m.status]}>{STATUS_LABELS[m.status]}</Badge>
                  </div>
                  <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-forest-700 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-forest-700/60">E-mail :</span> {m.email}
                    </p>
                    <p>
                      <span className="font-semibold text-forest-700/60">Téléphone :</span> {m.phone || '—'}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-forest-100 pt-4">
                    {m.status !== 'APPROVED' && (
                      <Button variant="secondary" type="button" disabled={busy} onClick={() => approve(m)}>
                        Approuver
                      </Button>
                    )}
                    {m.status === 'PENDING' && (
                      <Button variant="danger" type="button" disabled={busy} onClick={() => reject(m)}>
                        Rejeter
                      </Button>
                    )}
                    {busy && <span className="text-xs text-forest-700/60">Traitement en cours…</span>}
                    {m.status === 'APPROVED' && (
                      <p className="text-xs text-forest-700/70">
                        {m.badgeToken ? '✓ Badge Organisation émis et e-mail envoyé.' : 'Badge Organisation non émis.'}
                      </p>
                    )}
                    {m.status === 'REJECTED' && (
                      <p className="text-xs text-forest-700/70">Demande refusée — un e-mail d’information a été envoyé.</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
