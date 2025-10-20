-- Migration: Mettre à jour l'email du client démo pour activer le mode édition
-- Date: 2025-10-20

UPDATE clients
SET email = 'romainfrancedumoulin@gmail.com'
WHERE slug = 'demo';
