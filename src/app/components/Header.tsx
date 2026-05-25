"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import styles from "../page.module.css";

const CURRENCY_OPTIONS = [
  { value: "INR", label: "🇮🇳 India (INR)" },
  { value: "USD", label: "🇺🇸 United States (USD)" },
  { value: "EUR", label: "🇪🇺 Europe (EUR)" },
  { value: "GBP", label: "🇬🇧 United Kingdom (GBP)" },
  { value: "CAD", label: "🇨🇦 Canada (CAD)" },
  { value: "AUD", label: "🇦🇺 Australia (AUD)" },
  { value: "NZD", label: "🇳🇿 New Zealand (NZD)" },
  { value: "ZAR", label: "🇿🇦 South Africa (ZAR)" },
  { value: "SGD", label: "🇸🇬 Singapore (SGD)" },
  { value: "NGN", label: "🇳🇬 Nigeria (NGN)" },
];

const DESKTOP_CURRENCY_OPTIONS = [
  { value: "INR", label: "🇮🇳 INR" },
  { value: "USD", label: "🇺🇸 USD" },
  { value: "EUR", label: "🇪🇺 EUR" },
  { value: "GBP", label: "🇬🇧 GBP" },
  { value: "CAD", label: "🇨🇦 CAD" },
  { value: "AUD", label: "🇦🇺 AUD" },
  { value: "NZD", label: "🇳🇿 NZD" },
  { value: "ZAR", label: "🇿🇦 ZAR" },
  { value: "SGD", label: "🇸🇬 SGD" },
  { value: "NGN", label: "🇳🇬 NGN" },
];

interface HeaderProps {
  activePath?: string;
}

export default function Header({ activePath }: HeaderProps) {
  const { userId, isLoaded } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    const saved = localStorage.getItem("selected-currency");
    if (saved) {
      setCurrency(saved);
    }

    const handleGlobalChange = () => {
      const savedNew = localStorage.getItem("selected-currency");
      if (savedNew) {
        setCurrency(savedNew);
      }
    };
    window.addEventListener("currency-change", handleGlobalChange);
    return () => window.removeEventListener("currency-change", handleGlobalChange);
  }, []);

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    localStorage.setItem("selected-currency", val);
    window.dispatchEvent(new Event("currency-change"));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setIsMobileMenuOpen(false);
    if (window.location.pathname === "/") {
      e.preventDefault();
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div 
      className={styles.navbarWrapper} 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        background: isScrolled ? "var(--navbar-bg)" : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled ? "1px solid var(--border)" : "1px solid transparent",
        padding: isScrolled ? "0.75rem 0" : "1.25rem 0",
      }}
    >
      <nav className={styles.navbar} style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className={styles.logo} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Image src="/autodrop_icon_transparent.png" alt="AutoDrop Logo" width={38} height={38} style={{ objectFit: "contain" }} />
            <div style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.02em", display: "flex", alignItems: "center", lineHeight: 1 }}>
              <span style={{ color: "#5b85ff" }}>Auto</span>
              <span style={{ color: "var(--text-heading)" }}>Drop</span>
            </div>
          </div>
        </Link>

        {/* Mobile controls */}
        <div className={styles.mobileControls}>
          <div className={styles.mobileThemeToggle}>
            <ThemeToggle />
          </div>
          <button 
            className={styles.mobileMenuToggle} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.mobileNavOpen : ""}`}>
          <a 
            href="/#features" 
            className={styles.navLink} 
            onClick={(e) => handleLinkClick(e, "features")}
            style={{ color: activePath === "features" ? "var(--text-heading)" : "var(--text-muted)" }}
          >
            Features
          </a>
          <a 
            href="/#how-it-works" 
            className={styles.navLink} 
            onClick={(e) => handleLinkClick(e, "how-it-works")}
            style={{ color: activePath === "how-it-works" ? "var(--text-heading)" : "var(--text-muted)" }}
          >
            How it Works
          </a>
          <Link 
            href="/pricing" 
            className={styles.navLink} 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: activePath === "pricing" ? "var(--text-heading)" : "var(--text-muted)", fontWeight: activePath === "pricing" ? 600 : 400 }}
          >
            Pricing
          </Link>
          <Link 
            href="/affiliates" 
            className={styles.navLink} 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: activePath === "affiliates" ? "var(--text-heading)" : "var(--text-muted)", fontWeight: activePath === "affiliates" ? 600 : 400 }}
          >
            Partner Program
          </Link>
          <Link 
            href="/support" 
            className={styles.navLink} 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: activePath === "support" ? "var(--text-heading)" : "var(--text-muted)", fontWeight: activePath === "support" ? 600 : 400 }}
          >
            Book a Call
          </Link>
          <Link 
            href="/about" 
            className={styles.navLink} 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ color: activePath === "about" ? "var(--text-heading)" : "var(--text-muted)", fontWeight: activePath === "about" ? 600 : 400 }}
          >
            About
          </Link>
          
          {isMobileMenuOpen && (
            <div style={{ display: "flex", gap: "1rem", flexDirection: "column", alignItems: "center", marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", width: "100%" }}>
              {/* Mobile Currency Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", justifyContent: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>Currency:</span>
                <select 
                  value={currency} 
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-main)",
                    padding: "0.5rem 1rem",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    width: "180px",
                    textAlign: "center"
                  }}
                >
                  {CURRENCY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {!isLoaded ? (
                <div className="premium-btn" style={{ fontSize: "1rem", padding: "0.8rem 1.5rem", width: "100%", textAlign: "center", opacity: 0.5 }}>Loading...</div>
              ) : userId ? (
                <Link href="/dashboard" className="premium-btn" style={{ fontSize: "1rem", padding: "0.8rem 1.5rem", width: "100%", textAlign: "center" }} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              ) : (
                <Link href="/sign-in" className="premium-btn" style={{ fontSize: "1rem", padding: "0.8rem 1.5rem", width: "100%", textAlign: "center" }} onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className={styles.authCol}>
          {/* Desktop Currency Selector */}
          <select 
            value={currency} 
            onChange={(e) => handleCurrencyChange(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              color: "var(--text-main)",
              padding: "0.3rem 0.5rem",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              outline: "none",
              marginRight: "0.75rem",
              width: "auto"
            }}
          >
            {DESKTOP_CURRENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: "var(--surface)", color: "var(--text-main)" }}>
                {opt.label}
              </option>
            ))}
          </select>
          <ThemeToggle />
          {!isLoaded ? (
            <div className="premium-btn" style={{ fontSize: "0.9rem", padding: "0.6rem 1.5rem", opacity: 0.5 }}>Loading...</div>
          ) : userId ? (
            <Link href="/dashboard" className="premium-btn" style={{ fontSize: "0.9rem", padding: "0.6rem 1.5rem" }}>Dashboard</Link>
          ) : (
            <Link href="/sign-in" className="premium-btn" style={{ fontSize: "0.9rem", padding: "0.6rem 1.5rem" }}>Sign In</Link>
          )}
        </div>
      </nav>
    </div>
  );
}
