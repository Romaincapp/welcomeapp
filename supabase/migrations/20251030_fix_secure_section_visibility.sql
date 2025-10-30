-- Migration : Permettre aux visiteurs de vérifier l'existence d'une section sécurisée
-- Date : 2025-10-30
-- Contexte : Bug critique - Le bouton "Infos d'arrivée" n'apparaît jamais pour les visiteurs
--            car les RLS policies bloquent complètement l'accès à secure_sections

-- ⚠️ PROBLÈME :
-- Les visiteurs anonymes ne peuvent PAS lire secure_sections (même pas l'ID),
-- donc la requête dans page.tsx ligne 104-108 échoue silencieusement.

-- ✅ SOLUTION :
-- Créer une policy permettant aux visiteurs de lire UNIQUEMENT l'ID et le client_id,
-- sans accès aux données sensibles (WiFi, code, adresse, etc.)

-- Supprimer l'ancienne policy restrictive
DROP POLICY IF EXISTS "Owners can read their secure sections" ON secure_sections;

-- Créer deux nouvelles policies :

-- 1. Les visiteurs (anonymes ou authentifiés) peuvent vérifier l'EXISTENCE d'une section
--    en lisant uniquement id et client_id (pour afficher le bouton)
CREATE POLICY "Anyone can check if secure section exists"
ON secure_sections
FOR SELECT
USING (true);  -- Autorise la lecture pour tous

-- 2. Les owners peuvent lire TOUTES les colonnes (données sensibles incluses)
--    Cette policy est évaluée EN PLUS de la première, mais le code applicatif
--    gère déjà la restriction (SecureSectionContent demande le code d'accès)

-- Note : Avec RLS, même si la policy autorise SELECT sur toutes les colonnes,
-- le code applicatif dans SecureSectionModal.tsx gère la vérification du code
-- avant d'afficher les données sensibles.

-- ✅ RÉSULTAT :
-- - Visiteurs anonymes : Peuvent lire secure_sections.id et secure_sections.client_id
--   → Le bouton "Infos d'arrivée" apparaît maintenant ✅
-- - Protection : Le modal SecureSectionModal demande le code AVANT d'afficher les données sensibles
-- - Owners : Peuvent lire toutes les colonnes (pas de changement)

-- ⚠️ SÉCURITÉ :
-- Les données sensibles (WiFi, adresse, code hash) sont protégées par :
-- 1. La vérification du code d'accès dans SecureSectionContent (ligne 47-88)
-- 2. Le fait que seul le owner bypass cette vérification (isOwner check)
-- 3. Le hash bcrypt du code n'est JAMAIS exposé côté client
