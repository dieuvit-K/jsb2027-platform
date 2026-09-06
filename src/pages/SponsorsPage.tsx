import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SponsorshipRequest } from '../types'
import { db } from '../services/store'
import { eventSettings } from '../config/event'
import { Badge, Card, EmptyState, LoadingState } from '../components/ui'

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorshipRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    db.sponsorshipRequests
      .list()
      .then((list) => {
        if (active) setSponsors(list.filter((s) => s.status === 'APPROVED'))
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
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Sponsors et soutiens</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Les partenaires et sponsors qui rendent la JSB 2027 possible.
          </p>
        </div>
      </section>

      {/* Partenaire officiel et haut patronage */}
      <section className="border-b border-forest-100 bg-forest-50/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
          <div>
            <Badge tone="gold">Partenaire officiel</Badge>
            <img
              src={`${import.meta.env.BASE_URL}assets/partners/anvri.png`}
              alt="Logo ANVRI"
              className="mt-4 h-16 w-auto object-contain"
              loading="lazy"
            />
            <h2 className="mt-3 font-serif text-2xl font-bold text-forest-500">
              {eventSettings.partner}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
              L’{eventSettings.partner} accompagne officiellement la 3ᵉ édition de la Journée des
              Sciences Biologiques.
            </p>
          </div>
          <div>
            <Badge tone="forest">Haut patronage</Badge>
            <h2 className="mt-3 font-serif text-2xl font-bold text-forest-500">
              Soutiens institutionnels
            </h2>
            <ul className="mt-2 space-y-1.5">
              {eventSettings.patronage.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm leading-relaxed text-forest-700/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Sponsors validés */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        {loading ? (
          <LoadingState label="Chargement des sponsors…" />
        ) : sponsors.length === 0 ? (
          <EmptyState message="Aucun sponsor validé pour le moment — le programme de soutien est en cours de constitution." />
        ) : (
          <>
            <h2 className="font-serif text-2xl font-bold text-forest-500">
              Sponsors de l’édition 2027
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sponsors.map((s) => (
                <Card key={s.id} className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.structureType && <Badge tone="forest">{s.structureType}</Badge>}
                    {s.supportType && <Badge tone="gold">{s.supportType}</Badge>}
                  </div>
                  <h3 className="mt-3 font-serif text-xl font-bold text-forest-500">
                    {s.organizationName}
                  </h3>
                  {s.organizationName === 'ANVRI' && (
                    <img
                      src={`${import.meta.env.BASE_URL}assets/partners/anvri.png`}
                      alt="Logo ANVRI"
                      className="mt-3 h-14 w-14 rounded-xl object-contain"
                      loading="lazy"
                    />
                  )}
                  {s.description && (
                    <p className="mt-2 text-sm leading-relaxed text-forest-700/80">{s.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-forest-500 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-white md:text-3xl">
            Soutenez la JSB 2027
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-forest-100/90">
            Votre structure peut associer son image à la 3ᵉ édition de la Journée des Sciences
            Biologiques et soutenir la recherche et l’innovation au Congo.
          </p>
          <Link
            to="/devenir-sponsor"
            className="mt-8 inline-block rounded-lg bg-gold-400 px-8 py-3 font-semibold text-forest-800 transition hover:bg-gold-300"
          >
            Devenir sponsor
          </Link>
        </div>
      </section>
    </main>
  )
}
