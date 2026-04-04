"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon, MessageCircle, LayoutDashboard, Zap, Users, Activity, Settings, Headphones, BookOpen, Gift } from "lucide-react";
import styles from "./dashboard.module.css";

// Defined OUTSIDE the render function to prevent recreation on every render
interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isBottom?: boolean;
  isActive: boolean;
  isComingSoon?: boolean;
  target?: string;
}

function NavItem({ href, icon: Icon, label, isBottom = false, isActive, isComingSoon = false, target }: NavItemProps) {
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
  return <Link href={href} target={target} style={{ textDecoration: 'none' }}>{content}</Link>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <aside className={styles.sidebar} style={{ background: 'rgba(18,24,33,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      <div className={styles.brand} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2rem 1.75rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
            <MessageCircle size={28} className={styles.brandIcon} style={{ color: 'var(--primary)' }} />
          </motion.div>
          <span style={{ fontSize: '1.4rem', letterSpacing: '-0.03em', color: '#fff' }}>Autodrop</span>
        </Link>
      </div>
      <nav className={styles.nav} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" isActive={isActive('/dashboard')} />
        <NavItem href="/dashboard/automations" icon={Zap} label="Automations" isActive={isActive('/dashboard/automations')} />
        <NavItem href="/dashboard/leads" icon={Users} label="CRM Leads" isActive={isActive('/dashboard/leads')} />
        <NavItem href="/dashboard/knowledge-base" icon={BookOpen} label="AI Base" isActive={false} isComingSoon={true} />
        <NavItem href="/dashboard/referral" icon={Gift} label="Referral" isActive={false} isComingSoon={true} />
        <NavItem href="/dashboard/logs" icon={Activity} label="Sys Logs" isActive={isActive('/dashboard/logs')} />
        <NavItem href="/dashboard/settings" icon={Settings} label="Settings" isActive={isActive('/dashboard/settings')} />

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <NavItem href="/support" icon={Headphones} label="Support" isBottom isActive={isActive('/support')} />
        </div>
      </nav>
    </aside>
  );
}
