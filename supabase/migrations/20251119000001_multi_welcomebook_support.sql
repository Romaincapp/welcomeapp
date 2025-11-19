-- Migration: Multi-Welcomebook Support
-- Date: 2025-11-19
-- Description: Allow multiple welcomebooks per email address by removing UNIQUE constraint
--              and adding welcomebook_name field for display in switcher

-- =====================================================
-- STEP 1: Remove UNIQUE constraint on email
-- =====================================================
-- This allows a single user (email) to create multiple welcomebooks

-- Drop all variations of email unique constraints that might exist
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_unique;
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key;

-- =====================================================
-- STEP 2: Add welcomebook_name field
-- =====================================================
-- This field will be used for display in the welcomebook switcher UI
-- It's separate from 'name' (property name) to allow better organization

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS welcomebook_name text;

-- =====================================================
-- STEP 3: Backfill welcomebook_name with existing data
-- =====================================================
-- For existing clients, use their 'name' field as welcomebook_name
-- This ensures backwards compatibility

UPDATE clients
SET welcomebook_name = name
WHERE welcomebook_name IS NULL;

-- =====================================================
-- STEP 4: Add NOT NULL constraint after backfill
-- =====================================================
-- Ensure all new welcomebooks have a display name

ALTER TABLE clients
  ALTER COLUMN welcomebook_name SET NOT NULL;

-- =====================================================
-- STEP 5: Create optimized indexes
-- =====================================================
-- These indexes improve query performance when:
-- 1. Fetching all welcomebooks for a user (email + created_at sorting)
-- 2. Fetching by user_id (for authenticated queries)

-- Index for email-based queries (sorted by newest first)
CREATE INDEX IF NOT EXISTS idx_clients_email_created_at
  ON clients(email, created_at DESC);

-- Index for user_id-based queries (only for authenticated users)
CREATE INDEX IF NOT EXISTS idx_clients_user_id
  ON clients(user_id)
  WHERE user_id IS NOT NULL;

-- =====================================================
-- STEP 6: Add helpful comment
-- =====================================================
-- Document the purpose of the new field

COMMENT ON COLUMN clients.welcomebook_name IS
  'Display name for the welcomebook (shown in switcher UI). Can differ from property name (slug).';

-- =====================================================
-- VERIFICATION NOTES
-- =====================================================
-- After migration:
-- 1. Verify existing RLS policies still work (they already check user_id OR email)
-- 2. Test creating multiple welcomebooks with same email
-- 3. Test switcher UI displays welcomebook_name correctly
-- 4. Ensure backwards compatibility (existing single-welcomebook users unaffected)
