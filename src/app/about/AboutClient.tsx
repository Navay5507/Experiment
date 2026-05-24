"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Zap, Heart, Shield, Globe, TrendingUp, ArrowRight,
  Lightbulb, Rocket, ShieldCheck, XCircle, CheckCircle2
} from "lucide-react";
import styles from "../page.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* ── FadeIn wrapper ── */
const FadeIn = ({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" }) => {
  // Scrolling animation disabled as requested; return children directly without motion wrappers
  return <>{children}</>;
};

/* ── Value card ── */
function ValueCard({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay?: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          padding: "2rem",
          background: hovered ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.04)",
          border: `1px solid ${hovered ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.12)"}`,
          borderRadius: "1.25rem",
          cursor: "default",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(91,133,255,0.3))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
          <Icon size={24} color="#818cf8" />
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "0.6rem" }}>{title}</h3>
        <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{desc}</p>
      </motion.div>
    </FadeIn>
  );
}



export default function AboutPage() {
  const values = [
    { icon: Zap, title: "Speed First", desc: "Every second a creator waits is a lead lost. We obsess over response times and real-time delivery." },
    { icon: Shield, title: "Platform Safe", desc: "We play by Instagram's rules — always. Official Meta partnership means your account stays protected." },
    { icon: Heart, title: "Creator-Centric", desc: "We build for creators, by creators. Every feature starts with one question: does this help creators make more?" },
    { icon: Lightbulb, title: "Radical Simplicity", desc: "Automation shouldn't require an engineering degree. If it takes more than 5 minutes to set up, we failed." },
    { icon: Globe, title: "Global Reach", desc: "Supporting creators across 50+ countries, with multi-currency pricing and local payment methods." },
    { icon: TrendingUp, title: "Data-Driven", desc: "Every decision we make is backed by creator analytics. We ship what moves the needle, not what looks cool." },
  ];

  return (
    <main className={styles.main} style={{ background: "transparent", minHeight: "100vh", color: "var(--text-main)", overflowX: "hidden" }}>
      {/* ── HEADER ── */}
      <Header activePath="about" />

      {/* ── HERO ── */}
      <section style={{ paddingTop: "160px", paddingBottom: "80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Radial glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: "800px", height: "600px", background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className={styles.container} style={{ position: "relative" }}>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, color: "var(--text-heading)", margin: "0 0 1.5rem 0" }}>
              We're building the future<br />
              <span style={{ background: "linear-gradient(135deg,#818cf8 0%,#5b85ff 50%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                of creator monetization.
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ fontSize: "1.2rem", color: "#9ca3af", lineHeight: 1.75, maxWidth: "640px", margin: "0 auto 2.5rem auto" }}>
              AutoDrop was born from one frustration: watching brilliant creators burn hours on repetitive DMs instead of making content. We fixed that. And we're not done.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/sign-up" className="premium-btn" style={{ padding: "0.9rem 2rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Start Free <ArrowRight size={18} />
              </Link>
              <Link href="/support" style={{ padding: "0.9rem 2rem", fontSize: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(139,92,246,0.3)", color: "#9ca3af", textDecoration: "none", transition: "all 0.2s" }}>
                Talk to Us
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TEAM PHOTO ── */}
      <section style={{ padding: "0 0 80px 0" }}>
        <div className={styles.container}>
          <FadeIn>
            <div style={{ position: "relative", borderRadius: "2rem", overflow: "hidden", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 40px 120px rgba(99,102,241,0.2)" }}>
              <img
                src="/about_team.png"
                alt="AutoDrop team"
                style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
              />
              {/* Overlay gradient */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
              <div style={{ position: "absolute", bottom: "2rem", left: "2rem", right: "2rem" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>The AutoDrop Team — on a mission to give creators their time back</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section style={{ padding: "80px 0" }}>
        <div className={styles.container}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "5rem", alignItems: "center" }}>
            <FadeIn direction="left">
              <div>
                <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.15, color: "var(--text-heading)", margin: "0 0 1.5rem 0" }}>
                  A creator's problem.<br />An engineer's solution.
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                  In early 2024, our founder was helping an Instagram creator manage their DM replies. The creator had just gone viral — 50,000 new followers in 48 hours. Their DMs? Completely on fire.
                </p>
                <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                  Manually replying to 3,000 DMs is not just exhausting — it means missing leads, losing sales, and burning out the creator before they can even enjoy their moment.
                </p>
                <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.8 }}>
                  <span style={{ color: "var(--text-heading)", fontWeight: 600 }}>So we automated it.</span> We built AutoDrop to instantly reply to comments and send DMs, turning passive engagement into direct leads on autopilot.
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.15}>
              <div style={{ position: "relative" }}>
                <div style={{ borderRadius: "1.5rem", overflow: "hidden", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 30px 80px rgba(99,102,241,0.15)" }}>
                  <Image src="/about_dashboard.png" alt="AutoDrop dashboard" width={1200} height={420} style={{ width: "100%", height: "420px", objectFit: "cover", display: "block" }} />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: "80px 0" }}>
        <div className={styles.container}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-heading)", margin: "0 0 1rem 0" }}>Built on real values,<br />not buzzwords.</h2>
              <p style={{ color: "#9ca3af", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>These aren't aspirational posts. They're the actual principles we use to make every product decision.</p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {values.map((v, i) => (
              <ValueCard key={i} icon={v.icon} title={v.title} desc={v.desc} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE'RE DIFFERENT ── */}
      <section style={{ padding: "100px 0", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        
        <div className={styles.container}>
          <div style={{ 
            background: "rgba(255, 255, 255, 0.01)", 
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.04)", 
            borderRadius: "2.5rem", 
            padding: "4.5rem 3rem", 
            position: "relative", 
            overflow: "hidden",
            boxShadow: "0 30px 100px rgba(0, 0, 0, 0.4)"
          }}>
            <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

            <FadeIn>
              <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <div style={{ display: "inline-block", padding: "0.5rem 1.25rem", borderRadius: "999px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1rem" }}>
                  Side-By-Side Comparison
                </div>
                <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-heading)", margin: 0 }}>The honest comparison</h2>
                <p style={{ color: "#9ca3af", fontSize: "1rem", marginTop: "1rem", opacity: 0.8 }}>No fluff. Just a direct look at how much time and money you save with automation.</p>
              </div>
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem", position: "relative", zIndex: 2 }}>
              {[
                { 
                  title: "Without AutoDrop", 
                  items: [
                    "Reply to DMs manually, one-by-one", 
                    "Miss leads while you're sleeping", 
                    "Lose track of who asked what", 
                    "Spend 3+ hours/day on DMs", 
                    "No data on what's converting"
                  ], 
                  bad: true 
                },
                { 
                  title: "With AutoDrop", 
                  items: [
                    "Instant, smart replies 24/7", 
                    "Every lead captured automatically", 
                    "Full conversation history + CRM", 
                    "Zero time spent on repeat DMs", 
                    "Deep analytics on every campaign"
                  ], 
                  bad: false 
                },
              ].map((col, ci) => (
                <FadeIn key={ci} delay={ci * 0.15}>
                  <div style={{ 
                    padding: "3rem 2.5rem", 
                    background: col.bad ? "rgba(239, 68, 68, 0.01)" : "rgba(16, 185, 129, 0.02)", 
                    border: `1px solid ${col.bad ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.15)"}`, 
                    borderRadius: "1.75rem",
                    boxShadow: col.bad ? "none" : "0 20px 50px rgba(16, 185, 129, 0.03)",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    position: "relative"
                  }}
                  className={col.bad ? "comparison-card-bad" : "comparison-card-good"}
                  >
                    {/* Visual Glowing Badge */}
                    <div style={{
                      position: "absolute",
                      top: "2.5rem",
                      right: "2.5rem",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: col.bad ? "#ef4444" : "#10b981",
                      boxShadow: col.bad ? "0 0 12px #ef4444" : "0 0 12px #10b981",
                    }} />

                    <h3 style={{ 
                      fontSize: "1.35rem", 
                      fontWeight: 800, 
                      color: col.bad ? "#fca5a5" : "#34d399", 
                      marginBottom: "2rem",
                      letterSpacing: "-0.01em",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      {col.title}
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      {col.items.map((item, ii) => (
                        <li key={ii} style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#d1d5db", fontSize: "1rem", lineHeight: 1.5 }}>
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {col.bad ? (
                              <XCircle size={20} color="#f87171" style={{ filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.2))" }} />
                            ) : (
                              <CheckCircle2 size={20} color="#34d399" style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.2))" }} />
                            )}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 0 100px 0" }}>
        <div className={styles.container}>
          <FadeIn>
            <div style={{ textAlign: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
              <h2 style={{ fontSize: "clamp(2rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-heading)", position: "relative", margin: "0 0 1.5rem 0" }}>
                Ready to reclaim<br />
                <span style={{ background: "linear-gradient(135deg,#818cf8,#5b85ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your creative time?</span>
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "1.1rem", maxWidth: "480px", margin: "0 auto 2.5rem auto", lineHeight: 1.7, position: "relative" }}>
                Join thousands of creators already using AutoDrop to turn their audience into revenue — on autopilot.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
                <Link href="/sign-up" className="premium-btn" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  Start for Free <ArrowRight size={18} />
                </Link>
                <Link href="/pricing" style={{ padding: "1rem 2rem", fontSize: "1.05rem", borderRadius: "0.75rem", border: "1px solid rgba(139,92,246,0.3)", color: "#9ca3af", textDecoration: "none", transition: "all 0.2s" }}>
                  View Pricing
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </main>
  );
}
