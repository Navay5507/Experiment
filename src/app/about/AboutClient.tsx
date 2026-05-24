"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Zap, Heart, Shield, Globe, TrendingUp, ArrowRight,
  Lightbulb, Rocket, ShieldCheck,
  Menu, X
} from "lucide-react";
import styles from "../page.module.css";
import ThemeToggle from "../components/ThemeToggle";

/* ── FadeIn wrapper ── */
const FadeIn = ({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" }) => (
  <motion.div
    initial={{ opacity: 0, y: direction === "up" ? 40 : 0, x: direction === "left" ? -40 : direction === "right" ? 40 : 0 }}
    whileInView={{ opacity: 1, y: 0, x: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

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
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



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

      {/* ── NAVBAR ── */}
      <div className={styles.navbarWrapper}>
        <nav className={styles.navbar}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className={styles.logo} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Image src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" width={38} height={38} style={{ objectFit: "contain" }} />
              <div style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.02em", display: "flex", alignItems: "center", lineHeight: 1 }}>
                <span style={{ color: "#5b85ff" }}>Auto</span>
                <span style={{ color: "#ffffff" }}>Drop</span>
              </div>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className={styles.mobileControls}>
            <div className={styles.mobileThemeToggle}><ThemeToggle /></div>
            <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
            </button>
          </div>

          <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileNavOpen : ""}`}>
            <Link href="/#features" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
            <Link href="/pricing" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/affiliates" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Partner Program</Link>
            <Link href="/support" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Book a Call</Link>
            <Link href="/about" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)} style={{ color: "#fff", fontWeight: 600 }}>About</Link>
            {isMobileMenuOpen && (
              <div style={{ display: "flex", gap: "1rem", flexDirection: "column", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", width: "100%" }}>
                {user ? (
                  <Link href="/dashboard" className="premium-btn" style={{ fontSize: "1rem", padding: "0.8rem 1.5rem", width: "100%", textAlign: "center" }}>Dashboard</Link>
                ) : (
                  <Link href="/sign-in" className="premium-btn" style={{ fontSize: "1rem", padding: "0.8rem 1.5rem", width: "100%", textAlign: "center" }}>Sign In</Link>
                )}
              </div>
            )}
          </div>

          <div className={styles.authCol}>
            <ThemeToggle />
            {user ? (
              <Link href="/dashboard" className="premium-btn" style={{ fontSize: "0.9rem", padding: "0.6rem 1.5rem" }}>Dashboard</Link>
            ) : (
              <Link href="/sign-in" className="premium-btn" style={{ fontSize: "0.9rem", padding: "0.6rem 1.5rem" }}>Sign In</Link>
            )}
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
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
      <section style={{ padding: "80px 0" }}>
        <div className={styles.container}>
          <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "2rem", padding: "4rem 3rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

            <FadeIn>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-heading)", margin: 0 }}>The honest comparison</h2>
              </div>
            </FadeIn>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "2rem" }}>
              {[
                { title: "Without AutoDrop", items: ["Reply to DMs manually, one-by-one", "Miss leads while you're sleeping", "Lose track of who asked what", "Spend 3+ hours/day on DMs", "No data on what's converting"], bad: true },
                { title: "With AutoDrop", items: ["Instant, smart replies 24/7", "Every lead captured automatically", "Full conversation history + CRM", "Zero time spent on repeat DMs", "Deep analytics on every campaign"], bad: false },
              ].map((col, ci) => (
                <FadeIn key={ci} delay={ci * 0.15}>
                  <div style={{ padding: "2rem", background: col.bad ? "rgba(239,68,68,0.04)" : "rgba(16,185,129,0.06)", border: `1px solid ${col.bad ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.2)"}`, borderRadius: "1.25rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: col.bad ? "#f87171" : "#34d399", marginBottom: "1.5rem" }}>{col.title}</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {col.items.map((item, ii) => (
                        <li key={ii} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", color: "#9ca3af", fontSize: "0.9rem" }}>
                          <span style={{ color: col.bad ? "#f87171" : "#34d399", marginTop: "2px", flexShrink: 0 }}>{col.bad ? "✗" : "✓"}</span>
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
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "3rem 0 1.5rem", background: "#000000" }}>
        <div className={styles.container} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Image src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" width={48} height={48} style={{ objectFit: "contain" }} />
              <div style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.02em", display: "flex", alignItems: "center", lineHeight: 1 }}>
                <span style={{ color: "#5b85ff" }}>Auto</span>
                <span style={{ color: "#ffffff" }}>Drop</span>
              </div>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "0.85rem", opacity: 0.7 }}>Instagram DM Automation, Simplified.</p>
          </div>
          <div style={{ display: "flex", gap: "2rem", color: "#9ca3af", fontSize: "0.9rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/#features" style={{ color: "inherit", textDecoration: "none" }}>Features</Link>
            <Link href="/pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</Link>
            <Link href="/affiliates" style={{ color: "inherit", textDecoration: "none" }}>Partner Program</Link>
            <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
            <a href="mailto:support@autodrop.in" style={{ color: "inherit", textDecoration: "none" }}>Contact Us</a>
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/refund-policy" style={{ color: "inherit", textDecoration: "none" }}>Refund Policy</Link>
          </div>
          <div style={{ width: "100%", maxWidth: "400px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.8rem", opacity: 0.5, lineHeight: 1.6 }}>
            <p>&copy; {new Date().getFullYear()} AutoDrop. All rights reserved.</p>
            <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
              <ShieldCheck size={14} color="#10b981" /> Official Meta Business Partner
            </p>
          </div>
        </div>
        <div style={{ width: "100%", maxWidth: "100vw", overflowX: "clip", display: "flex", justifyContent: "center", marginTop: "2rem", pointerEvents: "none", userSelect: "none" }}>
          <span style={{ fontSize: "clamp(3rem,15vw,300px)", fontWeight: 900, lineHeight: 0.75, letterSpacing: "-0.06em", background: "linear-gradient(180deg,rgba(59,130,246,0.15) 0%,rgba(59,130,246,0) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            AutoDrop
          </span>
        </div>
      </footer>
    </main>
  );
}
