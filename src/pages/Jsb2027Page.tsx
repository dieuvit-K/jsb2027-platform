import { Link } from 'react-router-dom'
import { eventSettings } from '../config/event'
import { Badge, Card, SectionTitle } from '../components/ui'

export default function Jsb2027Page() {
  const facts = [
    { label: 'Édition', value: eventSettings.edition },
    { label: 'Date', value: eventSettings.date },
    { label: 'Lieu', value: eventSettings.venue },
    { label: 'Organisateur', value: eventSettings.organizer },
    { label: 'Partenaire officiel', value: eventSettings.partner },
  ]

  const highlights = [
    'Une cérémonie d’ouverture officielle.',
    'Des conférences plénières animées par des invités scientifiques.',
    'Des communications orales présentées par les challengers.',
    'Une session posters dans le cadre du Prix du meilleur poster.',
    'La remise des distinctions et la cérémonie de clôture.',
  ]

  const audiences = [
    'Étudiants et doctorants',
    'Enseignants-chercheurs',
    'Chercheurs indépendants',
    'Innovateurs',
    'Institutions et entreprises',
  ]

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">
            Journée des Sciences Biologiques <span className="text-gold-400">2027</span>
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            La 3ᵉ édition de la Journée des Sciences Biologiques se prépare. Organisée par la
            Fondation École Ké Bien — École Ké Futa (EKBF) et placée sous le haut patronage du
            Président de l’Université Marien Ngouabi et du Ministère de la Recherche Scientifique et
            de l’Innovation Technologique, elle rassemblera la communauté scientifique congolaise
            autour de la recherche en sciences du vivant.
          </p>
        </div>
      </section>

      {/* Fiche édition */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle subtitle="Les informations essentielles de l’édition 2027.">
          L’édition 2027 en bref
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <Card key={f.label} className="flex flex-col justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">{f.label}</p>
              <p className="font-medium leading-snug text-forest-700">{f.value}</p>
            </Card>
          ))}
        </div>

        {/* Thème */}
        <div className="mt-10">
          <Card className="border-gold-400/40 bg-gold-300/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
              Thème officiel 2027
            </p>
            <blockquote className="mt-3 font-serif text-lg italic leading-relaxed text-forest-700 md:text-xl">
              « {eventSettings.theme} »
            </blockquote>
            <Link
              to="/theme"
              className="mt-4 inline-block text-sm font-semibold text-gold-500 transition hover:text-gold-400"
            >
              Comprendre le thème →
            </Link>
          </Card>
        </div>
      </section>

      {/* Au programme */}
      <section className="bg-forest-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <SectionTitle subtitle="Le déroulé type d’une journée scientifique JSB.">
                Au programme
              </SectionTitle>
              <ul className="space-y-3">
                {highlights.map((h, i) => (
                  <li key={h} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-500 font-serif text-xs font-bold text-gold-400">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-forest-700/90">{h}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm italic text-forest-700/60">
                Détail et horaires : la version officielle du programme sera publiée prochainement
                sur la page Programme.
              </p>
            </div>
            <div>
              <SectionTitle subtitle="La JSB est ouverte à tous les profils.">
                À qui s’adresse l’événement ?
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                {audiences.map((a) => (
                  <Badge key={a} tone="forest">
                    {a}
                  </Badge>
                ))}
              </div>
              <p className="mt-6 leading-relaxed text-forest-700/90">
                Deux parcours distincts vous sont proposés : vous pouvez simplement{' '}
                <span className="font-semibold text-forest-500">participer</span> en tant
                qu’auditeur (inscription ouverte à tous), ou{' '}
                <span className="font-semibold text-forest-500">candidater</span> pour présenter
                votre projet de recherche ou votre innovation et concourir aux distinctions
                officielles.
              </p>
              <p className="mt-3 leading-relaxed text-forest-700/90">
                Les candidats retenus deviennent challengers : ils présentent leurs travaux devant le
                public et le comité scientifique, et peuvent concourir notamment au Prix du meilleur
                poster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Haut patronage */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionTitle subtitle="L’événement est soutenu par les plus hautes autorités scientifiques du pays.">
          Haut patronage et soutiens
        </SectionTitle>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gold-400/40 bg-gold-300/10">
            <Badge tone="gold">Partenaire officiel</Badge>
            <h3 className="mt-3 font-serif text-xl font-bold text-forest-500">
              {eventSettings.partner}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
              L’{eventSettings.partner} accompagne la JSB 2027 en tant que partenaire officiel de
              l’édition.
            </p>
          </Card>
          <Card>
            <Badge tone="forest">Sous le haut patronage de</Badge>
            <ul className="mt-3 space-y-2">
              {eventSettings.patronage.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm leading-relaxed text-forest-700/90">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Créée par</p>
            <p className="mt-2 font-medium text-forest-700">{eventSettings.founder}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">Organisateur</p>
            <p className="mt-2 font-medium text-forest-700">{eventSettings.organizer}</p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-500 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            Participez à la JSB 2027
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest-100/90">
            Les inscriptions et les candidatures sont ouvertes. Rejoignez la communauté scientifique
            le jour de l’événement, ou présentez vos travaux pour concourir aux distinctions.
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
            <Link
              to="/devenir-sponsor"
              className="w-full rounded-lg border border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Devenir sponsor
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
