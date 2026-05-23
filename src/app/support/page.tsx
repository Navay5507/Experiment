"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./support.module.css";
import pageStyles from "../page.module.css";
import ThemeToggle from "../components/ThemeToggle";

export default function SupportPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <div className={pageStyles.navbarWrapper}>
        <nav className={pageStyles.navbar}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className={pageStyles.logo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 38, objectFit: 'contain' }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ color: '#5b85ff' }}>Auto</span>
                <span style={{ color: '#ffffff' }}>Drop</span>
              </div>
            </div>
          </Link>

          <button className={pageStyles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
          </button>

          <div className={`${pageStyles.navLinks} ${isMobileMenuOpen ? pageStyles.mobileNavOpen : ''}`}>
            <Link href="/#features" className={pageStyles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className={pageStyles.navLink} onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
            <Link href="/pricing" className={pageStyles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/affiliates" className={pageStyles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Partner Program</Link>
            <Link href="/support" className={pageStyles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Book a Call</Link>
            {isMobileMenuOpen && (
               <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                     <span>Theme:</span>
                     <ThemeToggle />
                  </div>
                  {user ? (
                     <Link href="/dashboard" className="premium-btn" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', width: '100%', textAlign: 'center' }}>Dashboard</Link>
                  ) : (
                     <Link href="/sign-in" className="premium-btn" style={{ fontSize: '1rem', padding: '0.8rem 1.5rem', width: '100%', textAlign: 'center' }}>Sign In</Link>
                  )}
               </div>
            )}
          </div>
          <div className={pageStyles.authCol} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <ThemeToggle />
            {user ? (
               <Link href="/dashboard" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Dashboard</Link>
            ) : (
               <Link href="/sign-in" className="premium-btn" style={{ fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>Sign In</Link>
            )}
          </div>
        </nav>
      </div>

      <main className={styles.container} style={{ flex: 1, paddingTop: '140px' }}>
        <section className={styles.content}>
          <div className={styles.textColumn}>
             <h1 className={styles.title}>Book a 1-on-1<br/>Video Call with us.</h1>
             <p className={styles.subtitle}>
               Whether you need help mapping out your DM Follow-Gates, training your Elite AI Knowledge Base, or just general account troubleshooting over screen-share, we are here for you.
             </p>

             <div className={styles.featureBox}>
               <div className={styles.feature}>
                 <h3>✨ Live Screen-Share</h3>
                 <p>Our team will help you configure your dashboard and test your workflows via live screen-share.</p>
               </div>
             </div>

             <div className={styles.featureBox} style={{ marginTop: '1rem' }}>
               <div className={styles.feature} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                 <h3 style={{ color: '#60a5fa' }}>✉️ Just need a quick answer?</h3>
                 <p style={{ marginTop: '0.5rem' }}>If you don&apos;t have time for a full video call, you can drop us a line via our priority support form.</p>
                 <a href="mailto:support@autodrop.in" className="premium-btn" style={{ display: 'inline-block', marginTop: '1.25rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                   Open Support Form ↗
                 </a>
               </div>
             </div>
          </div>

          <div className={styles.calendlyWrapper}>
             <div className={styles.iframeBox}>
                 <iframe 
                   src="https://calendly.com/helpautodrop/30min?hide_event_type_details=1&hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=6366f1" 
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   title="Book a Video Call"
                   className={styles.iframe}
                 />
                 <div className={styles.iframeOverlayHack}>
                    {/* Providing a secure fallback button in case iframe blocks on certain mobile devices */}
                    <a href="https://calendly.com/helpautodrop/30min" target="_blank" rel="noreferrer" className={styles.mobileFallbackBtn}>
                      Open Scheduling Calendar ↗
                    </a>
                 </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
