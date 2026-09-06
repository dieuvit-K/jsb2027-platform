import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/jsb-2027', label: 'JSB 2027' },
  { to: '/theme', label: 'Thème' },
  { to: '/distinctions', label: 'Distinctions' },
  { to: '/programme', label: 'Programme' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-forest-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500 font-serif text-xs font-bold text-gold-400">
            JSB
          </span>
          <span className="font-serif text-lg font-bold text-forest-500">
            JSB <span className="text-gold-500">2027</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-forest-700 lg:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `transition hover:text-gold-500 ${isActive ? 'text-gold-500' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/participer"
            className="rounded-lg bg-forest-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-600"
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

        <button
          className="rounded-lg p-2 text-forest-700 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Ouvrir le menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-forest-100 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-forest-50 ${isActive ? 'bg-forest-50 text-gold-500' : 'text-forest-700'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2 border-t border-forest-100 pt-3">
              <Link
                to="/participer"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-forest-500 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Participer
              </Link>
              <Link
                to="/candidater"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-gold-400 px-4 py-2 text-center text-sm font-semibold text-gold-500"
              >
                Candidater
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
