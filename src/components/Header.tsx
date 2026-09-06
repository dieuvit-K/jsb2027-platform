import { Link } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/theme', label: 'Thème' },
  { to: '/participer', label: 'Participer' },
  { to: '/candidater', label: 'Candidater' },
  { to: '/distinctions', label: 'Distinctions' },
  { to: '/sponsors', label: 'Sponsors' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500 font-serif text-xs font-bold text-gold-400">
            JSB
          </span>
          <span className="font-serif text-lg font-bold text-forest-500">
            JSB <span className="text-gold-500">2027</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-forest-700 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="transition hover:text-gold-500">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/participer"
            className="hidden rounded-lg bg-forest-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-600 sm:block"
          >
            Participer
          </Link>
          <Link
            to="/candidater"
            className="rounded-lg border border-gold-400 px-4 py-2 text-sm font-semibold text-gold-500 transition hover:bg-gold-400 hover:text-white"
          >
            Candidater
          </Link>
        </div>
      </div>

      {/* Lien hamburger minimal (mobile) — sera complété en phase navigation */}
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-xs font-medium text-forest-600 lg:hidden">
        {navLinks.map((l) => (
          <Link key={l.to} to={l.to} className="whitespace-nowrap hover:text-gold-500">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
