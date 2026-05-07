import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AutomationEventRow,
  AutomationRow,
  InstagramAccountRow,
  JobLogRow,
  JobStatus,
  LeadRow,
  Plan,
  ReferralRow,
  UserRow,
} from "@/types/database";
import type { CreateAutomationInput, UpdateAutomationInput } from "@/types/automation";
import type { LeadFilter } from "@/types/leads";

// ============================================================
// Users
// ============================================================

export async function getUserById(
  client: SupabaseClient,
  id: string
): Promise<UserRow | null> {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserByEmail(
  client: SupabaseClient,
  email: string
): Promise<UserRow | null> {
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createUser(
  client: SupabaseClient,
  data: Omit<UserRow, "id" | "created_at">
): Promise<UserRow> {
  const { data: user, error } = await client
    .from("users")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return user;
}

export async function updateUserPlan(
  client: SupabaseClient,
  id: string,
  plan: Plan
): Promise<UserRow> {
  const { data, error } = await client
    .from("users")
    .update({ plan })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// Instagram Accounts
// ============================================================

export async function getInstagramAccountsByUserId(
  client: SupabaseClient,
  userId: string
): Promise<InstagramAccountRow[]> {
  const { data, error } = await client
    .from("instagram_accounts")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function getInstagramAccountById(
  client: SupabaseClient,
  id: string
): Promise<InstagramAccountRow | null> {
  const { data, error } = await client
    .from("instagram_accounts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createInstagramAccount(
  client: SupabaseClient,
  data: Omit<InstagramAccountRow, "id" | "connected_at">
): Promise<InstagramAccountRow> {
  const { data: account, error } = await client
    .from("instagram_accounts")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return account;
}

export async function updateInstagramAccountToken(
  client: SupabaseClient,
  id: string,
  accessToken: string,
  tokenExpiresAt: string
): Promise<InstagramAccountRow> {
  const { data, error } = await client
    .from("instagram_accounts")
    .update({ access_token: accessToken, token_expires_at: tokenExpiresAt })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInstagramAccount(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client
    .from("instagram_accounts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ============================================================
// Automations
// ============================================================

export async function getAutomationsByUserId(
  client: SupabaseClient,
  userId: string
): Promise<AutomationRow[]> {
  const { data, error } = await client
    .from("automations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAutomationById(
  client: SupabaseClient,
  id: string
): Promise<AutomationRow | null> {
  const { data, error } = await client
    .from("automations")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAutomationByPostId(
  client: SupabaseClient,
  postId: string
): Promise<AutomationRow | null> {
  const { data, error } = await client
    .from("automations")
    .select("*")
    .eq("post_id", postId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function getActiveAutomationsByPostId(
  client: SupabaseClient,
  postId: string
): Promise<AutomationRow[]> {
  const { data, error } = await client
    .from("automations")
    .select("*")
    .eq("post_id", postId)
    .eq("is_active", true);
  if (error) throw error;
  return data ?? [];
}

export async function createAutomation(
  client: SupabaseClient,
  data: CreateAutomationInput
): Promise<AutomationRow> {
  const { data: automation, error } = await client
    .from("automations")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return automation;
}

export async function updateAutomation(
  client: SupabaseClient,
  id: string,
  data: UpdateAutomationInput
): Promise<AutomationRow> {
  const { data: automation, error } = await client
    .from("automations")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return automation;
}

export async function deleteAutomation(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client.from("automations").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleAutomation(
  client: SupabaseClient,
  id: string,
  isActive: boolean
): Promise<AutomationRow> {
  const { data, error } = await client
    .from("automations")
    .update({ is_active: isActive })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function countActiveAutomationsByUserId(
  client: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await client
    .from("automations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

// ============================================================
// Automation Events
// ============================================================

export async function createAutomationEvent(
  client: SupabaseClient,
  data: Omit<AutomationEventRow, "id" | "created_at">
): Promise<AutomationEventRow> {
  const { data: event, error } = await client
    .from("automation_events")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return event;
}

export async function getEventsByAutomationId(
  client: SupabaseClient,
  automationId: string,
  options?: { limit?: number; offset?: number }
): Promise<AutomationEventRow[]> {
  let query = client
    .from("automation_events")
    .select("*")
    .eq("automation_id", automationId)
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateEventStatus(
  client: SupabaseClient,
  id: string,
  data: Partial<Pick<AutomationEventRow, "comment_reply_sent" | "dm_sent" | "gate_status">>
): Promise<AutomationEventRow> {
  const { data: event, error } = await client
    .from("automation_events")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return event;
}

// ============================================================
// Leads
// ============================================================

export async function getLeadsByUserId(
  client: SupabaseClient,
  userId: string,
  filters?: LeadFilter
): Promise<LeadRow[]> {
  let query = client
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });

  if (filters?.automationId) query = query.eq("automation_id", filters.automationId);
  if (filters?.postId) query = query.eq("post_id", filters.postId);
  if (filters?.leadType) query = query.eq("lead_type", filters.leadType);
  if (filters?.dateFrom) query = query.gte("captured_at", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("captured_at", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLeadsByAutomationId(
  client: SupabaseClient,
  automationId: string
): Promise<LeadRow[]> {
  const { data, error } = await client
    .from("leads")
    .select("*")
    .eq("automation_id", automationId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createLead(
  client: SupabaseClient,
  data: Omit<LeadRow, "id" | "captured_at">
): Promise<LeadRow> {
  const { data: lead, error } = await client
    .from("leads")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return lead;
}

export async function getLeadsForExport(
  client: SupabaseClient,
  userId: string,
  filters?: LeadFilter
): Promise<LeadRow[]> {
  let query = client
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });

  if (filters?.automationId) query = query.eq("automation_id", filters.automationId);
  if (filters?.postId) query = query.eq("post_id", filters.postId);
  if (filters?.leadType) query = query.eq("lead_type", filters.leadType);
  if (filters?.dateFrom) query = query.gte("captured_at", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("captured_at", filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Job Logs
// ============================================================

export async function createJobLog(
  client: SupabaseClient,
  data: Omit<JobLogRow, "id" | "created_at" | "resolved_at">
): Promise<JobLogRow> {
  const { data: log, error } = await client
    .from("job_logs")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return log;
}

export async function updateJobLog(
  client: SupabaseClient,
  id: string,
  data: Partial<Pick<JobLogRow, "status" | "error_message" | "resolved_at">>
): Promise<JobLogRow> {
  const { data: log, error } = await client
    .from("job_logs")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return log;
}

export async function getJobLogsByAutomationId(
  client: SupabaseClient,
  automationId: string
): Promise<JobLogRow[]> {
  const { data, error } = await client
    .from("job_logs")
    .select("*")
    .eq("automation_id", automationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Referrals
// ============================================================

export async function createReferral(
  client: SupabaseClient,
  data: Omit<ReferralRow, "id" | "created_at" | "converted_to_paid" | "reward_applied">
): Promise<ReferralRow> {
  const { data: referral, error } = await client
    .from("referrals")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return referral;
}

export async function getReferralsByReferrerId(
  client: SupabaseClient,
  referrerId: string
): Promise<ReferralRow[]> {
  const { data, error } = await client
    .from("referrals")
    .select("*")
    .eq("referrer_id", referrerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markReferralConverted(
  client: SupabaseClient,
  id: string
): Promise<ReferralRow> {
  const { data, error } = await client
    .from("referrals")
    .update({ converted_to_paid: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markRewardApplied(
  client: SupabaseClient,
  id: string
): Promise<ReferralRow> {
  const { data, error } = await client
    .from("referrals")
    .update({ reward_applied: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
