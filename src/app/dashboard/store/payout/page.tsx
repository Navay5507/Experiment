"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, ShieldCheck, Banknote, AlertCircle, Package, ShoppingCart, DollarSign } from "lucide-react";
import Link from "next/link";
import styles from "../store.module.css";

export default function PayoutPage() {
  const [userPlan, setUserPlan] = useState<string>("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        setUserPlan(data.profile?.plan || 'FREE');
      } catch (err) {
        console.error("Error fetching user plan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const feePercentage = (userPlan === 'PRO' || userPlan === 'ELITE') ? 7 : 14;

  return (
    <div className={styles.storePage} style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}
        >
          Digital Store 🏪
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your creator marketplace earnings and withdrawal methods.</p>
      </header>

      {/* Sub-navigation Tabs */}
      <div className={styles.tabsNav}>
        <Link href="/dashboard/store" className={styles.tabLink}>
          <Package size={16} className={styles.tabIcon} />
          Products
        </Link>
        <Link href="/dashboard/store/orders" className={styles.tabLink}>
          <ShoppingCart size={16} className={styles.tabIcon} />
          Orders
        </Link>
        <Link href="/dashboard/store/payout" className={`${styles.tabLink} ${styles.activeTabLink}`}>
          <DollarSign size={16} className={styles.tabIcon} />
          Payouts
        </Link>
      </div>

      {/* Fee Structure Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        style={{ 
          background: 'linear-gradient(145deg, rgba(30,41,59,0.4), rgba(15,23,42,0.4))', 
          border: '1px solid var(--border)', 
          borderRadius: '16px', 
          padding: '2rem', 
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.15 }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
            <Banknote size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Your Current Fee Tier</h2>
            <p style={{ color: 'var(--text-muted)' }}>AutoDrop processing fees are determined by your subscription plan.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
          {/* Free Plan Box */}
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: userPlan === 'FREE' ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: userPlan === 'FREE' ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
            opacity: userPlan === 'FREE' ? 1 : 0.5
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: userPlan === 'FREE' ? '#fff' : 'var(--text-muted)' }}>Free Starter</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: userPlan === 'FREE' ? 'var(--primary)' : 'var(--text-muted)', lineHeight: 1 }}>14%</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>per successful transaction</p>
            {userPlan === 'FREE' && <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}><ShieldCheck size={16} /> Active Tier</div>}
          </div>

          {/* Pro Plan Box */}
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: (userPlan === 'PRO' || userPlan === 'ELITE') ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: (userPlan === 'PRO' || userPlan === 'ELITE') ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
            opacity: (userPlan === 'PRO' || userPlan === 'ELITE') ? 1 : 0.5
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: (userPlan === 'PRO' || userPlan === 'ELITE') ? '#fff' : 'var(--text-muted)' }}>Growth Pro</h3>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: (userPlan === 'PRO' || userPlan === 'ELITE') ? 'var(--primary)' : 'var(--text-muted)', lineHeight: 1 }}>7%</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>per successful transaction</p>
            {(userPlan === 'PRO' || userPlan === 'ELITE') && <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}><ShieldCheck size={16} /> Active Tier</div>}
          </div>
        </div>

        {userPlan === 'FREE' && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertCircle color="#ef4444" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ color: '#fca5a5', fontSize: '0.9rem', lineHeight: 1.5 }}>
                You are currently losing <strong>7%</strong> of your revenue to higher processing fees. <br/>
                <a href="/pricing" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>Upgrade to Growth Pro</a> to cut your fees in half instantly.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Payment Setup (Placeholder) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        style={{ 
          border: '1px solid var(--border)', 
          borderRadius: '16px', 
          padding: '2rem',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bank Account Details</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connect your bank account to receive automated payouts.</p>
          </div>
          <CreditCard size={28} color="var(--text-muted)" />
        </div>

        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>KYC and automated payout routing is coming in the next update.</p>
          <button disabled style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.1)' }}>
            Connect Bank (Soon)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
