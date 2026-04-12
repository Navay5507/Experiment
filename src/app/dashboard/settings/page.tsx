import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "../dashboard.module.css";
import { Copy, Link2, Activity, CreditCard, AlertTriangle, Trash, Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const { data: user, error } = await supabase.from('users').select('*').eq('clerkId', clerkId).maybeSingle();
  console.log("[SETTINGS PAGE] ClerkId:", clerkId);
  console.log("[SETTINGS PAGE] User Data:", user);
  console.log("[SETTINGS PAGE] Supabase Error:", error);
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const referralLink = user ? `${domain}/sign-up?ref=${user.id}` : 'Syncing user...';

  async function disconnectInstagram() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    await supabase.from('users').update({
      instagramAccessToken: null,
      instagramUserId: null,
      instagramHandle: null,
    }).eq('clerkId', userId);
    redirect('/dashboard/settings');
  }

  async function deleteAccount() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const { data: u } = await supabase.from('users').select('id').eq('clerkId', userId).maybeSingle();
    if (u) {
      await supabase.from('dm_conversations').delete().eq('user_id', u.id);
      await supabase.from('analytics_events').delete().eq('user_id', u.id);
      await supabase.from('leads').delete().eq('user_id', u.id);
      await supabase.from('automations').delete().eq('user_id', u.id);
      await supabase.from('users').delete().eq('id', u.id);
    }
    redirect('/');
  }

  async function resetStats() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const { data: u } = await supabase.from('users').select('id').eq('clerkId', userId).maybeSingle();
    if (u) {
      // Clear analytics tracing logs to bring dashboard metrics down to 0
      await supabase.from('analytics_events').delete().eq('user_id', u.id);
    }
    redirect('/dashboard');
  }

  async function clearQueue() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    // Call internal API to flush BullMQ queues
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${appUrl}/api/queue/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    redirect('/dashboard/settings');
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
           <h1>Application Settings</h1>
           <p>Manage integrations, billing parameters, and security protocols.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
         
         {/* Plan & Billing */}
         <div className={styles.card}>
            <div className={styles.sectionTitle}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><CreditCard size={20}/> Subscription Tier</span></div>
            <div style={{ marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: user?.plan === 'PRO' || user?.plan === 'ELITE' ? 'var(--primary)' : '#fff' }}>
                 {user?.plan === 'PRO' ? 'Growth Pro' : user?.plan === 'ELITE' ? 'Elite AI' : 'Free Starter'}
               </h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You currently have access to {user?.plan === 'PRO' || user?.plan === 'ELITE' ? 'Unlimited' : '1'} active automation campaigns.</p>
            </div>
            <a href="https://forms.gle/nu3PBCRRNQDs1DoT6" target="_blank" rel="noopener noreferrer" className={styles.btnAction} style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}>Contact Support</a>
         </div>

         {/* Meta Integration */}
         <div className={styles.card}>
            <div className={styles.sectionTitle}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Link2 size={20}/> Instagram Connection</span></div>
            <div style={{ marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 Status: {user?.instagramAccessToken ? <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Connected</span> : <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Disconnected</span>}
               </div>
               {user?.instagramHandle && (
                 <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>@{user.instagramHandle}</p>
               )}
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Autodrop requires an active Instagram Professional connection to process webhooks.</p>
            </div>
            <a href="/api/auth/instagram" className={styles.btnAction} style={{ width: '100%', textAlign: 'center' }}>
               {user?.instagramAccessToken ? 'Refresh Connection' : 'Connect Instagram'}
            </a>
         </div>

         {/* Referrals */}
         <div className={styles.card} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
               <div className={styles.sectionTitle} style={{ marginBottom: 0 }}>Partner Referral</div>
               <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', fontWeight: 600 }}>
                  Soon
               </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
               Our affiliate program is currently in development. Soon you&apos;ll be able to invite friends and earn recurring revenue.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', opacity: 0.5, pointerEvents: 'none' }}>
               <input type="text" readOnly value={`https://autodrop.co/r/coming-soon`} style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }} />
               <button className={styles.btnAction} style={{ padding: '0.75rem 1rem' }} disabled><Copy size={18} /></button>
            </div>
         </div>

         {/* Danger Zone */}
         <div className={styles.card} style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.02)' }}>
            <div className={styles.sectionTitle} style={{ color: '#ef4444' }}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><AlertTriangle size={20}/> Danger Zone</span></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
               Destructive actions that will halt all automation pipelines.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <form action={clearQueue}>
                 <button type="submit" className={styles.btnAction} style={{ width: '100%', background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Zap size={18} /> Clear Automation Queue
                 </button>
               </form>
               <form action={disconnectInstagram}>
                 <button type="submit" className={styles.btnAction} style={{ width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Link2 size={18} /> Disconnect Instagram
                 </button>
               </form>
               <form action={resetStats}>
                 <button type="submit" className={styles.btnAction} style={{ width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Activity size={18} /> Reset Dashboard Stats
                 </button>
               </form>
               <form action={deleteAccount}>
                 <button type="submit" className={styles.btnAction} style={{ width: '100%', background: '#ef4444', border: '1px solid #ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Trash size={18} /> Delete Account Permanently
                 </button>
               </form>
            </div>
         </div>
         
      </div>
    </div>
  );
}
