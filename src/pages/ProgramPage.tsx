import { useEffect, useState } from 'react'
import type { ProgramItem } from '../types'
import { db } from '../services/store'
import { eventSettings } from '../config/event'
import { Badge, Card, EmptyState, LoadingState } from '../components/ui'

const toneByCategory: Record<string, 'forest' | 'gold' | 'red' | 'gray' | 'green'> = {
  Cérémonie: 'gold',
  Conférence: 'forest',
  Communication: 'green',
  Poster: 'red',
}

export default function ProgramPage() {
  const [items, setItems] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    db.program
      .list()
      .then((list) => {
        if (active) {
          const published = list
            .filter((p) => p.published)
            .sort((a, b) => a.order - b.order)
          setItems(published)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const indicative =
    items.length > 0 && items.every((i) => i.speaker.trim() === 'À confirmer')

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">Programme</h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Le déroulé de la journée scientifique, mis à jour au fil des confirmations
            d’intervenants.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        {loading ? (
          <LoadingState label="Chargement du programme…" />
        ) : items.length === 0 ? (
          <EmptyState message="Le programme officiel sera publié prochainement." />
        ) : (
          <div className="space-y-5">
            {indicative && (
              <div className="rounded-xl border border-gold-400/40 bg-gold-300/10 px-5 py-3 text-sm text-forest-700/80">
                Programme indicatif — la version officielle sera publiée prochainement.
              </div>
            )}
            {items.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {/* Horaires */}
                  <div className="shrink-0 rounded-xl bg-forest-500 px-4 py-3 text-center sm:w-32">
                    <p className="font-serif text-sm font-bold leading-tight text-gold-300">
                      {item.startTime}
                    </p>
                    <p className="text-xs text-forest-100/60">—</p>
                    <p className="font-serif text-sm font-bold leading-tight text-gold-300">
                      {item.endTime}
                    </p>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={toneByCategory[item.category] ?? 'gray'}>{item.category}</Badge>
                      {item.date && <span className="text-xs text-forest-700/50">{item.date}</span>}
                    </div>
                    <h2 className="mt-2 font-serif text-lg font-bold text-forest-500">
                      {item.title}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm text-forest-700/80">
                      {item.speaker && (
                        <p>
                          <span className="font-semibold text-forest-700">Intervenant : </span>
                          {item.speaker}
                        </p>
                      )}
                      {item.venue && (
                        <p>
                          <span className="font-semibold text-forest-700">Lieu : </span>
                          {item.venue}
                        </p>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-3 text-sm leading-relaxed text-forest-700/70">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
