"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, DollarSign, RefreshCcw, ShieldCheck, TrendingUp, Zap, Menu, X } from "lucide-react";
import styles from "../page.module.css";

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function AffiliatesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className={styles.main} style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      {/* Navigation */}
      <div className={styles.navbarWrapper}>
        <nav className={styles.navbar}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={styles.logo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 38, objectFit: 'contain' }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ color: '#5b85ff' }}>Auto</span>
                <span style={{ color: '#ffffff' }}>Drop</span>
              </div>
            </div>
          </Link>

          <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
          </button>

          <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
             <Link href="/#features" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
             <Link href="/#how-it-works" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
             <Link href="/pricing" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
             <Link href="/support" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Book a Call</Link>
             {isMobileMenuOpen && (
               <Link href="/sign-up?redirect_url=/dashboard/referral" className="premium-btn" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', marginTop: '1rem', textAlign: 'center' }}>Become a Partner</Link>
             )}
          </div>
          <div className={styles.authCol}>
             <Link href="/sign-up?redirect_url=/dashboard/referral" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Become a Partner</Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
         <div className={styles.container} style={{ maxWidth: '800px' }}>
            <FadeIn>
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 16px', borderRadius: '100px', marginBottom: '24px' }}>
                 <DollarSign size={16} color="#3b82f6" />
                 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#3b82f6' }}>AutoDrop Partner Program</span>
               </motion.div>
            </FadeIn>
            <FadeIn delay={0.1}>
               <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
                  Earn <span style={{ color: '#10b981' }}>25% Recurring</span> Commission for 1 Year.
               </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
               <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                  Refer creators, agencies, and businesses to AutoDrop. <br className="hide-mobile" />
                  Earn a 25% cut of their subscription every single month for their first year.
               </p>
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/sign-up?redirect_url=/dashboard/referral" className="premium-btn" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     Join the Program <ArrowRight size={20} />
                  </Link>
               </div>
            </FadeIn>
         </div>
      </section>

      {/* How It Works Layer */}
      <section style={{ padding: '6rem 0', background: '#111318', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
         <div className={styles.container}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
               <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>How It Works</h2>
               <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Three simple steps to start earning passive income.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
               <FadeIn delay={0.1}>
                  <div style={{ background: '#16181D', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '24px', height: '100%' }}>
                     <div style={{ width: 64, height: 64, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#3b82f6' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>1</span>
                     </div>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Get Your Link</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Sign up for an AutoDrop account. No paid subscription is required to become a partner. Head to the Referral tab to grab your unique tracking link.</p>
                  </div>
               </FadeIn>
               <FadeIn delay={0.2}>
                  <div style={{ background: '#16181D', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '24px', height: '100%' }}>
                     <div style={{ width: 64, height: 64, background: 'rgba(168, 85, 247, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#a855f7' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>2</span>
                     </div>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Share AutoDrop</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Share your link on YouTube, Instagram, X (Twitter), or your newsletter. Recommend us to agency clients or fellow creators.</p>
                  </div>
               </FadeIn>
               <FadeIn delay={0.3}>
                  <div style={{ background: '#16181D', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '24px', height: '100%' }}>
                     <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#10b981' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>3</span>
                     </div>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Earn Cash</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Earn 25% of their subscription every month they stay active. Earnings are automatically calculated and ready for you.</p>
                  </div>
               </FadeIn>
            </div>
         </div>
      </section>

      {/* Features Detail */}
      <section style={{ padding: '8rem 0' }}>
         <div className={styles.container}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center' }}>
               <FadeIn>
                  <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>A Partner Program Built For You.</h2>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                           <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Automatic Tracking</strong>
                           <span style={{ color: 'var(--text-muted)' }}>We track every sign-up automatically. Your dashboard updates in real-time as your referrals grow.</span>
                        </div>
                     </li>
                     <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <RefreshCcw size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                           <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.25rem' }}>1-Year Recurring</strong>
                           <span style={{ color: 'var(--text-muted)' }}>You aren't just paid once. You get 25% every single month for their first year active.</span>
                        </div>
                     </li>
                     <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <TrendingUp size={24} color="#a855f7" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                           <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.25rem' }}>High Conversion Rate</strong>
                           <span style={{ color: 'var(--text-muted)' }}>AutoDrop is an easy-to-sell, no-brainer ROI product for creators looking to automate their DMs.</span>
                        </div>
                     </li>
                  </ul>
               </FadeIn>
               
               <FadeIn delay={0.2}>
                  <div style={{ background: '#111318', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(16, 185, 129, 0.2)', filter: 'blur(50px)', borderRadius: '50%' }} />
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Your Dashboard</div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600 }}>Active Overview</div>
                     </div>
                     
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                           <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Available Balance</div>
                           <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹11,490 <span style={{ fontSize: '1rem', color: '#10b981', fontWeight: 600 }}>+₹2,000 this week</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                           <div style={{ flex: 1, background: '#16181D', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px' }}>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Active Referrals</div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>42</div>
                           </div>
                           <div style={{ flex: 1, background: '#16181D', border: '1px solid var(--border)', padding: '1rem', borderRadius: '12px' }}>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Clicks</div>
                              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>1,804</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </FadeIn>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '8rem 0', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 60%)' }}>
        <div className={styles.container}>
          <FadeIn>
             <Zap size={48} color="#3b82f6" style={{ marginBottom: '1.5rem' }} />
             <h2 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#fff' }}>Start Earning Today.</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>Join hundreds of partners generating passive income by recommending the best IG automation tool on the market.</p>
             <Link href="/sign-up?redirect_url=/dashboard/referral" className="premium-btn" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>Become a Partner</Link>
          </FadeIn>
        </div>
      </section>

       {/* FOOTER */}
       <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 0 1.5rem', background: 'var(--surface)' }}>
        <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 48, objectFit: 'contain' }} />
              <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ color: '#5b85ff' }}>Auto</span>
                <span style={{ color: '#ffffff' }}>Drop</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', opacity: 0.7 }}>Instagram DM Automation, Simplified.</p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/affiliates" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>Affiliates</Link>
            <a href="https://forms.gle/nu3PBCRRNQDs1DoT6" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</a>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
          </div>

          <div style={{ width: '100%', maxWidth: '400px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.6 }}>
            <p>&copy; {new Date().getFullYear()} Autodrop. All rights reserved.</p>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
               <ShieldCheck size={14} color="#10b981" /> Official Meta Business Partner
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
