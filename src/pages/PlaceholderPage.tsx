import { Link } from 'react-router-dom'

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-serif text-3xl font-bold text-forest-500">{title}</h1>
      <p className="mt-4 text-forest-700/80">
        Cette page est en cours de construction —{' '}
        <span className="font-medium">informations à venir</span>.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/participer"
          className="rounded-lg bg-forest-500 px-6 py-3 font-semibold text-white transition hover:bg-forest-600"
        >
          S'inscrire comme participant
        </Link>
        <Link
          to="/candidater"
          className="rounded-lg border border-gold-400 px-6 py-3 font-semibold text-gold-500 transition hover:bg-gold-400 hover:text-white"
        >
          Candidater
        </Link>
      </div>
    </main>
  )
}
