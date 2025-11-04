-- Admin RLS Policies
-- Permet à l'admin (romainfrancedumoulin@gmail.com) d'accéder à toutes les données

-- Helper function pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = 'romainfrancedumoulin@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- POLICIES POUR TABLE CLIENTS
-- =============================================================================

-- Admin peut voir tous les clients
CREATE POLICY "Admin can view all clients"
  ON clients FOR SELECT
  USING (is_admin());

-- Admin peut modifier tous les clients
CREATE POLICY "Admin can update all clients"
  ON clients FOR UPDATE
  USING (is_admin());

-- Admin peut supprimer tous les clients
CREATE POLICY "Admin can delete all clients"
  ON clients FOR DELETE
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE TIPS
-- =============================================================================

-- Admin peut voir tous les tips
CREATE POLICY "Admin can view all tips"
  ON tips FOR SELECT
  USING (is_admin());

-- Admin peut modifier tous les tips
CREATE POLICY "Admin can update all tips"
  ON tips FOR UPDATE
  USING (is_admin());

-- Admin peut supprimer tous les tips
CREATE POLICY "Admin can delete all tips"
  ON tips FOR DELETE
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE CATEGORIES
-- =============================================================================

-- Admin peut voir toutes les catégories
CREATE POLICY "Admin can view all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE TIP_MEDIA
-- =============================================================================

-- Admin peut voir tous les médias
CREATE POLICY "Admin can view all tip_media"
  ON tip_media FOR SELECT
  USING (is_admin());

-- Admin peut supprimer tous les médias
CREATE POLICY "Admin can delete all tip_media"
  ON tip_media FOR DELETE
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE SECURE_SECTIONS
-- =============================================================================

-- Admin peut voir toutes les sections sécurisées
CREATE POLICY "Admin can view all secure_sections"
  ON secure_sections FOR SELECT
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE QR_CODE_DESIGNS
-- =============================================================================

-- Admin peut voir tous les QR codes
CREATE POLICY "Admin can view all qr_code_designs"
  ON qr_code_designs FOR SELECT
  USING (is_admin());

-- Admin peut supprimer tous les QR codes
CREATE POLICY "Admin can delete all qr_code_designs"
  ON qr_code_designs FOR DELETE
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE ANALYTICS_EVENTS
-- =============================================================================

-- Admin peut voir tous les événements analytics
CREATE POLICY "Admin can view all analytics_events"
  ON analytics_events FOR SELECT
  USING (is_admin());

-- =============================================================================
-- POLICIES POUR TABLE AI_GENERATION_LOGS
-- =============================================================================

-- Admin peut voir tous les logs AI
CREATE POLICY "Admin can view all ai_generation_logs"
  ON ai_generation_logs FOR SELECT
  USING (is_admin());

-- =============================================================================
-- COMMENT
-- =============================================================================

COMMENT ON FUNCTION is_admin() IS 'Vérifie si l''utilisateur connecté est l''admin (romainfrancedumoulin@gmail.com)';
