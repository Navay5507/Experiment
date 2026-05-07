import { commentReplyQueue } from "@/lib/queue/client";

export interface CommentReplyJobData {
  automationId: string;
  eventId: string;
  commentId: string;
  commenterUsername: string;
  replyTemplate: string;
  accessToken: string;
  rateLimitPerHour: number;
}

export async function enqueueCommentReply(data: CommentReplyJobData): Promise<string> {
  const job = await commentReplyQueue.add("reply", data, {
    jobId: `comment-reply-${data.eventId}`,
  });
  return job.id ?? "";
}
