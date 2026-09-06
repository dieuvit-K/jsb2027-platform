/** Authentification administrateur — mode local (démo).
 *  En production : Firebase Authentication + rôles vérifiés côté serveur. */

import type { AdminSession, AdminUser, Role } from '../types'
import { db } from './store'
import { simpleHash } from '../utils/helpers'

const SESSION_KEY = 'jsb2027_admin_session'

/** Compte admin par défaut créé au premier démarrage (démo uniquement). */
const DEMO_ADMIN = {
  email: 'admin@jsb2027.org',
  password: 'jsb2027',
  displayName: 'Administrateur JSB',
  role: 'SUPER_ADMIN' as Role,
}

export const authApi = {
  async ensureDefaultAdmin(): Promise<void> {
    const existing = await db.users.find((u) => u.email === DEMO_ADMIN.email)
    if (existing.length > 0) return
    const hash = await simpleHash(DEMO_ADMIN.password)
    await db.users.add({
      email: DEMO_ADMIN.email,
      displayName: DEMO_ADMIN.displayName,
      role: DEMO_ADMIN.role,
      passwordHash: hash,
      active: true,
      editionId: 'jsb-2027',
    })
  },

  async login(email: string, password: string): Promise<{ ok: boolean; error?: string; user?: AdminUser }> {
    const users = await db.users.find((u) => u.email === email.trim().toLowerCase() && u.active)
    if (users.length === 0) return { ok: false, error: 'Aucun compte administrateur avec cet e-mail.' }
    const user = users[0]
    const hash = await simpleHash(password)
    if (user.passwordHash !== hash) return { ok: false, error: 'Mot de passe incorrect.' }
    const session: AdminSession = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      loginAt: Date.now(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return { ok: true, user }
  },

  session(): AdminSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as AdminSession) : null
    } catch {
      return null
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY)
  },

  can(session: AdminSession | null, roles: Role[]): boolean {
    if (!session) return false
    if (session.role === 'SUPER_ADMIN') return true
    return roles.includes(session.role)
  },
}

/** Liste des rôles et leurs permissions (affichage dashboard). */
export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  ORGANIZER: 'Organisateur',
  MANAGER: 'Gestionnaire',
}
