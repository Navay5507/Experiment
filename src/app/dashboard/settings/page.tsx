import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "../dashboard.module.css";
import { Link2, Activity, CreditCard, AlertTriangle, Trash, Zap, CheckCircle2 } from "lucide-react";
import ConfirmForm from "../ConfirmForm";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const resolvedSearchParams = await searchParams;
  const activeTab = (resolvedSearchParams.tab as string) || 'connections';

  const { data: user, error } = await supabase.from('users').select('*').eq('clerkId', clerkId).maybeSingle();
  console.log("[SETTINGS PAGE] ClerkId:", clerkId);
  console.log("[SETTINGS PAGE] User Data:", user);
  console.log("[SETTINGS PAGE] Supabase Error:", error);

  // Fetch connected accounts for this user
  let connectedAccounts: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    connectedAccounts = data || [];

    // Self-healing / Backfill: If user has a primary Instagram connection but no connected_accounts rows
    if (connectedAccounts.length === 0 && user.instagramAccessToken && user.instagramUserId && user.instagramHandle) {
      const { data: backfilled } = await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          instagram_access_token: user.instagramAccessToken,
          instagram_user_id: user.instagramUserId,
          instagram_handle: user.instagramHandle,
          instagram_token_expires_at: user.instagramTokenExpiresAt || null,
        })
        .select()
        .single();
      
      if (backfilled) {
        connectedAccounts = [backfilled];
      }
    }
  }

  const maxAccounts = user?.plan === 'PRO' ? 3 : user?.plan === 'ELITE' ? Infinity : 1;
  const isLimitReached = connectedAccounts.length >= maxAccounts;

  async function disconnectAccount(formData: FormData) {
    "use server";
    const accountId = formData.get('accountId') as string;
    const { userId } = await auth();
    if (!userId) return;

    const { data: u } = await supabase.from('users').select('*').eq('clerkId', userId).maybeSingle();
    if (!u) return;

    // Delete from connected_accounts
    await supabase
      .from('connected_accounts')
      .delete()
      .eq('user_id', u.id)
      .eq('instagram_user_id', accountId);

    // If it was the primary account, promote another or nullify
    if (u.instagramUserId === accountId) {
      const { data: remaining } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', u.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (remaining) {
        await supabase
          .from('users')
          .update({
            instagramAccessToken: remaining.instagram_access_token,
            instagramUserId: remaining.instagram_user_id,
            instagramHandle: remaining.instagram_handle,
            instagramTokenExpiresAt: remaining.instagram_token_expires_at,
          })
          .eq('id', u.id);
      } else {
        await supabase
          .from('users')
          .update({
            instagramAccessToken: null,
            instagramUserId: null,
            instagramHandle: null,
            instagramTokenExpiresAt: null,
          })
          .eq('id', u.id);
      }
    }

    redirect('/dashboard/settings?tab=connections');
  }

  async function disconnectInstagram() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const { data: u } = await supabase.from('users').select('id').eq('clerkId', userId).maybeSingle();
    if (u) {
      await supabase.from('connected_accounts').delete().eq('user_id', u.id);
    }
    await supabase.from('users').update({
      instagramAccessToken: null,
      instagramUserId: null,
      instagramHandle: null,
      instagramTokenExpiresAt: null,
    }).eq('clerkId', userId);
    redirect('/dashboard/settings?tab=connections');
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
      await supabase.from('connected_accounts').delete().eq('user_id', u.id);
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
      await supabase.from('analytics_events').delete().eq('user_id', u.id);
    }
    redirect('/dashboard/settings?tab=maintenance');
  }

  async function clearQueue() {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${appUrl}/api/queue/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    redirect('/dashboard/settings?tab=maintenance');
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
           <h1>Application Settings</h1>
           <p>Manage integrations, billing parameters, and security protocols.</p>
        </div>
      </div>

      {/* Tabs Switcher Bar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        padding: '0.4rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '100px',
        maxWidth: 'fit-content',
        backdropFilter: 'blur(10px)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {[
          { id: 'connections', label: 'Connections', icon: Link2 },
          { id: 'subscription', label: 'Subscription', icon: CreditCard },
          { id: 'maintenance', label: 'Maintenance & Diagnostics', icon: Activity },
          { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={`/dashboard/settings?tab=${tab.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                border: '1px solid',
                borderColor: isSelected ? 'rgba(168, 85, 247, 0.4)' : 'transparent',
                color: isSelected ? '#c084fc' : 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'connections' && (
          <div style={{ maxWidth: '650px' }}>
            {/* Meta Integration */}
            <div className={styles.card} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={styles.sectionTitle}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Link2 size={20}/> Instagram Connections</span></div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                   Status: {connectedAccounts.length > 0 ? (
                     <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                       Connected ({connectedAccounts.length}/{maxAccounts === Infinity ? '∞' : maxAccounts})
                     </span>
                   ) : (
                     <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                       Disconnected
                     </span>
                   )}
                 </div>

                 {connectedAccounts.length > 0 ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     {connectedAccounts.map((conn) => {
                       const isPrimary = conn.instagram_user_id === user?.instagramUserId;
                       return (
                         <div key={conn.id} style={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           background: 'var(--surface-hover)',
                           border: '1px solid var(--border)',
                           borderRadius: '8px',
                           padding: '0.75rem',
                         }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                             <span style={{ color: 'var(--text-heading)', fontSize: '0.9rem', fontWeight: 600 }}>@{conn.instagram_handle}</span>
                             {isPrimary && (
                               <span style={{
                                 background: 'rgba(168, 85, 247, 0.15)',
                                 color: '#c084fc',
                                 border: '1px solid rgba(168, 85, 247, 0.3)',
                                 padding: '0.1rem 0.4rem',
                                 borderRadius: '4px',
                                 fontSize: '0.75rem',
                                 fontWeight: 600,
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: '0.2rem'
                               }}>
                                 <CheckCircle2 size={10} /> Primary
                               </span>
                             )}
                           </div>

                           <ConfirmForm message={`Disconnect @${conn.instagram_handle}?`} action={disconnectAccount}>
                             <input type="hidden" name="accountId" value={conn.instagram_user_id} />
                             <button type="submit" style={{
                               background: 'transparent',
                               border: 'none',
                               color: '#ef4444',
                               cursor: 'pointer',
                               opacity: 0.8,
                               display: 'flex',
                               alignItems: 'center',
                               padding: '0.25rem'
                             }} title="Disconnect Account">
                               <Trash size={15} />
                             </button>
                           </ConfirmForm>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Autodrop requires an active Instagram Professional connection to process webhooks.</p>
                 )}
              </div>

              {isLimitReached ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Limit reached for {user?.plan === 'PRO' ? 'Growth Pro' : 'Free Starter'} plan.
                  </p>
                  <Link href="/pricing" className={styles.btnAction} style={{ width: '100%', textAlign: 'center', display: 'block', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc' }}>
                    Upgrade Plan to Connect More
                  </Link>
                </div>
              ) : (
                <a href="/api/auth/instagram" className={styles.btnAction} style={{ width: '100%', textAlign: 'center' }}>
                  {connectedAccounts.length > 0 ? 'Connect Another Account' : 'Connect Instagram'}
                </a>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div style={{ maxWidth: '650px' }}>
            {/* Plan & Billing */}
            <div className={styles.card}>
              <div className={styles.sectionTitle}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><CreditCard size={20}/> Subscription Tier</span></div>
              <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: user?.plan === 'PRO' || user?.plan === 'ELITE' ? 'var(--primary)' : 'var(--text-heading)' }}>
                   {user?.plan === 'PRO' ? 'Growth Pro' : user?.plan === 'ELITE' ? 'Elite AI' : 'Free Starter'}
                 </h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>You currently have access to {user?.plan === 'PRO' || user?.plan === 'ELITE' ? 'Unlimited' : '1'} active automation campaigns.</p>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your plan allows connecting up to {user?.plan === 'PRO' ? '3' : user?.plan === 'ELITE' ? 'Unlimited' : '1'} Instagram account{user?.plan === 'PRO' || user?.plan === 'ELITE' ? 's' : ''}.</p>
              </div>
              <a href="mailto:support@autodrop.in" className={styles.btnAction} style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}>Contact Support</a>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Diagnostics Card */}
              <div className={styles.card}>
                 <div className={styles.sectionTitle} style={{ color: '#f59e0b' }}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Zap size={18}/> Queue & Telemetry</span></div>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Manage backend task queues and dashboard tracking statistics.
                 </p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ConfirmForm message="Clear all pending automation jobs? This will stop any scheduled DMs from being sent." action={clearQueue}>
                      <button type="submit" className={styles.btnAction} style={{ width: '100%', background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                         <Zap size={18} /> Clear Automation Queue
                      </button>
                    </ConfirmForm>
                    <ConfirmForm message="Reset all dashboard stats to zero? This cannot be undone." action={resetStats}>
                      <button type="submit" className={styles.btnAction} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                         <Activity size={18} /> Reset Dashboard Stats
                      </button>
                    </ConfirmForm>
                 </div>
              </div>

              {/* Unlink Services Card */}
              <div className={styles.card}>
                 <div className={styles.sectionTitle} style={{ color: '#ef4444' }}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Link2 size={18}/> Services Reset</span></div>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Instantly disconnect and revoke credentials for all unlinked Instagram accounts.
                 </p>
                 <ConfirmForm message="Disconnect all Instagram accounts? All automations will stop working." action={disconnectInstagram}>
                    <button type="submit" className={styles.btnAction} style={{ width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                       <Link2 size={18} /> Disconnect All Accounts
                    </button>
                 </ConfirmForm>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div style={{ maxWidth: '750px' }}>
            {/* Account Deletion */}
            <div className={styles.card} style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.015)' }}>
              <div className={styles.sectionTitle} style={{ color: '#ef4444', marginBottom: '0.5rem' }}><span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><AlertTriangle size={20}/> Danger Zone</span></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ flex: '1 1 450px' }}>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Delete AutoDrop Account</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                     This action is highly destructive and completely irreversible. It will permanently delete your user profile, subscription parameters, all connected Instagram access tokens, existing automation campaigns, and every lead captured.
                  </p>
                </div>
                <div style={{ flexShrink: 0, width: '100%', maxWidth: '280px' }}>
                   <ConfirmForm 
                     message='To verify account deletion, please type "DELETE MY ACCOUNT" in all-capital letters below:' 
                     promptText="DELETE MY ACCOUNT"
                     action={deleteAccount}
                   >
                     <button type="submit" className={styles.btnAction} style={{ width: '100%', background: '#ef4444', border: '1px solid #ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Trash size={18} /> Delete Account Permanently
                     </button>
                   </ConfirmForm>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
