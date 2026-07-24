"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, useMotionValue } from "framer-motion";
import { MessageCircle, Zap, ShieldCheck, ArrowRight, MousePointer2, Sparkles, RefreshCcw, Database, Tv, AtSign, Heart, Video, HandMetal, Send, Infinity as InfinityIcon, CheckCircle2, Loader2, Plus, Menu, X, ChevronDown, ShoppingBag, Bookmark, MoreHorizontal, Gauge, Cpu } from "lucide-react";
import styles from "./page.module.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Dynamic Feature Toggle: Set to false to immediately revert the landing page to the original layout
const USE_NOOB_FRIENDLY_HERO = true;
const USE_NOOB_FRIENDLY_FEATURES = true;

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
   <div>
      {children}
   </div>
);

const HeroMockupElement = ({ isMobile = false }: { isMobile?: boolean }) => (
   <FadeIn delay={0.4}>
      <div className={styles.heroMockupContainer}>

         <motion.div
            animate={isMobile ? { y: [0, -8, 0] } : { y: [0, -10, 0] }}
            transition={{ duration: isMobile ? 6 : 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 5, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <HeroUseCases />

         </motion.div>

         <motion.div
            animate={{ y: [40, -40], opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={styles.ambientBubbleLeft}>
            <div className={styles.ambientCommentAvatar} style={{ background: 'linear-gradient(45deg, #f09433, #dc2743)' }}></div>
            <div className={styles.ambientCommentContent}>
               <span className={styles.ambientCommentUser}>@sarah_jane</span>
               <span className={styles.ambientCommentText}>Send me the link! 😍</span>
            </div>
         </motion.div>

         <motion.div
            animate={{ y: [60, -60], opacity: [0, 1, 0] }}
            transition={{ duration: 4.5, delay: 1.5, repeat: Infinity, ease: "linear" }}
            className={styles.ambientBubbleRight}>
            <div className={styles.ambientCommentAvatar} style={{ background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)' }}></div>
            <div className={styles.ambientCommentContent}>
               <span className={styles.ambientCommentUser}>@mike_builder</span>
               <span className={styles.ambientCommentText}>price pls 💰</span>
            </div>
         </motion.div>

         <motion.div
            animate={{ y: [50, -50], opacity: [0, 1, 0] }}
            transition={{ duration: 5, delay: 0.8, repeat: Infinity, ease: "linear" }}
            className={styles.ambientBubbleTopLeft}>
            <div className={styles.ambientCommentAvatar} style={{ background: 'linear-gradient(45deg, #10b981, #3b82f6)' }}></div>
            <div className={styles.ambientCommentContent}>
               <span className={styles.ambientCommentUser}>@tech_guru</span>
               <span className={styles.ambientCommentText}>DESK</span>
            </div>
         </motion.div>

         <motion.div
            animate={{ y: [70, -70], opacity: [0, 1, 0] }}
            transition={{ duration: 4.2, delay: 2.5, repeat: Infinity, ease: "linear" }}
            className={styles.ambientBubbleTopRight}>
            <div className={styles.ambientCommentAvatar} style={{ background: 'linear-gradient(45deg, #8b5cf6, #ec4899)' }}></div>
            <div className={styles.ambientCommentContent}>
               <span className={styles.ambientCommentUser}>@emily_design</span>
               <span className={styles.ambientCommentText}>details? 🔥</span>
            </div>
         </motion.div>

         <motion.div
            animate={{ scale: [0.9, 1, 0.9], opacity: [0, 1, 0], y: [-10, -20, -10] }}
            transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`${styles.ambientDmPopup} glass-panel`}
            style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
               <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={12} color="#fff" style={{ marginLeft: '-2px' }} />
               </div>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-heading)', fontWeight: 600 }}>DM Sent Successfully</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AutoDrop delivered your exclusive link instantly. 🚀</div>
         </motion.div>

      </div>
   </FadeIn>
);

const CountUpMetric = ({ target, prefix = '', suffix = '', decimals = 0 }: { target: number, prefix?: string, suffix?: string, decimals?: number }) => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: false, amount: 0.5 });
   const [val, setVal] = useState(0);

   useEffect(() => {
      if (isInView) {
         setVal(0);
         let current = 0;
         const inc = target / 40;
         const interval = setInterval(() => {
            current += inc;
            if (current >= target) {
               current = target;
               clearInterval(interval);
            }
            setVal(current);
         }, 40);
         return () => clearInterval(interval);
      } else {
         setVal(0);
      }
   }, [isInView, target]);

   return <span ref={ref}>{prefix}{val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>
};

const Typewriter = ({ text }: { text: string }) => {
   const [display, setDisplay] = useState('');
   useEffect(() => {
      let i = 0;
      const int = setInterval(() => {
         setDisplay(text.substr(0, i + 1));
         i++;
         if (i === text.length) clearInterval(int);
      }, 100);
      return () => clearInterval(int);
   }, [text]);
   return <span style={{ color: '#fff' }}>{display}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.4 }}>|</motion.span></span>;
}

const UI_Step1 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
      let isActive = true;
      const run = async () => {
         while (isActive) {
            setStep(0);
            await new Promise(r => setTimeout(r, 1500));
            if (!isActive) break;
            setStep(1); // Cursor hovers over button
            await new Promise(r => setTimeout(r, 600));
            if (!isActive) break;
            setStep(2); // Button clicks
            await new Promise(r => setTimeout(r, 200));
            if (!isActive) break;
            setStep(3); // Loading state on button
            await new Promise(r => setTimeout(r, 1500));
            if (!isActive) break;
            setStep(4); // Modal disappears, success toast shows
            await new Promise(r => setTimeout(r, 4000));
         }
      };
      run();
      return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '350px', background: 'var(--card-bg)', borderRadius: '24px', overflow: 'hidden' }}>
         {/* Background Grid Pattern for realistic context */}
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />

         <AnimatePresence mode="wait">
            {step < 4 ? (
               <motion.div
                  key="oauth-modal"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  style={{ width: '320px', background: '#fff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e5e7eb', zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
               >
                  {/* Fake Browser/Modal Header */}
                  <div style={{ background: '#f9fafb', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ fontWeight: 700, color: '#1877f2', fontSize: '1rem', letterSpacing: '-0.5px' }}>facebook</div>
                     <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e5e7eb' }} />
                     </div>
                  </div>

                  <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                     {/* Avatars linking */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="avatar" width={44} height={44} style={{ borderRadius: '50%', border: '2px solid #fff' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} />
                           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} />
                           <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af' }} />
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}>
                           <MessageCircle size={24} color="#fff" />
                        </div>
                     </div>

                     <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>AutoDrop is requesting access</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>AutoDrop will receive access to your Instagram account messages and comments.</div>
                     </div>

                     {/* Button */}
                     <motion.div
                        animate={{ scale: step === 2 ? 0.95 : 1, filter: step === 1 ? 'brightness(0.95)' : 'brightness(1)' }}
                        style={{ width: '100%', background: '#1877f2', color: '#fff', borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem', marginTop: '8px', cursor: 'pointer', height: '40px' }}
                     >
                        {step === 3 ? <Loader2 size={18} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : 'Continue as Sarah'}
                     </motion.div>
                  </div>
               </motion.div>
            ) : (
               <motion.div
                  key="success-toast"
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e5e7eb', zIndex: 10 }}
               >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <CheckCircle2 size={24} color="#059669" />
                  </div>
                  <div>
                     <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Instagram Linked!</div>
                     <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Webhooks are now active.</div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Animated Cursor */}
         {step < 4 && (
            <motion.div
               animate={{
                  x: step === 0 ? 120 : 0,
                  y: step === 0 ? 180 : 100, // Move onto the 'Continue' button
                  scale: step === 2 ? 0.8 : 1,
                  opacity: step === 3 ? 0 : 1
               }}
               transition={{ duration: step === 0 ? 0 : 0.6, ease: "easeInOut" }}
               style={{ position: 'absolute', zIndex: 20 }}
            >
               <MousePointer2 size={28} fill="#111827" color="#fff" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
            </motion.div>
         )}
      </div>
   );
};

const UI_Step2 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
      let isActive = true;
      const run = async () => {
         while (isActive) {
            setStep(0);
            await new Promise(r => setTimeout(r, 1000));
            if (!isActive) break;
            setStep(1); // Typing pricing
            await new Promise(r => setTimeout(r, 1500));
            if (!isActive) break;
            setStep(2); // Badge pricing
            await new Promise(r => setTimeout(r, 800));
            if (!isActive) break;
            setStep(3); // Typing link
            await new Promise(r => setTimeout(r, 1500));
            if (!isActive) break;
            setStep(4); // Badge link
            await new Promise(r => setTimeout(r, 800));
            if (!isActive) break;
            setStep(5); // Action node expands/activates
            await new Promise(r => setTimeout(r, 4000));
         }
      };
      run();
      return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
         {/* Top Node: Trigger */}
         <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
               <div style={{ background: '#fef2f2', padding: '6px', borderRadius: '8px' }}>
                  <MessageCircle size={16} color="#ef4444" />
               </div>
               <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Trigger: New Comment</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>On any Reel or Post</div>
               </div>
               <div style={{ marginLeft: 'auto' }}>
                  <MoreHorizontal size={16} color="#9ca3af" />
               </div>
            </div>
            <div style={{ padding: '16px' }}>
               <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Condition</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#111827', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>Matches exactly</div>
               </div>
               
               {/* Keywords Input Simulation */}
               <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', minHeight: '38px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', background: '#fff', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                  <AnimatePresence>
                     {step >= 2 && (
                        <motion.div key="badge-pricing" initial={{ opacity: 0, scale: 0.5, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                           pricing <span style={{ opacity: 0.5, cursor: 'pointer' }}>×</span>
                        </motion.div>
                     )}
                     {step >= 4 && (
                        <motion.div key="badge-link" initial={{ opacity: 0, scale: 0.5, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                           link <span style={{ opacity: 0.5, cursor: 'pointer' }}>×</span>
                        </motion.div>
                     )}
                  </AnimatePresence>
                  
                  <div style={{ fontSize: '0.85rem', color: '#111827', display: 'flex', alignItems: 'center', height: '24px' }}>
                     {step === 1 ? <Typewriter key="tw-pricing" text="pricing" /> :
                        step === 3 ? <Typewriter key="tw-link" text="link" /> :
                           step >= 5 ? null :
                              <span key="tw-typing" style={{ opacity: 0.5 }}>Type keyword...<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.4 }}>|</motion.span></span>}
                  </div>
               </div>
            </div>
         </div>

         {/* Connection Line */}
         <div style={{ marginLeft: '32px', width: '2px', height: '24px', background: step >= 5 ? '#10b981' : '#e5e7eb', position: 'relative', overflow: 'hidden', transition: 'background 0.5s' }}>
            {step >= 5 && (
               <motion.div 
                  initial={{ top: '-100%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', width: '100%', height: '50%', background: 'linear-gradient(to bottom, transparent, #fff)' }}
               />
            )}
         </div>

         {/* Bottom Node: Action */}
         <motion.div
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: step >= 5 ? 1 : 0.5, scale: step >= 5 ? 1 : 0.98 }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{ background: '#fff', border: step >= 5 ? '2px solid #10b981' : '1px solid #e5e7eb', borderRadius: '12px', boxShadow: step >= 5 ? '0 10px 30px -5px rgba(16,185,129,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', zIndex: 2 }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: step >= 5 ? '#ecfdf5' : '#f9fafb', transition: 'background 0.5s' }}>
               <div style={{ background: step >= 5 ? '#10b981' : '#e5e7eb', padding: '6px', borderRadius: '8px', transition: 'background 0.5s' }}>
                  <Send size={16} color="#fff" />
               </div>
               <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Action: Send DM</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Summer Drop Template</div>
               </div>
               <div style={{ marginLeft: 'auto' }}>
                  <motion.div animate={{ rotate: step >= 5 ? 360 : 0, scale: step >= 5 ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.5 }}>
                     <CheckCircle2 size={20} color={step >= 5 ? "#10b981" : "#d1d5db"} />
                  </motion.div>
               </div>
            </div>
         </motion.div>
      </div>
   );
};

const UI_Step3 = () => {
   const ref = useRef(null);
   const [step, setStep] = useState(0);

   useEffect(() => {
      let isActive = true;
      const run = async () => {
         while (isActive) {
            setStep(0);
            await new Promise(r => setTimeout(r, 1000));
            if (!isActive) break;
            setStep(1); // Trigger graph and count up
            await new Promise(r => setTimeout(r, 6000));
         }
      };
      run();
      return () => { isActive = false; };
   }, []);

   return (
      <div ref={ref} style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-bg)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' }}>
         {/* Fake Dashboard Header */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <div>
               <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Automation</div>
               <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {step >= 1 ? <CountUpMetric target={14239} /> : "0"} 
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: step >= 1 ? 1 : 0, scale: step >= 1 ? 1 : 0.8 }} transition={{ delay: 0.5 }} style={{ background: '#d1fae5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                     +24%
                  </motion.div>
               </div>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-heading)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
               Last 30 Days <ChevronDown size={14} />
            </div>
         </div>

         {/* Multi-line chart simulation */}
         <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '6px', position: 'relative', marginTop: '8px' }}>
            {/* Horizontal Grid lines */}
            <div style={{ position: 'absolute', top: '0%', left: 0, right: 0, borderTop: '1px dashed var(--border)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed var(--border)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '0%', left: 0, right: 0, borderTop: '1px solid var(--border)', zIndex: 0 }} />
            
            {/* Chart Bars */}
            {[20, 35, 25, 45, 60, 50, 75, 90, 80, 100].map((h, i) => (
               <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', zIndex: 1, gap: '2px' }}>
                  <motion.div animate={{ height: step >= 1 ? `${h}%` : '0%' }} transition={{ duration: 0.8, delay: i * 0.05, type: 'spring', bounce: 0.2 }} style={{ width: '100%', background: 'linear-gradient(to top, #3b82f6, #60a5fa)', borderRadius: '4px 4px 0 0', opacity: 0.9 }} />
               </div>
            ))}
         </div>

         {/* Mini Stats Row */}
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={12} color="#4338ca" /></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Comments Replied</div>
               </div>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>{step >= 1 ? <CountUpMetric target={14239} /> : "0"}</div>
            </div>
            
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MousePointer2 size={12} color="#be185d" /></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Link Clicks</div>
               </div>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>{step >= 1 ? <CountUpMetric target={3842} /> : "0"}</div>
            </div>
         </div>

         {/* Live Activity Feed Overlay Simulation */}
         <AnimatePresence>
            {step >= 1 && (
               <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                  style={{ position: 'absolute', bottom: '24px', right: '-12px', background: '#fff', borderRadius: '12px', padding: '10px 14px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10, width: '240px' }}
               >
                  <div style={{ position: 'relative' }}>
                     <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6' }}>
                        <Image src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80" alt="avatar" width={28} height={28} style={{ borderRadius: '50%' }} />
                     </div>
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2, type: 'spring' }} style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }} />
                  </div>
                  <div>
                     <div style={{ fontSize: '0.75rem', color: '#111827' }}><span style={{ fontWeight: 700 }}>@alex_j</span> commented</div>
                     <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Auto-DM sent just now</div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

const HowItWorksInteractive = () => {
   return (
      <div className={styles.container}>
         <FadeIn><h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '6rem', color: 'var(--text-heading)', textAlign: 'center' }}>How it works</h2></FadeIn>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>

            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 1</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, lineHeight: 1.1 }}>Connect securely</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>OAuth directly into Meta's official API node. No passwords required, strictly compliant.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', minHeight: '350px', alignItems: 'center' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                     <UI_Step1 />
                  </div>
               </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn delay={0.1}>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 2</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, lineHeight: 1.1 }}>Train the triggers</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>Deploy keywords specific to your newest Reel or Static Post instantly from the dashboard.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', minHeight: '350px', alignItems: 'center' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                     <UI_Step2 />
                  </div>
               </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <FadeIn delay={0.2}>
                     <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.85rem' }}>Step 3</div>
                     <h3 style={{ fontSize: '2.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, lineHeight: 1.1 }}>Limitless engagement</h3>
                     <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.15rem' }}>AutoDrop routes inbound requests 24/7 capturing core analytics and interactions live in your dashboard.</p>
                  </FadeIn>
               </div>
               <div style={{ flex: 1, minWidth: '300px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '3rem', display: 'flex', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', minHeight: '350px', alignItems: 'center' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                     <UI_Step3 />
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};

const useCases = [
   {
      avatar: 'linear-gradient(45deg, #f09433, #dc2743)',
      handle: '@tech_gadgets',
      postPrefix: 'New desk setup! Comment ',
      trigger: 'DESK',
      postSuffix: ' for the full parts list.',
      dm: 'Sent! 📦 Check out the desk setup parts here: drop.link/desk',
      image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=600&q=80' // modern desk tech
   },
   {
      avatar: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
      handle: '@finance_coach',
      postPrefix: 'Paying too much tax? Comment ',
      trigger: 'TAX',
      postSuffix: ' to get my free 2026 cheat sheet.',
      dm: 'Here is your cheat sheet! 📄 Download: drop.link/tax-pdf',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80' // modern dashboard
   },
   {
      avatar: 'linear-gradient(45deg, #f43f5e, #f97316)',
      handle: '@stylebysarah',
      postPrefix: 'New summer drop! Comment ',
      trigger: 'LINK',
      postSuffix: " to grab it before it sells out.",
      dm: 'Sent the exact links to your DMs! 👗 drop.link/spring',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' // fashion boutique
   },
   {
      avatar: 'linear-gradient(45deg, #10b981, #3b82f6)',
      handle: '@vegan_eats',
      postPrefix: '15-minute healthy pasta! Comment ',
      trigger: 'RECIPE',
      postSuffix: " and I'll DM you the ingredients.",
      dm: 'Here is the recipe! 🥦 Enjoy your pasta: drop.link/pasta',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80' // aesthetic food bowl
   },
   {
      avatar: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
      handle: '@mr_math',
      postPrefix: 'Struggling with calculus? Comment ',
      trigger: 'STUDY',
      postSuffix: " and I'll send my free prep guide.",
      dm: 'Ace that test! 📚 Here is the prep guide: drop.link/calc',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80' // aesthetic notebook
   }
];

const HeroUseCases = () => {
   const [idx, setIdx] = useState(0);

   useEffect(() => {
      const int = setInterval(() => {
         setIdx(i => (i + 1) % useCases.length);
      }, 5500); // 5.5 seconds per case (slower)
      return () => clearInterval(int);
   }, []);

   const current = useCases[idx];

   return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         {/* Ambient volumetric glow */}
         <div style={{ position: 'absolute', width: '90%', height: '90%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

         <AnimatePresence mode="wait">
            <motion.div
               key={idx}
               initial={{ opacity: 0, y: 15, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -15, scale: 0.98 }}
               transition={{ duration: 0.8, ease: "easeInOut" }} // Slower, smoother fade
               style={{ width: '380px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1, display: 'flex', flexDirection: 'column' }}
            >
               {/* IG Post Header Mockup */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <div style={{ width: 32, height: 32, borderRadius: '50%', background: current.avatar, flexShrink: 0 }} />
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           {current.handle}
                           <CheckCircle2 size={12} color="#3b82f6" fill="#3b82f6" />
                        </div>
                     </div>
                  </div>
                  <MoreHorizontal size={20} color="var(--text-muted)" />
               </div>

               {/* IG Post Image Visual */}
               <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem', border: '1px solid var(--border)', background: 'var(--border)' }}>
                  <Image src={current.image} fill style={{ objectFit: 'cover' }} alt="Post preview" />
               </div>

               {/* IG Post Actions */}
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <Heart size={24} color="var(--text-heading)" strokeWidth={1.5} />
                     <MessageCircle size={24} color="var(--text-heading)" strokeWidth={1.5} />
                     <Send size={24} color="var(--text-heading)" strokeWidth={1.5} />
                  </div>
                  <Bookmark size={24} color="var(--text-heading)" strokeWidth={1.5} />
               </div>
               <div style={{ color: 'var(--text-heading)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  14,239 likes
               </div>

               {/* IG Post Caption */}
               <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600, marginRight: '0.5rem', color: 'var(--text-heading)' }}>{current.handle}</span>
                  {current.postPrefix}
                  <span style={{ color: '#0095f6', fontWeight: 500 }}>&apos;{current.trigger}&apos;</span>
                  {current.postSuffix}
               </div>

               {/* Simulated Trigger Comment */}
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>Add a comment...</span>
                  <motion.div
                     initial={{ scale: 1 }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                     style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0095f6' }}
                  >
                     {current.trigger}
                  </motion.div>
               </div>

               {/* DM Reply Box popping up */}
               <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1, type: 'spring', bounce: 0.3 }} // Pop delayed slower
                  style={{ background: 'var(--glass)', backdropFilter: 'blur(16px)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border)', position: 'relative' }}
               >
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--surface)', borderRadius: '50%', padding: '2px' }}>
                     <div style={{ background: '#10b981', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>
                        ✓
                     </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>DM Instant Reply</div>
                  <div style={{ color: 'var(--text-heading)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                     {current.dm}
                  </div>
               </motion.div>
            </motion.div>
         </AnimatePresence>
      </div>
   );
};

const faqs = [
   { q: "What is AutoDrop and how does it automate Instagram engagement?", a: "AutoDrop is a comprehensive Instagram automation and growth platform designed specifically for content creators and businesses to scale their engagement. As an official Meta Business Partner, AutoDrop allows users to automate their Instagram comment replies and send customized Direct Messages instantly when followers trigger specific keywords. Beyond basic automated responses, the platform offers advanced features including Follow-Gates, which require users to follow your account before unlocking exclusive content, and integrated digital product storefronts for automated selling. It incorporates sophisticated AI models to generate natural, conversational responses to customer inquiries, effectively acting as a 24/7 sales assistant. By capturing leads, automating product delivery, and respecting strict rate limits to ensure account safety, AutoDrop transforms standard Instagram interactions into high-converting sales funnels, allowing creators to monetize their audience organically without relying on traditional 'link-in-bio' friction." },
   { q: "Is AutoDrop free to use?", a: "Yes, we offer a generous free tier that lets you test our core automation features. No credit card required." },
   { q: "Why is AutoDrop free? What's the catch?", a: "There is no catch! We offer a free tier so creators can experience the magic. Our premium plans are designed for creators who want advanced automations and priority support." },
   { q: "Is AutoDrop safe to use?", a: "Absolutely. We use the official Meta Instagram Graph API, ensuring 100% compliance with Instagram's terms of service. You will never be shadowbanned for using AutoDrop." },
   { q: "Is AutoDrop compliant with Instagram's Terms of Service?", a: "Yes. Being an official Meta Business Partner, our application undergoes rigorous automated and manual security reviews by Facebook's engineering team." },
   { q: "Do I need a credit card to use AutoDrop for free?", a: "No, you don't need a credit card to start. Our free plan is truly free to help you get started." },
   { q: "How do I sign up for AutoDrop?", a: "Click 'Start for free' or 'Sign In', link your Facebook account that manages your Instagram Professional account, and you're ready to go!" },
   { q: "Can AutoDrop be used on other social media platforms?", a: "Currently, AutoDrop is laser-focused on providing the best possible experience for Instagram. We plan to roll out Facebook Messenger automation soon." },
   { q: "Why do I need to connect my Facebook account to use AutoDrop?", a: "Instagram's official API requires all third-party apps to authenticate via Facebook Business Manager. This is Meta's standard security requirement." },
   { q: "How many DMs can I send with AutoDrop?", a: "You can send completely unlimited DMs! Unlike our competitors that charge you per message, we do not restrict how many automated DMs you can send to your audience, ensuring your viral posts are fully covered." },
   { q: "Can I try AutoDrop for free before committing to a subscription?", a: "Yes! Your account starts on the free tier by default. You only upgrade when you're ready to scale your workflow." },
   { q: "Is AutoDrop an alternative to Link-in-bio services?", a: "Yes! Instead of telling users to 'click the link in my bio' (which lowers algorithmic reach), you tell them to 'Comment DESK' and the link is instantly DM'd to them." },
   { q: "How do I contact customer support if I need help?", a: "You can email us anytime or click the 'Support' link in our footer. Pro users get priority response within 24 hours." },
   { q: "Does AutoDrop need my Instagram password?", a: "Never. We use secure OAuth linking via Meta, meaning AutoDrop will never see or store your actual Instagram password." }
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div style={{ marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface)' }}>
         <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'transparent', border: 'none', color: 'var(--text-heading)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
         >
            <span>{question}</span>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
               <ChevronDown size={20} color="var(--text-muted)" />
            </motion.div>
         </button>
         <AnimatePresence>
            {isOpen && (
               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                     {answer}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

const testimonials = [
   {
      name: "Himanshi",
      handle: "@corporateatyachar",
      text: "The onboarding team here is amazing. They jumped on a quick call to walk me through the setup and helped fine-tune my DM templates. I really appreciate the personal touch.",
      avatar: "https://unavatar.io/instagram/corporateatyachar",
      metrics: "1-on-1 Onboarding"
   },
   {
      name: "Khushi",
      handle: "@khushiaggarwal19",
      text: "I tried another DM tool before and got hit with a shadowban that ruined my reach for weeks. AutoDrop is the only one I trust now because it's officially approved by Meta. My account is safe and engagement is thriving.",
      avatar: "https://unavatar.io/instagram/khushiaggarwal19",
      metrics: "100% Account Safety"
   },
   {
      name: "Handmade Crafts",
      handle: "@handmade_craftsandprojects",
      text: "I'm not a tech person, so I was worried about setting this up. But it literally took 3 minutes. Now my craft templates sell on autopilot, and their support team is always there when I need them.",
      avatar: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=150&q=80",
      metrics: "Setup in 3 mins"
   }
];

const TestimonialsSection = ({ isMobile }: { isMobile?: boolean }) => {
   const carouselRef = useRef<HTMLDivElement>(null);
   const [isInteracting, setIsInteracting] = useState(false);

   useEffect(() => {
      let animationId: number;
      let isVisible = false;

      const observer = new IntersectionObserver((entries) => {
         isVisible = entries[0].isIntersecting;
      }, { threshold: 0.1 });

      if (carouselRef.current) {
         observer.observe(carouselRef.current);
      }

      const scroll = () => {
         if (carouselRef.current && isVisible && !isInteracting && !isMobile) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            // Only scroll if content overflows
            if (scrollWidth > clientWidth) {
               if (scrollLeft >= scrollWidth - clientWidth - 1) {
                  // Jump back to start seamlessly
                  carouselRef.current.scrollLeft = 0;
               } else {
                  carouselRef.current.scrollLeft += 0.15; // Speed of continuous scroll (very slow)
               }
            }
         }
         animationId = requestAnimationFrame(scroll);
      };

      animationId = requestAnimationFrame(scroll);

      return () => {
         cancelAnimationFrame(animationId);
         observer.disconnect();
      };
   }, [isInteracting]);

   return (
      <section id="testimonials" style={{ padding: '8rem 0', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
         {/* Background Glows */}
         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

         <div className={styles.container}>
            <FadeIn>
               <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-heading)', textAlign: 'center' }}>Creator Success</h2>
               <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '4rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem auto' }}>See how creators are using AutoDrop to automate their growth and reclaim their time.</p>
            </FadeIn>
         </div>

         {/* Full width container for carousel to avoid empty spaces on desktop */}
         <div style={{ width: '100%', overflow: 'hidden', padding: '0 1rem' }}>
            <div 
               ref={carouselRef} 
               className="testimonials-carousel" 
               onMouseEnter={() => setIsInteracting(true)}
               onMouseLeave={() => setIsInteracting(false)}
               onTouchStart={() => setIsInteracting(true)}
               onTouchEnd={() => setIsInteracting(false)}
               style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  overflowX: 'auto', 
                  paddingBottom: '2rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  width: '100%',
                  justifyContent: isMobile ? 'flex-start' : (testimonials.length <= 3 ? 'center' : 'flex-start'),
                  margin: '0 auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
               }}
            >
               <style dangerouslySetInnerHTML={{__html: `
                  .testimonials-carousel::-webkit-scrollbar { display: none; }
               `}} />
               {testimonials.map((t, idx) => (
                  <FadeIn delay={idx * 0.15} key={idx}>
                     <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', overflow: 'hidden', minWidth: '320px', maxWidth: '400px', flex: '0 0 auto' }}>

                        {/* Star Rating */}
                        <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1.5rem' }}>
                           {[1, 2, 3, 4, 5].map(star => (
                              <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill="#facc15" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                           ))}
                        </div>

                        {/* Review Text */}
                        <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.6, flex: 1, marginBottom: '2rem', fontStyle: 'italic' }}>
                           "{t.text}"
                        </p>

                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <Image src={t.avatar} alt={t.name} width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                 <div style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</div>
                                 <div style={{ color: '#818cf8', fontSize: '0.85rem' }}>{t.handle}</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </FadeIn>
               ))}
            </div>
         </div>
      </section>
   );
};

const ValuePropositionSection = ({ isMobile }: { isMobile?: boolean }) => {
   const values = [
      { title: "Less stress", desc: "No more constantly checking your phone for new comments.", color: "#8b5cf6", span: 1, mobileSpan: 2 },
      { title: "Time saved", desc: "Reclaim 10+ hours a week previously spent copy-pasting links manually.", color: "#10b981", span: 2, mobileSpan: 1 },
      { title: "Consistency", desc: "Every single lead gets exactly what they asked for, instantly, every time.", color: "#f59e0b", span: 2, mobileSpan: 1 },
      { title: "Reliability", desc: "Our servers work 24/7 so your sales funnel never sleeps.", color: "#3b82f6", span: 1, mobileSpan: 2 },
      { title: "Professionalism", desc: "Deliver a world-class, instantaneous experience to your audience.", color: "#ec4899", span: 1, mobileSpan: 1 },
      { title: "Business growth", desc: "Turn passive scrollers into paying customers on absolute autopilot.", color: "#22d3ee", span: 2, mobileSpan: 1 }
   ];

   return (
      <section id="value-prop" style={{ padding: '8rem 0', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(139,92,246,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
         
         <div className={styles.container}>
            <FadeIn>
               <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8b5cf6', fontWeight: 800, marginBottom: '1rem' }}>
                     The Real Value
                  </h2>
                  <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                     You are <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>not</span> buying automation.<br/>
                     You are buying a <span style={{ color: '#10b981' }}>new reality.</span>
                  </h3>
               </div>
            </FadeIn>

            <div style={{ 
               display: 'grid', 
               gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
               gap: isMobile ? '1rem' : '1.5rem',
               maxWidth: '1000px',
               margin: '0 auto',
               padding: isMobile ? '0 1rem' : '0'
            }}>
               {values.map((v, i) => (
                  <div key={i} style={{ gridColumn: `span ${isMobile ? v.mobileSpan : v.span}` }}>
                     <FadeIn delay={i * 0.1}>
                        <motion.div 
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{ 
                           background: 'var(--surface)', 
                           backdropFilter: 'blur(10px)',
                           border: '1px solid var(--border)', 
                           borderRadius: isMobile ? '20px' : '24px', 
                           padding: isMobile ? '1.25rem' : '2.5rem', 
                           height: '100%',
                           display: 'flex',
                           flexDirection: 'column',
                           position: 'relative',
                           overflow: 'hidden'
                        }}
                        >
                           {/* Hover Glow Effect */}
                           <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle at top right, ${v.color}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
                           
                           <h4 style={{ color: 'var(--text-heading)', fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: v.color, boxShadow: `0 0 10px ${v.color}` }} />
                              {v.title}
                           </h4>
                           <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.85rem' : '0.95rem', lineHeight: 1.6, margin: 0 }}>
                              {v.desc}
                           </p>
                     </motion.div>
                     </FadeIn>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default function LandingClient({ userId }: { userId: string | null }) {
   // High-performance cursor tracking & Mobile state using non-rendering motion values
   const mouseX = useMotionValue(0);
   const mouseY = useMotionValue(0);
   const cursorX = useSpring(mouseX, { stiffness: 600, damping: 50, mass: 0.1 });
   const cursorY = useSpring(mouseY, { stiffness: 600, damping: 50, mass: 0.1 });
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth <= 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
   }, []);

   useEffect(() => {
      if (isMobile) return;
      const updateMousePos = (e: MouseEvent) => {
         mouseX.set(e.clientX - 250);
         mouseY.set(e.clientY - 250);
      };
      window.addEventListener("mousemove", updateMousePos, { passive: true });
      return () => window.removeEventListener("mousemove", updateMousePos);
   }, [mouseX, mouseY, isMobile]);

   const { scrollYProgress } = useScroll();
   const yParallax = useTransform(scrollYProgress, [0, 1], [0, -150]);

   return (
      <main className={styles.main}>
         {/* Premium Cursor Glow - powered by hardware-accelerated motion values with zero React re-renders */}
         {!isMobile && (
            <motion.div
               className="desktop-only-cursor-glow"
               style={{
                  position: 'fixed', top: 0, left: 0, width: 500, height: 500,
                  background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)',
                  pointerEvents: 'none', zIndex: 9999, borderRadius: '50%',
                  x: cursorX,
                  y: cursorY
               }}
            />
         )}

         <Header serverUserId={userId} />

         <section className={styles.heroSection}>
            <div className={styles.container}>
               <div className={`${styles.heroGrid} ${styles.splitSection}`}>
                  <div className={styles.heroContent}>
                     <FadeIn delay={0.1}>
                        <h1 className={styles.heroHeading} style={{ width: '100%', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                           {USE_NOOB_FRIENDLY_HERO ? (
                              <>
                                 Convert Instagram Comments Into <span className="text-gradient" style={{ display: 'inline-block' }}>Followers, Leads & Sales</span> Automatically!
                              </>
                           ) : (
                              <>
                                 Turn Instagram Comments Into Leads <span className="text-gradient" style={{ display: 'inline-block' }}>Automatically</span>
                              </>
                           )}
                        </h1>
                     </FadeIn>

                     <FadeIn delay={0.2}>
                        <p className={styles.heroSub} style={{ maxWidth: '90%', lineHeight: 1.6 }}>
                           {USE_NOOB_FRIENDLY_HERO ? (
                              "Stop sending links manually. AutoDrop watches your Reels and posts, replying to comments and sending links to DMs instantly, 24/7."
                           ) : (
                              "Reply to every comment, send DMs instantly, and capture leads while you sleep. Turn your engagement into revenue on autopilot."
                           )}
                        </p>
                     </FadeIn>
                     <FadeIn delay={0.3}>
                        <div className={styles.heroCtas}>
                           {userId ? (
                              <Link href="/dashboard" className="premium-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', whiteSpace: 'nowrap' }}>Dashboard <ArrowRight size={20} /></Link>
                           ) : (
                              <Link href="/sign-up" className="premium-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', whiteSpace: 'nowrap' }}>Start for free <ArrowRight size={20} /></Link>
                           )}
                           <a href="#how-it-works" className={styles.navLink} onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ flex: 1, color: 'var(--text-heading)', fontWeight: 600, padding: '1rem', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', borderRadius: '999px', transition: 'all 0.2s', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>See How it Works</a>
                        </div>
                     </FadeIn>

                     <div className={styles.mobileOnlyVisual}>
                        {isMobile && <HeroMockupElement isMobile={true} />}
                     </div>

                     <FadeIn delay={0.35}>
                        <div className={styles.metaBadgeBox} style={{ background: 'var(--surface)', borderColor: 'var(--border)', position: 'relative', overflow: 'hidden' }}>
                           {/* Animated Glass Sheen */}
                           <motion.div
                              animate={{ x: ['-200%', '300%'] }}
                              transition={{ repeat: Infinity, duration: 6, ease: 'linear', repeatDelay: 2 }}
                              style={{
                                 position: 'absolute',
                                 top: 0, left: 0, width: '50%', height: '100%',
                                 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                                 transform: 'skewX(-20deg)',
                                 zIndex: 1, pointerEvents: 'none'
                              }}
                           />
                           <div style={{ textAlign: 'left', flex: 1, position: 'relative', zIndex: 2 }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Badged Partner</div>
                              <h3 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>AutoDrop is a Meta Business Partner</h3>
                              <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: 'var(--text-muted)', lineHeight: 1.5 }}>Offering peace of mind by ensuring complete compliance with automation standards across Instagram.</p>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-heading)', fontWeight: 600, fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)', whiteSpace: 'nowrap', position: 'relative', zIndex: 2 }}>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 {/* Pulsing Aura */}
                                 <motion.div 
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.5, 0.15] }} 
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto', width: '80%', height: '80%', background: '#3b82f6', borderRadius: '50%', filter: 'blur(12px)', zIndex: 0 }}
                                 />
                                 <svg width="48" height="48" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginRight: '0.25rem', position: 'relative', zIndex: 1 }}>
                                    <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" />
                                 </svg>
                              </div>
                              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>Meta Business<span style={{ fontWeight: 400 }}>Partners</span></span>
                           </div>
                        </div>
                     </FadeIn>
                  </div>

                  <div className={styles.desktopOnlyVisual}>
                     {!isMobile && <HeroMockupElement isMobile={false} />}
                  </div>
               </div>
            </div>
         </section>




         {/* ── Safety Shield USP Band ─────────────────────────────────────── */}

         <ValuePropositionSection isMobile={isMobile} />

         <section style={{ padding: '5rem 0', background: 'var(--section-bg)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className={styles.container}>
               <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                   <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.2 }}>
                     The Only DM Tool Built to<br /><span style={{ color: '#6366f1' }}>Never Get You Banned</span>
                  </h2>
                  <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
                     Influencers get banned because they use tools that spam identical messages at full speed. AutoDrop was engineered from the ground up to prevent exactly that.
                  </p>
               </div>

               <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  gap: isMobile ? '1rem' : '1.25rem',
                  marginBottom: '2.5rem',
                  padding: isMobile ? '0 1rem' : '0'
               }}>
                  {[
                     {
                        icon: <ShieldCheck size={22} color="#6366f1" strokeWidth={2.5} />,
                        accent: '#6366f1',
                        title: 'Official Meta API',
                        body: 'We never scrape Instagram. Every action goes through Meta\'s official Business API — the same one used by Shopify and Mailchimp. Zero ban risk from the infrastructure layer.',
                        mobileSpan: 2
                     },
                     {
                        icon: <Gauge size={22} color="#10b981" strokeWidth={2.5} />,
                        accent: '#10b981',
                        title: 'Smart Throttle',
                        body: 'We cap DMs at 150/hr and inject random delays. When your Reel goes viral, we safely drip the queue instead of blasting.',
                        mobileSpan: 1
                     },
                     {
                        icon: <Cpu size={22} color="#f59e0b" strokeWidth={2.5} />,
                        accent: '#f59e0b',
                        title: 'Humanizer Engine',
                        body: 'Our spintax randomiser generates unique message variations. Instagram\'s spam classifier never sees identical text.',
                        mobileSpan: 1
                     },
                  ].map(p => (
                     <div key={p.title} style={{
                        gridColumn: `span ${isMobile ? p.mobileSpan : 1}`,
                        padding: isMobile ? '1.25rem' : '1.75rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: isMobile ? 20 : 16,
                        display: 'flex', flexDirection: 'column', gap: '0.85rem',
                        position: 'relative',
                        overflow: 'hidden'
                     }}>
                        {/* Distinct Pedestal Under-glow Effect */}
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '70%', height: '1px', background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)`, boxShadow: `0 -5px 20px 2px ${p.accent}44`, zIndex: 0 }} />
                        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%) translateY(50%)', width: '120%', height: '150px', background: `radial-gradient(ellipse at center, ${p.accent}15 0%, transparent 70%)`, zIndex: 0, pointerEvents: 'none' }} />

                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.accent}12`, border: `1px solid ${p.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                           {p.icon}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: isMobile ? '0.95rem' : '1rem', color: 'var(--text-heading)', position: 'relative', zIndex: 1 }}>{p.title}</div>
                        <div style={{ fontSize: isMobile ? '0.8rem' : '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65, position: 'relative', zIndex: 1 }}>{p.body}</div>
                     </div>
                  ))}
               </div>

               {/* Bottom trust cards */}
               <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1rem', marginTop: '2rem', padding: isMobile ? '0 1rem' : '0' }}>
                  {[
                     { label: 'DM rate cap', value: '150/hr', sub: 'Meta allows 200', color: '#6366f1' },
                     { label: 'Min delay', value: '5 secs', sub: 'up to 5 mins', color: '#10b981' },
                     { label: 'Filter evasion', value: '100%', sub: 'unique per message', color: '#f59e0b' },
                     { label: 'API layer', value: 'Official', sub: 'Meta Graph API v21+', color: '#3b82f6' },
                  ].map(s => (
                     <div key={s.label} style={{ 
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)', 
                        border: '1px solid var(--border)', 
                        borderTop: `2px solid ${s.color}`,
                        padding: isMobile ? '1.25rem 0.5rem' : '1.5rem', 
                        borderRadius: '12px', 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                     }}>
                        {/* LED Indicator Top-glow */}
                        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '60px', background: `radial-gradient(ellipse at top, ${s.color}25 0%, transparent 70%)`, pointerEvents: 'none' }} />
                        
                        <div style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 800, color: 'var(--text-heading)', fontVariantNumeric: 'tabular-nums', position: 'relative', zIndex: 1 }}>{s.value}</div>
                        <div style={{ fontSize: isMobile ? '0.65rem' : '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0.25rem 0', position: 'relative', zIndex: 1 }}>{s.label}</div>
                        <div style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>{s.sub}</div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Advanced 8-Grid Features Section */}
         <section id="features" style={{ padding: '8rem 0' }}>

            <div className={styles.container}>
               <FadeIn>
                  <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                     <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)' }}>
                        {USE_NOOB_FRIENDLY_FEATURES ? "Choose Your Growth Superpowers" : "Unlock the full Power of Instagram"}
                     </h2>
                     <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        {USE_NOOB_FRIENDLY_FEATURES
                           ? "You don't need to be a tech wizard. AutoDrop does the hard work of turning comments and views into followers, leads, and sales on auto-pilot."
                           : "A complete toolkit designed to harvest leads predictably without triggering ban limits."
                        }
                     </p>
                  </div>
               </FadeIn>

               {USE_NOOB_FRIENDLY_FEATURES ? (
                  /* NEW HIGH-FIDELITY INSTAGRAM-RESEMBLING FEATURES GRID */
                  <div className={styles.instagramFeaturesGrid}>

                     {/* 1. Comment Magnet - Reel Comment Sheet Simulation */}
                     <FadeIn delay={0.1}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)', justifyContent: 'flex-start', overflow: 'hidden' }}>
                              {/* Instagram Reel Header Mockup */}
                              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                                 <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)' }}>Comments</span>
                                 <span style={{ marginLeft: 'auto', background: 'rgba(91,133,255,0.1)', color: '#3897f0', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700 }}>Instagram Reel</span>
                              </div>

                              {/* Simulated Instagram Comment Bubble */}
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'var(--surface)', padding: '0.75rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                                 <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                       <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)' }}>sarajohnson</span>
                                       <Heart size={12} color="#ff3040" fill="#ff3040" style={{ cursor: 'pointer' }} />
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Drop the link please! 😍</span>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                                       <span>1m</span><span>Reply</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Instant Auto-Response Subthread */}
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginLeft: '2rem', marginTop: '0.5rem', background: 'rgba(56, 151, 240, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '12px', borderLeft: '2px solid #3897f0' }}>
                                 <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', flexShrink: 0 }} />
                                 <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                       yourbrand
                                       <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} title="Active" />
                                    </span>
                                    <p style={{ fontSize: '0.75rem', color: '#3897f0', margin: 0, fontWeight: 600 }}>Sent! Check your DMs</p>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Auto-Reply to Comments
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 No more copy-pasting links in comments! When fans comment a keyword on your Reels or posts, AutoDrop instantly replies and slides into their DMs with your link automatically.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#3897f0', fontWeight: 700 }}>
                                 <MessageCircle size={14} /> Runs across all your posts and Reels, even while you sleep
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 2. Story Reply Booster - Story View UI Simulation */}
                     <FadeIn delay={0.2}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '0', position: 'relative', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                              <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(180deg, var(--surface) 0%, var(--card-bg) 100%)' }}>
                                 {/* Story Progress Lines */}
                                 <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', background: 'var(--border)', borderRadius: '2px', display: 'flex', gap: '4px' }}>
                                    <div style={{ flex: 1, height: '100%', background: 'var(--text-heading)', borderRadius: '2px' }} />
                                    <div style={{ flex: 1, height: '100%', background: 'var(--border)', borderRadius: '2px' }} />
                                 </div>
                                 {/* Story Header */}
                                 <div style={{ position: 'absolute', top: '18px', left: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', padding: '1px' }}>
                                       <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--card-bg)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-heading)', fontWeight: 600 }}>yourprofile <span style={{ opacity: 0.6, fontWeight: 400 }}>5m</span></span>
                                 </div>

                                 {/* Floating Instagram Story Link Sticker */}
                                 <div style={{ position: 'absolute', top: '30%', left: '10%', right: '10%', textAlign: 'center' }}>
                                    <motion.div
                                       animate={{ scale: [1, 1.03, 1] }}
                                       transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                       style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', color: '#000', padding: '0.8rem 1.2rem', borderRadius: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}
                                    >
                                       <span style={{ fontSize: '0.65rem', color: '#e1306c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>REPLY TO STORY</span>
                                       <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                          "GROW" for playbook
                                       </span>
                                    </motion.div>
                                 </div>

                                 {/* Bottom Interaction Bar */}
                                 <div style={{ position: 'absolute', bottom: '15px', left: '10px', right: '10px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ flex: 1, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '100px', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-heading)' }}>
                                       Typing "GROW"...
                                    </div>
                                    <Heart size={18} color="var(--text-heading)" />
                                    <Send size={18} color="var(--text-heading)" />
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Story Interactive Auto-DMs
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 Double Story link conversions! Simply post a Story asking followers to reply with a keyword. AutoDrop automatically reads Story replies and delivers DMs instantly.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#e1306c', fontWeight: 700 }}>
                                 <Sparkles size={14} /> Instantly Boosts Story Engagement & Reach
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 3. Inbox Auto-Replies - High Fidelity DM Simulation */}
                     <FadeIn delay={0.3}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                              {/* DM Chat Header */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                 <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)' }}>Alex Johnson</span>
                                 <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Active Now</span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                 {/* Inbound Message Bubble */}
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                                    <div style={{ background: 'var(--surface)', padding: '0.5rem 0.85rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.8rem', color: 'var(--text-heading)', maxWidth: '75%' }}>
                                       Hey! I want the secret code <b>GUIDE</b>
                                    </div>
                                 </div>

                                 {/* Outbound Beautiful IG Gradient DM bubble */}
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: 'linear-gradient(45deg, #3797f0, #a855f7)', padding: '0.65rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.8rem', color: '#fff', maxWidth: '80%', boxShadow: '0 4px 15px rgba(168,85,247,0.25)' }}>
                                       <div>Here is your exclusive link:</div>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', marginTop: '0.4rem', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', backdropFilter: 'blur(5px)', border: '1px solid var(--border)' }}>
                                          drop.site/free-guide
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Inbox Secret Code Words
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 Create secret keywords (like 'VIP', 'OFFER', 'GUIDE') for your bio or offline flyers. When customers DM you that specific word, AutoDrop sends them links instantly.
                              </p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 4. Follower Booster - Profile Gated Simulation */}
                     <FadeIn delay={0.4}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                              {/* Instagram Profile Simulation */}
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                 <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', padding: '2px', flexShrink: 0 }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--card-bg)' }} />
                                 </div>
                                 <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                    <div><div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>156</div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>posts</div></div>
                                    <div><div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>12.4k</div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>followers</div></div>
                                    <div><div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>420</div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>following</div></div>
                                 </div>
                              </div>

                              {/* Pulsing Blue IG Follow Button */}
                              <motion.div
                                 animate={{ scale: [1, 1.02, 1] }}
                                 transition={{ duration: 2, repeat: Infinity }}
                                 style={{ background: '#0095f6', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem' }}
                              >
                                 Follow
                              </motion.div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', padding: '0.4rem', borderRadius: '8px', fontSize: '0.7rem', color: '#f43f5e', fontWeight: 700 }}>
                                 <ShieldCheck size={12} /> Auto-checking follower status...
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Follower Booster (Follow-Gate)
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 Turn commenters into followers! AutoDrop automatically checks if a user is following your profile. If they aren't, it politely reminds them to follow you before delivering their link.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#f43f5e', fontWeight: 700 }}>
                                 <ShieldCheck size={14} /> Boosts follower conversion
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 5. Revive Viral Posts - Reels Grid Simulation */}
                     <FadeIn delay={0.5}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '0.75rem', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
                              {/* Instagram Profile Post Grid Mockup */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', height: '100%' }}>
                                 <div style={{ background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-heading)', fontWeight: 700 }}>▶ 12k</span>
                                 </div>
                                 <div style={{ background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-heading)', fontWeight: 700 }}>▶ 84k</span>
                                 </div>
                                 {/* Highlighted active AutoDrop post */}
                                 <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid #10b981', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px' }}>
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
                                       <RefreshCcw size={16} color="#10b981" />
                                    </motion.div>
                                    <span style={{ fontSize: '0.5rem', color: '#10b981', fontWeight: 800, marginTop: '4px', textAlign: 'center' }}>▶ 1.2M VIEWS</span>
                                    <span style={{ fontSize: '0.45rem', color: 'var(--text-heading)', background: '#10b981', padding: '1px 3px', borderRadius: '3px', marginTop: '2px', fontWeight: 700 }}>ACTIVE</span>
                                 </div>
                                 <div style={{ background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-heading)', fontWeight: 700 }}>▶ 140k</span>
                                 </div>
                                 <div style={{ background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-heading)', fontWeight: 700 }}>▶ 6.4k</span>
                                 </div>
                                 <div style={{ background: 'var(--surface)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-heading)', fontWeight: 700 }}>▶ 95k</span>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Revive Old Viral Reels
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 Maximize old organic traffic! Got an old post that's still getting views or just went viral? Toggle AutoDrop on historical Reels to convert late viewers into fans automatically.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                                 <RefreshCcw size={14} /> Wake up past reels with 1 simple click
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 6. Grow Your Email List - In-Chat email capture */}
                     <FadeIn delay={0.6}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '1rem 1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                 {/* DM Prompt */}
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: 'linear-gradient(45deg, #3797f0, #a855f7)', padding: '0.45rem 0.85rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.75rem', color: '#fff', maxWidth: '85%' }}>
                                       Where should I send the code? Reply with your Email!
                                    </div>
                                 </div>

                                 {/* Customer Email Reply */}
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                                    <div style={{ background: 'var(--surface)', padding: '0.45rem 0.85rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.75rem', color: 'var(--text-heading)', maxWidth: '85%' }}>
                                       <b>alex@gmail.com</b>
                                    </div>
                                 </div>

                                 {/* Automated email saving card */}
                                 <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                                 >
                                    <CheckCircle2 size={14} color="#10b981" />
                                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Saved & synced to Klaviyo / Mailchimp!</span>
                                 </motion.div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Grow Your Email List
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 Forget slow, clunky web landing pages. Collect your customer's email directly inside the Instagram DM chat and automatically sync it straight to your email lists.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 700 }}>
                                 <AtSign size={14} /> 10x higher opt-in conversion rates than web pages
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 7. Custom AI Sales Agent - Organic typing simulation */}
                     <FadeIn delay={0.7}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                 {/* Customer Question */}
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                                    <div style={{ background: 'var(--surface)', padding: '0.45rem 0.85rem', borderRadius: '16px 16px 16px 4px', fontSize: '0.75rem', color: 'var(--text-heading)' }}>
                                       Is the guide beginner friendly?
                                    </div>
                                 </div>

                                 {/* AI Reply */}
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: 'linear-gradient(45deg, #3797f0, #a855f7)', padding: '0.55rem 0.95rem', borderRadius: '16px 16px 4px 16px', fontSize: '0.75rem', color: '#fff', maxWidth: '85%' }}>
                                       Yes! It starts from absolute scratch. Here's a 10% coupon: <b>NOOB10</b>
                                    </div>
                                 </div>

                                 {/* Custom typing state */}
                                 <div style={{ display: 'flex', gap: '0.3rem', padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', width: '50px', justifyContent: 'center' }}>
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Custom AI Sales Agent <span style={{ color: '#facc15', fontSize: '0.7rem', verticalAlign: 'middle', border: '1px solid #facc15', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>Coming Soon</span>
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 Train an ultra-smart AI bot on your business files or FAQs. It chats organically with your customers, answers product questions, and overcomes purchase objections naturally 24/7.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#a855f7', fontWeight: 700 }}>
                                 <Sparkles size={14} /> Natural language sales conversational flows
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 8. Sleek Digital Store - Checkout overlay */}
                     <FadeIn delay={0.8}>
                        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="feature-card">
                           <div style={{ background: 'var(--card-bg)', height: '220px', padding: '1rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>

                              {/* Digital Store checkout popup */}
                              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                 <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #ff3f70, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.6rem', textAlign: 'center' }}>PDF</div>
                                    <div>
                                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>Viral Reels Playbook</div>
                                       <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Instant PDF Download</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                       <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>$27.00</div>
                                    </div>
                                 </div>

                                 {/* Interactive Checkout CTA */}
                                 <div style={{ background: '#fff', color: '#000', padding: '0.45rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                                    <span>Pay with UPI/Card/Apple Pay</span>
                                 </div>
                                 <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    Secured by Razorpay. Standard Instagram Browser Sheet
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem', fontWeight: 800 }}>
                                 Sleek Digital Store <span style={{ color: '#10b981', fontSize: '0.7rem', verticalAlign: 'middle', border: '1px solid #10b981', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Included</span>
                              </h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                 No external website or Shopify account needed. Simply upload your PDF guides, masterclasses, or ebooks to your AutoDrop dashboard, and sell directly inside DMs.
                              </p>
                              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#22d3ee', fontWeight: 700 }}>
                                 <ShoppingBag size={14} /> Full Razorpay & Payment Gateway integrations included
                              </div>
                           </div>
                        </motion.div>
                     </FadeIn>

                  </div>
               ) : (
                  /* ORIGINAL FEATURES SECTION */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>

                     {/* 1. Comment Automation */}
                     <FadeIn delay={0.1}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#fff', height: '220px', padding: '1.25rem', position: 'relative', display: 'flex', flexDirection: 'column', borderBottom: '1px solid #efefef' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                 <MessageCircle size={16} color="#000" /><span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000' }}>Comments</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover' }} />
                                 <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000', marginRight: '0.4rem' }}>sarajohnson</span>
                                    <span style={{ fontSize: '0.85rem', color: '#000' }}>Drop the link! 😍</span>
                                    <div style={{ fontSize: '0.75rem', color: '#8e8e8e', marginTop: '0.2rem', display: 'flex', gap: '1rem' }}>
                                       <span>2w</span><span style={{ fontWeight: 600 }}>Reply</span>
                                    </div>
                                 </div>
                                 <Heart size={12} color="#8e8e8e" />
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginLeft: '2.5rem', marginTop: '1rem' }}>
                                 <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f43f5e, #f97316)' }} />
                                 <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#000', marginRight: '0.4rem' }}>autodrop</span>
                                    <span style={{ fontSize: '0.8rem', color: '#000' }}>Just sent the link to your DMs! 🚀</span>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Comment Automation</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Automatically reply to post & reel comments and send a DM to capture leads instantly.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 2. Story Automation */}
                     <FadeIn delay={0.2}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#0a0a0a', height: '220px', padding: '0', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ position: 'relative', width: '100%', height: '100%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover' }}>
                                 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                                    <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}><div style={{ width: '50%', height: '100%', background: '#fff', borderRadius: '2px' }} /></div>
                                 </div>
                                 <div style={{ position: 'absolute', top: '15px', left: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, #f43f5e, #f97316)' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>autodrop <span style={{ opacity: 0.8, fontWeight: 400 }}>3h</span></span>
                                 </div>
                                 <div style={{ position: 'absolute', top: '35%', width: '100%', textAlign: 'center' }}>
                                    <span style={{ background: '#fff', color: '#000', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 800 }}>Reply with "PARTY" 🎉</span>
                                 </div>
                                 <div style={{ position: 'absolute', bottom: '15px', left: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                                    <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.5)', borderRadius: '100px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}>
                                       <span style={{ fontSize: '0.75rem', color: '#fff' }}>Send message</span>
                                    </div>
                                    <Heart size={20} color="#fff" />
                                    <Send size={20} color="#fff" />
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Story Automation</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Trigger specific DMs based on keywords or exact emoji reactions on your Stories.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 4. DM Check */}
                     <FadeIn delay={0.4}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                                    <div style={{ background: '#efefef', padding: '0.6rem 1rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.85rem', color: '#000', maxWidth: '80%' }}>Hey! I&apos;m interested in the course.</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Awesome! Here is the exclusive link to sign up 🚀</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '100px', padding: '0.5rem 1rem', marginTop: 'auto' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Message...</span>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>DM Keyword Triggers</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Automatically reply to users who natively DM you specific keywords or questions.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 5. Ask For Follow */}
                     <FadeIn delay={0.5}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Please follow us to unlock the link!</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ background: '#efefef', padding: '0.6rem 1rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.85rem', color: '#000', maxWidth: '80%' }}>Followed you!</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Thanks! Here is your download. 👇<div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '6px', marginTop: '0.5rem', fontWeight: 600, textAlign: 'center' }}>Download Now</div></div>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Follow-Gates</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Verify if the user is following your profile before dispatching the link automation.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 6. Re-trigger */}
                     <FadeIn delay={0.6}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#fff', height: '220px', padding: '0', position: 'relative', overflow: 'hidden' }}>
                              <Image src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80" alt="Viral post" fill style={{ objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(55, 151, 240, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                                 <RefreshCcw size={48} color="#fff" />
                                 <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>Reactivate Viral Posts</div>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Historically Re-Trigger</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Run automations on posts published months ago to revive dead traffic streams.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 7. Collect User Data */}
                     <FadeIn delay={0.7}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#fff', height: '220px', padding: '1.5rem', position: 'relative' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center' }}>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>What is the best email to send this to?</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80) center/cover', flexShrink: 0 }} />
                                    <div style={{ background: '#efefef', padding: '0.6rem 1rem', borderRadius: '18px 18px 18px 4px', fontSize: '0.85rem', color: '#000', maxWidth: '80%' }}>user@gmail.com</div>
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                                    <div style={{ background: '#3797f0', padding: '0.6rem 1rem', borderRadius: '18px 18px 4px 18px', fontSize: '0.85rem', color: '#fff', maxWidth: '80%' }}>Sent! Check your inbox. 📥</div>
                                 </div>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Data Capture</h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Seamlessly build your external email lists directly inside the IG DM ecosystem.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 8. AI Replies Coming Soon */}
                     <FadeIn delay={0.8}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#0a0a0a', height: '220px', padding: '1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                              {/* Glowing dynamic background */}
                              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(168,85,247,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }} />

                              <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                                 <Sparkles size={48} color="#a855f7" />
                                 <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Autodrop <span style={{ color: '#a855f7' }}>AI</span></span>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Custom Trained AI <span style={{ color: '#facc15', fontSize: '0.7rem', verticalAlign: 'middle', border: '1px solid #facc15', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Coming Soon</span></h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Train an AI model on your store data to contextually answer queries and close sales.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                     {/* 9. Creator Marketplace */}
                     <FadeIn delay={0.9}>
                        <motion.div whileHover={{ y: -5 }} style={{ background: '#111318', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                           <div style={{ background: '#0a0a0a', height: '220px', padding: '1.5rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                              {/* Glowing dynamic background */}
                              <div style={{ position: 'absolute', width: '120px', height: '120px', background: 'radial-gradient(circle at center, rgba(34,211,238,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }} />

                              <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                                 <ShoppingBag size={48} color="#22D3EE" />
                                 <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Digital <span style={{ color: '#22D3EE' }}>Store</span></span>
                              </div>
                           </div>
                           <div style={{ padding: '1.5rem', flex: 1 }}>
                              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Creator Marketplace <span style={{ color: '#10b981', fontSize: '0.7rem', verticalAlign: 'middle', border: '1px solid #10b981', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>Included</span></h3>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Host and sell your digital products directly to your audience without leaving the ecosystem.</p>
                           </div>
                        </motion.div>
                     </FadeIn>

                  </div>
               )}
            </div>
         </section>


         {/* Sticky Section Trick for How it works */}
         <section id="how-it-works" style={{ padding: '8rem 0', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <HowItWorksInteractive />
         </section>

         <section id="testimonials"><TestimonialsSection isMobile={isMobile} /></section>

         {/* FAQ SECTION */}
         <section id="faq" style={{ padding: '8rem 0', background: 'transparent', borderTop: '1px solid var(--border)' }}>
            <div className={styles.container} style={{ maxWidth: '800px' }}>
               <FadeIn>
                  <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em', color: 'var(--text-heading)', textAlign: 'center' }}>Frequently Asked Questions</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', textAlign: 'center' }}>Everything you need to know about the product and billing.</p>
               </FadeIn>
               <FadeIn delay={0.2}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                     {faqs.map((faq, idx) => (
                        <FAQItem key={idx} question={faq.q} answer={faq.a} />
                     ))}
                  </div>
               </FadeIn>
            </div>
         </section>

         <section id="cta" style={{ padding: '8rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div className={styles.container} style={{ maxWidth: '1000px', width: '100%' }}>
               <FadeIn>
                  <motion.div 
                     whileHover={{ scale: 1.01 }}
                     transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                     style={{
                        position: 'relative',
                        background: 'linear-gradient(145deg, #0f1117, #06070a)',
                        borderRadius: '40px',
                        padding: '6rem 2rem',
                        textAlign: 'center',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
                     }}
                  >
                     {/* Ambient Glows */}
                     <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                     <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                     
                     {/* Floating Icons Background */}
                     <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} style={{ position: 'absolute', top: '20%', left: '15%', opacity: 0.15 }}>
                        <MessageCircle size={64} color="#fff" />
                     </motion.div>
                     <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '25%', right: '15%', opacity: 0.15 }}>
                        <Zap size={72} color="#fff" />
                     </motion.div>

                     {/* Content */}
                     <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                           10x Your Engagement
                        </div>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.1 }}>
                           Ready to <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scale?</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.25rem', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem auto', lineHeight: 1.6 }}>
                           Stop manually answering DMs. Let AutoDrop turn your Instagram comments into sales 24/7 on autopilot.
                        </p>

                        <div style={{ position: 'relative' }}>
                           {/* Outer Button Glow Pulse */}
                           <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} style={{ position: 'absolute', inset: -10, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '999px', filter: 'blur(12px)', zIndex: 0 }} />
                           
                           {userId ? (
                              <Link href="/dashboard" onClick={() => window.scrollTo(0, 0)} style={{ position: 'relative', zIndex: 1, background: '#fff', color: '#000', padding: '1.25rem 3.5rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                                 Go to Dashboard <ArrowRight size={20} />
                              </Link>
                           ) : (
                              <Link href="/sign-up" onClick={() => window.scrollTo(0, 0)} style={{ position: 'relative', zIndex: 1, background: '#fff', color: '#000', padding: '1.25rem 3.5rem', fontSize: '1.1rem', fontWeight: 800, borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                                 Start Automating Free <ArrowRight size={20} />
                              </Link>
                           )}
                        </div>
                        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                           No credit card required • Setup in 3 minutes
                        </div>
                     </div>
                  </motion.div>
               </FadeIn>
            </div>
         </section>

         {/* FOOTER */}
         <Footer />
      </main>
   );
}
