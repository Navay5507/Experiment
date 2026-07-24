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
          background: "var(--surface)",
          border: `1px solid ${hovered ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "1.25rem",
          cursor: "default",
          boxShadow: hovered ? "0 10px 30px rgba(0,0,0,0.08)" : "none",
          transition: "all 0.3s",
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: "0.875rem", background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(91,133,255,0.15))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", border: "1px solid rgba(99,102,241,0.2)" }}>
          <Icon size={24} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "0.6rem" }}>{title}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{desc}</p>
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
                  Our founder was helping an Instagram creator manage their DM replies after they went viral. We quickly realized other tools already existed in the market for this exact problem.
                </p>
                <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                  But there was a massive catch: <span style={{ color: "var(--text-heading)", fontWeight: 600 }}>creators were getting their accounts banned.</span> The competition was using unapproved, non-compliant methods that violated Instagram's Terms of Service, putting years of hard work at risk.
                </p>
                <p style={{ color: "#9ca3af", fontSize: "1rem", lineHeight: 1.8 }}>
                  <span style={{ color: "var(--text-heading)", fontWeight: 600 }}>So we built AutoDrop.</span> An automation platform built strictly on the official Meta Graph API. No shadowbans. No risk. Just safe, compliant automation that turns engagement into leads while protecting your account.
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

      {/* ── COMPETITOR COMPARISON ── */}
      <section style={{ padding: "100px 0", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "600px", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className={styles.container}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text-heading)", margin: "0 0 1rem 0" }}>
                How AutoDrop stacks up<br />
                <span style={{ background: "linear-gradient(135deg,#818cf8 0%,#5b85ff 50%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>against the competition</span>
              </h2>
              <p style={{ color: "#9ca3af", fontSize: "1rem", maxWidth: "580px", margin: "0 auto", lineHeight: 1.7 }}>Most Instagram DM automation tools do the same things. The real difference is in the price, the limits, and who they're actually built for.</p>
            </div>
          </FadeIn>

          {/* Feature Matrix Table */}
          <FadeIn delay={0.1}>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "1.25rem" }}>
                {[
                  {
                    name: "ManyChat",
                    price: "From $14/mo", priceSub: "scales with contacts",
                    model: "Contact-based", modelSub: "bill grows as audience grows",
                    freeTier: "25 active contacts/mo", freeTierSub: "effectively unusable",
                    story: true,
                    currency: "USD only", currencySub: ""
                  },
                  {
                    name: "LinkDM",
                    price: "$19/mo", priceSub: "USD only",
                    model: "Flat (DM volume cap)", modelSub: "",
                    freeTier: "1,000 DMs/mo", freeTierSub: "",
                    story: true,
                    currency: "USD only", currencySub: ""
                  },
                  {
                    name: "LinkPlease",
                    price: "₹599/mo", priceSub: "billed monthly",
                    model: "Flat", modelSub: "",
                    freeTier: "1,000 DMs/mo", freeTierSub: "",
                    story: true,
                    currency: "INR", currencySub: ""
                  },
                  {
                    name: "Zorcha",
                    price: "$14.99/mo (₹1,199 in India)", priceSub: "Pro plan",
                    model: "Flat (INR tiered)", modelSub: "",
                    freeTier: "Limited", freeTierSub: "unspecified cap",
                    story: true,
                    currency: "USD + INR", currencySub: "zorcha.com/in for India"
                  },
                  {
                    name: "AutoDrop", highlight: true,
                    price: <><s style={{color: 'var(--text-muted)', fontSize: '1.2rem', marginRight: '0.2rem'}}>$9.99</s>$4.99/mo <br/><span style={{fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)'}}>(<s style={{color: 'rgba(156, 163, 175, 0.6)'}}>₹699</s> ₹449 in India)</span></>, priceSub: "all features included",
                    model: "Flat", modelSub: "no hidden scaling",
                    freeTier: "Unlimited DMs", freeTierSub: "on free plan",
                    story: true,
                    currency: "10 currencies", currencySub: "INR, USD, GBP, EUR, AUD…"
                  }
                ].map((c: any, i) => (
                  <div key={i} style={{
                    background: c.highlight ? "var(--card-bg)" : "var(--surface)",
                    border: `1px solid ${c.highlight ? "var(--border-glow)" : "var(--border)"}`,
                    borderRadius: "1.5rem",
                    padding: "1.5rem",
                    position: "relative",
                    boxShadow: c.highlight ? "0 20px 40px rgba(0,0,0,0.08)" : "none",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    {c.highlight && (
                      <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--primary)", padding: "0.25rem 1rem", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700, border: "1px solid var(--border-glow)", whiteSpace: "nowrap" }}>
                        ★ Best Value
                      </div>
                    )}
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: c.highlight ? "var(--primary)" : "var(--text-heading)", marginBottom: "1.5rem", textAlign: "center" }}>
                      {c.name}
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
                      <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Paid plan starting price</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: c.highlight ? "var(--text-heading)" : "var(--text-main)" }}>{c.price}</div>
                        {c.priceSub && <div style={{ fontSize: "0.75rem", color: c.highlight ? "#10b981" : "var(--text-muted)", marginTop: "4px", fontWeight: c.highlight ? 600 : 400 }}>{c.priceSub}</div>}
                      </div>
                      
                      <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Pricing model</div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 600 }}>{c.model}</div>
                        {c.modelSub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{c.modelSub}</div>}
                      </div>

                      <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Free tier limit</div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 600 }}>{c.freeTier}</div>
                        {c.freeTierSub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{c.freeTierSub}</div>}
                      </div>

                      <div style={{ paddingBottom: "1.25rem", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Features</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                          <CheckCircle2 size={16} color="#10b981" /> Comment → DM
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-main)", marginBottom: "0.5rem" }}>
                          {c.story ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="var(--text-muted)" />} Story reply automation
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-main)" }}>
                          <CheckCircle2 size={16} color="#10b981" /> Official Meta API
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.35rem" }}>Local currency support</div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 600 }}>{c.currency}</div>
                        {c.currencySub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{c.currencySub}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", borderRadius: "1rem", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", textAlign: "center" }}>
                <ShieldCheck size={18} color="var(--text-muted)" />
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>All pricing and feature data sourced directly from each competitor's official website.</span>
              </div>
            </div>
          </FadeIn>

          {/* Where AutoDrop genuinely wins */}
          <FadeIn delay={0.2}>
            <div style={{ marginTop: "3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              {[
                {
                  title: "Lowest price — period",
                  desc: "At just $4.99/mo (down from $9.99/mo), and ₹449 in India (down from ₹699/mo), AutoDrop is the most affordable full-featured plan. The next cheapest competitor starts at $9.99/mo.",
                  color: "#10b981",
                },
                {
                  title: "Unlimited DMs on free tier",
                  desc: "ManyChat caps free users at 25 contacts. LinkDM and LinkPlease cap at 1,000 DMs/mo. AutoDrop's free plan sends unlimited DMs.",
                  color: "#818cf8",
                },
                {
                  title: "Most local currencies",
                  desc: "ManyChat and LinkDM charge in USD only. Zorcha and LinkPlease support INR. AutoDrop supports 10 currencies including INR, GBP, EUR, AUD, NGN and more.",
                  color: "#f59e0b",
                },
                {
                  title: "No contact scaling fees",
                  desc: "ManyChat charges more as your audience grows. AutoDrop is a flat fee — your bill stays the same at 100 followers or 100,000.",
                  color: "#3b82f6",
                },
              ].map((item, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "1.25rem", padding: "1.5rem" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, boxShadow: `0 0 10px ${item.color}`, marginBottom: "1rem" }} />
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "0.5rem" }}>{item.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </FadeIn>
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
