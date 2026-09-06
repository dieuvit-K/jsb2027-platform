/**
 * Configuration académique — établissements, facultés, parcours et laboratoires
 * éligibles pour la JSB 2027. Source : cahier des charges §12 (parcours éligibles)
 * et référentiel UMNG. Riche et chaînée (établissement → faculté → parcours → labo).
 */

export interface AcademicLaboratory {
  id: string
  name: string
}

export interface AcademicProgram {
  id: string
  name: string
  laboratories?: AcademicLaboratory[]
}

export interface AcademicFaculty {
  id: string
  name: string
  programs: AcademicProgram[]
}

export interface AcademicInstitution {
  id: string
  name: string
  faculties: AcademicFaculty[]
}

export const ACADEMIC_INSTITUTIONS: AcademicInstitution[] = [
  {
    id: 'umng',
    name: 'Université Marien Ngouabi (UMNG)',
    faculties: [
      {
        id: 'fst',
        name: 'Faculté des Sciences et Techniques (FST)',
        programs: [
          { id: 'bcm', name: 'Master BCM (Biologie Cellulaire et Moléculaire)' },
          { id: 'bpa', name: 'Master BPA (Biologie et Physiologie Animales)' },
          { id: 'bpv', name: 'Master BPV (Biologie et Physiologie Végétales)' },
          { id: 'qhse', name: 'Master QHSE (Qualité, Hygiène, Sécurité, Environnement)' },
          { id: 'vpam', name: 'Master VPAM (Valorisation des Plantes Aromatiques et Médicinales)' },
          { id: 't2a', name: 'Master T2A (Technologies et Biotechnologies Appliquées)' },
          { id: 'fst-doctorat', name: 'Doctorat / Thèse en Sciences Biologiques' },
          { id: 'fst-autre', name: 'Autre parcours FST' },
        ],
      },
      {
        id: 'ens',
        name: 'École Normale Supérieure (ENS)',
        programs: [
          { id: 'ens-svt', name: 'Parcours SVT (Sciences de la Vie et de la Terre)' },
          { id: 'ens-autre', name: 'Autre parcours ENS' },
        ],
      },
      {
        id: 'ensp',
        name: 'École Nationale Supérieure Polytechnique (ENSP)',
        programs: [
          { id: 'ensp-genie-alim', name: 'Master Génie Alimentaire / Agroalimentaire' },
          { id: 'ensp-autre', name: 'Autre parcours ENSP' },
        ],
      },
      {
        id: 'fssa',
        name: 'Faculté des Sciences de la Santé (FSSA)',
        programs: [
          { id: 'fssa-libre', name: 'Parcours sciences de la santé' },
          { id: 'fssa-autre', name: 'Autre parcours FSSA' },
        ],
      },
    ],
  },
  {
    id: 'other',
    name: 'Autre institution',
    faculties: [
      {
        id: 'other-faculty',
        name: 'Autre faculté / école / institut',
        programs: [{ id: 'other-program', name: 'Autre parcours' }],
      },
    ],
  },
  {
    id: 'independent',
    name: 'Chercheur / Innovateur indépendant',
    faculties: [
      {
        id: 'indep',
        name: 'Sans rattachement institutionnel',
        programs: [{ id: 'indep-program', name: 'Chercheur indépendant' }],
      },
    ],
  },
]

/** Statuts de participation proposés. */
export const STATUS_OPTIONS = [
  'Étudiant (Licence)',
  'Étudiant (Master)',
  'Doctorant',
  'Enseignant-chercheur',
  'Chercheur',
  'Professionnel',
  'Innovateur',
  'Autre',
] as const

/** Types de projet de candidature. */
export const PROJECT_TYPES = [
  'Projet de recherche',
  'Communication orale',
  'Innovation',
  'Poster scientifique',
  'Autre',
] as const

/** Recherche d'un parcours par identifiants. */
export function findProgram(institutionId: string, facultyId: string, programId: string) {
  const inst = ACADEMIC_INSTITUTIONS.find((i) => i.id === institutionId)
  const faculty = inst?.faculties.find((f) => f.id === facultyId)
  return faculty?.programs.find((p) => p.id === programId)
}
