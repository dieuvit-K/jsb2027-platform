/**
 * Administration — Évaluation du Comité Scientifique (route /admin/evaluation).
 * Grille confidentielle de notation des challengers (5 critères sur 20),
 * moyenne automatique, commentaires, nominations aux distinctions et
 * verrouillage. Espace strictement privé : jamais accessible au public.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  CheckSquare,
  GraduationCap,
  Lock,
  Save,
  ShieldAlert,
  Unlock,
  User,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  LoadingState,
  PageHeader,
  Spinner,
  Textarea,
} from '../../components/ui'
import { db } from '../../services/store'
import { audit } from '../../services/audit'
import { authApi } from '../../services/auth'
import { useCollection } from '../../hooks/useCollection'
import { formatDateTimeFr } from '../../utils/helpers'
import type { AdminSession, Candidate, EvaluationScores } from '../../types'

const EDITION_ID = 'jsb-2027'

/** Distinctions officielles de secours (si la collection awards est vide). */
const FALLBACK_DISTINCTIONS = [
  'Meilleure innovation',
  'Meilleure communication orale',
  'Meilleur poster',
  'Coup de cœur du public',
  'Meilleure thématique de recherche',
]

/** Grille officielle : 5 critères notés de 0 à 20 (pas de 0,5). */
const CRITERIA: { key: keyof EvaluationScores; label: string; description: string }[] = [
  {
    key: 'originality',
    label: 'Originalité',
    description: "Caractère novateur de l'idée, du questionnement ou de la solution proposée.",
  },
  {
    key: 'methodology',
    label: 'Méthodologie',
    description: 'Rigueur de la démarche : hypothèses, protocole, analyse et validité des résultats.',
  },
  {
    key: 'clarity',
    label: 'Clarté',
    description: 'Qualité de la structuration et de la présentation du projet (oral, poster, dossier).',
  },
  {
    key: 'applicability',
    label: 'Applicabilité',
    description: 'Faisabilité et utilité concrète pour le Congo, les communautés ou le secteur concerné.',
  },
  {
    key: 'mastery',
    label: 'Maîtrise',
    description: 'Maîtrise du sujet, du vocabulaire scientifique et capacité à répondre aux questions.',
  },
]

/** Brouillon du formulaire (évaluation en cours de saisie). */
interface Draft {
  scores: EvaluationScores
  comments: string
  distinctionsNominated: string[]
}

function emptyDraft(): Draft {
  return {
    scores: { originality: 0, methodology: 0, clarity: 0, applicability: 0, mastery: 0 },
    comments: '',
    distinctionsNominated: [],
  }
}

function candidateFullName(c: Candidate): string {
  return `${c.firstName} ${c.lastName}`
}

/** Affichage d'une note en français (ex. 16.5 → « 16,5 »). */
function formatNote(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

/** Affichage de la moyenne avec deux décimales (ex. 16.25 → « 16,25 »). */
function formatAverage(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Couleurs d'une note selon la tranche : <10 rouge, 10–14,5 or, >=15 émeraude. */
function noteAppearance(n: number): { accent: string; bar: string; text: string } {
  if (n < 10) return { accent: 'accent-red-500', bar: 'bg-red-500', text: 'text-red-600' }
  if (n < 15) return { accent: 'accent-amber-500', bar: 'bg-gold-400', text: 'text-amber-600' }
  return { accent: 'accent-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600' }
}

/** Ton du badge (kit UI) associé à une moyenne. */
function averageTone(avg: number): 'red' | 'gold' | 'green' {
  if (avg < 10) return 'red'
  if (avg < 15) return 'gold'
  return 'green'
}

/** Encadré récapitulatif de la moyenne calculée en direct. */
function averageSummary(avg: number): { frame: string; text: string; label: string } {
  if (avg < 10)
    return { frame: 'border-red-200 bg-red-50/70', text: 'text-red-700', label: 'Dossier à consolider' }
  if (avg < 15)
    return { frame: 'border-gold-400/60 bg-gold-300/10', text: 'text-amber-700', label: 'Bon dossier' }
  return { frame: 'border-emerald-200 bg-emerald-50/70', text: 'text-emerald-700', label: 'Excellent dossier' }
}

type Notice = { kind: 'success' | 'error'; text: string } | null
type BusyAction = 'save' | 'lock' | 'unlock' | null

export default function EvaluationAdminPage() {
  const candidatesColl = useCollection<Candidate>(() => db.candidates.list(), [])
  const evaluationsColl = useCollection(() => db.evaluations.list(), [])
  const awardsColl = useCollection(() => db.awards.list(), [])

  const [session] = useState<AdminSession | null>(() => authApi.session())
  const isSuperAdmin = session?.role === 'SUPER_ADMIN'

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(() => emptyDraft())
  const [busy, setBusy] = useState<BusyAction>(null)
  const [notice, setNotice] = useState<Notice>(null)

  /* ---------- Données dérivées ---------- */

  const challengers = useMemo(
    () => candidatesColl.items.filter((c) => c.applicationStatus === 'SELECTED'),
    [candidatesColl.items],
  )

  const evalByCandidate = useMemo(
    () => new Map(evaluationsColl.items.map((e) => [e.candidateId, e] as const)),
    [evaluationsColl.items],
  )

  const selectedCandidate = useMemo(
    () => challengers.find((c) => c.id === selectedId) ?? null,
    [challengers, selectedId],
  )

  const existingEval = selectedId ? (evalByCandidate.get(selectedId) ?? null) : null
  const isLocked = existingEval?.isLocked ?? false

  /** Distinctions officielles : collection awards, sinon liste statique. */
  const distinctionNames = useMemo(() => {
    const names = awardsColl.items
      .map((a) => a.name.trim())
      .filter((n) => n.length > 0)
    const uniq = [...new Set(names)]
    return uniq.length > 0 ? uniq : FALLBACK_DISTINCTIONS
  }, [awardsColl.items])

  const averageLive = useMemo(
    () =>
      (draft.scores.originality +
        draft.scores.methodology +
        draft.scores.clarity +
        draft.scores.applicability +
        draft.scores.mastery) /
        5,
    [draft.scores],
  )

  /* ---------- Actions ---------- */

  function openCandidate(id: string) {
    if (id === selectedId) return
    setSelectedId(id)
    const ev = evalByCandidate.get(id)
    setDraft(
      ev
        ? {
            scores: { ...ev.scores },
            comments: ev.comments,
            distinctionsNominated: [...ev.distinctionsNominated],
          }
        : emptyDraft(),
    )
    setNotice(null)
  }

  /** Sélectionne automatiquement le premier challenger une fois les données chargées. */
  useEffect(() => {
    if (selectedId === null && !candidatesColl.loading && !evaluationsColl.loading && challengers.length > 0) {
      openCandidate(challengers[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, challengers, candidatesColl.loading, evaluationsColl.loading])

  /** Disparition automatique des confirmations de succès. */
  useEffect(() => {
    if (!notice || notice.kind !== 'success') return
    const t = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(t)
  }, [notice])

  function setScore(key: keyof EvaluationScores, value: number) {
    setDraft((d) => ({ ...d, scores: { ...d.scores, [key]: value } }))
  }

  function toggleDistinction(name: string) {
    setDraft((d) => {
      const active = d.distinctionsNominated.includes(name)
      return {
        ...d,
        distinctionsNominated: active
          ? d.distinctionsNominated.filter((n) => n !== name)
          : [...d.distinctionsNominated, name],
      }
    })
  }

  /** Enregistre (ou verrouille) l'évaluation — anti-doublon par candidateId. */
  async function handleSave(lock: boolean) {
    if (!selectedCandidate || isLocked) return
    const action: BusyAction = lock ? 'lock' : 'save'
    setBusy(action)
    setNotice(null)
    try {
      const averageScore = Math.round(averageLive * 100) / 100
      const base = {
        candidateId: selectedCandidate.id,
        evaluatorName: session?.displayName ?? 'Comité scientifique',
        scores: { ...draft.scores },
        averageScore,
        comments: draft.comments.trim(),
        distinctionsNominated: [...draft.distinctionsNominated],
        isLocked: lock,
      }
      const existing = (await db.evaluations.find((e) => e.candidateId === selectedCandidate.id))[0] ?? null
      if (existing) {
        await db.evaluations.update(existing.id, base)
      } else {
        await db.evaluations.add({ ...base, editionId: EDITION_ID })
      }
      await audit(lock ? 'evaluation_locked' : 'evaluation_saved', 'candidate', selectedCandidate.id, {
        averageScore,
      })
      await evaluationsColl.refresh()
      setNotice({
        kind: 'success',
        text: lock
          ? 'Évaluation enregistrée et verrouillée — elle n’est plus modifiable (sauf super-administrateur).'
          : 'Évaluation enregistrée avec succès.',
      })
    } catch {
      setNotice({
        kind: 'error',
        text: "L'enregistrement a échoué. Veuillez réessayer.",
      })
    } finally {
      setBusy(null)
    }
  }

  /** Déverrouillage — réservé au super-administrateur. */
  async function handleUnlock() {
    if (!selectedCandidate || !isSuperAdmin) return
    setBusy('unlock')
    setNotice(null)
    try {
      const existing = (await db.evaluations.find((e) => e.candidateId === selectedCandidate.id))[0] ?? null
      if (!existing) throw new Error('Aucune évaluation à déverrouiller.')
      await db.evaluations.update(existing.id, { isLocked: false })
      await audit('evaluation_unlocked', 'candidate', selectedCandidate.id)
      await evaluationsColl.refresh()
      setNotice({
        kind: 'success',
        text: 'Évaluation déverrouillée — les modifications sont à nouveau autorisées.',
      })
    } catch {
      setNotice({ kind: 'error', text: 'Le déverrouillage a échoué. Veuillez réessayer.' })
    } finally {
      setBusy(null)
    }
  }

  /* ---------- Rendu ---------- */

  const loading = candidatesColl.loading || evaluationsColl.loading || awardsColl.loading
  const loadError = candidatesColl.error || evaluationsColl.error || awardsColl.error

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        title="Évaluation du Comité Scientifique"
        subtitle="Grille d’appréciation des challengers — espace strictement réservé au comité."
      />

      {/* Bandeau de confidentialité */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
        <p>
          <strong className="font-semibold">Confidentialité stricte :</strong> ces appréciations sont
          strictement inaccessibles aux candidats et au public.
        </p>
      </div>

      {loading ? (
        <LoadingState label="Chargement des challengers…" />
      ) : loadError ? (
        <Card className="flex items-start gap-3 border-red-200 bg-red-50/60">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold text-red-700">Erreur de chargement des données</p>
            <p className="mt-1 text-sm text-red-700/80">{loadError}</p>
          </div>
        </Card>
      ) : challengers.length === 0 ? (
        <Card>
          <EmptyState message="Aucun challenger à évaluer pour le moment. Veuillez d’abord sélectionner des candidatures (statut « Sélectionnée ») depuis la page Candidatures." />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ---- Liste des challengers (4 cols) ---- */}
          <aside className="lg:col-span-4">
            <Card className="flex max-h-[75vh] flex-col p-4 lg:sticky lg:top-6">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <h2 className="font-serif text-lg font-bold text-forest-500">Challengers</h2>
                <Badge tone="forest">
                  {evalByCandidate.size}/{challengers.length} évalués
                </Badge>
              </div>
              <ul className="-mr-1 flex-1 space-y-2 overflow-y-auto pr-1">
                {challengers.map((c) => {
                  const ev = evalByCandidate.get(c.id)
                  const active = c.id === selectedId
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => openCandidate(c.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-forest-500 bg-forest-50/80 ring-1 ring-forest-500'
                            : 'border-forest-100 bg-white hover:border-gold-300 hover:bg-gold-300/5'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-forest-800">
                            {candidateFullName(c)}
                          </span>
                          {ev?.isLocked && (
                            <span
                              title="Évaluation verrouillée"
                              className="inline-flex shrink-0 items-center justify-center rounded-md bg-gold-300/30 p-1 text-gold-500"
                            >
                              <Lock className="h-3 w-3" />
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-forest-700/70">
                          {c.projectTitle}
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-2">
                          {ev ? (
                            <Badge tone={averageTone(ev.averageScore)}>Moyenne {formatNote(ev.averageScore)}</Badge>
                          ) : (
                            <Badge tone="gray">Non évalué</Badge>
                          )}
                          {ev && ev.distinctionsNominated.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gold-500">
                              <Award className="h-3 w-3" />
                              {ev.distinctionsNominated.length} nomination
                              {ev.distinctionsNominated.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </aside>

          {/* ---- Formulaire d'évaluation (8 cols) ---- */}
          <section className="space-y-6 lg:col-span-8">
            {selectedCandidate === null ? (
              <Card>
                <EmptyState message="Sélectionnez un challenger dans la liste pour ouvrir sa grille d’évaluation." />
              </Card>
            ) : (
              <>
                {/* En-tête projet */}
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl font-bold leading-snug text-forest-500">
                        {selectedCandidate.projectTitle}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-forest-700/80">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-4 w-4 shrink-0 text-forest-500" />
                          <strong className="font-semibold text-forest-800">
                            {candidateFullName(selectedCandidate)}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 shrink-0 text-forest-500" />
                          {selectedCandidate.institution}
                          {selectedCandidate.faculty && selectedCandidate.faculty !== '—'
                            ? ` — ${selectedCandidate.faculty}`
                            : ''}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="forest">{selectedCandidate.reference}</Badge>
                        <Badge tone="gold">{selectedCandidate.projectType}</Badge>
                        {selectedCandidate.researchTheme && (
                          <Badge tone="gray">{selectedCandidate.researchTheme}</Badge>
                        )}
                        <Badge tone="green">Challenger sélectionné</Badge>
                      </div>
                    </div>
                  </div>

                  <details className="mt-4 rounded-xl bg-forest-50/60 px-4 py-3">
                    <summary className="cursor-pointer select-none text-sm font-semibold text-forest-700">
                      Description du projet
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                      {selectedCandidate.projectDescription || 'Aucune description fournie.'}
                    </p>
                  </details>
                </Card>

                {/* Retour visuel (succès / erreur) */}
                {notice && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                      notice.kind === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {notice.kind === 'success' ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    )}
                    <p className="leading-relaxed">{notice.text}</p>
                  </div>
                )}

                {/* Bandeau de verrouillage */}
                {isLocked && (
                  <div className="flex items-start gap-3 rounded-xl border border-gold-400/70 bg-gold-300/15 px-4 py-3">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
                    <div>
                      <p className="text-sm font-semibold text-forest-800">
                        Évaluation verrouillée — modification exceptionnelle soumise à autorisation.
                      </p>
                      {!isSuperAdmin && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-forest-700/70">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Seul un super-administrateur peut déverrouiller.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Grille des 5 critères */}
                <Card className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-forest-500">Grille de notation</h3>
                    <span className="text-xs text-forest-700/60">Note de 0 à 20 · pas de 0,5</span>
                  </div>
                  <p className="mb-2 text-xs leading-relaxed text-forest-700/60">
                    Moyenne générale = somme des 5 notes ÷ 5. Seuils : moins de 10 (rouge), 10 à 14,5
                    (or), 15 et plus (émeraude).
                  </p>

                  {CRITERIA.map((c) => {
                    const value = draft.scores[c.key]
                    const app = noteAppearance(value)
                    return (
                      <div key={c.key} className="border-b border-forest-100 py-4 last:border-0">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor={`score-${c.key}`}
                            className={`text-sm font-semibold ${isLocked ? 'text-forest-700/60' : 'text-forest-800'}`}
                          >
                            {c.label}
                          </label>
                          <span className={`font-mono text-base font-bold ${app.text}`}>
                            {formatNote(value)}
                            <span className="text-xs font-medium opacity-60">/20</span>
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-forest-700/60">{c.description}</p>
                        <input
                          id={`score-${c.key}`}
                          type="range"
                          min={0}
                          max={20}
                          step={0.5}
                          value={value}
                          onChange={(e) => setScore(c.key, Number(e.target.value))}
                          disabled={isLocked}
                          className={`mt-3 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${app.accent}`}
                          aria-label={`Note ${c.label}`}
                        />
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-forest-100">
                          <div
                            className={`h-full rounded-full transition-all ${app.bar}`}
                            style={{ width: `${(value / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </Card>

                {/* Moyenne en direct */}
                <div
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${averageSummary(averageLive).frame}`}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest-700/60">
                      Moyenne générale
                    </p>
                    <p className={`mt-1 font-serif text-2xl font-bold ${averageSummary(averageLive).text}`}>
                      {formatAverage(averageLive)}
                      <span className="ml-1 text-base font-medium opacity-60">/ 20</span>
                    </p>
                  </div>
                  <Badge tone={averageTone(averageLive)}>{averageSummary(averageLive).label}</Badge>
                </div>

                {/* Commentaires confidentiels */}
                <Card className="p-5">
                  <h3 className="mb-3 font-serif text-lg font-bold text-forest-500">Appréciation générale</h3>
                  <Field
                    label="Commentaires confidentiels"
                    hint="Jamais communiqués aux candidats ni au public — à l’usage exclusif du comité."
                  >
                    <Textarea
                      className="min-h-32"
                      value={draft.comments}
                      onChange={(e) => setDraft((d) => ({ ...d, comments: e.target.value }))}
                      disabled={isLocked}
                      placeholder="Points forts, limites, recommandations au comité…"
                    />
                  </Field>
                </Card>

                {/* Distinctions proposées */}
                <Card className="p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold-500" />
                    <h3 className="font-serif text-lg font-bold text-forest-500">Distinctions proposées</h3>
                  </div>
                  <p className="mb-4 text-xs text-forest-700/60">
                    Le comité peut nominer ce challenger à une ou plusieurs distinctions officielles de la JSB
                    2027.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {distinctionNames.map((name) => {
                      const active = draft.distinctionsNominated.includes(name)
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleDistinction(name)}
                          disabled={isLocked}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            active
                              ? 'border-gold-400 bg-gold-300/20 text-forest-800'
                              : 'border-forest-200 bg-white text-forest-700/80 hover:border-forest-300 hover:bg-forest-50'
                          }`}
                        >
                          {active && <CheckSquare className="h-3.5 w-3.5 text-gold-500" />}
                          {name}
                        </button>
                      )
                    })}
                  </div>
                  {draft.distinctionsNominated.length === 0 && (
                    <p className="mt-3 text-xs text-forest-700/50">
                      Aucune nomination pour le moment — sélection facultative.
                    </p>
                  )}
                </Card>

                {/* Actions */}
                <Card className="p-5">
                  {isLocked ? (
                    isSuperAdmin ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" onClick={() => void handleUnlock()} disabled={busy !== null}>
                          {busy === 'unlock' ? <Spinner className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          Déverrouiller l’évaluation
                        </Button>
                        <p className="text-xs text-forest-700/60">
                          Le déverrouillage est tracé dans le journal d’audit.
                        </p>
                      </div>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-forest-700/70">
                        <ShieldAlert className="h-4 w-4 text-gold-500" />
                        Seul un super-administrateur peut déverrouiller cette évaluation.
                      </p>
                    )
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        variant="primary"
                        onClick={() => void handleSave(false)}
                        disabled={busy !== null}
                      >
                        {busy === 'save' ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Enregistrer
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => void handleSave(true)}
                        disabled={busy !== null}
                      >
                        {busy === 'lock' ? <Spinner className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        Enregistrer et verrouiller
                      </Button>
                      <p className="text-xs text-forest-700/60">
                        « Verrouiller » rend l’évaluation définitive — déverrouillage réservé au
                        super-administrateur.
                      </p>
                    </div>
                  )}
                </Card>

                {/* Métadonnées de l'évaluation */}
                {existingEval && (
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-forest-700/50">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Évalué par : {existingEval.evaluatorName}
                    </span>
                    <span>Dernière modification : {formatDateTimeFr(existingEval.updatedAt)}</span>
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
