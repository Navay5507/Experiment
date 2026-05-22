"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, MessageCircle, Send, Users, Activity, Clock, Terminal, ShieldAlert, AlertCircle, DollarSign, ShoppingBag, Check } from "lucide-react";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

// Count up exactly to the REAL Database Aggregate integer.
const CountUpReal = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    if (end === 0) return;
    const increment = Math.max(1, end / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearTimeout(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearTimeout(timer);
  }, [end]);
  return <span>{count.toLocaleString()}</span>;
};

// Static Sparklines for purely structural visualization placeholder matching Vercel's flat SVG aesthetic.
const Sparkline = ({ color }: { color: string }) => (
  <svg width="100%" height="40" style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 0 }}>
    <motion.path 
       d="M0 40 Q 20 20, 40 30 T 80 15 T 120 25 T 160 5 L 160 40 L 0 40 Z" 
       fill={`url(#grad-${color})`} 
       initial={{ y: 20, opacity: 0 }} 
       animate={{ y: 0, opacity: 0.15 }} 
       transition={{ duration: 1 }}
    />
    <motion.path 
       d="M0 40 Q 20 20, 40 30 T 80 15 T 120 25 T 160 5" 
       stroke={color} 
       strokeWidth="2" 
       fill="none" 
       initial={{ pathLength: 0 }} 
       animate={{ pathLength: 1 }} 
       transition={{ duration: 1.5, ease: "easeOut" }}
    />
    <defs>
      <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

interface Metrics {
  activeAutomations: number;
  cyclesCompleted: number;
  cyclesInProgress: number;
  leadsCaptured: number;
  storeRevenue: number;
  productsSold: number;
  hasConnectedIG?: boolean;
  totalAutomations?: number;
  totalProducts?: number;
  activeProducts?: number;
}
interface FeedItem { id: string; text: string; time: string; }

interface DashboardProps {
  metrics: Metrics;
  feed: FeedItem[];
  expiresAt?: string | null;
}

export default function DashboardClient({ metrics, feed, expiresAt }: DashboardProps) {

  const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className={styles.sectionTitle} style={{ color: '#fff', fontSize: '1.5rem', letterSpacing: '-0.02em', fontWeight: 800 }}>Workspace Overview</div>
      
      {daysLeft !== null && daysLeft <= 7 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem 1.5rem', borderRadius: '12px', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Action Required: Your Instagram Connection permanently expires in {daysLeft} days.</span>
           </div>
           <Link href="/dashboard/settings" style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Refresh Connection</Link>
        </motion.div>
      )}

      {/* Top Metrics Cards - ZERO FAKE DATA */}
      <div className={styles.metricGrid}>
        <motion.div whileHover={{ y: -4, borderColor: 'rgba(99,102,241,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>Active Automations</span>
             <Zap className={styles.metricIcon} size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.activeAutomations} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.activeAutomations > 0 ? (
               <><Activity size={14} className={styles.trendUp} /> <span className={styles.trendUp}>System connected</span></>
             ) : (
               <><AlertCircle size={14} style={{ color: "var(--text-muted)" }} /> <span style={{ color: "var(--text-muted)" }}>No pipelines attached</span></>
             )}
          </div>
          {metrics.activeAutomations > 0 && <Sparkline color="#6366F1" />}
        </motion.div>
        
        <motion.div whileHover={{ y: -4, borderColor: 'rgba(34,211,238,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>Cycles In Progress</span>
             <MessageCircle color="#22D3EE" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.cyclesInProgress} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.cyclesInProgress > 0 ? (
               <span style={{ color: '#22D3EE' }}>Active conversations running</span>
             ) : <span style={{ color: "var(--text-muted)" }}>No active conversations</span>}
          </div>
          {metrics.cyclesInProgress > 0 && <Sparkline color="#22D3EE" />}
        </motion.div>

        <motion.div whileHover={{ y: -4, borderColor: 'rgba(16,185,129,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>Cycles Completed</span>
             <Send color="#10b981" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.cyclesCompleted} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.cyclesCompleted > 0 ? (
               <span style={{ color: '#10b981' }}>Links securely delivered</span>
             ) : <span style={{ color: "var(--text-muted)" }}>Queue is empty</span>}
          </div>
          {metrics.cyclesCompleted > 0 && <Sparkline color="#10b981" />}
        </motion.div>

        <motion.div whileHover={{ y: -4, borderColor: 'rgba(168,85,247,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>Leads Captured</span>
             <Users color="#a855f7" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.leadsCaptured} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.leadsCaptured > 0 ? (
               <span style={{ color: '#a855f7' }}>Secure database synchronized</span>
             ) : <span style={{ color: "var(--text-muted)" }}>Pending Lead-Capture flows</span>}
          </div>
          {metrics.leadsCaptured > 0 && <Sparkline color="#a855f7" />}
        </motion.div>

        {/* Store Revenue */}
        <motion.div whileHover={{ y: -4, borderColor: 'rgba(16,185,129,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>Store Revenue</span>
             <DollarSign color="#10b981" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}>₹<CountUpReal end={metrics.storeRevenue} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.storeRevenue > 0 ? (
               <span style={{ color: '#10b981' }}>Sales revenue earned</span>
             ) : <span style={{ color: "var(--text-muted)" }}>Create products to start earning</span>}
          </div>
          {metrics.storeRevenue > 0 && <Sparkline color="#10b981" />}
        </motion.div>

        {/* Products Sold */}
        <motion.div whileHover={{ y: -4, borderColor: 'rgba(234,179,8,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>Products Sold</span>
             <ShoppingBag color="#eab308" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.productsSold} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.productsSold > 0 ? (
               <span style={{ color: '#eab308' }}>Digital products delivered</span>
             ) : <span style={{ color: "var(--text-muted)" }}>No sales yet</span>}
          </div>
          {metrics.productsSold > 0 && <Sparkline color="#eab308" />}
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
         
         {/* Roadmap to making ₹₹₹ Onboarding Card */}
         <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '480px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Roadmap to making ₹₹₹
               </h3>
               <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {(() => {
                     const stepsCount = [
                        !!metrics.hasConnectedIG,
                        (metrics.totalAutomations || 0) > 0,
                        (metrics.totalProducts || 0) > 0,
                        (metrics.activeProducts || 0) > 0
                     ].filter(Boolean).length;
                     return `${stepsCount}/4 completed`;
                  })()}
               </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '2.5rem' }}>
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                     width: `${Math.round(([
                        !!metrics.hasConnectedIG,
                        (metrics.totalAutomations || 0) > 0,
                        (metrics.totalProducts || 0) > 0,
                        (metrics.activeProducts || 0) > 0
                     ].filter(Boolean).length / 4) * 100)}%` 
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '999px', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
               />
            </div>

            {/* Steps Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', flex: 1 }}>
               {/* Vertical Dashed Line */}
               <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  borderLeft: '2px dashed rgba(255,255,255,0.1)',
                  zIndex: 0
               }} />

               {[
                  {
                     id: "instagram",
                     title: "Link your Instagram Account",
                     description: "Connect your Instagram profile to enable AutoDrop's automated response engine.",
                     isCompleted: !!metrics.hasConnectedIG,
                     action: !metrics.hasConnectedIG ? { label: "Connect IG", href: "/dashboard/settings" } : null
                  },
                  {
                     id: "pipeline",
                     title: "Create a Response Pipeline",
                     description: "Set up trigger keywords and define the automated response flow for your comments and DMs.",
                     isCompleted: (metrics.totalAutomations || 0) > 0,
                     action: !(metrics.totalAutomations || 0) ? { label: "Create Pipeline", href: "/dashboard/automations/new" } : null
                  },
                  {
                     id: "product",
                     title: "Create a Digital Product",
                     description: "Launch Digital Products, Webinars, Courses, 1:1 coaching, and more.",
                     isCompleted: (metrics.totalProducts || 0) > 0,
                     action: !(metrics.totalProducts || 0) ? { label: "Create Product", href: "/dashboard/store" } : null
                  },
                  {
                     id: "store",
                     title: "Activate your Digital Store",
                     description: "Activate at least one product so it can be automatically delivered when users comment.",
                     isCompleted: (metrics.activeProducts || 0) > 0,
                     action: !(metrics.activeProducts || 0) ? { label: "Activate Product", href: "/dashboard/store" } : null
                  }
               ].map((step, index) => (
                  <motion.div
                     key={step.id}
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1 }}
                     style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', zIndex: 1, position: 'relative' }}
                  >
                     {/* Circle Indicator */}
                     <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: step.isCompleted ? '#10b981' : 'rgba(255,255,255,0.03)',
                        border: step.isCompleted ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                        color: step.isCompleted ? '#fff' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.3s ease',
                        boxShadow: step.isCompleted ? '0 0 12px rgba(16,185,129,0.3)' : 'none'
                     }}>
                        {step.isCompleted ? (
                           <Check size={16} strokeWidth={3} />
                        ) : (
                           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                        )}
                     </div>

                     {/* Step Panel */}
                     <div style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        padding: '1rem 1.25rem',
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                     }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                           <span style={{ fontSize: '0.95rem', fontWeight: 700, color: step.isCompleted ? 'rgba(255,255,255,0.9)' : '#fff' }}>
                              {step.title}
                           </span>
                           <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                              {step.description}
                           </span>
                        </div>

                        {step.action && (
                           <Link 
                              href={step.action.href}
                              className={styles.btnAction}
                              style={{
                                 padding: '0.5rem 1.25rem',
                                 fontSize: '0.78rem',
                                 borderRadius: '999px',
                                 background: '#fff',
                                 color: '#000',
                                 border: '1px solid #fff',
                                 whiteSpace: 'nowrap',
                                 fontWeight: 700,
                                 boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                                 transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'scale(1.04)';
                                 e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'scale(1)';
                                 e.currentTarget.style.background = '#fff';
                              }}
                           >
                              {step.action.label}
                           </Link>
                        )}
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Account Insights */}
         <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.sectionTitle} style={{ color: '#fff', fontSize: '1.1rem' }}>Account Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem', flex: 1 }}>
               <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Est. Time Saved</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: 10, height: 10, borderRadius: '50%', background: metrics.cyclesCompleted > 0 ? '#ffbd2e' : 'rgba(255,255,255,0.2)', boxShadow: metrics.cyclesCompleted > 0 ? '0 0 20px #ffbd2e' : 'none' }} />
                     {((metrics.cyclesCompleted * 2.5) / 60).toFixed(1)} hrs
                  </div>
               </div>
               <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Engine Operations</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e5e7eb' }}>
                     <Zap size={24} color="var(--text-muted)" />
                     {(metrics.cyclesCompleted + metrics.cyclesInProgress).toLocaleString()} actions
                  </div>
               </div>
               <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Activity size={18} /> Pipelines running smoothly
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

