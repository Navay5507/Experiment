import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    for (let line of envFile.split('\n')) {
      line = line.replace('\r', '').trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split('=');
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  }
} catch (e) {
  console.error('Failed to load .env.local:', e);
}

import { supabase } from '../src/lib/supabase';

async function findUserByInstagramId(igId: string) {
  // 1. Fetch all primary credentials from users table
  const { data: users } = await supabase
    .from('users')
    .select('id, instagramUserId, instagramAccessToken, plan')
    .not('instagramAccessToken', 'is', null);

  // 2. Fetch all extra credentials from connected_accounts table
  const { data: conns } = await supabase
    .from('connected_accounts')
    .select('user_id, instagram_user_id, instagram_access_token');

  // Build a list of unique account credentials to check
  const accountsToVerify = [];

  if (users) {
    for (const u of users) {
      accountsToVerify.push({
        userId: u.id,
        instagramUserId: u.instagramUserId,
        instagramAccessToken: u.instagramAccessToken,
        plan: u.plan,
        primaryInstagramUserId: u.instagramUserId,
        source: 'primary'
      });
    }
  }

  if (conns) {
    for (const c of conns) {
      const userPlan = users?.find(u => u.id === c.user_id)?.plan || 'FREE';
      const primaryId = users?.find(u => u.id === c.user_id)?.instagramUserId || null;

      accountsToVerify.push({
        userId: c.user_id,
        instagramUserId: c.instagram_user_id,
        instagramAccessToken: c.instagram_access_token,
        plan: userPlan,
        primaryInstagramUserId: primaryId,
        source: 'connected_account'
      });
    }
  }

  console.log(`[Webhook] Verifying owners for IG ID ${igId} across ${accountsToVerify.length} connected accounts...`);

  // 3. Try to verify which token owns the webhook's igId (Business ID)
  // by calling Graph API /me endpoint for each token
  for (const acc of accountsToVerify) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=user_id,id&access_token=${acc.instagramAccessToken}`
      );
      const data: any = await res.json();
      console.log(`Connection @${acc.instagramUserId} Graph API response:`, JSON.stringify(data));
      
      // If the webhook's entry.id matches either the user_id (Business ID) or id (App-scoped ID)
      if (
        data.user_id === igId || 
        data.id === igId || 
        String(data.user_id) === igId || 
        String(data.id) === igId
      ) {
        console.log(`[Webhook] Verified user ${acc.userId} owns IG ID ${igId} via Graph API connection (@${acc.instagramUserId})`);
        return {
          id: acc.userId,
          instagramUserId: acc.instagramUserId,
          instagramAccessToken: acc.instagramAccessToken,
          plan: acc.plan,
          primaryInstagramUserId: acc.primaryInstagramUserId,
        };
      }
    } catch (e) {
      console.warn(`[Webhook] Failed to verify token for connection ${acc.instagramUserId}:`, e);
    }
  }

  // 4. Fallback: if we couldn't verify, try exact match on ID
  const exactUser = users?.find(u => u.instagramUserId === igId);
  if (exactUser) {
    console.log('[Webhook] Fallback match on primary users table');
    return {
      ...exactUser,
      primaryInstagramUserId: exactUser.instagramUserId,
    };
  }

  const exactConn = conns?.find(c => c.instagram_user_id === igId);
  if (exactConn) {
    console.log('[Webhook] Fallback match on connected_accounts table');
    const parentUser = users?.find(u => u.id === exactConn.user_id);
    return {
      id: exactConn.user_id,
      instagramUserId: exactConn.instagram_user_id,
      instagramAccessToken: exactConn.instagram_access_token,
      plan: parentUser?.plan || 'FREE',
      primaryInstagramUserId: parentUser?.instagramUserId || null,
    };
  }

  return null;
}

async function run() {
  const user = await findUserByInstagramId('17841478750484740');
  console.log('Final matched user:', JSON.stringify(user, null, 2));
}

run();
