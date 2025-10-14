-- Script de diagnostic et réparation de l'authentification Supabase

-- 1. Vérifier que le schéma auth existe
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'auth';

-- 2. Vérifier que la table users existe dans auth
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'auth'
AND table_name = 'users';

-- 3. Vérifier les permissions sur auth.users
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'auth'
AND table_name = 'users';

-- 4. Si vous voyez les résultats ci-dessus, l'auth est correctement configuré
-- Essayez de créer un utilisateur avec cette requête :

-- ATTENTION : Cette requête ne fonctionnera probablement PAS car auth.users
-- est géré par Supabase Auth et ne peut pas être modifié directement.
-- C'est normal et c'est pour ça qu'on doit passer par l'interface ou l'API.

-- 5. Vérifier la configuration des extensions
SELECT * FROM pg_extension WHERE extname IN ('pgcrypto', 'pgjwt');

-- Ces extensions doivent être présentes pour que l'auth fonctionne
