"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import styles from "../page.module.css";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "3rem 0 1.5rem", background: "var(--surface)", position: "relative", zIndex: 10, overflow: "hidden", width: "100%" }}>
      <div className={styles.container} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
        
        {/* Logo and Tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Image src="/autodrop_icon_transparent.png" alt="AutoDrop Logo" width={38} height={38} style={{ objectFit: "contain" }} />
            <div style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.02em", display: "flex", alignItems: "center", lineHeight: 1 }}>
              <span style={{ color: "#5b85ff" }}>Auto</span>
              <span style={{ color: "var(--text-heading)" }}>Drop</span>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", opacity: 0.7, textAlign: "center" }}>Instagram DM Automation, Simplified.</p>
        </div>

        {/* Footer Navigation */}
        <div style={{ display: "flex", gap: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem", flexWrap: "wrap", justifyContent: "center", fontWeight: 500 }}>
          <Link href="/#features" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Features</Link>
          <Link href="/pricing" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Pricing</Link>
          <Link href="/affiliates" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Partner Program</Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">About</Link>
          <a href="mailto:support@autodrop.in" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Contact Us</a>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Terms of Service</Link>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Privacy Policy</Link>
          <Link href="/refund-policy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Refund Policy</Link>
          <Link href="/shipping-policy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-theme-heading">Shipping Policy</Link>
        </div>

        {/* Decorative Divider */}
        <div style={{ width: "100%", maxWidth: "400px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

        {/* Copyright and Meta Partner Badge */}
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", opacity: 0.6, lineHeight: 1.8 }}>
          <p>&copy; {new Date().getFullYear()} AutoDrop. All rights reserved.</p>
          <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
            <ShieldCheck size={16} color="#10b981" /> Official Meta Business Partner
          </p>
        </div>
      </div>

      {/* Gigantic Background Text */}
      <div style={{ width: "100%", overflow: "hidden", display: "flex", justifyContent: "center", marginTop: "2rem", pointerEvents: "none", userSelect: "none", position: "relative" }}>
        <span style={{ fontSize: "clamp(2.5rem, 16vw, 240px)", fontWeight: 900, lineHeight: 0.75, letterSpacing: "-0.06em", background: "linear-gradient(180deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          Autodrop
        </span>
      </div>

      <style jsx global>{`
        .hover-theme-heading:hover {
          color: var(--text-heading) !important;
        }
      `}</style>
    </footer>
  );
}
