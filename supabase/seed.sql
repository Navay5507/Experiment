-- Autodrop Seed Data for Development
-- Hardcoded UUIDs for easy reference during dev

-- Test user (Pro plan with active trial)
INSERT INTO users (id, email, name, plan, trial_ends_at, referral_code) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'testcreator@autodrop.dev', 'Test Creator', 'pro', now() + interval '7 days', 'TESTREF001');

-- Connected Instagram account
INSERT INTO instagram_accounts (id, user_id, instagram_id, username, access_token, token_expires_at) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '17841400000000001', 'test_creator_ig', 'dev_token_placeholder', now() + interval '60 days');

-- Active automation (post with keyword triggers)
INSERT INTO automations (id, user_id, instagram_account_id, post_id, post_url, target_type, keywords, comment_reply_template, dm_message, dm_link, gate_type, rate_limit_per_hour, is_active) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '17890000000000001', 'https://www.instagram.com/p/test-post-1/', 'post', ARRAY['link', 'info', 'drop'], 'Hey {{name}}! Check your DMs 🎉', 'Here is the link you requested!', 'https://example.com/resource', 'none', 20, true);

-- Inactive automation
INSERT INTO automations (id, user_id, instagram_account_id, post_id, post_url, target_type, keywords, comment_reply_template, dm_message, dm_link, gate_type, rate_limit_per_hour, is_active) VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '17890000000000002', 'https://www.instagram.com/p/test-post-2/', 'post', ARRAY['price', 'buy'], 'Thanks for your interest, {{name}}!', 'Check out our pricing here:', 'https://example.com/pricing', 'follow', 10, false);

-- Sample automation events for the active automation
INSERT INTO automation_events (id, automation_id, commenter_id, commenter_username, comment_text, keyword_matched, comment_reply_sent, dm_sent, gate_status) VALUES
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '17841400000000100', 'follower_jane', 'I need the link please!', 'link', true, true, 'none'),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '17841400000000101', 'follower_mike', 'Can I get the info?', 'info', true, true, 'none'),
  ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '17841400000000102', 'new_viewer_sam', 'drop', 'drop', true, false, 'none');

-- Sample job logs
INSERT INTO job_logs (id, automation_id, job_type, status, created_at, resolved_at) VALUES
  ('b8c9d0e1-f2a3-4567-bcde-678901234567', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'comment_reply', 'success', now() - interval '2 hours', now() - interval '2 hours'),
  ('c9d0e1f2-a3b4-5678-cdef-789012345678', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'dm_send', 'success', now() - interval '2 hours', now() - interval '2 hours'),
  ('d0e1f2a3-b4c5-6789-defa-890123456789', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'dm_send', 'failed', now() - interval '1 hour', now() - interval '1 hour');

-- Sample lead
INSERT INTO leads (id, automation_id, user_id, commenter_id, commenter_username, lead_type, lead_value, post_id) VALUES
  ('e1f2a3b4-c5d6-7890-efab-901234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '17841400000000100', 'follower_jane', 'email', 'jane@example.com', '17890000000000001');
