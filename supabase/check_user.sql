-- ============================================
-- DIAGNOSTIC - Vérifier l'utilisateur actuel
-- ============================================

-- 1. Voir l'utilisateur connecté actuellement (dans le SQL Editor)
SELECT
  'CURRENT USER' as type,
  auth.uid() as user_id,
  auth.email() as email;

-- 2. Lister TOUS les utilisateurs dans auth.users
SELECT
  'ALL USERS' as type,
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Vérifier les clients existants
SELECT
  'EXISTING CLIENTS' as type,
  c.id,
  c.name,
  c.slug,
  c.user_id,
  u.email as owner_email
FROM clients c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 10;
