"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function RefundPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 1.5rem 4rem', lineHeight: 1.7, flex: 1 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>Return and Refund Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Cancellation & Subscriptions</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             Because Autodrop offers a completely Free version of our service for trial purposes, we do not generally offer refunds for subscription payments once they have been processed via Razorpay. 
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
             You are free to cancel your subscription at any time from the Billing page in your Dashboard. Cancellation will halt any future recurring charges, and you will retain access to your premium features until the end of your prepaid billing cycle.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Conditions for Refunds</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             We strictly follow these rules regarding refunds:
          </p>
          <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <li><strong>First Month Payment:</strong> No refunds are provided for the first month of any paid subscription tier.</li>
            <li><strong>Subsequent Months:</strong> If a recurring payment is made for the second month (or later) by mistake, the user has <strong>3 days</strong> from the date of the charge to report the problem and request a refund. Refunds initiated within this period will be processed back to the original payment method.</li>
            <li>Refunds typically take 5-7 business days to reflect in your account once initiated via Razorpay.</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Contacting Support</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             If you believe you meet the criteria for a refund, please contact us at support@autodrop.in within 7 days of the charge occurring.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
