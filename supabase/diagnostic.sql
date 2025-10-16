-- ============================================
-- DIAGNOSTIC SIMPLE
-- ============================================
-- Exécutez ce script pour diagnostiquer les problèmes

-- 1. Vérifier que le trigger existe
SELECT
  'TRIGGER' as type,
  tgname as name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 2. Vérifier que la fonction existe
SELECT
  'FUNCTION' as type,
  proname as name
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Vérifier les colonnes de la table clients
SELECT
  'COLUMN' as type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('user_id', 'subdomain', 'slug', 'name', 'email');

-- 4. Vérifier les policies sur clients
SELECT
  'POLICY' as type,
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'clients';

-- 5. Vérifier si RLS est activé
SELECT
  'RLS' as type,
  schemaname,
  tablename,
  rowsecurity as enabled
FROM pg_tables
WHERE tablename = 'clients';
