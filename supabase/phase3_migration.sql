-- Autodrop Phase 3 Migrations (Elite AI)
-- Run this payload directly in the Supabase SQL Editor to rapidly inject the new Elite LLM tracking constraints into your live application architecture.

ALTER TABLE users ADD COLUMN IF NOT EXISTS knowledge_base TEXT;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE automations ADD COLUMN IF NOT EXISTS ai_prompt TEXT;
