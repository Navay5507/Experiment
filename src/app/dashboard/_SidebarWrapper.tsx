"use client";

import { useState } from "react";
import { Menu, AlertCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Sidebar from "./Sidebar";
import styles from "./dashboard.module.css";

interface SidebarWrapperProps {
  isConnected: boolean;
  children: React.ReactNode;
}

export default function SidebarWrapper({ isConnected, children }: SidebarWrapperProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          {/* Hamburger — mobile only */}
          <button
            className={styles.hamburgerBtn}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} color="#fff" />
          </button>

          <div className={styles.pageTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Dashboard
            {isConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.2rem 0.7rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}/>
                Connected
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.2rem 0.7rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600 }}>
                <AlertCircle size={12} /> No Instagram
              </div>
            )}
          </div>

          <div className={styles.userProfile}>
            <UserButton appearance={{ elements: { avatarBox: { width: 34, height: 34 } } }} />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
