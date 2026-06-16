"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ShippingPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 1.5rem 4rem', lineHeight: 1.7, flex: 1 }}>
        <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.85rem' }}>
           Fulfillment
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: '#fff' }}>Shipping & Delivery Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Digital Service Only</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
             Autodrop is a purely digital Software-as-a-Service (SaaS) product. We do not manufacture, sell, or distribute any physical goods.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
             Because our service is entirely digital, <strong>there is no physical shipping or delivery involved.</strong>
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Instant Access & Delivery</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             Upon successful payment for a premium subscription via Razorpay, your account is immediately upgraded. Access to premium features is granted instantly, which constitutes the final "delivery" of our service to you.
          </p>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Contact Support</h2>
          <p style={{ color: 'var(--text-muted)' }}>
             If you experience any delay or issues accessing your premium features after payment, please contact us at support@autodrop.in or call us at 8053070528.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
