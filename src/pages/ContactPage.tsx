import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { EventSettings } from '../types'
import { settingsApi } from '../services/store'
import { eventSettings } from '../config/event'
import { Button, Card, Field, Input, LoadingState, Spinner, Textarea } from '../components/ui'

export default function ContactPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    let active = true
    settingsApi
      .get()
      .then((s) => {
        if (active) setSettings(s)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return
    const form = e.currentTarget
    setSending(true)
    setSent(false)
    // Envoi simulé : aucun message n’est réellement transmis pour le moment.
    window.setTimeout(() => {
      setSending(false)
      setSent(true)
      form.reset()
    }, 900)
  }

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Contact</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Une question sur la participation, la candidature ou le sponsoring ? L’équipe
            d’organisation de la JSB vous répond.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        {loading || !settings ? (
          <LoadingState label="Chargement des coordonnées…" />
        ) : (
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Coordonnées */}
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Coordonnées officielles
                </p>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="font-semibold text-forest-700">E-mail</dt>
                    <dd>
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="text-gold-500 transition hover:text-gold-400"
                      >
                        {settings.contactEmail}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-forest-700">Téléphone</dt>
                    <dd>
                      <a
                        href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                        className="text-forest-700/90 transition hover:text-gold-500"
                      >
                        {settings.contactPhone}
                      </a>
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Organisateur
                </p>
                <p className="mt-2 font-medium leading-snug text-forest-700">
                  {settings.organizer}
                </p>
                <p className="mt-1 text-xs text-forest-700/60">
                  {settings.shortName} — {settings.edition}
                </p>
              </Card>

              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Édition 2027
                </p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-forest-700">Lieu</dt>
                    <dd className="text-forest-700/90">{settings.venue}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-forest-700">Date</dt>
                    <dd className="text-forest-700/90">{settings.date}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-forest-700">Partenaire officiel</dt>
                    <dd className="text-forest-700/90">{settings.partner}</dd>
                  </div>
                </dl>
              </Card>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <Card>
                <h2 className="font-serif text-2xl font-bold text-forest-500">Envoyer un message</h2>
                <p className="mt-1 text-sm text-forest-700/60">
                  Formulaire de démonstration : votre message n’est pas encore transmis. Pour toute
                  demande officielle, écrivez directement à {settings.contactEmail}.
                </p>

                {sent && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    ✓ Merci ! Votre message a bien été pris en compte (envoi simulé). L’équipe
                    d’organisation vous répondra prochainement.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom complet" required>
                      <Input name="name" required minLength={2} placeholder="Votre nom" disabled={sending} />
                    </Field>
                    <Field label="Adresse e-mail" required hint="Pour recevoir une réponse.">
                      <Input
                        name="email"
                        type="email"
                        required
                        placeholder="vous@exemple.org"
                        disabled={sending}
                      />
                    </Field>
                  </div>
                  <Field label="Sujet" required>
                    <Input name="subject" required placeholder="Participation, candidature, sponsoring…" disabled={sending} />
                  </Field>
                  <Field label="Message" required>
                    <Textarea name="message" required minLength={10} placeholder="Votre message…" disabled={sending} />
                  </Field>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" disabled={sending}>
                      {sending ? (
                        <>
                          <Spinner className="h-4 w-4" /> Envoi en cours…
                        </>
                      ) : (
                        'Envoyer'
                      )}
                    </Button>
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
