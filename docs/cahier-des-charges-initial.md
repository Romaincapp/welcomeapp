# Cahier des Charges Initial - welcomeapp

**⚠️ ARCHIVE** : Ce document est une archive des conversations initiales avec Mistral et Claude qui ont lancé le projet. Il ne reflète pas nécessairement l'état actuel du projet. Voir [CLAUDE.md](../CLAUDE.md) et [.claude/stack.md](../.claude/stack.md) pour l'état actuel.

---

## Récap de la Conversation avec Mistral

### 📌 Cahier des Charges Simplifié : WelcomeApp

**Objectif** :
Créer une plateforme unique (welcomeapp.be) qui permet à chaque gestionnaire de location d'avoir son propre welcomeapp personnalisé, accessible via une URL du type :
**welcomeapp.be/slug** (exemple : welcomeapp.be/demo)

**Format d'URL retenu** : `welcomeapp.be/[slug]` uniquement (pas de sous-domaine)
- Plus simple à déployer et configurer
- Pas de configuration DNS wildcard nécessaire
- Meilleur pour le SEO

---

### 🔹 Fonctionnalités Principales

#### 1️⃣ Pour les Voyageurs (Consultation)

**Page d'accueil** :
- Affiche les catégories de conseils (ex: "Restaurants", "Activités") en sections horizontales scrollables
- Chaque catégorie contient des cards (titre + photo)
- Clic sur une card → Ouverture d'une modale avec :
  - Carrousel photos/vidéos (effet parallaxe)
  - Boutons interactifs (📍 Itinéraire, 📞 Appeler, 💬 SMS, 🌐 Site web, etc.)
  - Code promo copiable, horaires, commentaire du propriétaire

**Carte interactive** :
- En bas de page, avec des marqueurs liés aux conseils
- Clic sur un marqueur → Affiche les détails du conseil (comme les cards)

**Footer** :
- Boutons émojis pour contacter le gestionnaire (ex: 📞, 💬, 📧, 🌐)
- Bouton "Partager" → Génère un lien/QR code

#### 2️⃣ Pour les Gestionnaires (Édition)

**Mode Édition** :
Si le gestionnaire est connecté, il voit :
- Un menu ☰ dans le header (pour personnaliser le design)
- Des boutons "Éditer"/"Supprimer" sur chaque card
- Un bouton "+" flottant pour ajouter un conseil

**Personnalisation** :
- Changer les couleurs du header/footer
- Changer l'image de fond (upload via Supabase Storage)
- Éditer les boutons du footer (ajouter/modifier les liens de contact)

**Gestion des Conseils** :
Formulaire pour ajouter/modifier/supprimer un conseil :
- Titre, catégorie, photos/vidéos, commentaire, itinéraire, coordonnées, horaires, code promo

**Partage** :
- Bouton pour générer un lien/QR code à partager avec les voyageurs

---

### 🔹 Structure Technique

| Élément | Technologie/Outils |
|---------|-------------------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Lucide React (icônes) |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Carte** | Leaflet (react-leaflet) ou Google Maps |
| **Markdown** | react-markdown pour le contenu riche |
| **QR Code** | react-qr-code |
| **Déploiement** | Vercel (frontend), Supabase (backend) |
| **URLs dynamiques** | welcomeapp.be/[nomdelalocation] |

---

### 🔹 Base de Données (Supabase)

**Tables essentielles** :

**clients** :
- id, name, slug (pour l'URL), header_color, footer_color, background_image
- footer_contact_phone, footer_contact_email, etc. (pour les boutons du footer)

**tips (conseils)** :
- id, client_id, title, category_id, content, route_url, location, coordinates
- contact_email, contact_phone, etc.

**categories** :
- id, name, icon (emoji)

**tip_media** :
- id, tip_id, url (lien vers Supabase Storage), type ("image" ou "video")

**footer_buttons** :
- id, client_id, label, emoji, link, order

---

### 🔹 Workflow Utilisateur

**Voyageur** :
1. Accède à welcomeapp.be/nomdelalocation
2. Consulte les conseils par catégorie
3. Clique sur une card ou un marqueur pour voir les détails
4. Utilise les boutons du footer pour contacter le gestionnaire

**Gestionnaire** :
1. Se connecte à son welcomeapp via welcomeapp.be/nomdelalocation (avec son compte)
2. Active le mode édition (menu ☰)
3. Personnalise le design et ajoute/modifie des conseils
4. Partage le lien/QR code avec ses voyageurs

---

### 📅 Plan de Développement (Exemple)

**Setup initial** :
- Créer le projet Next.js + Supabase
- Configurer l'authentification (Supabase Auth)
- Créer les tables dans Supabase

**Pages publiques** :
- Développer la page welcomeapp.be/[nomdelalocation]
- Intégrer les cards, la modale de détails, et la carte interactive

**Mode Édition** :
- Ajouter les boutons d'édition et le menu ☰
- Développer les formulaires pour ajouter/modifier des conseils

**Personnalisation** :
- Intégrer la personnalisation du header/footer et de l'arrière-plan
- Ajouter la gestion des boutons du footer

**Partage & Déploiement** :
- Générer le lien/QR code
- Déployer sur Vercel et tester

---

## Récap du Premier Prompt à Claude

### 📝 Prompt pour Claude (VS Code)

**Contexte** :
Je développe une application Next.js 14 + Supabase pour des "welcomeapps" personnalisés, accessibles via des URLs dynamiques comme `welcomeapp.be/[nomdelalocation]`.

Chaque welcomeapp a :
- Un **header** et un **footer** personnalisables (couleurs, boutons émojis pour contacter le gestionnaire)
- Un **arrière-plan** personnalisable (image uploadée)
- Des **cards de conseils** organisées par catégories (scroll horizontal)
- Une **modale** pour afficher les détails d'un conseil (carrousel photos/vidéos, boutons interactifs, horaires, code promo)
- Une **carte interactive** avec des marqueurs liés aux conseils
- Un **mode édition** pour les gestionnaires (boutons d'édition, ajout de conseils, personnalisation du design)

---

### 📂 Fichiers à Générer

**app/[clientSlug]/page.tsx** :
- Page principale du welcomeapp
- Récupère les données du client et ses conseils via Supabase
- Affiche le header, les catégories de conseils, la carte interactive, et le footer
- Mode édition : Si le gestionnaire est connecté, affiche les boutons d'édition et le menu ☰

**components/Header.tsx** :
- Affiche le nom de la location et le logo
- Bouton ☰ (menu hamburger) uniquement si le gestionnaire est connecté → ouvre une modale pour personnaliser le design
- Bouton "Partager" (icône 📤) → ouvre une modale avec lien/QR code

**components/Footer.tsx** :
- Affiche les boutons émojis pour contacter le gestionnaire (ex: 📞 Appeler, 💬 SMS)
- Bouton "Partager l'app" → ouvre la modale de partage

**components/CategorySection.tsx** :
- Affiche une section horizontale scrollable pour une catégorie
- Contient des TipCard pour chaque conseil

**components/TipCard.tsx** :
- Affiche le titre et la photo du conseil
- Mode édition : Boutons "Éditer" et "Supprimer" si le gestionnaire est connecté
- Clic → ouvre la modale TipModal

**components/TipModal.tsx** :
- Carrousel photos/vidéos (effet parallaxe)
- Boutons interactifs (itinéraire, appel, SMS, etc.)
- Code promo copiable
- Horaires affichés de manière ludique

**components/InteractiveMap.tsx** :
- Carte avec marqueurs liés aux conseils (utiliser react-leaflet)
- Clic sur un marqueur → ouvre TipModal

**components/EditModeToggle.tsx** :
- Bouton pour activer/désactiver le mode édition (visible uniquement pour le gestionnaire)

**components/AddTipButton.tsx** :
- Bouton flottant "+" pour ajouter un conseil (visible en mode édition)

**components/BackgroundCustomizer.tsx** :
- Modale pour uploader une nouvelle image de fond ou changer les couleurs du header/footer

**components/ShareModal.tsx** :
- Génère un lien et un QR code pour partager le welcomeapp (utiliser react-qr-code)

**lib/supabase.ts** :
- Configuration du client Supabase (côté serveur et client)

**lib/actions.ts** :
- Fonctions pour interagir avec Supabase :
  - getClientBySlug(slug: string)
  - getTipsByClientId(clientId: string)
  - getCategories()
  - updateClientBackground(clientId: string, imageUrl: string)

---

### 🎨 Contraintes et Bonnes Pratiques

- Utiliser Next.js 14 (App Router) et Tailwind CSS
- Pour les icônes, utiliser Lucide React (lucide-react)
- Pour la carte, utiliser react-leaflet (ou @vis.gl/react-google-maps si tu préfères Google Maps)
- Pour le QR code, utiliser react-qr-code
- Ne pas exposer les clés Supabase côté client (utiliser server actions ou getServerSideProps)
- Optimiser les images avec next/image
- Gérer l'authentification avec Supabase Auth (seul le gestionnaire peut éditer son welcomeapp)

---

## Évolutions Depuis le Cahier des Charges Initial

### Ajouts Majeurs

1. **Système multilingue** (7 langues) - Non prévu initialement
2. **Traduction côté client gratuite** - Évolution du système multilingue
3. **PWA installable** - Non prévu initialement
4. **Smart Fill** avec Google Places API - Grosse amélioration UX
5. **Gamification** (badges, checklist dynamique) - Non prévu initialement
6. **Section sécurisée** avec protection par code - Non prévu initialement
7. **Données Google Places** (rating, reviews) - Enrichissement des conseils
8. **Header mode compact** avec détection de scroll - Amélioration UX
9. **Géolocalisation** pour adresse auto - Amélioration UX

### Modifications du Schéma Initial

1. **footer_buttons** → Supprimé, intégré dans `clients` avec colonnes dédiées
2. **users** → Supprimé, remplacé par `auth.users` de Supabase
3. **Ajout de `secure_sections`** → Nouvelle table pour infos sensibles
4. **Ajout de champs multilingues** → 6 colonnes par champ traduit
5. **Ajout de `thumbnail_url`** dans `tip_media` → Optimisation images
6. **Ajout de `order`** dans `tips` et `categories` → Drag & drop
7. **Ajout de données Google** dans `tips` → rating, reviews, price_level

---

## État Actuel vs Cahier des Charges Initial

### ✅ Fonctionnalités Implémentées (100% du cahier des charges initial)

Toutes les fonctionnalités prévues dans le cahier des charges initial ont été implémentées et même dépassées avec l'ajout de nombreuses features non prévues initialement.

### 🚀 Au-delà du Cahier des Charges

Le projet a largement dépassé le cahier des charges initial avec l'ajout de :
- Système multilingue complet
- PWA installable
- Smart Fill avec IA
- Gamification
- Section sécurisée
- Et bien plus...

---

## Conclusion

Ce cahier des charges initial a servi de base solide pour le projet, mais le produit final a évolué bien au-delà des spécifications initiales grâce aux itérations et aux feedbacks.

**Date de création du cahier des charges** : Octobre 2025
**Date de mise en archive** : Novembre 2025
**Raison de l'archivage** : Restructuration de la documentation pour améliorer la lisibilité
