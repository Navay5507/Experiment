-- ================================================================
-- Autodrop Migration: v1 → v2
-- Run this ENTIRE block in your Supabase SQL Editor → Run
-- Safe to run multiple times (all use IF NOT EXISTS / DO NOTHING)
-- ================================================================

-- 1. Add new columns to automations (interactive DM fields)
ALTER TABLE automations
  ADD COLUMN IF NOT EXISTS initial_dm_text TEXT DEFAULT 'Thanks for your interest! Tap below to get the link 👇',
  ADD COLUMN IF NOT EXISTS lead_capture_ask TEXT,
  ADD COLUMN IF NOT EXISTS lead_capture_fields TEXT[] DEFAULT '{}';

-- 2. Add Elite AI columns if missing
ALTER TABLE automations
  ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_prompt TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS knowledge_base TEXT;

-- 3. Create dm_conversations state-machine table
CREATE TABLE IF NOT EXISTS dm_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    recipient_ig_id TEXT NOT NULL,
    state TEXT DEFAULT 'initiated',
    current_field_index INTEGER DEFAULT 0,
    lead_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, automation_id, recipient_ig_id)
);

-- 4. Fix analytics_events schema mismatch:
--    a) Drop the NOT NULL constraint on instagram_username
--    b) Add the missing metadata JSONB column
DO $$
BEGIN
  -- Add metadata column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_events' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE analytics_events ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;

  -- Drop NOT NULL on instagram_username if it exists
  ALTER TABLE analytics_events ALTER COLUMN instagram_username SET DEFAULT 'system';
  ALTER TABLE analytics_events ALTER COLUMN instagram_username DROP NOT NULL;
END $$;

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dm_conversations_lookup
  ON dm_conversations(user_id, recipient_ig_id, state);

CREATE INDEX IF NOT EXISTS idx_automations_user_active
  ON automations(user_id, is_active);

-- Done! ✅
-- You can now enable the webhook on Meta and go live.
