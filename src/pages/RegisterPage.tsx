import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Field, Input, LoadingState, Select } from '../components/ui'
import { logEmail } from '../features/badges/badgeService'
import { db, settingsApi } from '../services/store'
import type { EventSettings } from '../types'
import { isValidEmail, isValidPhone, makeReference, normalizeEmail } from '../utils/helpers'

const STATUS_OPTIONS = [
  'Étudiant (Licence)',
  'Étudiant (Master)',
  'Doctorant',
  'Enseignant-chercheur',
  'Chercheur',
  'Professionnel',
  'Autre',
]

interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  institution: string
  faculty: string
  program: string
  laboratory: string
  consent: boolean
}

const initialForm: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: '',
  institution: '',
  faculty: '',
  program: '',
  laboratory: '',
  consent: false,
}

interface Confirmation {
  reference: string
  firstName: string
  lastName: string
  email: string
  status: string
  institution: string
}

function validate(form: RegisterFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.firstName.trim()) errors.firstName = 'Veuillez renseigner votre prénom.'
  if (!form.lastName.trim()) errors.lastName = 'Veuillez renseigner votre nom.'
  if (!form.email.trim()) {
    errors.email = 'Veuillez renseigner votre adresse e-mail.'
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Veuillez saisir une adresse e-mail valide.'
  }
  if (!form.phone.trim()) {
    errors.phone = 'Veuillez renseigner votre numéro de téléphone.'
  } else if (!isValidPhone(form.phone)) {
    errors.phone = 'Veuillez saisir un numéro de téléphone valide.'
  }
  if (!form.status) errors.status = 'Veuillez sélectionner votre statut.'
  if (!form.institution.trim()) errors.institution = 'Veuillez renseigner votre établissement.'
  if (!form.faculty.trim()) errors.faculty = 'Veuillez renseigner votre faculté, école ou institut.'
  if (!form.program.trim()) errors.program = 'Veuillez renseigner votre parcours.'
  if (!form.consent) errors.consent = 'Veuillez accepter les conditions pour vous inscrire.'
  return errors
}

export default function RegisterPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [form, setForm] = useState<RegisterFormValues>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<Confirmation | null>(null)

  useEffect(() => {
    let active = true
    settingsApi
      .get()
      .then((s) => {
        if (active) setSettings(s)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const update = (patch: Partial<RegisterFormValues>) => setForm((f) => ({ ...f, ...patch }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmitError('')
      return
    }
    setErrors({})
    setSubmitError('')
    setSubmitting(true)
    try {
      const email = normalizeEmail(form.email)
      const duplicates = await db.participants.find((p) => normalizeEmail(p.email) === email)
      if (duplicates.length > 0) {
        setErrors({ email: 'Un compte existe déjà avec cet e-mail pour la JSB 2027.' })
        return
      }
      const created = await db.participants.add({
        editionId: 'jsb-2027',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        phone: form.phone.trim(),
        status: form.status,
        institution: form.institution.trim(),
        faculty: form.faculty.trim(),
        program: form.program.trim(),
        laboratory: form.laboratory.trim() || '—',
        wantsCertificate: true,
        registrationStatus: 'REGISTERED',
        attendance: 'NOT_CHECKED',
        reference: makeReference('P'),
      })
      await logEmail(
        'RegistrationConfirmation',
        created.email,
        'Confirmation d’inscription — JSB 2027',
        `Bonjour ${created.firstName}, votre inscription à la JSB 2027 est confirmée. Votre référence d’inscription est ${created.reference}. Conservez ce numéro : il vous sera demandé à l’accueil le jour de l’événement.`,
      )
      setDone({
        reference: created.reference,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        status: form.status,
        institution: form.institution.trim(),
      })
      setForm(initialForm)
    } catch {
      setSubmitError('Une erreur est survenue lors de l’envoi de votre inscription. Veuillez réessayer dans quelques instants.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      {/* Bandeau d'en-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">Participation · JSB 2027</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">S’inscrire comme participant</h1>
          <p className="mt-3 max-w-2xl text-forest-100">
            Assistez à la Journée des Sciences Biologiques 2027 : conférences, communications orales, session posters
            et échanges avec la communauté scientifique. L’inscription est simple et ne nécessite aucun compte.
          </p>
          {settings && (
            <p className="mt-4 inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-forest-50">
              <span className="font-medium text-gold-300">{settings.date}</span>
              <span>·</span>
              <span>{settings.venue}</span>
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {!settings ? (
          <LoadingState label="Chargement des informations…" />
        ) : !settings.registrationOpen ? (
          /* Inscriptions fermées */
          <Card className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-bold text-forest-500">Les inscriptions sont actuellement fermées.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-forest-700/80">
              La réouverture des inscriptions sera annoncée sur cette plateforme et sur les canaux officiels de la{' '}
              {settings.organizer}. Merci de votre intérêt pour la JSB 2027.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-forest-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-600"
            >
              Retour à l’accueil
            </Link>
          </Card>
        ) : done ? (
          /* Confirmation */
          <Card className="mx-auto max-w-2xl border-gold-400/50">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest-500 text-2xl font-bold text-gold-400">
                ✓
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold text-forest-500">Inscription enregistrée !</h2>
                <p className="text-sm text-forest-700/70">Merci {done.firstName}, votre inscription à la JSB 2027 est confirmée.</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-forest-50/70 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-forest-700/60">Votre référence d’inscription</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-forest-500 md:text-3xl">{done.reference}</p>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <p className="text-forest-700">
                <span className="font-semibold text-forest-500">Nom complet :</span> {done.firstName} {done.lastName}
              </p>
              <p className="text-forest-700">
                <span className="font-semibold text-forest-500">E-mail :</span> {done.email}
              </p>
              <p className="text-forest-700">
                <span className="font-semibold text-forest-500">Statut :</span> {done.status}
              </p>
              <p className="text-forest-700">
                <span className="font-semibold text-forest-500">Établissement :</span> {done.institution}
              </p>
            </div>

            <h3 className="mt-8 font-serif text-lg font-bold text-forest-500">Prochaines étapes</h3>
            <ol className="mt-3 space-y-3">
              {[
                'Conservez votre référence d’inscription : elle vous sera demandée à l’accueil le jour de l’événement.',
                'Votre badge de participant sera remis à l’accueil le jour de la JSB 2027 — informations à venir.',
                'Une attestation de présence vous sera délivrée à l’issue de la journée.',
                'La date et le lieu définitifs seront confirmés officiellement et annoncés sur cette plateforme.',
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-sm text-forest-700/90">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-300/40 text-xs font-bold text-forest-700">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-600"
              >
                Retour à l’accueil
              </Link>
              <Button variant="ghost" type="button" onClick={() => setDone(null)}>
                Inscrire un autre participant
              </Button>
            </div>
          </Card>
        ) : (
          /* Formulaire */
          <div className="grid items-start gap-8 lg:grid-cols-5">
            {/* Colonne informative */}
            <aside className="space-y-6 lg:col-span-2">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest-500">Pourquoi participer ?</h2>
                <ul className="mt-4 space-y-4 text-sm leading-relaxed text-forest-700/90">
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🎤</span>
                    <span>
                      <span className="font-semibold text-forest-700">Conférences et communications</span> — assistez aux
                      présentations des chercheurs et innovateurs sélectionnés.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🖼️</span>
                    <span>
                      <span className="font-semibold text-forest-700">Session posters</span> — découvrez les travaux
                      présentés par les candidats au Prix du meilleur poster.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🎫</span>
                    <span>
                      <span className="font-semibold text-forest-700">Badge participant</span> — remis à l’accueil le
                      jour de l’événement (modalités à venir).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">📜</span>
                    <span>
                      <span className="font-semibold text-forest-700">Attestation de présence</span> — délivrée à
                      l’issue de la journée.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🤝</span>
                    <span>
                      <span className="font-semibold text-forest-700">Réseautage</span> — rencontrez étudiants,
                      enseignants-chercheurs, institutions et partenaires.
                    </span>
                  </li>
                </ul>
              </div>

              <Card className="bg-forest-50/60">
                <h3 className="font-serif text-lg font-bold text-forest-500">Qui peut s’inscrire ?</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                  L’inscription est ouverte à toute personne intéressée par les sciences biologiques : étudiants,
                  doctorants, enseignants-chercheurs, chercheurs, professionnels et institutions. Aucune candidature de
                  projet n’est requise pour assister à la journée.
                </p>
              </Card>
            </aside>

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <Card>
                <h2 className="font-serif text-xl font-bold text-forest-500">Formulaire d’inscription</h2>
                <p className="mt-1 text-sm text-forest-700/70">Les champs marqués d’un * sont obligatoires.</p>

                {submitError && (
                  <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Prénom" required error={errors.firstName}>
                    <Input
                      value={form.firstName}
                      onChange={(e) => update({ firstName: e.target.value })}
                      placeholder="ex. : Grâce"
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="Nom" required error={errors.lastName}>
                    <Input
                      value={form.lastName}
                      onChange={(e) => update({ lastName: e.target.value })}
                      placeholder="ex. : MABIALA"
                      autoComplete="family-name"
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Adresse e-mail" required error={errors.email}>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update({ email: e.target.value })}
                        placeholder="ex. : vous@exemple.org"
                        autoComplete="email"
                      />
                    </Field>
                  </div>

                  <Field label="Téléphone" required error={errors.phone}>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="ex. : +242 06 000 00 00"
                      autoComplete="tel"
                    />
                  </Field>
                  <Field label="Statut" required error={errors.status}>
                    <Select value={form.status} onChange={(e) => update({ status: e.target.value })}>
                      <option value="" disabled>
                        Choisir un statut…
                      </option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Établissement" required error={errors.institution}>
                      <Input
                        value={form.institution}
                        onChange={(e) => update({ institution: e.target.value })}
                        placeholder="ex. : Université Marien Ngouabi"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Faculté / École / Institut" required error={errors.faculty}>
                      <Input
                        value={form.faculty}
                        onChange={(e) => update({ faculty: e.target.value })}
                        placeholder="ex. : Faculté des Sciences et Techniques"
                      />
                    </Field>
                  </div>

                  <Field label="Parcours" required error={errors.program}>
                    <Input
                      value={form.program}
                      onChange={(e) => update({ program: e.target.value })}
                      placeholder="ex. : Biologie Cellulaire et Moléculaire"
                    />
                  </Field>
                  <Field label="Laboratoire / Département" hint="Facultatif — si applicable" error={errors.laboratory}>
                    <Input
                      value={form.laboratory}
                      onChange={(e) => update({ laboratory: e.target.value })}
                      placeholder="ex. : Laboratoire de microbiologie"
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update({ consent: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-forest-300 accent-forest-500"
                      />
                      <span className="text-sm leading-relaxed text-forest-700">
                        J’accepte les conditions de participation à la JSB 2027 et le traitement de mes informations
                        pour l’organisation de l’événement. <span className="text-gold-500">*</span>
                      </span>
                    </label>
                    {errors.consent && <span className="mt-1 block text-xs font-medium text-red-600">{errors.consent}</span>}
                  </div>

                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? 'Envoi du formulaire…' : 'Confirmer mon inscription'}
                    </Button>
                    <p className="text-xs text-forest-700/60">
                      Un e-mail de confirmation vous sera adressé avec votre référence d’inscription.
                    </p>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
