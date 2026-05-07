-- Autodrop Initial Schema
-- All 7 tables as defined in CLAUDE.md

-- 1. Users (synced from Clerk later)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'elite')),
  trial_ends_at TIMESTAMPTZ,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Instagram accounts connected by creators
CREATE TABLE instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Automations configured per post
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'post' CHECK (target_type IN ('post', 'story', 'live')),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  comment_reply_template TEXT NOT NULL,
  dm_message TEXT,
  dm_link TEXT,
  gate_type TEXT NOT NULL DEFAULT 'none' CHECK (gate_type IN ('none', 'follow', 'lead')),
  lead_type TEXT CHECK (lead_type IN ('email', 'phone')),
  rate_limit_per_hour INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Each time a keyword is matched
CREATE TABLE automation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  commenter_id TEXT NOT NULL,
  commenter_username TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  keyword_matched TEXT NOT NULL,
  comment_reply_sent BOOLEAN NOT NULL DEFAULT false,
  dm_sent BOOLEAN NOT NULL DEFAULT false,
  gate_status TEXT NOT NULL DEFAULT 'none' CHECK (gate_status IN ('none', 'pending_follow', 'pending_lead', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Leads captured via DM
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commenter_id TEXT NOT NULL,
  commenter_username TEXT NOT NULL,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('email', 'phone')),
  lead_value TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  post_id TEXT NOT NULL
);

-- 6. Job queue logs (for dashboard visibility)
CREATE TABLE job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('comment_reply', 'dm_send', 'retrigger')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 7. Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  converted_to_paid BOOLEAN NOT NULL DEFAULT false,
  reward_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_automations_post_id ON automations(post_id);
CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_automation_events_automation_id ON automation_events(automation_id);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_job_logs_automation_id ON job_logs(automation_id);
CREATE INDEX idx_instagram_accounts_user_id ON instagram_accounts(user_id);
CREATE INDEX idx_leads_automation_id ON leads(automation_id);

-- Updated_at trigger for automations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
