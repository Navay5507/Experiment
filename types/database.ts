// Database row types — matches supabase/migrations/00001_initial_schema.sql
// Will be replaced by `supabase gen types typescript` once DB is live

export type Plan = "free" | "pro" | "elite";
export type TargetType = "post" | "story" | "live";
export type GateType = "none" | "follow" | "lead";
export type LeadType = "email" | "phone";
export type GateStatus = "none" | "pending_follow" | "pending_lead" | "completed";
export type JobType = "comment_reply" | "dm_send" | "retrigger";
export type JobStatus = "queued" | "processing" | "success" | "failed";

export interface UserRow {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  trial_ends_at: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface InstagramAccountRow {
  id: string;
  user_id: string;
  instagram_id: string;
  username: string;
  access_token: string;
  token_expires_at: string | null;
  connected_at: string;
}

export interface AutomationRow {
  id: string;
  user_id: string;
  instagram_account_id: string;
  post_id: string;
  post_url: string;
  target_type: TargetType;
  keywords: string[];
  comment_reply_template: string;
  dm_message: string | null;
  dm_link: string | null;
  gate_type: GateType;
  lead_type: LeadType | null;
  rate_limit_per_hour: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationEventRow {
  id: string;
  automation_id: string;
  commenter_id: string;
  commenter_username: string;
  comment_text: string;
  keyword_matched: string;
  comment_reply_sent: boolean;
  dm_sent: boolean;
  gate_status: GateStatus;
  created_at: string;
}

export interface LeadRow {
  id: string;
  automation_id: string;
  user_id: string;
  commenter_id: string;
  commenter_username: string;
  lead_type: LeadType;
  lead_value: string;
  captured_at: string;
  post_id: string;
}

export interface JobLogRow {
  id: string;
  automation_id: string;
  job_type: JobType;
  status: JobStatus;
  error_message: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  converted_to_paid: boolean;
  reward_applied: boolean;
  created_at: string;
}
