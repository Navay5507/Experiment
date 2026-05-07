# Autodrop — Complete Testing & Deployment Guide

> This guide walks you through testing every part of Autodrop, from your local machine all the way to a live Instagram integration. Follow each phase in order.

---

## Phase 0: Prerequisites Checklist

Before you begin, make sure you have accounts on all of these (all free tiers work):

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Clerk** | User login/signup | [clerk.com](https://clerk.com) |
| **Supabase** | Database | [supabase.com](https://supabase.com) |
| **Meta Developer** | Instagram API | [developers.facebook.com](https://developers.facebook.com) |
| **Upstash** | Redis for BullMQ workers | [upstash.com](https://upstash.com) |
| **Vercel** | Hosting (free) | [vercel.com](https://vercel.com) |
| **Stripe** | Billing (test mode) | [stripe.com](https://stripe.com) |

> [!NOTE]
> You already have Clerk, Supabase, Meta, and Upstash set up based on your `.env.local`.

---

## Phase 1: Local Testing (No Domain Needed)

### 1.1 Start the Dev Server

```powershell
cd d:\autodrop\autodrop-web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 1.2 Test Landing Page

| What to Check | Expected Result |
|---------------|----------------|
| Landing page loads | Beautiful dark UI with animations |
| "Get Started" button | Redirects to Clerk sign-in |
| Pricing link in navbar | Opens `/pricing` page with currency auto-detection |
| Support link | Opens `/support` with Calendly embed |
| Logo click | Returns to landing page from any page |

### 1.3 Test Authentication (Clerk)

| What to Check | Expected Result |
|---------------|----------------|
| Click "Get Started" | Clerk sign-in modal appears |
| Sign up with email | Account created, redirected to `/dashboard` |
| Sign out | Returns to landing page |
| Sign in again | Goes straight to dashboard |
| Landing page shows "Dashboard" instead of "Get Started" when logged in | ✅ |

> [!IMPORTANT]
> After your first sign-up, check your **Supabase** → Table Editor → `users` table. You should see a new row with your `clerk_id`. If the row is missing, your Clerk Webhook is not set up yet (that's fine for local testing — we handle it with a fallback).

### 1.4 Test Dashboard Pages

Navigate through each sidebar link and verify:

| Page | URL | What to Check |
|------|-----|---------------|
| Overview | `/dashboard` | Shows metric cards (all zeros is fine), live feed area |
| Automations | `/dashboard/automations` | Shows empty state with "Create" button |
| CRM Leads | `/dashboard/leads` | Shows empty state |
| System Logs | `/dashboard/logs` | Shows empty state |
| Setup & Policy | `/dashboard/settings` | Shows Instagram connection button + danger zone |
| Support | `/support` | Shows Calendly embed |

### 1.5 Test Automation Builder (Without Instagram Connected)

1. Go to `/dashboard/automations` → Click **"Create New Automation"**
2. Walk through all 5 steps:

| Step | What to Test |
|------|-------------|
| **Step 1** — Type | Click Post/Reel, Story Reply, Live Comments. Each should show different UI. Posts section should show "No posts available" with manual media ID fallback |
| **Step 2** — Keywords | Type `link, price, info`. Commas separate keywords |
| **Step 3** — Reply Template | Type any reply text. Toggle the AI Engine button |
| **Step 4** — DM Config | Select Standard Link / Follow-Gate / Lead Capture. Each shows different UI. Try selecting lead capture fields (Email, Phone, Name, etc.) |
| **Step 5** — Review | Shows a summary of all settings. Click "Turn On Pipeline" |

> [!NOTE]
> The automation will be saved to Supabase even without Instagram connected. Check `automations` table to verify the insert worked.

### 1.6 Test Database (Supabase SQL Editor)

Go to your Supabase dashboard → **SQL Editor** and run:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables: `analytics_events`, `automations`, `dm_conversations`, `leads`, `referrals`, `users`

If `dm_conversations` or the `metadata` column on `analytics_events` is missing, run the migration:

```sql
-- Paste the contents of supabase/migration_v2.sql and click Run
```

The migration file is at: [migration_v2.sql](file:///d:/autodrop/autodrop-web/supabase/migration_v2.sql)

---

## Phase 2: Instagram Connection (Local)

### 2.1 Meta Developer App Setup

Go to [developers.facebook.com](https://developers.facebook.com) → Your App → **Instagram API with Instagram Login**

**App Settings → Basic:**
- App Domains: `localhost` (for testing)
- Privacy Policy URL: `https://example.com/privacy` (placeholder is fine for dev)
- Terms of Service URL: `https://example.com/terms`

**Instagram API with Instagram Login → Step 2 (Permissions):**
Make sure these are added:
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `pages_messaging`
- `pages_show_list`

### 2.2 Set Up Instagram Business Login (Meta Console Step 4)

In the Meta Developer Console, under **Instagram API with Instagram Login**, click **Step 4 — "Set up"** and fill in:

| Field | Value (Local Testing) | Value (After Vercel Deploy) |
|-------|----------------------|---------------------------|
| **Valid OAuth Redirect URIs** | `http://localhost:3000/api/auth/meta/callback` | Also add: `https://your-app-name.vercel.app/api/auth/meta/callback` |
| **Deauthorize Callback URL** | `http://localhost:3000/api/auth/meta/callback` | Same as above |
| **Data Deletion Request URL** | `http://localhost:3000/api/auth/meta/callback` | Same as above |

After saving, do these two things:

1. **App Mode** — Keep it on **"Development"** at the top of the page (this is fine for testing)
2. **Add yourself as a Test User** — Go to the left sidebar → **App Roles** → **Roles** → Add your own Facebook/Instagram account as a tester. Accept the invitation from your Facebook account notifications

> [!IMPORTANT]
> You MUST add yourself as a test user AND accept the invitation before the OAuth flow will work. Without this, Facebook will block the login with a "Login Error".

### 2.3 Test Instagram OAuth (Local)

1. Go to Dashboard → Settings → Click **"Connect Instagram"**
2. This opens: `https://www.facebook.com/v21.0/dialog/oauth?client_id=YOUR_META_APP_ID&redirect_uri=http://localhost:3000/api/auth/meta/callback&scope=...`
3. Authorize your Instagram Business/Creator account
4. You should be redirected back to `/dashboard?success=instagram_connected`

**Verify in Supabase:**
```sql
SELECT instagram_handle, instagram_user_id, instagram_access_token 
FROM users 
WHERE clerk_id = 'YOUR_CLERK_ID';
```

All three fields should now have values.

> [!WARNING]
> You need an **Instagram Business** or **Creator** account connected to a **Facebook Page**. Personal Instagram accounts will NOT work with the API.

### 2.4 Test Post Loading

After connecting Instagram:
1. Go to Create Automation → Step 1 → Select "Post / Reel"
2. Your actual Instagram posts should load as a grid with thumbnails
3. Click posts to select them (blue border appears)

If posts don't load, check the browser console (F12) for errors. Common issues:
- Token expired → Re-connect Instagram from Settings
- Not a business account → Convert your account in Instagram app settings

---

## Phase 3: Deploy to Vercel (Get a Public URL)

> [!IMPORTANT]
> This step is **required** before you can test webhooks, because Meta needs a public HTTPS URL to send events to.

### 3.1 Push Code to GitHub

```powershell
cd d:\autodrop\autodrop-web
git init
git add .
git commit -m "Autodrop v2 - Production Ready"
```

Then create a new repo on [github.com](https://github.com/new) and push:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/autodrop-web.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Click **"Add New Project"**
2. Import your GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. **Environment Variables** → Add ALL of these:

```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://krwzghlcgjmbpmcfthpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bWVldC1qZW5uZXQtMTYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_EgtNNnY3rb5NyOBrH9CbLp8FVGKgFamFasovc63SD4
CLERK_WEBHOOK_SECRET=
META_APP_ID=1239200231699136
META_APP_SECRET=6904b8f6eece2becb3d0d4fcdef91bcb
META_WEBHOOK_VERIFY_TOKEN=autodrop_wh_v2_s3cur3_2026
REDIS_URL=rediss://default:...@mint-chigger-85422.upstash.io:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
OPENAI_API_KEY=sk-proj-...
```

5. Click **Deploy**
6. In ~60 seconds, you'll get a URL like: `https://autodrop-web.vercel.app`

### 3.3 Post-Deploy Configuration Updates

After deploying, update these settings:

**Clerk Dashboard** → Settings → Paths:
- Add `https://your-app-name.vercel.app` to allowed redirect URLs

**Meta Developer Console** → Instagram API → Settings:
- Valid OAuth Redirect URIs: `https://your-app-name.vercel.app/api/auth/meta/callback`

**Vercel Dashboard** → Settings → Environment Variables:
- Update `NEXT_PUBLIC_APP_URL` to `https://your-app-name.vercel.app`
- Redeploy after changing

---

## Phase 4: Webhook Testing (Requires Vercel Deploy)

### 4.1 Configure Meta Webhooks

Go to **Meta Developer Console** → Your App → **Webhooks** (or Instagram API → Step 3):

| Field | Value |
|-------|-------|
| **Callback URL** | `https://your-app-name.vercel.app/api/webhooks/instagram` |
| **Verify Token** | `autodrop_wh_v2_s3cur3_2026` |

Click **"Verify and Save"**. You should see a green checkmark ✅.

> [!TIP]
> If verification fails, check your Vercel deployment logs at `https://vercel.com/your-project/deployments`. The webhook GET handler at `/api/webhooks/instagram` must return the challenge token.

### 4.2 Subscribe to Instagram Events

After verification succeeds, subscribe to these webhook fields:

| Object | Fields to Subscribe |
|--------|-------------------|
| `instagram` | `comments`, `messages` |

Click the **"Subscribe"** button next to each field.

### 4.3 Test Webhook With Meta's Test Tool

In the Webhooks section, Meta provides a **"Test"** button. Click it to send a sample event. Check your Vercel logs to see if the webhook was received:

```
Vercel Dashboard → Your Project → Deployments → Latest → Functions tab → api/webhooks/instagram
```

You should see `[Webhook] Received event` in the logs.

---

## Phase 5: End-to-End Live Test

### 5.1 The Complete Flow

```mermaid
sequenceDiagram
    participant User as Instagram User
    participant IG as Instagram
    participant Meta as Meta Webhooks
    participant App as Autodrop (Vercel)
    participant DB as Supabase
    participant Redis as BullMQ/Redis
    
    User->>IG: Comments "link" on your post
    IG->>Meta: Webhook event fired
    Meta->>App: POST /api/webhooks/instagram
    App->>DB: Log analytics_event (comment_matched)
    App->>Redis: Queue comment reply job
    App->>Redis: Queue DM send job
    Redis->>App: Worker processes jobs
    App->>IG: Reply to comment publicly
    App->>IG: Send DM with "Send me the link" button
    User->>IG: Taps "Send me the link"
    IG->>Meta: Quick reply webhook
    Meta->>App: POST with GET_LINK payload
    App->>IG: Sends the link (or follow-gate/lead capture)
    App->>DB: Log lead + analytics
```

### 5.2 Test Steps

1. **Create an automation** in your dashboard:
   - Target: Post/Reel
   - Keywords: `link`
   - Reply: `Check your DM! 👀`
   - DM Type: Standard Link
   - URL: `https://google.com` (test URL)
   - Activate it

2. **Comment on your own Instagram post** from a **different account** (or have a friend comment):
   - Comment: `link`

3. **Watch the magic happen:**
   - Public reply appears under the comment
   - DM arrives in the commenter's inbox with a "Send me the link" button
   - Tapping the button delivers the link

4. **Check your dashboard:**
   - Overview → metrics should update (Comments Matched: 1, DMs Sent: 1)
   - System Logs → should show `comment_matched` and `dm_dispatched` events

### 5.3 Test Follow-Gate (Pro Feature)

1. Create a new automation with **Follow-Gate** selected
2. Comment the keyword from a different account
3. The DM flow should be:
   - Initial DM → "Send me the link" button
   - User taps → Gets "Visit Profile" and "I'm Following" buttons
   - User taps "I'm Following" → System verifies → Sends link (or rejection)

### 5.4 Test Lead Capture (Pro Feature)

1. Create automation with **Lead Capture** → Select Email + Phone
2. Comment keyword from different account
3. DM flow:
   - Initial DM → "Send me the link" button
   - User taps → "Please provide your Email Address"
   - User replies with email → Validated → "Please provide your Phone Number"
   - User replies with phone → Validated → Link delivered
4. Check `/dashboard/leads` → New lead row should appear
5. Test CSV export from the leads page

---

## Phase 6: Stripe Billing Test

### 6.1 Set Up Stripe Test Mode

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → Make sure **Test Mode** is toggled ON
2. Create two Products:
   - **Growth Pro** — Monthly ($29) and Annual ($278)
   - **Elite AI** — Monthly ($99) and Annual ($950)
3. Copy each Price ID (starts with `price_`) into your code where needed

### 6.2 Test Checkout

1. Go to `/pricing` → Click "Upgrade to Pro"
2. You should be redirected to Stripe Checkout
3. Use test card: `4242 4242 4242 4242` with any future date and CVC
4. After payment, user's `plan_tier` should update in Supabase

> [!TIP]
> Stripe test cards: 
> - Success: `4242 4242 4242 4242`
> - Decline: `4000 0000 0000 0002`
> - 3D Secure: `4000 0027 6000 3184`

---

## Phase 7: Clerk Webhook (User Sync)

### 7.1 Set Up Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Webhooks → Add Endpoint
2. URL: `https://your-app-name.vercel.app/api/webhooks/clerk`
3. Events to subscribe: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → Add to Vercel as `CLERK_WEBHOOK_SECRET`
5. Redeploy

### 7.2 Test

1. Sign up as a new user
2. Check Supabase `users` table → Should have a new row automatically
3. Delete the user from Clerk Dashboard
4. Check Supabase → User, automations, leads, dm_conversations should all be deleted (cascade)

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| **"No posts available"** in automation builder | Connect Instagram from Settings. Must be Business/Creator account |
| **Webhook verification fails** | Check `META_WEBHOOK_VERIFY_TOKEN` matches in both Meta console and `.env.local` |
| **DMs not sending** | Check Vercel logs. Usually a token expiry — re-connect Instagram |
| **Rate limited** | Free plan = 50 DMs/month. Upgrade to Pro or wait for reset |
| **Redis connection error** | Check `REDIS_URL` in env vars. Upstash dashboard shows connection status |
| **Clerk user not in Supabase** | Clerk webhook not set up. The app has a fallback, but set up the webhook for production |
| **Build fails on Vercel** | Run `npx tsc --noEmit` locally first. Should show 0 errors |
| **CSS looks broken** | Clear `.next` folder: `Remove-Item .next -Recurse -Force` then `npm run dev` |

---

## Environment Variables Reference

| Variable | Where to Get It | Required? |
|----------|----------------|-----------|
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys | ✅ Yes |
| `CLERK_SECRET_KEY` | Clerk → API Keys | ✅ Yes |
| `CLERK_WEBHOOK_SECRET` | Clerk → Webhooks → Signing Secret | For production |
| `META_APP_ID` | Meta → App Settings → Basic | ✅ Yes |
| `META_APP_SECRET` | Meta → App Settings → Basic | ✅ Yes |
| `META_WEBHOOK_VERIFY_TOKEN` | You make this up (any string) | ✅ Yes |
| `REDIS_URL` | Upstash → Database → Connect | ✅ Yes |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys | For billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → Signing Secret | For billing |
| `OPENAI_API_KEY` | OpenAI → API Keys | For Elite AI only |

---

> [!CAUTION]
> **Before going fully live**, submit your Meta App for **App Review** with these permissions: `instagram_manage_comments`, `instagram_manage_messages`, `pages_messaging`. Without review, the app only works for accounts listed as test users in your Meta App's Roles settings.
