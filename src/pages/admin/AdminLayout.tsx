import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  QrCode,
  ScrollText,
  Users,
  Vote,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { authApi, roleLabels } from '../../services/auth'

const navItems: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/participants', label: 'Participants', icon: Users },
  { to: '/admin/candidatures', label: 'Candidatures', icon: ClipboardList },
  { to: '/admin/sponsors', label: 'Sponsors', icon: Handshake },
  { to: '/admin/organisations', label: 'Organisations', icon: Building2 },
  { to: '/admin/programme', label: 'Programme', icon: CalendarDays },
  { to: '/admin/contenu', label: 'Contenu', icon: FileText },
  { to: '/admin/vote', label: 'Vote', icon: Vote },
  { to: '/admin/badges', label: 'Badges', icon: QrCode },
  { to: '/admin/attestations', label: 'Attestations', icon: BadgeCheck },
  { to: '/admin/emails', label: 'E-mails', icon: Mail },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
]

function navClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-forest-600 text-gold-300' : 'text-white/70 hover:bg-forest-700 hover:text-white'
  }`
}

/** Cadre de l'administration : sidebar (desktop), barre supérieure et zone de contenu. */
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const session = authApi.session()
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  function handleLogout() {
    authApi.logout()
    navigate('/admin/login', { replace: true })
  }

  const initial = session.displayName.charAt(0).toUpperCase()

  return (
    <div className="flex min-h-screen bg-forest-50/60">
      {/* ---- Sidebar desktop ---- */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-forest-800 lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-500 font-serif text-sm font-bold text-gold-400 ring-1 ring-white/20">
            JSB
          </span>
          <div className="leading-tight">
            <p className="font-serif text-base font-bold text-white">
              JSB <span className="text-gold-400">2027</span>
            </p>
            <p className="text-xs text-white/50">Administration</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="rounded-xl bg-white/5 px-3 py-3">
            <p className="truncate text-sm font-semibold text-white">{session.displayName}</p>
            <p className="truncate text-xs text-white/50">{session.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-gold-400/15 px-2 py-0.5 text-xs font-semibold text-gold-300">
              {roleLabels[session.role]}
            </span>
          </div>
        </div>
      </aside>

      {/* ---- Zone principale ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-forest-100 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            {/* Marque + menu mobile */}
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-forest-700 hover:bg-forest-50 lg:hidden"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link to="/admin" className="flex items-center gap-2 lg:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-500 font-serif text-xs font-bold text-gold-400">
                  JSB
                </span>
                <span className="font-serif text-base font-bold text-forest-500">
                  Admin <span className="text-gold-500">2027</span>
                </span>
              </Link>
            </div>

            {/* Session + actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                to="/"
                className="hidden items-center gap-1.5 rounded-lg border border-forest-100 px-3 py-2 text-sm font-semibold text-forest-600 transition hover:bg-forest-50 sm:inline-flex"
              >
                <ExternalLink className="h-4 w-4" />
                Voir le site
              </Link>

              <div className="hidden text-right leading-tight md:block">
                <p className="max-w-44 truncate text-sm font-semibold text-forest-700">
                  {session.displayName}
                </p>
                <p className="text-xs text-gold-500">{roleLabels[session.role]}</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-sm font-bold text-forest-600">
                {initial}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Navigation mobile */}
          {menuOpen && (
            <nav className="grid gap-1 border-t border-forest-100 bg-white px-4 py-3 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-forest-50 text-gold-500'
                        : 'text-forest-700 hover:bg-forest-50'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg border border-forest-100 px-3 py-2 text-sm font-medium text-forest-600 hover:bg-forest-50"
              >
                <ExternalLink className="h-4 w-4" />
                Voir le site
              </Link>
            </nav>
          )}
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
