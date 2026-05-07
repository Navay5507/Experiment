import { dmSendQueue } from "@/lib/queue/client";
import type { GateType, LeadType } from "@/types/database";

export interface DmSendJobData {
  automationId: string;
  eventId: string;
  instagramUserId: string;
  recipientId: string;
  commenterUsername: string;
  dmMessage: string;
  dmLink: string | null;
  gateType: GateType;
  leadType: LeadType | null;
  accessToken: string;
  rateLimitPerHour: number;
}

export async function enqueueDmSend(data: DmSendJobData): Promise<string> {
  const job = await dmSendQueue.add("dm", data, {
    jobId: `dm-send-${data.eventId}`,
  });
  return job.id ?? "";
}
