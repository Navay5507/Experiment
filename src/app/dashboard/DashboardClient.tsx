"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, MessageCircle, Send, Users, Activity, Clock, Terminal, ShieldAlert, AlertCircle } from "lucide-react";
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

interface Metrics { activeAutomations: number; commentsMatched: number; dmsSent: number; leadsCaptured: number; }
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
             <span className={styles.metricTitle}>Comments Matched</span>
             <MessageCircle color="#22D3EE" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.commentsMatched} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.commentsMatched > 0 ? (
               <span style={{ color: '#22D3EE' }}>Organic engagements trapped</span>
             ) : <span style={{ color: "var(--text-muted)" }}>Awaiting trigger words...</span>}
          </div>
          {metrics.commentsMatched > 0 && <Sparkline color="#22D3EE" />}
        </motion.div>

        <motion.div whileHover={{ y: -4, borderColor: 'rgba(16,185,129,0.5)' }} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1 }}>
          <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
             <span className={styles.metricTitle}>DMs Sent</span>
             <Send color="#10b981" size={18} />
          </div>
          <div className={styles.metricValue} style={{ position: 'relative', zIndex: 2 }}><CountUpReal end={metrics.dmsSent} /></div>
          <div className={styles.metricTrend} style={{ position: 'relative', zIndex: 2 }}>
             {metrics.dmsSent > 0 ? (
               <span style={{ color: '#10b981' }}>Payloads securely routed</span>
             ) : <span style={{ color: "var(--text-muted)" }}>Queue is empty</span>}
          </div>
          {metrics.dmsSent > 0 && <Sparkline color="#10b981" />}
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
         
         {/* Live Activity Feed - HONEST DB DATA */}
         <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.sectionTitle} style={{ color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Terminal size={18} /> Raw System Log Stream
            </div>
            
            {feed.length === 0 ? (
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)', gap: '1rem', padding: '2rem' }}>
                  <ShieldAlert size={32} opacity={0.3} />
                  <p>Your trace log history is entirely clear.</p>
                  <Link href="/dashboard/automations/new" className={styles.btnAction}>Build your first Pipeline</Link>
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', flex: 1 }}>
                  <AnimatePresence>
                     {feed.map((item, i: number) => (
                       <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                       >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                             <span style={{ fontSize: '0.95rem', color: '#e5e7eb', fontFamily: 'monospace' }}>{item.text}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</span>
                       </motion.div>
                     ))}
                  </AnimatePresence>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                     Pulling securely from Supabase Webhook Clusters
                  </div>
               </div>
            )}
         </div>

         {/* Account Insights */}
         <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.sectionTitle} style={{ color: '#fff', fontSize: '1.1rem' }}>Account Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1.5rem', flex: 1 }}>
               <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Est. Time Saved</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: 10, height: 10, borderRadius: '50%', background: metrics.commentsMatched > 0 ? '#ffbd2e' : 'rgba(255,255,255,0.2)', boxShadow: metrics.commentsMatched > 0 ? '0 0 20px #ffbd2e' : 'none' }} />
                     {((metrics.commentsMatched * 1.5) / 60).toFixed(1)} hrs
                  </div>
               </div>
               <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Engine Operations</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e5e7eb' }}>
                     <Zap size={24} color="var(--text-muted)" />
                     {(metrics.commentsMatched + metrics.dmsSent).toLocaleString()} actions
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
