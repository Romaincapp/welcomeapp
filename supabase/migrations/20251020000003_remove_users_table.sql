-- Migration: Supprimer la table users (obsolète et vide)
-- Date: 2025-10-20
-- Raison: La table users était un vestige de l'ancienne architecture.
--         L'authentification se fait maintenant directement via Supabase Auth
--         et la liaison avec les clients se fait par email (clients.email = auth.email())

-- Vérifier si la table existe et la supprimer
DROP TABLE IF EXISTS public.users CASCADE;

-- Note: Cette table n'est PAS la table auth.users de Supabase Auth
-- (qui elle est gérée automatiquement par Supabase et ne doit JAMAIS être supprimée)
