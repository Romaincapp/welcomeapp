-- ============================================
-- FIX COMPLET - Nettoyer et réparer
-- ============================================

-- 1. Voir tous les utilisateurs actuels
SELECT
  'UTILISATEURS ACTUELS' as info,
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Supprimer la contrainte foreign key temporairement
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;

-- 3. Recréer la contrainte sans CASCADE (plus permissif)
ALTER TABLE clients
ADD CONSTRAINT clients_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;  -- Plus permissif

-- 4. Ajouter une policy INSERT simple
DROP POLICY IF EXISTS "Anyone authenticated can insert clients" ON clients;
CREATE POLICY "Anyone authenticated can insert clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (true);  -- Très permissif pour le moment

-- Confirmation
SELECT '✅ Contrainte assouplie et policy ajoutée!' as message;
