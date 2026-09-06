# JSB 2027 — Plateforme officielle

**Journée des Sciences Biologiques 2027 — 3ᵉ édition**

Plateforme web de gestion événementielle scientifique complète : site public,
inscriptions, candidatures scientifiques, documents PDF, présélection,
challengers, badges QR, vote du public, distinctions, sponsors, attestations
et administration.

> ⚠️ Projet en cours de construction. Cahier des charges de référence :
> [`docs/CAHIER_DES_CHARGES_JSB2027.md`](docs/CAHIER_DES_CHARGES_JSB2027.md)

## Informations officielles (ne pas inventer)

| Élément | Valeur |
|---|---|
| Événement | Journée des Sciences Biologiques (JSB) 2027 — 3ᵉ édition |
| Thème | « Sciences biologiques et innovation : moteurs de la transformation et de la croissance durable au Congo » |
| Date | Mars 2027 — date exacte à confirmer |
| Lieu | Présidence de l'Université Marien Ngouabi |
| Organisateur | Fondation École Ké Bien — École Ké Futa (EKBF) |
| Fondateur | Pr Titulaire Aimé Christian KAYATH |
| Partenaire officiel | ANVRI |

La configuration centralisée de l'événement vit dans
`src/config/event.ts` (source de vérité côté frontend, remplacée plus tard
par une configuration administrable).

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS v4
- **Routing** : React Router
- **Backend (à venir)** : Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Hébergement (à venir)** : Vercel
- **Versionnement** : Git + GitHub

## Structure du projet

```
src/
├── components/       # UI réutilisable (Header, Footer, …)
├── pages/            # Pages publiques (route par page)
├── layouts/          # Gabarits (public, admin)
├── features/         # Modules métier
│   ├── participants/
│   ├── candidates/
│   ├── sponsors/
│   ├── badges/
│   ├── voting/
│   ├── certificates/
│   └── administration/
├── services/         # Accès Firebase / API
├── hooks/            # Hooks React réutilisables
├── lib/              # Utilitaires métier (validation, génération…)
├── types/            # Types TypeScript partagés
├── utils/            # Fonctions génériques
├── config/           # Configuration (événement, env)
└── assets/
```

## Démarrage rapide

```bash
npm install
npm run dev        # développement : http://localhost:5173
npm run build      # build de production
npm run preview    # prévisualisation du build
```

## Configuration

Copier `.env.example` vers `.env` puis renseigner les variables
(connexion Firebase — ajoutée en phase backend). Ne jamais committer `.env`.

## Règles de développement (cahier des charges)

1. **Ne pas inventer** : date, lieux, montants, comité → « À confirmer ».
2. **Développement par étapes** : fondations → site public → inscription →
   candidature → administration → challengers → badges → sponsors →
   évaluations → vote → attestations → tests → production.
3. **Sécurité** : pas de secrets dans GitHub, contrôles côté serveur,
   documents PDF privés.
4. Statuts Challenger / Organisation / Sponsor : jamais auto-attribués,
   uniquement par validation administrative.
5. Le poster n'est jamais demandé en fichier lors de la candidature.
