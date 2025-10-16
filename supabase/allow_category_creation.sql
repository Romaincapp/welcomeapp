-- ============================================
-- Permettre la création de catégories
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Anyone authenticated can create categories" ON categories;

-- Créer une policy pour permettre aux utilisateurs authentifiés de créer des catégories
CREATE POLICY "Anyone authenticated can create categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Message de confirmation
SELECT '✅ Les gestionnaires peuvent maintenant créer des catégories !' as message;

-- Vérifier les policies
SELECT
  'VERIFICATION' as info,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd, policyname;
