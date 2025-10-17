# Configuration du Drag & Drop pour Welcomebook

## Fonctionnalité

Cette fonctionnalité permet aux gestionnaires de réorganiser intuitivement :
- **Les tip cards** au sein de chaque catégorie (scroll horizontal)
- **Les catégories entières** (ordre vertical)

## Installation effectuée

Les packages suivants ont été installés :
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

## Composants créés

### 1. DraggableTipCard
Wrapper autour de `TipCard` qui ajoute une poignée de drag (icône grip) en mode édition.

### 2. DraggableCategorySection
Gère le drag & drop horizontal des tip cards au sein d'une catégorie.

### 3. DraggableCategoriesWrapper
Gère le drag & drop vertical des catégories entières.

## Actions serveur

Fichier créé : `lib/actions/reorder.ts`

Fonctions disponibles :
- `reorderTips(categoryId, tipIds)` - Réorganise les tips dans une catégorie
- `reorderCategories(categoryIds)` - Réorganise les catégories
- `moveTipToCategory(tipId, newCategoryId, newOrder)` - Déplace un tip vers une autre catégorie

## Migration de base de données

**IMPORTANT :** Vous devez appliquer la migration suivante à votre base de données Supabase.

### Option 1 : Via le SQL Editor de Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet (nimbzitahumdefggtiob)
3. Allez dans "SQL Editor"
4. Copiez et exécutez le SQL suivant :

\`\`\`sql
-- Add order field to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add order field to tips table
ALTER TABLE tips ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Update existing categories with sequential order
UPDATE categories SET "order" = subquery.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM categories
) AS subquery
WHERE categories.id = subquery.id;

-- Update existing tips with sequential order within each category
UPDATE tips SET "order" = subquery.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) as row_num
  FROM tips
) AS subquery
WHERE tips.id = subquery.id;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_tips_category_order ON tips(category_id, "order");
\`\`\`

### Option 2 : Via la CLI Supabase (si configurée)

\`\`\`bash
npx supabase db push
\`\`\`

## Utilisation

### Pour le gestionnaire :

1. **Se connecter** au welcomebook
2. **Activer le mode édition** (bouton en haut à droite)
3. **Pour réorganiser les tips** :
   - Des poignées bleues (grip) apparaissent à gauche de chaque tip card
   - Cliquer et glisser la poignée pour déplacer la card horizontalement
4. **Pour réorganiser les catégories** :
   - Des poignées violettes apparaissent à gauche du titre de chaque catégorie
   - Cliquer et glisser la poignée pour déplacer toute la section verticalement

### Visuels :

- **Poignée de tip** : Icône grip bleue (indigo) à gauche de chaque card
- **Poignée de catégorie** : Icône grip violette (purple) à gauche du titre
- **État de drag** : L'élément devient semi-transparent pendant le déplacement
- **Sauvegarde automatique** : L'ordre est sauvegardé dès qu'on relâche l'élément

## Comportement

- En **mode normal** (non connecté ou sans mode édition) : Les poignées sont cachées, les cards ne sont pas draggables
- En **mode édition** : Les poignées apparaissent et les éléments deviennent draggables
- **Responsive** : Le drag & drop fonctionne sur mobile et desktop
- **Distance d'activation** : 8px de mouvement sont nécessaires avant de commencer le drag (évite les drags accidentels)

## Notes techniques

- Le state local est mis à jour immédiatement pour une meilleure UX
- Les changements sont ensuite persistés dans la base de données
- La page est rafraîchie après chaque réorganisation pour refléter l'état de la DB
- Les tips sont triés par `order ASC` lors du chargement
- Les catégories sont triées par `order ASC` lors du chargement

## Prochaines améliorations possibles

- Drag & drop entre catégories (déplacer un tip d'une catégorie à une autre)
- Feedback visuel amélioré pendant le drag
- Undo/Redo pour annuler les réorganisations
- Sauvegarde par batch (attendre quelques secondes avant de sauvegarder)
