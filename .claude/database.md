# Base de Données - welcomeapp

## Vue d'Ensemble

**Base de données complètement synchronisée** (dernière vérification : 2025-11-04 via MCP)

- ✅ `supabase/schema.sql` : À jour avec toutes les tables et champs
- ✅ `supabase/migrations/*.sql` : 19 migrations correctement appliquées
- ✅ `types/database.types.ts` : Types TypeScript synchronisés avec la DB
- ✅ Build : Compile sans erreur TypeScript
- ✅ **MCP Supabase** : Connecté et opérationnel

**Supabase ID** : nimbzitahumdefggtiob

---

## Tables (6 tables)

### 1. `clients`
**Gestionnaires de locations avec personnalisation complète**

**Clé primaire** : `id` (uuid)

**Champs principaux** :
- `name` (text) - Nom du logement
- `slug` (text, unique) - URL du welcomeapp (ex: "villa-belle-vue")
- `email` (text, unique) - Email du gestionnaire
- `user_id` (uuid, nullable) - Lien vers auth.users
- `subdomain` (text, nullable, unique) - Sous-domaine (obsolète, pas utilisé)

**Personnalisation visuelle** :
- `header_color` (text, default: '#4F46E5') - Couleur du header
- `footer_color` (text, default: '#1E1B4B') - Couleur du footer
- `header_subtitle` (text, default: 'Bienvenue dans votre guide personnalisé')
- `background_image` (text, default: '/backgrounds/default-1.jpg') - Image de fond
- `background_effect` (text, default: 'normal') - Effet du background (normal/parallax/fixed)
- `mobile_background_position` (text, default: '50% 50%') - Recadrage mobile du background

**Contact footer** :
- `footer_contact_phone` (text, nullable)
- `footer_contact_email` (text, nullable)
- `footer_contact_website` (text, nullable)
- `footer_contact_facebook` (text, nullable)
- `footer_contact_instagram` (text, nullable)

**Monétisation** :
- `ad_iframe_url` (text, nullable) - URL de l'iframe publicitaire

**Tracking & Analytics** :
- `has_shared` (boolean, default: false, nullable) - Indique si le gestionnaire a effectué une action de partage (copie lien ou téléchargement QR). Utilisé pour cocher automatiquement la tâche "Partager" dans la checklist du dashboard.

**Multilingue (6 langues : EN, ES, NL, DE, IT, PT)** :
- `name_en`, `name_es`, `name_nl`, `name_de`, `name_it`, `name_pt`
- `header_subtitle_en`, `header_subtitle_es`, etc.

**Timestamps** :
- `created_at` (timestamp with time zone, default: now())

**RLS** : ✅ Activé

**Relations** :
- → tips (ON DELETE CASCADE)
- → secure_sections (ON DELETE CASCADE)

---

### 2. `categories`
**Catégories de conseils avec drag & drop**

**Clé primaire** : `id` (uuid)

**Champs** :
- `name` (text) - Nom de la catégorie (ex: "Restaurants", "Activités")
- `slug` (text, unique) - Slug pour l'URL (ex: "restaurants")
- `icon` (text, nullable) - Emoji (ex: "🍴", "🎨")
- `order` (integer, default: 0) - Ordre d'affichage (drag & drop)

**Multilingue (6 langues)** :
- `name_en`, `name_es`, `name_nl`, `name_de`, `name_it`, `name_pt`

**Timestamps** :
- `created_at` (timestamp with time zone, default: now())

**RLS** : ✅ Activé

**Relations** :
- → tips (ON DELETE SET NULL)

**Catégories par défaut** (9) :
1. Restaurants 🍴
2. Activités 🎨
3. Nature 🌲
4. Culture 🏛️
5. Shopping 🛍️
6. Vie nocturne 🌙
7. Bien-être 💆
8. Services 🔧
9. Le logement 🏠

---

### 3. `tips`
**Conseils avec données Google Places et multilingue complet**

**Clé primaire** : `id` (uuid)

**Relations** :
- `client_id` (uuid) → clients
- `category_id` (uuid, nullable) → categories

**Contenu** :
- `title` (text) - Titre du conseil (ex: "Le Belvédère")
- `comment` (text, nullable) - Commentaire du propriétaire
- `location` (text, nullable) - Adresse
- `coordinates` (jsonb, nullable) - `{ lat: number, lng: number }`
- `route_url` (text, nullable) - URL Google Maps pour l'itinéraire
- `order` (integer, default: 0) - Ordre d'affichage (drag & drop)

**Contact** :
- `contact_email` (text, nullable)
- `contact_phone` (text, nullable)
- `contact_social` (jsonb, nullable) - `{ facebook: string, instagram: string, ... }`
- `promo_code` (text, nullable) - Code promo copiable
- `opening_hours` (jsonb, nullable) - Horaires par jour de la semaine

**Données Google Places** (ajoutées 2025-10-23) :
- `rating` (numeric, nullable) - Note Google (0.0-5.0)
- `user_ratings_total` (integer, default: 0) - Nombre d'avis
- `price_level` (integer, nullable, CHECK: 0-4) - Niveau de prix ($, $$, $$$, $$$$)
- `reviews` (jsonb, nullable) - Jusqu'à 5 avis Google
  ```json
  [{
    "author_name": "John Doe",
    "rating": 5,
    "text": "Excellent restaurant!",
    "relative_time_description": "3 months ago",
    "profile_photo_url": "https://...",
    "time": 1234567890
  }]
  ```

**Multilingue (6 langues)** :
- `title_en`, `title_es`, `title_nl`, `title_de`, `title_it`, `title_pt`
- `comment_en`, `comment_es`, etc.

**Timestamps** :
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

**RLS** : ✅ Activé

**Relations** :
- → tip_media (ON DELETE CASCADE)

---

### 4. `tip_media`
**Médias (photos/vidéos) des conseils avec thumbnails optimisés**

**Clé primaire** : `id` (uuid)

**Champs** :
- `tip_id` (uuid) → tips (ON DELETE CASCADE)
- `url` (text) - URL complète du média (Supabase Storage ou externe)
- `thumbnail_url` (text, nullable) - Miniature optimisée (recommandé 400x400px, quality 60)
- `type` (text, CHECK: 'image' ou 'video')
- `order` (integer, default: 0) - Ordre d'affichage dans le carrousel

**Timestamps** :
- `created_at` (timestamp with time zone, default: now())

**RLS** : ✅ Activé

**Note** : Toujours récupérer `thumbnail_url` en plus de `url` lors des suppressions, car les thumbnails sont des fichiers séparés dans le storage.

---

### 5. `secure_sections`
**Informations sensibles protégées par code d'accès**

**Clé primaire** : `id` (uuid)

**Relation** :
- `client_id` (uuid, UNIQUE) → clients (ON DELETE CASCADE)

**Sécurité** :
- `access_code_hash` (text) - Hash bcrypt du code d'accès

**Informations check-in** :
- `check_in_time` (text, nullable) - Ex: "15:00"
- `check_out_time` (text, nullable) - Ex: "11:00"
- `arrival_instructions` (text, nullable) - Instructions d'arrivée
- `property_address` (text, nullable) - Adresse exacte de la propriété
- `property_coordinates` (jsonb, nullable) - `{ lat: number, lng: number }`

**Accès logement** :
- `wifi_ssid` (text, nullable) - Nom du réseau WiFi
- `wifi_password` (text, nullable) - Mot de passe WiFi
- `parking_info` (text, nullable) - Informations de parking
- `additional_info` (text, nullable) - Informations complémentaires

**Multilingue (6 langues)** :
- `arrival_instructions_en/es/nl/de/it/pt`
- `parking_info_en/es/nl/de/it/pt`
- `additional_info_en/es/nl/de/it/pt`

**Timestamps** :
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

**RLS** : ✅ Activé (mise à jour 2025-10-30 pour visibilité du bouton)

---

### 6. `qr_code_designs`
**Designs de QR codes personnalisés pour impression A4**

**Clé primaire** : `id` (uuid)

**Champs** :
- `client_id` (uuid, NOT NULL) - FK vers `clients` (ON DELETE CASCADE)
- `title` (text, NOT NULL) - Titre principal affiché sur le design
- `subtitle` (text, nullable) - Sous-titre
- `content` (text, nullable) - Texte affiché sous le QR code
- `footer_col1`, `footer_col2`, `footer_col3` (text, nullable) - 3 colonnes du footer (email, téléphone, site web)
- `logo_url` (text, nullable) - URL du logo uploadé (Supabase Storage bucket 'media')
- `theme` (text, NOT NULL, default: 'modern-minimal') - Thème de bordure/design
  - Valeurs possibles : `'modern-minimal'`, `'bold-gradient'`, `'clean-professional'`, `'elegant-frame'`
- `orientation` (text, NOT NULL, default: 'portrait') - Orientation de la page A4
  - Valeurs possibles : `'portrait'`, `'landscape'`
- `qr_color` (text, NOT NULL, default: '#000000') - Couleur du QR code (hex)
- `is_draft` (boolean, NOT NULL, default: true) - true = brouillon, false = version finalisée
- `version` (integer, NOT NULL, default: 1) - Numéro de version (incrémenté à chaque sauvegarde)

**Timestamps** :
- `created_at` (timestamptz, default: NOW())
- `updated_at` (timestamptz, default: NOW()) - Trigger auto-update sur UPDATE

**Index** :
- `idx_qr_code_designs_client_id` sur `client_id` (optimisation des requêtes)
- `idx_qr_code_designs_created_at` sur `created_at DESC` (tri par date)

**Trigger** :
- `update_qr_code_designs_updated_at` : Met à jour `updated_at` automatiquement

**RLS** : ✅ Activé (ownership strict - chaque client ne voit que ses designs)

**Relations** :
- ← clients (FK client_id, ON DELETE CASCADE)

**Cas d'usage** :
- Gestionnaire crée un design de QR code stylisé pour impression A4
- Sauvegarde en brouillon, prévisualise, modifie
- Exporte en PDF via `window.print()`
- Affiche dans cadre à l'entrée de la location de vacances

**Migration** : `create_qr_code_designs_table.sql` (18ème migration)

---

## Migrations (18)

1. **20251014122308_add_rls_policies.sql** - RLS policies complètes pour toutes les tables
2. **20251014122840_add_storage_policies.sql** - Policies Supabase Storage (bucket 'media')
3. **20251016_add_order_fields.sql** - Champs `order` pour drag & drop (tips, categories)
4. **20251017_add_secure_sections.sql** - Table secure_sections avec hash bcrypt
5. **20251018_add_thumbnail_url.sql** - Champ `thumbnail_url` pour optimisation images
6. **20251019000001_add_header_subtitle.sql** - Champ `header_subtitle` pour sous-titre personnalisé
7. **20251019000002_add_background_effect.sql** - Champ `background_effect` (normal/parallax/fixed)
8. **20251019000003_add_ad_iframe_url.sql** - Champ `ad_iframe_url` pour monétisation
9. **20251019000004_add_mobile_background_position.sql** - Champ `mobile_background_position` pour recadrage mobile
10. **20251020000001_update_demo_client_email.sql** - Mise à jour email du client démo
11. **20251020000002_remove_footer_buttons_table.sql** - Suppression de la table footer_buttons (obsolète)
12. **20251020000003_remove_users_table.sql** - Suppression de la table users (remplacée par auth.users)
13. **20251023_add_ratings_and_reviews.sql** - Champs `rating`, `user_ratings_total`, `price_level`, `reviews` pour Google Places
14. **20251024_add_multilingual_fields.sql** - Champs multilingues (6 langues) pour clients, categories, tips, secure_sections
15. **20251027_add_ai_generation_logs.sql** - Table de logs pour génération AI
16. **20251027000002_add_default_background.sql** - Valeur DEFAULT pour `background_image`
17. **20251030_fix_secure_section_visibility.sql** - Fix RLS policy pour afficher le bouton "Infos d'arrivée" aux visiteurs
18. **create_qr_code_designs_table.sql** - Table `qr_code_designs` pour designs QR codes personnalisés A4

---

## RLS Policies

### Clients
- ✅ `INSERT` : Authentifié uniquement
- ✅ `SELECT` : Tous (public)
- ✅ `UPDATE` : Ownership (`user_id = auth.uid()` ou `email = auth.jwt() ->> 'email'`)
- ✅ `DELETE` : Ownership

### Categories
- ✅ `SELECT` : Tous (public)
- ✅ `INSERT` : Authentifié uniquement
- ✅ `UPDATE` : Authentifié uniquement
- ✅ `DELETE` : Authentifié uniquement

### Tips
- ✅ `SELECT` : Tous (public)
- ✅ `INSERT` : Ownership du client
- ✅ `UPDATE` : Ownership du client
- ✅ `DELETE` : Ownership du client

### Tip Media
- ✅ `SELECT` : Tous (public)
- ✅ `INSERT` : Ownership du tip (via client)
- ✅ `UPDATE` : Ownership du tip
- ✅ `DELETE` : Ownership du tip

### Secure Sections
- ✅ `SELECT` : **Tous** (pour vérifier l'existence, mais données sensibles protégées par code)
- ✅ `INSERT` : Ownership du client
- ✅ `UPDATE` : Ownership du client
- ✅ `DELETE` : Ownership du client

**Note importante (2025-10-30)** : La policy `SELECT` sur `secure_sections` autorise tous les utilisateurs (anonymes + authentifiés) à vérifier l'existence d'une section sécurisée. Les données sensibles (WiFi, adresse, etc.) sont protégées au niveau applicatif par la vérification du code d'accès.

### QR Code Designs
- ✅ `SELECT` : Ownership strict (client voit uniquement ses designs)
  - `client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')`
- ✅ `INSERT` : Ownership strict (création uniquement pour son client)
  - `client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')`
- ✅ `UPDATE` : Ownership strict (modification uniquement ses designs)
  - `client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')`
- ✅ `DELETE` : Ownership strict (suppression uniquement ses designs)
  - `client_id IN (SELECT id FROM clients WHERE email = auth.jwt() ->> 'email')`

**Pattern** : Tous les CRUD sont limités au propriétaire via vérification email JWT. Pas d'accès public (table privée pour gestionnaires uniquement).

---

## Storage Policies (bucket 'media')

### Upload
- ✅ Authentifié uniquement
- ✅ Limite de taille : 10MB par fichier
- ✅ Types autorisés : images (jpg, jpeg, png, gif, webp) et vidéos (mp4, webm)

### Select (téléchargement)
- ✅ Tous (public)

### Delete
- ✅ Ownership (via `slug/` dans le path)

---

## Gestion Automatique du Storage

**Principe fondamental** : La base de données Supabase ne doit contenir QUE les fichiers réellement utilisés par les welcomeapps. Aucun fichier orphelin ne doit rester dans le storage.

### Nettoyage automatique implémenté

1. **Suppression d'un tip** (`DeleteConfirmDialog`) :
   - Récupère tous les médias associés (url + thumbnail_url)
   - Supprime les fichiers originaux ET les thumbnails du storage
   - Supprime le tip de la DB (cascade automatique vers tip_media)

2. **Modification d'un tip - Suppression d'un média** (`EditTipModal`) :
   - Récupère le média complet depuis la DB (pour avoir le thumbnail_url)
   - Supprime l'image originale ET le thumbnail du storage
   - Supprime l'entrée tip_media de la DB

3. **Changement de background** (`CustomizationMenu`) :
   - Détecte si une nouvelle image est uploadée
   - Supprime l'ancien background du storage AVANT d'uploader le nouveau
   - Met à jour la DB avec la nouvelle URL

4. **Suppression/Reset de compte** (`lib/actions/reset.ts`) :
   - Liste tous les fichiers dans le dossier du client (slug/)
   - Supprime tous les fichiers en une seule opération
   - Supprime le client de la DB (cascade automatique vers tips, tip_media, etc.)

### Fonction helper pour le nettoyage

```typescript
// lib/actions/reset.ts
async function deleteClientStorageFiles(supabase: any, clientId: string, slug: string) {
  const { data: files } = await supabase.storage.from('media').list(slug, { limit: 1000 })
  if (files && files.length > 0) {
    const filePaths = files.map((file: any) => `${slug}/${file.name}`)
    await supabase.storage.from('media').remove(filePaths)
  }
}
```

### Logs de débogage

- `[DELETE TIP]` : Suppression d'un tip et ses médias
- `[DELETE MEDIA]` : Suppression d'un média individuel
- `[BACKGROUND]` : Changement de background
- `[STORAGE]` : Opérations de nettoyage du storage

**Important** : Toujours récupérer le `thumbnail_url` en plus de `url` lors des suppressions, car les thumbnails sont des fichiers séparés dans le storage.

---

## Commandes Utiles

### Regénérer les types TypeScript depuis la DB

```bash
supabase gen types typescript --project-id nimbzitahumdefggtiob > types/database.types.ts
```

### Créer une nouvelle migration

```bash
# Créer le fichier
touch supabase/migrations/YYYYMMDD_description.sql

# Exemple
touch supabase/migrations/20251101_add_new_field.sql
```

### Appliquer les migrations en local

```bash
supabase db push
```

### Lister les triggers PostgreSQL actifs

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR trigger_schema = 'auth';
```

---

## ⚠️ Règles Importantes

1. **TOUJOURS utiliser `.maybeSingle()` au lieu de `.single()`** (évite erreurs si aucun résultat)
2. **Créer une migration SQL pour TOUT changement de DB**
3. **Regénérer `types/database.types.ts`** après changement DB
4. **Vérifier les triggers PostgreSQL** lors de debugging mystérieux
5. **Ne JAMAIS supprimer manuellement uniquement dans `auth.users`** (créer trigger ou script)
6. **Tester en navigation privée** pour vérifier RLS policies
