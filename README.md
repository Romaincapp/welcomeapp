# WelcomeBook - Application de Guides Personnalisés

Application Next.js 14 + Supabase pour créer des welcomebooks personnalisés pour les locations de vacances.

## Fonctionnalités

### Pour les voyageurs (Vue publique)
- **URLs dynamiques** : Chaque welcomebook est accessible via `welcomebook.be/[nomdelalocation]`
- **Header & Footer personnalisables** : Couleurs personnalisées, logo, boutons d'action avec émojis
- **Arrière-plan fixe optimisé mobile** :
  - Image de fond en position `fixed` qui peut bouger légèrement avec la barre URL
  - **Débordement intelligent** : Background de 140vh (20vh de débordement haut/bas)
  - **Jamais d'espace vide** : Même quand la barre URL se cache, le background couvre tout
  - **Pas de refresh** du background pendant le scroll
  - Protection contre le "pull-to-refresh" (`overscroll-behavior: none`)
  - Classe CSS dédiée `.bg-fixed-mobile` avec débordement
- **Cards de conseils** : Organisées par catégories avec scroll horizontal
- **Filtres de catégories** : Boutons pour filtrer les conseils par catégorie (Tous, Restaurants, Activités, etc.)
- **Modale détaillée** : Carrousel photos/vidéos, informations de contact, horaires, codes promo, boutons d'action (itinéraire, appel, SMS, etc.)
- **Carte interactive** : Intégration Leaflet avec marqueurs géolocalisés cliquables
- **Section sécurisée** : Accès par code pour informations sensibles (WiFi, adresse exacte, instructions d'arrivée, check-in/out)
- **Partage** : Modal de partage avec QR code et lien

### Pour les gestionnaires (Mode édition)
- **Authentification complète** : Système de login/signup avec Supabase Auth
- **Dashboard gestionnaire** : Interface de configuration initiale et gestion
- **Mode édition in-app** : Activation/désactivation du mode édition sur le welcomebook
- **Menu de personnalisation** :
  - Modification des couleurs header/footer
  - Upload d'images de fond (carrousel)
  - Configuration des boutons footer
  - Gestion des informations de contact
- **Gestion des conseils** :
  - Ajout de conseils avec modal dédiée
  - **🪄 Remplissage intelligent** :
    - **Import depuis Google Maps** : Coller un lien Google Maps pour remplir automatiquement tous les champs
    - **Recherche de lieux** : Recherche en temps réel via Google Places API
    - **Auto-remplissage complet** : Nom, adresse, coordonnées GPS, téléphone, site web, horaires d'ouverture, photos
    - **Suggestion de catégorie** : Détection automatique de la catégorie appropriée
  - **Affichage automatique** : Les nouveaux conseils sont immédiatement visibles (filtre réinitialisé sur "Tous")
  - Édition des conseils existants
  - Suppression avec confirmation
  - Upload de photos via Supabase Storage
  - Sélection de localisation avec MapPicker interactif
  - **Horaires d'ouverture** : Section compacte avec formulaire pour chaque jour de la semaine
- **Drag & Drop** : Réorganisation des catégories et des conseils par glisser-déposer
  - **Desktop** : Glisser-déposer classique avec la souris (8px de mouvement pour activer)
  - **Mobile Tips** : Appui prolongé de 250ms sur le handle (tolérance 8px)
  - **Mobile Catégories** : Appui prolongé de 300ms sur le handle (tolérance 15px - optimisé pour éviter l'annulation)
  - **Feedback visuel** :
    - Tips : Bordure jaune animée pendant l'appui
    - Catégories : Bordure jaune + barre de progression horizontale
  - **Feedback haptique** : Vibration courte au démarrage du drag sur mobile
  - **DragOverlay** : Clone visuel qui suit le doigt pendant le drag (empêche les conflits avec le scroll)
- **Gestion section sécurisée** : Configuration du code d'accès et des informations sensibles
- **Dev Mode** : Modal de login rapide pour développement

## Technologies

- **Frontend** : Next.js 14 (App Router), React 18, TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : Supabase (PostgreSQL)
- **Drag & Drop** : @dnd-kit (PointerSensor + TouchSensor)
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

### 3. Configurer les variables d'environnement

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Créez un projet sur [Google Cloud Console](https://console.cloud.google.com) et activez l'API "Places API"
3. Copiez `.env.local.example` en `.env.local`
4. Remplissez les variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Google Places API (pour le remplissage intelligent)
GOOGLE_PLACES_API_KEY=votre_cle_google_places
```

**Note** : La clé Google Places API est optionnelle. Sans elle, le remplissage intelligent ne fonctionnera pas, mais toutes les autres fonctionnalités restent opérationnelles.

### 4. Initialiser la base de données

1. Ouvrez l'éditeur SQL dans votre dashboard Supabase
2. Copiez et exécutez le contenu de `supabase/schema.sql`
3. Cela créera les tables et insérera des données de démonstration

## Structure de la base de données

### Tables principales

- **clients** : Gestionnaires de locations (nom, slug, email, couleurs personnalisées, images de fond)
- **categories** : Catégories de conseils (restaurants, activités, etc.) avec champ `order` pour le drag & drop
- **tips** : Conseils/recommandations avec champ `order` pour le réorganisation
- **tip_media** : Photos et vidéos des conseils avec support de miniatures (`thumbnail_url`)
- **footer_buttons** : Boutons d'action personnalisés du footer
- **secure_sections** : Informations sensibles protégées par code d'accès (WiFi, adresse, instructions)

### Sécurité (RLS - Row Level Security)

Toutes les tables sont protégées par des policies Supabase :
- **Lecture publique** : Tous les visiteurs peuvent consulter les welcomebooks
- **Écriture authentifiée** : Seuls les propriétaires peuvent modifier leurs propres données
- **Storage** : Bucket `media` avec lecture publique et upload authentifié

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
│   │   └── page.tsx         # Page du welcomebook avec mode édition
│   ├── api/
│   │   ├── places/
│   │   │   ├── autocomplete/ # API Google Places Autocomplete
│   │   │   │   └── route.ts
│   │   │   └── details/      # API Google Places Details
│   │   │       └── route.ts
│   │   └── create-welcomebook/ # API création welcomebook
│   │       └── route.ts
│   ├── dashboard/           # Dashboard gestionnaire
│   │   ├── page.tsx         # Page principale du dashboard
│   │   └── setup/           # Configuration initiale
│   ├── login/               # Page de connexion
│   ├── signup/              # Page d'inscription
│   ├── layout.tsx           # Layout principal avec AuthProvider
│   ├── page.tsx             # Page d'accueil
│   └── globals.css          # Styles globaux
├── components/
│   ├── Header.tsx           # En-tête personnalisable
│   ├── Footer.tsx           # Pied de page avec boutons
│   ├── TipCard.tsx          # Card de conseil (vue publique)
│   ├── DraggableTipCard.tsx # Card avec drag & drop (mode édition)
│   ├── TipModal.tsx         # Modale de détails
│   ├── AddTipModal.tsx      # Modal d'ajout de conseil (avec remplissage intelligent)
│   ├── EditTipModal.tsx     # Modal d'édition de conseil (avec remplissage intelligent)
│   ├── PlaceAutocomplete.tsx # Composant de recherche et import Google Places
│   ├── InteractiveMap.tsx   # Carte Leaflet avec marqueurs
│   ├── MapPicker.tsx        # Sélecteur de localisation
│   ├── CustomizationMenu.tsx # Menu de personnalisation
│   ├── DraggableCategoriesWrapper.tsx # Gestion drag & drop catégories
│   ├── DraggableCategorySection.tsx   # Section catégorie draggable
│   ├── BackgroundCarousel.tsx         # Carrousel images de fond
│   ├── SecureSection.tsx              # Bouton section sécurisée
│   ├── SecureSectionModal.tsx         # Modal gestion section sécurisée
│   ├── SecureAccessForm.tsx           # Formulaire code d'accès
│   ├── SecureSectionContent.tsx       # Contenu section sécurisée
│   ├── ShareModal.tsx                 # Modal de partage
│   ├── ShareWelcomeBookModal.tsx      # Modal partage welcomebook
│   ├── AuthProvider.tsx               # Provider authentification
│   ├── LoginModal.tsx                 # Modal de login
│   ├── DevLoginModal.tsx              # Modal login développement
│   ├── AuthButton.tsx                 # Bouton authentification
│   ├── DeleteConfirmDialog.tsx        # Dialog de confirmation
│   └── LoadingSpinner.tsx             # Spinner de chargement
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Client Supabase (browser)
│   │   └── server.ts        # Client Supabase (server)
│   └── actions.ts           # Server actions
├── types/
│   ├── database.types.ts    # Types générés de Supabase
│   └── index.ts             # Types personnalisés
└── supabase/
    ├── schema.sql           # Schéma complet de la base
    └── migrations/          # Migrations SQL
        ├── 20251014122308_add_rls_policies.sql
        ├── 20251014122840_add_storage_policies.sql
        ├── 20251016_add_order_fields.sql
        └── 20251017_add_secure_sections.sql
```

## Fonctionnalités implémentées ✅

- [x] Authentification Supabase complète (login/signup)
- [x] Interface d'administration (dashboard)
- [x] Formulaires d'édition (header, footer, conseils)
- [x] Upload d'images vers Supabase Storage
- [x] Gestion des catégories et des conseils
- [x] Mode édition in-app avec toggle
- [x] Drag & Drop pour réorganisation (desktop + mobile avec appui prolongé)
- [x] Section sécurisée avec code d'accès
- [x] Carte interactive avec MapPicker
- [x] Carrousel d'images de fond
- [x] Partage avec QR code
- [x] RLS (Row Level Security) complet
- [x] TypeScript strict mode avec 0 erreurs de build
- [x] Background fixe optimisé mobile (débordement intelligent sur toutes les pages : accueil, login, signup, welcomebooks)
- [x] **Remplissage intelligent avec Google Places API** :
  - Import automatique depuis lien Google Maps
  - Recherche de lieux en temps réel
  - Auto-remplissage : nom, adresse, GPS, téléphone, site web, horaires, photos
  - Suggestion automatique de catégorie
- [x] **Horaires d'ouverture** : Formulaire compact pour gérer les horaires jour par jour
- [x] **Optimisation des performances** :
  - Lazy loading des images (chargement uniquement au scroll)
  - Quality optimisée (60-80% selon contexte)
  - Sizes responsive pour Next.js Image
  - Support des thumbnails pour les aperçus (réduction du poids)
  - Priority sur la première image de fond
  - Preload metadata pour les vidéos

## Prochaines étapes

### Améliorations prévues

- [ ] SEO et métadonnées dynamiques
- [ ] Génération automatique de thumbnails lors de l'upload
- [ ] Progressive Web App (PWA)
- [ ] Multilingue (i18n)
- [ ] Analytics et tracking
- [ ] Système de réservation intégré
- [ ] Mode hors ligne
- [ ] Export PDF du welcomebook
- [ ] Thèmes prédéfinis
- [ ] Templates de conseils

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
