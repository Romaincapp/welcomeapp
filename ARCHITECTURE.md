# Architecture de l'application WelcomeBook

## Vue d'ensemble

WelcomeBook est une application Next.js 14 qui utilise :
- **App Router** pour le routing
- **Server Components** pour le rendu côté serveur
- **Client Components** pour l'interactivité
- **Supabase** pour la base de données et l'authentification
- **Tailwind CSS** pour le styling
- **Leaflet** pour les cartes interactives

## Structure des dossiers

```
welcomeapp/
├── app/                          # Application Next.js (App Router)
│   ├── [slug]/                   # Routes dynamiques pour les welcomebooks
│   │   ├── page.tsx              # Server Component - fetch data
│   │   └── WelcomeBookClient.tsx # Client Component - UI interactive
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants réutilisables
│   ├── Header.tsx                # En-tête personnalisable
│   ├── Footer.tsx                # Pied de page avec boutons
│   ├── TipCard.tsx               # Card de conseil
│   ├── TipModal.tsx              # Modale de détails
│   └── InteractiveMap.tsx        # Carte Leaflet
│
├── lib/                          # Utilitaires et configurations
│   └── supabase/
│       ├── client.ts             # Client Supabase (navigateur)
│       └── server.ts             # Client Supabase (serveur)
│
├── types/                        # Définitions TypeScript
│   ├── database.types.ts         # Types générés de Supabase
│   └── index.ts                  # Types personnalisés
│
└── supabase/                     # Configuration Supabase
    └── schema.sql                # Schéma de la base de données
```

## Flux de données

### 1. Rendu d'un welcomebook

```
URL (/[slug])
    ↓
Server Component (page.tsx)
    ↓
Fetch data from Supabase
    ↓
Parse JSON data (coordinates, opening_hours, etc.)
    ↓
Pass to Client Component (WelcomeBookClient.tsx)
    ↓
Render UI with interactivity
```

### 2. Composants Server vs Client

**Server Components (app/[slug]/page.tsx)**
- Fetch les données depuis Supabase
- Pas d'interactivité
- Rendu côté serveur
- Accès direct aux secrets d'environnement

**Client Components (components/\*.tsx)**
- Gèrent l'état local (useState)
- Gèrent les événements utilisateur
- Rendu côté client
- Marqués avec 'use client'

## Modèle de données

### Relations

```
clients (1) ──< (N) tips
clients (1) ──< (N) footer_buttons
categories (1) ──< (N) tips
tips (1) ──< (N) tip_media
```

### Schéma principal

**clients**
- Configuration du welcomebook (couleurs, contacts, arrière-plan)
- Identifié par un slug unique dans l'URL

**tips**
- Conseils/recommandations
- Peuvent appartenir à une catégorie
- Contiennent des données JSONB pour la flexibilité

**tip_media**
- Photos et vidéos liées à un conseil
- Ordre défini pour le carrousel

**categories**
- Organisent les conseils
- Affichent un icône (emoji)

**footer_buttons**
- Boutons d'action personnalisés
- Liens vers WhatsApp, email, téléphone, etc.

## Patterns et conventions

### 1. Nomenclature

- **Components** : PascalCase (ex: `TipCard.tsx`)
- **Hooks** : camelCase avec préfixe "use" (ex: `useAuth`)
- **Types** : PascalCase (ex: `TipWithDetails`)
- **Variables** : camelCase (ex: `selectedTip`)

### 2. Types TypeScript

Les types sont générés à partir du schéma Supabase et étendus avec des types personnalisés :

```typescript
// Type de base (généré)
type Tip = Database['public']['Tables']['tips']['Row']

// Type étendu (personnalisé)
interface TipWithDetails extends Tip {
  category?: Category | null
  media: TipMedia[]
  coordinates_parsed?: Coordinates
}
```

### 3. Gestion de l'état

- **État local** : `useState` pour l'UI (modal ouvert/fermé, catégorie sélectionnée)
- **État serveur** : Fetché via Supabase dans les Server Components
- **Pas de state management global** : Pas nécessaire pour le moment

### 4. Styling

- **Tailwind CSS** : Classes utilitaires pour le styling
- **Inline styles** : Pour les couleurs personnalisables (header, footer)
- **CSS modules** : Non utilisés (Tailwind suffit)

## Performance

### 1. Optimisations Next.js

- **Server Components** par défaut : Réduit le JavaScript côté client
- **Static Generation** : Page d'accueil pré-rendue
- **Dynamic Rendering** : Pages [slug] rendues à la demande

### 2. Images

- Utilisation de `next/image` pour l'optimisation automatique
- Lazy loading par défaut
- Formats modernes (WebP)

### 3. Base de données

- **Index** sur les colonnes fréquemment requêtées
- **RLS (Row Level Security)** pour la sécurité
- **Select spécifiques** : Ne pas utiliser `SELECT *` en production

## Sécurité

### 1. Row Level Security (RLS)

Toutes les tables ont RLS activé avec des politiques de lecture publique :

```sql
CREATE POLICY "Public can read clients"
ON clients FOR SELECT
USING (true);
```

### 2. Variables d'environnement

- `NEXT_PUBLIC_*` : Exposées au client
- Autres : Serveur uniquement

### 3. Authentification (à implémenter)

Pour le mode édition :
- Supabase Auth
- Protected routes
- JWT tokens

## Évolutions futures

### Mode édition

1. **Authentification**
   - Login via Supabase Auth
   - Protected routes avec middleware

2. **Interface d'administration**
   - Dashboard pour les gestionnaires
   - CRUD pour les conseils
   - Upload d'images vers Supabase Storage

3. **Composants d'édition**
   - Formulaires avec validation (React Hook Form)
   - Drag & drop pour réorganiser
   - Preview en temps réel

### Fonctionnalités avancées

1. **SEO**
   - Métadonnées dynamiques par welcomebook
   - Open Graph images
   - Sitemap dynamique

2. **Analytics**
   - Tracking des vues
   - Heatmaps
   - Statistiques pour les gestionnaires

3. **Internationalisation**
   - Support multilingue
   - Traductions automatiques (optionnel)

4. **PWA**
   - Mode offline
   - Installation sur mobile
   - Notifications push

## Technologies

| Technologie | Version | Usage |
|------------|---------|-------|
| Next.js | 14 | Framework React |
| React | 18 | Bibliothèque UI |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 3 | Styling |
| Supabase | 2 | Backend-as-a-Service |
| Leaflet | 1.9 | Cartes interactives |
| Lucide React | - | Icônes |

## Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm run start

# Lint
npm run lint

# Type checking
npx tsc --noEmit
```

## Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request
