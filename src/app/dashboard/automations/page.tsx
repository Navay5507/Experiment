import Link from "next/link";
import styles from "../dashboard.module.css";
import { Zap, Play, Pause, Trash2 } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import RetriggerButton from "./RetriggerButton";
import ConfirmForm from "../ConfirmForm";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function toggleAutomation(formData: FormData) {
  "use server";
  const id = formData.get('automationId') as string;
  const currentState = formData.get('currentState') === 'true';
  const activeAccount = formData.get('activeAccount') as string;
  const { userId } = await auth();
  if (!userId) return;

  const { data: user } = await supabase.from('users').select('id, plan').eq('clerkId', userId).single();
  if (!user) return;
  
  if (!currentState && user.plan === 'FREE') {
    const { count } = await supabase
      .from('automations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if ((count || 0) >= 1) {
      redirect('/dashboard/automations?error=limit_reached');
    }
  }

  await supabase.from('automations').update({ is_active: !currentState }).eq('id', id);
  redirect(activeAccount ? `/dashboard/automations?account=${activeAccount}` : '/dashboard/automations');
}

async function deleteAutomation(formData: FormData) {
  "use server";
  const id = formData.get('automationId') as string;
  const activeAccount = formData.get('activeAccount') as string;
  await supabase.from('automations').delete().eq('id', id);
  redirect(activeAccount ? `/dashboard/automations?account=${activeAccount}` : '/dashboard/automations');
}

export default async function AutomationsList({ searchParams }: PageProps) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const resolvedSearchParams = await searchParams;
  const activeAccountId = resolvedSearchParams.account as string | undefined;

  const { data: user } = await supabase.from('users').select('*').eq('clerkId', clerkId).maybeSingle();

  // Fetch connected accounts
  let connectedAccounts: any[] = [];
  if (user) {
    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    connectedAccounts = data || [];

    // Self-healing / Backfill
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

  // Resolve target account
  const defaultAccountId = user?.instagramUserId || connectedAccounts[0]?.instagram_user_id;
  const selectedAccountId = activeAccountId || defaultAccountId;

  let automations: any[] = [];
  if (user) {
    let query = supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id);

    if (selectedAccountId) {
      // If the selected account is the primary account, match both that ID and legacy null values
      if (selectedAccountId === user.instagramUserId) {
        query = query.or(`instagram_user_id.eq.${selectedAccountId},instagram_user_id.is.null`);
      } else {
        query = query.eq('instagram_user_id', selectedAccountId);
      }
    }

    const { data } = await query.order('created_at', { ascending: false });
    automations = data || [];
  }

  let recentMedia: any[] = [];
  if (user?.plan && automations.length > 0 && selectedAccountId) {
    const activeAccount = connectedAccounts.find(c => c.instagram_user_id === selectedAccountId);
    const activeToken = activeAccount ? activeAccount.instagram_access_token : user.instagramAccessToken;

    if (activeToken) {
      try {
        const resp = await fetch(`https://graph.instagram.com/v21.0/me/media?fields=id,media_url,thumbnail_url,caption&limit=50&access_token=${activeToken}`, { next: { revalidate: 60 } });
        const j = await resp.json();
        recentMedia = j.data || [];
      } catch (e) {
        console.error('Failed to fetch recent media', e);
      }
    }
  }

  const activeAutomations = automations.filter(a => a.is_active);
  const automationLimit = user?.plan === 'FREE' ? 1 : Infinity;
  const canCreate = user?.plan === 'PRO' || user?.plan === 'ELITE' || activeAutomations.length < automationLimit;

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
          <h1>Your Automations</h1>
          <p>Manage your active Instagram engagement pipelines.</p>
        </div>
        {canCreate ? (
          <Link href={selectedAccountId ? `/dashboard/automations/new?account=${selectedAccountId}` : "/dashboard/automations/new"} className={styles.btnAction} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
            + New Automation
          </Link>
        ) : (
          <Link href="/pricing" className={styles.btnAction} style={{ opacity: 0.5 }}>
            Upgrade to Add More
          </Link>
        )}
      </div>

      {/* Account Switcher tab bar */}
      {connectedAccounts.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          padding: '0.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {connectedAccounts.map((conn) => {
            const isSelected = conn.instagram_user_id === selectedAccountId;
            return (
              <Link
                key={conn.id}
                href={`/dashboard/automations?account=${conn.instagram_user_id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
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
                <span style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  background: isSelected ? '#a855f7' : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                }}></span>
                @{conn.instagram_handle}
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {automations.length === 0 ? (
          <div className={styles.emptyState} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Zap size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No automations yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first automation to start converting comments into leads automatically.</p>
            <Link href={selectedAccountId ? `/dashboard/automations/new?account=${selectedAccountId}` : "/dashboard/automations/new"} className={styles.btnAction} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Build Your First Pipeline
            </Link>
          </div>
        ) : (
          automations.map((auto) => {
            const keywords = Array.isArray(auto.keywords) ? auto.keywords.join(', ') : auto.keywords || 'None';
            const isAllPosts = !auto.instagram_media_id || auto.instagram_media_id.trim() === '';
            const postIds = auto.instagram_media_id ? auto.instagram_media_id.split(',').filter(Boolean) : [];
            const postCount = isAllPosts ? 0 : postIds.length;
            
            let postTargetText = `${postCount} Specific Post${postCount > 1 ? 's' : ''}`;
            if (isAllPosts) {
              if (auto.target_type === 'story') postTargetText = "All Story Replies";
              else if (auto.target_type === 'dm') postTargetText = "DM Keywords";
              else postTargetText = "All Posts";
            }
            
            const matchedMedia = postIds.map((id: string) => recentMedia.find(m => m.id === id)).filter(Boolean);

            return (
              <div key={auto.id} className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: 60, height: 60, flexShrink: 0, background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: auto.is_active ? 'var(--primary)' : 'var(--text-muted)' }}>
                  <Zap size={24} />
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 'min-content' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                      {auto.campaign_name || 'Unnamed Campaign'}
                    </h3>
                    <span style={{
                      background: auto.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                      color: auto.is_active ? '#10b981' : 'var(--text-muted)',
                      padding: '0.2rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                    }}>
                      {auto.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Keywords: <span style={{ color: '#fff' }}>{keywords}</span>
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Target: <span style={{ color: '#fff' }}>{postTargetText}</span>
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, background: '#a855f7', borderRadius: '50%' }}></span>
                    Anti-Ban Engine: <span style={{ color: '#a855f7', fontWeight: 600 }}>Active (Spintax Replies)</span>
                  </p>
                  {matchedMedia.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {matchedMedia.slice(0, 5).map((m: any) => (
                        <div key={m.id} style={{ position: 'relative', width: 44, height: 44, borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={m.thumbnail_url || m.media_url} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginTop: 'auto' }}>
                  <RetriggerButton automationId={auto.id} hasMediaId={postIds.length > 0} targetType={auto.target_type} />
                  <ConfirmForm message={auto.is_active ? "Pause this automation? It will stop responding to new comments." : "Activate this automation?"} action={toggleAutomation}>
                    <input type="hidden" name="automationId" value={auto.id} />
                    <input type="hidden" name="currentState" value={String(auto.is_active)} />
                    <input type="hidden" name="activeAccount" value={selectedAccountId || ''} />
                    <button type="submit" className={styles.btnAction} title={auto.is_active ? "Pause" : "Start"}>
                      {auto.is_active ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </ConfirmForm>
                  <ConfirmForm message="Delete this automation permanently? This cannot be undone." action={deleteAutomation}>
                    <input type="hidden" name="automationId" value={auto.id} />
                    <input type="hidden" name="activeAccount" value={selectedAccountId || ''} />
                    <button type="submit" className={styles.btnAction} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </ConfirmForm>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
