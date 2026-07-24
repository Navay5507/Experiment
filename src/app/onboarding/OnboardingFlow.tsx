"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitCreatorDetails } from "../actions/onboarding";
import { Loader2, ChevronRight } from "lucide-react";
import styles from "./onboarding.module.css";

const NICHES = [
  { id: "finance", label: "Finance & Trading", icon: "💰" },
  { id: "astrology", label: "Astrology / Numerology", icon: "🔮" },
  { id: "coaching", label: "Coaching", icon: "🎤" },
  { id: "marketing", label: "Digital Marketing", icon: "📊" },
  { id: "medical", label: "Medical", icon: "⚕️" },
  { id: "education", label: "Education & Career", icon: "🎓" },
  { id: "fitness", label: "Fitness & Nutrition", icon: "💪" },
  { id: "design", label: "Design & Arts", icon: "🎨" },
  { id: "tech", label: "Technology & IT", icon: "💻" },
  { id: "legal", label: "Law & Legal Services", icon: "⚖️" },
  { id: "travel", label: "Travel / Hospitality", icon: "✈️" },
  { id: "beauty", label: "Beauty & Personal Care", icon: "💄" },
  { id: "entertainment", label: "Entertainment & Media", icon: "🍿" },
  { id: "other", label: "Other", icon: "✨" },
];

export default function OnboardingFlow({ userName, skipAction }: { userName: string, skipAction: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedNiche || !handle.trim()) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content_niche", selectedNiche);
      formData.append("primary_handle", handle.trim());
      
      await submitCreatorDetails(formData);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={styles.glassCard}
            style={{ maxWidth: '800px', width: '100%' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}
              >
                👋
              </motion.div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Hi {userName}, what type of content do you create?
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                This will help us share relevant tools, inspiration, and examples from other creators in your niche.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '3rem' }}>
              {NICHES.map((niche) => {
                const isSelected = selectedNiche === niche.id;
                return (
                  <button
                    key={niche.id}
                    onClick={() => setSelectedNiche(niche.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '100px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.95rem'
                    }}
                  >
                    <span>{niche.icon}</span>
                    {niche.label}
                  </button>
                );
              })}
            </div>

            <div style={{ maxWidth: '500px', margin: '0 auto', marginBottom: '2rem' }}>
              <label style={{ display: 'block', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                What's your primary social handle?
              </label>
              <div style={{ 
                display: 'flex', alignItems: 'center', 
                background: 'rgba(0,0,0,0.3)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                gap: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>@</span>
                <input
                  type="text"
                  placeholder="username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    outline: 'none',
                    flex: 1,
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <div style={{ width: '20px', height: '6px', borderRadius: '3px', background: 'var(--primary)' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <button
                onClick={handleNext}
                disabled={!selectedNiche || !handle.trim() || loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 2rem',
                  borderRadius: '100px',
                  background: (!selectedNiche || !handle.trim() || loading) ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                  color: (!selectedNiche || !handle.trim() || loading) ? 'rgba(255,255,255,0.3)' : '#fff',
                  fontWeight: 600,
                  cursor: (!selectedNiche || !handle.trim() || loading) ? 'not-allowed' : 'pointer',
                  border: 'none',
                  transition: 'background 0.2s ease'
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Next'}
                {!loading && <ChevronRight size={18} />}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.glassCard}
          >
            <div className={styles.iconContainer}>
              <div className={styles.igIcon}>📸</div>
            </div>
            <h1 className={styles.title}>Connect Your Instagram</h1>
            <p className={styles.subtitle}>Link your Instagram Professional account to Autodrop right now to automatically unlock Generative AI replies, Follow-Gates, and interactive Lead Captures.</p>
            
            <div className={styles.actionRow}>
              <a href="/api/auth/instagram" className={styles.connectBtn}>Connect Instagram Account</a>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    await skipAction();
                  } catch (e) {
                    console.error(e);
                  }
                  window.location.href = "/dashboard";
                }}
                disabled={loading}
                className={styles.skipBtn}
                style={{ opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Skipping...' : 'Skip for now'}
              </button>
            </div>

            <p className={styles.footerText}>You can always configure integrations later from your Settings page.</p>

            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginTop: '2rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ width: '20px', height: '6px', borderRadius: '3px', background: 'var(--primary)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
