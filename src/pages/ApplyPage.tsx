import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { EventSettings } from '../types'
import { db, settingsApi } from '../services/store'
import { logEmail } from '../features/badges/badgeService'
import {
  fileSizeHuman,
  isValidEmail,
  isValidPhone,
  makeReference,
  normalizeEmail,
} from '../utils/helpers'
import {
  Button,
  Card,
  Field,
  Input,
  LoadingState,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from '../components/ui'

/**
 * Page publique de candidature scientifique — JSB 2027.
 * UN formulaire = UN projet (les 5 distinctions ne sont pas des candidatures).
 *
 * Règle produit : le poster n'est JAMAIS téléversé ici. Seule la question
 * « Prix du meilleur poster ? » (Oui/Non) est posée.
 *
 * Démo locale : le PDF est converti en data URL et stocké en localStorage via
 * db.candidates. En production : upload vers Firebase Storage (accès privé,
 * URL signée) — ne jamais stocker le fichier en base.
 */

/* ---------- Données de référence (cf. cahier des charges §12) ---------- */
// Idéalement, ces listes seraient administrables via settings (cf. §12 du cahier
// des charges) ; ici, un point unique de définition dans cette page.

interface SchoolDef {
  value: string
  label: string
  faculty: string
  institution: string
  programs?: string[]
  customProgram?: boolean
  programLabel?: string
  programPlaceholder?: string
  needsOtherName?: boolean
  overviewTitle?: string
  overviewNote?: string
  showInEligibility?: boolean
}

const SCHOOLS: SchoolDef[] = [
  {
    value: 'FST',
    label: 'Faculté des Sciences et Techniques (FST)',
    faculty: 'Faculté des Sciences et Techniques',
    institution: 'Université Marien Ngouabi',
    programs: ['BCM', 'BPA', 'BPV', 'QHSE', 'VPAM', 'T2A'],
    overviewTitle: 'FST — niveau Master',
    showInEligibility: true,
  },
  {
    value: 'ENS',
    label: 'École Normale Supérieure (ENS)',
    faculty: 'École Normale Supérieure',
    institution: 'Université Marien Ngouabi',
    programs: ['SVT'],
    overviewTitle: 'ENS — parcours SVT',
    showInEligibility: true,
  },
  {
    value: 'ENSP',
    label: 'École Nationale Supérieure Polytechnique (ENSP)',
    faculty: 'ENSP',
    institution: 'Université Marien Ngouabi',
    programs: ['Génie alimentaire'],
    overviewTitle: 'ENSP — Génie alimentaire',
    showInEligibility: true,
  },
  {
    value: 'FSSA',
    label: 'Faculté des Sciences de la Santé (FSSA)',
    faculty: 'Faculté des Sciences de la Santé (FSSA)',
    institution: 'Université Marien Ngouabi',
    programs: [],
    customProgram: true,
    programLabel: 'Parcours',
    programPlaceholder: 'Préciser votre parcours',
    overviewTitle: 'FSSA',
    overviewNote: 'Parcours — liste administrable',
    showInEligibility: true,
  },
  {
    value: 'AUTRE',
    label: 'Autre établissement',
    faculty: 'Autre',
    institution: 'Autre',
    programs: [],
    customProgram: true,
    programLabel: 'Parcours / spécialité',
    programPlaceholder: 'Préciser votre parcours ou spécialité',
    needsOtherName: true,
    showInEligibility: false,
  },
  {
    value: 'IND',
    label: 'Chercheur / innovateur indépendant',
    faculty: '—',
    institution: '—',
    overviewTitle: 'Indépendants',
    overviewNote: 'Chercheurs & innovateurs indépendants',
    showInEligibility: true,
  },
]

const STATUS_OPTIONS = [
  { value: 'Étudiant (Master)', eligible: true },
  { value: 'Doctorant', eligible: true },
  { value: 'Enseignant-chercheur', eligible: true },
  { value: 'Chercheur indépendant', eligible: true },
  { value: 'Innovateur indépendant', eligible: true },
  { value: 'Autre', eligible: false },
]

const PROJECT_TYPES = ['Projet de recherche', 'Innovation', 'Autre']

const MIN_DESCRIPTION = 100
const STEP_LABELS = ['Éligibilité', 'Informations', 'Projet', 'Document']
const POSTER_CHOICES = ['oui', 'non'] as const

type PosterChoice = (typeof POSTER_CHOICES)[number]

interface FormState {
  status: string
  school: string
  otherInstitution: string
  program: string
  programText: string
  firstName: string
  lastName: string
  email: string
  phone: string
  laboratory: string
  projectTitle: string
  projectType: string
  researchTheme: string
  projectDescription: string
  wantsPoster: '' | PosterChoice
}

type FieldKey = keyof FormState
type FormErrors = Partial<Record<FieldKey, string>>

const DEFAULT_FORM: FormState = {
  status: '',
  school: '',
  otherInstitution: '',
  program: '',
  programText: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  laboratory: '',
  projectTitle: '',
  projectType: '',
  researchTheme: '',
  projectDescription: '',
  wantsPoster: '',
}

/* ---------- Petits utilitaires fichier ---------- */

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Lecture brute octet→octet (latin1) pour inspecter l'en-tête %PDF et /Count. */
function readAsBinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer
      resolve(new TextDecoder('latin1').decode(buf))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Heuristique du nombre de pages : lecture du « /Count » des objets Pages.
 * Certains PDF compressés n'exposent pas ce compteur en clair → retourne null
 * et on laisse passer (impossible à vérifier côté client sans bibliothèque).
 */
function readPdfPageCount(binary: string): number | null {
  try {
    const counts = [...binary.matchAll(/\/Count\s+(\d+)/g)].map((m) => parseInt(m[1], 10))
    return counts.length > 0 ? Math.max(...counts) : null
  } catch {
    return null
  }
}

/** Profil académique dérivé → champs du document Candidate. */
function deriveProfile(f: FormState) {
  const def = SCHOOLS.find((s) => s.value === f.school)
  if (f.school === 'AUTRE') {
    return {
      school: 'Autre',
      faculty: f.otherInstitution.trim(),
      institution: f.otherInstitution.trim(),
      program: f.programText.trim() || 'À préciser',
    }
  }
  if (!def) {
    return { school: '', faculty: '—', institution: '—', program: '' }
  }
  if (def.value === 'IND') {
    return { school: 'Indépendant', faculty: '—', institution: '—', program: 'Indépendant' }
  }
  return {
    school: def.value,
    faculty: def.faculty,
    institution: def.institution,
    program: def.customProgram ? f.programText.trim() : f.program,
  }
}

/* ================================================================ */

export default function ApplyPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [settingsError, setSettingsError] = useState(false)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; dataUrl: string } | null>(null)
  const [fileError, setFileError] = useState('')

  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState<{ reference: string; wantsPosterAward: boolean } | null>(null)

  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    settingsApi
      .get()
      .then((s) => {
        if (mounted) setSettings(s)
      })
      .catch(() => {
        if (mounted) setSettingsError(true)
      })
      .finally(() => {
        if (mounted) setLoadingSettings(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const scrollToTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  /* ---------- Édition des champs ---------- */
  function setField<K extends FieldKey>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    setSubmitError('')
  }

  function handleSchoolChange(value: string) {
    setForm((prev) => ({
      ...prev,
      school: value,
      program: '',
      programText: '',
      otherInstitution: '',
    }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.school
      delete next.program
      delete next.programText
      delete next.otherInstitution
      return next
    })
    setSubmitError('')
  }

  /* ---------- Validation par étape ---------- */
  function validateStep(idx: number): FormErrors {
    const e: FormErrors = {}
    const f = form

    if (idx === 0) {
      if (!f.status) e.status = 'Veuillez sélectionner votre statut.'
      if (!f.school) e.school = 'Veuillez sélectionner votre établissement.'
      const def = SCHOOLS.find((s) => s.value === f.school)
      if (def?.needsOtherName && !f.otherInstitution.trim()) {
        e.otherInstitution = "Veuillez préciser le nom de votre établissement."
      }
      if (def?.customProgram && !f.programText.trim()) {
        e.programText = 'Veuillez préciser votre parcours.'
      }
      if (def?.programs && def.programs.length > 0 && !f.program) {
        e.program = 'Veuillez sélectionner votre parcours.'
      }
    }

    if (idx === 1) {
      if (!f.firstName.trim()) e.firstName = 'Veuillez renseigner votre prénom.'
      if (!f.lastName.trim()) e.lastName = 'Veuillez renseigner votre nom.'
      if (!f.email.trim()) {
        e.email = 'Veuillez renseigner votre e-mail.'
      } else if (!isValidEmail(f.email)) {
        e.email = 'Cette adresse e-mail semble invalide.'
      }
      if (!f.phone.trim()) {
        e.phone = 'Veuillez renseigner votre numéro de téléphone.'
      } else if (!isValidPhone(f.phone)) {
        e.phone = 'Ce numéro de téléphone semble invalide.'
      }
    }

    if (idx === 2) {
      if (!f.projectTitle.trim()) e.projectTitle = 'Veuillez renseigner le titre de votre projet.'
      if (!f.projectType) e.projectType = 'Veuillez sélectionner le type de projet.'
      if (!f.researchTheme.trim()) e.researchTheme = 'Veuillez renseigner la thématique de votre projet.'
      if (f.projectDescription.trim().length < MIN_DESCRIPTION) {
        e.projectDescription = `La description doit contenir au moins ${MIN_DESCRIPTION} caractères (actuellement ${f.projectDescription.trim().length}).`
      }
      if (!f.wantsPoster) {
        e.wantsPoster = 'Veuillez indiquer si vous souhaitez participer au Prix du meilleur poster.'
      }
    }

    return e
  }

  function goNext() {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, 3))
    scrollToTop()
  }

  function goBack() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 0))
    scrollToTop()
  }

  /* ---------- Fichier PDF ---------- */
  function validatePdfFile(file: File): string | null {
    if (!settings) return 'Configuration indisponible, veuillez réessayer.'
    const isPdfByType = file.type === 'application/pdf'
    const isPdfByName = /\.pdf$/i.test(file.name)
    if (!isPdfByType && !isPdfByName) return 'Le fichier doit être au format PDF.'
    if (file.size <= 0) return 'Le fichier est vide.'
    if (file.size > settings.maxPdfSizeMb * 1024 * 1024) {
      return `Le fichier dépasse la taille maximale de ${settings.maxPdfSizeMb} Mo.`
    }
    return null
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    e.target.value = '' // permet de re-sélectionner le même fichier
    setFileError('')
    setSubmitError('')
    if (!file) {
      setFileInfo(null)
      return
    }

    const msg = validatePdfFile(file)
    if (msg) {
      setFileError(msg)
      setFileInfo(null)
      return
    }

    try {
      const binary = await readAsBinary(file)
      if (!/%PDF-/.test(binary.slice(0, 64))) {
        setFileError('Le fichier doit être un PDF valide.')
        setFileInfo(null)
        return
      }
      const pages = readPdfPageCount(binary)
      if (settings && pages !== null && pages > settings.maxPdfPages) {
        setFileError(`Le fichier doit être un PDF de ${settings.maxPdfPages} pages maximum.`)
        setFileInfo(null)
        return
      }
      const dataUrl = await readAsDataUrl(file)
      setFileInfo({ name: file.name, size: file.size, dataUrl })
    } catch {
      setFileError("Impossible de lire le fichier. Veuillez réessayer.")
      setFileInfo(null)
    }
  }

  function removeFile() {
    setFileInfo(null)
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ---------- Soumission ---------- */
  async function handleSubmit() {
    if (!settings || sending || !fileInfo) return
    setSending(true)
    setSubmitError('')

    try {
      const email = normalizeEmail(form.email)
      const duplicates = await db.candidates.find(
        (c) => c.email.toLowerCase() === email && c.editionId === 'jsb-2027',
      )
      if (duplicates.length > 0) {
        setSubmitError('Une candidature a déjà été enregistrée avec cette adresse e-mail pour la JSB 2027.')
        setSending(false)
        return
      }

      const profile = deriveProfile(form)
      const reference = makeReference('C')

      // Démo locale : data URL stockée via db (localStorage). En production :
      // upload Firebase Storage privé → stocker seulement l'URL sécurisée.
      await db.candidates.add({
        editionId: 'jsb-2027',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        phone: form.phone.trim(),
        status: form.status,
        institution: profile.institution,
        faculty: profile.faculty,
        school: profile.school,
        program: profile.program,
        laboratory: form.laboratory.trim() || '—',
        projectTitle: form.projectTitle.trim(),
        projectType: form.projectType,
        researchTheme: form.researchTheme.trim(),
        projectDescription: form.projectDescription.trim(),
        wantsPosterAward: form.wantsPoster === 'oui',
        hasDocument: true,
        documentName: fileInfo.name,
        documentSize: fileInfo.size,
        documentDataUrl: fileInfo.dataUrl,
        applicationStatus: 'SUBMITTED',
        reference,
        isChallenger: false,
      })

      await logEmail(
        'CandidateSubmissionConfirmation',
        email,
        'Candidature reçue — JSB 2027',
        `Bonjour ${form.firstName.trim()}, votre candidature « ${form.projectTitle.trim()} » (référence ${reference}) a bien été enregistrée. Le comité scientifique examinera votre dossier.`,
      )

      setSubmitted({ reference, wantsPosterAward: form.wantsPoster === 'oui' })
      scrollToTop()
    } catch {
      setSubmitError("Une erreur est survenue lors de l'envoi de votre candidature. Veuillez réessayer.")
    } finally {
      setSending(false)
    }
  }

  /* ============ Rendu ============ */

  /* --- États globaux : chargement / erreur de config / fermeture --- */
  if (loadingSettings) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <LoadingState label="Chargement des informations de candidature…" />
      </main>
    )
  }

  if (settingsError || !settings) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <PageHeader title="Candidature — JSB 2027" />
        <Card>
          <p className="text-center text-sm text-forest-700/80">
            Impossible de charger les informations de candidature.{' '}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-semibold text-forest-500 underline underline-offset-2 hover:text-forest-600"
            >
              Réessayer
            </button>
          </p>
        </Card>
      </main>
    )
  }

  if (!settings.applicationOpen) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <PageHeader title="Candidature — JSB 2027" />
        <Card className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 text-xl">
            ⏸
          </span>
          <h2 className="mt-4 font-serif text-xl font-bold text-forest-500">
            Les candidatures sont actuellement fermées.
          </h2>
          <p className="mt-2 text-sm text-forest-700/70">
            La période de dépôt des candidatures ouvrira prochainement.
            Clôture prévue : {settings.applicationDeadline}.
          </p>
        </Card>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div ref={topRef} className="scroll-mt-6" />
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-500 text-2xl font-bold text-gold-300">
            ✓
          </span>
          <h1 className="mt-5 font-serif text-2xl font-bold text-forest-500 md:text-3xl">
            Votre candidature a été enregistrée avec succès.
          </h1>
          <p className="mt-2 text-sm text-forest-700/70">
            Un accusé de réception a été consigné pour la référence ci-dessous.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-forest-700/60">
            Référence de candidature
          </p>
          <p className="mt-1 inline-block rounded-lg bg-forest-500 px-5 py-2 font-mono text-lg font-bold tracking-widest text-gold-300">
            {submitted.reference}
          </p>

          {submitted.wantsPosterAward && (
            <div className="mt-6 rounded-xl border border-gold-400/50 bg-gold-300/15 p-4 text-left">
              <p className="text-sm font-semibold text-forest-700">
                🏅 Prix du meilleur poster — vous êtes inscrit·e.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-forest-700/80">
                Le poster n'est pas téléversé à cette étape : préparez-le uniquement
                après la sélection, puis présentez-le physiquement le jour de
                l'événement (format communiqué ultérieurement).
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-forest-50/70 p-4 text-left">
            <p className="text-sm font-semibold text-forest-700">Prochaines étapes</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-forest-700/80">
              <li>Le comité scientifique examinera votre dossier.</li>
              <li>Vous serez informé·e de la décision par e-mail.</li>
              <li>
                En cas de sélection, vous deviendrez « challenger » : préparez votre
                présentation et, le cas échéant, votre poster pour la JSB 2027.
              </li>
            </ol>
          </div>

          <p className="mt-6 text-xs text-forest-700/60">
            Une question ? Écrivez-nous : {settings.contactEmail}
          </p>
        </Card>
      </main>
    )
  }

  /* --- Formulaire (wizard) --- */
  const profile = deriveProfile(form)
  const schoolDef = SCHOOLS.find((s) => s.value === form.school)
  const statusOption = STATUS_OPTIONS.find((s) => s.value === form.status)
  const statusEligible = statusOption ? statusOption.eligible : true
  const descCount = form.projectDescription.trim().length

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div ref={topRef} className="scroll-mt-6" />

      <PageHeader
        title="Candidater — JSB 2027"
        subtitle={`Déposez un projet de recherche ou une innovation devant le comité scientifique. Une candidature = un projet. Clôture : ${settings.applicationDeadline}.`}
      />

      {/* Stepper */}
      <ol className="mb-8 grid grid-cols-4 gap-1.5" aria-label="Avancement du formulaire">
        {STEP_LABELS.map((label, i) => {
          const done = i < step
          const current = i === step
          return (
            <li key={label} className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? 'bg-gold-400 text-forest-800'
                    : current
                      ? 'bg-forest-500 text-white ring-4 ring-gold-300/40'
                      : 'border border-forest-200 text-forest-300'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`text-[10px] font-medium leading-tight sm:text-xs ${
                  current ? 'text-forest-500' : done ? 'text-forest-600' : 'text-forest-300'
                }`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>

      <Card>
        {/* ---------- Étape 1 : éligibilité ---------- */}
        {step === 0 && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-500">
              1. Éligibilité &amp; parcours
            </h2>
            <p className="mt-1 text-sm text-forest-700/70">
              Vérifiez d'abord que votre profil est éligible.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-forest-100 bg-forest-50/60 p-4">
                <h3 className="text-sm font-semibold text-forest-700">Qui peut candidater ?</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-forest-700/80">
                  <li>Étudiants en Master et doctorants</li>
                  <li>Enseignants-chercheurs</li>
                  <li>Chercheurs indépendants</li>
                  <li>Innovateurs indépendants</li>
                </ul>
              </div>
              <div className="rounded-xl border border-forest-100 bg-forest-50/60 p-4">
                <h3 className="text-sm font-semibold text-forest-700">Parcours éligibles</h3>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-forest-700/80">
                  {SCHOOLS.filter((s) => s.showInEligibility).map((s) => (
                    <li key={s.value}>
                      <span className="font-semibold text-forest-600">{s.overviewTitle}</span>
                      {' — '}
                      {s.programs && s.programs.length > 0
                        ? s.programs.join(' · ')
                        : s.overviewNote}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {!statusEligible && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Seuls les étudiants (à partir du Master), doctorants, enseignants-chercheurs,
                chercheurs et innovateurs indépendants peuvent candidater. Le statut « Autre »
                n'est pas éligible pour la JSB 2027.
              </p>
            )}

            <div className="mt-6 space-y-4">
              <Field
                label="Statut"
                required
                error={errors.status}
                hint="Indiquez le statut sous lequel vous candidatez."
              >
                <Select
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  disabled={sending}
                >
                  <option value="">Sélectionnez votre statut…</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Établissement / structure"
                required
                error={errors.school}
                hint="FST, ENS, ENSP, FSSA, autre établissement ou statut indépendant."
              >
                <Select
                  value={form.school}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  disabled={sending}
                >
                  <option value="">Sélectionnez votre établissement…</option>
                  {SCHOOLS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </Field>

              {schoolDef?.needsOtherName && (
                <Field
                  label="Nom de votre établissement"
                  required
                  error={errors.otherInstitution}
                >
                  <Input
                    value={form.otherInstitution}
                    onChange={(e) => setField('otherInstitution', e.target.value)}
                    placeholder="Ex : Université, institut, faculté…"
                    disabled={sending}
                    maxLength={120}
                  />
                </Field>
              )}

              {schoolDef?.programs && schoolDef.programs.length > 0 && (
                <Field
                  label="Parcours"
                  required
                  error={errors.program}
                  hint={
                    schoolDef.value === 'FST'
                      ? 'Parcours de Master concernés.'
                      : undefined
                  }
                >
                  <Select
                    value={form.program}
                    onChange={(e) => setField('program', e.target.value)}
                    disabled={sending}
                  >
                    <option value="">Sélectionnez votre parcours…</option>
                    {schoolDef.programs.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {schoolDef?.customProgram && (
                <Field
                  label={schoolDef.programLabel ?? 'Parcours'}
                  required
                  error={errors.programText}
                  hint={
                    schoolDef.value === 'FSSA'
                      ? 'La liste des parcours FSSA est gérée par l’organisation — précisez votre parcours.'
                      : undefined
                  }
                >
                  <Input
                    value={form.programText}
                    onChange={(e) => setField('programText', e.target.value)}
                    placeholder={schoolDef.programPlaceholder}
                    disabled={sending}
                    maxLength={120}
                  />
                </Field>
              )}

              {schoolDef?.value === 'IND' && (
                <p className="rounded-lg bg-forest-50 px-3 py-2 text-xs text-forest-700/80">
                  Parcours : <span className="font-semibold">Indépendant</span> — aucun
                  parcours académique requis.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------- Étape 2 : informations personnelles & académiques ---------- */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-500">
              2. Informations personnelles &amp; académiques
            </h2>
            <p className="mt-1 text-sm text-forest-700/70">
              Ces informations permettront au comité de vous identifier et de vous contacter.
            </p>

            <div className="mt-5 rounded-xl bg-forest-50/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-forest-700">Profil sélectionné</h3>
                <button
                  type="button"
                  onClick={() => goBack()}
                  className="text-xs font-semibold text-gold-500 underline underline-offset-2 hover:text-forest-600"
                >
                  Modifier
                </button>
              </div>
              <dl className="mt-2 flex flex-wrap gap-2 text-xs">
                <div className="rounded-full bg-white px-3 py-1 font-medium text-forest-700">
                  {form.status}
                </div>
                <div className="rounded-full bg-white px-3 py-1 font-medium text-forest-700">
                  {schoolDef?.label ?? '—'}
                </div>
                <div className="rounded-full bg-white px-3 py-1 font-medium text-forest-700">
                  {profile.program || '—'}
                </div>
              </dl>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" required error={errors.firstName}>
                <Input
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  placeholder="Ex : Grâce"
                  disabled={sending}
                  maxLength={80}
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Nom" required error={errors.lastName}>
                <Input
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  placeholder="Ex : MABIALA"
                  disabled={sending}
                  maxLength={80}
                  autoComplete="family-name"
                />
              </Field>
              <Field label="Adresse e-mail" required error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="vous@exemple.cg"
                  disabled={sending}
                  maxLength={120}
                  autoComplete="email"
                />
              </Field>
              <Field label="Téléphone" required error={errors.phone}>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="+242 06 000 00 00"
                  disabled={sending}
                  maxLength={20}
                  autoComplete="tel"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Laboratoire / département"
                  hint="Facultatif — ex : Laboratoire de microbiologie."
                >
                  <Input
                    value={form.laboratory}
                    onChange={(e) => setField('laboratory', e.target.value)}
                    placeholder="Votre laboratoire ou département de rattachement"
                    disabled={sending}
                    maxLength={120}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Étape 3 : projet ---------- */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-500">3. Votre projet</h2>
            <p className="mt-1 text-sm text-forest-700/70">
              Décrivez le projet que vous souhaitez présenter à la JSB 2027.
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Titre du projet" required error={errors.projectTitle}>
                <Input
                  value={form.projectTitle}
                  onChange={(e) => setField('projectTitle', e.target.value)}
                  placeholder="Ex : Bioremédiation des sols contaminés à Brazzaville"
                  disabled={sending}
                  maxLength={200}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type de projet" required error={errors.projectType}>
                  <Select
                    value={form.projectType}
                    onChange={(e) => setField('projectType', e.target.value)}
                    disabled={sending}
                  >
                    <option value="">Sélectionnez…</option>
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Thématique de recherche" required error={errors.researchTheme}>
                  <Input
                    value={form.researchTheme}
                    onChange={(e) => setField('researchTheme', e.target.value)}
                    placeholder="Ex : Microbiologie et environnement"
                    disabled={sending}
                    maxLength={150}
                  />
                </Field>
              </div>

              <Field
                label="Description du projet"
                required
                error={errors.projectDescription}
                hint="Objectifs, méthodologie, résultats attendus, impact…"
              >
                <Textarea
                  value={form.projectDescription}
                  onChange={(e) => setField('projectDescription', e.target.value)}
                  placeholder={`Décrivez votre projet en ${MIN_DESCRIPTION} caractères minimum…`}
                  disabled={sending}
                  maxLength={2000}
                  rows={6}
                />
                <span
                  className={`mt-1 block text-right text-xs ${
                    descCount > 0 && descCount < MIN_DESCRIPTION
                      ? 'font-medium text-red-600'
                      : descCount >= MIN_DESCRIPTION
                        ? 'text-forest-600'
                        : 'text-forest-700/50'
                  }`}
                >
                  {descCount} / {MIN_DESCRIPTION} caractères minimum
                </span>
              </Field>

              <div>
                <span className="mb-1 block text-sm font-medium text-forest-700">
                  Souhaitez-vous participer au Prix du meilleur poster ?{' '}
                  <span className="text-gold-500">*</span>
                </span>
                <div
                  role="radiogroup"
                  aria-label="Participation au Prix du meilleur poster"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {POSTER_CHOICES.map((choice) => {
                    const selected = form.wantsPoster === choice
                    return (
                      <label
                        key={choice}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                          selected
                            ? 'border-forest-500 bg-forest-50'
                            : 'border-forest-200 bg-white hover:border-forest-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="wantsPoster"
                          value={choice}
                          checked={selected}
                          onChange={() => setField('wantsPoster', choice)}
                          disabled={sending}
                          className="h-4 w-4 accent-forest-500"
                        />
                        <span className="text-sm font-medium text-forest-700">
                          {choice === 'oui' ? 'Oui' : 'Non'}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {errors.wantsPoster && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.wantsPoster}</p>
                )}
                <p className="mt-2 rounded-lg bg-gold-300/20 px-3 py-2 text-xs leading-relaxed text-forest-700/90">
                  Le poster n'est <span className="font-semibold">pas téléversé</span> à cette
                  étape. Si vous choisissez « Oui » et que votre projet est sélectionné, vous
                  préparerez votre poster pour une présentation physique le jour de l'événement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Étape 4 : document & envoi ---------- */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-500">
              4. Document &amp; envoi
            </h2>
            <p className="mt-1 text-sm text-forest-700/70">
              Joignez votre document (PDF) puis validez votre candidature.
            </p>

            {/* Récapitulatif */}
            <div className="mt-5 rounded-xl bg-forest-50/60 p-4">
              <h3 className="text-sm font-semibold text-forest-700">Récapitulatif</h3>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-forest-700/50">
                    Candidat·e
                  </dt>
                  <dd className="text-forest-700">
                    {form.firstName.trim()} {form.lastName.trim()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-forest-700/50">
                    Contact
                  </dt>
                  <dd className="break-all text-forest-700">{normalizeEmail(form.email)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-forest-700/50">
                    Profil
                  </dt>
                  <dd className="text-forest-700">
                    {form.status} · {schoolDef?.label} · {profile.program || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-forest-700/50">
                    Projet
                  </dt>
                  <dd className="text-forest-700">
                    {form.projectTitle.trim()} ({form.projectType})
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-forest-700/50">
                    Thématique
                  </dt>
                  <dd className="text-forest-700">{form.researchTheme.trim()}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-forest-700/50">
                    Prix du meilleur poster
                  </dt>
                  <dd className="text-forest-700">
                    {form.wantsPoster === 'oui' ? 'Oui' : 'Non'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Upload PDF */}
            <div className="mt-6">
              <span className="mb-1 block text-sm font-medium text-forest-700">
                Document du projet (PDF){' '}
                <span className="text-gold-500">*</span>
              </span>
              <input
                ref={fileInputRef}
                id="candidature-pdf"
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={handleFileChange}
                disabled={sending}
              />

              {fileInfo ? (
                <div className="flex flex-col gap-3 rounded-xl border border-forest-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-lg">
                      📄
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-forest-700">
                        {fileInfo.name}
                      </p>
                      <p className="text-xs text-forest-700/60">
                        {fileSizeHuman(fileInfo.size)} · PDF · {settings.maxPdfPages} pages max
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <label
                      htmlFor="candidature-pdf"
                      className="cursor-pointer rounded-lg border border-forest-500 px-3 py-1.5 text-xs font-semibold text-forest-500 transition hover:bg-forest-50"
                    >
                      Remplacer
                    </label>
                    <Button type="button" variant="ghost" onClick={removeFile} disabled={sending}>
                      Retirer
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="candidature-pdf"
                  className="block cursor-pointer rounded-xl border-2 border-dashed border-forest-200 bg-forest-50/30 px-4 py-8 text-center transition hover:border-gold-400 hover:bg-forest-50/60"
                >
                  <span className="text-2xl">📄</span>
                  <p className="mt-2 text-sm font-semibold text-forest-600">
                    Cliquez pour choisir votre document
                  </p>
                  <p className="mt-1 text-xs text-forest-700/60">
                    PDF uniquement — {settings.maxPdfPages} pages maximum ·{' '}
                    {settings.maxPdfSizeMb} Mo maximum
                  </p>
                </label>
              )}

              {fileError && (
                <p className="mt-2 text-xs font-medium text-red-600">⚠ {fileError}</p>
              )}
              <p className="mt-2 text-xs text-forest-700/60">
                Le document doit présenter votre projet en {settings.maxPdfPages} pages
                maximum. Le poster n'est jamais téléversé à cette étape.
              </p>
            </div>

            {submitError && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                ⚠ {submitError}
              </p>
            )}
          </div>
        )}

        {/* ---------- Navigation ---------- */}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-forest-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack} disabled={sending}>
              ← Retour
            </Button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={goNext}
              disabled={step === 0 && !statusEligible}
              className="sm:min-w-44"
            >
              Continuer →
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit}
              disabled={sending || !fileInfo}
              className="sm:min-w-64"
            >
              {sending ? (
                <>
                  <Spinner className="h-4 w-4" /> Envoi…
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </Button>
          )}
        </div>

        {step === 0 && !statusEligible && (
          <p className="mt-3 text-center text-xs text-red-600">
            Modifiez votre statut pour continuer la candidature.
          </p>
        )}
        {step === 3 && !fileInfo && !fileError && (
          <p className="mt-3 text-center text-xs text-forest-700/60">
            Le document PDF est obligatoire pour envoyer la candidature.
          </p>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-forest-700/60">
        Une candidature = un projet. En soumettant, vous acceptez que vos informations
        soient traitées par le comité d'organisation de la JSB 2027.
        Besoin d'aide ? {settings.contactEmail} · {settings.contactPhone}
      </p>
    </main>
  )
}
