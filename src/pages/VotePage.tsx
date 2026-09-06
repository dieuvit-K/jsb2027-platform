/**
 * Page publique — Vote du public « Coup de cœur » (route /vote).
 * Une adresse e-mail = un vote. Vérification par code (démo locale) + journalisation e-mail.
 * Aucun résultat ni note du comité n'est affiché ici.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, KeyRound, RotateCcw } from 'lucide-react'
import { Button, Card, EmptyState, Field, Input, LoadingState, PageHeader, Spinner } from '../components/ui'
import { db, settingsApi } from '../services/store'
import { audit } from '../services/audit'
import { logEmail } from '../features/badges/badgeService'
import { isValidEmail, normalizeEmail } from '../utils/helpers'
import type { Candidate } from '../types'

type Step = 'choose' | 'email' | 'verify' | 'success'

function shortDescription(text: string): string {
  return text.length > 160 ? `${text.slice(0, 160).trimEnd()}…` : text
}

function newCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export default function VotePage() {
  const [loading, setLoading] = useState(true)
  const [votingOpen, setVotingOpen] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const [step, setStep] = useState<Step>('choose')
  const [selectedId, setSelectedId] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [expectedCode, setExpectedCode] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const selected = candidates.find((c) => c.id === selectedId) ?? null

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [settings, all] = await Promise.all([settingsApi.get(), db.candidates.list()])
        if (cancelled) return
        setVotingOpen(settings.votingOpen)
        setCandidates(all.filter((c) => c.applicationStatus === 'SELECTED'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function sendCode() {
    if (!isValidEmail(email)) {
      setEmailError('Veuillez saisir une adresse e-mail valide.')
      return
    }
    setBusy(true)
    setEmailError('')
    setFormError('')
    try {
      const codeValue = newCode()
      setExpectedCode(codeValue)
      setSentTo(email.trim())
      await logEmail(
        'VoteVerificationCode',
        normalizeEmail(email),
        'Code de vérification — Vote JSB 2027',
        `Votre code de vérification pour le vote du public (Coup de cœur) est : ${codeValue}`,
      )
      setCode('')
      setCodeError('')
      setStep('verify')
    } finally {
      setBusy(false)
    }
  }

  async function submitVote() {
    if (!selected) return
    setBusy(true)
    setCodeError('')
    setFormError('')
    try {
      if (code.trim() !== expectedCode) {
        setCodeError('Le code saisi est incorrect. Veuillez réessayer.')
        return
      }
      const norm = normalizeEmail(email)
      const existing = await db.votes.find((v) => normalizeEmail(v.email) === norm)
      if (existing.length > 0) {
        setFormError('Cette adresse e-mail a déjà voté. Un seul vote par adresse est autorisé.')
        return
      }
      await db.votes.add({ editionId: 'jsb-2027', email: norm, candidateId: selected.id, verified: true })
      await audit('public_vote', 'candidate', selected.id, { email: norm })
      setStep('success')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader
        title="Coup de cœur du public"
        subtitle="Votez pour le projet qui vous a le plus marqué. Une adresse e-mail = un vote — votre adresse ne sera jamais publiée."
      />

      {loading ? (
        <LoadingState label="Chargement du vote…" />
      ) : !votingOpen ? (
        <Card className="text-center">
          <p className="font-serif text-xl font-semibold text-forest-500">
            Le vote du public n’est pas encore ouvert.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-forest-700/70">
            Le résultat du Coup de cœur du public sera annoncé lors de la cérémonie de clôture de la JSB 2027.
          </p>
        </Card>
      ) : candidates.length === 0 ? (
        <EmptyState message="Aucun projet éligible au vote pour le moment." />
      ) : step === 'choose' ? (
        <section>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-forest-500">Choisissez votre projet</h2>
            <p className="text-xs text-forest-700/60">
              {candidates.length} projet{candidates.length > 1 ? 's' : ''} en compétition
            </p>
          </div>

          <div className="space-y-3">
            {candidates.map((c) => {
              const active = c.id === selectedId
              return (
                <label
                  key={c.id}
                  className={`block cursor-pointer rounded-2xl border p-4 transition sm:p-5 ${
                    active
                      ? 'border-gold-400 bg-gold-300/10 ring-2 ring-gold-300/50'
                      : 'border-forest-100 bg-white shadow-sm hover:border-forest-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={c.id}
                    checked={active}
                    onChange={() => {
                      setSelectedId(c.id)
                      setFormError('')
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        active ? 'border-gold-500' : 'border-forest-200'
                      }`}
                    >
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-snug text-forest-800">{c.projectTitle}</h3>
                      <p className="mt-0.5 text-sm text-forest-700/70">
                        {c.firstName} {c.lastName}
                        {c.institution && c.institution !== '—' ? ` · ${c.institution}` : ''}
                      </p>
                      {c.projectDescription && (
                        <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                          {shortDescription(c.projectDescription)}
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          {formError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={() => setStep('email')} disabled={!selectedId || busy} className="sm:min-w-48">
              Continuer
            </Button>
            <p className="text-xs text-forest-700/60">Étape 1 sur 3 — ensuite votre e-mail et un code de vérification.</p>
          </div>
        </section>
      ) : step === 'email' ? (
        <Card>
          {selected && (
            <p className="mb-4 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-700">
              <span className="font-semibold">Projet choisi :</span> {selected.projectTitle}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void sendCode()
            }}
            className="space-y-4"
          >
            <Field label="Votre adresse e-mail" required error={emailError} hint="Un code de vérification vous sera demandé à l’étape suivante.">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="vous@exemple.com"
                autoComplete="email"
                disabled={busy}
              />
            </Field>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" disabled={busy}>
                {busy && <Spinner className="h-4 w-4" />}
                Envoyer le code de vérification
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep('choose')} disabled={busy}>
                ← Modifier le projet
              </Button>
            </div>
          </form>
        </Card>
      ) : step === 'verify' ? (
        <Card>
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-gold-400/60 bg-gold-300/10 px-4 py-3">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
            <p className="text-sm leading-relaxed text-forest-800">
              <span className="font-semibold">Mode démo :</span> votre code de vérification est{' '}
              <span className="font-mono text-base font-bold tracking-widest text-gold-500">{expectedCode}</span>{' '}
              (en production, il sera envoyé par e-mail).
              {sentTo && <span className="mt-1 block text-xs text-forest-700/60">Code affiché pour : {sentTo}</span>}
            </p>
          </div>

          {selected && (
            <p className="mb-4 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-700">
              <span className="font-semibold">Projet choisi :</span> {selected.projectTitle}
            </p>
          )}

          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submitVote()
            }}
            className="space-y-4"
          >
            <Field label="Code de vérification" required error={codeError}>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''))
                  setCodeError('')
                }}
                placeholder="••••••"
                disabled={busy}
                className="font-mono text-lg tracking-[0.4em]"
              />
            </Field>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" disabled={busy || code.length < 6}>
                {busy && <Spinner className="h-4 w-4" />}
                Confirmer mon vote
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStep('email')} disabled={busy}>
                ← Modifier l’e-mail
              </Button>
              <Button type="button" variant="ghost" onClick={() => void sendCode()} disabled={busy}>
                <RotateCcw className="h-4 w-4" />
                Renvoyer le code
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-forest-500">
            Votre vote a bien été enregistré. Merci !
          </h2>
          {selected && (
            <p className="mt-2 text-sm text-forest-700/80">
              Votre vote pour « {selected.projectTitle} » a bien été pris en compte.
            </p>
          )}
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-forest-700/70">
            Le résultat du Coup de cœur du public sera annoncé lors de la cérémonie de clôture de la JSB 2027.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-forest-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-600"
            >
              Retour à l’accueil
            </Link>
          </div>
        </Card>
      )}
    </main>
  )
}
