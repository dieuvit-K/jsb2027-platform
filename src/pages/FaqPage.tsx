import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { FaqItem } from '../types'
import { db } from '../services/store'
import { eventSettings } from '../config/event'
import { EmptyState, LoadingState } from '../components/ui'

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    db.faq
      .list()
      .then((list) => {
        if (active) {
          const published = list
            .filter((f) => f.published)
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

  return (
    <main>
      {/* En-tête */}
      <section className="bg-forest-500">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold-300">
            {eventSettings.shortName} · {eventSettings.edition}
          </p>
          <h1 className="font-serif text-3xl font-bold text-white md:text-5xl">
            Questions fréquentes
          </h1>
          <p className="mt-4 max-w-3xl leading-relaxed text-forest-100/90">
            Les réponses aux questions les plus posées sur la JSB 2027 : participation,
            candidature, poster et dates.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        {loading ? (
          <LoadingState label="Chargement des questions…" />
        ) : items.length === 0 ? (
          <EmptyState message="Aucune question publiée pour le moment — revenez bientôt." />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <details
                key={item.id}
                className="group rounded-xl border border-forest-100 bg-white shadow-sm open:border-gold-400/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-forest-700">{item.question}</span>
                  <span className="shrink-0 font-serif text-2xl leading-none text-gold-500 transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-forest-100 px-5 py-4">
                  <p className="text-sm leading-relaxed text-forest-700/80">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-forest-100 bg-forest-50/60 p-6 text-center">
          <p className="font-medium text-forest-700">Vous n’avez pas trouvé de réponse ?</p>
          <Link
            to="/contact"
            className="mt-3 inline-block rounded-lg bg-forest-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-600"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </main>
  )
}
