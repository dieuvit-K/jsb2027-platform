import { Link } from 'react-router-dom'
import { eventSettings } from '../config/event'
import { Card, SectionTitle } from '../components/ui'

export default function AboutPage() {
  const objectives = [
    'Valoriser les travaux de recherche menés en sciences biologiques au Congo et au-delà.',
    'Encourager les jeunes scientifiques — étudiants, doctorants et jeunes chercheurs — à s’engager dans la recherche et l’innovation.',
    'Créer un espace d’échange entre l’université, les institutions publiques et le monde socio-économique.',
    'Récompenser l’excellence à travers les cinq distinctions officielles de l’événement.',
    'Contribuer, par la science, à la transformation et à la croissance durable du Congo.',
  ]

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">À propos de la JSB</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            La Journée des Sciences Biologiques (JSB) est une manifestation scientifique annuelle qui
            rassemble étudiants, enseignants-chercheurs, innovateurs et institutions autour de la
            recherche biologique et de ses applications pour le développement du Congo.
          </p>
        </div>
      </section>

      {/* Origine et portage */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle subtitle="La JSB est née d’une conviction : la recherche en sciences du vivant doit être visible, valorisée et reliée aux besoins du pays.">
          Origine et portage
        </SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Créée par</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-forest-500">
              {eventSettings.founder}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-forest-700/80">
              La Journée des Sciences Biologiques a été créée par le Professeur Titulaire Aimé
              Christian KAYATH. La première édition s’est tenue en 2025.
            </p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Portée par</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-forest-500">
              {eventSettings.organizer}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-forest-700/80">
              La Fondation École Ké Bien — École Ké Futa (EKBF) assure l’organisation de l’événement,
              avec le soutien de son partenaire officiel, {eventSettings.partner}.
            </p>
          </Card>
        </div>
        <p className="mt-6 max-w-3xl leading-relaxed text-forest-700/90">
          Depuis sa création, la JSB se veut un rendez-vous ouvert et fédérateur : les participants
          assistent aux conférences et aux présentations, les candidats sélectionnés présentent leurs
          travaux devant l’auditoire, et les meilleures contributions sont récompensées lors de la
          cérémonie de clôture.
        </p>
      </section>

      {/* Vision et objectifs */}
      <section className="bg-forest-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <SectionTitle subtitle="Le cap qui guide chaque édition.">Vision</SectionTitle>
              <p className="leading-relaxed text-forest-700/90">
                La vision de la JSB est de faire des sciences biologiques un moteur reconnu du progrès
                au Congo : former et encourager une nouvelle génération de scientifiques, faire
                dialoguer la recherche avec la société et les décideurs, et inscrire l’innovation
                biologique au cœur du développement durable du pays.
              </p>
              <p className="mt-3 leading-relaxed text-forest-700/90">
                L’événement est placé sous le haut patronage de {eventSettings.patronage[0]} et du{' '}
                {eventSettings.patronage[1]}.
              </p>
            </div>
            <div>
              <SectionTitle subtitle="Ce que la JSB cherche à accomplir.">Objectifs</SectionTitle>
              <ul className="space-y-3">
                {objectives.map((o) => (
                  <li key={o} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-forest-800">
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed text-forest-700/90">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Historique */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle subtitle="Trois éditions pour bâtir un rendez-vous scientifique durable.">
          Historique
        </SectionTitle>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="leading-relaxed text-forest-700/90">
              Née en 2025, la Journée des Sciences Biologiques s’est rapidement affirmée comme un
              rendez-vous attendu de la communauté scientifique. Après le succès de la 2ᵉ édition en
              2026, la JSB revient en 2027 pour sa 3ᵉ édition, avec l’ambition de s’installer dans la
              durée et d’élargir son audience.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jsb-2027"
                className="inline-flex items-center justify-center rounded-lg bg-forest-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-600"
              >
                Découvrir l’édition 2027
              </Link>
              <Link
                to="/theme"
                className="inline-flex items-center justify-center rounded-lg border border-gold-400 px-6 py-3 text-sm font-semibold text-gold-500 transition hover:bg-gold-400 hover:text-forest-800"
              >
                Explorer le thème
              </Link>
            </div>
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

      {/* Appel à rejoindre */}
      <section className="bg-forest-500 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            Rejoignez la 3ᵉ édition de la JSB
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest-100/90">
            Étudiant, chercheur, innovateur ou institution : la JSB 2027 vous attend.{' '}
            {eventSettings.date}, {eventSettings.venue}.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/participer"
              className="w-full rounded-lg bg-gold-400 px-8 py-3 font-semibold text-forest-800 transition hover:bg-gold-300 sm:w-auto"
            >
              S’inscrire comme participant
            </Link>
            <Link
              to="/candidater"
              className="w-full rounded-lg border border-gold-400 px-8 py-3 font-semibold text-gold-300 transition hover:bg-gold-400 hover:text-forest-800 sm:w-auto"
            >
              Candidater
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
