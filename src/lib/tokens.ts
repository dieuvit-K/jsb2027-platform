/** Génération de tokens sécurisés (badges, vérifications). */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

/** Token imprévisible — ne jamais utiliser d'identifiants séquentiels. */
export function generateSecureToken(length = 24): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

/** Référence courte lisible pour les écrans publics. */
export function makePublicId(prefix: string): string {
  return `${prefix}-${generateSecureToken(6)}`
}
