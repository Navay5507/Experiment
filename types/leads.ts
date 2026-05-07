import type { LeadType } from "./database";

export interface Lead {
  id: string;
  automationId: string;
  userId: string;
  commenterId: string;
  commenterUsername: string;
  leadType: LeadType;
  leadValue: string;
  capturedAt: string;
  postId: string;
}

export interface LeadExportRow {
  commenter_username: string;
  lead_type: LeadType;
  lead_value: string;
  captured_at: string;
  post_id: string;
}

export interface LeadFilter {
  automationId?: string;
  postId?: string;
  leadType?: LeadType;
  dateFrom?: string;
  dateTo?: string;
}
