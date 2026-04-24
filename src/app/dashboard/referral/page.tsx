import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import styles from "../dashboard.module.css";
import { Gift, Users, CheckCircle2, Clock, Share2, Wallet, AlertCircle } from "lucide-react";
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
  let withdrawals: any[] = [];
  let stats = { total: 0, pending: 0, completed: 0, earned: 0, withdrawn: 0, available: 0 };
  
  if (user) {
    const { data: refs } = await supabase
      .from('referrals')
      .select('*, referred_user:referred_user_id(email, name, plan)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    const { data: wds } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false });

    if (wds) withdrawals = wds;

    if (refs) {
      referrals = refs;
      const totalEarned = refs.filter(r => r.status === 'completed').reduce((sum, r) => sum + Number(r.earned_amount || 0), 0);
      const totalWithdrawn = withdrawals.filter(w => w.status !== 'rejected').reduce((sum, w) => sum + Number(w.amount || 0), 0);

      stats = {
        total: refs.length,
        pending: refs.filter(r => r.status === 'pending').length,
        completed: refs.filter(r => r.status === 'completed').length,
        earned: totalEarned,
        withdrawn: totalWithdrawn,
        available: totalEarned - totalWithdrawn
      };
    }
  }

  async function saveUpiId(formData: FormData) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    const upiId = formData.get('upi_id') as string;
    await supabase.from('users').update({ upi_id: upiId.trim() }).eq('clerkId', userId);
    redirect('/dashboard/referral');
  }

  async function requestWithdrawal() {
    "use server";
    const { userId } = await auth();
    if (!userId || !user?.upi_id || stats.available <= 0) return;
    
    await supabase.from('withdrawals').insert({
      affiliate_id: user.id,
      amount: stats.available,
      status: 'pending',
      payout_method: 'upi',
      payout_details: user.upi_id
    });
    redirect('/dashboard/referral');
  }

  return (
    <div className={styles.content}>
      <div className={styles.titleArea}>
        <div>
           <h1>🎁 Referral Program</h1>
           <p>Invite friends and earn 25% recurring commission for a year.</p>
        </div>
      </div>

      {/* Important Notice */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <AlertCircle size={20} color="#eab308" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: '#eab308' }}>Payout Policy:</strong> Commission payouts are processed <strong style={{ color: '#fff' }}>1 month after</strong> the referred user&apos;s payment. This ensures the transaction is confirmed and non-refundable. Payouts will be directly transferred to your saved UPI ID.
        </div>
      </div>

      {/* Referral Link Card */}
      <div className={styles.card} style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Share2 size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Your Referral Link</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Share this link with friends. When they sign up and <strong style={{ color: '#10b981' }}>purchase Pro</strong>, you earn <strong style={{ color: '#10b981' }}>25% of their payment every month for 1 year</strong>!
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
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
        <div className={styles.card} style={{ textAlign: 'center', background: 'linear-gradient(to bottom, rgba(16,185,129,0.1), transparent)' }}>
          <CheckCircle2 size={24} color="#10b981" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>₹{stats.earned}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Total Earned</div>
        </div>
        <div className={styles.card} style={{ textAlign: 'center', background: 'linear-gradient(to bottom, rgba(59,130,246,0.1), transparent)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <Wallet size={24} color="#3b82f6" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>₹{stats.available}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Available to Withdraw</div>
        </div>
      </div>

      {/* Google Pay / UPI Payout */}
      <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Wallet size={20} color="#10b981" />
          <h3 style={{ margin: 0 }}>Payout Method</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Enter your Google Pay / UPI ID to receive automatic commission payouts.
        </p>
        <form action={saveUpiId}>
          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px' }}>
            <input
              type="text"
              name="upi_id"
              placeholder="yourname@okaxis"
              defaultValue={user?.upi_id || ''}
              style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '0.8rem 1rem', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
              required
            />
            <button type="submit" className={styles.btnAction} style={{ padding: '0.8rem 1.25rem', background: '#10b981', borderColor: '#10b981' }}>
              Save
            </button>
          </div>
        </form>
        {user?.upi_id ? (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 500 }}>Saved: {user.upi_id}</span>
            </div>
            {stats.available > 0 ? (
              <form action={requestWithdrawal}>
                <button type="submit" className={styles.btnAction} style={{ padding: '0.5rem 1rem', background: '#3b82f6', borderColor: '#3b82f6', fontSize: '0.85rem' }}>
                  Withdraw ₹{stats.available}
                </button>
              </form>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No funds available</span>
            )}
          </div>
        ) : (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#ef4444' }}>
            Please save your UPI ID before withdrawing funds.
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Withdrawal History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {withdrawals.map((wd: any) => (
              <div key={wd.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#fff' }}>
                    Withdrawal to {wd.payout_details}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(wd.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{wd.amount}</span>
                  <span style={{
                    padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600,
                    background: wd.status === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
                    color: wd.status === 'paid' ? '#10b981' : '#eab308',
                    border: `1px solid ${wd.status === 'paid' ? 'rgba(16,185,129,0.3)' : 'rgba(234,179,8,0.3)'}`
                  }}>
                    {wd.status === 'paid' ? '✅ Paid' : '⏳ Processing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>They sign up & go Pro</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your friend creates an account and purchases a Pro plan.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ minWidth: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>3</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Earn 25% for 1 year</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get 25% of their payments. Automatic payout via GPay/UPI.</div>
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
            <p>Share your link above to start earning!</p>
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
                  {ref.status === 'completed' ? '✅ Earning' : '⏳ Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
