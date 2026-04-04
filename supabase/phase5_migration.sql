-- Autodrop Phase 5 Migrations (Onboarding Flow)
-- Run this directly in the Supabase SQL Editor.

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE;
