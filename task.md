# AutoDrop Development Checklist

## Phase 0: Pre-Build Setup
- [ ] Initialize Next.js 15 project (App Router)
- [ ] Set up Supabase project & define initial schema
- [ ] Provision Upstash Redis & BullMQ
- [ ] Set up Clerk for Authentication
- [ ] Register Instagram Developer App & Test Account

## Phase 1: MVP Core (Automation Engine)
- [ ] Build Meta OAuth 2.0 flow
- [ ] Register Instagram webhook endpoint
- [ ] Implement webhook verification
- [ ] Build Node.js / BullMQ workers for DM & Comment reply
- [ ] Implement rate limiting (Free tier)
- [ ] Build User Dashboard (Analytics snapshot)
- [ ] Build "Create Automation" form (Post selection, keyword, reply template)

## Phase 2: Pro Features (Growth & Monetization)
- [ ] Razorpay / Stripe integration & Webhooks
- [ ] Plan enforcement middleware (Free vs Pro)
- [ ] Follow-gate checking logic
- [ ] Lead capture DM flow (Email/Phone)
- [ ] Story & Live Automation webhooks
- [ ] Full Analytics & Leads Dashboard
- [ ] Referral System

## Phase 3: Elite AI (Deferred)
- [ ] Implement `AIProvider` adapter interface
- [ ] Knowledge base storage in Supabase
- [ ] Human review inbox
