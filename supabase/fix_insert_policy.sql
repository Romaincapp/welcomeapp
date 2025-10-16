-- ============================================
-- FIX - Permettre l'insertion dans clients
-- ============================================

-- Le problème : Les utilisateurs authentifiés ne peuvent pas INSERT dans clients
-- La solution : Ajouter une policy pour l'insertion

-- 1. Supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "Users can insert their own client" ON clients;

-- 2. Créer une policy pour permettre l'insertion
CREATE POLICY "Users can insert their own client"
ON clients FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Message de confirmation
SELECT '✅ Policy d''insertion ajoutée avec succès!' as message;

-- 4. Vérifier les policies actuelles sur clients
SELECT
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY cmd, policyname;
