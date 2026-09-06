import QRCode from 'qrcode'
import type { BadgeCategory, BadgeDoc, EmailLogEntry } from '../../types'
import { db } from '../../services/store'
import { generateSecureToken } from '../../lib/tokens'

/** Service badges : création, vérification, révocation.
 *  En production : création + token via Cloud Functions ; ici local. */

export async function createBadge(
  fullName: string,
  category: BadgeCategory,
  ownerEmail: string,
  reference: string,
): Promise<BadgeDoc> {
  const badge = await db.badges.add({
    editionId: 'jsb-2027',
    fullName,
    category,
    ownerEmail,
    reference,
    secureToken: generateSecureToken(24),
    status: 'ACTIVE',
  })
  return badge
}

export async function findBadgeByToken(token: string): Promise<BadgeDoc | null> {
  const found = await db.badges.find((b) => b.secureToken === token)
  return found[0] ?? null
}

export async function revokeBadge(id: string): Promise<void> {
  await db.badges.update(id, { status: 'REVOKED' })
}

export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 300, color: { dark: '#0a3d2a' } })
}

export const badgeCategoryMeta: Record<BadgeCategory, { label: string; bg: string; text: string }> = {
  PARTICIPANT: { label: 'Participant', bg: 'bg-forest-500', text: 'text-forest-700' },
  CHALLENGER: { label: 'Challenger', bg: 'bg-gold-400', text: 'text-gold-500' },
  ORGANISATION: { label: 'Organisation', bg: 'bg-forest-800', text: 'text-forest-800' },
  SPONSOR: { label: 'Sponsor', bg: 'bg-forest-600', text: 'text-forest-600' },
}

/** Badge token pour un participant/candidat mis à jour sur son document. */
export async function attachBadgeToken(collection: 'participants' | 'candidates', docId: string, token: string) {
  await db[collection].update(docId, { badgeToken: token } as never)
}

/** Service e-mails — enregistre dans emailLogs (démo locale).
 *  En production : expédition réelle via Cloud Functions / Gmail API. */
export async function logEmail(
  template: string,
  to: string,
  subject: string,
  bodyPreview: string,
): Promise<EmailLogEntry> {
  const entry = await db.emailLogs.add({
    editionId: 'jsb-2027',
    template,
    to,
    subject,
    bodyPreview,
    sent: false,
  })
  return entry
}

/** Lien public de vérification d'un badge. */
export function verifyBadgeUrl(token: string): string {
  return `${window.location.origin}/verify/${token}`
}
