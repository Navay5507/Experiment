"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield, MessageCircle, MessageSquare,
  CheckCircle2, AlertTriangle, RefreshCw,
  Cpu, Layers, ChevronRight
} from "lucide-react";

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

const scoreColor = (s: number) => s >= 85 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444";
const rateColor  = (pct: number) => pct > 90 ? "#ef4444" : pct > 75 ? "#f59e0b" : "#22c55e";
const fmt        = (n: number) => n.toLocaleString();

/* ─── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const R = 54, sw = 6, size = 128;
  const circ = 2 * Math.PI * R;
  const dash = circ - (score / 100) * circ;
  const color = scoreColor(score);
  const label = score >= 85 ? "Protected" : score >= 60 ? "Caution" : "At Risk";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={size / 2} cy={size / 2} r={R}
            fill="none" stroke="var(--border)" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={R}
            fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke .3s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {score}
          </span>
          <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: 1 }}>/100</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.25rem 0.65rem", borderRadius: 99,
          background: `${color}18`, border: `1px solid ${color}30`,
          width: "fit-content",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>{label}</span>
        </div>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.55, maxWidth: 190 }}>
          Based on hourly usage, message randomisation, and queue health.
        </span>
      </div>
    </div>
  );
}

/* ─── Metric chip ─────────────────────────────────────────────────────────── */
function Chip({ label, value, sub, icon: Icon, valueColor }: {
  label: string; value: string; sub?: string; icon: any; valueColor?: string;
}) {
  return (
    <div style={{
      padding: "1rem 1.1rem",
      background: "var(--surface-hover)",
      border: "1px solid var(--border)",
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
        <Icon size={12} color="var(--text-muted)" />
        <span style={{ fontSize: "0.67rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
        <span style={{ fontSize: "1.4rem", fontWeight: 800, color: valueColor || "var(--text-heading)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {value}
        </span>
        {sub && <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

/* ─── Rate bar ────────────────────────────────────────────────────────────── */
function RateBar({ label, count, limit, icon: Icon }: {
  label: string; count: number; limit: number; icon: any;
}) {
  const pct   = Math.min((count / limit) * 100, 100);
  const color = rateColor(pct);
  const status = pct < 50 ? "Nominal" : pct < 75 ? "Moderate" : pct < 90 ? "Elevated" : "Critical";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Icon size={13} color="var(--text-muted)" />
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <span style={{ fontSize: "0.82rem", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color, fontWeight: 700 }}>{fmt(count)}</span>
            <span style={{ color: "var(--text-muted)" }}> / {fmt(limit)}</span>
          </span>
          <span style={{
            fontSize: "0.67rem", fontWeight: 700,
            padding: "0.18rem 0.55rem", borderRadius: 99,
            background: `${color}14`, color, border: `1px solid ${color}30`,
          }}>
            {status}
          </span>
        </div>
      </div>

      {/* track */}
      <div style={{ position: "relative", height: 7, borderRadius: 99, background: "var(--border)", overflow: "visible" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${Math.max(pct, pct > 0 ? 0.8 : 0)}%`,
          background: color,
          transition: "width 1.1s cubic-bezier(.4,0,.2,1)",
        }} />
        {/* safe-zone marker */}
        <div style={{
          position: "absolute", left: "75%", top: -3,
          width: 1, height: 13,
          background: "var(--text-muted)",
          opacity: 0.3,
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.4rem", fontSize: "0.67rem", color: "var(--text-muted)", opacity: 0.6 }}>
        <span>0</span>
        <span>Safe cap: {fmt(Math.round(limit * 0.75))}</span>
        <span>Hard limit: {fmt(limit)}</span>
      </div>
    </div>
  );
}

/* ─── Automation row ──────────────────────────────────────────────────────── */
function AutoRow({ name, isActive, hasSpintax, variantCount }: {
  name: string; isActive: boolean; hasSpintax: boolean; variantCount: number;
}) {
  const accent = hasSpintax ? "#22c55e" : "#f59e0b";
  return (
    <tr>
      <td style={{ padding: "0.8rem 0.75rem 0.8rem 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.84rem", fontWeight: 600, color: isActive ? "var(--text-heading)" : "var(--text-muted)" }}>
          {name}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
          {isActive ? "Active" : "Paused"}
        </div>
      </td>
      <td style={{ padding: "0.8rem 0.75rem", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {hasSpintax
            ? <CheckCircle2 size={13} color="#22c55e" />
            : <AlertTriangle size={13} color="#f59e0b" />}
          <span style={{ fontSize: "0.79rem", color: accent, fontWeight: 600 }}>
            {hasSpintax ? `${variantCount} variant${variantCount !== 1 ? "s" : ""}` : "None"}
          </span>
        </div>
      </td>
      <td style={{ padding: "0.8rem 0 0.8rem 0.75rem", borderBottom: "1px solid var(--border)", textAlign: "right" }}>
        <span style={{
          display: "inline-block", fontSize: "0.67rem", fontWeight: 700,
          padding: "0.18rem 0.6rem", borderRadius: 99,
          background: `${accent}12`, color: accent, border: `1px solid ${accent}25`,
        }}>
          {hasSpintax ? "Safe" : "Review"}
        </span>
      </td>
    </tr>
  );
}

/* ─── Card shell ──────────────────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "1.5rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ text, right }: { text: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
        {text}
      </span>
      {right}
    </div>
  );
}

/* ─── Pillar ──────────────────────────────────────────────────────────────── */
function Pillar({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.9rem 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ flexShrink: 0, fontSize: "0.6rem", fontWeight: 800, color: "var(--text-muted)", opacity: 0.5, width: 20, paddingTop: "0.2rem" }}>{n}</span>
      <div>
        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "0.25rem" }}>{title}</div>
        <div style={{ fontSize: "0.77rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function SafetyClient() {
  const [data, setData]       = useState<SafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [ts, setTs]           = useState<Date | null>(null);

  const load = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const r = await fetch("/api/system/safety-status");
      if (r.ok) { setData(await r.json()); setTs(new Date()); }
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load();
      }
    }, 120_000); 
    return () => clearInterval(t); 
  }, [load]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "55vh", gap: "0.6rem", color: "var(--text-muted)", fontSize: "0.84rem" }}>
      <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
      Running diagnostics…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", fontSize: "0.84rem" }}>
      Could not load safety data.
    </div>
  );

  const dmPct  = (data.dmCount / data.dmLimit) * 100;
  const cmPct  = (data.commentCount / data.commentLimit) * 100;
  const latCol = data.redisLatency < 80 ? "#22c55e" : data.redisLatency < 200 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .refbtn:hover { background: var(--surface-hover) !important; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <Shield size={18} color="#6366f1" />
          <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-heading)" }}>
            Safety Shield
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          {ts && (
            <span style={{ fontSize: "0.73rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
              Updated {ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button className="refbtn" onClick={() => load(true)} disabled={spinning} style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.45rem 0.85rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8, cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "0.77rem", fontWeight: 600, transition: "background .15s",
          }}>
            <RefreshCw size={12} style={{ animation: spinning ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Hero: Score + Chips ───────────────────────────────────────────── */}
      <Card style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <ScoreRing score={data.safetyScore} />
        <div style={{ width: 1, height: 70, background: "var(--border)", flexShrink: 0, alignSelf: "center" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem", flex: 1, minWidth: 260 }}>
          <Chip label="DMs this hour"   value={String(data.dmCount)}      sub={`/ ${data.dmLimit}`}      icon={MessageCircle}  valueColor={rateColor(dmPct)} />
          <Chip label="Comment replies" value={String(data.commentCount)} sub={`/ ${data.commentLimit}`} icon={MessageSquare}  valueColor={rateColor(cmPct)} />
          <Chip label="Queue depth"     value={String(data.pendingQueue)} sub="jobs"                     icon={Layers} />
          <Chip label="API latency"     value={String(data.redisLatency)} sub="ms"                       icon={Cpu}            valueColor={latCol} />
        </div>
      </Card>

      {/* ── Rate limits ──────────────────────────────────────────────────── */}
      <Card style={{ marginBottom: "1rem" }}>
        <SectionLabel
          text="Hourly Rate Limits"
          right={
            <span style={{
              fontSize: "0.67rem", fontWeight: 700, padding: "0.2rem 0.55rem",
              borderRadius: 99, background: "rgba(34,197,94,0.1)",
              color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)",
            }}>
              Meta-compliant
            </span>
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <RateBar label="Direct Messages (DMs)" count={data.dmCount}      limit={data.dmLimit}      icon={MessageCircle} />
          <RateBar label="Comment Replies"        count={data.commentCount} limit={data.commentLimit} icon={MessageSquare} />
        </div>
      </Card>

      {/* ── Bottom row ───────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Humanizer engine */}
        <Card>
          <SectionLabel
            text="Humanizer Engine"
            right={
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {data.automationSafety.filter(a => a.hasSpintax).length} / {data.automationSafety.length} randomised
              </span>
            }
          />
          {data.automationSafety.length === 0 ? (
            <div style={{ padding: "1.5rem 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
              No automations yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Automation", "Variants", "Status"].map(h => (
                    <th key={h} style={{
                      padding: "0 0 0.65rem",
                      textAlign: h === "Status" ? "right" : "left",
                      fontSize: "0.66rem", fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      borderBottom: "1px solid var(--border)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.automationSafety.map(a => <AutoRow key={a.id} {...a} />)}
              </tbody>
            </table>
          )}
        </Card>

        {/* How we protect you */}
        <Card>
          <SectionLabel text="How AutoDrop Protects You" />
          <Pillar n="01" title="Official Meta Business API"
            body="We use the same API Meta endorses for Shopify and Mailchimp — no scraping, no session simulation, no methods that trigger instant bans." />
          <Pillar n="02" title={`Smart Throttle — ${data.dmLimit} DMs / hr cap`}
            body={`Meta's hard limit is 200 DMs/hr. We enforce a ${data.dmLimit}/hr ceiling with randomised 5–30 s delays between every message to stay comfortably below.`} />
          <Pillar n="03" title="Humanizer Engine (Spintax)"
            body="Each DM is a unique variation. Instagram's spam classifier never sees the same text twice from your account." />
          <a href="https://developers.facebook.com/docs/messenger-platform"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              marginTop: "1rem", fontSize: "0.7rem",
              color: "var(--text-muted)", textDecoration: "none", opacity: 0.6,
            }}>
            Meta developer docs <ChevronRight size={11} />
          </a>
        </Card>
      </div>
    </>
  );
}
