# WelcomeBook - Application de Guides Personnalisés

Application Next.js 14 + Supabase pour créer des welcomebooks personnalisés pour les locations de vacances.

## Fonctionnalités

- **URLs dynamiques** : Chaque welcomebook est accessible via `welcomebook.be/[nomdelalocation]`
- **Header & Footer personnalisables** : Couleurs, boutons d'action avec émojis
- **Arrière-plan personnalisable** : Upload d'images pour chaque client
- **Cards de conseils** : Organisées par catégories avec scroll horizontal
- **Modale détaillée** : Carrousel photos/vidéos, informations de contact, horaires, codes promo
- **Carte interactive** : Intégration Leaflet avec marqueurs géolocalisés
- **Mode édition** : Interface pour les gestionnaires (à implémenter)

## Technologies

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : Supabase (PostgreSQL)
- **Cartes** : Leaflet + React Leaflet
- **Icônes** : Lucide React

## Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd welcomeapp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Copiez `.env.local.example` en `.env.local`
3. Remplissez les variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### 4. Initialiser la base de données

1. Ouvrez l'éditeur SQL dans votre dashboard Supabase
2. Copiez et exécutez le contenu de `supabase/schema.sql`
3. Cela créera les tables et insérera des données de démonstration

## Structure de la base de données

### Tables principales

- **clients** : Gestionnaires de locations
- **categories** : Catégories de conseils (restaurants, activités, etc.)
- **tips** : Conseils/recommandations
- **tip_media** : Photos et vidéos des conseils
- **footer_buttons** : Boutons d'action personnalisés du footer

## Utilisation

### Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Voir la démo

Après avoir initialisé la base de données avec les données de démonstration, visitez :
[http://localhost:3000/demo](http://localhost:3000/demo)

## Structure du projet

```
welcomeapp/
├── app/
│   ├── [slug]/              # Pages dynamiques des welcomebooks
│   │   ├── page.tsx         # Server Component (fetch data)
│   │   └── WelcomeBookClient.tsx  # Client Component (UI)
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil
│   └── globals.css          # Styles globaux
├── components/
│   ├── Header.tsx           # En-tête personnalisable
│   ├── Footer.tsx           # Pied de page avec boutons
│   ├── TipCard.tsx          # Card de conseil
│   ├── TipModal.tsx         # Modale de détails
│   └── InteractiveMap.tsx   # Carte Leaflet
├── lib/
│   └── supabase/
│       ├── client.ts        # Client Supabase (browser)
│       └── server.ts        # Client Supabase (server)
├── types/
│   ├── database.types.ts    # Types générés de Supabase
│   └── index.ts             # Types personnalisés
└── supabase/
    └── schema.sql           # Schéma de la base de données
```

## Prochaines étapes

### Mode édition pour gestionnaires

- [ ] Authentification Supabase
- [ ] Interface d'administration
- [ ] Formulaires d'édition (header, footer, conseils)
- [ ] Upload d'images vers Supabase Storage
- [ ] Gestion des catégories et des conseils

### Améliorations

- [ ] SEO et métadonnées dynamiques
- [ ] Optimisation des images (next/image)
- [ ] Progressive Web App (PWA)
- [ ] Multilingue (i18n)
- [ ] Analytics et tracking
- [ ] Système de réservation intégré

## Déploiement

### Vercel (recommandé)

```bash
npm run build
vercel --prod
```

N'oubliez pas de configurer les variables d'environnement dans le dashboard Vercel.

## Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

## Licence

ISC
