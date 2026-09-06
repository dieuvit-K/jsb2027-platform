import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Badge, Button, Card, EmptyState, Field, Input, LoadingState, PageHeader, Textarea } from '../../components/ui'
import { db } from '../../services/store'
import type { ProgramItem } from '../../types'
import { audit } from '../../services/audit'
import { useCollection } from '../../hooks/useCollection'

type Notice = { kind: 'success' | 'error'; text: string }

interface ProgramForm {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  speaker: string
  category: string
  venue: string
  order: string
  published: boolean
}

function emptyForm(): ProgramForm {
  return {
    title: '',
    description: '',
    date: 'Mars 2027',
    startTime: '09:00',
    endTime: '10:00',
    speaker: '',
    category: '',
    venue: '',
    order: '1',
    published: true,
  }
}

function formFromItem(item: ProgramItem): ProgramForm {
  return {
    title: item.title,
    description: item.description,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    speaker: item.speaker,
    category: item.category,
    venue: item.venue,
    order: String(item.order),
    published: item.published,
  }
}

export default function ProgramAdminPage() {
  const { items, loading, refresh } = useCollection(() => db.program.list(), [])
  const [form, setForm] = useState<ProgramForm>(emptyForm)
  const [editing, setEditing] = useState<ProgramItem | null>(null)
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({})
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const timerRef = useRef<number | null>(null)

  const sorted = useMemo(() => [...items].sort((a, b) => a.order - b.order), [items])
  const publishedCount = items.filter((i) => i.published).length

  function flash(kind: Notice['kind'], text: string) {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setNotice({ kind, text })
    timerRef.current = window.setTimeout(() => setNotice(null), 6000)
  }

  function startCreate() {
    setErrors({})
    setEditing(null)
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 1
    setForm({ ...emptyForm(), order: String(nextOrder) })
  }

  function startEdit(item: ProgramItem) {
    setErrors({})
    setEditing(item)
    setForm(formFromItem(item))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextErrors: { title?: string; date?: string } = {}
    if (!form.title.trim()) nextErrors.title = 'Veuillez renseigner le titre de l’activité.'
    if (!form.date.trim()) nextErrors.date = 'Veuillez renseigner une date (ex : Mars 2027).'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setNotice(null)
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      speaker: form.speaker.trim(),
      category: form.category.trim(),
      venue: form.venue.trim(),
      order: Math.max(0, Math.floor(Number(form.order) || 0)),
      published: form.published,
    }
    try {
      if (editing) {
        await db.program.update(editing.id, data)
        await audit('program.updated', 'program', editing.id, { title: data.title, order: data.order })
        flash('success', `Activité « ${data.title} » modifiée.`)
      } else {
        const doc = await db.program.add({ ...data, editionId: 'jsb-2027' })
        await audit('program.created', 'program', doc.id, { title: data.title, order: data.order })
        flash('success', `Activité « ${data.title} » créée.`)
      }
      setEditing(null)
      setForm(emptyForm())
      await refresh()
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Une erreur est survenue lors de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(item: ProgramItem) {
    setBusyId(item.id)
    setNotice(null)
    const next = !item.published
    try {
      await db.program.update(item.id, { published: next })
      await audit('program.toggle_published', 'program', item.id, { published: next })
      await refresh()
      flash('success', next ? `« ${item.title} » est maintenant publié.` : `« ${item.title} » a été dépublié.`)
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setBusyId(null)
    }
  }

  async function removeItem(item: ProgramItem) {
    if (!window.confirm(`Supprimer l’activité « ${item.title} » ? Cette action est irréversible.`)) return
    setBusyId(item.id)
    setNotice(null)
    try {
      await db.program.remove(item.id)
      await audit('program.deleted', 'program', item.id, { title: item.title })
      if (editing?.id === item.id) {
        setEditing(null)
        setForm(emptyForm())
      }
      await refresh()
      flash('success', `Activité « ${item.title} » supprimée.`)
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader title="Programme" subtitle="Déroulé de la journée — horaires, intervenants et lieux." />

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold text-forest-500">
            {editing ? `Modifier : ${editing.title}` : 'Nouvelle activité'}
          </h2>
          {editing && (
            <Button variant="ghost" type="button" onClick={startCreate}>
              ← Annuler la modification
            </Button>
          )}
        </div>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
          <div className="sm:col-span-2">
            <Field label="Titre" required error={errors.title}>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : Conférences plénières"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Présentation de l’activité…"
              />
            </Field>
          </div>
          <Field label="Date" required error={errors.date} hint="Texte libre — ex : Mars 2027">
            <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Heure de début">
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </Field>
          <Field label="Heure de fin">
            <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </Field>
          <Field label="Intervenant·e">
            <Input
              value={form.speaker}
              onChange={(e) => setForm({ ...form, speaker: e.target.value })}
              placeholder="Nom ou « À confirmer »"
            />
          </Field>
          <Field label="Catégorie">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ex : Cérémonie, Conférence, Poster…"
            />
          </Field>
          <Field label="Lieu">
            <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Salle, amphithéâtre…" />
          </Field>
          <Field label="Ordre d’affichage" hint="Numéro croissant = affiché en premier.">
            <Input
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-forest-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 accent-gold-500"
            />
            Publié sur le site public
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Ajouter l’activité'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-xl font-bold text-forest-500">Activités du programme</h2>
        <p className="text-sm text-forest-700/70">
          {items.length} activité{items.length > 1 ? 's' : ''} · {publishedCount} publiée{publishedCount > 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <LoadingState label="Chargement du programme…" />
      ) : sorted.length === 0 ? (
        <EmptyState message="Aucune activité programmée. Créez la première avec le formulaire ci-dessus." />
      ) : (
        <div className="space-y-4">
          {sorted.map((item) => {
            const busy = busyId === item.id
            return (
              <Card key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-forest-500">{item.title}</h3>
                      <Badge tone={item.published ? 'green' : 'gray'}>{item.published ? 'Publié' : 'Brouillon'}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-forest-700/80">{item.description}</p>
                  </div>
                  <span className="rounded-lg bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">
                    {item.category || 'Non catégorisé'}
                  </span>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm text-forest-700 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Date</dt>
                    <dd className="mt-0.5">{item.date}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Horaires</dt>
                    <dd className="mt-0.5">
                      {item.startTime} – {item.endTime}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Intervenant·e</dt>
                    <dd className="mt-0.5">{item.speaker || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">Lieu · Ordre</dt>
                    <dd className="mt-0.5">
                      {item.venue || '—'} · n°{item.order}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-forest-100 pt-4">
                  {item.published ? (
                    <Button variant="outline" type="button" disabled={busy} onClick={() => togglePublished(item)}>
                      Dépublier
                    </Button>
                  ) : (
                    <Button variant="secondary" type="button" disabled={busy} onClick={() => togglePublished(item)}>
                      Publier
                    </Button>
                  )}
                  <Button variant="ghost" type="button" disabled={busy} onClick={() => startEdit(item)}>
                    Modifier
                  </Button>
                  <Button variant="danger" type="button" disabled={busy} onClick={() => removeItem(item)}>
                    Supprimer
                  </Button>
                  {busy && <span className="text-xs text-forest-700/60">Opération en cours…</span>}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
