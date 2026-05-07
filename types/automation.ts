import type { GateType, LeadType, TargetType } from "./database";

export type { TargetType, GateType, LeadType };

export interface CreateAutomationInput {
  user_id: string;
  instagram_account_id: string;
  post_id: string;
  post_url: string;
  target_type: TargetType;
  keywords: string[];
  comment_reply_template: string;
  dm_message?: string;
  dm_link?: string;
  gate_type: GateType;
  lead_type?: LeadType;
  rate_limit_per_hour?: number;
}

export interface UpdateAutomationInput {
  keywords?: string[];
  comment_reply_template?: string;
  dm_message?: string;
  dm_link?: string;
  gate_type?: GateType;
  lead_type?: LeadType | null;
  rate_limit_per_hour?: number;
  is_active?: boolean;
}
