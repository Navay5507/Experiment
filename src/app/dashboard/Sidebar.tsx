"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, MessageCircle, LayoutDashboard, Zap, Users, Activity, Settings, Headphones, BookOpen, Gift, X, ShoppingBag, GraduationCap } from "lucide-react";
import styles from "./dashboard.module.css";
import { useState, useEffect } from "react";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isBottom?: boolean;
  isActive: boolean;
  isComingSoon?: boolean;
  target?: string;
  onNavigate?: () => void;
}

function NavItem({ href, icon: Icon, label, isBottom = false, isActive, isComingSoon = false, target, onNavigate }: NavItemProps) {
  const content = (
    <motion.div
        whileHover={!isComingSoon ? { x: 4, backgroundColor: "rgba(255,255,255,0.03)" } : {}}
        className={styles.navItem}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1.25rem',
          borderRadius: '12px', color: isActive ? '#fff' : 'var(--text-muted)',
          background: isActive ? 'linear-gradient(90deg, rgba(99,102,241,0.1), transparent)' : 'transparent',
          borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
          marginTop: isBottom ? 'auto' : 0,
          position: 'relative', overflow: 'hidden'
        }}>
        <motion.div animate={{ rotate: isActive ? [-10, 10, 0] : 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
          <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
        </motion.div>
        <span style={{ fontWeight: isActive ? 600 : 500 }}>{label}</span>

        {isActive && (
          <div
            style={{ position: 'absolute', top: '50%', right: -15, width: 30, height: 30, background: 'var(--primary)', filter: 'blur(20px)', borderRadius: '50%', transform: 'translateY(-50%)', opacity: 0.2 }}
          />
        )}
        
        {isComingSoon && (
          <span style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', fontWeight: 600 }}>
            Soon
          </span>
        )}
      </motion.div>
  );
  
  if (isComingSoon) return <div style={{ opacity: 0.6, cursor: 'not-allowed' }}>{content}</div>;
  return <Link href={href} target={target} style={{ textDecoration: 'none' }} onClick={onNavigate}>{content}</Link>;
}

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isStoreHovered, setIsStoreHovered] = useState(false);
  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  const navContent = (
    <>
      <div className={styles.brand} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <img src="/autodrop_icon_transparent.png" alt="AutoDrop Symbol" style={{ height: 34, objectFit: 'contain' }} />
          </motion.div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
            <span style={{ color: '#5b85ff' }}>Auto</span>
            <span style={{ color: '#ffffff' }}>Drop</span>
          </div>
        </Link>
        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className={styles.sidebarCloseBtn}
          aria-label="Close sidebar"
        >
          <X size={20} color="var(--text-muted)" />
        </button>
      </div>
      <nav className={styles.nav} style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" isActive={isActive('/dashboard')} onNavigate={onClose} />
        <NavItem href="/dashboard/automations" icon={Zap} label="Automations" isActive={isActive('/dashboard/automations')} onNavigate={onClose} />
        <NavItem href="/dashboard/leads" icon={Users} label="CRM Leads" isActive={isActive('/dashboard/leads')} onNavigate={onClose} />
        <NavItem href="/dashboard/store" icon={ShoppingBag} label="Digital Store" isActive={false} isComingSoon={true} />
        <NavItem href="/dashboard/knowledge-base" icon={BookOpen} label="AI Knowledge Base" isActive={false} isComingSoon={true} />
        <NavItem href="/dashboard/learn" icon={GraduationCap} label="Learn" isActive={isActive('/dashboard/learn')} onNavigate={onClose} />
        <NavItem href="/dashboard/referral" icon={Gift} label="Referral Program" isActive={isActive('/dashboard/referral')} onNavigate={onClose} />
        <NavItem href="/dashboard/logs" icon={Activity} label="System Logs" isActive={isActive('/dashboard/logs')} onNavigate={onClose} />
        <NavItem href="/dashboard/settings" icon={Settings} label="Settings" isActive={isActive('/dashboard/settings')} onNavigate={onClose} />

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <NavItem href="/support" icon={Headphones} label="Get Support" isBottom isActive={isActive('/support')} onNavigate={onClose} />
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop: always-visible sidebar */}
      <aside className={`${styles.sidebar} ${styles.desktopSidebar}`} style={{ background: 'rgba(18,24,33,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        {navContent}
      </aside>

      {/* Mobile: slide-in drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.sidebarBackdrop}
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`${styles.sidebar} ${styles.mobileSidebar}`}
              style={{ background: 'rgba(12,16,23,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
