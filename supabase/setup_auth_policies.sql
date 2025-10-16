-- Configuration de l'authentification et des permissions pour WelcomeBook
-- À exécuter dans le SQL Editor de Supabase

-- ============================================
-- 1. Configuration du Storage Bucket "media"
-- ============================================

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public can read media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update media" ON storage.objects;

-- Lecture publique des médias
CREATE POLICY "Public can read media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Upload pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);

-- Suppression pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can delete media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);

-- Mise à jour pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 2. Permissions pour la table "tips"
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can create tips" ON tips;
DROP POLICY IF EXISTS "Authenticated users can update tips" ON tips;
DROP POLICY IF EXISTS "Authenticated users can delete tips" ON tips;

-- Création de tips
CREATE POLICY "Authenticated users can create tips"
ON tips FOR INSERT
TO authenticated
WITH CHECK (true);

-- Modification de tips
CREATE POLICY "Authenticated users can update tips"
ON tips FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Suppression de tips
CREATE POLICY "Authenticated users can delete tips"
ON tips FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 3. Permissions pour la table "tip_media"
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can create tip_media" ON tip_media;
DROP POLICY IF EXISTS "Authenticated users can update tip_media" ON tip_media;
DROP POLICY IF EXISTS "Authenticated users can delete tip_media" ON tip_media;

-- Création de médias
CREATE POLICY "Authenticated users can create tip_media"
ON tip_media FOR INSERT
TO authenticated
WITH CHECK (true);

-- Modification de médias
CREATE POLICY "Authenticated users can update tip_media"
ON tip_media FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Suppression de médias
CREATE POLICY "Authenticated users can delete tip_media"
ON tip_media FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 4. Permissions pour la table "clients"
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;

-- Modification des clients (pour la personnalisation)
CREATE POLICY "Authenticated users can update clients"
ON clients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. Permissions pour la table "footer_buttons"
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can create footer_buttons" ON footer_buttons;
DROP POLICY IF EXISTS "Authenticated users can update footer_buttons" ON footer_buttons;
DROP POLICY IF EXISTS "Authenticated users can delete footer_buttons" ON footer_buttons;

-- Création de boutons de footer
CREATE POLICY "Authenticated users can create footer_buttons"
ON footer_buttons FOR INSERT
TO authenticated
WITH CHECK (true);

-- Modification de boutons de footer
CREATE POLICY "Authenticated users can update footer_buttons"
ON footer_buttons FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Suppression de boutons de footer
CREATE POLICY "Authenticated users can delete footer_buttons"
ON footer_buttons FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 6. Permissions pour la table "categories"
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- Création de catégories
CREATE POLICY "Authenticated users can create categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Modification de catégories
CREATE POLICY "Authenticated users can update categories"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Suppression de catégories
CREATE POLICY "Authenticated users can delete categories"
ON categories FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- Confirmation
-- ============================================

SELECT 'Configuration des permissions terminée avec succès!' as message;
