# welcomeapp
1 plateforme centrale pour dev les welcomeapp des gestionnaires de locations de vacances
2 chaque gestionnaire édite son welcomebook en se logan les boutons d'édition se dévoile dans le menu et également sur les cards conseils
supa base id : nimbzitahumdefggtiob

récap de la conversation avec mistral pour le cahier des charges : 
📌 Cahier des Charges Simplifié : Welcomebook
Objectif :
Créer une plateforme unique (welcomebook.be) qui permet à chaque gestionnaire de location d’avoir son propre welcomebook personnalisé, accessible via une URL du type :
welcomebook.be/nomdelalocation (ou nomdelalocation.welcomebook.be si tu préfères les sous-domaines).

🔹 Fonctionnalités Principales
1️⃣ Pour les Voyageurs (Consultation)


Page d’accueil :

Affiche les catégories de conseils (ex: "Restaurants", "Activités") en sections horizontales scrollables.
Chaque catégorie contient des cards (titre + photo).
Clic sur une card → Ouverture d’une modale avec :

Carrousel photos/vidéos (effet parallaxe).
Boutons interactifs (📍 Itinéraire, 📞 Appeler, 💬 SMS, 🌐 Site web, etc.).
Code promo copiable, horaires, commentaire du propriétaire.





Carte interactive :

En bas de page, avec des marqueurs liés aux conseils.
Clic sur un marqueur → Affiche les détails du conseil (comme les cards).



Footer :

Boutons émojis pour contacter le gestionnaire (ex: 📞, 💬, 📧, 🌐).
Bouton "Partager" → Génère un lien/QR code.




2️⃣ Pour les Gestionnaires (Édition)


Mode Édition :

Si le gestionnaire est connecté, il voit :

Un menu ☰ dans le header (pour personnaliser le design).
Des boutons "Éditer"/"Supprimer" sur chaque card.
Un bouton "+" flottant pour ajouter un conseil.





Personnalisation :

Changer les couleurs du header/footer.
Changer l’image de fond (upload via Supabase Storage).
Éditer les boutons du footer (ajouter/modifier les liens de contact).



Gestion des Conseils :

Formulaire pour ajouter/modifier/supprimer un conseil :

Titre, catégorie, photos/vidéos, commentaire, itinéraire, coordonnées, horaires, code promo.





Partage :

Bouton pour générer un lien/QR code à partager avec les voyageurs.




🔹 Structure Technique
ÉlémentTechnologie/OutilsFrontendNext.js 14 (App Router), Tailwind CSS, Lucide React (icônes).BackendSupabase (PostgreSQL, Auth, Storage).CarteLeaflet (react-leaflet) ou Google Maps.Markdownreact-markdown pour le contenu riche.QR Codereact-qr-code.DéploiementVercel (frontend), Supabase (backend).URLs dynamiqueswelcomebook.be/[nomdelalocation] (ou sous-domaine).

🔹 Base de Données (Supabase)
Tables essentielles :


clients :

id, name, slug (pour l’URL), header_color, footer_color, background_image.
footer_contact_phone, footer_contact_email, etc. (pour les boutons du footer).



tips (conseils) :

id, client_id, title, category_id, content, route_url, location, coordinates, contact_email, contact_phone, etc.



categories :

id, name, icon (emoji).



tip_media :

id, tip_id, url (lien vers Supabase Storage), type ("image" ou "video").



footer_buttons :

id, client_id, label, emoji, link, order.




🔹 Workflow Utilisateur
Voyageur :

Accède à welcomebook.be/nomdelalocation.
Consulte les conseils par catégorie.
Clique sur une card ou un marqueur pour voir les détails.
Utilise les boutons du footer pour contacter le gestionnaire.

Gestionnaire :

Se connecte à son welcomebook via welcomebook.be/nomdelalocation (avec son compte).
Active le mode édition (menu ☰).
Personnalise le design et ajoute/modifie des conseils.
Partage le lien/QR code avec ses voyageurs.


📅 Plan de Développement (Exemple)


Setup initial :

Créer le projet Next.js + Supabase.
Configurer l’authentification (Supabase Auth).
Créer les tables dans Supabase.



Pages publiques :

Développer la page welcomebook.be/[nomdelalocation].
Intégrer les cards, la modale de détails, et la carte interactive.



Mode Édition :

Ajouter les boutons d’édition et le menu ☰.
Développer les formulaires pour ajouter/modifier des conseils.



Personnalisation :

Intégrer la personnalisation du header/footer et de l’arrière-plan.
Ajouter la gestion des boutons du footer.



Partage & Déploiement :

Générer le lien/QR code.
Déployer sur Vercel et tester.



récap du premier prompte à claude : 

Voici un prompt clé en main pour Claude dans VS Code, conçu pour générer tout le code nécessaire à ton application Welcomebook, en intégrant toutes les fonctionnalités que tu as décrites (mode édition, personnalisation, footer avec boutons émojis, etc.).

📝 Prompt pour Claude (à copier-coller dans VS Code)
 CopierContexte :
Je développe une application Next.js 14 + Supabase pour des "welcomebooks" personnalisés, accessibles via des URLs dynamiques comme `welcomebook.be/[nomdelalocation]`.
Chaque welcomebook a :
- Un **header** et un **footer** personnalisables (couleurs, boutons émojis pour contacter le gestionnaire).
- Un **arrière-plan** personnalisable (image uploadée).
- Des **cards de conseils** organisées par catégories (scroll horizontal).
- Une **modale** pour afficher les détails d’un conseil (carrousel photos/vidéos, boutons interactifs, horaires, code promo).
- Une **carte interactive** avec des marqueurs liés aux conseils.
- Un **mode édition** pour les gestionnaires (boutons d’édition, ajout de conseils, personnalisation du design).

---

### **Structure de la base de données Supabase :**
```sql
-- Clients (gestionnaires de locations)
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  email text not null,
  header_color text default '#4F46E5',
  footer_color text default '#1E1B4B',
  background_image text,
  footer_contact_phone text,
  footer_contact_email text,
  footer_contact_website text,
  footer_contact_facebook text,
  footer_contact_instagram text,
  created_at timestamp with time zone default now()
);

-- Catégories de conseils
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  created_at timestamp with time zone default now()
);

-- Conseils (cards)
create table tips (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  comment text,
  route_url text,
  location text,
  coordinates jsonb,
  contact_email text,
  contact_phone text,
  contact_social jsonb,
  promo_code text,
  opening_hours jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Médias (photos/vidéos des conseils)
create table tip_media (
  id uuid primary key default gen_random_uuid(),
  tip_id uuid references tips(id) on delete cascade,
  url text not null,
  type text not null,
  order integer default 0,
  created_at timestamp with time zone default now()
);

-- Boutons du footer
create table footer_buttons (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  label text not null,
  emoji text not null,
  link text not null,
  order integer default 0
);

📂 Fichiers à générer :


app/[clientSlug]/page.tsx :

Page principale du welcomebook.
Récupère les données du client et ses conseils via Supabase.
Affiche le header, les catégories de conseils, la carte interactive, et le footer.
Mode édition : Si le gestionnaire est connecté, affiche les boutons d’édition et le menu ☰.



components/Header.tsx :

Affiche le nom de la location et le logo.
Bouton ☰ (menu hamburger) uniquement si le gestionnaire est connecté → ouvre une modale pour personnaliser le design.
Bouton "Partager" (icône 📤) → ouvre une modale avec lien/QR code.



components/Footer.tsx :

Affiche les boutons émojis pour contacter le gestionnaire (ex: 📞 Appeler, 💬 SMS).
Bouton "Partager l’app" → ouvre la modale de partage.



components/CategorySection.tsx :

Affiche une section horizontale scrollable pour une catégorie.
Contient des TipCard pour chaque conseil.



components/TipCard.tsx :

Affiche le titre et la photo du conseil.
Mode édition : Boutons "Éditer" et "Supprimer" si le gestionnaire est connecté.
Clic → ouvre la modale TipModal.



components/TipModal.tsx :

Carrousel photos/vidéos (effet parallaxe).
Boutons interactifs (itinéraire, appel, SMS, etc.).
Code promo copiable.
Horaires affichés de manière ludique.



components/InteractiveMap.tsx :

Carte avec marqueurs liés aux conseils (utiliser react-leaflet).
Clic sur un marqueur → ouvre TipModal.



components/EditModeToggle.tsx :

Bouton pour activer/désactiver le mode édition (visible uniquement pour le gestionnaire).



components/AddTipButton.tsx :

Bouton flottant "+" pour ajouter un conseil (visible en mode édition).



components/BackgroundCustomizer.tsx :

Modale pour uploader une nouvelle image de fond ou changer les couleurs du header/footer.



components/ShareModal.tsx :

Génère un lien et un QR code pour partager le welcomebook (utiliser react-qr-code).



lib/supabase.ts :

Configuration du client Supabase (côté serveur et client).



lib/actions.ts :

Fonctions pour interagir avec Supabase :

getClientBySlug(slug: string)
getTipsByClientId(clientId: string)
getCategories()
updateClientBackground(clientId: string, imageUrl: string)






🎨 Contraintes et Bonnes Pratiques :

Utiliser Next.js 14 (App Router) et Tailwind CSS.
Pour les icônes, utiliser Lucide React (lucide-react).
Pour la carte, utiliser react-leaflet (ou @vis.gl/react-google-maps si tu préfères Google Maps).
Pour le QR code, utiliser react-qr-code.
Ne pas exposer les clés Supabase côté client (utiliser server actions ou getServerSideProps).
Optimiser les images avec next/image.
Gérer l’authentification avec Supabase Auth (seul le gestionnaire peut éditer son welcomebook).