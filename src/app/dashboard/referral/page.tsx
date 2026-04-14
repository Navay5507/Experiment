import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "../dashboard.module.css";
import { Gift, Users, CheckCircle2, Clock, Copy, Share2 } from "lucide-react";
import CopyButton from "./CopyButton";

export const dynamic = 'force-dynamic';

export default async function ReferralPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user } = await supabase.from('users').select('*').eq('clerkId', clerkId).maybeSingle();
  const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const referralLink = user?.referral_code ? `${domain}/sign-up?ref=${user.referral_code}` : '';

  // Fetch referral data
  let referrals: any[] = [];
  let stats = { total: 0, pending: 0, completed: 0 };
  if (user) {
    const { data: refs } = await supabase
      .from('referrals')
      .select('*, referred_user:referred_user_id(email, name, plan)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });
    if (refs) {
      referrals = refs;
      stats = {
        total: refs.length,
        pending: refs.filter(r => r.status === 'pending').length,
        completed: refs.filter(r => r.status === 'completed').length,
      };
    }
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
           <h1>🎁 Referral Program</h1>
           <p>Invite friends and earn free Pro days when they upgrade.</p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className={styles.card} style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Share2 size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Your Referral Link</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Share this link with friends. When they sign up and <strong style={{ color: '#10b981' }}>purchase Pro</strong>, you get <strong style={{ color: '#10b981' }}>7 days of Pro free</strong>!
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            readOnly
            value={referralLink || 'Generating...'}
            style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.85rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' }}
          />
          <CopyButton text={referralLink} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <Users size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stats.total}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total Referrals</div>
        </div>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <Clock size={24} color="#eab308" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#eab308', lineHeight: 1 }}>{stats.pending}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Pending</div>
        </div>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{stats.completed}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Rewarded</div>
        </div>
      </div>

      {/* How it works */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem' }}>How it works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>1</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Share your link</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Send your unique referral link to friends & followers.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: '50%', background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#eab308' }}>2</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>They sign up</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your friend creates an account — referral tracked as pending.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>3</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>They go Pro</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>When they purchase Pro, you get 7 days of Pro free!</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className={styles.card}>
        <h3 style={{ marginBottom: '1rem' }}>Referral History</h3>
        {referrals.length === 0 ? (
          <div className={styles.emptyState}>
            <Gift size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No referrals yet</h3>
            <p>Share your link above to start earning rewards!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {referrals.map((ref: any) => (
              <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {(ref.referred_user as any)?.email || 'User'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(ref.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600,
                  background: ref.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
                  color: ref.status === 'completed' ? '#10b981' : '#eab308',
                  border: `1px solid ${ref.status === 'completed' ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}`
                }}>
                  {ref.status === 'completed' ? '✅ Rewarded' : '⏳ Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
