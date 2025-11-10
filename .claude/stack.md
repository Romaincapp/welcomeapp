# Stack Technique - welcomeapp

## Description du Projet

1 plateforme centrale pour développer les welcomeapp des gestionnaires de locations de vacances.
Chaque gestionnaire édite son welcomeapp en se connectant - les boutons d'édition se dévoilent dans le menu et sur les cards de conseils.

**Supabase ID** : nimbzitahumdefggtiob

---

## Stack Technique

| Élément | Technologie/Outils |
|---------|-------------------|
| **Frontend** | Next.js 16.0.1 (App Router, Turbopack), React 19.2.0, Tailwind CSS, Lucide React (icônes) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Carte interactive** | Leaflet (react-leaflet) |
| **Markdown** | react-markdown pour le contenu riche |
| **QR Code** | react-qr-code |
| **Déploiement** | Vercel (frontend), Supabase (backend) |
| **URLs dynamiques** | welcomeapp.be/[slug] |

---

## Format d'URL

**Format retenu** : `welcomeapp.be/[slug]` uniquement (pas de sous-domaine)

**Avantages** :
- Plus simple à déployer et configurer
- Pas de configuration DNS wildcard nécessaire
- Meilleur pour le SEO

---

## Fonctionnalités Principales

### 1️⃣ Pour les Voyageurs (Consultation)

#### Page d'accueil
- Affiche les catégories de conseils (ex: "Restaurants", "Activités") en sections horizontales scrollables
- Chaque catégorie contient des cards (titre + photo)
- Clic sur une card → Ouverture d'une modale avec :
  - Carrousel photos/vidéos (effet parallaxe)
  - Boutons interactifs (📍 Itinéraire, 📞 Appeler, 💬 SMS, 🌐 Site web, etc.)
  - Code promo copiable, horaires, commentaire du propriétaire

#### Carte interactive
- En bas de page, avec des marqueurs liés aux conseils
- Clic sur un marqueur → Affiche les détails du conseil (comme les cards)

#### Footer
- Boutons émojis pour contacter le gestionnaire (ex: 📞, 💬, 📧, 🌐)
- Bouton "Partager" → Génère un lien/QR code

### 2️⃣ Pour les Gestionnaires (Édition)

#### Mode Édition
Si le gestionnaire est connecté, il voit :
- Un menu ☰ dans le header (pour personnaliser le design)
- Des boutons "Éditer"/"Supprimer" sur chaque card
- Un bouton "+" flottant pour ajouter un conseil

#### Personnalisation
- Changer les couleurs du header/footer
- Changer l'image de fond (upload via Supabase Storage)
- Éditer les boutons du footer (ajouter/modifier les liens de contact)

#### Gestion des Conseils
Formulaire pour ajouter/modifier/supprimer un conseil :
- Titre, catégorie, photos/vidéos, commentaire, itinéraire, coordonnées, horaires, code promo

#### Partage
- Bouton pour générer un lien/QR code à partager avec les voyageurs

---

## Workflow Utilisateur

### Voyageur
1. Accède à welcomeapp.be/nomdelalocation
2. Consulte les conseils par catégorie
3. Clique sur une card ou un marqueur pour voir les détails
4. Utilise les boutons du footer pour contacter le gestionnaire

### Gestionnaire
1. Se connecte à son welcomeapp via welcomeapp.be/nomdelalocation (avec son compte)
2. Active le mode édition (menu ☰)
3. Personnalise le design et ajoute/modifie des conseils
4. Partage le lien/QR code avec ses voyageurs

---

## Contraintes et Bonnes Pratiques

- Utiliser Next.js 14 (App Router) et Tailwind CSS
- Pour les icônes, utiliser Lucide React (lucide-react)
- Pour la carte, utiliser react-leaflet
- Pour le QR code, utiliser react-qr-code
- Ne pas exposer les clés Supabase côté client (utiliser server actions)
- Optimiser les images avec next/image
- Gérer l'authentification avec Supabase Auth (seul le gestionnaire peut éditer son welcomeapp)

---

## Fichiers Principaux

### Pages
- `app/[...slug]/page.tsx` - Page principale du welcomeapp (serveur)
- `app/[...slug]/WelcomeBookClient.tsx` - Composant client principal
- `app/dashboard/page.tsx` - Dashboard gestionnaire (serveur)
- `app/dashboard/DashboardClient.tsx` - Composant client dashboard
- `app/login/page.tsx` - Page de connexion
- `app/signup/page.tsx` - Page d'inscription

### Composants
- `components/Header.tsx` - Header avec nom de location, boutons de navigation
- `components/Footer.tsx` - Footer avec boutons de contact
- `components/TipCard.tsx` - Card de conseil
- `components/TipModal.tsx` - Modale détaillée d'un conseil
- `components/DraggableCategorySection.tsx` - Section de catégorie avec drag & drop
- `components/InteractiveMap.tsx` - Carte Leaflet interactive
- `components/CustomizationMenu.tsx` - Menu de personnalisation
- `components/ShareModal.tsx` - Modale de partage (lien + QR code)

### Server Actions & Helpers
- `lib/supabase/server.ts` - Client Supabase serveur
- `lib/supabase/client.ts` - Client Supabase browser
- `lib/actions/create-welcomebook.ts` - Création de welcomebook
- `lib/actions/reorder.ts` - Réorganisation drag & drop
- `lib/actions/secure-section.ts` - Gestion section sécurisée
- `lib/client-translation.ts` - Traduction côté client

---

## Optimisations de Performance

- ✅ **Lazy loading** : Images chargées uniquement au scroll
- ✅ **Quality optimisée** : Compression 60-80% selon contexte
- ✅ **Sizes responsive** : Attribut `sizes` pour optimiser téléchargement
- ✅ **Thumbnails** : Support du champ `thumbnail_url` dans TipCard
- ✅ **Priority** : Première image de fond et première image de modale chargées en priorité
- ✅ **Preload metadata** : Vidéos avec `preload="metadata"` ou `preload="none"`
