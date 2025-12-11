# Édition des catégories en mode édition

Cette documentation décrit la fonctionnalité d'édition des catégories dans le welcomebook en mode édition.

## Vue d'ensemble

En mode édition, les gestionnaires peuvent désormais :
- ✏️ **Éditer le nom d'une catégorie** directement inline
- ➕ **Ajouter de nouvelles catégories** via le menu
- 🗑️ **Supprimer des catégories** avec confirmation
- 🔄 Tous les tips d'une catégorie héritent automatiquement des modifications

## Interface utilisateur

### 1. Édition inline du nom de catégorie

Lorsqu'un gestionnaire survole le nom d'une catégorie en mode édition :
- Deux boutons apparaissent à côté du titre
- **Bouton crayon (✏️)** : Permet d'éditer le nom
- **Bouton corbeille (🗑️)** : Permet de supprimer la catégorie

**Processus d'édition :**
1. Clic sur le bouton crayon
2. Le titre devient un champ de saisie
3. Modification du texte
4. Validation par :
   - Touche `Enter` ou clic sur ✓ (valider)
   - Touche `Escape` ou clic sur ✗ (annuler)

### 2. Ajout de catégories

**Accès :** Menu "+" dans le header → "Ajouter une catégorie"

**Modale d'ajout :**
- Champ de saisie pour le nom
- Support des emojis (ex: 🍴 Restaurants)
- Génération automatique du slug
- Boutons Annuler / Créer

### 3. Suppression de catégories

**Processus :**
1. Clic sur le bouton 🗑️ au survol du titre
2. Confirmation via dialogue
3. Suppression de la catégorie ET de tous ses tips

⚠️ **Attention :** La suppression est irréversible et supprime tous les conseils associés.

## Architecture technique

### Composants créés

#### 1. EditableCategoryTitle.tsx

Composant d'édition inline du titre de catégorie.

**Props :**
```typescript
interface EditableCategoryTitleProps {
  title: string                                    // Nom de la catégorie
  onSave: (newTitle: string) => Promise<void>     // Callback de sauvegarde
  onDelete?: () => void                            // Callback de suppression
  className?: string                               // Classes CSS additionnelles
}
```

**Comportements :**
- Mode lecture : Affiche le titre avec boutons au survol
- Mode édition : Champ de saisie avec boutons validation/annulation
- Auto-focus et sélection du texte à l'entrée en mode édition
- Gestion des touches clavier (Enter, Escape)

**Localisation :** `components/EditableCategoryTitle.tsx`

#### 2. CategoryModal.tsx

Modale pour ajouter ou éditer une catégorie.

**Props :**
```typescript
interface CategoryModalProps {
  isOpen: boolean                  // État d'ouverture
  onClose: () => void             // Callback de fermeture
  onSuccess: () => void           // Callback de succès
  clientId: string                // ID du client
  category?: Category | null      // Catégorie à éditer (null = création)
}
```

**Fonctionnalités :**
- Mode création : Ajoute une nouvelle catégorie
- Mode édition : Modifie une catégorie existante
- Validation du nom (requis, non vide)
- Gestion des erreurs avec affichage

**Localisation :** `components/CategoryModal.tsx`

### Modifications des composants existants

#### DraggableCategorySection.tsx

**Ajouts :**
- Import de `EditableCategoryTitle`
- Props `onCategoryUpdate` et `onCategoryDelete`
- Affichage conditionnel :
  - Mode édition + callback → `EditableCategoryTitle`
  - Sinon → `<h2>` classique
- Handlers `handleCategoryUpdate` et `handleCategoryDelete`

**Lignes modifiées :** 23, 37-38, 54-55, 124-148

#### DraggableCategoriesWrapper.tsx

**Ajouts :**
- Propagation des callbacks `onCategoryUpdate` et `onCategoryDelete`
- Transmission aux composants enfants :
  - `SortableCategoryWrapper`
  - `DraggableCategorySection` (3 instances)

**Lignes modifiées :** 42-43, 58-59, 72-73, 137-138, 192-193, 211-212, 293-294, 327-328, 347-348

#### Header.tsx

**Ajouts :**
- Import de l'icône `FolderPlus`
- Prop `onAddCategory`
- Traduction "Ajouter une catégorie"
- Nouveau bouton dans le menu avec icône 📁

**Lignes modifiées :** 6, 24, 31, 128, 278-290

#### WelcomeBookClient.tsx

**Ajouts :**
- Import de `CategoryModal`
- State `showAddCategoryModal`
- Handler `handleCategoryUpdate` (optimistic update)
- Handler `handleCategoryDelete` (optimistic update avec confirmation)
- Callback `onAddCategory` passé au Header
- Callback `onCategoryUpdate` passé au wrapper
- Callback `onCategoryDelete` passé au wrapper
- Instance de `CategoryModal`

**Lignes modifiées :** 14, 166, 411-466, 593, 736-737, 882-890

### Actions serveur

#### lib/actions/tips.ts

**Corrections de sécurité :**

Les fonctions `updateCategory` et `deleteCategory` ont été sécurisées avec des vérifications d'ownership.

**Avant :**
```typescript
export async function updateCategory(id: string, name?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // ❌ PAS DE VÉRIFICATION D'OWNERSHIP
  const { data: category } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
}
```

**Après :**
```typescript
export async function updateCategory(id: string, name?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // ✅ VÉRIFICATION D'OWNERSHIP via les tips
  const { data: tip } = await supabase
    .from('tips')
    .select('client_id, clients(email)')
    .eq('category_id', id)
    .limit(1)
    .maybeSingle()

  if (!tip || !tip.clients || tip.clients.email !== user.email) {
    throw new Error('Non autorisé')
  }

  const { data: category } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
}
```

**Même correction pour `deleteCategory`**

**Lignes modifiées :** 252-262, 316-326

## Flux de données

### Édition de catégorie

```
User clicks ✏️
    ↓
EditableCategoryTitle → mode édition
    ↓
User modifies & validates
    ↓
onSave(newName) callback
    ↓
DraggableCategorySection.handleCategoryUpdate
    ↓
onCategoryUpdate(categoryId, newName)
    ↓
WelcomeBookClient.handleCategoryUpdate
    ↓
├─ Optimistic update → setCategories()
├─ Server action → updateCategory()
└─ Rollback si erreur
```

### Ajout de catégorie

```
User clicks Menu + → "Ajouter une catégorie"
    ↓
CategoryModal opens
    ↓
User enters name & validates
    ↓
onSuccess callback
    ↓
window.location.reload()
```

### Suppression de catégorie

```
User clicks 🗑️
    ↓
handleCategoryDelete
    ↓
window.confirm() → confirmation
    ↓
├─ If cancelled → return
└─ If confirmed
    ↓
    ├─ Optimistic update → setCategories() + setTips()
    ├─ Server action → deleteCategory()
    └─ Rollback si erreur
```

## Optimistic Updates

Toutes les opérations utilisent des **optimistic updates** pour une UX réactive :

1. **Mise à jour immédiate** de l'état local (instantanée dans l'UI)
2. **Appel serveur** en arrière-plan
3. **Rollback automatique** en cas d'erreur

**Avantages :**
- Interface ultra-réactive
- Pas de latence perceptible
- Fiabilité maintenue (rollback)

## Sécurité

### Vérifications d'ownership

Toutes les opérations vérifient que l'utilisateur est propriétaire :

1. **Vérification côté client** : `isOwnerDynamic`
2. **Vérification côté serveur** : Dans les server actions

**Méthode de vérification serveur :**
```typescript
// Récupération d'un tip de la catégorie avec jointure client
const { data: tip } = await supabase
  .from('tips')
  .select('client_id, clients(email)')
  .eq('category_id', id)
  .limit(1)
  .maybeSingle()

// Vérification de l'email
if (!tip || !tip.clients || tip.clients.email !== user.email) {
  throw new Error('Non autorisé')
}
```

### Protection contre les attaques

- ✅ Impossible de modifier les catégories d'autres utilisateurs
- ✅ Impossible de supprimer les catégories d'autres utilisateurs
- ✅ Vérification double : client + serveur
- ✅ Messages d'erreur génériques (pas de fuite d'info)

## Héritage des modifications

Lorsqu'une catégorie est modifiée, **tous les tips associés héritent automatiquement** des changements :

### Renommage
```typescript
// La catégorie est mise à jour
UPDATE categories SET name = 'Nouveau nom' WHERE id = 'cat-123'

// Tous les tips gardent leur category_id
// Ils afficheront automatiquement le nouveau nom via la jointure
```

### Suppression
```typescript
// Suppression de la catégorie
DELETE FROM categories WHERE id = 'cat-123'

// Les tips associés sont supprimés en cascade (via contrainte DB)
// OU suppression explicite côté client pour optimistic update:
setTips(tips.filter(tip => tip.category_id !== categoryId))
```

## Tests recommandés

### Tests manuels à effectuer

1. **Édition inline**
   - [ ] Survol du titre → boutons apparaissent
   - [ ] Clic crayon → mode édition
   - [ ] Modification du texte
   - [ ] Validation Enter → sauvegarde
   - [ ] Validation ✓ → sauvegarde
   - [ ] Annulation Escape → rollback
   - [ ] Annulation ✗ → rollback
   - [ ] Vérifier que les tips affichent le nouveau nom

2. **Ajout de catégorie**
   - [ ] Menu + → option visible
   - [ ] Clic → modale s'ouvre
   - [ ] Ajout avec emoji → slug correct
   - [ ] Validation → catégorie créée
   - [ ] Annulation → pas de création

3. **Suppression**
   - [ ] Clic 🗑️ → confirmation
   - [ ] Annulation → pas de suppression
   - [ ] Validation → catégorie + tips supprimés
   - [ ] Vérifier optimistic update

4. **Sécurité**
   - [ ] Connexion user A → édition catégorie A → OK
   - [ ] Connexion user B → tentative édition catégorie A → Erreur

### Tests de régression

- [ ] Drag & drop des catégories toujours fonctionnel
- [ ] Drag & drop des tips toujours fonctionnel
- [ ] Mode visiteur non affecté
- [ ] Traductions des catégories fonctionnelles
- [ ] Bouton "Voir tout" toujours fonctionnel

## Limitations connues

1. **Rechargement de page après ajout**
   - Après l'ajout d'une catégorie, la page est rechargée (`window.location.reload()`)
   - Raison : Simplification de la gestion d'état
   - Amélioration future : Optimistic update complet

2. **Confirmation native du navigateur**
   - La suppression utilise `window.confirm()`
   - Raison : Simplicité et rapidité d'implémentation
   - Amélioration future : Modale custom avec design cohérent

3. **Pas de gestion des catégories vides**
   - Une catégorie sans tips peut être supprimée
   - Le check d'ownership échoue si aucun tip
   - Amélioration future : Vérification alternative pour catégories vides

## Évolutions futures possibles

1. **Édition des traductions**
   - Permettre d'éditer les traductions de chaque catégorie
   - Interface multi-langues dans la modale

2. **Réorganisation avancée**
   - Drag & drop entre catégories pour déplacer des tips
   - Fusion de catégories

3. **Catégories par défaut**
   - Templates de catégories prédéfinies
   - Import/Export de catégories

4. **Statistiques**
   - Nombre de tips par catégorie
   - Catégories les plus consultées

5. **Icônes personnalisées**
   - Choisir une icône pour chaque catégorie
   - Alternative aux emojis

## Support et maintenance

**Fichiers à surveiller :**
- `components/EditableCategoryTitle.tsx` - Logique d'édition
- `components/CategoryModal.tsx` - Modale ajout/édition
- `lib/actions/tips.ts` - Server actions (sécurité critique)

**Points d'attention :**
- Toujours maintenir les vérifications d'ownership
- Tester les optimistic updates après modifications
- Vérifier la cohérence des traductions

**Contact :** Pour toute question ou bug, créer une issue dans le repo.
