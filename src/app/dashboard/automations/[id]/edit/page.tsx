"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../new/form.module.css";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, Loader2, Plus, X } from "lucide-react";

const CustomDropdown = ({ options, value, onChange, label }: { options: any[], value: string, onChange: (val: string) => void, label?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '1.5rem' }}>
      {label && <label className={styles.label} style={{ marginBottom: '0.75rem', display: 'block' }}>{label}</label>}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '1.25rem',
          background: 'var(--surface)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
          borderRadius: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{selectedOption?.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '1rem' }}>{selectedOption?.title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{selectedOption?.desc}</div>
          </div>
        </div>
        <ChevronDown size={20} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
                overflow: 'hidden', zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              {options.map((opt, idx) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    if (!opt.disabled) {
                      onChange(opt.value);
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                    cursor: opt.disabled ? 'not-allowed' : 'pointer', opacity: opt.disabled ? 0.5 : 1,
                    background: value === opt.value ? 'var(--surface-hover)' : 'transparent',
                    borderBottom: idx < options.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!opt.disabled && value !== opt.value) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={(e) => { if (!opt.disabled && value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.95rem' }}>
                      {opt.title} {opt.disabled && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', marginLeft: '0.5rem', fontWeight: 700 }}>PRO</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{opt.desc}</div>
                  </div>
                  {value === opt.value && <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="var(--text-heading)" /></div>}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function EditAutomation() {
  const router = useRouter();
  const params = useParams();
  const automationId = params.id as string;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // State Payloads
  const [campaignName, setCampaignName] = useState("");
  const [targetType, setTargetType] = useState("post");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [replyTemplate, setReplyTemplate] = useState("Check your DM! 👀");
  const [featureType, setFeatureType] = useState("standard");
  const [dmMessage, setDmMessage] = useState("");
  const [dmLinks, setDmLinks] = useState<{ title: string; url: string }[]>([{ title: '', url: '' }]);
  const [leadCaptureAsk, setLeadCaptureAsk] = useState("");
  const [initialDmText, setInitialDmText] = useState("Thanks for your interest! Tap below to get the link 👇");
  const [leadCaptureFields, setLeadCaptureFields] = useState<string[]>([]);
  const [manualMediaId, setManualMediaId] = useState("");
  const [antiBanEnabled, setAntiBanEnabled] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [spinPreviews, setSpinPreviews] = useState<string[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  const [realPosts, setRealPosts] = useState<{ id: string; caption?: string; media_type?: string; media_url?: string; thumbnail_url?: string; timestamp?: string }[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState<string>("FREE");

  const AVAILABLE_LEAD_FIELDS = [
    { key: 'email', label: 'Email Address', icon: '📧' },
    { key: 'phone', label: 'Phone Number', icon: '📱' },
    { key: 'name', label: 'Full Name', icon: '👤' },
    { key: 'company', label: 'Company Name', icon: '🏢' },
    { key: 'website', label: 'Website URL', icon: '🌐' },
    { key: 'message', label: 'Custom Message', icon: '💬' },
  ];

  const toggleLeadField = (key: string) => {
    setLeadCaptureFields(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  // Fetch existing automation data + media on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch existing automation
        const autoRes = await fetch(`/api/automations/${automationId}`);
        if (!autoRes.ok) { router.push('/dashboard/automations'); return; }
        const auto = await autoRes.json();

        setCampaignName(auto.campaign_name || '');
        setTargetType(auto.target_type || 'post');
        setKeywords(Array.isArray(auto.keywords) ? auto.keywords.join(', ') : auto.keywords || '');
        setReplyTemplate(auto.reply_template || 'Check your DM! 👀');
        setInitialDmText(auto.initial_dm_text || 'Thanks for your interest! Tap below to get the link 👇');
        setDmMessage(auto.dm_message || '');
        setLeadCaptureAsk(auto.lead_capture_ask || '');
        setLeadCaptureFields(auto.lead_capture_fields || []);
        setAiEnabled(auto.ai_enabled || false);

        // Determine featureType from DB fields
        if (auto.follow_gate_enabled) setFeatureType('follow_gate');
        else if (auto.lead_capture_type) setFeatureType('lead_capture');
        else setFeatureType('standard');

        // Parse dm_links
        const rawLinks: string[] = Array.isArray(auto.dm_links) ? auto.dm_links : [];
        if (rawLinks.length > 0) {
          setDmLinks(rawLinks.map((l: string) => {
            if (l.includes('|||')) {
              const [title, url] = l.split('|||');
              return { title: title.trim(), url: url.trim() };
            }
            return { title: '', url: l };
          }));
        }

        // Parse selected posts
        if (auto.instagram_media_id) {
          const ids = auto.instagram_media_id.split(',').filter(Boolean);
          setSelectedPosts(ids);
        }

        // Check if reply template has no-spin flag
        if (auto.reply_template?.includes('__NO_SPIN__')) {
          setReplyTemplate(auto.reply_template.replace('__NO_SPIN__', ''));
          setAntiBanEnabled(false);
        }

        // Fetch media for post picker
        const mediaRes = await fetch('/api/instagram/media');
        const mediaData = await mediaRes.json();
        setIsConnected(mediaData.isConnected === true);
        if (mediaData.media?.length > 0) setRealPosts(mediaData.media);

        // Fetch user plan
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const { data: userData } = await profileRes.json();
          if (userData?.plan) setUserPlan(userData.plan);
        }
      } catch (err) {
        console.error("Failed to fetch automation for editing:", err);
        router.push('/dashboard/automations');
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };
    fetchData();
  }, [automationId, router]);

  // Anti-ban spin preview
  useEffect(() => {
    const fetchPreviews = async () => {
      if (!antiBanEnabled) { setSpinPreviews([replyTemplate]); return; }
      setIsLoadingPreviews(true);
      try {
        const res = await fetch('/api/automations/spin-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template: replyTemplate })
        });
        const data = await res.json();
        setSpinPreviews(data.variations || []);
      } catch { /* ignore */ } finally {
        setIsLoadingPreviews(false);
      }
    };
    const timeout = setTimeout(fetchPreviews, 500);
    return () => clearTimeout(timeout);
  }, [replyTemplate, antiBanEnabled]);

  const togglePost = (id: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (userPlan === 'FREE') return [id];
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    const finalPosts = selectedPosts.length > 0
      ? selectedPosts
      : manualMediaId.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const filteredLinks = dmLinks.filter(l => l.url.trim() !== '');
      const encodedLinks = filteredLinks.map(l => l.title.trim() ? `${l.title.trim()}|||${l.url.trim()}` : l.url.trim());

      const res = await fetch(`/api/automations/${automationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          targetType,
          featureType,
          selectedPosts: finalPosts,
          keywords: keywords.split(',').map(k => k.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).filter(Boolean).join(','),
          replyTemplate: antiBanEnabled ? replyTemplate : `${replyTemplate}__NO_SPIN__`,
          leadCaptureAsk,
          dmLink: encodedLinks.length > 0 ? encodedLinks[0] : '',
          dmMessage: dmMessage || '',
          dmLinks: encodedLinks,
          aiEnabled,
          initialDmText,
          leadCaptureFields: featureType === 'lead_capture' ? leadCaptureFields : [],
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Server error saving automation");
      }
      router.push('/dashboard/automations');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setErrorMsg("");
    if (step === 1 && !campaignName.trim()) {
      setErrorMsg("Please enter a Campaign Name before proceeding.");
      return;
    }
    if (step < 5) setStep(step + 1);
  };
  const prevStep = () => { setErrorMsg(""); if (step > 1) setStep(step - 1); };

  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <p>Loading automation...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.title}>
          Edit Automation
        </motion.h1>
        <p className={styles.subtitle}>Update your automation settings across 5 steps.</p>
      </header>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBarBg} />
        <div className={styles.progressBarFill} style={{ width: `${((step - 1) / 4) * 100}%` }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`${styles.stepDot} ${step === i ? styles.stepDotActive : ''} ${step > i ? styles.stepDotCompleted : ''}`}>
            {step > i ? <Check size={16} /> : i}
          </div>
        ))}
      </div>

      <div className={styles.glassPanel}>
        <AnimatePresence mode="wait">

          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle} style={{ marginBottom: '1.5rem' }}>1. Choose Automation Type</h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Campaign Name <span style={{ color: '#eb3fb4' }}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Summer Sale 2026"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  style={{ marginTop: '0.5rem' }}
                />
              </div>

              <CustomDropdown
                label="Trigger Type"
                value={targetType}
                onChange={(val) => setTargetType(val)}
                options={[
                  { value: 'post', icon: '📸', title: 'Post / Reel', desc: 'Monitor comments on specific posts or reels' },
                  { value: 'story', icon: '⏱️', title: 'Story Reply', desc: 'Auto-reply to story responses', disabled: userPlan === 'FREE' },
                  { value: 'dm', icon: '📩', title: 'Direct Message', desc: 'Trigger when someone DMs you a keyword', disabled: userPlan === 'FREE' }
                ]}
              />

              {targetType === 'post' && (
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '1rem' }}>Select specific posts to monitor</h3>
                  {postsLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)', gap: '0.75rem' }}>
                      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading your Instagram posts...
                    </div>
                  ) : realPosts.length > 0 ? (
                    <>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Tap to select posts. Leave all unselected to apply to all posts.</p>
                      <div className={styles.postGrid}>
                        {realPosts.map((post) => (
                          <div key={post.id} className={`${styles.postCard} ${selectedPosts.includes(post.id) ? styles.postSelected : ''}`} onClick={() => togglePost(post.id)}>
                            {post.thumbnail_url || post.media_url ? (
                              <img
                                src={post.thumbnail_url || post.media_url}
                                alt=""
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: '8px' }}
                              />
                            ) : (
                              <div className={styles.postImage}><ImageIcon opacity={0.5} /></div>
                            )}
                            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                              {post.caption?.substring(0, 30) || post.media_type || 'Post'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedPosts.length > 0 && (
                        <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>✓ {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected</p>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '2rem', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center' }}>
                      <ImageIcon size={32} style={{ color: 'var(--text-muted)', opacity: 0.4, marginBottom: '0.75rem' }} />
                      <p style={{ color: 'var(--text-heading)', fontWeight: 600, marginBottom: '0.5rem' }}>No posts available</p>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Paste Instagram Media ID (e.g., 17895695668004550)"
                        value={manualMediaId}
                        onChange={(e) => setManualMediaId(e.target.value)}
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Leave empty to apply to all posts.</p>
                    </div>
                  )}
                </div>
              )}

              {targetType === 'story' && (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>⏱️</div>
                  <div>
                    <p style={{ color: 'var(--text-heading)', fontWeight: 600, marginBottom: '0.25rem' }}>Story Reply Automation</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>Applies to all stories automatically.</p>
                  </div>
                </div>
              )}

              {targetType === 'dm' && (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>📩</div>
                  <div>
                    <p style={{ color: 'var(--text-heading)', fontWeight: 600, marginBottom: '0.25rem' }}>DM Keyword Automation</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>Triggers on all incoming DMs with the keyword.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle} style={{ marginBottom: '1.5rem' }}>2. Trigger Keywords</h2>
              <div className={styles.formGroup}>
                <input type="text" className={styles.input} placeholder='e.g. link, price, 🔥, 👀 (comma separated)' value={keywords} onChange={(e) => setKeywords(e.target.value)} autoFocus />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}><strong style={{ color: '#a855f7' }}>Leave empty</strong> to reply to {targetType === 'dm' ? 'every DM' : 'every comment'}.</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>💡 Emojis work too!</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle} style={{ marginBottom: '1.5rem' }}>3. Public Reply Template</h2>

              {targetType !== 'post' ? (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>✨</div>
                  <div>
                    <h3 style={{ color: 'var(--text-heading)', fontWeight: 600, fontSize: '1rem', margin: 0, marginBottom: '0.25rem' }}>No Public Reply Needed</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                      Since this is triggered via <strong style={{ color: '#10b981' }}>{targetType === 'dm' ? 'DM' : 'Story Reply'}</strong>, there is no public comment to reply to.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>What should we publicly reply to their comment?</label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Check your DM {{name}} 👀"
                      value={replyTemplate}
                      onChange={(e) => setReplyTemplate(e.target.value)}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                      style={{ overflow: 'hidden', minHeight: '80px', transition: 'none' }}
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.95rem' }}>👀 Anti-Ban Reply Engine</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isLoadingPreviews && <Loader2 size={16} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />}
                        <div
                          onClick={() => setAntiBanEnabled(!antiBanEnabled)}
                          style={{ width: '44px', height: '24px', background: antiBanEnabled ? '#10b981' : 'var(--border)', borderRadius: '12px', padding: '2px', cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease' }}
                        >
                          <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: antiBanEnabled ? '22px' : '2px', transition: 'left 0.3s ease' }} />
                        </div>
                      </div>
                    </div>
                    {spinPreviews.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginTop: '1rem' }}>
                        {spinPreviews.map((preview, i) => (
                          <div key={i} style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                            {preview}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd', fontWeight: 600 }}>
                        <Sparkles size={18} /> Use Elite AI Engine
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>Coming Soon</span>
                      </div>
                      <button disabled className={styles.btnBack} style={{ padding: '0.5rem 1.5rem', opacity: 0.5, cursor: 'not-allowed', width: 'auto' }}>
                        Coming Later
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle} style={{ marginBottom: '1.5rem' }}>4. DM Configuration</h2>

              <div style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-hover)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>Delivery Strategy</h3>
                </div>
                <CustomDropdown
                  value={featureType}
                  onChange={(val) => setFeatureType(val)}
                  options={[
                    { value: 'standard', icon: '🔗', title: 'Standard Link', desc: 'Sends the link directly after they tap the button.' },
                    { value: 'follow_gate', icon: '🔒', title: 'Follow-Gate', desc: 'Requires following your account first.', disabled: userPlan === 'FREE' },
                    { value: 'lead_capture', icon: '📋', title: 'Lead Capture', desc: 'Collects email or phone before sending the link.', disabled: userPlan === 'FREE' }
                  ]}
                />
                {featureType === 'lead_capture' && (
                  <div style={{ marginTop: '-0.5rem' }}>
                    <label className={styles.label} style={{ marginBottom: '0.75rem' }}>Data to collect</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      {AVAILABLE_LEAD_FIELDS.map(field => (
                        <div
                          key={field.key}
                          onClick={() => toggleLeadField(field.key)}
                          style={{
                            padding: '0.5rem 1rem', borderRadius: '100px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
                            border: leadCaptureFields.includes(field.key) ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: leadCaptureFields.includes(field.key) ? 'rgba(99,102,241,0.12)' : 'var(--surface)',
                            color: leadCaptureFields.includes(field.key) ? 'var(--text-heading)' : 'var(--text-muted)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span>{field.icon}</span> {field.label}
                        </div>
                      ))}
                    </div>
                    <input type="text" className={styles.input} placeholder="Custom request message (optional)" value={leadCaptureAsk} onChange={(e) => setLeadCaptureAsk(e.target.value)} />
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-hover)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>2</div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>Message Content</h3>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                  <label className={styles.label}>1. Button Prompt Message</label>
                  <input type="text" className={styles.input} placeholder="Thanks for your interest! Tap below to get the link 👇" value={initialDmText} onChange={(e) => setInitialDmText(e.target.value)} style={{ marginTop: '0.5rem' }} />
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                  <label className={styles.label}>2. Final Delivery Message <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span></label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Type a custom message to send in the DM..."
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    style={{ minHeight: '80px', marginTop: '0.5rem' }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>3. Destination Links <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional if message is set)</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                    {dmLinks.map((link, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                          <input type="text" className={styles.input} placeholder="Button Name (e.g. 🔗 Buy Now)" value={link.title} onChange={(e) => { const updated = [...dmLinks]; updated[index].title = e.target.value; setDmLinks(updated); }} />
                          <input type="text" className={styles.input} placeholder="https://yourlink.com" value={link.url} onChange={(e) => { const updated = [...dmLinks]; updated[index].url = e.target.value; setDmLinks(updated); }} />
                        </div>
                        {dmLinks.length > 1 && (
                          <button type="button" onClick={() => setDmLinks(dmLinks.filter((_, i) => i !== index))} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setDmLinks([...dmLinks, { title: '', url: '' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', border: '1px dashed var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Plus size={14} /> Add Another Link
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle}>5. Review & Save</h2>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Campaign:</span>
                  <span style={{ fontWeight: 600 }}>{campaignName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Targeting:</span>
                  <span style={{ fontWeight: 600 }}>{targetType} ({selectedPosts.length || 'All'} posts)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Keywords:</span>
                  <span style={{ fontWeight: 600 }}>{keywords || "None (all comments)"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{featureType.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>DM Content:</span>
                  <span style={{ fontWeight: 600 }}>{dmMessage && dmLinks.filter(l => l.url).length > 0 ? 'Message + Links' : dmMessage ? 'Message' : 'Links'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMsg && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            Error: {errorMsg}
          </div>
        )}

        {/* Footer Navigation */}
        <div className={styles.footerNav}>
          {step > 1 ? (
            <button onClick={prevStep} className={styles.btnBack}><ChevronLeft size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Back</button>
          ) : (
            <Link href="/dashboard/automations" className={styles.btnBack}>Cancel</Link>
          )}

          {step < 5 ? (
            <button onClick={nextStep} className={styles.btnNext}>Continue <ChevronRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></button>
          ) : (
            <button onClick={handleSave} disabled={isSubmitting || (!dmMessage && dmLinks.filter(l => l.url).length === 0)} className={styles.btnNext} style={{ background: '#fafafa', color: '#09090b' }}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
