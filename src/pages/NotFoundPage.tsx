import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-forest-500 px-4 py-20 text-center">
      <p className="font-serif text-7xl font-bold text-gold-400 md:text-9xl">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-white md:text-3xl">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-forest-100/90">
        La page que vous recherchez n’existe pas ou a été déplacée. Vous pouvez retourner à
        l’accueil ou explorer le programme de la JSB 2027.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="w-full rounded-lg bg-gold-400 px-6 py-3 font-semibold text-forest-800 transition hover:bg-gold-300 sm:w-auto"
        >
          Retour à l’accueil
        </Link>
        <Link
          to="/programme"
          className="w-full rounded-lg border border-gold-400 px-6 py-3 font-semibold text-gold-300 transition hover:bg-gold-400 hover:text-forest-800 sm:w-auto"
        >
          Voir le programme
        </Link>
      </div>
    </main>
  )
}
