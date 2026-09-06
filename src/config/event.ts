/**
 * Configuration centralisée de l'événement — JSB 2027.
 *
 * RÈGLE : ne jamais inventer d'information. Les valeurs encore inconnues
 * restent en mode « À confirmer » / « Informations à venir » et seront
 * modifiables depuis le dashboard administrateur (phase ultérieure).
 */

export const eventSettings = {
  name: 'Journée des Sciences Biologiques',
  shortName: 'JSB 2027',
  edition: '3e édition',
  theme:
    'Sciences biologiques et innovation : moteurs de la transformation et de la croissance durable au Congo',
  date: 'Mars 2027 — date exacte à confirmer',
  venue: 'Présidence de l’Université Marien Ngouabi',
  organizer: 'Fondation École Ké Bien — École Ké Futa (EKBF)',
  founder: 'Professeur Titulaire Aimé Christian KAYATH',
  partner: 'ANVRI',
  patronage: [
    'Président de l’Université Marien Ngouabi',
    'Ministère de la Recherche Scientifique et de l’Innovation Technologique',
  ],
  history: [
    { year: '2025', label: 'Naissance de la JSB' },
    { year: '2026', label: 'Succès de la 2e édition' },
    { year: '2027', label: '3e édition' },
  ],
} as const

/** Couleurs de l'identité visuelle (alignées sur la fondation EKBF). */
export const brand = {
  forest: '#0a3d2a',
  gold: '#c9a84c',
} as const
