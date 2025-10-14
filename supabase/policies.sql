-- ============================================
-- RLS POLICIES POUR WELCOMEBOOK
-- ============================================
-- Mode public : Lecture pour tout le monde (voyageurs)
-- Mode gestionnaire : CUD uniquement pour le propriétaire
-- ============================================

-- ============================================
-- TABLE: clients
-- ============================================

-- Activer RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique (tout le monde peut voir les clients)
CREATE POLICY "Clients sont visibles publiquement"
ON clients
FOR SELECT
TO public
USING (true);

-- Policy: Insertion (un utilisateur peut créer son propre client)
CREATE POLICY "Utilisateurs peuvent créer leur propre client"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = email OR auth.email() = email);

-- Policy: Mise à jour (un utilisateur peut modifier son propre client)
CREATE POLICY "Utilisateurs peuvent modifier leur propre client"
ON clients
FOR UPDATE
TO authenticated
USING (auth.email() = email)
WITH CHECK (auth.email() = email);

-- Policy: Suppression (un utilisateur peut supprimer son propre client)
CREATE POLICY "Utilisateurs peuvent supprimer leur propre client"
ON clients
FOR DELETE
TO authenticated
USING (auth.email() = email);


-- ============================================
-- TABLE: categories
-- ============================================

-- Activer RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique
CREATE POLICY "Catégories sont visibles publiquement"
ON categories
FOR SELECT
TO public
USING (true);

-- Policy: Insertion (tous les gestionnaires authentifiés peuvent créer des catégories)
CREATE POLICY "Gestionnaires peuvent créer des catégories"
ON categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Mise à jour (tous les gestionnaires authentifiés peuvent modifier)
CREATE POLICY "Gestionnaires peuvent modifier des catégories"
ON categories
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Suppression (tous les gestionnaires authentifiés peuvent supprimer)
CREATE POLICY "Gestionnaires peuvent supprimer des catégories"
ON categories
FOR DELETE
TO authenticated
USING (true);


-- ============================================
-- TABLE: tips (conseils)
-- ============================================

-- Activer RLS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique
CREATE POLICY "Conseils sont visibles publiquement"
ON tips
FOR SELECT
TO public
USING (true);

-- Policy: Insertion (uniquement le propriétaire du client peut ajouter des conseils)
CREATE POLICY "Gestionnaires peuvent ajouter leurs propres conseils"
ON tips
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = tips.client_id
    AND clients.email = auth.email()
  )
);

-- Policy: Mise à jour (uniquement le propriétaire du client peut modifier ses conseils)
CREATE POLICY "Gestionnaires peuvent modifier leurs propres conseils"
ON tips
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = tips.client_id
    AND clients.email = auth.email()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = tips.client_id
    AND clients.email = auth.email()
  )
);

-- Policy: Suppression (uniquement le propriétaire du client peut supprimer ses conseils)
CREATE POLICY "Gestionnaires peuvent supprimer leurs propres conseils"
ON tips
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = tips.client_id
    AND clients.email = auth.email()
  )
);


-- ============================================
-- TABLE: tip_media (photos/vidéos)
-- ============================================

-- Activer RLS
ALTER TABLE tip_media ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique
CREATE POLICY "Médias sont visibles publiquement"
ON tip_media
FOR SELECT
TO public
USING (true);

-- Policy: Insertion (uniquement le propriétaire du conseil peut ajouter des médias)
CREATE POLICY "Gestionnaires peuvent ajouter des médias à leurs conseils"
ON tip_media
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tips
    JOIN clients ON clients.id = tips.client_id
    WHERE tips.id = tip_media.tip_id
    AND clients.email = auth.email()
  )
);

-- Policy: Mise à jour (uniquement le propriétaire du conseil peut modifier les médias)
CREATE POLICY "Gestionnaires peuvent modifier les médias de leurs conseils"
ON tip_media
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tips
    JOIN clients ON clients.id = tips.client_id
    WHERE tips.id = tip_media.tip_id
    AND clients.email = auth.email()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tips
    JOIN clients ON clients.id = tips.client_id
    WHERE tips.id = tip_media.tip_id
    AND clients.email = auth.email()
  )
);

-- Policy: Suppression (uniquement le propriétaire du conseil peut supprimer les médias)
CREATE POLICY "Gestionnaires peuvent supprimer les médias de leurs conseils"
ON tip_media
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tips
    JOIN clients ON clients.id = tips.client_id
    WHERE tips.id = tip_media.tip_id
    AND clients.email = auth.email()
  )
);


-- ============================================
-- TABLE: footer_buttons
-- ============================================

-- Activer RLS
ALTER TABLE footer_buttons ENABLE ROW LEVEL SECURITY;

-- Policy: Lecture publique
CREATE POLICY "Boutons footer sont visibles publiquement"
ON footer_buttons
FOR SELECT
TO public
USING (true);

-- Policy: Insertion (uniquement le propriétaire du client peut ajouter des boutons)
CREATE POLICY "Gestionnaires peuvent ajouter leurs propres boutons footer"
ON footer_buttons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = footer_buttons.client_id
    AND clients.email = auth.email()
  )
);

-- Policy: Mise à jour (uniquement le propriétaire du client peut modifier ses boutons)
CREATE POLICY "Gestionnaires peuvent modifier leurs propres boutons footer"
ON footer_buttons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = footer_buttons.client_id
    AND clients.email = auth.email()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = footer_buttons.client_id
    AND clients.email = auth.email()
  )
);

-- Policy: Suppression (uniquement le propriétaire du client peut supprimer ses boutons)
CREATE POLICY "Gestionnaires peuvent supprimer leurs propres boutons footer"
ON footer_buttons
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = footer_buttons.client_id
    AND clients.email = auth.email()
  )
);


-- ============================================
-- STORAGE POLICIES (pour les images/vidéos)
-- ============================================

-- Note: Ces policies sont à créer dans l'interface Supabase Storage
-- ou via le dashboard, car elles utilisent une syntaxe différente

-- Bucket: welcomebook-media
-- Policy 1: Lecture publique
-- CREATE POLICY "Médias publics en lecture"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'welcomebook-media');

-- Policy 2: Upload pour gestionnaires authentifiés
-- CREATE POLICY "Gestionnaires peuvent uploader des médias"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'welcomebook-media');

-- Policy 3: Suppression pour gestionnaires authentifiés (leurs propres fichiers)
-- CREATE POLICY "Gestionnaires peuvent supprimer leurs médias"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'welcomebook-media' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================
-- FONCTIONS HELPER (optionnelles)
-- ============================================

-- Fonction pour vérifier si l'utilisateur est propriétaire d'un client
CREATE OR REPLACE FUNCTION is_client_owner(client_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clients
    WHERE id = client_id_param
    AND email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est propriétaire d'un conseil
CREATE OR REPLACE FUNCTION is_tip_owner(tip_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tips
    JOIN clients ON clients.id = tips.client_id
    WHERE tips.id = tip_id_param
    AND clients.email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- TRIGGERS (mise à jour automatique de updated_at)
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la table tips
CREATE TRIGGER update_tips_updated_at
BEFORE UPDATE ON tips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- INDEXATION (pour améliorer les performances)
-- ============================================

-- Index sur les slugs (recherche rapide par URL)
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Index sur les foreign keys
CREATE INDEX IF NOT EXISTS idx_tips_client_id ON tips(client_id);
CREATE INDEX IF NOT EXISTS idx_tips_category_id ON tips(category_id);
CREATE INDEX IF NOT EXISTS idx_tip_media_tip_id ON tip_media(tip_id);
CREATE INDEX IF NOT EXISTS idx_footer_buttons_client_id ON footer_buttons(client_id);

-- Index pour les coordonnées géographiques (si vous utilisez PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_tips_coordinates ON tips USING GIST ((coordinates::geometry));
