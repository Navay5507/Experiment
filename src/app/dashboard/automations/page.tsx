import Link from "next/link";
import styles from "../dashboard.module.css";
import { Zap, Play, Pause, Trash2 } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import RetriggerButton from "./RetriggerButton";
import ConfirmForm from "../ConfirmForm";

export const dynamic = 'force-dynamic';

async function toggleAutomation(formData: FormData) {
  "use server";
  const id = formData.get('automationId') as string;
  const currentState = formData.get('currentState') === 'true';
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
  redirect('/dashboard/automations');
}

async function deleteAutomation(formData: FormData) {
  "use server";
  const id = formData.get('automationId') as string;
  await supabase.from('automations').delete().eq('id', id);
  redirect('/dashboard/automations');
}

export default async function AutomationsList() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user } = await supabase.from('users').select('id, plan').eq('clerkId', clerkId).maybeSingle();

  let automations: { id: string; campaign_name?: string; target_type: string; keywords: string | string[]; is_active: boolean; ai_enabled: boolean; follow_gate_enabled: boolean; lead_capture_fields?: string | string[]; instagram_media_id?: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    automations = data || [];
  }

  let recentMedia: any[] = [];
  if (user?.plan && automations.length > 0) {
    const { data: userToken } = await supabase.from('users').select('instagramAccessToken').eq('id', user.id).single();
    if (userToken?.instagramAccessToken) {
      try {
        const resp = await fetch(`https://graph.instagram.com/v21.0/me/media?fields=id,media_url,thumbnail_url,caption&limit=50&access_token=${userToken.instagramAccessToken}`, { next: { revalidate: 60 } });
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
          <Link href="/dashboard/automations/new" className={styles.btnAction} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
            + New Automation
          </Link>
        ) : (
          <Link href="/pricing" className={styles.btnAction} style={{ opacity: 0.5 }}>
            Upgrade to Add More
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {automations.length === 0 ? (
          <div className={styles.emptyState} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Zap size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No automations yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first automation to start converting comments into leads automatically.</p>
            <Link href="/dashboard/automations/new" className={styles.btnAction} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Build Your First Pipeline
            </Link>
          </div>
        ) : (
          automations.map((auto) => {
            const keywords = Array.isArray(auto.keywords) ? auto.keywords.join(', ') : auto.keywords || 'None';
            const isLeadGen = Array.isArray(auto.lead_capture_fields) 
              ? auto.lead_capture_fields.length > 0 
              : !!auto.lead_capture_fields && auto.lead_capture_fields !== '[]' && auto.lead_capture_fields !== 'null';

            const isAllPosts = !auto.instagram_media_id || auto.instagram_media_id.trim() === '';
            const postIds = auto.instagram_media_id ? auto.instagram_media_id.split(',').filter(Boolean) : [];
            const postCount = isAllPosts ? 0 : postIds.length;
            
            let postTargetText = `${postCount} Specific Post${postCount > 1 ? 's' : ''}`;
            if (isAllPosts) {
              if (auto.target_type === 'story') postTargetText = "All Story Replies";
              else if (auto.target_type === 'live') postTargetText = "All Live Broadcasts";
              else postTargetText = "All Posts";
            }
            
            const matchedMedia = postIds.map(id => recentMedia.find(m => m.id === id)).filter(Boolean);

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
                  <RetriggerButton automationId={auto.id} hasMediaId={postIds.length > 0} />
                  <ConfirmForm message={auto.is_active ? "Pause this automation? It will stop responding to new comments." : "Activate this automation?"} action={toggleAutomation}>
                    <input type="hidden" name="automationId" value={auto.id} />
                    <input type="hidden" name="currentState" value={String(auto.is_active)} />
                    <button type="submit" className={styles.btnAction} title={auto.is_active ? "Pause" : "Start"}>
                      {auto.is_active ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </ConfirmForm>
                  <ConfirmForm message="Delete this automation permanently? This cannot be undone." action={deleteAutomation}>
                    <input type="hidden" name="automationId" value={auto.id} />
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
