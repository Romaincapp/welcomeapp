-- Migration: Add checkout configuration fields to secure_sections
-- Date: 2025-12-20
-- Description: Adds departure instructions, key return procedure, departure checklist, and move-out inspection fields with multilingual support (6 languages: en, es, nl, de, it, pt)

ALTER TABLE secure_sections
-- Departure instructions (base + 6 languages)
ADD COLUMN IF NOT EXISTS departure_instructions TEXT,
ADD COLUMN IF NOT EXISTS departure_instructions_en TEXT,
ADD COLUMN IF NOT EXISTS departure_instructions_es TEXT,
ADD COLUMN IF NOT EXISTS departure_instructions_nl TEXT,
ADD COLUMN IF NOT EXISTS departure_instructions_de TEXT,
ADD COLUMN IF NOT EXISTS departure_instructions_it TEXT,
ADD COLUMN IF NOT EXISTS departure_instructions_pt TEXT,

-- Key return procedure (base + 6 languages)
ADD COLUMN IF NOT EXISTS key_return_procedure TEXT,
ADD COLUMN IF NOT EXISTS key_return_procedure_en TEXT,
ADD COLUMN IF NOT EXISTS key_return_procedure_es TEXT,
ADD COLUMN IF NOT EXISTS key_return_procedure_nl TEXT,
ADD COLUMN IF NOT EXISTS key_return_procedure_de TEXT,
ADD COLUMN IF NOT EXISTS key_return_procedure_it TEXT,
ADD COLUMN IF NOT EXISTS key_return_procedure_pt TEXT,

-- Departure checklist (JSONB array of checklist items with multilingual labels)
ADD COLUMN IF NOT EXISTS departure_checklist JSONB DEFAULT '[]'::jsonb,

-- Move-out inspection (base + 6 languages)
ADD COLUMN IF NOT EXISTS moveout_inspection TEXT,
ADD COLUMN IF NOT EXISTS moveout_inspection_en TEXT,
ADD COLUMN IF NOT EXISTS moveout_inspection_es TEXT,
ADD COLUMN IF NOT EXISTS moveout_inspection_nl TEXT,
ADD COLUMN IF NOT EXISTS moveout_inspection_de TEXT,
ADD COLUMN IF NOT EXISTS moveout_inspection_it TEXT,
ADD COLUMN IF NOT EXISTS moveout_inspection_pt TEXT;

-- Add comments for documentation
COMMENT ON COLUMN secure_sections.departure_instructions IS 'General departure instructions (time, procedure)';
COMMENT ON COLUMN secure_sections.key_return_procedure IS 'Key return procedure';
COMMENT ON COLUMN secure_sections.departure_checklist IS 'Interactive checklist before departure - JSONB array: [{id, label, label_en, label_es, label_nl, label_de, label_it, label_pt}]';
COMMENT ON COLUMN secure_sections.moveout_inspection IS 'Move-out inspection instructions';
