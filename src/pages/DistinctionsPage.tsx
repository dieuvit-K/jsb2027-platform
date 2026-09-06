import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Award } from '../types'
import { db } from '../services/store'
import { eventSettings } from '../config/event'
import { Badge, Card, EmptyState, LoadingState } from '../components/ui'

export default function DistinctionsPage() {
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    db.awards
      .list()
      .then((list) => {
        if (active) setAwards([...list].sort((a, b) => a.order - b.order))
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
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Distinctions</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Cinq distinctions officielles récompensent l’excellence des travaux présentés à la JSB.
            Les montants et les modalités des récompenses ne sont pas publiés — informations à venir.
          </p>
        </div>
      </section>

      {/* Liste des distinctions */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        {loading ? (
          <LoadingState label="Chargement des distinctions…" />
        ) : awards.length === 0 ? (
          <EmptyState message="Les distinctions officielles seront publiées prochainement." />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {awards.map((a) => {
                const criteria =
                  a.criteria && a.criteria.trim() !== '' && a.criteria !== 'À confirmer'
                    ? a.criteria
                    : 'À confirmer'
                return (
                  <Card key={a.id} className="flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">
                          Distinction {a.order}
                        </p>
                        <h2 className="mt-1 font-serif text-xl font-bold text-forest-500">
                          {a.name}
                        </h2>
                      </div>
                      <Badge tone="gold">🏅</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-forest-700/80">{a.description}</p>
                    <div className="mt-4 border-t border-forest-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-forest-700/60">
                        Critères d’attribution
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-forest-700/90">{criteria}</p>
                    </div>
                    <div className="mt-auto pt-4">
                      <Badge tone="gray">
                        Récompense : {a.rewardInfo && a.rewardInfo !== 'Informations à venir' ? a.rewardInfo : 'Informations à venir'}
                      </Badge>
                    </div>
                  </Card>
                )
              })}
            </div>
            <p className="mt-8 text-sm italic text-forest-700/60">
              Une adresse e-mail = un vote pour le Coup de cœur du public. Les conditions précises de
              chaque distinction seront communiquées avec le règlement officiel complet.
            </p>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-forest-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-forest-500 md:text-3xl">
            Votre projet peut être distingué
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest-700/80">
            Candidats et challengers concourent aux cinq distinctions de l’édition, dont le Prix du
            meilleur poster.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/candidater"
              className="w-full rounded-lg bg-forest-500 px-8 py-3 font-semibold text-white transition hover:bg-forest-600 sm:w-auto"
            >
              Candidater
            </Link>
            <Link
              to="/reglement"
              className="w-full rounded-lg border border-gold-400 px-8 py-3 font-semibold text-gold-500 transition hover:bg-gold-400 hover:text-forest-800 sm:w-auto"
            >
              Consulter le règlement
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
