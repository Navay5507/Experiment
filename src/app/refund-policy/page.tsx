import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)' }}>
      <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
             <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', lineHeight: 1.7 }}>
        <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.85rem' }}>
           Billing Protocol
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: '#fff' }}>Return and Refund Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Cancellation & Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             Because Autodrop offers a completely Free version of our service for trial purposes, we do not generally offer refunds for subscription payments once they have been processed via Razorpay. 
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
             You are free to cancel your subscription at any time from the Billing page in your Dashboard. Cancellation will halt any future recurring charges, and you will retain access to your premium features until the end of your prepaid billing cycle.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Conditions for Refunds</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             We only issue full or partial refunds under the following strictly defined conditions:
          </p>
          <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <li>If there is a catastrophic technical failure directly attributable to Autodrop that prevents the service from operating for more than 7 consecutive days.</li>
            <li>If you were charged accidentally due to a system glitch in our Razorpay integration.</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Contacting Support</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             If you believe you meet the criteria for a refund, please contact us at support@autodrop.in within 7 days of the charge occurring.
          </p>
        </section>

      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
         &copy; {new Date().getFullYear()} Autodrop. All rights reserved.
      </footer>
    </div>
  );
}
