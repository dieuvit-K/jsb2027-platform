import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { EventSettings } from '../types'
import { settingsApi } from '../services/store'
import { eventSettings } from '../config/event'
import { Badge, Card, EmptyState, LoadingState, SectionTitle } from '../components/ui'

export default function ReglementPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Règlement</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Les règles essentielles de participation, de candidature et d’attribution des
            distinctions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        {loading ? (
          <LoadingState label="Chargement du règlement…" />
        ) : !settings ? (
          <EmptyState message="Le règlement est momentanément indisponible. Veuillez réessayer ultérieurement." />
        ) : (
          <div className="space-y-12">
            <div className="rounded-xl border border-gold-400/40 bg-gold-300/10 px-5 py-4 text-sm text-forest-700/80">
              <span className="font-semibold text-forest-700">Règlement officiel complet à venir.</span>{' '}
              Cette page présente une version provisoire établie à partir du cahier des charges de
              l’événement ; le règlement officiel complet sera publié prochainement et pourra être
              mis à jour par l’organisation.
            </div>

            {/* Repères */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Candidatures
                </p>
                <p className="mt-1 font-semibold text-forest-700">
                  {settings.applicationOpen ? 'Ouvertes' : 'Fermées'}
                </p>
                <p className="mt-1 text-xs text-forest-700/60">Clôture : {settings.applicationDeadline}</p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Document attendu
                </p>
                <p className="mt-1 font-semibold text-forest-700">Un seul PDF</p>
                <p className="mt-1 text-xs text-forest-700/60">
                  {settings.maxPdfPages} pages maximum · {settings.maxPdfSizeMb} Mo maximum
                </p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Distinctions
                </p>
                <p className="mt-1 font-semibold text-forest-700">{settings.distinctions.length} officielles</p>
                <p className="mt-1 text-xs text-forest-700/60">Coup de cœur du public : vote du public</p>
              </Card>
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                  Poster
                </p>
                <p className="mt-1 font-semibold text-forest-700">Jamais à la candidature</p>
                <p className="mt-1 text-xs text-forest-700/60">Préparé après sélection, présenté le jour J</p>
              </Card>
            </div>

            {/* Participation */}
            <div>
              <SectionTitle subtitle="Assister à la journée est ouvert à tous.">Participation</SectionTitle>
              <div className="space-y-3">
                <p className="leading-relaxed text-forest-700/90">
                  Toute personne intéressée par les sciences biologiques peut participer à la JSB :
                  étudiants, enseignants-chercheurs, chercheurs, innovateurs et membres
                  d’institutions. L’inscription se fait sans création de compte ni mot de passe.
                </p>
                <ul className="space-y-2">
                  {[
                    'L’inscription donne droit à un identifiant unique et à un badge de participant.',
                    'Une attestation de participation peut être délivrée sur demande lors de l’inscription.',
                    'Les participants assistent aux conférences, aux communications orales et à la session posters.',
                    'Le public peut voter pour le Coup de cœur du public — une adresse e-mail = un vote.',
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-3 text-sm leading-relaxed text-forest-700/90">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Candidature */}
            <div>
              <SectionTitle subtitle="Présenter ses travaux devant le comité scientifique.">
                Candidature
              </SectionTitle>
              <div className="space-y-3">
                <ul className="space-y-2">
                  {[
                    'Peuvent candidater les étudiants à partir du niveau Master, les enseignants-chercheurs, ainsi que les chercheurs et innovateurs indépendants.',
                    'La liste précise des établissements et parcours éligibles sera publiée prochainement.',
                    'La candidature comprend les informations personnelles et scientifiques ainsi qu’un document unique au format PDF (contexte, justification, problématique, objectifs, pertinence et intérêt du projet).',
                    'Les candidatures sont examinées par un comité scientifique dont l’identité et les évaluations restent confidentielles.',
                    'Chaque candidat est informé de la décision par un statut : soumise, à l’étude, retenue ou non retenue.',
                    'Les candidats retenus deviennent challengers et présentent leurs travaux le jour de l’événement.',
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-3 text-sm leading-relaxed text-forest-700/90">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Poster */}
            <div>
              <SectionTitle subtitle="Le Prix du meilleur poster.">Poster</SectionTitle>
              <p className="leading-relaxed text-forest-700/90">
                La participation au Prix du meilleur poster est facultative : elle se déclare par une
                simple question Oui/Non lors de la candidature. Le poster n’est jamais téléversé au
                moment de la candidature. Il est préparé après la sélection et présenté physiquement
                pendant la session posters, le jour de l’événement.
              </p>
            </div>

            {/* Distinctions */}
            <div>
              <SectionTitle subtitle="Cinq distinctions officielles récompensent l’excellence.">
                Distinctions
              </SectionTitle>
              <div className="flex flex-wrap gap-2">
                {settings.distinctions.map((d) => (
                  <Badge key={d} tone="gold">
                    {d}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 leading-relaxed text-forest-700/90">
                Les conditions d’attribution sont précisées sur la page{' '}
                <Link to="/distinctions" className="font-semibold text-gold-500 hover:text-gold-400">
                  Distinctions
                </Link>
                . Les montants et la nature des récompenses ne sont pas publiés — informations à
                venir. Aucun montant financier n’est annoncé sur cette plateforme.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
