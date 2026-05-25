"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./support.module.css";
import pageStyles from "../page.module.css";

export default function SupportPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <Header activePath="support" />

      <main className={styles.container} style={{ flex: 1, paddingTop: '140px' }}>
        <section className={styles.content}>
          <div className={styles.textColumn}>
             <h1 className={styles.title}>Book a 1-on-1<br/>Video Call with us.</h1>
             <p className={styles.subtitle}>
               Whether you need help mapping out your DM Follow-Gates, training your Elite AI Knowledge Base, or just general account troubleshooting over screen-share, we are here for you.
             </p>

             <div className={styles.featureBox}>
               <div className={styles.feature}>
                 <h3>Live Screen-Share</h3>
                 <p>Our team will help you configure your dashboard and test your workflows via live screen-share.</p>
               </div>
             </div>

             <div className={styles.featureBox} style={{ marginTop: '1rem' }}>
               <div className={styles.feature} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                 <h3 style={{ color: '#60a5fa' }}>Just need a quick answer?</h3>
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

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
