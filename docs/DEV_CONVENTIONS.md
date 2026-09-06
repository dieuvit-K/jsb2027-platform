# Conventions de développement — jsb2027-platform

À LIRE AVANT D'ÉCRIRE DU CODE. Projet : `/home/ubuntu/jsb2027-platform`.

## Stack
React 19 + TypeScript strict + Vite + Tailwind CSS v4 + React Router v7.
TS : `verbatimModuleSyntax` (types importés avec `import type { X }`),
`noUnusedLocals`/`noUnusedParameters` (aucune variable import inutilisée),
`erasableSyntaxOnly` (PAS d'enum/namespace → unions de chaînes).

## Design
Palette Tailwind custom définie dans `src/index.css` (@theme) :
`forest-50..900` (vert EKBF #0a3d2a → ex: bg-forest-500, text-forest-700),
`gold-300/400/500` (#c9a84c → ex: text-gold-400, bg-gold-300/30).
Police titres : `font-serif` (Georgia). Fond de section : `bg-forest-50/60`.

Kit UI dans `src/components/ui.tsx` (IMPORTANT, l'utiliser) :
`Button(variant: primary|secondary|outline|ghost|danger)`, `Card`,
`Field(label,required,hint,error)`, `Input`, `Textarea`, `Select`, `Badge(tone)`,
`SectionTitle(subtitle?)`, `EmptyState(message)`, `LoadingState(label?)`,
`PageHeader(title,subtitle?)`, `Spinner`.
Import : `import { Button, Card } from '../components/ui'` (ajuster le chemin relatif).

## Données — services
- `src/services/store.ts` : `db.<collection>.list()/get(id)/find(pred)/add(data)/update(id,patch)/remove(id)/replaceAll(docs)`.
  Collections : `participants, candidates, sponsorshipRequests, organizations, program, faq, awards, votes, badges, certificates, users, auditLogs`.
  `settingsApi.get()/update(patch)/reset()` (config événement administrable).
  Le seed est déjà exécuté au boot — NE PAS rappeler `seedDemoData()`.
- `src/types/index.ts` : tous les types (à lire). Statuts candidature :
  `SUBMITTED | UNDER_REVIEW | SELECTED | NOT_SELECTED | WITHDRAWN`.
  Statuts sponsor : `PENDING | REVIEWING | APPROVED | REJECTED`.
  `BadgeCategory = PARTICIPANT | CHALLENGER | ORGANISATION | SPONSOR`.
- `src/services/auth.ts` : `authApi.session()/login(email,pwd)/logout()`.
  Compte démo : `admin@jsb2027.org` / `jsb2027`. `roleLabels`.
- `src/utils/helpers.ts` : `makeReference('P'|'C'|'B'|'A')`, `formatDateFr`,
  `formatDateTimeFr`, `isValidEmail`, `isValidPhone`, `normalizeEmail`,
  `toCsv(rows)` + `downloadTextFile(filename, content, mime?)` (exports admin).
- `src/lib/tokens.ts` : `generateSecureToken(len)`.
- `src/services/audit.ts` : `audit(action, resourceType, resourceId, metadata?)`.
- `src/hooks/useCollection.ts` : `useCollection(loader, deps)` → `{items, loading, error, refresh}`.
- Infos officielles statiques : `src/config/event.ts` (`eventSettings`).
  Pour tout contenu éditable (date, lieu, ouverture…) : `settingsApi`.

## Contrat BADGES / CERTIFICATS (signatures FIXES — à implémenter dans `src/features/badges/badgeService.ts`)
```ts
export async function createBadge(fullName: string, category: BadgeCategory, ownerEmail: string, reference: string): Promise<BadgeDoc>
export async function findBadgeByToken(token: string): Promise<BadgeDoc | null>
export async function revokeBadge(id: string): Promise<void>
export async function qrDataUrl(text: string): Promise<string> // via lib 'qrcode' (installée)
```
Implémentation `qrDataUrl` : `import QRCode from 'qrcode'` puis
`return QRCode.toDataURL(text)`. `secureToken` = `generateSecureToken(24)`.
Certificats dans `src/features/certificates/certificateService.ts` :
```ts
export async function createCertificate(fullName: string, category: string, status: string, reference: string): Promise<CertificateDoc>
export async function findCertificateByToken(token: string): Promise<CertificateDoc | null>
```

## Règles produit (cahier des charges docs/CAHIER_DES_CHARGES_JSB2027.md)
- UI 100 % en FRANÇAIS. Erreurs lisibles (« Veuillez renseigner votre e-mail »).
- JAMAIS inventer date/montant/comité → « À confirmer » / « Informations à venir ».
- Statuts Challenger/Organisation/Sponsor jamais auto-attribués côté public
  (uniquement via validation admin). Le POSTER n'est jamais uploadé lors de la
  candidature (simple question Oui/Non) — seul un PDF ≤ 3 pages est demandé.
- Distinctions (5, fixes) : lire `settings.distinctions` ou la collection `awards`.
  Ne jamais afficher « Meilleur jeune chercheur ».
- Vote : une adresse e-mail = un vote (contrôle côté code, jamais uniquement l'UI).
- États UI : loading / succès / erreur / vide — toujours un feedback.
- Boutons désactivés pendant les opérations (anti double-soumission).
- Export default pour chaque page. Ne pas modifier : App.tsx, main.tsx,
  src/index.css, package.json, ui.tsx, services/*, types/*, config/*.

## Fichiers à ne PAS toucher
App.tsx, main.tsx, src/index.css, src/components/ui.tsx, src/services/store.ts,
src/services/auth.ts, src/services/audit.ts, src/types/index.ts, src/config/event.ts,
src/utils/helpers.ts, src/lib/tokens.ts, src/hooks/useCollection.ts, package.json.
