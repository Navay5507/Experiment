"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, MessageCircle, MessageSquare, CheckCircle2, AlertTriangle, RefreshCw, Clock, Cpu, Layers, ChevronRight } from "lucide-react";

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

/* ─── tiny helpers ────────────────────────────────────────────────────────── */
const clr = (pct: number) =>
  pct > 90 ? "#ef4444" : pct > 75 ? "#f59e0b" : "#22c55e";

const fmt = (n: number) => n.toLocaleString();

/* ─── Score ring ──────────────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const R = 52, sw = 5;
  const circ = 2 * Math.PI * R;
  const dash = circ - (score / 100) * circ;
  const color = score >= 85 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 85 ? "Protected" : score >= 60 ? "Caution" : "At Risk";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      {/* ring */}
      <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
        <svg width={120} height={120} style={{ transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={60} cy={60} r={R} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
          <circle cx={60} cy={60} r={R} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke .4s" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "1.9rem", fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {score}
          </span>
          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginTop: 2 }}>
            /&nbsp;100
          </span>
        </div>
      </div>
      {/* label block */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.28rem 0.7rem", borderRadius: 99,
          background: `${color}14`,
          border: `1px solid ${color}28`,
          width: "fit-content",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>{label}</span>
        </span>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.55, maxWidth: 200 }}>
          Based on hourly usage, message randomisation, and queue health.
        </p>
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
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.55rem" }}>
        <Icon size={12} color="rgba(255,255,255,0.28)" />
        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
        <span style={{ fontSize: "1.45rem", fontWeight: 800, color: valueColor || "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {value}
        </span>
        {sub && <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.22)", fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

/* ─── Rate bar ────────────────────────────────────────────────────────────── */
function RateBar({ label, count, limit, icon: Icon }: {
  label: string; count: number; limit: number; icon: any;
}) {
  const pct = Math.min((count / limit) * 100, 100);
  const color = clr(pct);
  const safeAt = Math.round(limit * 0.75);

  return (
    <div>
      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Icon size={13} color="rgba(255,255,255,0.35)" />
          <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color, fontWeight: 700 }}>{fmt(count)}</span>
            <span style={{ color: "rgba(255,255,255,0.22)" }}> / {fmt(limit)}</span>
          </span>
          <span style={{
            fontSize: "0.67rem", fontWeight: 700,
            padding: "0.18rem 0.5rem", borderRadius: 99,
            background: `${color}12`, color, border: `1px solid ${color}22`,
          }}>
            {pct < 50 ? "Nominal" : pct < 75 ? "Moderate" : pct < 90 ? "Elevated" : "Critical"}
          </span>
        </div>
      </div>
      {/* track */}
      <div style={{
        position: "relative", height: 8, borderRadius: 99,
        background: "rgba(255,255,255,0.05)", overflow: "visible",
      }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${pct}%`, background: color, minWidth: pct > 0 ? 6 : 0,
          transition: "width 1.2s cubic-bezier(.4,0,.2,1)",
        }} />
        {/* safe zone marker */}
        <div style={{
          position: "absolute", top: -3, left: "75%",
          width: 1, height: 14,
          background: "rgba(255,255,255,0.15)",
        }} />
      </div>
      {/* axis labels */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: "0.45rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.18)",
      }}>
        <span>0</span>
        <span>Safe cap: {fmt(safeAt)}</span>
        <span>Hard limit: {fmt(limit)}</span>
      </div>
    </div>
  );
}

/* ─── Automation table row ────────────────────────────────────────────────── */
function AutoRow({ name, isActive, hasSpintax, variantCount }: {
  name: string; isActive: boolean; hasSpintax: boolean; variantCount: number;
}) {
  const accent = hasSpintax ? "#22c55e" : "#f59e0b";
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "0.85rem 1rem 0.85rem 0" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: isActive ? "#fff" : "rgba(255,255,255,0.3)" }}>
          {name}
        </div>
        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", marginTop: 2 }}>
          {isActive ? "Active" : "Paused"}
        </div>
      </td>
      <td style={{ padding: "0.85rem 0.75rem", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          {hasSpintax
            ? <CheckCircle2 size={13} color="#22c55e" />
            : <AlertTriangle size={13} color="#f59e0b" />}
          <span style={{ fontSize: "0.8rem", color: accent, fontWeight: 600 }}>
            {hasSpintax ? `${variantCount} variants` : "None"}
          </span>
        </div>
      </td>
      <td style={{ padding: "0.85rem 0 0.85rem 0.75rem", textAlign: "right" }}>
        <span style={{
          display: "inline-block",
          fontSize: "0.68rem", fontWeight: 700,
          padding: "0.2rem 0.6rem", borderRadius: 99,
          background: `${accent}10`, color: accent,
          border: `1px solid ${accent}20`,
        }}>
          {hasSpintax ? "Safe" : "Review"}
        </span>
      </td>
    </tr>
  );
}

/* ─── Pillar row ──────────────────────────────────────────────────────────── */
function Pillar({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{
      display: "flex", gap: "1rem",
      padding: "1rem 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{
        flexShrink: 0, fontSize: "0.62rem", fontWeight: 800,
        color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em",
        paddingTop: "0.2rem", width: 20,
      }}>{n}</span>
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.82)", marginBottom: "0.3rem" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.33)", lineHeight: 1.6 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

/* ─── Section card wrapper ────────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.018)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "1.5rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.24)", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function SafetyClient() {
  const [data, setData] = useState<SafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [ts, setTs] = useState<Date | null>(null);

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
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  /* loading state */
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "0.6rem", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>
      <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
      Running diagnostics…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem" }}>
      Could not load safety data. Check your connection.
    </div>
  );

  const latColor = data.redisLatency < 80 ? "#22c55e" : data.redisLatency < 200 ? "#f59e0b" : "#ef4444";
  const dmPct = (data.dmCount / data.dmLimit) * 100;
  const cmPct = (data.commentCount / data.commentLimit) * 100;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .refresh-btn:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Shield size={18} color="#6366f1" />
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Safety Shield</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {ts && (
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.22)", fontVariantNumeric: "tabular-nums" }}>
              Updated {ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button
            className="refresh-btn"
            onClick={() => load(true)}
            disabled={spinning}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.45rem 0.9rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, cursor: "pointer",
              color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", fontWeight: 600,
              transition: "background 0.15s",
            }}
          >
            <RefreshCw size={12} style={{ animation: spinning ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Hero card — Score + Chips ─────────────────────────────────────── */}
      <Card style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "2.5rem", flexWrap: "wrap" }}>
        <ScoreRing score={data.safetyScore} />

        {/* divider */}
        <div style={{ width: 1, height: 80, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />

        {/* chips grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", flex: 1, minWidth: 260 }}>
          <Chip label="DMs this hour" value={String(data.dmCount)} sub={`/ ${data.dmLimit}`}
            icon={MessageCircle} valueColor={clr(dmPct)} />
          <Chip label="Comment replies" value={String(data.commentCount)} sub={`/ ${data.commentLimit}`}
            icon={MessageSquare} valueColor={clr(cmPct)} />
          <Chip label="Queue depth" value={String(data.pendingQueue)} sub="jobs" icon={Layers} />
          <Chip label="API latency" value={String(data.redisLatency)} sub="ms" icon={Cpu} valueColor={latColor} />
        </div>
      </Card>

      {/* ── Rate limits ──────────────────────────────────────────────────── */}
      <Card style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <CardHeader title="Hourly Rate Limits" sub="Monitored in real-time against Meta's enforcement thresholds" />
          <span style={{
            fontSize: "0.67rem", fontWeight: 700, padding: "0.22rem 0.6rem",
            borderRadius: 99, background: "rgba(34,197,94,0.08)",
            color: "rgba(34,197,94,0.7)", border: "1px solid rgba(34,197,94,0.15)",
            whiteSpace: "nowrap", alignSelf: "flex-start",
          }}>
            Meta-compliant
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <RateBar label="Direct Messages (DMs)" count={data.dmCount} limit={data.dmLimit} icon={MessageCircle} />
          <RateBar label="Comment Replies" count={data.commentCount} limit={data.commentLimit} icon={MessageSquare} />
        </div>
      </Card>

      {/* ── Bottom two cards ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Humanizer engine */}
        <Card>
          <CardHeader
            title="Humanizer Engine"
            sub={`${data.automationSafety.filter(a => a.hasSpintax).length} of ${data.automationSafety.length} automations randomised`}
          />
          {data.automationSafety.length === 0 ? (
            <div style={{ padding: "2rem 0", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.82rem" }}>
              No automations yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["Automation", "Variants", "Status"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "Status" ? "right" : "left",
                      padding: "0 0 0.6rem", fontSize: "0.67rem", fontWeight: 700,
                      color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.07em",
                    }}>
                      {h}
                    </th>
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
          <CardHeader title="How AutoDrop Protects You" sub="Three layers active on every automation" />
          <Pillar n="01" title="Official Meta Business API"
            body="We use the same API Meta endorses for Shopify and Mailchimp — no scraping, no session simulation, no methods that trigger instant bans." />
          <Pillar n="02" title={`Smart Throttle — ${data.dmLimit} DMs/hr cap`}
            body={`Meta's hard limit is 200 DMs/hr. We enforce a ${data.dmLimit}/hr ceiling with randomised 5–30 s delays between every message.`} />
          <Pillar n="03" title="Humanizer Engine (Spintax)"
            body="Each DM is a unique variation. Instagram's spam classifier never sees the same text twice from your account." />

          <a href="https://developers.facebook.com/docs/messenger-platform"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.3rem",
              marginTop: "1rem", fontSize: "0.72rem",
              color: "rgba(255,255,255,0.2)", textDecoration: "none",
              transition: "color 0.15s",
            }}>
            Meta developer docs <ChevronRight size={11} />
          </a>
        </Card>
      </div>
    </>
  );
}
