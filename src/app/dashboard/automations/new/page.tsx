"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./form.module.css";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, Loader2, Plus, X, MessageSquare, Link as LinkIcon } from "lucide-react";

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
                  onMouseEnter={(e) => {
                    if (!opt.disabled && value !== opt.value) e.currentTarget.style.background = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!opt.disabled && value !== opt.value) e.currentTarget.style.background = 'transparent';
                  }}
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

export default function CreateAutomation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = searchParams.get('account') || '';
  const [step, setStep] = useState(1);
  
  // State Payloads
  const [campaignName, setCampaignName] = useState("");
  const [targetType, setTargetType] = useState("post");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [replyTemplate, setReplyTemplate] = useState("Check your DM! 👀");
  const [featureType, setFeatureType] = useState("standard");
  const [dmLink, setDmLink] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [dmLinks, setDmLinks] = useState<{title: string, url: string}[]>([{ title: '', url: '' }]);
  const [leadCaptureAsk, setLeadCaptureAsk] = useState("");
  const [initialDmText, setInitialDmText] = useState("Thanks for your interest! Tap below to get the link 👇");
  const [leadCaptureFields, setLeadCaptureFields] = useState<string[]>([]);

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [antiBanEnabled, setAntiBanEnabled] = useState(true);

  const [spinPreviews, setSpinPreviews] = useState<string[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  const [realPosts, setRealPosts] = useState<{ id: string; caption?: string; media_type?: string; media_url?: string; thumbnail_url?: string; timestamp?: string }[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [manualMediaId, setManualMediaId] = useState("");
  const [userPlan, setUserPlan] = useState<string>("FREE");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mediaRes = await fetch(accountId ? `/api/instagram/media?accountId=${accountId}` : '/api/instagram/media');
        const mediaData = await mediaRes.json();
        setIsConnected(mediaData.isConnected === true);
        if (mediaData.media && mediaData.media.length > 0) {
          setRealPosts(mediaData.media);
        }

        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const { data: userData } = await profileRes.json();
          if (userData?.plan) setUserPlan(userData.plan);
        }
      } catch (err) {
        console.error("Fetch initial data failed:", err);
        setIsConnected(false);
      } finally {
        setPostsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPreviews = async () => {
      if (!antiBanEnabled) {
        setSpinPreviews([replyTemplate]);
        return;
      }
      setIsLoadingPreviews(true);
      try {
        const res = await fetch('/api/automations/spin-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template: replyTemplate })
        });
        const data = await res.json();
        setSpinPreviews(data.variations || []);
      } catch (err) {
        console.error("Failed to fetch spin previews");
      } finally {
        setIsLoadingPreviews(false);
      }
    };
    
    const timeout = setTimeout(fetchPreviews, 500);
    return () => clearTimeout(timeout);
  }, [replyTemplate, antiBanEnabled]);

  const togglePost = (id: string) => {
    setSelectedPosts(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (userPlan === 'FREE') {
        // For free users, selecting a new post replaces the old one seamlessly
        return [id];
      }
      return [...prev, id];
    });
  };

  const handleActivate = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    // If user typed manual media IDs, use those
    const finalPosts = selectedPosts.length > 0 
      ? selectedPosts 
      : manualMediaId.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const filteredLinks = dmLinks.filter(l => l.url.trim() !== '');
      const encodedLinks = filteredLinks.map(l => l.title.trim() ? `${l.title.trim()}|||${l.url.trim()}` : l.url.trim());

      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName, targetType, featureType, selectedPosts: finalPosts,
          // Strip any surrounding quote characters users may have typed (e.g. "link" → link)
          keywords: keywords.split(',').map(k => k.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')).filter(Boolean).join(','),
          replyTemplate: antiBanEnabled ? replyTemplate : `${replyTemplate}__NO_SPIN__`,
          leadCaptureAsk,
          dmLink: encodedLinks.length > 0 ? encodedLinks[0] : '',
          dmMessage: dmMessage || '',
          dmLinks: encodedLinks,
          aiEnabled,
          initialDmText,
          leadCaptureFields: featureType === 'lead_capture' ? leadCaptureFields : [],
          instagramUserId: accountId || null,
        })
      });

      if (!res.ok) throw new Error("Server error saving automation");
      router.push(accountId ? `/dashboard/automations?account=${accountId}` : '/dashboard/automations');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      setIsSubmitting(false);
    }
  };

  const nextStep = () => { 
    setErrorMsg("");
    if (step === 1) {
      if (!campaignName.trim()) {
        setErrorMsg("Please enter a Campaign Name before proceeding.");
        return;
      }
      if (targetType === 'post' && manualMediaId.trim()) {
        const hasUrl = manualMediaId.includes('http') || manualMediaId.includes('instagram.com');
        const hasLetters = /[a-zA-Z]/.test(manualMediaId);
        if (hasUrl || hasLetters) {
          setErrorMsg("Please enter a numeric Media ID (e.g., 17895695668004550), not an Instagram link. Leave empty to apply to all posts.");
          return;
        }
      }
    }
    if (step < 5) setStep(step + 1); 
  };
  const prevStep = () => { 
    setErrorMsg("");
    if (step > 1) setStep(step - 1); 
  };

  const slideVariants = {
    initial: { x: 50, opacity: 0 },
    enter: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={styles.title}>
          Create Automation
        </motion.h1>
        <p className={styles.subtitle}>Supercharge your engagement across 5 intuitive steps.</p>
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
                  placeholder="e.g. Summer Sale 2026 (Internal use only)"
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
              {userPlan === 'FREE' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.5rem', marginBottom: '2rem' }}>
                  Story and DM automations require the <Link href="/pricing" style={{ color: 'var(--primary)' }}>Growth Pro plan</Link>.
                </p>
              )}

              {/* Type-specific content below */}
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
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Tap to select posts. Keywords will only be matched on selected posts.</p>
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
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                        {isConnected 
                          ? "Your connected account currently has 0 posts. Post a photo/reel, or leave the Media ID empty to apply to all future posts."
                          : "Connect your Instagram account from Settings to load your posts, or enter a Media ID manually."}
                      </p>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Paste Instagram Media ID (e.g., 17895695668004550)"
                        value={manualMediaId}
                        onChange={(e) => setManualMediaId(e.target.value)}
                      />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Leave empty to apply this automation to ALL current and future posts.</p>
                    </div>
                  )}
                </div>
              )}

              {targetType === 'story' && (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>⏱️</div>
                  <div>
                    <p style={{ color: 'var(--text-heading)', fontWeight: 600, marginBottom: '0.25rem' }}>Story Reply Automation</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                      Monitors story replies from followers. When someone replies with a keyword, they get an auto-DM. <br/><span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Applies to all stories automatically.</span>
                    </p>
                  </div>
                </div>
              )}

              {targetType === 'dm' && (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>📩</div>
                  <div>
                    <p style={{ color: 'var(--text-heading)', fontWeight: 600, marginBottom: '0.25rem' }}>DM Keyword Automation</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                      Triggers when someone DMs your account with a specific keyword. <br/><span style={{ fontStyle: 'italic', color: '#3b82f6' }}>Works on all incoming DMs.</span>
                    </p>
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
                <div style={{ 
                  padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem'
                }}>
                  <div style={{ fontSize: '2rem' }}>✨</div>
                  <div>
                    <h3 style={{ color: 'var(--text-heading)', fontWeight: 600, fontSize: '1rem', margin: 0, marginBottom: '0.25rem' }}>No Public Reply Needed</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                      Since this is triggered via <strong style={{ color: '#10b981' }}>{targetType === 'dm' ? 'DM' : 'Story Reply'}</strong>, there's no public comment to reply to. Click Continue to configure your DM.
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
                         {isLoadingPreviews && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                         <div 
                           onClick={() => setAntiBanEnabled(!antiBanEnabled)}
                           style={{
                             width: '44px',
                             height: '24px',
                             background: antiBanEnabled ? '#10b981' : 'var(--border)',
                             borderRadius: '12px',
                             padding: '2px',
                             cursor: 'pointer',
                             position: 'relative',
                             transition: 'background 0.3s ease'
                           }}
                         >
                           <div style={{
                             width: '20px',
                             height: '20px',
                             background: '#fff',
                             borderRadius: '50%',
                             position: 'absolute',
                             top: '2px',
                             left: antiBanEnabled ? '22px' : '2px',
                             transition: 'left 0.3s ease'
                           }} />
                         </div>
                       </div>
                    </div>
                    
                    <details style={{ marginTop: '0.75rem', cursor: 'pointer' }}>
                      <summary style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, outline: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', userSelect: 'none' }}>
                        <ChevronDown size={16} /> View Engine Details & Generated Previews
                      </summary>
                      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <details style={{ marginBottom: '1.25rem', cursor: 'pointer' }}>
                          <summary style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, outline: 'none' }}>What is the Anti-Ban Engine?</summary>
                          <div style={{ padding: '0.75rem', marginTop: '0.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.1)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            <strong>Your account safety is our obsession.</strong> Unlike older tools that force hundreds of identical messages through the door at once, AutoDrop acts like a smart traffic controller. We use Meta's Official API to route your DMs smoothly. Our engine automatically adds organic pauses and <strong>shuffles your text</strong> (as previewed below) so every public comment reply feels unique. This keeps you well within Instagram's good graces, ensuring your account stays pristine, protected, and fully compliant.
                          </div>
                        </details>
                        
                        {antiBanEnabled ? (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                            Meta flags accounts that send the exact same reply repeatedly. We automatically <strong style={{color: '#a855f7'}}>spin</strong> your template to keep your account safe. Here are some examples of what we'll send:
                          </p>
                        ) : (
                          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.85rem', color: '#ef4444', margin: 0 }}>
                              <strong>Warning:</strong> Anti-Ban Engine is disabled. We strongly recommend keeping this enabled. Sending identical replies continuously dramatically increases your risk of a Meta ban.
                            </p>
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                          {spinPreviews.map((preview, i) => (
                            <div key={i} style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-heading)', display: 'inline-block', alignSelf: 'flex-start' }}>
                              {preview}
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
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
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Full AI integration with your Knowledge Base is currently in development.</p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle} style={{ marginBottom: '1.5rem' }}>4. DM Configuration</h2>

              {/* Box 1: Delivery Strategy */}
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

                {/* Follow-Gate Explanation */}
                {featureType === 'follow_gate' && (
                  <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', marginTop: '-0.5rem' }}>
                    <p style={{ color: 'var(--text-heading)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}><strong>How it works:</strong> After tapping "Send me the link", the user is prompted to follow you. We verify their follow status via Meta's API before delivering the final link.</p>
                  </div>
                )}

                {/* Lead Capture Configuration */}
                {featureType === 'lead_capture' && (
                  <div style={{ marginTop: '-0.5rem' }}>
                    <label className={styles.label} style={{ marginBottom: '0.75rem' }}>Data to collect (Auto-validated)</label>
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

                    <div className={styles.formGroup}>
                      <input type="text" className={styles.input} placeholder="Custom request message (optional, e.g. We just need your email to send it...)" value={leadCaptureAsk} onChange={(e) => setLeadCaptureAsk(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Box 2: Message Content */}
              <div style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface-hover)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>2</div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-heading)' }}>Message Content</h3>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                  <label className={styles.label}>1. Button Prompt Message</label>
                  <input type="text" className={styles.input} placeholder="Thanks for your interest! Tap below to get the link 👇" value={initialDmText} onChange={(e) => setInitialDmText(e.target.value)} style={{ marginTop: '0.5rem' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This is the very first message they receive, containing the "Send me the link" button.</p>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                  <label className={styles.label}>2. Final Delivery Message <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span></label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Type a custom message to send in the DM..."
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                    style={{ minHeight: '80px', marginTop: '0.5rem', overflow: 'hidden' }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>3. Destination Links <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional if message is set)</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                    {dmLinks.map((link, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                          <input
                            type="text"
                            className={styles.input}
                            placeholder="Button Name (e.g. 🔗 Buy Now)"
                            value={link.title}
                            onChange={(e) => {
                              const updated = [...dmLinks];
                              updated[index].title = e.target.value;
                              setDmLinks(updated);
                            }}
                          />
                          <input
                            type="text"
                            className={styles.input}
                            placeholder={index === 0 ? 'URL (e.g. https://mywebsite.com/product)' : `https://example.com/link-${index + 1}`}
                            value={link.url}
                            onChange={(e) => {
                              const updated = [...dmLinks];
                              updated[index].url = e.target.value;
                              setDmLinks(updated);
                            }}
                          />
                        </div>
                        {dmLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDmLinks(dmLinks.filter((_, i) => i !== index))}
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDmLinks([...dmLinks, { title: '', url: '' }])}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.6rem', borderRadius: '10px', cursor: 'pointer',
                        border: '1px dashed var(--border)', background: 'var(--surface)',
                        color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Plus size={14} /> Add Another Link
                    </button>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Links are delivered after the user taps the button in the DM.</p>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle}>5. Review & Activate</h2>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Targeting:</span>
                    <span style={{ fontWeight: 600 }}>{targetType} ({selectedPosts.length || (manualMediaId ? manualMediaId.split(',').length : 'All')} selected)</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Keywords:</span>
                    <span style={{ fontWeight: 600 }}>{keywords || "None"}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{featureType.replace('_', ' ')}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>DM Content:</span>
                    <span style={{ fontWeight: 600 }}>{dmMessage && dmLinks.filter(Boolean).length > 0 ? 'Message + Links' : dmMessage ? 'Message' : 'Links'}</span>
                 </div>
                 {dmMessage && (
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Message:</span>
                      <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dmMessage.substring(0, 50)}{dmMessage.length > 50 ? '...' : ''}</span>
                   </div>
                 )}
                 {dmLinks.filter(Boolean).length > 0 && (
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Links:</span>
                      <span style={{ fontWeight: 600 }}>{dmLinks.filter(Boolean).length} link{dmLinks.filter(Boolean).length > 1 ? 's' : ''}</span>
                   </div>
                 )}
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>AI Mode:</span>
                    <span style={{ fontWeight: 600, color: aiEnabled ? '#a855f7' : '#fff' }}>{aiEnabled ? 'Enabled' : 'Disabled'}</span>
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
              <button onClick={nextStep} className={styles.btnNext}>Continue <ChevronRight size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}/></button>
           ) : (
              <button onClick={handleActivate} disabled={isSubmitting || (!dmMessage && dmLinks.filter(Boolean).length === 0 && !dmLink)} className={styles.btnNext} style={{ background: '#10b981' }}>
                 {isSubmitting ? "Activating..." : "🚀 Turn On Pipeline"}
              </button>
           )}
        </div>
      </div>
    </div>
  );
}
