# welcomeapp
1 plateforme centrale pour dev les welcomeapp des gestionnaires de locations de vacances
2 chaque gestionnaire édite son welcomeapp en se logeant les boutons d'édition se dévoilent dans le menu et également sur les cards conseils
supa base id : nimbzitahumdefggtiob

récap de la conversation avec mistral pour le cahier des charges :
📌 Cahier des Charges Simplifié : WelcomeApp
Objectif :
Créer une plateforme unique (welcomeapp.be) qui permet à chaque gestionnaire de location d'avoir son propre welcomeapp personnalisé, accessible via une URL du type :
**welcomeapp.be/slug** (exemple : welcomeapp.be/demo)

**Format d'URL retenu** : `welcomeapp.be/[slug]` uniquement (pas de sous-domaine)
- Plus simple à déployer et configurer
- Pas de configuration DNS wildcard nécessaire
- Meilleur pour le SEO

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
ÉlémentTechnologie/OutilsFrontendNext.js 14 (App Router), Tailwind CSS, Lucide React (icônes).BackendSupabase (PostgreSQL, Auth, Storage).CarteLeaflet (react-leaflet) ou Google Maps.Markdownreact-markdown pour le contenu riche.QR Codereact-qr-code.DéploiementVercel (frontend), Supabase (backend).URLs dynamiqueswelcomeapp.be/[nomdelalocation] (ou sous-domaine).

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

Accède à welcomeapp.be/nomdelalocation.
Consulte les conseils par catégorie.
Clique sur une card ou un marqueur pour voir les détails.
Utilise les boutons du footer pour contacter le gestionnaire.

Gestionnaire :

Se connecte à son welcomeapp via welcomeapp.be/nomdelalocation (avec son compte).
Active le mode édition (menu ☰).
Personnalise le design et ajoute/modifie des conseils.
Partage le lien/QR code avec ses voyageurs.


📅 Plan de Développement (Exemple)


Setup initial :

Créer le projet Next.js + Supabase.
Configurer l’authentification (Supabase Auth).
Créer les tables dans Supabase.



Pages publiques :

Développer la page welcomeapp.be/[nomdelalocation].
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

Voici un prompt clé en main pour Claude dans VS Code, conçu pour générer tout le code nécessaire à ton application WelcomeApp, en intégrant toutes les fonctionnalités que tu as décrites (mode édition, personnalisation, footer avec boutons émojis, etc.).

📝 Prompt pour Claude (à copier-coller dans VS Code)
 CopierContexte :
Je développe une application Next.js 14 + Supabase pour des "welcomeapps" personnalisés, accessibles via des URLs dynamiques comme `welcomeapp.be/[nomdelalocation]`.
Chaque welcomeapp a :
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

Page principale du welcomeapp.
Récupère les données du client et ses conseils via Supabase.
Affiche le header, les catégories de conseils, la carte interactive, et le footer.
Mode édition : Si le gestionnaire est connecté, affiche les boutons d'édition et le menu ☰.



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

Génère un lien et un QR code pour partager le welcomeapp (utiliser react-qr-code).



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
Gérer l'authentification avec Supabase Auth (seul le gestionnaire peut éditer son welcomeapp).

## 🔒 TypeScript Strict - Règles de Sécurité des Types

**Configuration actuelle :**
- ✅ `"strict": true` dans tsconfig.json
- ✅ **Nettoyage effectué** (2025-10-18) : Réduction de 29 → 27 occurrences de `as any`
- ✅ **Build passe sans erreurs** (npm run build réussit)
- ⚠️ Les `as any` restants sont nécessaires à cause des limitations du système de types de Supabase

**RÈGLES IMPÉRATIVES pour éviter les erreurs :**

1. **⚠️ UTILISATION MINIMALE DE `as any`**
   - Ne JAMAIS utiliser `as any` sauf pour contourner les bugs de typage Supabase
   - Si un type est inconnu, utiliser `unknown` et faire un type guard
   - **Pattern approuvé pour Supabase** : Créer une variable typée explicitement, puis utiliser `as any` uniquement sur `.from()`
   - Si Supabase retourne `any`, créer un type propre dans `types/index.ts`

2. **✅ UTILISER les types de `database.types.ts`**
   - Pour les queries Supabase, toujours utiliser `Database['public']['Tables']['nom_table']['Row']`

**Pattern approuvé pour Supabase (2025-10-18) :**

```typescript
// ✅ BON - Types explicites + as any uniquement sur .from()
import { ClientUpdate } from '@/types'

const updateData: ClientUpdate = {
  background_image: imageUrl
}
const { error } = await (supabase
  .from('clients') as any)
  .update(updateData)
  .eq('id', client.id)

// ❌ MAUVAIS - as any sur les données
const { error } = await supabase
  .from('clients')
  .update({ background_image: imageUrl } as any)
  .eq('id', client.id)
```

**Fichiers utilisant ce pattern (28 `as any` total - 2025-10-25) :**
- [components/AddTipModal.tsx](components/AddTipModal.tsx) - 4 occurrences (insert categories, tips, tip_media)
- [components/EditTipModal.tsx](components/EditTipModal.tsx) - 5 occurrences (insert categories, update tips, insert tip_media, select tip_media pour suppression)
- [components/CustomizationMenu.tsx](components/CustomizationMenu.tsx) - 3 occurrences (update clients)
- [lib/actions/reorder.ts](lib/actions/reorder.ts) - 3 occurrences (update tips, categories)
- [lib/actions/secure-section.ts](lib/actions/secure-section.ts) - 10 occurrences (select/insert/update/delete secure_sections et clients)
- [lib/create-welcomebook.ts](lib/create-welcomebook.ts) - 2 occurrences (select/insert clients)
- [components/SecureSectionContent.tsx](components/SecureSectionContent.tsx) - 1 occurrence (fix Leaflet - non Supabase)

**Pourquoi `as any` est nécessaire :**
Le client Supabase (browser et serveur) a un bug connu où les types génériques `Database` ne sont pas propagés correctement à travers `.from()`. Le type inféré devient `never`, empêchant toute opération. Cette limitation est documentée dans les issues GitHub de Supabase.

---

## 🛡️ Bonnes Pratiques TypeScript - Éviter les Bugs

### 1. **INTERDICTION STRICTE DE `as any`**

❌ **INTERDIT** (sauf workaround Supabase) :
```typescript
const data = result as any  // ❌ JAMAIS
const user: any = getUser()  // ❌ JAMAIS
function process(data: any) { }  // ❌ JAMAIS
```

✅ **AUTORISÉ** (uniquement pour Supabase) :
```typescript
const { data } = await (supabase.from('clients') as any).select('*')
```

**Sanction si règle non respectée :** Le code sera rejeté et devra être réécrit.

---

### 2. **Typage Explicite Obligatoire**

❌ **MAUVAIS** - Inférence implicite dangereuse :
```typescript
const user = getUser()  // Type inconnu
const items = data.map(x => x.value)  // any[]
function handleClick(e) { }  // any
```

✅ **BON** - Types explicites :
```typescript
const user: User | null = getUser()
const items: string[] = data.map((x: Item) => x.value)
function handleClick(e: React.MouseEvent<HTMLButtonElement>) { }
```

---

### 3. **Utiliser `unknown` pour les Données Inconnues**

❌ **MAUVAIS** :
```typescript
const response = await fetch('/api/data')
const data = await response.json() as any
console.log(data.user.name)  // Runtime error possible
```

✅ **BON** - Validation avec type guard :
```typescript
const response = await fetch('/api/data')
const data: unknown = await response.json()

if (isUserData(data)) {
  console.log(data.user.name)  // Type-safe ✅
}

function isUserData(data: unknown): data is { user: { name: string } } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as any).user === 'object' &&
    'name' in (data as any).user
  )
}
```

---

### 4. **Non-Null Assertions (`!`) à Éviter**

❌ **MAUVAIS** - Force et peut crasher :
```typescript
const user = users.find(u => u.id === id)!
console.log(user.name)  // Crash si undefined
```

✅ **BON** - Vérification explicite :
```typescript
const user = users.find(u => u.id === id)
if (!user) {
  throw new Error('User not found')
}
console.log(user.name)  // Type-safe ✅
```

---

### 5. **Optional Chaining et Nullish Coalescing**

❌ **MAUVAIS** :
```typescript
const name = user && user.profile && user.profile.name || 'Unknown'
```

✅ **BON** :
```typescript
const name = user?.profile?.name ?? 'Unknown'
```

---

### 6. **Types pour les Props React**

❌ **MAUVAIS** :
```typescript
function Button({ onClick, label }) {  // Props implicites
  return <button onClick={onClick}>{label}</button>
}
```

✅ **BON** :
```typescript
interface ButtonProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

function Button({ onClick, label, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}
```

---

### 7. **Validation des Données Externes**

Toujours valider les données venant de :
- Formulaires utilisateur
- APIs externes
- LocalStorage / Cookies
- URL params

✅ **BON** - Exemple avec Zod (ou type guard manuel) :
```typescript
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1)
})

function handleFormSubmit(formData: unknown) {
  const result = UserSchema.safeParse(formData)

  if (!result.success) {
    console.error('Invalid data:', result.error)
    return
  }

  const user = result.data  // Type-safe ✅
  saveUser(user)
}
```

---

### 8. **Éviter les `@ts-ignore` et `@ts-expect-error`**

❌ **INTERDIT** :
```typescript
// @ts-ignore
const value = data.unknownField
```

✅ **BON** - Corriger le type ou créer un type guard :
```typescript
if ('unknownField' in data && typeof data.unknownField === 'string') {
  const value = data.unknownField
}
```

---

### 9. **Typage des Erreurs**

❌ **MAUVAIS** :
```typescript
try {
  await fetchData()
} catch (error) {
  console.log(error.message)  // error est `unknown`
}
```

✅ **BON** :
```typescript
try {
  await fetchData()
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.log('Unknown error:', error)
  }
}
```

---

### 10. **Créer des Types Réutilisables**

✅ **BON** - Centraliser dans `types/index.ts` :
```typescript
// types/index.ts
export interface User {
  id: string
  email: string
  name: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

---

## 🚨 Checklist TypeScript Avant Chaque Commit

- [ ] `npm run build` passe sans erreur
- [ ] Aucun `as any` ajouté (sauf workaround Supabase)
- [ ] Toutes les fonctions ont des types de retour explicites
- [ ] Les props React sont typées avec des interfaces
- [ ] Les données externes sont validées
- [ ] Pas de `@ts-ignore` ou `@ts-expect-error`
- [ ] Types réutilisables créés dans `types/index.ts` si nécessaire
- [ ] `types/database.types.ts` synchronisé avec la DB

---

   - Créer des types helpers dans `types/index.ts` si besoin
   ```typescript
   // BON ✅
   import { Database } from '@/types/database.types'
   type Client = Database['public']['Tables']['clients']['Row']

   const { data } = await supabase.from('clients').select('*').single()
   if (data) {
     const client: Client = data
   }

   // MAUVAIS ❌
   const client = data as any
   ```

3. **✅ CRÉER des Type Guards pour valider les données**
   ```typescript
   // Exemple pour valider des données inconnues
   function isValidClient(data: unknown): data is Client {
     return (
       typeof data === 'object' &&
       data !== null &&
       'id' in data &&
       'slug' in data &&
       typeof data.slug === 'string'
     )
   }

   // Utilisation
   if (isValidClient(data)) {
     // TypeScript sait maintenant que data est un Client
     console.log(data.slug)
   }
   ```

4. **✅ METTRE À JOUR `database.types.ts` IMMÉDIATEMENT**
   - Dès qu'une table ou un champ change dans la DB
   - Avant de coder les fonctionnalités qui utilisent ces données
   - Lancer `npm run build` pour vérifier les erreurs TypeScript
   - Utiliser `supabase gen types typescript` pour regénérer les types depuis la DB réelle

5. **❌ NE JAMAIS ignorer les erreurs TypeScript**
   - Si TypeScript se plaint, c'est qu'il y a un vrai problème
   - Corriger le type plutôt que de forcer avec `@ts-ignore` ou `as any`
   - Si vraiment bloqué, demander de l'aide avant d'utiliser `as any`

**Pourquoi c'est crucial :**
- ✅ Évite les bugs en production (`undefined is not a function`, `cannot read property of undefined`, etc.)
- ✅ Permet de détecter les incohérences entre la DB et le code AVANT le runtime
- ✅ Facilite la maintenance et le refactoring
- ✅ Auto-complétion correcte dans l'éditeur (IntelliSense)
- ✅ Détecte les champs manquants ou mal typés

## 📁 Gestion des Fichiers - Consignes Importantes

**Fichiers SQL :**
- ✅ GARDER : `supabase/schema.sql` (schéma principal) et `supabase/migrations/*.sql` (historique des migrations)
- ❌ SUPPRIMER : Tous les fichiers SQL temporaires générés pour le debug/fix (ex: `fix-*.sql`, `diagnostic.sql`, `SOLUTION_FINALE.sql`, etc.)
- 💡 Règle : Après avoir exécuté un fichier SQL de debug, le supprimer immédiatement. Ne garder QUE le schéma et les migrations officielles.

**Fichiers Markdown (.md) :**
- ✅ GARDER : `README.md` (racine) et `CLAUDE.md` (ce fichier - instructions pour Claude)
- ❌ NE PAS CRÉER : Pas de documentation supplémentaire, tout documenter dans `CLAUDE.md`
- 💡 Règle : Si une information doit être documentée, l'ajouter dans ce fichier plutôt que de créer de nouveaux .md

**Principe général :**
Ne garder qu'une seule version à jour de chaque type de fichier, supprimer les versions obsolètes au fur et à mesure.

## 🔄 Workflow - IMPÉRATIF avant et après chaque modification

**AVANT chaque modification :**
1. 📖 **TOUJOURS LIRE** `README.md` pour connaître l'état actuel du projet et les fonctionnalités existantes
2. 🗄️ **TOUJOURS CONSULTER** `supabase/schema.sql` pour vérifier la structure de la base de données
3. 📋 **TOUJOURS VÉRIFIER** `supabase/migrations/*.sql` pour connaître l'historique des changements de DB
4. 🔍 **TOUJOURS VÉRIFIER** `types/database.types.ts` pour connaître les types disponibles

**PENDANT chaque modification :**
1. 🚫 **INTERDICTION D'UTILISER `as any`** sauf pour contourner le bug Supabase (voir section TypeScript Strict)
2. ✅ **TOUJOURS TYPER** les variables, paramètres et retours de fonction explicitement
3. ⚠️ **UTILISER `unknown`** pour les types inconnus, puis créer un type guard
4. 🔒 **VALIDER** les données externes (API, formulaires) avec des type guards
5. 📦 **CRÉER** des types dans `types/index.ts` si nécessaire
6. 🧪 **TESTER** avec `npm run build` régulièrement pour détecter les erreurs TypeScript

**APRÈS chaque modification :**
1. 📝 **METTRE À JOUR** `README.md` avec les nouvelles fonctionnalités, changements ou instructions
2. 🗄️ **METTRE À JOUR** `supabase/schema.sql` si la structure de la base de données a changé
3. 🔄 **REGÉNÉRER** `types/database.types.ts` si la DB a changé (`supabase gen types typescript`)
4. ➕ **CRÉER UNE MIGRATION** dans `supabase/migrations/` si des changements DB ont été faits (format: `YYYYMMDD_description.sql`)
5. ✅ **VÉRIFIER LE BUILD** : `npm run build` doit passer SANS ERREUR TypeScript
6. 🧹 **NETTOYER** les fichiers temporaires créés pendant le dev
7. 🔎 **VÉRIFIER** qu'aucun nouveau `as any` n'a été ajouté (sauf Supabase workaround)

**Pourquoi c'est crucial :**
- Évite les incohérences entre le code et la documentation
- Permet de toujours avoir une vision à jour du projet
- Facilite la reprise du travail lors des prochaines sessions
- Garde un historique propre et cohérent des changements de base de données
- **Empêche les bugs TypeScript en production** grâce à la vérification stricte

## 🌍 Système Multilingue (Implémenté : 2025-10-24)

**Infrastructure i18n :**
- ✅ **next-intl** configuré avec support de 7 langues : FR, EN, ES, NL, DE, IT, PT
- ✅ **Middleware i18n** : Détection automatique de la langue, routing `/[locale]/[slug]`
- ✅ **Messages de traduction** : 7 fichiers JSON dans `messages/` avec toutes les clés UI
- ✅ **Helper functions** : `lib/i18n-helpers.ts` pour gérer les traductions de contenu DB
- ✅ **LanguageSelector** : Composant avec drapeaux et labels pour changer de langue

**Structure de la base de données multilingue :**
- ✅ **clients** : Ajout de `name_en`, `name_es`, `name_nl`, `name_de`, `name_it`, `name_pt`, `header_subtitle_en`, etc.
- ✅ **categories** : Ajout de `name_en`, `name_es`, `name_nl`, `name_de`, `name_it`, `name_pt`
- ✅ **tips** : Ajout de `title_en`, `title_es`, `comment_en`, `comment_es`, etc. (6 langues × 2 champs)
- ✅ **secure_sections** : Ajout de `arrival_instructions_en`, `parking_info_en`, `additional_info_en`, etc.

**Migration SQL :**
- ✅ Migration créée : `supabase/migrations/20251024_add_multilingual_fields.sql`
- ✅ Traductions de base pour les catégories (Restaurants, Activités, etc.) en 7 langues
- ⚠️ **À faire** : Appliquer la migration manuellement via le dashboard Supabase (SQL Editor)

**Helpers TypeScript :**
```typescript
// Récupérer un champ traduit avec fallback sur français
getTranslatedField(tip, 'title', 'en') // Retourne title_en ou title si vide

// Vérifier si une traduction existe
hasTranslation(tip, 'comment', 'es') // true si comment_es existe et n'est pas vide

// Calculer le pourcentage de traduction
getTranslationCompleteness(tip, ['title', 'comment'], 'de') // 50% si 1/2 traduit
```

**Composant LanguageSelector :**
```tsx
<LanguageSelector
  currentLocale="fr"
  onLocaleChange={(locale) => router.push(`/${locale}/${slug}`)}
/>
```

**✅ Implémentation terminée (2025-10-24) :**
1. ✅ `LanguageSelector` intégré dans le Header
2. ✅ `getTranslatedField()` utilisé dans TipCard, TipModal, DraggableCategorySection
3. ✅ Détection automatique de la locale depuis l'URL dans WelcomeBookClient
4. ✅ Propagation de la prop `locale` à tous les composants
5. ✅ Build réussi sans erreurs TypeScript

**Fonctionnement actuel :**
- L'URL `welcomeapp.be/demo` affiche en français (défaut)
- L'URL `welcomeapp.be/en/demo` affiche en anglais
- L'URL `welcomeapp.be/es/demo` affiche en espagnol (etc.)
- Le sélecteur de langue dans le header permet de changer de langue
- Si une traduction n'existe pas, le texte français s'affiche (fallback)

**⚠️ À implémenter (prochaines étapes) :**
1. Ajouter des champs de traduction dans AddTipModal et EditTipModal (tabs pour chaque langue)
2. Créer un bandeau de suggestion pour la traduction navigateur
3. Implémenter le routing Next.js `app/[locale]/[slug]/page.tsx` (optionnel - fonctionne déjà via middleware)
4. Ajouter des indicateurs visuels de complétude de traduction dans le dashboard

## 🗑️ Gestion Automatique du Storage (Implémenté : 2025-10-25)

**Principe fondamental :** La base de données Supabase ne doit contenir QUE les fichiers réellement utilisés par les welcomeapps. Aucun fichier orphelin ne doit rester dans le storage.

**Nettoyage automatique implémenté :**

1. **Suppression d'un tip (DeleteConfirmDialog)** :
   - Récupère tous les médias associés (url + thumbnail_url)
   - Supprime les fichiers originaux ET les thumbnails du storage
   - Supprime le tip de la DB (cascade automatique vers tip_media)

2. **Modification d'un tip - Suppression d'un média (EditTipModal)** :
   - Récupère le média complet depuis la DB (pour avoir le thumbnail_url)
   - Supprime l'image originale ET le thumbnail du storage
   - Supprime l'entrée tip_media de la DB

3. **Changement de background (CustomizationMenu)** :
   - Détecte si une nouvelle image est uploadée
   - Supprime l'ancien background du storage AVANT d'uploader le nouveau
   - Met à jour la DB avec la nouvelle URL

4. **Suppression/Reset de compte (lib/actions/reset.ts)** :
   - Liste tous les fichiers dans le dossier du client (slug/)
   - Supprime tous les fichiers en une seule opération
   - Supprime le client de la DB (cascade automatique vers tips, tip_media, etc.)

**Fonction helper pour le nettoyage :**
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

**Logs de débogage :**
- `[DELETE TIP]` : Suppression d'un tip et ses médias
- `[DELETE MEDIA]` : Suppression d'un média individuel
- `[BACKGROUND]` : Changement de background
- `[STORAGE]` : Opérations de nettoyage du storage

**Important :** Toujours récupérer le `thumbnail_url` en plus de `url` lors des suppressions, car les thumbnails sont des fichiers séparés dans le storage.

---

## 🐛 Bugs Critiques Corrigés (2025-10-25)

### Bug #1 : Slug basé sur l'email au lieu du nom du logement

**Symptôme** : Lors de la création d'un compte avec le nom "Demo" et l'email "test@example.com", le slug généré était "test" au lieu de "demo".

**Cause racine** : La fonction `createWelcomebookServerAction` utilisait `.single()` au lieu de `.maybeSingle()` pour vérifier l'existence d'un compte. `.single()` lance une **erreur** quand aucun résultat n'est trouvé, ce qui faisait planter la vérification et donnait l'impression qu'un compte existait déjà, même pour un email jamais utilisé.

**Fichiers impactés** :
- `lib/actions/create-welcomebook.ts`
- `lib/create-welcomebook.ts` (fichier obsolète supprimé)

**Solution appliquée** :
```typescript
// AVANT (BUGGÉ)
const { data: existing } = await supabase
  .from('clients')
  .select('id, slug, name')
  .eq('email', email)
  .single() // ❌ Lance une erreur si aucun résultat

if (existing) {
  throw new Error('Compte existe déjà')
}

// APRÈS (CORRIGÉ)
const { data: existingClient, error: existingError } = await (supabase
  .from('clients') as any)
  .select('id, slug, name')
  .eq('email', email)
  .maybeSingle() // ✅ Retourne null si aucun résultat

if (existingClient) {
  throw new Error(`Un compte existe déjà avec cet email (${existingClient.slug})`)
}
```

**Actions supplémentaires** :
- Suppression du fichier obsolète `lib/create-welcomebook.ts` qui contenait l'ancienne logique
- Ajout de logs détaillés `[CREATE WELCOMEBOOK]` et `[SIGNUP]` pour débugger
- Ajout de validation pour s'assurer que `propertyName` n'est jamais vide
- Message d'erreur plus explicite indiquant le slug existant

**Test de régression** :
1. S'inscrire avec un email jamais utilisé + nom "Demo"
2. Vérifier que le slug généré est bien "demo" dans dashboard/welcome
3. Tenter de se réinscrire avec le même email → doit afficher l'erreur avec le slug existant

---

## ✅ État Actuel du Projet (dernière vérification : 2025-10-25)

**Base de données complètement synchronisée :**
- ✅ `supabase/schema.sql` : À jour avec toutes les tables et champs
- ✅ `supabase/migrations/*.sql` : 5 migrations correctement nommées avec dates
- ✅ `types/database.types.ts` : Types TypeScript synchronisés avec la DB
- ✅ Build : Compile sans erreur TypeScript

**Tables :**
1. `clients` - Gestionnaires (avec couleurs personnalisées, images de fond, support multilingue)
2. `categories` - Catégories de conseils (avec champ `order` pour drag & drop, support multilingue)
3. `tips` - Conseils (avec champ `order` pour réorganisation, support multilingue complet)
4. `tip_media` - Photos/vidéos des conseils (avec `thumbnail_url` pour miniatures optimisées)
5. `footer_buttons` - Boutons footer personnalisés
6. `secure_sections` - Informations sensibles protégées par code (support multilingue)

**Migrations appliquées :**
- `20251014122308_add_rls_policies.sql` - RLS policies complètes
- `20251014122840_add_storage_policies.sql` - Policies pour Supabase Storage
- `20251016_add_order_fields.sql` - Champs `order` pour drag & drop
- `20251017_add_secure_sections.sql` - Table secure_sections
- `20251018_add_thumbnail_url.sql` - Champ `thumbnail_url` pour optimisation des images
- `20251024_add_multilingual_fields.sql` - Support multilingue (7 langues)

**Optimisations de performance implémentées :**
- ✅ **Lazy loading** : Images chargées uniquement au scroll (TipCard, BackgroundCarousel)
- ✅ **Quality optimisée** : Compression 60-80% selon contexte (TipCard 60-65%, TipModal 75%, Background 80%)
- ✅ **Sizes responsive** : Attribut `sizes` pour optimiser le téléchargement selon le viewport
- ✅ **Thumbnails** : Support du champ `thumbnail_url` dans TipCard (fallback sur URL complète)
- ✅ **Priority** : Première image de fond et première image de modale chargées en priorité
- ✅ **Preload metadata** : Vidéos avec `preload="metadata"` ou `preload="none"` pour réduire le poids initial

**Note importante :** Si tu modifies la structure de la base de données, tu DOIS mettre à jour `types/database.types.ts` pour éviter les erreurs TypeScript.