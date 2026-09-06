import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Badge, Button, Card, EmptyState, Field, Input, LoadingState, PageHeader, Textarea } from '../../components/ui'
import { db, settingsApi } from '../../services/store'
import type { Award, EventSettings, FaqItem } from '../../types'
import { audit } from '../../services/audit'
import { useCollection } from '../../hooks/useCollection'

type Notice = { kind: 'success' | 'error'; text: string }

function useFlash(): [Notice | null, (kind: Notice['kind'], text: string) => void] {
  const [notice, setNotice] = useState<Notice | null>(null)
  const timerRef = useRef<number | null>(null)
  function flash(kind: Notice['kind'], text: string) {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setNotice({ kind, text })
    timerRef.current = window.setTimeout(() => setNotice(null), 6000)
  }
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])
  return [notice, flash]
}

function NoticeBanner({ notice }: { notice: Notice | null }) {
  if (!notice) return null
  return (
    <p
      className={`mb-4 rounded-lg border px-4 py-2 text-sm font-medium ${
        notice.kind === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {notice.text}
    </p>
  )
}

function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-forest-100 bg-forest-50/40 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-forest-700">{label}</p>
        {hint && <p className="text-xs text-forest-700/60">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-forest-500' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

/* ---------- a) Paramètres de l’événement ---------- */

type SettingsForm = Pick<
  EventSettings,
  | 'eventName'
  | 'shortName'
  | 'edition'
  | 'theme'
  | 'date'
  | 'venue'
  | 'contactEmail'
  | 'contactPhone'
  | 'registrationOpen'
  | 'applicationOpen'
  | 'votingOpen'
  | 'maxPdfSizeMb'
  | 'applicationDeadline'
>

function toSettingsForm(s: EventSettings): SettingsForm {
  return {
    eventName: s.eventName,
    shortName: s.shortName,
    edition: s.edition,
    theme: s.theme,
    date: s.date,
    venue: s.venue,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    registrationOpen: s.registrationOpen,
    applicationOpen: s.applicationOpen,
    votingOpen: s.votingOpen,
    maxPdfSizeMb: s.maxPdfSizeMb,
    applicationDeadline: s.applicationDeadline,
  }
}

function SettingsSection() {
  const [form, setForm] = useState<SettingsForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimer = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    settingsApi
      .get()
      .then((s) => {
        if (active) setForm(toSettingsForm(s))
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      if (savedTimer.current) window.clearTimeout(savedTimer.current)
    }
  }, [])

  function setField<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((f) => {
      if (!f) return f
      const next: SettingsForm = { ...f }
      next[key] = value
      return next
    })
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setSaved(false)
    try {
      await settingsApi.update(form)
      await audit('settings.updated', 'eventSettings', 'jsb-2027', { fields: Object.keys(form) })
      setSaved(true)
      if (savedTimer.current) window.clearTimeout(savedTimer.current)
      savedTimer.current = window.setTimeout(() => setSaved(false), 5000)
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Chargement des paramètres…" />
  if (!form) return <EmptyState message="Impossible de charger les paramètres de l’événement." />

  return (
    <Card className="mb-8">
      <h2 className="font-serif text-xl font-bold text-forest-500">Paramètres de l’événement</h2>
      <p className="mt-1 text-sm text-forest-700/70">
        Ces informations alimentent le site public (bannières, formulaires, contacts).
      </p>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSave} noValidate>
        <Field label="Nom de l’événement" required>
          <Input value={form.eventName} onChange={(e) => setField('eventName', e.target.value)} />
        </Field>
        <Field label="Nom court" required hint="Utilisé dans les titres, badges et e-mails.">
          <Input value={form.shortName} onChange={(e) => setField('shortName', e.target.value)} />
        </Field>
        <Field label="Édition">
          <Input value={form.edition} onChange={(e) => setField('edition', e.target.value)} />
        </Field>
        <Field label="Date (affichage)" hint="Texte libre — ex : Mars 2027">
          <Input value={form.date} onChange={(e) => setField('date', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Thème">
            <Textarea value={form.theme} onChange={(e) => setField('theme', e.target.value)} />
          </Field>
        </div>
        <Field label="Lieu">
          <Input value={form.venue} onChange={(e) => setField('venue', e.target.value)} />
        </Field>
        <Field label="Date limite de candidature" hint="Texte libre — ex : Mars 2027 (date exacte à confirmer)">
          <Input value={form.applicationDeadline} onChange={(e) => setField('applicationDeadline', e.target.value)} />
        </Field>
        <Field label="E-mail de contact">
          <Input type="email" value={form.contactEmail} onChange={(e) => setField('contactEmail', e.target.value)} />
        </Field>
        <Field label="Téléphone de contact">
          <Input value={form.contactPhone} onChange={(e) => setField('contactPhone', e.target.value)} />
        </Field>
        <Field label="Taille maximale du PDF (Mo)" hint="Documents de candidature uniquement (3 pages max imposées).">
          <Input
            type="number"
            min={1}
            max={20}
            value={form.maxPdfSizeMb}
            onChange={(e) => setField('maxPdfSizeMb', Number(e.target.value) || 1)}
          />
        </Field>

        <div className="grid content-start gap-3 sm:col-span-2 sm:grid-cols-3">
          <ToggleField
            label="Inscriptions ouvertes"
            hint="Participants"
            checked={form.registrationOpen}
            onChange={(v) => setField('registrationOpen', v)}
          />
          <ToggleField
            label="Candidatures ouvertes"
            hint="Challengers"
            checked={form.applicationOpen}
            onChange={(v) => setField('applicationOpen', v)}
          />
          <ToggleField
            label="Vote public ouvert"
            hint="Distinctions"
            checked={form.votingOpen}
            onChange={(v) => setField('votingOpen', v)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les paramètres'}
          </Button>
          {saved && <span className="text-sm font-medium text-emerald-700">✓ Paramètres enregistrés.</span>}
        </div>
      </form>
    </Card>
  )
}

/* ---------- b) FAQ ---------- */

interface FaqForm {
  question: string
  answer: string
  order: string
  published: boolean
}

function emptyFaqForm(): FaqForm {
  return { question: '', answer: '', order: '1', published: true }
}

function faqFormFromItem(item: FaqItem): FaqForm {
  return { question: item.question, answer: item.answer, order: String(item.order), published: item.published }
}

function FaqSection() {
  const { items, loading, refresh } = useCollection(() => db.faq.list(), [])
  const [form, setForm] = useState<FaqForm>(emptyFaqForm)
  const [editing, setEditing] = useState<FaqItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, flash] = useFlash()

  const sorted = useFaqOrdered(items)

  function startCreate() {
    setEditing(null)
    setError(null)
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 1
    setForm({ ...emptyFaqForm(), order: String(nextOrder) })
  }

  function startEdit(item: FaqItem) {
    setEditing(item)
    setError(null)
    setForm(faqFormFromItem(item))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.question.trim()) {
      setError('Veuillez renseigner la question.')
      return
    }
    setSaving(true)
    setError(null)
    const data = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      order: Math.max(0, Math.floor(Number(form.order) || 0)),
      published: form.published,
    }
    try {
      if (editing) {
        await db.faq.update(editing.id, data)
        await audit('faq.updated', 'faq', editing.id, { question: data.question })
        flash('success', 'Entrée FAQ modifiée.')
      } else {
        const doc = await db.faq.add({ ...data, editionId: 'jsb-2027' })
        await audit('faq.created', 'faq', doc.id, { question: data.question })
        flash('success', 'Entrée FAQ ajoutée.')
      }
      setEditing(null)
      setForm(emptyFaqForm())
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(item: FaqItem) {
    setBusyId(item.id)
    const next = !item.published
    try {
      await db.faq.update(item.id, { published: next })
      await audit('faq.toggle_published', 'faq', item.id, { published: next })
      await refresh()
    } catch {
      flash('error', 'Une erreur est survenue lors de la mise à jour.')
    } finally {
      setBusyId(null)
    }
  }

  async function removeItem(item: FaqItem) {
    if (!window.confirm(`Supprimer la question « ${item.question} » ?`)) return
    setBusyId(item.id)
    try {
      await db.faq.remove(item.id)
      await audit('faq.deleted', 'faq', item.id, { question: item.question })
      if (editing?.id === item.id) {
        setEditing(null)
        setForm(emptyFaqForm())
      }
      await refresh()
      flash('success', 'Entrée FAQ supprimée.')
    } catch {
      flash('error', 'Une erreur est survenue lors de la suppression.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-forest-500">Questions fréquentes (FAQ)</h2>
          <p className="mt-1 text-sm text-forest-700/70">Visible sur le site public, triée par ordre croissant.</p>
        </div>
        {!editing && (
          <Button variant="outline" type="button" onClick={startCreate}>
            ＋ Nouvelle question
          </Button>
        )}
      </div>
      <NoticeBanner notice={notice} />

      <form className="mt-5 grid gap-4 rounded-xl border border-forest-100 bg-forest-50/40 p-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div className="sm:col-span-2">
          <Field label="Question" required error={error ?? undefined}>
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Réponse">
            <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </Field>
        </div>
        <Field label="Ordre d’affichage">
          <Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-forest-700">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="h-4 w-4 accent-gold-500"
          />
          Publiée
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter la question'}
          </Button>
          {editing && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setEditing(null)
                setError(null)
                setForm(emptyFaqForm())
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingState label="Chargement de la FAQ…" />
      ) : sorted.length === 0 ? (
        <div className="mt-4">
          <EmptyState message="Aucune question enregistrée. Ajoutez la première ci-dessus." />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {sorted.map((item) => {
            const busy = busyId === item.id
            return (
              <li key={item.id} className="rounded-xl border border-forest-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-medium text-forest-700">
                    <span className="mr-2 text-xs font-semibold text-forest-700/50">n°{item.order}</span>
                    {item.question}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge tone={item.published ? 'green' : 'gray'}>{item.published ? 'Publiée' : 'Masquée'}</Badge>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => togglePublished(item)}
                      className="text-xs font-semibold text-forest-600 underline underline-offset-2 hover:text-gold-500 disabled:opacity-50"
                    >
                      {item.published ? 'Dépublier' : 'Publier'}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-forest-700/80">{item.answer || '—'}</p>
                <div className="mt-3 flex gap-2 border-t border-forest-100 pt-3">
                  <Button variant="ghost" type="button" onClick={() => startEdit(item)}>
                    Modifier
                  </Button>
                  <Button variant="danger" type="button" disabled={busy} onClick={() => removeItem(item)}>
                    Supprimer
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function useFaqOrdered(items: FaqItem[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

/* ---------- c) Distinctions ---------- */

interface AwardForm {
  name: string
  description: string
  criteria: string
  rewardInfo: string
  order: string
}

function emptyAwardForm(): AwardForm {
  return { name: '', description: '', criteria: 'À confirmer', rewardInfo: 'Informations à venir', order: '1' }
}

function awardFormFromItem(item: Award): AwardForm {
  return {
    name: item.name,
    description: item.description,
    criteria: item.criteria,
    rewardInfo: item.rewardInfo,
    order: String(item.order),
  }
}

const FORBIDDEN_AWARD = 'meilleur jeune chercheur'

function AwardSection() {
  const { items, loading, refresh } = useCollection(() => db.awards.list(), [])
  const [form, setForm] = useState<AwardForm>(emptyAwardForm)
  const [editing, setEditing] = useState<Award | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, flash] = useFlash()

  const sorted = useAwardOrdered(items)

  function startCreate() {
    setEditing(null)
    setError(null)
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 1
    setForm({ ...emptyAwardForm(), order: String(nextOrder) })
  }

  function startEdit(item: Award) {
    setEditing(item)
    setError(null)
    setForm(awardFormFromItem(item))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Veuillez renseigner le nom de la distinction.')
      return
    }
    if (name.toLowerCase().includes(FORBIDDEN_AWARD)) {
      setError('Cette distinction est réservée — elle ne peut pas être créée ni modifiée ici.')
      return
    }
    setSaving(true)
    setError(null)
    const data = {
      name,
      description: form.description.trim(),
      criteria: form.criteria.trim(),
      rewardInfo: form.rewardInfo.trim(),
      order: Math.max(0, Math.floor(Number(form.order) || 0)),
    }
    try {
      if (editing) {
        await db.awards.update(editing.id, data)
        await audit('award.updated', 'award', editing.id, { name: data.name })
        flash('success', `Distinction « ${data.name} » modifiée.`)
      } else {
        const doc = await db.awards.add({ ...data, evaluationNotes: '', editionId: 'jsb-2027' })
        await audit('award.created', 'award', doc.id, { name: data.name })
        flash('success', `Distinction « ${data.name} » créée.`)
      }
      setEditing(null)
      setForm(emptyAwardForm())
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(item: Award) {
    if (!window.confirm(`Supprimer la distinction « ${item.name} » ?`)) return
    setBusyId(item.id)
    try {
      await db.awards.remove(item.id)
      await audit('award.deleted', 'award', item.id, { name: item.name })
      if (editing?.id === item.id) {
        setEditing(null)
        setForm(emptyAwardForm())
      }
      await refresh()
      flash('success', `Distinction « ${item.name} » supprimée.`)
    } catch {
      flash('error', 'Une erreur est survenue lors de la suppression.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-forest-500">Distinctions officielles</h2>
          <p className="mt-1 text-sm text-forest-700/70">
            Les 5 distinctions fixes de l’édition. Montants et modalités : « À confirmer » tant qu’ils ne sont pas officiels.
          </p>
        </div>
        {!editing && (
          <Button variant="outline" type="button" onClick={startCreate}>
            ＋ Nouvelle distinction
          </Button>
        )}
      </div>
      <NoticeBanner notice={notice} />

      <form className="mt-5 grid gap-4 rounded-xl border border-forest-100 bg-forest-50/40 p-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div className="sm:col-span-2">
          <Field label="Nom de la distinction" required error={error ?? undefined}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Critères d’attribution">
            <Textarea value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} />
          </Field>
        </div>
        <Field label="Récompense / information" hint="Laisser « Informations à venir » si non officiel.">
          <Input value={form.rewardInfo} onChange={(e) => setForm({ ...form, rewardInfo: e.target.value })} />
        </Field>
        <Field label="Ordre d’affichage">
          <Input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
        </Field>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter la distinction'}
          </Button>
          {editing && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setEditing(null)
                setError(null)
                setForm(emptyAwardForm())
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingState label="Chargement des distinctions…" />
      ) : sorted.length === 0 ? (
        <div className="mt-4">
          <EmptyState message="Aucune distinction enregistrée." />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {sorted.map((item) => {
            const busy = busyId === item.id
            return (
              <li key={item.id} className="rounded-xl border border-gold-400/40 bg-gold-300/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-serif font-bold text-forest-500">
                    <span className="mr-2 text-xs text-forest-700/50">n°{item.order}</span>🏅 {item.name}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" type="button" onClick={() => startEdit(item)}>
                      Modifier
                    </Button>
                    <Button variant="danger" type="button" disabled={busy} onClick={() => removeItem(item)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
                {item.description && <p className="mt-1 text-sm text-forest-700/80">{item.description}</p>}
                <p className="mt-1 text-xs text-forest-700/60">
                  <span className="font-semibold">Critères :</span> {item.criteria || 'À confirmer'}
                </p>
                <p className="text-xs text-forest-700/60">
                  <span className="font-semibold">Récompense :</span> {item.rewardInfo || 'Informations à venir'}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function useAwardOrdered(items: Award[]) {
  return [...items].sort((a, b) => a.order - b.order)
}

/* ---------- Page ---------- */

export default function ContentAdminPage() {
  function handleResetDemo() {
    const ok = window.confirm(
      'Réinitialiser la démo ? Toutes les données locales (inscriptions, candidatures, sponsors, contenu édité) seront effacées et le jeu de données de démonstration sera restauré.',
    )
    if (!ok) return
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div>
      <PageHeader
        title="Contenu & paramètres"
        subtitle="Configuration de l’événement, FAQ, distinctions officielles et données de démonstration."
      />
      <SettingsSection />
      <FaqSection />
      <AwardSection />

      <div className="flex justify-center py-6">
        <button
          type="button"
          onClick={handleResetDemo}
          className="text-xs font-medium text-forest-700/50 underline decoration-dotted underline-offset-4 transition hover:text-red-600"
        >
          Réinitialiser la démo (données locales)
        </button>
      </div>
    </div>
  )
}
