# MASTER PROMPT — ANTIGRAVITY
## 🧬 PLATEFORME OFFICIELLE JSB 2027
### Journée des Sciences Biologiques — 3ᵉ ÉDITION

---

# 0. RÔLE

Tu es un ingénieur logiciel senior, architecte full-stack, UI/UX designer et ingénieur sécurité.

Ta mission est de concevoir et développer une plateforme web professionnelle, moderne, responsive, sécurisée et réellement fonctionnelle pour :

> 🧬 JOURNÉE DES SCIENCES BIOLOGIQUES (JSB) 2027
> 3ᵉ ÉDITION

Cette application n'est PAS un simple site vitrine.

Elle doit être une véritable plateforme de gestion événementielle scientifique permettant de gérer :

- le site public ;
- les inscriptions ;
- les candidatures scientifiques ;
- les documents PDF ;
- la présélection ;
- les challengers ;
- les badges ;
- les QR codes ;
- le vote du public ;
- les distinctions ;
- les sponsors ;
- l'organisation ;
- les communications ;
- les attestations ;
- l'administration.

Tu dois produire une application exploitable, pas une maquette statique.

---

# 1. CONTEXTE DE L'ÉVÉNEMENT

Nom :

> Journée des Sciences Biologiques (JSB) 2027

Édition :

> 3ᵉ édition

Date :

> Mars 2027 — date exacte à confirmer

Lieu :

> Présidence de l'Université Marien Ngouabi

Thème :

> « Sciences biologiques et innovation : moteurs de la transformation et de la croissance durable au Congo »

Événement présenté par :

> Fondation École Ké Bien — École Ké Futa (EKBF)

Créée par :

> Professeur Titulaire Aimé Christian KAYATH

Partenaire officiel :

> ANVRI

Sous le haut patronage de :

> Président de l'Université Marien Ngouabi
> Ministère de la Recherche Scientifique et de l'Innovation Technologique

Historique :

> 2025 : naissance de la JSB
> 2026 : succès de la JSB
> 2027 : 3ᵉ édition

IMPORTANT :

Certaines informations sont encore susceptibles d'être modifiées.

Ne jamais inventer :

- date définitive ;
- montant des prix ;
- horaires ;
- coordonnées ;
- membres du comité ;
- informations officielles non fournies.

Ces informations doivent être configurables depuis le dashboard administrateur.

---

# 2. OBJECTIF GLOBAL

Construire une plateforme JSB 2027 permettant à une personne d'arriver sur le site et de comprendre immédiatement :

1. ce qu'est la JSB ;
2. pourquoi elle existe ;
3. quand elle aura lieu ;
4. où elle aura lieu ;
5. comment participer ;
6. comment candidater ;
7. comment devenir sponsor.

La page d'accueil doit principalement conduire vers trois actions :

> S'INSCRIRE COMME PARTICIPANT

> CANDIDATER

> DEVENIR SPONSOR

---

# 3. PRINCIPES DE CONCEPTION

Respecte impérativement ces principes :

## 3.1 Mobile First

La majorité des utilisateurs utiliseront probablement leur smartphone.

L'application doit donc être parfaitement utilisable sur :

- Android ;
- iPhone ;
- tablette ;
- ordinateur.

## 3.2 Professionnalisme

Le site doit avoir l'apparence d'un événement scientifique institutionnel.

Éviter :

- design amateur ;
- surcharge visuelle ;
- animations inutiles ;
- couleurs excessives ;
- interfaces ressemblant à un simple formulaire Google.

## 3.3 Simplicité

Un utilisateur doit comprendre immédiatement quoi faire.

## 3.4 Sécurité

Les données personnelles, candidatures et documents doivent être protégés.

## 3.5 Évolutivité

La version actuelle est dédiée à JSB 2027.

L'architecture doit cependant permettre plus tard son intégration dans le site de la Fondation École Ké Bien.

Ne pas construire une architecture inutilement complexe pour autant.

---

# 4. STACK TECHNIQUE

Utiliser une stack moderne et stable.

## Frontend

- React
- TypeScript
- Vite ou framework moderne équivalent
- Tailwind CSS ou système CSS propre et maintenable
- composants réutilisables

## Backend

Firebase.

Utiliser selon les besoins :

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions si nécessaire
- Firebase App Check si pertinent

## Hébergement

Vercel.

## Versionnement

GitHub.

---

# 5. ARCHITECTURE GÉNÉRALE

Construire une architecture propre :

```
src/
├── components/
├── pages/
├── layouts/
├── features/
│   ├── participants/
│   ├── candidates/
│   ├── sponsors/
│   ├── badges/
│   ├── voting/
│   ├── certificates/
│   └── administration/
├── services/
├── hooks/
├── lib/
├── types/
├── utils/
├── config/
└── assets/
```

Séparer clairement :

- UI ;
- logique métier ;
- accès Firebase ;
- validation ;
- authentification ;
- autorisations ;
- génération de badges ;
- génération QR ;
- gestion des fichiers.

Ne pas mettre toute la logique dans les composants React.

---

# 6. SITE PUBLIC

Créer les pages suivantes.

## /

Accueil

Doit contenir :

- Hero JSB 2027
- 3ᵉ édition
- thème
- date
- lieu
- présentation courte
- appel aux participants
- appel aux candidats
- appel aux sponsors
- partenaire officiel
- haut patronage
- CTA principaux

## /a-propos

Présenter :

- origine de la JSB ;
- vision ;
- objectifs ;
- historique ;
- éditions précédentes.

## /jsb-2027

Présentation complète de l'édition 2027.

## /theme

Présenter le thème officiel :

> Sciences biologiques et innovation : moteurs de la transformation et de la croissance durable au Congo

Ajouter une explication pédagogique du thème.

## /participer

Expliquer :

- qui peut participer ;
- comment s'inscrire ;
- fonctionnement ;
- badge ;
- informations pratiques.

CTA :

> S'inscrire comme participant

## /candidater

Présenter :

- qui peut candidater ;
- conditions ;
- processus ;
- document demandé ;
- déroulement de la sélection ;
- fonctionnement des présentations ;
- distinctions.

CTA :

> Commencer ma candidature

## /distinctions

Afficher :

- Meilleure innovation
- Meilleure communication orale
- Meilleur poster
- Coup de cœur du public
- Meilleure thématique de recherche

Ne pas afficher de montant financier.

## /programme

Programme officiel.

Si le programme n'est pas encore publié :

Afficher proprement :

> Le programme officiel sera publié prochainement.

Le programme doit être administrable.

## /reglement

Règlement de participation.

Le contenu doit être administrable.

## /sponsors

Afficher :

- partenaires ;
- sponsors validés ;
- logos ;
- soutiens.

## /devenir-sponsor

Formulaire de sponsoring.

## /faq

FAQ administrable.

## /contact

Coordonnées officielles.

---

# 7. PARCOURS PARTICIPANT

Créer un formulaire :

> S'inscrire comme participant

Le participant ne crée PAS de compte avec mot de passe.

Informations :

- prénom ;
- nom ;
- adresse e-mail ;
- téléphone ;
- statut ;
- établissement ;
- faculté/école/institut ;
- parcours ;
- laboratoire/département ;
- demande d'attestation ;
- consentement aux conditions.

Après validation :

```
FORMULAIRE
↓
VALIDATION
↓
INSCRIPTION
↓
IDENTIFIANT UNIQUE
↓
BADGE PARTICIPANT
↓
QR CODE
↓
EMAIL DE CONFIRMATION
```

---

# 8. PARCOURS CANDIDAT

Créer un parcours distinct :

> Candidater à la JSB

Le candidat remplit ses informations personnelles et scientifiques.

## Informations

- prénom ;
- nom ;
- e-mail ;
- téléphone ;
- statut ;
- établissement ;
- faculté ;
- école/institut ;
- parcours ;
- laboratoire/département ;
- titre du projet ;
- type de projet ;
- thématique de recherche ;
- description du projet.

---

# 9. DOCUMENT DE CANDIDATURE

Le candidat doit obligatoirement envoyer :

> UN DOCUMENT PDF DE 3 PAGES MAXIMUM

Ce document doit expliquer notamment :

- contexte ;
- justification ;
- problématique ;
- objectifs ;
- pertinence ;
- intérêt du projet ;
- éléments permettant de comprendre pourquoi le projet mérite d'être retenu.

Le site doit simplement permettre :

> Télécharger / téléverser mon document PDF

Ne pas créer d'éditeur de document intégré.

---

# 10. VALIDATION DU PDF

Lors de l'upload :

Vérifier :

- format PDF ;
- taille maximale configurable ;
- fichier non vide ;
- nom de fichier propre ;
- association correcte à la candidature.

Le fichier doit être stocké dans Firebase Storage.

Le document ne doit PAS être publiquement accessible.

Prévoir une structure du type :

```
applications/{candidateId}/documents/
```

---

# 11. QUESTION POSTER

Ajouter obligatoirement :

> Souhaitez-vous participer au Prix du meilleur poster ?

Réponses :

- Oui
- Non

IMPORTANT :

Le poster n'est PAS envoyé lors de la candidature.

Le candidat qui choisit "Oui" indique simplement qu'il souhaite participer à cette distinction.

Le poster sera préparé après la sélection et présenté le jour de l'événement.

---

# 12. ÉTABLISSEMENTS ET PARCOURS ÉLIGIBLES

## Faculté des Sciences et Techniques — niveau Master

- BCM
- BPA
- BPV
- QHSE
- VPAM
- T2A

## ENS

- Parcours SVT

## ENSP

- Parcours Génie alimentaire

## FSSA

Prévoir une structure permettant de gérer les parcours.

## Indépendants

Autoriser :

- chercheurs indépendants ;
- innovateurs indépendants.

IMPORTANT :

Ne pas coder ces listes directement dans plusieurs composants.

Créer une configuration administrable.

---

# 13. SÉLECTION

Les candidatures sont examinées par un comité scientifique.

Le comité est PRIVÉ.

Le candidat ne doit jamais voir :

- les membres du comité ;
- les évaluateurs ;
- les échanges internes ;
- les notes internes ;
- les commentaires confidentiels ;
- les décisions internes détaillées.

Prévoir des rôles internes.

---

# 14. STATUTS DE CANDIDATURE

Utiliser par exemple :

```
SUBMITTED
UNDER_REVIEW
SELECTED
NOT_SELECTED
WITHDRAWN
```

L'administration doit pouvoir changer le statut.

Lorsqu'une candidature devient :

> SELECTED

le système doit permettre l'envoi d'un e-mail de sélection.

---

# 15. EMAIL DE SÉLECTION

Créer un modèle d'e-mail personnalisable.

Contenu possible :

- félicitations ;
- confirmation de sélection ;
- titre du projet ;
- informations pratiques ;
- préparation de la présentation ;
- préparation du poster si applicable ;
- règlement ;
- consignes.

Utiliser des variables :

```
{{firstName}}
{{lastName}}
{{projectTitle}}
{{eventName}}
{{eventDate}}
{{eventVenue}}
```

---

# 16. BADGES

Créer quatre catégories de badges :

```
PARTICIPANT
CHALLENGER
ORGANISATION
SPONSOR
```

Chaque catégorie doit être visuellement différenciée.

Les couleurs exactes doivent être configurables.

Le badge doit afficher au minimum :

- nom ;
- prénom ;
- catégorie ;
- JSB 2027 ;
- logo/identité de l'événement ;
- QR code.

---

# 17. QR CODE

Chaque badge possède un QR code unique.

Le QR code doit pointer vers une route de vérification sécurisée.

Exemple :

```
/verify/{secureToken}
```

La page doit indiquer par exemple :

> Badge valide

> Catégorie : Challenger

> JSB 2027

Ne jamais exposer inutilement :

- téléphone ;
- adresse ;
- informations privées ;
- document scientifique.

Le token doit être difficile à deviner.

---

# 18. CATÉGORIE ORGANISATION

Une personne ne peut PAS devenir Organisation simplement en sélectionnant cette catégorie.

Le statut Organisation est attribué par un administrateur.

Les membres de l'organisation peuvent recevoir :

- badge Organisation ;
- accès interne selon leurs permissions.

---

# 19. CATÉGORIE SPONSOR

Créer une demande de sponsoring.

Formulaire :

- nom de la structure ;
- personne de contact ;
- e-mail ;
- téléphone ;
- type de structure ;
- type de soutien ;
- description ;
- contribution proposée ;
- document éventuel ;
- consentement.

Statuts :

```
PENDING
REVIEWING
APPROVED
REJECTED
```

Un sponsor validé peut recevoir :

> BADGE SPONSOR

---

# 20. DISTINCTIONS

Les distinctions officielles :

- Meilleure innovation
- Meilleure communication orale
- Meilleur poster
- Coup de cœur du public
- Meilleure thématique de recherche

IMPORTANT :

Ces distinctions ne constituent PAS cinq candidatures indépendantes.

Le candidat présente son projet.

L'évaluation du projet et de sa présentation permet ensuite de déterminer les distinctions.

---

# 21. ÉVALUATION SUR PLACE

Les différentes distinctions seront évaluées pendant l'événement.

Prévoir dans le dashboard un module permettant éventuellement d'enregistrer :

- candidat ;
- présentation ;
- distinction ;
- score ;
- commentaires internes ;
- résultat.

Les détails précis de la grille d'évaluation doivent être configurables.

Ne pas exposer les données d'évaluation privées au public.

---

# 22. VOTE DU PUBLIC

Le public vote pour :

> Coup de cœur du public

Le vote doit être effectué avec une adresse e-mail.

Règle :

> Une adresse e-mail = un vote.

Prévoir une vérification de l'e-mail.

Une méthode recommandée :

```
Email
↓
Code de vérification
↓
Validation
↓
Vote
```

Le système doit empêcher les votes multiples.

Prévoir :

- ouverture du vote ;
- fermeture du vote ;
- statistiques ;
- surveillance ;
- résultats.

Les résultats peuvent être masqués jusqu'à la clôture officielle.

---

# 23. ANTI-ABUS DU VOTE

Ne pas se limiter au frontend.

Les restrictions doivent être appliquées côté backend.

Prévoir :

- vérification e-mail ;
- limitation par adresse ;
- validation serveur ;
- règles Firestore ;
- éventuellement rate limiting ;
- App Check si pertinent.

Ne jamais faire confiance uniquement au navigateur.

---

# 24. DASHBOARD ADMINISTRATEUR

Créer :

```
/admin
```

Dashboard moderne.

Afficher :

- participants ;
- candidats ;
- candidatures ;
- challengers ;
- sponsors ;
- votes ;
- badges ;
- attestations ;
- programme ;
- statistiques.

---

# 25. GESTION DES PARTICIPANTS

Fonctionnalités :

- liste ;
- recherche ;
- filtres ;
- consultation ;
- modification ;
- validation ;
- badge ;
- e-mail ;
- attestation.

---

# 26. GESTION DES CANDIDATS

Fonctionnalités :

- liste ;
- recherche ;
- filtres ;
- détails ;
- projet ;
- téléchargement PDF ;
- statut ;
- sélection ;
- non-sélection ;
- e-mail.

---

# 27. GESTION DES DOCUMENTS

Les administrateurs autorisés peuvent :

- consulter ;
- télécharger ;
- supprimer selon permissions.

Les documents doivent rester privés.

---

# 28. GESTION DU PROGRAMME

Créer un CRUD :

```
Créer
Lire
Modifier
Supprimer
Publier
Dépublier
```

Un élément de programme peut avoir :

- titre ;
- description ;
- heure ;
- date ;
- intervenant ;
- catégorie ;
- ordre.

---

# 29. GESTION DU CONTENU

Depuis le dashboard, permettre de modifier :

- date ;
- lieu ;
- thème ;
- description ;
- textes ;
- programme ;
- FAQ ;
- règlement ;
- partenaires ;
- sponsors ;
- contacts ;
- annonces.

Objectif :

> éviter de modifier le code pour changer les informations de l'événement.

---

# 30. GESTION DES EMAILS

Prévoir des modèles :

```
RegistrationConfirmation
CandidateSubmissionConfirmation
CandidateSelected
CandidateNotSelected
PracticalInformation
CertificateAvailable
SponsorRequestReceived
```

Les modèles doivent être personnalisables.

---

# 31. ATTESTATIONS

Après l'événement, l'administration doit pouvoir générer les attestations.

Une attestation peut contenir :

- nom ;
- prénom ;
- statut ;
- événement ;
- date ;
- lieu ;
- signature ;
- identifiant de vérification.

Prévoir éventuellement :

```
/verify/certificate/{token}
```

---

# 32. AUTHENTIFICATION

Les utilisateurs publics :

> PAS DE COMPTE OBLIGATOIRE.

Les administrateurs :

> AUTHENTIFICATION OBLIGATOIRE.

Utiliser Firebase Authentication.

Prévoir des rôles :

```
SUPER_ADMIN
ADMIN
ORGANIZER
MANAGER
```

Les permissions doivent être contrôlées côté backend.

---

# 33. FIRESTORE

Créer une structure cohérente.

Exemple :

```
events
participants
candidates
projects
documents
badges
sponsors
sponsorshipRequests
votes
awards
program
announcements
certificates
emailLogs
users
settings
auditLogs
```

Toutes les données doivent avoir des timestamps appropriés.

---

# 34. FIRESTORE — PARTICIPANT

Exemple :

```json
{
  id,
  firstName,
  lastName,
  email,
  phone,
  status,
  institution,
  faculty,
  program,
  laboratory,
  wantsCertificate,
  registrationStatus,
  badgeId,
  createdAt,
  updatedAt
}
```

---

# 35. FIRESTORE — CANDIDAT

Exemple :

```json
{
  id,
  firstName,
  lastName,
  email,
  phone,
  status,
  institution,
  faculty,
  program,
  laboratory,
  projectTitle,
  projectType,
  researchTheme,
  projectDescription,
  wantsPosterAward,
  documentId,
  applicationStatus,
  badgeId,
  createdAt,
  updatedAt
}
```

---

# 36. AUDIT LOG

Les actions sensibles doivent pouvoir être enregistrées.

Exemples :

- connexion admin ;
- modification d'une candidature ;
- sélection d'un candidat ;
- modification d'un sponsor ;
- génération d'un badge ;
- modification d'un statut ;
- suppression d'un document.

Exemple :

```json
{
  userId,
  action,
  targetType,
  targetId,
  timestamp,
  metadata
}
```

---

# 37. VALIDATION DES FORMULAIRES

Utiliser une bibliothèque de validation robuste si nécessaire.

Valider :

- e-mail ;
- téléphone ;
- champs obligatoires ;
- longueur ;
- fichiers ;
- PDF ;
- données sensibles.

Afficher des erreurs compréhensibles.

Exemple :

> Veuillez renseigner votre adresse e-mail.

Pas :

> Invalid field 0x002.

---

# 38. PROTECTION CONTRE LE SPAM

Les formulaires publics doivent être protégés.

Prévoir selon pertinence :

- Firebase App Check ;
- rate limiting ;
- validation serveur ;
- honeypot ;
- limitation des soumissions ;
- contrôle des fichiers.

---

# 39. DESIGN UI/UX

Créer une identité visuelle scientifique.

Direction artistique :

- science ;
- biologie ;
- innovation ;
- recherche ;
- jeunesse ;
- Congo ;
- institutionnel.

Utiliser des éléments graphiques subtils inspirés de :

- cellules ;
- ADN ;
- réseaux biologiques ;
- molécules ;
- microscopes ;
- innovation scientifique.

Éviter les clichés visuels excessifs.

---

# 40. NAVIGATION

Navigation desktop :

```
Accueil
À propos
JSB 2027
Thème
Participer
Candidater
Distinctions
Programme
Sponsors
FAQ
Contact
```

CTA persistants :

> Participer

> Candidater

> Sponsoriser

Sur mobile :

menu hamburger propre et accessible.

---

# 41. ACCESSIBILITÉ

Respecter de bonnes pratiques :

- contraste ;
- tailles de texte ;
- navigation clavier ;
- labels ;
- aria-labels ;
- messages d'erreur ;
- boutons suffisamment grands ;
- focus visible.

---

# 42. PERFORMANCE

Optimiser :

- images ;
- fonts ;
- bundles ;
- requêtes Firebase ;
- lazy loading ;
- pagination ;
- cache ;
- composants.

Éviter les lectures Firestore inutiles.

Ne jamais charger toute la base de données si une pagination suffit.

---

# 43. RESPONSIVE

Tester au minimum :

- 320 px ;
- 375 px ;
- 390 px ;
- 430 px ;
- tablette ;
- laptop ;
- desktop large.

Le formulaire candidat doit être particulièrement confortable sur mobile.

---

# 44. SEO

Prévoir :

- title ;
- meta description ;
- Open Graph ;
- Twitter/X cards ;
- favicon ;
- sitemap ;
- robots.txt ;
- URLs propres.

Exemple :

> JSB 2027 — Journée des Sciences Biologiques

---

# 45. PARTAGE SOCIAL

Prévoir une bonne présentation lors du partage du site sur :

- WhatsApp ;
- Facebook ;
- LinkedIn ;
- X.

Créer une image Open Graph professionnelle.

---

# 46. CONFIGURATION

Créer un système de configuration.

Exemple :

```js
eventSettings = {
  name,
  edition,
  theme,
  date,
  venue,
  registrationOpen,
  applicationOpen,
  votingOpen,
  votingClose
}
```

Ainsi, l'administration peut modifier les informations.

---

# 47. CE QUI NE DOIT PAS ÊTRE INVENTÉ

Si une information n'est pas définie :

NE PAS inventer.

Afficher :

> À confirmer

ou :

> Informations à venir

Cela concerne notamment :

- date exacte ;
- horaires ;
- montants ;
- membres du comité ;
- contacts ;
- programme ;
- règlement définitif.

---

# 48. DONNÉES DE TEST

Créer un environnement de développement avec des données fictives.

Exemples :

- participants fictifs ;
- candidats fictifs ;
- sponsors fictifs ;
- programme fictif ;
- votes fictifs.

IMPORTANT :

Ne jamais mélanger les données de démonstration avec les données réelles de production.

---

# 49. ARCHITECTURE ÉVOLUTIVE

La plateforme doit être conçue comme une base réutilisable pour les prochaines éditions de la JSB.

Elle doit pouvoir évoluer vers :

- JSB 2028, 2029, etc.
- d'autres événements scientifiques ;
- une intégration future au site officiel de la Fondation École Ké Bien ;
- un espace membre ;
- une newsletter ;
- des formations ;
- des conférences ;
- d'autres concours scientifiques ;
- éventuellement un système de paiement ;
- des intégrations avec d'autres services.

Ne pas développer ces fonctionnalités maintenant si elles ne sont pas nécessaires au MVP.

L'architecture doit permettre une future intégration sans devoir reconstruire entièrement l'application.

---

# 50. PRINCIPES DE DÉVELOPPEMENT

Le développement doit suivre la méthode :

**Analyser → Concevoir → Construire → Tester → Corriger → Optimiser**

Ne pas commencer à coder immédiatement sans avoir compris l'architecture.

Avant le développement, présenter :

1. architecture générale ;
2. architecture des dossiers ;
3. schéma Firestore ;
4. schéma Firebase Storage ;
5. système d'authentification ;
6. rôles et permissions ;
7. routes publiques ;
8. routes administratives ;
9. workflow participant ;
10. workflow candidat ;
11. workflow Challenger ;
12. workflow Organisation ;
13. workflow Sponsor ;
14. workflow badge / QR ;
15. workflow attestation ;
16. workflow vote ;
17. workflow évaluation ;
18. stratégie de sécurité ;
19. stratégie de sauvegarde ;
20. roadmap de développement ;
21. principaux risques techniques.

Après validation de cette architecture, commencer le développement progressivement.

---

# 51. ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

## Phase 1 — Fondations

Mettre en place :

- React ;
- TypeScript ;
- Vite ;
- Tailwind CSS ;
- React Router ;
- Firebase ;
- structure des dossiers ;
- configuration des variables d'environnement ;
- Git ;
- GitHub.

## Phase 2 — Site public

Créer :

- page d'accueil ;
- présentation de la JSB ;
- thème ;
- informations pratiques ;
- programme ;
- distinctions ;
- participation ;
- sponsors ;
- organisations ;
- FAQ ;
- contact.

## Phase 3 — Inscription

Créer :

- formulaire participant ;
- validation ;
- contrôle des doublons ;
- enregistrement Firestore ;
- confirmation ;
- génération d'une référence ;
- e-mail de confirmation.

## Phase 4 — Candidature

Créer :

- formulaire candidat ;
- vérification de l'éligibilité ;
- informations personnelles ;
- informations académiques ;
- description du projet ;
- upload du PDF ;
- validation du PDF ;
- question sur le Prix du meilleur poster ;
- confirmation ;
- e-mail de candidature.

Important :

Le candidat ne téléverse aucun poster lors de cette étape.

## Phase 5 — Administration

Créer :

- connexion administrateur ;
- dashboard ;
- liste des participants ;
- liste des candidats ;
- consultation des candidatures ;
- consultation des PDF ;
- filtres ;
- recherche ;
- sélection ;
- rejet ;
- mise en attente ;
- changement de statut.

## Phase 6 — Challengers

Lorsqu'une candidature est acceptée :

```
Candidat → Candidature acceptée → Challenger
```

Le système doit permettre :

- génération du badge Challenger ;
- affichage du statut Challenger ;
- accès aux informations utiles ;
- préparation de la présentation ;
- participation aux évaluations.

## Phase 7 — Badges et QR Codes

Mettre en place :

- badge Participant ;
- badge Challenger ;
- badge Organisation ;
- badge Sponsor ;
- couleurs distinctes ;
- identifiant unique ;
- QR code ;
- page de vérification ;
- validation du badge.

## Phase 8 — Organisations et Sponsors

### Organisations

Mettre en place :

- formulaire ;
- informations de l'organisation ;
- représentant ;
- demande ;
- validation administrative ;
- badge Organisation.

### Sponsors

Mettre en place :

- formulaire ;
- informations du sponsor ;
- type de contribution ;
- message ;
- validation administrative ;
- badge Sponsor.

## Phase 9 — Évaluation scientifique

Créer une interface privée permettant au comité autorisé de :

- consulter les candidats ;
- consulter les projets ;
- enregistrer les évaluations ;
- enregistrer les résultats ;
- verrouiller les évaluations.

Les données d'évaluation doivent rester privées.

Ne jamais exposer publiquement :

- les évaluateurs ;
- les notes individuelles ;
- les commentaires internes ;
- les délibérations.

## Phase 10 — Vote du public

Mettre en place le vote pour :

**Coup de cœur du public**

Le système doit :

- permettre au public de voter ;
- demander une adresse e-mail ;
- vérifier l'adresse e-mail ;
- limiter les votes ;
- empêcher les votes multiples abusifs ;
- appliquer les contrôles côté serveur ;
- enregistrer les votes ;
- permettre à l'administration de consulter les résultats.

Important :

La protection contre les votes multiples ne doit jamais dépendre uniquement du frontend.

## Phase 11 — Attestations

Mettre en place la génération des attestations pour les participants.

Workflow :

```
Inscription → Présence confirmée → Attestation générée → QR / identifiant de vérification → Accès sécurisé
```

L'attestation doit être prévue pour tout le monde conformément aux règles de l'événement.

## Phase 12 — QA / Tests

Tester :

- inscription ;
- candidature ;
- validation des données ;
- upload PDF ;
- limite de taille ;
- détection de doublons ;
- sélection ;
- rejet ;
- passage au statut Challenger ;
- badge ;
- QR ;
- vérification ;
- vote ;
- limitation des votes ;
- organisation ;
- sponsor ;
- attestation ;
- authentification ;
- permissions ;
- Security Rules ;
- Storage Rules.

Tester également :

- smartphone ;
- tablette ;
- ordinateur ;
- différents navigateurs.

## Phase 13 — Déploiement

Préparer :

- repository GitHub ;
- Firebase ;
- Vercel ;
- variables d'environnement ;
- domaine ;
- configuration de production ;
- monitoring ;
- sauvegardes ;
- règles de sécurité.

---

# 52. CONTRAINTE BUDGÉTAIRE

La plateforme doit être conçue en priorité pour fonctionner avec les offres gratuites ou à faible coût lorsque cela est raisonnablement possible.

Éviter :

- services payants inutiles ;
- architecture inutilement complexe ;
- lectures Firestore excessives ;
- stockage de fichiers trop lourds ;
- dépendances inutiles ;
- infrastructure surdimensionnée.

Le système doit cependant pouvoir évoluer si le nombre d'utilisateurs augmente.

---

# 53. GESTION DES PDF

Chaque candidat peut téléverser :

**1 seul PDF**

Contraintes :

- PDF uniquement ;
- maximum 3 pages ;
- taille maximale configurable ;
- validation frontend ;
- validation backend ;
- vérification du MIME type ;
- nom de fichier sécurisé ;
- stockage privé ;
- accès réservé aux personnes autorisées.

Le document doit contenir :

- contexte et justification ;
- problématique ;
- objectifs ;
- pourquoi le projet devrait être sélectionné.

Ne pas créer d'éditeur de document dans la plateforme.

---

# 54. CE QUI NE DOIT PAS ÊTRE FAIT

Ne pas :

- utiliser Google Forms comme formulaire principal ;
- obliger les participants publics à créer un compte ;
- demander un upload de poster pendant la candidature ;
- créer une candidature séparée pour chaque prix ;
- créer un bouton de candidature spécifique pour chaque distinction ;
- afficher les membres du comité scientifique ;
- afficher les notes internes ;
- afficher les commentaires des évaluateurs ;
- afficher les montants des prix ;
- inventer une date définitive ;
- utiliser l'ancien lieu « Amphithéâtre FST » comme lieu officiel ;
- inventer un taux de présélection ;
- mettre des secrets dans GitHub ;
- faire confiance uniquement au frontend pour la sécurité ;
- rendre les PDF accessibles publiquement ;
- exposer les données personnelles ;
- créer une architecture inutilement complexe.

---

# 55. MVP PRIORITAIRE

## Fonctionnalités publiques

Le MVP doit permettre :

- consulter la JSB ;
- consulter le thème ;
- consulter les informations pratiques ;
- s'inscrire ;
- candidater ;
- téléverser le PDF ;
- répondre à la question sur le meilleur poster ;
- demander à devenir sponsor ;
- demander une participation en tant qu'organisation ;
- voter pour le Coup de cœur du public ;
- vérifier un badge ;
- consulter la FAQ ;
- contacter l'organisation.

## Fonctionnalités administratives

L'administrateur doit pouvoir :

- se connecter ;
- consulter le dashboard ;
- consulter les participants ;
- consulter les candidats ;
- consulter les candidatures ;
- télécharger les PDF autorisés ;
- accepter une candidature ;
- rejeter une candidature ;
- mettre une candidature en attente ;
- transformer un candidat accepté en Challenger ;
- gérer les organisations ;
- gérer les sponsors ;
- générer et gérer les badges ;
- consulter les votes ;
- gérer les évaluations ;
- générer les attestations ;
- consulter les logs ;
- exporter les données.

---

# 56. DESIGN VISUEL

L'identité visuelle doit évoquer :

- science ;
- biologie ;
- recherche ;
- innovation ;
- technologie ;
- avenir ;
- développement durable ;
- Congo ;
- institution académique.

Le design doit être :

- moderne ;
- élégant ;
- professionnel ;
- scientifique ;
- institutionnel ;
- lisible.

Éviter :

- animations excessives ;
- effets visuels inutiles ;
- interfaces trop chargées ;
- couleurs incohérentes.

Privilégier :

- cartes modernes ;
- espaces blancs ;
- bonne hiérarchie visuelle ;
- typographie claire ;
- icônes cohérentes ;
- micro-interactions ;
- transitions légères.

---

# 57. NAVIGATION

Le menu principal peut contenir :

```
Accueil
La JSB
Thème
Participer
Candidater
Distinctions
Programme
Sponsors
Organisations
Vote
FAQ
Contact
```

Sur mobile, utiliser un menu responsive.

La navigation doit rester simple et intuitive.

---

# 58. PIED DE PAGE

Prévoir :

- JSB 2027 ;
- Fondation École Ké Bien — École Ké Futa ;
- ANVRI ;
- liens sociaux ;
- contact ;
- mentions légales ;
- politique de confidentialité ;
- conditions de participation si nécessaire.

---

# 59. PROTECTION DES DONNÉES

La plateforme pourra traiter :

- nom ;
- prénom ;
- e-mail ;
- téléphone ;
- établissement ;
- filière ;
- projet ;
- documents ;
- présence ;
- badge ;
- vote.

Ne collecter que les informations réellement nécessaires.

Les données personnelles doivent être protégées.

Prévoir :

- accès contrôlé ;
- règles Firestore ;
- stockage privé ;
- permissions ;
- suppression / modification selon les besoins ;
- journalisation des actions administratives.

---

# 60. GESTION DES ERREURS

Toutes les actions importantes doivent avoir les états suivants :

## Chargement

Afficher un état de chargement clair.

Exemples :

- « Envoi du formulaire… »
- « Téléversement du PDF… »
- « Vérification… »
- « Génération du badge… »
- « Génération de l'attestation… »

## Succès

Confirmer clairement l'action.

## Erreur

Afficher une explication compréhensible et une solution lorsque cela est possible.

## État vide

Afficher un message lorsqu'il n'y a aucune donnée.

Exemples :

- « Aucune candidature trouvée. »
- « Aucun sponsor enregistré. »
- « Aucun participant trouvé. »
- « Aucun vote enregistré. »

Ne jamais laisser l'utilisateur sans feedback.

Désactiver les boutons pendant les opérations critiques afin d'éviter les doubles soumissions.

---

# 61. CONFIRMATION DE CANDIDATURE

Après une candidature réussie, afficher :

**« Votre candidature a été enregistrée avec succès. »**

Afficher :

- référence de candidature ;
- e-mail utilisé ;
- prochaine étape ;
- rappel que le poster sera préparé uniquement après sélection.

Envoyer également un e-mail de confirmation.

---

# 62. EXPORTS ADMINISTRATIFS

Prévoir des exports :

- CSV ;
- Excel si nécessaire ;
- PDF pour certains documents ;
- liste des participants ;
- liste des candidats ;
- liste des Challengers ;
- liste des sponsors ;
- liste des organisations ;
- résultats.

Les exports doivent être réservés aux administrateurs autorisés.

---

# 63. AUDIT LOG

Journaliser les actions administratives sensibles :

- connexion ;
- déconnexion si nécessaire ;
- modification ;
- acceptation ;
- rejet ;
- suppression ;
- validation ;
- génération de badge ;
- génération d'attestation ;
- modification des résultats ;
- changement de rôle.

Chaque entrée peut contenir :

- id ;
- userId ;
- action ;
- resourceType ;
- resourceId ;
- timestamp ;
- metadata.

Ne pas enregistrer inutilement de données sensibles.

---

# 64. DONNÉES DE TEST

Créer des données fictives pour le développement.

Exemples :

- participants ;
- candidats ;
- Challengers ;
- organisations ;
- sponsors ;
- votes ;
- évaluations.

Utiliser uniquement des données fictives.

Ne jamais mettre de vraies données personnelles dans les données de démonstration.

---

# 65. TESTS AUTOMATISÉS

Prévoir des tests pour :

## Frontend

- validation des formulaires ;
- affichage ;
- navigation ;
- états de chargement ;
- états d'erreur.

## Backend

- inscription ;
- candidature ;
- upload ;
- changement de statut ;
- génération de badge ;
- vote ;
- attestation.

## Sécurité

- Firestore Security Rules ;
- Storage Security Rules ;
- permissions ;
- accès aux documents ;
- rôles ;
- accès admin ;
- protection contre les votes multiples.

---

# 66. MULTI-ÉDITIONS

La plateforme doit être capable de gérer :

- JSB 2025 ;
- JSB 2026 ;
- JSB 2027 ;
- JSB 2028 ;
- JSB 2029 ;
- etc.

Chaque donnée doit être associée à une édition lorsque cela est pertinent.

Exemple conceptuel :

```
editionId: "jsb-2027"
```

Cela permettra :

- l'archivage ;
- les statistiques historiques ;
- la réutilisation de la plateforme ;
- la préparation des éditions futures.

---

# 67. CONFIGURATION DYNAMIQUE

Prévoir une configuration centralisée pour :

- eventName ;
- edition ;
- theme ;
- date ;
- venue ;
- organizer ;
- partner ;
- registrationStatus ;
- candidateStatus ;
- maximumPdfSize ;
- maximumPdfPages ;
- votingStatus ;
- socialLinks ;
- contactEmail.

Les informations encore inconnues doivent être faciles à modifier.

Exemple :

```
date = "Mars 2027 — date exacte à confirmer"
```

Lorsque la date officielle sera connue, l'administrateur pourra la modifier sans devoir modifier plusieurs composants du code.

---

# 68. ENVIRONNEMENT DE DÉVELOPPEMENT

Prévoir :

- `.env`
- `.env.example`

Ne jamais publier :

- clés privées ;
- secrets ;
- mots de passe ;
- tokens ;
- credentials sensibles.

Le fichier `.env` doit être ajouté au `.gitignore`.

---

# 69. GIT / GITHUB

Utiliser Git proprement.

Prévoir des commits explicites, par exemple :

- `feat: create public landing page`
- `feat: add participant registration`
- `feat: add candidate application`
- `feat: add PDF upload`
- `feat: add admin dashboard`
- `fix: prevent duplicate registrations`
- `fix: secure badge verification`

Ne pas effectuer de gros changements non documentés.

---

# 70. QUALITÉ DU CODE

Le code doit être :

- propre ;
- lisible ;
- modulaire ;
- fortement typé avec TypeScript ;
- maintenable ;
- documenté lorsque nécessaire ;
- sans duplication inutile.

Éviter :

- composants gigantesques ;
- logique métier dispersée ;
- constantes répétées ;
- secrets codés en dur ;
- dépendances inutiles.

---

# 71. ARCHITECTURE FIREBASE

Utiliser Firebase pour :

- Authentication ;
- Firestore ;
- Storage ;
- Cloud Functions ;
- App Check.

Les opérations sensibles doivent être exécutées côté serveur via Cloud Functions lorsque nécessaire.

Exemples :

- validation des votes ;
- génération de documents ;
- changement sensible de statut ;
- notifications ;
- génération de badges ;
- génération d'attestations.

---

# 72. STRUCTURE FIRESTORE SUGGÉRÉE

Prévoir notamment :

- `editions`
- `events`
- `participants`
- `candidates`
- `projects`
- `organizations`
- `sponsors`
- `badges`
- `certificates`
- `votes`
- `evaluations`
- `users`
- `emailLogs`
- `auditLogs`
- `settings`

Les noms peuvent être adaptés si une meilleure architecture est techniquement justifiée.

Chaque document doit comporter, lorsque pertinent :

- `id`
- `createdAt`
- `updatedAt`
- `status`
- `editionId`

---

# 73. WORKFLOW PARTICIPANT

Workflow :

```
Participant visite le site
→ clique sur « Participer »
→ remplit le formulaire
→ validation des informations
→ contrôle anti-doublon
→ inscription enregistrée
→ confirmation
→ e-mail de confirmation
→ badge Participant
→ présence le jour de l'événement
→ présence confirmée
→ attestation générée
```

---

# 74. WORKFLOW CANDIDAT

Workflow :

```
Candidat visite le site
→ clique sur « Candidater »
→ vérification de l'éligibilité
→ informations personnelles
→ informations académiques
→ description du projet
→ upload du PDF
→ validation du PDF
→ réponse à la question « Souhaitez-vous participer au Prix du meilleur poster ? »
→ soumission
→ candidature enregistrée
→ analyse par l'organisation
→ Acceptée / Rejetée / En attente
→ si acceptée
→ statut Challenger
→ badge Challenger
→ préparation du poster et de la présentation
→ présentation sur site
→ évaluation
→ résultats
```

---

# 75. WORKFLOW POSTER

Workflow :

```
Candidature
→ réponse à la question :
  « Souhaitez-vous participer au Prix du meilleur poster ? »
→ Oui / Non
→ sélection éventuelle
→ statut Challenger
→ préparation du poster
→ présentation physique le jour de l'événement
→ évaluation
```

Le poster n'est donc jamais requis comme fichier lors de la candidature.

---

# 76. WORKFLOW ORGANISATION

Workflow :

```
Demande de participation
→ formulaire Organisation
→ soumission
→ vérification administrative
→ validation
→ statut Organisation
→ badge Organisation
```

L'utilisateur ne doit pas pouvoir s'attribuer lui-même le statut Organisation.

---

# 77. WORKFLOW SPONSOR

Workflow :

```
Demande de sponsoring
→ formulaire Sponsor
→ soumission
→ examen administratif
→ validation
→ statut Sponsor
→ badge Sponsor
```

Le statut Sponsor ne doit être accordé qu'après validation.

Les sponsors peuvent être des personnes, entreprises, institutions ou organisations, selon les règles définies par l'organisation.

Ne pas afficher de montant de sponsoring si aucun montant officiel n'a été fourni.

---

# 78. WORKFLOW VOTE

Workflow :

```
Accès à la page de vote
→ consultation des projets éligibles
→ choix du projet
→ saisie de l'e-mail
→ vérification
→ contrôle anti-doublon
→ contrôle anti-abus côté serveur
→ vote enregistré
→ confirmation
```

Le vote concerne uniquement :

**Coup de cœur du public**

Le système doit viser une règle :

**un vote par adresse e-mail**

avec des mécanismes supplémentaires pour limiter les abus.

---

# 79. WORKFLOW BADGE

Workflow :

```
Utilisateur validé
→ catégorie attribuée
→ badge généré
→ identifiant unique généré
→ QR Code généré
→ QR intégré au badge
→ badge disponible
→ QR scanné
→ page de vérification
```

Le QR Code doit utiliser un identifiant ou token imprévisible.

Ne pas utiliser des identifiants séquentiels facilement devinables.

La page publique de vérification doit afficher uniquement les informations minimales nécessaires à la vérification.

---

# 80. WORKFLOW ATTESTATION

Workflow :

```
Participant inscrit
→ présence confirmée
→ éligibilité à l'attestation
→ attestation générée
→ identifiant unique
→ QR Code de vérification
→ accès sécurisé
```

L'attestation doit être prévue pour tous les participants conformément aux règles officielles de l'événement.

Ne pas demander :

« Souhaitez-vous une attestation ? Oui / Non »

si l'attestation est obligatoire pour tous.

---

# 81. RÈGLES IMPORTANTES SUR LES DISTINCTIONS

Les distinctions officielles de la JSB 2027 sont :

1. **Meilleure innovation**
2. **Meilleure communication orale**
3. **Meilleur poster**
4. **Coup de cœur du public**
5. **Meilleure thématique de recherche**

## Principe fondamental

Ces distinctions ne constituent **pas cinq catégories de candidature différentes**.

Un candidat soumet **un seul projet**.

Une même candidature peut être évaluée pour plusieurs distinctions pertinentes.

Le candidat ne doit donc pas remplir plusieurs formulaires pour un même projet.

### Exemple

Un candidat présente un projet d'innovation scientifique et choisit de participer au Prix du meilleur poster.

Son même projet pourra potentiellement être considéré pour :

- Meilleure innovation ;
- Meilleure communication orale ;
- Meilleur poster ;
- Coup de cœur du public ;
- Meilleure thématique de recherche.

L'attribution finale dépend des critères et des résultats des différentes évaluations.

## Coup de cœur du public

Le « Coup de cœur du public » est la seule distinction déterminée par le vote du public.

Le système de vote doit être séparé de l'évaluation scientifique.

Le public ne doit pas avoir accès :

- aux notes du comité ;
- aux commentaires des évaluateurs ;
- aux résultats internes avant leur publication officielle.

## Meilleur poster

Le Prix du meilleur poster est réservé aux candidats ayant choisi de participer à cette distinction lors de leur candidature.

Le candidat indique :

**« Souhaitez-vous participer au Prix du meilleur poster ? »**

Réponses :

- Oui ;
- Non.

Le poster n'est pas téléversé lors de la candidature.

Le candidat prépare son poster après sa sélection et le présente physiquement le jour de l'événement selon les consignes de l'organisation.

## Meilleure communication orale

Cette distinction concerne la qualité de la présentation orale du projet.

Les critères d'évaluation doivent être configurables afin que le comité puisse éventuellement définir :

- qualité scientifique ;
- clarté ;
- structure ;
- maîtrise du sujet ;
- pertinence ;
- qualité de la présentation ;
- capacité à répondre aux questions.

Ne pas inventer les coefficients ou les pondérations s'ils n'ont pas encore été officiellement définis.

## Meilleure innovation

Cette distinction doit permettre d'évaluer la capacité du projet à proposer une innovation pertinente.

Les critères peuvent être configurables par l'administration ou le comité scientifique.

Ne pas figer dans le code des critères qui n'ont pas encore été officiellement validés.

## Meilleure thématique de recherche

Cette distinction remplace définitivement l'ancienne formulation :

**« Meilleur jeune chercheur »**

Ne jamais afficher « Meilleur jeune chercheur » dans la nouvelle plateforme.

---

# 82. PRIX ET DISTINCTIONS

La plateforme doit présenter les distinctions sans inventer les récompenses.

Pour chaque distinction, afficher :

- nom ;
- description ;
- critères lorsqu'ils sont officiellement disponibles ;
- modalités d'évaluation lorsqu'elles sont officiellement disponibles.

Si les récompenses ou leurs montants ne sont pas encore communiqués :

**« Informations à venir »**

ou

**« À confirmer »**

Ne jamais inventer :

- montant financier ;
- trophée ;
- matériel ;
- certificat ;
- cadeau ;
- avantage particulier.

L'administration doit pouvoir modifier les informations relatives aux prix depuis la configuration de l'événement si cette fonctionnalité est prévue.

---

# 83. COMITÉ SCIENTIFIQUE

Le comité scientifique est une partie interne et privée de la plateforme.

## Accès

Seuls les utilisateurs autorisés doivent pouvoir accéder aux fonctionnalités d'évaluation.

Prévoir éventuellement un rôle :

**Evaluator / Committee**

Ce rôle doit être distinct du rôle :

**Super Admin**

## Fonctionnalités du comité

Selon les permissions définies, un évaluateur peut :

- consulter les candidatures qui lui sont accessibles ;
- consulter les projets ;
- consulter les documents nécessaires ;
- évaluer les projets ;
- enregistrer des notes ;
- ajouter des commentaires internes ;
- soumettre son évaluation.

## Confidentialité

Ne jamais exposer publiquement :

- les noms des évaluateurs ;
- les notes individuelles ;
- les commentaires internes ;
- les délibérations ;
- les classements internes ;
- les résultats provisoires.

## Verrouillage

Une évaluation soumise peut être verrouillée.

Une fois verrouillée, elle ne doit plus être modifiable librement.

Toute modification exceptionnelle doit être :

- autorisée ;
- journalisée ;
- identifiable dans les audit logs.

---

# 84. PRÉSENTATION DU PROGRAMME

Créer une page dédiée au programme de la JSB.

La page pourra présenter :

- cérémonie d'ouverture ;
- conférences ;
- communications scientifiques ;
- présentations orales ;
- présentations de posters ;
- pauses ;
- échanges ;
- networking ;
- remise des distinctions ;
- cérémonie de clôture.

## Programme dynamique

Le programme doit idéalement être administrable depuis le dashboard.

L'administration pourra ajouter :

- titre ;
- description ;
- date ;
- heure de début ;
- heure de fin ;
- intervenant ;
- type d'activité ;
- salle / lieu ;
- ordre d'affichage.

## Informations non confirmées

La date exacte de la JSB 2027 n'étant pas encore confirmée, ne pas inventer de date.

Afficher :

**« Mars 2027 — date exacte à confirmer »**

si nécessaire.

Pour un élément non encore défini :

**« Informations à venir »**

---

# 85. INFORMATIONS OFFICIELLES DE LA JSB 2027

Utiliser les informations suivantes comme référence officielle de la plateforme.

## Nom de l'événement

**Journée des Sciences Biologiques (JSB) 2027**

## Édition

**3e édition**

## Thème

**« Sciences biologiques et innovation : moteurs de la transformation et de la croissance durable au Congo »**

## Période

**Mars 2027**

La date exacte est encore à confirmer.

## Lieu

**Présidence de l'Université Marien Ngouabi**

## Organisateur

**Fondation École Ké Bien — École Ké Futa (EKBF)**

## Fondateur

**Professeur Titulaire Aimé Christian KAYATH**

## Partenaire officiel

**ANVRI**

## Haut patronage

L'événement est placé sous le haut patronage de :

- Président de l'Université Marien Ngouabi ;
- Ministère de la Recherche Scientifique et de l'Innovation Technologique.

## Historique

La communication institutionnelle peut présenter l'évolution :

**2025 → naissance de la JSB**

**2026 → succès**

**2027 → 3e édition**

Ne pas utiliser les anciennes informations qui ne correspondent plus à l'édition 2027.

---

# 86. GESTION DES INFORMATIONS NON CONFIRMÉES

Lorsqu'une information n'est pas encore officiellement confirmée, ne jamais la deviner.

Utiliser une formulation claire :

- **« À confirmer »**
- **« Informations à venir »**
- **« Date exacte à confirmer »**
- **« Programme détaillé à venir »**

Cette règle concerne notamment :

- date exacte ;
- horaires ;
- programme ;
- montants des prix ;
- noms de certains intervenants ;
- partenaires supplémentaires ;
- modalités particulières.

Il est préférable d'afficher une information temporairement indisponible plutôt que d'afficher une fausse information.

---

# 87. PRÉPARATION À L'INTÉGRATION AVEC LA FONDATION

La plateforme JSB doit être développée comme une application autonome.

Cependant, elle doit être conçue dès le départ pour pouvoir être intégrée ultérieurement au site ou à l'écosystème numérique de la :

**Fondation École Ké Bien — École Ké Futa**

## Objectif

À terme, la JSB pourrait devenir :

- une page ;
- un module ;
- une section ;
- une sous-application ;
- une route dédiée ;
- ou une application intégrée au site de la Fondation.

## Architecture

Éviter de créer une dépendance excessive entre la JSB et le futur site de la Fondation.

Les éléments génériques doivent être réutilisables.

Exemples :

- formulaires ;
- authentification ;
- gestion des utilisateurs ;
- badges ;
- QR Codes ;
- attestations ;
- notifications ;
- tableaux de données ;
- gestion des événements ;
- gestion des candidatures.

---

# 88. CHECKLIST AVANT MISE EN PRODUCTION

Avant de déployer la plateforme, vérifier l'ensemble des éléments suivants.

## Site public

- [ ] Page d'accueil fonctionnelle
- [ ] Navigation fonctionnelle
- [ ] Informations officielles correctes
- [ ] Thème correctement affiché
- [ ] Informations pratiques correctes
- [ ] Programme fonctionnel
- [ ] Distinctions correctement présentées
- [ ] Page de participation fonctionnelle
- [ ] Page de candidature fonctionnelle
- [ ] Page sponsors fonctionnelle
- [ ] Page organisations fonctionnelle
- [ ] Page de vote fonctionnelle
- [ ] FAQ fonctionnelle
- [ ] Contact fonctionnel

## Inscription

- [ ] Formulaire fonctionnel
- [ ] Validation des champs
- [ ] Contrôle des doublons
- [ ] Enregistrement Firestore
- [ ] Confirmation utilisateur
- [ ] E-mail de confirmation
- [ ] Référence d'inscription

## Candidature

- [ ] Vérification de l'éligibilité
- [ ] Formulaire fonctionnel
- [ ] Description du projet
- [ ] Upload PDF
- [ ] PDF limité à 3 pages
- [ ] Un seul PDF
- [ ] Validation du type de fichier
- [ ] Validation de la taille
- [ ] Stockage privé
- [ ] Confirmation
- [ ] E-mail de confirmation

## Administration

- [ ] Authentification
- [ ] Dashboard
- [ ] Gestion des rôles
- [ ] Gestion des participants
- [ ] Gestion des candidats
- [ ] Gestion des candidatures
- [ ] Gestion des Challengers
- [ ] Gestion des organisations
- [ ] Gestion des sponsors
- [ ] Gestion des badges
- [ ] Gestion des attestations
- [ ] Gestion des votes
- [ ] Gestion des évaluations
- [ ] Gestion des e-mails
- [ ] Paramètres
- [ ] Audit logs
- [ ] Exports

## Badges

- [ ] Badge Participant
- [ ] Badge Challenger
- [ ] Badge Organisation
- [ ] Badge Sponsor
- [ ] QR Code
- [ ] Identifiant unique
- [ ] Vérification publique
- [ ] Protection contre les identifiants prévisibles
- [ ] Révocation possible

## Attestations

- [ ] Génération
- [ ] Identifiant unique
- [ ] QR Code
- [ ] Vérification
- [ ] Accès sécurisé
- [ ] Association à l'édition
- [ ] Association à la présence

## Vote

- [ ] Vote uniquement pour « Coup de cœur du public »
- [ ] Adresse e-mail demandée
- [ ] Vérification e-mail
- [ ] Contrôle des doublons
- [ ] Contrôle côté serveur
- [ ] App Check
- [ ] Rate limiting
- [ ] Détection des comportements suspects
- [ ] Journalisation
- [ ] Résultats administratifs

## Sécurité

- [ ] Firestore Security Rules sécurisées
- [ ] Storage Security Rules sécurisées
- [ ] Authentication sécurisée
- [ ] Permissions vérifiées
- [ ] App Check activé
- [ ] Validation backend
- [ ] Aucun secret dans GitHub
- [ ] PDF non publics
- [ ] Audit logs actifs
- [ ] Tokens QR imprévisibles

## Responsive

Tester au minimum :

- [ ] Android
- [ ] iPhone
- [ ] tablette
- [ ] ordinateur

## Navigateurs

Tester :

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Performance

Vérifier :

- [ ] chargement rapide ;
- [ ] images optimisées ;
- [ ] lazy loading ;
- [ ] pagination ;
- [ ] requêtes Firestore optimisées ;
- [ ] bundle optimisé ;
- [ ] absence de lectures inutiles.

---

# 89. LIVRABLES ATTENDUS

À la fin du projet, fournir une plateforme complète et fonctionnelle.

## 1. Application web

Une application JSB 2027 moderne, responsive et fonctionnelle.

## 2. Code source

Un repository GitHub propre comprenant :

- frontend ;
- backend / Cloud Functions ;
- configuration Firebase ;
- règles de sécurité ;
- tests ;
- documentation.

## 3. Firebase

Configurer :

- Firebase Authentication ;
- Firestore ;
- Firebase Storage ;
- Cloud Functions ;
- Firebase App Check ;
- Security Rules.

## 4. Dashboard administrateur

Le dashboard doit permettre de gérer :

- participants ;
- candidats ;
- Challengers ;
- organisations ;
- sponsors ;
- badges ;
- attestations ;
- évaluations ;
- votes ;
- e-mails ;
- contenu ;
- paramètres ;
- audit logs.

## 5. Documentation

Documenter :

- installation ;
- configuration ;
- variables d'environnement ;
- configuration Firebase ;
- structure du projet ;
- rôles ;
- permissions ;
- workflows ;
- déploiement ;
- maintenance ;
- gestion des éditions.

## 6. Tests

Fournir :

- tests automatisés lorsque pertinents ;
- tests fonctionnels ;
- tests de sécurité ;
- checklist de validation ;
- tests responsive.

## 7. Déploiement

Préparer le déploiement sur :

**Vercel**

avec connexion à :

**Firebase**

La configuration de production doit être documentée.

---

# 90. RÈGLE FINALE POUR ANTIGRAVITY

Tu es responsable de concevoir et développer une véritable plateforme institutionnelle pour la **Journée des Sciences Biologiques (JSB) 2027 — 3e édition**.

La plateforme doit être :

- professionnelle ;
- moderne ;
- scientifique ;
- élégante ;
- responsive ;
- sécurisée ;
- performante ;
- maintenable ;
- évolutive.

## RÈGLE N°1 : NE PAS CODER IMMÉDIATEMENT

Avant d'écrire le moindre code important, analyser l'ensemble du cahier des charges.

Présenter d'abord :

1. architecture générale ;
2. structure du projet ;
3. architecture frontend ;
4. architecture backend ;
5. schéma Firestore ;
6. architecture Storage ;
7. authentification ;
8. rôles et permissions ;
9. routes publiques ;
10. routes administratives ;
11. workflow participant ;
12. workflow candidat ;
13. workflow Challenger ;
14. workflow Organisation ;
15. workflow Sponsor ;
16. workflow badge ;
17. workflow QR ;
18. workflow attestation ;
19. workflow vote ;
20. workflow évaluation ;
21. système d'e-mails ;
22. sécurité ;
23. anti-abus ;
24. stratégie de tests ;
25. roadmap.

## RÈGLE N°2 : DÉVELOPPEMENT PAR ÉTAPES

Ne pas générer toute l'application en une seule modification massive.

Développer progressivement :

**Fondations → Site public → Inscription → Candidature → Administration → Challengers → Badges → Organisations/Sponsors → Évaluations → Vote → Attestations → Tests → Production**

Après chaque étape :

1. lancer l'application ;
2. tester les fonctionnalités ;
3. vérifier les erreurs ;
4. corriger ;
5. vérifier la sécurité ;
6. vérifier le responsive ;
7. vérifier les performances ;
8. poursuivre uniquement lorsque l'étape est stable.

## RÈGLE N°3 : NE JAMAIS INVENTER

Ne jamais inventer :

- date ;
- lieu ;
- montant ;
- prix ;
- programme ;
- partenaire ;
- intervenant ;
- critère officiel ;
- taux de sélection ;
- information institutionnelle.

Utiliser uniquement les informations officiellement fournies.

Si une information manque :

**« À confirmer »**

ou

**« Informations à venir »**

## RÈGLE N°4 : SÉCURITÉ

Ne jamais :

- exposer les PDF publiquement ;
- exposer les données personnelles ;
- exposer les données du comité ;
- mettre des secrets dans GitHub ;
- utiliser des Security Rules permissives en production ;
- faire confiance uniquement au frontend ;
- permettre à un utilisateur de modifier lui-même son statut ;
- utiliser des identifiants QR prévisibles.

Toutes les opérations sensibles doivent être validées côté serveur.

## RÈGLE N°5 : RÔLES

Les statuts suivants doivent être contrôlés :

- Participant ;
- Challenger ;
- Organisation ;
- Sponsor.

Un utilisateur ne doit jamais pouvoir s'attribuer librement :

- Challenger ;
- Organisation ;
- Sponsor.

Ces statuts doivent découler d'une validation ou d'une décision administrative.

## RÈGLE N°6 : CANDIDATURE

Un candidat :

- remplit un seul formulaire ;
- présente un seul projet ;
- téléverse un seul PDF ;
- PDF de maximum 3 pages ;
- indique s'il souhaite participer au Prix du meilleur poster.

Les distinctions ne sont pas des candidatures séparées.

## RÈGLE N°7 : POSTER

Ne jamais demander le poster comme fichier lors de l'inscription.

Le poster est préparé après la sélection et présenté physiquement le jour de l'événement selon les consignes officielles.

## RÈGLE N°8 : DISTINCTIONS

Utiliser uniquement :

- Meilleure innovation ;
- Meilleure communication orale ;
- Meilleur poster ;
- Coup de cœur du public ;
- Meilleure thématique de recherche.

Ne jamais utiliser :

**« Meilleur jeune chercheur »**

## RÈGLE N°9 : VOTE

Le vote public est réservé au :

**Coup de cœur du public**

Mettre en place :

- vérification e-mail ;
- limitation à un vote par e-mail ;
- contrôles serveur ;
- App Check ;
- rate limiting ;
- détection anti-abus ;
- logs.

## RÈGLE N°10 : ATTESTATIONS

L'attestation doit être prévue pour tous les participants conformément aux règles de l'événement.

Ne pas créer une question :

**« Souhaitez-vous une attestation ? »**

si l'attestation est obligatoire pour tous.

La présence doit permettre de déclencher le processus d'émission.

## RÈGLE N°11 : COMITÉ SCIENTIFIQUE

Le comité scientifique doit rester privé.

Les informations internes ne doivent jamais être accessibles au public.

## RÈGLE N°12 : MULTI-ÉDITIONS

L'architecture doit pouvoir gérer :

- JSB 2025 ;
- JSB 2026 ;
- JSB 2027 ;
- éditions futures.

Utiliser `editionId` lorsque nécessaire.

## RÈGLE N°13 : INTÉGRATION FUTURE

La JSB doit être autonome maintenant, mais techniquement prête à être intégrée plus tard dans l'écosystème de la :

**Fondation École Ké Bien — École Ké Futa**

## RÈGLE N°14 : QUALITÉ

Priorité absolue :

**Fiabilité → Sécurité → Simplicité → Expérience utilisateur → Performance → Évolutivité**

Le code doit être :

- propre ;
- modulaire ;
- typé ;
- maintenable ;
- documenté lorsque nécessaire.

## RÈGLE N°15 : OBJECTIF FINAL

Le résultat final ne doit pas ressembler à un simple formulaire en ligne.

Il doit ressembler à une véritable plateforme numérique institutionnelle dédiée à un événement scientifique majeur.

Elle doit permettre de gérer l'ensemble du cycle :

**Information → Inscription → Candidature → Sélection → Challenger → Badge → Présentation → Évaluation → Vote → Distinctions → Présence → Attestation → Vérification**

La plateforme doit également être suffisamment bien structurée pour devenir la base technique des prochaines éditions de la JSB et, à terme, pouvoir être intégrée à la Fondation École Ké Bien — École Ké Futa.
