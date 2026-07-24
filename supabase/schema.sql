-- Autodrop Core Schema v1

-- Users Table (Synced with Clerk via Webhook)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    instagram_handle TEXT,
    instagram_user_id TEXT,
    instagram_access_token TEXT, -- Encrypted in production via Vault
    plan_tier TEXT DEFAULT 'free', -- free, pro, elite
    knowledge_base TEXT, -- Elite AI brand training
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automations (The core keyword rules per post/story)
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- post, story, live
    instagram_media_id TEXT, -- Nullable if target_type is story (all stories)
    keywords TEXT[] NOT NULL,
    reply_template TEXT NOT NULL,
    dm_link TEXT,
    initial_dm_text TEXT DEFAULT 'Thanks for your interest! Tap below to get the link 👇',
    lead_capture_type TEXT, -- null, email, phone
    lead_capture_ask TEXT, -- Custom message for lead capture prompt
    lead_capture_fields TEXT[] DEFAULT '{}', -- e.g. {'email','phone','name','company'}
    follow_gate_enabled BOOLEAN DEFAULT FALSE,
    ai_enabled BOOLEAN DEFAULT FALSE, -- Elite AI flag
    ai_prompt TEXT, -- Custom overrides for GPT-4o
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DM Conversation State Machine (tracks multi-step interactive DM flows)
CREATE TABLE dm_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    recipient_ig_id TEXT NOT NULL,
    state TEXT DEFAULT 'initiated', -- initiated, awaiting_link_tap, awaiting_follow, awaiting_lead, completed
    current_field_index INTEGER DEFAULT 0, -- tracks which lead field we're asking for
    lead_data JSONB DEFAULT '{}', -- collected lead data e.g. {"email":"x@y.com","phone":"+1234"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, automation_id, recipient_ig_id)
);

-- Leads (Captured emails/phones)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instagram_username TEXT NOT NULL,
    lead_type TEXT NOT NULL, -- email, phone
    lead_value TEXT NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events (Logged by workers for Dashboard)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    instagram_username TEXT DEFAULT 'system',
    status TEXT DEFAULT 'success',
    error_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_status TEXT DEFAULT 'pending', -- pending, earned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
