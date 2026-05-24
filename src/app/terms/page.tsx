"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 1.5rem 4rem', lineHeight: 1.7, flex: 1 }}>
        <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.85rem' }}>
           Usage Agreement
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: '#fff' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>1. Acceptance of Terms</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             By accessing and using Autodrop, you accept and agree to be bound by the terms and provision of this agreement. Furthermore, when using Autodrop, you are subject to the terms of service mandated by Instagram and Meta Platforms, Inc.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>2. Acceptable Use & Anti-Spam Policy</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Autodrop provides automation strictly limited to organic engagement triggered by the end-user (e.g., commenting a specific keyword). 
          </p>
          <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>You agree NOT to use the platform to send unsolicited outbound cold DMs.</li>
            <li>You agree to comply with Instagram's 24-hour standard messaging window.</li>
            <li>You agree that failure to abide by Meta's anti-spam rules will result in immediate termination of your Autodrop account.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>3. Subscription & Billing (Razorpay)</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             Autodrop offers a free tier with explicit limits. Paid tiers are billed on a recurring monthly or annual basis via our secure payment partner, <strong>Razorpay</strong>. By upgrading to a paid tier, you agree to Razorpay's terms of service and authorize recurring charges. Service downgrades or cancellations take effect at the end of the current billing cycle.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>4. Disclaimer of Warranties</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             The service is provided on an "as is" and "as available" basis. Autodrop makes no warranties, expressed or implied, regarding the continuous availability of the Meta Graph API. API downtimes from Instagram's side are outside the control of Autodrop.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
