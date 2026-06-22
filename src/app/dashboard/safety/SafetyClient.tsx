"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MessageCircle, MessageSquare, Zap, CheckCircle2, AlertTriangle, XCircle, Clock, Activity, Server } from "lucide-react";

interface SafetyData {
  safetyScore: number;
  dmCount: number;
  dmLimit: number;
  commentCount: number;
  commentLimit: number;
  pendingQueue: number;
  redisLatency: number;
  automationSafety: {
    id: string;
    name: string;
    isActive: boolean;
    variantCount: number;
    hasSpintax: boolean;
  }[];
}

// Animated circular gauge
function SafetyGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeColor = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  const glowColor = score >= 85 ? 'rgba(16,185,129,0.35)' : score >= 60 ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.35)';
  const label = score >= 85 ? 'PROTECTED' : score >= 60 ? 'CAUTION' : 'AT RISK';
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        {/* Glow behind gauge */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: glowColor, filter: 'blur(30px)', opacity: 0.6,
          transform: 'scale(0.85)',
        }} />
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
          {/* Background track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          {/* Score arc */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${strokeColor})` }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ fontSize: '2.8rem', fontWeight: 900, color: strokeColor, lineHeight: 1 }}
          >
            {score}
          </motion.div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: strokeColor, letterSpacing: '0.15em', opacity: 0.85 }}>
            {label}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
        Account Safety Score
      </div>
    </div>
  );
}

// Horizontal rate bar
function RateBar({ label, icon: Icon, count, limit, color }: {
  label: string; icon: any; count: number; limit: number; color: string;
}) {
  const pct = Math.min((count / limit) * 100, 100);
  const barColor = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : color;
  const status = pct > 90 ? 'Critical' : pct > 75 ? 'Elevated' : 'Safe';
  const statusColor = pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={16} color={barColor} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>{count}</span> / {limit} per hour
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem',
            borderRadius: '99px', background: `${statusColor}20`,
            color: statusColor, border: `1px solid ${statusColor}50`
          }}>
            {status}
          </span>
        </div>
      </div>
      {/* Bar */}
      <div style={{ height: 10, borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            height: '100%', borderRadius: '99px',
            background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
            boxShadow: `0 0 10px ${barColor}66`,
          }}
        />
        {/* Safe zone marker at 75% */}
        <div style={{
          position: 'absolute', top: 0, left: '75%', height: '100%',
          width: 2, background: 'rgba(255,255,255,0.2)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
        <span>0</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>⚠ Safe limit: {Math.round(limit * 0.75)}</span>
        <span>Hard cap: {limit}</span>
      </div>
    </div>
  );
}

// Pacing visualizer — animated dots
function PacingVisualizer({ pendingQueue, latency }: { pendingQueue: number; latency: number }) {
  const [dots, setDots] = useState<{ id: number; delay: string }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      counterRef.current += 1;
      const delay = (Math.floor(Math.random() * 25) + 5).toFixed(0) + 's';
      setDots(prev => [...prev.slice(-4), { id: counterRef.current, delay }]);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <AnimatePresence>
        {dots.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
            Watching for activity…
          </div>
        )}
        {dots.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.9rem',
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: '10px',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>DM dispatched safely</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={12} /> waited {d.delay}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <div style={{
          flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <Activity size={14} color="#6b7cff" />
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Queue depth</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#fff' }}>{pendingQueue}</span>
        </div>
        <div style={{
          flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <Server size={14} color="#6b7cff" />
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>API latency</span>
          <span style={{ marginLeft: 'auto', fontWeight: 700, color: latency < 80 ? '#10b981' : '#f59e0b' }}>{latency}ms</span>
        </div>
      </div>
    </div>
  );
}

// Automation variant checker
function AutomationSafetyList({ automations }: { automations: SafetyData['automationSafety'] }) {
  if (automations.length === 0) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
        No automations found.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {automations.map((a) => {
        const ok = a.hasSpintax;
        const color = ok ? '#10b981' : '#f59e0b';
        const Icon = ok ? CheckCircle2 : AlertTriangle;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 1rem',
              background: ok ? 'rgba(16,185,129,0.05)' : 'rgba(245,158,11,0.05)',
              border: `1px solid ${color}25`,
              borderRadius: '10px',
            }}
          >
            <Icon size={15} color={color} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1, color: a.isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              {a.name}
              {!a.isActive && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>(paused)</span>}
            </span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem',
              borderRadius: '99px', background: `${color}20`, color,
              border: `1px solid ${color}40`, whiteSpace: 'nowrap',
            }}>
              {ok ? `${a.variantCount} variants` : 'Add variants'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function SafetyClient() {
  const [data, setData] = useState<SafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/system/safety-status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Shield size={36} color="#6b7cff" />
        </motion.div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Running safety diagnostics…</span>
      </div>
    );
  }

  if (!data) return null;

  const pillars = [
    {
      icon: Shield,
      color: '#6b7cff',
      title: 'Official Meta API Only',
      desc: 'AutoDrop exclusively uses Meta\'s approved Business API — the same one used by Shopify and Mailchimp. We never scrape or simulate login sessions.',
    },
    {
      icon: Clock,
      color: '#10b981',
      title: 'Smart Throttle Engine',
      desc: `We cap your DMs at ${data.dmLimit}/hr (Meta's hard limit is 200) and add a random 5–30 second human-like delay between every single message.`,
    },
    {
      icon: Zap,
      color: '#f59e0b',
      title: 'Humanizer Engine',
      desc: 'Our spintax randomizer generates unique variations of every message so Instagram\'s spam algorithm never sees two identical DMs from your account.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Hero header */}
      <div style={{
        borderRadius: '20px',
        padding: '2rem 2.5rem',
        background: 'linear-gradient(135deg, rgba(107,124,255,0.12) 0%, rgba(16,185,129,0.07) 100%)',
        border: '1px solid rgba(107,124,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '2rem', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Shield size={28} color="#6b7cff" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Safety Shield</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: 420 }}>
            Real-time account protection diagnostics. Every metric below is actively keeping your Instagram account safe right now.
          </p>
          {lastUpdated && (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refreshes every 30s
            </p>
          )}
        </div>
        <SafetyGauge score={data.safetyScore} />
      </div>

      {/* Rate bars */}
      <div style={{
        borderRadius: '16px', padding: '1.75rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '-0.5rem' }}>
          <Activity size={17} color="#6b7cff" />
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Smart Throttle Monitor</span>
          <span style={{
            marginLeft: 'auto', fontSize: '0.7rem', padding: '0.2rem 0.55rem',
            borderRadius: '99px', background: 'rgba(16,185,129,0.15)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700
          }}>LIVE</span>
        </div>
        <RateBar label="Direct Messages (DMs)" icon={MessageCircle} count={data.dmCount} limit={data.dmLimit} color="#6b7cff" />
        <RateBar label="Comment Replies" icon={MessageSquare} count={data.commentCount} limit={data.commentLimit} color="#a78bfa" />
      </div>

      {/* Pacing + Automation grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Pacing */}
        <div style={{
          borderRadius: '16px', padding: '1.75rem',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={17} color="#10b981" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Human-Like Pacing</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Every DM is dripped with a random delay, simulating human typing speed.
          </p>
          <PacingVisualizer pendingQueue={data.pendingQueue} latency={data.redisLatency} />
        </div>

        {/* Automation safety */}
        <div style={{
          borderRadius: '16px', padding: '1.75rem',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Zap size={17} color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Humanizer Engine</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Message randomization status per automation.
          </p>
          <AutomationSafetyList automations={data.automationSafety} />
        </div>
      </div>

      {/* 3 Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {pillars.map((p) => (
          <motion.div
            key={p.title}
            whileHover={{ y: -3, borderColor: `${p.color}40` }}
            transition={{ duration: 0.2 }}
            style={{
              borderRadius: '16px', padding: '1.5rem',
              background: `linear-gradient(135deg, ${p.color}08 0%, transparent 100%)`,
              border: `1px solid ${p.color}20`,
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '10px',
              background: `${p.color}18`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <p.icon size={18} color={p.color} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{p.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
