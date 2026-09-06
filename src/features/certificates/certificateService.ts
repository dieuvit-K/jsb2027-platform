import type { CertificateDoc } from '../../types'
import { db } from '../../services/store'
import { generateSecureToken } from '../../lib/tokens'

/** Service attestations : génération + vérification.
 *  En production : génération PDF via Cloud Functions ; ici token + données. */

export async function createCertificate(
  fullName: string,
  category: string,
  status: string,
  reference: string,
): Promise<CertificateDoc> {
  const cert = await db.certificates.add({
    editionId: 'jsb-2027',
    fullName,
    category,
    status,
    reference,
    secureToken: generateSecureToken(24),
  })
  return cert
}

export async function findCertificateByToken(token: string): Promise<CertificateDoc | null> {
  const found = await db.certificates.find((c) => c.secureToken === token)
  return found[0] ?? null
}

export function verifyCertificateUrl(token: string): string {
  return `${window.location.origin}/verify/certificate/${token}`
}
