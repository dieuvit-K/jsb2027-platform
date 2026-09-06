import { Link } from 'react-router-dom'
import { eventSettings } from '../config/event'

export function Footer() {
  return (
    <footer className="bg-forest-800 py-10 text-sm text-forest-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-bold text-gold-400">
            {eventSettings.shortName}
          </p>
          <p className="mt-2 text-forest-100/80">
            {eventSettings.name} — {eventSettings.edition}
          </p>
          <p className="mt-1 text-forest-100/80">
            Présenté par {eventSettings.organizer}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gold-400">Navigation</p>
          <ul className="mt-2 space-y-1 text-forest-100/80">
            <li><Link to="/a-propos" className="hover:text-white">À propos</Link></li>
            <li><Link to="/theme" className="hover:text-white">Thème</Link></li>
            <li><Link to="/distinctions" className="hover:text-white">Distinctions</Link></li>
            <li><Link to="/sponsors" className="hover:text-white">Sponsors</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gold-400">Informations</p>
          <p className="mt-2 text-forest-100/80">{eventSettings.venue}</p>
          <p className="mt-1 text-forest-100/80">{eventSettings.date}</p>
          <p className="mt-3 text-forest-100/60">
            Partenaire officiel : {eventSettings.partner}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-forest-700 px-4 pt-4 text-center text-xs text-forest-100/50">
        © 2026 {eventSettings.organizer} — Tous droits réservés
      </div>
    </footer>
  )
}
