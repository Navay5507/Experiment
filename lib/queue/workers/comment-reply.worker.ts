import { Worker, type Job } from "bullmq";
import { getRedis } from "@/lib/queue/client";
import { replyToComment } from "@/lib/instagram/graph-api";
import type { CommentReplyJobData } from "@/lib/queue/jobs/comment-reply";

export function createCommentReplyWorker() {
  const worker = new Worker<CommentReplyJobData>(
    "comment-reply",
    async (job: Job<CommentReplyJobData>) => {
      const { commentId, commenterUsername, replyTemplate, accessToken } = job.data;

      // Replace merge tags
      const message = replyTemplate.replace(/\{\{name\}\}/g, `@${commenterUsername}`);

      // Call Graph API to post reply
      const result = await replyToComment(commentId, message, { accessToken });

      return { commentReplyId: result.id };
    },
    {
      connection: getRedis(),
      concurrency: 5,
      limiter: {
        max: 20,
        duration: 3600000, // 1 hour
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`[comment-reply] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[comment-reply] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
