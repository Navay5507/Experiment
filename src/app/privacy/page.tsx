"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-inter)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 1.5rem 4rem', lineHeight: 1.7, flex: 1 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-heading)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

        <section style={{ marginBottom: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Definitions</h2>
          <ul style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Autodrop.</li>
            <li><strong>Cookies</strong> are small files that are placed on Your computer or mobile device.</li>
            <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
            <li><strong>Service</strong> refers to the Website accessible at autodrop.in.</li>
            <li><strong>Third-party Social Media Service</strong> refers to Instagram and Facebook via Meta Platforms, Inc.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Collecting and Using Your Personal Data</h2>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: 'var(--text-main)' }}>Personal Data</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            When You sign in using Clerk, we collect Your email address, first name, and last name.
          </p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: 'var(--text-main)' }}>Instagram / Meta API Data</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
             We use the Instagram Graph API and Facebook Login to access your Instagram Business Profile metrics, incoming comments, and direct messages strictly to execute user-defined keyword triggers. We NEVER store or request your Instagram password. Authentication is entirely OAuth-based via Meta.
          </p>
        </section>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Meta / Facebook Data Deletion Instructions</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
             Autodrop logs in via Facebook to manage your Instagram Professional Account. If you wish to revoke our access and delete your configuration data:
          </p>
          <ol style={{ color: 'var(--text-muted)', paddingLeft: '1.5rem', listStyleType: 'decimal', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Go to your Facebook Account Settings and Business Integrations.</li>
            <li>Find "Autodrop" in the list of connected apps.</li>
            <li>Click "Remove". Upon removal, our system receives a webhook from Meta and instantly purges all of your automations, tracked metrics, and stored OAuth tokens.</li>
          </ol>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Payment Processors</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Autodrop uses <strong>Razorpay</strong> as its exclusive payment Gateway for all paid subscriptions. We do not store your credit card details or payment instruments on our servers. All transactions are securely processed directly by Razorpay according to their strict privacy and security guidelines.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-heading)' }}>Contact Us</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            If you have questions or comments, email us at support@autodrop.in or call us at 9050997755.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
