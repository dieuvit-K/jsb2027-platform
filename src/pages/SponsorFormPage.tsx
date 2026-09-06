import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Field, Input, Select, Textarea } from '../components/ui'
import { logEmail } from '../features/badges/badgeService'
import { db, settingsApi } from '../services/store'
import type { EventSettings } from '../types'
import { isValidEmail, isValidPhone, normalizeEmail } from '../utils/helpers'

const STRUCTURE_TYPES = ['Entreprise', 'Institution publique', 'ONG', 'Université / école', 'Autre']

const SUPPORT_TYPES = ['Financier', 'Matériel', 'Partenariat', 'Autre']

interface SponsorFormValues {
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  structureType: string
  supportType: string
  description: string
  proposedContribution: string
  consent: boolean
}

const initialForm: SponsorFormValues = {
  organizationName: '',
  contactPerson: '',
  email: '',
  phone: '',
  structureType: '',
  supportType: '',
  description: '',
  proposedContribution: '',
  consent: false,
}

function validate(form: SponsorFormValues): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!form.organizationName.trim()) errors.organizationName = 'Veuillez renseigner le nom de votre structure.'
  if (!form.contactPerson.trim()) errors.contactPerson = 'Veuillez renseigner la personne de contact.'
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
  if (!form.structureType) errors.structureType = 'Veuillez sélectionner le type de structure.'
  if (!form.supportType) errors.supportType = 'Veuillez sélectionner le type de soutien.'
  if (!form.description.trim()) errors.description = 'Veuillez décrire votre demande de soutien.'
  if (!form.proposedContribution.trim()) {
    errors.proposedContribution = 'Veuillez indiquer la contribution envisagée (type, nature ou montant indicatif).'
  }
  if (!form.consent) errors.consent = 'Veuillez accepter les conditions pour envoyer votre demande.'
  return errors
}

export default function SponsorFormPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [form, setForm] = useState<SponsorFormValues>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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

  const update = (patch: Partial<SponsorFormValues>) => setForm((f) => ({ ...f, ...patch }))

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
      await db.sponsorshipRequests.add({
        editionId: 'jsb-2027',
        organizationName: form.organizationName.trim(),
        contactPerson: form.contactPerson.trim(),
        email,
        phone: form.phone.trim(),
        structureType: form.structureType,
        supportType: form.supportType,
        description: form.description.trim(),
        proposedContribution: form.proposedContribution.trim(),
        consent: true,
        status: 'PENDING',
      })
      await logEmail(
        'SponsorRequestReceived',
        email,
        'Demande de sponsoring reçue — JSB 2027',
        `Bonjour, votre demande de sponsoring pour la JSB 2027 a bien été reçue. Elle sera examinée par l’organisation, qui reviendra vers vous à l’adresse ${email}.`,
      )
      setDone(true)
      setForm(initialForm)
    } catch {
      setSubmitError('Une erreur est survenue lors de l’envoi de votre demande. Veuillez réessayer dans quelques instants.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      {/* Bandeau d'en-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">Partenaires · JSB 2027</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">Devenir sponsor</h1>
          <p className="mt-3 max-w-2xl text-forest-100">
            Soutenez la Journée des Sciences Biologiques 2027 et associez votre structure à cet événement scientifique
            majeur au Congo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {done ? (
          /* Confirmation */
          <Card className="mx-auto max-w-2xl border-gold-400/50 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-500 text-2xl font-bold text-gold-400">
              ✓
            </span>
            <h2 className="mt-5 font-serif text-2xl font-bold text-forest-500">Votre demande a été enregistrée.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-forest-700/80">
              Elle sera examinée par l’organisation, qui reviendra vers votre structure pour échanger sur les modalités
              du partenariat.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-600"
              >
                Retour à l’accueil
              </Link>
              <Button variant="ghost" type="button" onClick={() => setDone(false)}>
                Envoyer une autre demande
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-5">
            {/* Colonne informative */}
            <aside className="space-y-6 lg:col-span-2">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest-500">Pourquoi soutenir la JSB 2027 ?</h2>
                <p className="mt-2 text-sm leading-relaxed text-forest-700/90">
                  La Journée des Sciences Biologiques rassemble étudiants, enseignants-chercheurs, innovateurs et
                  institutions autour de la recherche au service du développement du Congo.
                </p>
                <ul className="mt-4 space-y-4 text-sm leading-relaxed text-forest-700/90">
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🌟</span>
                    <span>
                      <span className="font-semibold text-forest-700">Visibilité</span> — associez votre marque à un
                      événement scientifique de référence et à ses canaux de communication.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🔬</span>
                    <span>
                      <span className="font-semibold text-forest-700">Engagement</span> — contribuez concrètement au
                      développement de la recherche et de l’innovation au Congo.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span aria-hidden="true">🤝</span>
                    <span>
                      <span className="font-semibold text-forest-700">Réseau</span> — rencontrez les acteurs
                      scientifiques, institutionnels et économiques de votre écosystème.
                    </span>
                  </li>
                </ul>
              </div>

              <Card className="bg-forest-50/60">
                <h3 className="font-serif text-lg font-bold text-forest-500">Comment ça marche ?</h3>
                <ol className="mt-3 space-y-3">
                  {[
                    'Remplissez ce formulaire (2 minutes) : nous décrivons votre structure et le soutien envisagé.',
                    'Votre demande est examinée par l’organisation, qui vous recontacte sur l’adresse indiquée.',
                    'Ensemble, nous définissons des modalités de partenariat adaptées à votre structure.',
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-forest-700/90">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-300/40 text-xs font-bold text-forest-700">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Card>

              {settings && (
                <Card>
                  <h3 className="font-serif text-lg font-bold text-forest-500">Informations pratiques</h3>
                  <dl className="mt-3 space-y-2 text-sm text-forest-700/90">
                    <div>
                      <dt className="font-semibold text-forest-500">Édition</dt>
                      <dd>{settings.shortName} — {settings.edition}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-forest-500">Organisateur</dt>
                      <dd>{settings.organizer}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-forest-500">Contact</dt>
                      <dd>{settings.contactEmail}</dd>
                    </div>
                  </dl>
                </Card>
              )}
            </aside>

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <Card>
                <h2 className="font-serif text-xl font-bold text-forest-500">Formulaire de demande</h2>
                <p className="mt-1 text-sm text-forest-700/70">Les champs marqués d’un * sont obligatoires.</p>

                {submitError && (
                  <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Nom de la structure" required error={errors.organizationName}>
                      <Input
                        value={form.organizationName}
                        onChange={(e) => update({ organizationName: e.target.value })}
                        placeholder="ex. : BioLab Congo"
                        autoComplete="organization"
                      />
                    </Field>
                  </div>

                  <Field label="Personne de contact" required error={errors.contactPerson}>
                    <Input
                      value={form.contactPerson}
                      onChange={(e) => update({ contactPerson: e.target.value })}
                      placeholder="ex. : Dr M. Samba"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Téléphone" required error={errors.phone}>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder="ex. : +242 06 000 00 00"
                      autoComplete="tel"
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Adresse e-mail" required error={errors.email}>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => update({ email: e.target.value })}
                        placeholder="ex. : contact@votre-structure.org"
                        autoComplete="email"
                      />
                    </Field>
                  </div>

                  <Field label="Type de structure" required error={errors.structureType}>
                    <Select value={form.structureType} onChange={(e) => update({ structureType: e.target.value })}>
                      <option value="" disabled>
                        Choisir…
                      </option>
                      {STRUCTURE_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Type de soutien" required error={errors.supportType}>
                    <Select value={form.supportType} onChange={(e) => update({ supportType: e.target.value })}>
                      <option value="" disabled>
                        Choisir…
                      </option>
                      {SUPPORT_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field
                      label="Description de votre demande"
                      required
                      error={errors.description}
                      hint="Présentez votre structure, vos activités et les raisons de votre soutien à la JSB 2027."
                    >
                      <Textarea
                        value={form.description}
                        onChange={(e) => update({ description: e.target.value })}
                        placeholder="ex. : Entreprise spécialisée dans les réactifs et équipements de laboratoire…"
                        className="min-h-28"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Contribution proposée"
                      required
                      error={errors.proposedContribution}
                      hint="Proposition libre de votre structure : type, nature ou montant indicatif du soutien. Aucun montant officiel n’est exigé — il s’agit uniquement de votre proposition."
                    >
                      <Textarea
                        value={form.proposedContribution}
                        onChange={(e) => update({ proposedContribution: e.target.value })}
                        placeholder="ex. : Soutien financier et mise à disposition de matériel…"
                        className="min-h-24"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update({ consent: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-forest-300 accent-forest-500"
                      />
                      <span className="text-sm leading-relaxed text-forest-700">
                        J’accepte que ces informations soient conservées et utilisées pour le traitement de ma demande
                        et la reprise de contact par l’organisation. <span className="text-gold-500">*</span>
                      </span>
                    </label>
                    {errors.consent && <span className="mt-1 block text-xs font-medium text-red-600">{errors.consent}</span>}
                  </div>

                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? 'Envoi du formulaire…' : 'Envoyer ma demande'}
                    </Button>
                    <p className="text-xs text-forest-700/60">
                      Votre demande sera examinée par l’organisation — un accusé de réception vous sera adressé par e-mail.
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
