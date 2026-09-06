import { Link } from 'react-router-dom'
import { eventSettings } from '../config/event'
import { Card, SectionTitle } from '../components/ui'

export default function ThemePage() {
  const keys = [
    {
      title: 'Les sciences biologiques',
      text: 'Les sciences biologiques étudient le vivant, de la molécule aux écosystèmes. Elles recouvrent un large spectre de disciplines — biologie moléculaire et cellulaire, microbiologie, génétique, physiologie, écologie, sciences végétales et animales, biotechnologies — qui se trouvent au fondement de la médecine, de l’agriculture, de l’agroalimentaire, de la gestion des ressources naturelles et de la protection de la biodiversité. Pour un pays comme le Congo, elles répondent à des préoccupations très concrètes : la santé, l’alimentation et l’environnement.',
    },
    {
      title: 'L’innovation',
      text: 'Innover en sciences biologiques, c’est transformer une connaissance en solution utile : passer de la découverte au procédé, au produit ou au service. Cela peut prendre la forme de nouvelles biotechnologies, de biofertilisants, de biomatériaux, d’outils de diagnostic ou de méthodes de dépollution. L’innovation naît dans les laboratoires, les universités et les structures d’accompagnement ; la JSB souhaite donner à voir ce potentiel et encourager celles et ceux qui le portent.',
    },
    {
      title: 'La transformation',
      text: 'La transformation désigne ici l’évolution profonde de l’économie et de la société par la science : moderniser l’agriculture et l’élevage grâce à des solutions issues du vivant, renforcer le système de santé, préserver et valoriser les écosystèmes, créer des emplois qualifiés et de nouvelles filières. La recherche n’y est pas un luxe : elle est un investissement dans la capacité du pays à se transformer durablement.',
    },
    {
      title: 'La croissance durable',
      text: 'Une croissance durable répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs. Elle respecte l’environnement, préserve les ressources et la biodiversité, et bénéficie à l’ensemble de la société. Le Congo dispose d’atouts considérables — ressources naturelles, biodiversité et jeunesse — et les sciences biologiques fournissent précisément les connaissances et les innovations permettant de valoriser ces atouts sans épuiser ce qui les fonde.',
    },
  ]

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Le thème 2027</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Chaque édition de la JSB est portée par un thème qui oriente les échanges et les
            candidatures. Découvrez le thème officiel de 2027 et ce qu’il signifie.
          </p>
        </div>
      </section>

      {/* Thème officiel */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="border-gold-400/40 bg-gold-300/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
            Thème officiel de la JSB 2027
          </p>
          <blockquote className="mt-4 font-serif text-xl italic leading-relaxed text-forest-700 md:text-2xl">
            « {eventSettings.theme} »
          </blockquote>
        </Card>
      </section>

      {/* Explication pédagogique */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <SectionTitle subtitle="Une lecture simple, mot à mot, de ce que ce thème veut dire — et pourquoi il concerne chacun d’entre nous.">
          Comprendre le thème
        </SectionTitle>
        <div className="space-y-10">
          {keys.map((k, i) => (
            <div key={k.title} className="grid gap-4 md:grid-cols-[auto_1fr]">
              <span className="font-serif text-4xl font-bold text-gold-400/70 md:text-5xl">
                0{i + 1}
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold text-forest-500">{k.title}</h2>
                <p className="mt-3 leading-relaxed text-forest-700/90">{k.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi ce thème */}
      <section className="bg-forest-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <SectionTitle subtitle="Un thème qui parle du Congo d’aujourd’hui et de demain.">
                Pourquoi ce thème ?
              </SectionTitle>
              <p className="leading-relaxed text-forest-700/90">
                Ce thème relie directement la recherche biologique aux priorités nationales :
                l’agriculture, la santé, l’enseignement supérieur et la protection de
                l’environnement. Il invite étudiants, enseignants-chercheurs et innovateurs à
                inscrire leurs travaux dans une perspective de transformation concrète du pays.
              </p>
              <p className="mt-3 leading-relaxed text-forest-700/90">
                Il guide également l’esprit des candidatures : les projets présentés sont évalués
                pour leur rigueur scientifique, mais aussi pour leur pertinence et leur potentiel
                d’impact — des critères au cœur des cinq distinctions officielles de l’édition.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <Card>
                <h3 className="font-serif text-lg font-bold text-forest-500">
                  Vous portez un projet ?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                  Chercheur, étudiant en Master ou plus, innovateur indépendant : présentez votre
                  projet de recherche ou votre innovation dans l’esprit du thème 2027.
                </p>
                <Link
                  to="/candidater"
                  className="mt-4 inline-block rounded-lg bg-forest-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-600"
                >
                  Candidater
                </Link>
              </Card>
              <Card>
                <h3 className="font-serif text-lg font-bold text-forest-500">
                  Vous voulez simplement participer ?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                  Assistez aux conférences et aux présentations, et participez au vote du public pour
                  le Coup de cœur du public.
                </p>
                <Link
                  to="/participer"
                  className="mt-4 inline-block rounded-lg border border-gold-400 px-5 py-2.5 text-sm font-semibold text-gold-500 transition hover:bg-gold-400 hover:text-forest-800"
                >
                  S’inscrire comme participant
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
