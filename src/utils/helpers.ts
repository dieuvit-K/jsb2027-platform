/** Petits utilitaires : identifiants, dates, référence, hash, doublons. */

/** Génère un identifiant aléatoire lisible (ex: JSB27-AB12CD). */
export function uid(prefix = 'id', len = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return prefix ? `${prefix}-${s}` : s
}

/** Référence d'inscription / candidature, ex: P-2027-XXXX ou C-2027-XXXX.
 *  L'année provient de l'édition active (ex. 'jsb-2027' → 2027), sinon année courante. */
export function makeReference(kind: 'P' | 'C' | 'B' | 'A'): string {
  let year = new Date().getFullYear()
  try {
    const raw = localStorage.getItem('jsb2027_settings')
    if (raw) {
      const settings = JSON.parse(raw) as { activeEditionId?: string }
      const m = settings.activeEditionId?.match(/(\d{4})/)
      if (m) year = Number(m[1])
    }
  } catch {
    /* valeur par défaut conservée */
  }
  return `${kind}-${year}-${uid('', 4)}`
}

/** Hash simple (non sécurisé — démo locale ; en prod via Firebase Auth). */
export async function simpleHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text + ':jsb2027-salt')
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function formatDateFr(ts: number): string {
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTimeFr(ts: number): string {
  return new Date(ts).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  return /^[+0-9 ()-]{8,20}$/.test(phone.trim())
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function fileSizeHuman(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/** Export CSV depuis un tableau d'objets. */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(';'), ...rows.map((r) => headers.map((h) => esc(r[h])).join(';'))]
  return '\uFEFF' + lines.join('\r\n')
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
