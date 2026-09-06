/**
 * Couche d'accès aux données — mode local persistant (localStorage).
 *
 * API asynchrone calquée sur Firestore (list/get/add/update/remove) afin de
 * pouvoir basculer vers Firebase sans réécrire les appels métier.
 * En production, remplacer le corps des fonctions par les appels Firestore.
 */

import type {
  AdminUser,
  AuditLogEntry,
  Award,
  BadgeDoc,
  Candidate,
  CertificateDoc,
  EmailLogEntry,
  EventSettings,
  FaqItem,
  OrganizationMember,
  Participant,
  ProgramItem,
  SponsorshipRequest,
  Vote,
} from '../types'

const PREFIX = 'jsb2027_'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

function now() {
  return Date.now()
}

function collection<T extends { id: string }>(key: string) {
  return {
    async list(): Promise<T[]> {
      return read<T[]>(key, [])
    },
    async get(id: string): Promise<T | null> {
      const all = read<T[]>(key, [])
      return all.find((x) => x.id === id) ?? null
    },
    async find(pred: (x: T) => boolean): Promise<T[]> {
      const all = read<T[]>(key, [])
      return all.filter(pred)
    },
    async add(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<T> {
      const all = read<T[]>(key, [])
      const ts = now()
      const doc = {
        ...data,
        id: data.id ?? crypto.randomUUID(),
        createdAt: ts,
        updatedAt: ts,
      } as unknown as T
      all.push(doc)
      write(key, all)
      return doc
    },
    async update(id: string, patch: Partial<T>): Promise<T | null> {
      const all = read<T[]>(key, [])
      const idx = all.findIndex((x) => x.id === id)
      if (idx === -1) return null
      all[idx] = { ...all[idx], ...patch, updatedAt: now() } as T
      write(key, all)
      return all[idx]
    },
    async remove(id: string): Promise<void> {
      const all = read<T[]>(key, [])
      write(key, all.filter((x) => x.id !== id))
    },
    async replaceAll(docs: T[]): Promise<void> {
      write(key, docs)
    },
  }
}

/** Collection générique d'accès (lecture seule depuis les composants). */
export const db = {
  participants: collection<Participant>('participants'),
  candidates: collection<Candidate>('candidates'),
  sponsorshipRequests: collection<SponsorshipRequest>('sponsorshipRequests'),
  organizations: collection<OrganizationMember>('organizations'),
  program: collection<ProgramItem>('program'),
  faq: collection<FaqItem>('faq'),
  awards: collection<Award>('awards'),
  votes: collection<Vote>('votes'),
  badges: collection<BadgeDoc>('badges'),
  certificates: collection<CertificateDoc>('certificates'),
  users: collection<AdminUser>('users'),
  auditLogs: collection<AuditLogEntry>('auditLogs'),
  emailLogs: collection<EmailLogEntry>('emailLogs'),
}

/* ---------- Settings ---------- */
const defaultSettings: EventSettings = {
  eventName: 'Journée des Sciences Biologiques',
  shortName: 'JSB 2027',
  edition: '3ᵉ édition',
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
  activeEditionId: 'jsb-2027',
  registrationOpen: true,
  applicationOpen: true,
  applicationDeadline: 'Mars 2027 (date exacte à confirmer)',
  votingOpen: false,
  votingClose: 'À confirmer',
  maxPdfSizeMb: 5,
  maxPdfPages: 3,
  contactEmail: 'contact@ekbf.org',
  contactPhone: '+242 06 000 00 00',
  socialLinks: [{ label: 'Facebook', url: '#' }],
  distinctions: [
    'Meilleure innovation',
    'Meilleure communication orale',
    'Meilleur poster',
    'Coup de cœur du public',
    'Meilleure thématique de recherche',
  ],
}

export const settingsApi = {
  async get(): Promise<EventSettings> {
    return read<EventSettings>('settings', defaultSettings)
  },
  async update(patch: Partial<EventSettings>): Promise<EventSettings> {
    const current = await this.get()
    const next = { ...current, ...patch }
    write('settings', next)
    return next
  },
  async reset(): Promise<EventSettings> {
    write('settings', defaultSettings)
    return defaultSettings
  },
}

/* ---------- Seed : données de démonstration ---------- */
export async function isSeeded(): Promise<boolean> {
  return read<boolean>('seeded_v2', false)
}

export async function seedDemoData(): Promise<void> {
  if (await isSeeded()) return
  const ed = 'jsb-2027'
  const d = (daysAgo: number) => Date.now() - daysAgo * 86400000
  const ref = (p: string, n: number) => `${p}-2027-${String(n).padStart(4, '0')}`

  /* Persiste les settings par défaut (année d'édition pour makeReference). */
  if (!read<EventSettings | null>('settings', null)) write('settings', defaultSettings)

  await db.awards.replaceAll([
    { id: 'a1', createdAt: 0, updatedAt: 0, editionId: ed, name: 'Meilleure innovation', description: "Récompense le projet le plus innovant de l'édition.", criteria: 'À confirmer', evaluationNotes: '', rewardInfo: 'Informations à venir', order: 1 },
    { id: 'a2', createdAt: 0, updatedAt: 0, editionId: ed, name: 'Meilleure communication orale', description: 'Récompense la qualité de la présentation orale.', criteria: 'À confirmer', evaluationNotes: '', rewardInfo: 'Informations à venir', order: 2 },
    { id: 'a3', createdAt: 0, updatedAt: 0, editionId: ed, name: 'Meilleur poster', description: 'Réservé aux candidats inscrits au Prix du meilleur poster.', criteria: 'À confirmer', evaluationNotes: '', rewardInfo: 'Informations à venir', order: 3 },
    { id: 'a4', createdAt: 0, updatedAt: 0, editionId: ed, name: 'Coup de cœur du public', description: 'Distinction attribuée par le vote du public.', criteria: 'Vote public — une adresse e-mail = un vote', evaluationNotes: '', rewardInfo: 'Informations à venir', order: 4 },
    { id: 'a5', createdAt: 0, updatedAt: 0, editionId: ed, name: 'Meilleure thématique de recherche', description: 'Récompense la pertinence de la thématique de recherche.', criteria: 'À confirmer', evaluationNotes: '', rewardInfo: 'Informations à venir', order: 5 },
  ])

  await db.faq.replaceAll([
    { id: 'f1', createdAt: 0, updatedAt: 0, editionId: ed, question: 'Qui peut participer à la JSB 2027 ?', answer: 'Toute personne intéressée par les sciences biologiques : étudiants, enseignants-chercheurs, innovateurs et institutions. Les inscriptions sont ouvertes à tous.', order: 1, published: true },
    { id: 'f2', createdAt: 0, updatedAt: 0, editionId: ed, question: 'Qui peut candidater ?', answer: 'Les étudiants (à partir du Master), enseignants-chercheurs, chercheurs indépendants et innovateurs. La liste précise des parcours éligibles sera publiée prochainement.', order: 2, published: true },
    { id: 'f3', createdAt: 0, updatedAt: 0, editionId: ed, question: 'Faut-il envoyer un poster lors de la candidature ?', answer: 'Non. Le poster n’est pas téléversé lors de la candidature : il est préparé après la sélection et présenté physiquement le jour de l’événement.', order: 3, published: true },
    { id: 'f4', createdAt: 0, updatedAt: 0, editionId: ed, question: 'La date de l’événement est-elle définitive ?', answer: 'Non. La JSB 2027 se tiendra en mars 2027 — la date exacte sera confirmée officiellement et annoncée sur cette plateforme.', order: 4, published: true },
  ])

  await db.program.replaceAll([
    { id: 'p1', createdAt: 0, updatedAt: 0, editionId: ed, title: 'Cérémonie d’ouverture', description: 'Discours officiels et présentation de la journée.', date: 'Mars 2027', startTime: '08:00', endTime: '09:00', speaker: 'À confirmer', category: 'Cérémonie', venue: 'Présidence de l’UMNG', order: 1, published: true },
    { id: 'p2', createdAt: 0, updatedAt: 0, editionId: ed, title: 'Conférences plénières', description: 'Conférences des invités scientifiques.', date: 'Mars 2027', startTime: '09:15', endTime: '11:00', speaker: 'À confirmer', category: 'Conférence', venue: 'Présidence de l’UMNG', order: 2, published: true },
    { id: 'p3', createdAt: 0, updatedAt: 0, editionId: ed, title: 'Communications orales', description: 'Présentations des challengers.', date: 'Mars 2027', startTime: '11:15', endTime: '13:00', speaker: 'Challengers JSB 2027', category: 'Communication', venue: 'Présidence de l’UMNG', order: 3, published: true },
    { id: 'p4', createdAt: 0, updatedAt: 0, editionId: ed, title: 'Session posters', description: 'Présentation des posters des candidats inscrits au Prix du meilleur poster.', date: 'Mars 2027', startTime: '14:00', endTime: '15:30', speaker: 'Candidats poster', category: 'Poster', venue: 'Présidence de l’UMNG', order: 4, published: true },
    { id: 'p5', createdAt: 0, updatedAt: 0, editionId: ed, title: 'Remise des distinctions et clôture', description: 'Annonce des résultats et cérémonie de clôture.', date: 'Mars 2027', startTime: '16:00', endTime: '17:30', speaker: 'Comité d’organisation', category: 'Cérémonie', venue: 'Présidence de l’UMNG', order: 5, published: true },
  ])

  /* --- Données fictives (démonstration uniquement, jamais mélangées à la prod) --- */
  await db.participants.replaceAll([
    { id: 'pt1', createdAt: d(12), updatedAt: d(12), editionId: ed, firstName: 'Grâce', lastName: 'MABIALA', email: 'grace.mabiala@demo.cg', phone: '+242 06 111 22 33', status: 'Étudiante (Master)', institution: 'Université Marien Ngouabi', faculty: 'Faculté des Sciences et Techniques', program: 'BCM', laboratory: '—', wantsCertificate: true, registrationStatus: 'CONFIRMED', attendance: 'NOT_CHECKED', reference: ref('P', 1) },
    { id: 'pt2', createdAt: d(10), updatedAt: d(10), editionId: ed, firstName: 'Roland', lastName: 'NGOMA', email: 'roland.ngoma@demo.cg', phone: '+242 06 222 33 44', status: 'Étudiant (Master)', institution: 'ENS', faculty: 'École Normale Supérieure', program: 'SVT', laboratory: '—', wantsCertificate: true, registrationStatus: 'CONFIRMED', attendance: 'NOT_CHECKED', reference: ref('P', 2) },
    { id: 'pt3', createdAt: d(8), updatedAt: d(8), editionId: ed, firstName: 'Chancel', lastName: 'OKEMBA', email: 'chancel.okemba@demo.cg', phone: '+242 05 444 55 66', status: 'Chercheur indépendant', institution: '—', faculty: '—', program: 'Indépendant', laboratory: '—', wantsCertificate: true, registrationStatus: 'REGISTERED', attendance: 'NOT_CHECKED', reference: ref('P', 3) },
  ])

  await db.candidates.replaceAll([
    { id: 'cd1', createdAt: d(9), updatedAt: d(9), editionId: ed, firstName: 'Aymar', lastName: 'LOUEMBET', email: 'aymar.louembet@demo.cg', phone: '+242 06 777 88 99', status: 'Étudiant (Master)', institution: 'Université Marien Ngouabi', faculty: 'Faculté des Sciences et Techniques', school: 'FST', program: 'BCM', laboratory: 'Laboratoire de microbiologie', projectTitle: 'Bioremédiation des sols contaminés par les hydrocarbures à Brazzaville', projectType: 'Projet de recherche', researchTheme: 'Microbiologie et environnement', projectDescription: 'Ce projet étudie la capacité de souches bactériennes indigènes à dégrader les hydrocarbures dans les sols de la zone industrielle de Brazzaville.', wantsPosterAward: true, hasDocument: true, documentName: 'projet_bioremédiation.pdf', documentSize: 184320, applicationStatus: 'SELECTED', reference: ref('C', 1), isChallenger: true },
    { id: 'cd2', createdAt: d(7), updatedAt: d(7), editionId: ed, firstName: 'Divine', lastName: 'BAKALA', email: 'divine.bakala@demo.cg', phone: '+242 05 123 45 67', status: 'Enseignante-chercheure', institution: 'Université Marien Ngouabi', faculty: 'ENSP', school: 'ENSP', program: 'Génie alimentaire', laboratory: 'Laboratoire de bromatologie', projectTitle: 'Valorisation des résidus agroalimentaires en bioplastiques', projectType: 'Innovation', researchTheme: 'Biotechnologies et agroalimentaire', projectDescription: 'Transformer les résidus de manioc et de banane plantain en emballages biodégradables pour réduire la pollution plastique à Brazzaville.', wantsPosterAward: false, hasDocument: true, documentName: 'projet_bioplastiques.pdf', documentSize: 221184, applicationStatus: 'SELECTED', reference: ref('C', 2), isChallenger: true },
    { id: 'cd3', createdAt: d(5), updatedAt: d(5), editionId: ed, firstName: 'Prince', lastName: 'ONIANGUE', email: 'prince.oniangue@demo.cg', phone: '+242 06 999 00 11', status: 'Étudiant (Master)', institution: 'Université Marien Ngouabi', faculty: 'Faculté des Sciences et Techniques', school: 'FST', program: 'VPAM', laboratory: '—', projectTitle: 'Biofertilisants à base de rhizobactéries pour le maïs au Congo', projectType: 'Projet de recherche', researchTheme: 'Agrobiologie', projectDescription: 'Évaluation de l’effet de souches PGPR sur la croissance du maïs dans la zone de Goma Tsé-Tsé.', wantsPosterAward: true, hasDocument: true, documentName: 'projet_pgpr.pdf', documentSize: 157286, applicationStatus: 'SUBMITTED', reference: ref('C', 3), isChallenger: false },
  ])

  await db.sponsorshipRequests.replaceAll([
    { id: 'sp1', createdAt: d(11), updatedAt: d(11), editionId: ed, organizationName: 'ANVRI', contactPerson: 'Direction générale', email: 'contact@anvri.cg', phone: '+242 06 555 66 77', structureType: 'Institution publique', supportType: 'Partenariat officiel', description: 'Partenaire officiel de la JSB 2027.', proposedContribution: 'À confirmer', consent: true, status: 'APPROVED' },
    { id: 'sp2', createdAt: d(4), updatedAt: d(4), editionId: ed, organizationName: 'BioLab Congo', contactPerson: 'Dr M. Samba', email: 'contact@biolab.cg', phone: '+242 05 321 65 98', structureType: 'Entreprise', supportType: 'Sponsoring financier', description: 'Entreprise de réactifs et matériel de laboratoire.', proposedContribution: 'À confirmer', consent: true, status: 'PENDING' },
  ])

  await db.organizations.replaceAll([
    { id: 'og1', createdAt: d(15), updatedAt: d(15), editionId: ed, fullName: 'Dieuvit KIBAMBA NIANGUI', email: 'dieuvitk@gmail.com', phone: '+242 06 505 80 34', role: 'Coordinateur', structure: 'Comité d’organisation JSB', status: 'APPROVED' },
  ])

  write('seeded_v2', true)
}
