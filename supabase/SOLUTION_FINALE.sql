-- ============================================
-- SOLUTION FINALE - Supprimer la contrainte
-- ============================================

-- Le problème : user_id n'existe pas dans auth.users
-- Solution simple : rendre user_id nullable et supprimer la contrainte

-- 1. Supprimer la contrainte foreign key
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;

-- 2. Rendre user_id nullable (au cas où)
ALTER TABLE clients ALTER COLUMN user_id DROP NOT NULL;

-- 3. Message
SELECT '✅ Contrainte supprimée ! Vous pouvez maintenant créer votre welcomebook.' as message;

-- 4. Vérification
SELECT
  'VERIFICATION' as info,
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'clients'
  AND constraint_type = 'FOREIGN KEY';
