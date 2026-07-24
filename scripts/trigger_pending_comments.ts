/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import fs from 'fs';
import crypto from 'crypto';

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0 && !key.trim().startsWith('#')) {
    let val = values.join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[key.trim()] = val;
  }
});

import { safeDecrypt } from '../src/lib/crypto';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const redis = new Redis(process.env.REDIS_URL!);
const commentQueue = new Queue('comment-reply', { connection: redis });

async function run() {
  const userId = '08e5c91f-deb9-46f1-a95e-29e6ae4122d1';
  console.log('Retriggering for user:', userId);

  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!user) throw new Error('User not found');

  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('target_type', 'post');

  if (!automations || automations.length === 0) {
    console.log('No active post automations');
    process.exit(0);
  }

  const { data: connectedAccount, error: accError } = await supabase.from('connected_accounts').select('*').eq('user_id', userId).limit(1).maybeSingle();
  if (accError) console.error("Error fetching connected accounts:", accError);
  
  let token = safeDecrypt(user.instagramAccessToken);
  let igUserId = user.instagramUserId;

  if (connectedAccount) {
    token = safeDecrypt(connectedAccount.instagram_access_token);
    igUserId = connectedAccount.instagram_user_id;
  }
  console.log("Decrypted token starts with:", token?.substring(0, 15));

  let mediaItems: any[] = [];
  try {
    let url: string | null = `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,timestamp&limit=100&access_token=${token}`;
    let pagesCount = 0;
    while (url && pagesCount < 10) {
      const fetchResponse: any = await fetch(url);
      const data: any = await fetchResponse.json();
      if (data.error) throw new Error(data.error.message);
      mediaItems.push(...(data.data || []));
      url = data.paging?.next || null;
      pagesCount++;
    }
  } catch (e: any) {
    console.error("/me/media failed:", e.message);
    mediaItems = []; // Reset
    let url: string | null = `https://graph.instagram.com/v21.0/${igUserId}/media?fields=id,caption,media_type,timestamp&limit=100&access_token=${token}`;
    let pagesCount = 0;
    while (url && pagesCount < 10) {
      const fetchResponse2: any = await fetch(url);
      const data: any = await fetchResponse2.json();
      if (data.error) {
        console.error("Fallback failed:", data.error);
        break;
      }
      mediaItems.push(...(data.data || []));
      url = data.paging?.next || null;
      pagesCount++;
    }
  }

  console.log(`Found ${mediaItems.length} media items.`);

  let queued = 0;
  for (const media of mediaItems) {
    let comments: any[] = [];
    let commentsUrl: string | null = `https://graph.instagram.com/v21.0/${media.id}/comments?fields=id,text,from,timestamp&limit=100&access_token=${token}`;
    
    while (commentsUrl) {
      const commentsRes: any = await fetch(commentsUrl);
      const commentsData: any = await commentsRes.json();
      if (commentsData.error) break;
      comments.push(...(commentsData.data || []));
      commentsUrl = commentsData.paging?.next || null;
    }

    for (const comment of comments) {
      // Ensure we don't process a comment that was already processed!
      const isProcessed = await redis.exists(`processed_comment:${comment.id}`);
      if (isProcessed) {
        console.log(`Skipping already processed comment ${comment.id}`);
        continue;
      }
      const text = (comment.text || '').toLowerCase();
      let matched = false;

      for (const auto of automations) {
        const allowedPosts = auto.instagram_media_id ? auto.instagram_media_id.split(',').filter(Boolean) : [];
        if (allowedPosts.length > 0 && !allowedPosts.includes(media.id)) continue;

        let kws: string[] = [];
        if (Array.isArray(auto.keywords)) kws = auto.keywords;
        else if (typeof auto.keywords === 'string') kws = auto.keywords.split(',').map((k: string) => k.trim());
        
        let keywordMatch = false;
        if (!kws || kws.length === 0 || kws.every((k: string) => k === '')) keywordMatch = true;
        else keywordMatch = kws.some((kw: string) => text.includes(kw.toLowerCase()));

        if (keywordMatch) {
          console.log(`Queuing comment ${comment.id} for automation ${auto.id}`);
          await commentQueue.add('reply', {
            userId: userId,
            automationId: auto.id,
            recipientId: comment.from.id,
            commentId: comment.id,
            mediaId: media.id,
            commenterUsername: comment.from.username,
          }, { delay: queued * 1500 });
          queued++;
          matched = true;
          break; // Don't match multiple automations for same comment
        }
      }

      if (matched) {
        // Match route.ts behavior: claim dedup key for 7 days
        await redis.set(`processed_comment:${comment.id}`, '1', 'EX', 604800, 'NX');
      }
    }
  }

  console.log(`Finished. Queued ${queued} comments.`);
  process.exit(0);
}

run().catch(console.error);
