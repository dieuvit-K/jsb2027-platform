import { Link } from 'react-router-dom'
import { eventSettings } from '../config/event'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.edition} · {eventSettings.date}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-white md:text-6xl">
            Journée des Sciences Biologiques{' '}
            <span className="text-gold-400">2027</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl font-serif text-lg italic text-forest-50 md:text-xl">
            « {eventSettings.theme} »
          </p>
          <p className="mt-4 text-forest-100/90">{eventSettings.venue}</p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/participer"
              className="w-full rounded-lg bg-gold-400 px-8 py-3 font-semibold text-forest-800 transition hover:bg-gold-300 sm:w-auto"
            >
              S'inscrire comme participant
            </Link>
            <Link
              to="/candidater"
              className="w-full rounded-lg border border-gold-400 px-8 py-3 font-semibold text-gold-300 transition hover:bg-gold-400 hover:text-forest-800 sm:w-auto"
            >
              Candidater
            </Link>
            <Link
              to="/devenir-sponsor"
              className="w-full rounded-lg border border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Devenir sponsor
            </Link>
          </div>
        </div>
      </section>

      {/* Bandeau partenaire + patronage */}
      <section className="border-b border-forest-100 bg-forest-50/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-sm md:flex-row md:text-left">
          <p className="text-forest-700">
            <span className="font-semibold">Organisateur :</span>{' '}
            {eventSettings.organizer}
          </p>
          <p className="text-forest-700">
            <span className="font-semibold">Partenaire officiel :</span>{' '}
            {eventSettings.partner}
          </p>
        </div>
      </section>

      {/* Histoire rapide */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-bold text-forest-500">
              Une journée pour la science au Congo
            </h2>
            <p className="mt-4 leading-relaxed text-forest-700/90">
              Créée par {eventSettings.founder} et portée par la{' '}
              {eventSettings.organizer}, la Journée des Sciences Biologiques
              rassemble étudiants, enseignants-chercheurs, innovateurs et
              institutions autour de la recherche biologique et de ses
              applications pour le développement du Congo.
            </p>
            <p className="mt-3 leading-relaxed text-forest-700/90">
              L'événement est placé sous le haut patronage de{' '}
              {eventSettings.patronage[0]} et du{' '}
              {eventSettings.patronage[1]}.
            </p>
          </div>
          <div className="space-y-4">
            {eventSettings.history.map((h) => (
              <div
                key={h.year}
                className="flex items-center gap-4 rounded-xl border border-forest-100 bg-white p-4 shadow-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-forest-500 font-serif text-lg font-bold text-gold-400">
                  {h.year}
                </span>
                <p className="font-medium text-forest-700">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 actions principales */}
      <section className="bg-forest-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl font-bold text-forest-500">
            Comment participer ?
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                to: '/participer',
                title: 'Participer',
                text: "Assister à la journée : inscriptions ouvertes à tous, badge participant et attestation.",
                cta: "S'inscrire comme participant",
              },
              {
                to: '/candidater',
                title: 'Candidater',
                text: "Présenter votre projet de recherche ou votre innovation devant le comité scientifique.",
                cta: 'Commencer ma candidature',
              },
              {
                to: '/devenir-sponsor',
                title: 'Sponsoriser',
                text: "Soutenir la 3e édition de la JSB et associer votre structure à l'événement.",
                cta: 'Devenir sponsor',
              },
            ].map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="group rounded-2xl border border-forest-100 bg-white p-6 shadow-sm transition hover:border-gold-400 hover:shadow-md"
              >
                <h3 className="font-serif text-xl font-bold text-forest-500 group-hover:text-gold-500">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                  {c.text}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-gold-500">
                  {c.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Distinctions aperçu */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-2xl font-bold text-forest-500">
          Distinctions officielles
        </h2>
        <p className="mt-2 text-sm text-forest-700/80">
          Récompenses décernées à l'issue des évaluations —{' '}
          <span className="italic">montants et modalités : à confirmer</span>
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Meilleure innovation',
            'Meilleure communication orale',
            'Meilleur poster',
            'Coup de cœur du public',
            'Meilleure thématique de recherche',
          ].map((d) => (
            <div
              key={d}
              className="rounded-xl border border-gold-400/40 bg-gold-300/10 px-5 py-4 font-medium text-forest-700"
            >
              🏅 {d}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
