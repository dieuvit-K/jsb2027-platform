/** Hachage SHA-256 (anti-fraude : une adresse e-mail = un vote, sans stocker l'e-mail). */

export async function sha256Hex(text: string): Promise<string> {
  const clean = text.trim().toLowerCase()
  const data = new TextEncoder().encode(clean)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Masque un hash pour affichage (ex: a1b2c3d4e5f6…9012). */
export function maskHash(hash: string, prefixLen = 12, suffixLen = 4): string {
  if (hash.length <= prefixLen + suffixLen) return hash
  return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`
}
