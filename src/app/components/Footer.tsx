"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import styles from "../page.module.css";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "4rem 0 2rem", background: "#000000", position: "relative", zIndex: 10 }}>
      <div className={styles.container} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" }}>
        
        {/* Logo and Tagline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Image src="/autodrop_icon_transparent.png" alt="AutoDrop Logo" width={48} height={48} style={{ objectFit: "contain" }} />
            <div style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.02em", display: "flex", alignItems: "center", lineHeight: 1 }}>
              <span style={{ color: "#5b85ff" }}>Auto</span>
              <span style={{ color: "#ffffff" }}>Drop</span>
            </div>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", opacity: 0.7, textAlign: "center" }}>Instagram DM Automation, Simplified.</p>
        </div>

        {/* Footer Navigation */}
        <div style={{ display: "flex", gap: "2rem", color: "#9ca3af", fontSize: "0.95rem", flexWrap: "wrap", justifyContent: "center", fontWeight: 500 }}>
          <Link href="/#features" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Features</Link>
          <Link href="/pricing" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Pricing</Link>
          <Link href="/affiliates" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Partner Program</Link>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">About</Link>
          <a href="mailto:support@autodrop.in" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Contact Us</a>
          <Link href="/terms" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Terms of Service</Link>
          <Link href="/privacy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Privacy Policy</Link>
          <Link href="/refund-policy" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} className="hover-white">Refund Policy</Link>
        </div>

        {/* Decorative Divider */}
        <div style={{ width: "100%", maxWidth: "500px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />

        {/* Copyright and Meta Partner Badge */}
        <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.85rem", opacity: 0.6, lineHeight: 1.8 }}>
          <p>&copy; {new Date().getFullYear()} AutoDrop. All rights reserved.</p>
          <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
            <ShieldCheck size={16} color="#10b981" /> Official Meta Business Partner
          </p>
        </div>
      </div>

      {/* Gigantic Background Text */}
      <div style={{ width: "100%", maxWidth: "100vw", overflowX: "clip", display: "flex", justifyContent: "center", marginTop: "3rem", pointerEvents: "none", userSelect: "none" }}>
        <span style={{ fontSize: "clamp(3rem, 15vw, 240px)", fontWeight: 900, lineHeight: 0.75, letterSpacing: "-0.06em", background: "linear-gradient(180deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          AutoDrop
        </span>
      </div>

      <style jsx global>{`
        .hover-white:hover {
          color: #ffffff !important;
        }
      `}</style>
    </footer>
  );
}
