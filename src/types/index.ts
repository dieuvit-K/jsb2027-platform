/**
 * Types partagés de la plateforme JSB 2027.
 * Conventions : unions de chaînes (pas d'enum TS — erasableSyntaxOnly),
 * imports type explicites (`import type { X }`).
 */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'MANAGER'
export type BadgeCategory = 'PARTICIPANT' | 'CHALLENGER' | 'ORGANISATION' | 'SPONSOR'
export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'SELECTED' | 'NOT_SELECTED' | 'WITHDRAWN'
export type SponsorRequestStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED'
export type RegistrationStatus = 'REGISTERED' | 'CONFIRMED' | 'ATTENDED'
export type VoteStatus = 'OPEN' | 'CLOSED'
export type AttendanceStatus = 'NOT_CHECKED' | 'PRESENT'

export interface BaseDoc {
  id: string
  createdAt: number
  updatedAt: number
  editionId: string
}

/* ---------- Participant ---------- */
export interface Participant extends BaseDoc {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  institution: string
  faculty: string
  program: string
  laboratory: string
  wantsCertificate: boolean
  registrationStatus: RegistrationStatus
  attendance: AttendanceStatus
  reference: string
  badgeToken?: string
  registrationStatusHistory?: { from: string; to: string; at: number }[]
}

/* ---------- Candidat ---------- */
export interface Candidate extends BaseDoc {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  institution: string
  faculty: string
  school: string
  program: string
  laboratory: string
  projectTitle: string
  projectType: string
  researchTheme: string
  projectDescription: string
  wantsPosterAward: boolean
  hasDocument: boolean
  documentName?: string
  documentSize?: number
  documentDataUrl?: string
  applicationStatus: ApplicationStatus
  reference: string
  badgeToken?: string
  isChallenger: boolean
  evaluationScore?: number
}

/* ---------- Sponsor ---------- */
export interface SponsorshipRequest extends BaseDoc {
  organizationName: string
  contactPerson: string
  email: string
  phone: string
  structureType: string
  supportType: string
  description: string
  proposedContribution: string
  consent: boolean
  status: SponsorRequestStatus
  badgeToken?: string
}

/* ---------- Organisation (membre) ---------- */
export interface OrganizationMember extends BaseDoc {
  fullName: string
  email: string
  phone: string
  role: string
  structure: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  badgeToken?: string
}

/* ---------- Programme ---------- */
export interface ProgramItem extends BaseDoc {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  speaker: string
  category: string
  venue: string
  order: number
  published: boolean
}

/* ---------- FAQ ---------- */
export interface FaqItem extends BaseDoc {
  question: string
  answer: string
  order: number
  published: boolean
}

/* ---------- Distinctions ---------- */
export interface Award extends BaseDoc {
  name: string
  description: string
  criteria: string
  evaluationNotes: string
  rewardInfo: string
  order: number
}

/* ---------- Vote ---------- */
export interface Vote extends BaseDoc {
  email: string
  candidateId: string
  verified: boolean
  verificationCode?: string
}

/* ---------- Badge ---------- */
export interface BadgeDoc extends BaseDoc {
  fullName: string
  category: BadgeCategory
  ownerEmail: string
  secureToken: string
  status: 'ACTIVE' | 'REVOKED'
  reference: string
}

/* ---------- Attestation ---------- */
export interface CertificateDoc extends BaseDoc {
  fullName: string
  category: string
  status: string
  secureToken: string
  reference: string
}

/* ---------- Journal d'e-mails ---------- */
export interface EmailLogEntry extends BaseDoc {
  template: string
  to: string
  subject: string
  bodyPreview: string
  sent: boolean
}

/* ---------- Utilisateur admin ---------- */
export interface AdminUser extends BaseDoc {
  email: string
  displayName: string
  role: Role
  passwordHash: string
  active: boolean
}

/* ---------- Audit log ---------- */
export interface AuditLogEntry extends BaseDoc {
  userId: string
  userEmail: string
  action: string
  resourceType: string
  resourceId: string
  metadata?: Record<string, unknown>
}

/* ---------- Événement / édition ---------- */
export interface EventSettings {
  eventName: string
  shortName: string
  edition: string
  theme: string
  date: string
  venue: string
  organizer: string
  founder: string
  partner: string
  patronage: string[]
  activeEditionId: string
  registrationOpen: boolean
  applicationOpen: boolean
  applicationDeadline: string
  votingOpen: boolean
  votingClose: string
  maxPdfSizeMb: number
  maxPdfPages: number
  contactEmail: string
  contactPhone: string
  socialLinks: { label: string; url: string }[]
  distinctions: string[]
}

export interface AdminSession {
  userId: string
  email: string
  displayName: string
  role: Role
  loginAt: number
}
