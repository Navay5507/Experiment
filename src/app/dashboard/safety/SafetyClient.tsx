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

// ─── Gauge ────────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const size = 148;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;

  const color = score >= 85 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const status = score >= 85 ? "Protected" : score >= 60 ? "Caution" : "At Risk";
  const statusBg = score >= 85 ? "rgba(34,197,94,0.1)" : score >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={fill}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "0.1rem"
        }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>/ 100</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.3rem 0.75rem", borderRadius: "99px",
          background: statusBg, border: `1px solid ${color}30`,
          width: "fit-content"
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color }}>{status}</span>
        </div>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.5, maxWidth: 220, margin: 0 }}>
          Your safety score is calculated from your hourly usage, message randomization, and queue health.
        </p>
      </div>
    </div>
  );
}

// ─── Rate Bar ─────────────────────────────────────────────────────────────────
function RateMeter({
  label, count, limit, icon: Icon
}: { label: string; count: number; limit: number; icon: any }) {
  const pct = Math.min((count / limit) * 100, 100);
  const safeZone = 75;
  const color = pct > 90 ? "#ef4444" : pct > safeZone ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Icon size={14} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
          <span style={{ color }}>{count}</span>
          <span style={{ color: "rgba(255,255,255,0.25)" }}> / {limit}</span>
        </span>
      </div>
      <div style={{
        position: "relative", height: 6,
        background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`, borderRadius: 99,
          background: color,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>
        <span>0</span>
        <span>Safe zone ≤{Math.round(limit * safeZone / 100)}</span>
        <span>Hard cap {limit}</span>
      </div>
    </div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, unit, icon: Icon, color = "rgba(255,255,255,0.7)" }: {
  label: string; value: string | number; unit?: string; icon: any; color?: string;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "0.5rem",
      padding: "1rem 1.25rem",
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <Icon size={13} color="rgba(255,255,255,0.3)" />
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
        <span style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</span>
        {unit && <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── Automation row ───────────────────────────────────────────────────────────
function AutomationRow({ name, isActive, hasSpintax, variantCount }: {
  name: string; isActive: boolean; hasSpintax: boolean; variantCount: number;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto",
      alignItems: "center",
      gap: "1rem",
      padding: "0.85rem 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: isActive ? "#fff" : "rgba(255,255,255,0.35)" }}>
          {name}
        </span>
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
          {isActive ? "Active" : "Paused"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
        {hasSpintax ? (
          <CheckCircle2 size={14} color="#22c55e" />
        ) : (
          <AlertTriangle size={14} color="#f59e0b" />
        )}
        <span style={{ fontSize: "0.78rem", color: hasSpintax ? "#22c55e" : "#f59e0b", fontWeight: 600 }}>
          {hasSpintax ? `${variantCount} variant${variantCount !== 1 ? "s" : ""}` : "No variants"}
        </span>
      </div>
      <span style={{
        fontSize: "0.7rem", fontWeight: 700,
        padding: "0.2rem 0.6rem", borderRadius: 99,
        background: hasSpintax ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
        color: hasSpintax ? "rgba(34,197,94,0.8)" : "rgba(245,158,11,0.8)",
        border: `1px solid ${hasSpintax ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)"}`,
        whiteSpace: "nowrap",
      }}>
        {hasSpintax ? "Safe" : "Review"}
      </span>
    </div>
  );
}

// ─── Pillar card ──────────────────────────────────────────────────────────────
function Pillar({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div style={{
      display: "flex", gap: "1rem", padding: "1.25rem 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{
        fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.2)",
        letterSpacing: "0.05em", paddingTop: "0.2rem", minWidth: 20,
      }}>
        {number}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{title}</span>
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{description}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SafetyClient() {
  const [data, setData] = useState<SafetyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/system/safety-status");
      if (res.ok) {
        setData(await res.json());
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(() => fetchData(), 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "0.75rem", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>
        <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
        Running diagnostics…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) return (
    <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "4rem" }}>
      Could not load safety data.
    </div>
  );

  const latencyColor = data.redisLatency < 80 ? "#22c55e" : data.redisLatency < 200 ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: "2rem", gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
            <Shield size={20} color="#6b7cff" />
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Safety Shield
            </h1>
          </div>
          <p style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            Live protection status for your Instagram account.
            {lastUpdated && (
              <span style={{ marginLeft: "0.5rem" }}>
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: "0.45rem",
            padding: "0.5rem 1rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, cursor: "pointer", color: "rgba(255,255,255,0.6)",
            fontSize: "0.8rem", fontWeight: 600,
            transition: "background 0.15s",
          }}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* ── Top row ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        <StatChip label="DMs this hour" value={data.dmCount} unit={`/ ${data.dmLimit}`} icon={MessageCircle}
          color={data.dmCount / data.dmLimit > 0.75 ? "#f59e0b" : "#fff"} />
        <StatChip label="Replies this hour" value={data.commentCount} unit={`/ ${data.commentLimit}`} icon={MessageSquare}
          color={data.commentCount / data.commentLimit > 0.75 ? "#f59e0b" : "#fff"} />
        <StatChip label="Queue depth" value={data.pendingQueue} unit="jobs" icon={Layers} />
        <StatChip label="API latency" value={data.redisLatency} unit="ms" icon={Cpu} color={latencyColor} />
      </div>

      {/* ── Middle row ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* Score */}
        <div style={{
          padding: "1.75rem",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, display: "flex", alignItems: "center",
        }}>
          <ScoreRing score={data.safetyScore} />
        </div>

        {/* Rate meters */}
        <div style={{
          padding: "1.75rem",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, display: "flex", flexDirection: "column",
          justifyContent: "center", gap: "1.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "-0.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Hourly Rate Limits
            </span>
            <span style={{
              fontSize: "0.68rem", fontWeight: 700, padding: "0.2rem 0.5rem",
              borderRadius: 99, background: "rgba(34,197,94,0.08)",
              color: "rgba(34,197,94,0.7)", border: "1px solid rgba(34,197,94,0.15)"
            }}>
              Meta-compliant
            </span>
          </div>
          <RateMeter label="Direct Messages (DMs)" count={data.dmCount} limit={data.dmLimit} icon={MessageCircle} />
          <RateMeter label="Comment Replies" count={data.commentCount} limit={data.commentLimit} icon={MessageSquare} />
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

        {/* Automation health */}
        <div style={{
          padding: "1.75rem",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Humanizer Engine
            </span>
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
              {data.automationSafety.filter(a => a.hasSpintax).length} / {data.automationSafety.length} randomized
            </span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", margin: "0 0 0.5rem" }}>
            Automations with multiple message variants are invisible to spam filters.
          </p>

          {data.automationSafety.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.82rem" }}>
              No automations created yet.
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto auto",
                gap: "1rem", padding: "0.5rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}>
                {["Automation", "Variants", "Status"].map(h => (
                  <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {h}
                  </span>
                ))}
              </div>
              {data.automationSafety.map(a => (
                <AutomationRow key={a.id} {...a} />
              ))}
            </div>
          )}
        </div>

        {/* How we protect you */}
        <div style={{
          padding: "1.75rem",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.25rem" }}>
            How AutoDrop protects you
          </span>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", marginTop: 0, marginBottom: "0.5rem" }}>
            Three layers active on every automation, every time.
          </p>

          <div>
            <Pillar
              number="01"
              title="Official Meta Business API"
              description="We use the same API Meta endorses for Shopify, Mailchimp, and enterprise CRMs. No scraping, no simulated logins — methods that guarantee instant bans."
            />
            <Pillar
              number="02"
              title="Smart Throttle — {data.dmLimit} DMs/hr cap"
              description={`Meta's hard limit is 200 DMs/hr. We enforce a ${data.dmLimit}/hr ceiling with randomized 5–30 second delays between messages to stay well inside safe territory.`}
            />
            <Pillar
              number="03"
              title="Humanizer Engine (Spintax)"
              description="Our message randomizer generates a unique variation for every DM sent. Instagram's spam classifier never sees the same text twice from your account."
            />
          </div>

          <a
            href="https://developers.facebook.com/docs/messenger-platform"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              marginTop: "1rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)",
              textDecoration: "none", transition: "color 0.15s",
            }}
          >
            Meta API documentation <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </>
  );
}
