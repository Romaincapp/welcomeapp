-- ============================================
-- STORAGE POLICIES POUR LE BUCKET "media"
-- ============================================
-- Policies pour permettre:
-- - Lecture publique (tous les visiteurs)
-- - Upload/Modification/Suppression pour authentifies
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public access for media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their files" ON storage.objects;

-- Policy 1: LECTURE PUBLIQUE (tout le monde peut voir les medias)
CREATE POLICY "Public access for media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy 2: UPLOAD POUR AUTHENTIFIES (gestionnaires peuvent uploader)
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy 3: MISE A JOUR POUR AUTHENTIFIES (gestionnaires peuvent modifier)
CREATE POLICY "Authenticated users can update their files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media')
WITH CHECK (bucket_id = 'media');

-- Policy 4: SUPPRESSION POUR AUTHENTIFIES (gestionnaires peuvent supprimer)
CREATE POLICY "Authenticated users can delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media');
