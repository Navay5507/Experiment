"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./form.module.css";
import Link from "next/link";
import { Check, ChevronRight, ChevronLeft, Image as ImageIcon, Sparkles, Loader2, Plus, X, MessageSquare, Link as LinkIcon } from "lucide-react";

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
  }, [replyTemplate]);

  const togglePost = (id: string) => {
    setSelectedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
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
          campaignName, targetType, featureType, selectedPosts: finalPosts, keywords,
          replyTemplate, leadCaptureAsk,
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

  const nextStep = () => { if (step < 5) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

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
              <h2 className={styles.stepTitle}>1. Choose Automation Type</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Select what type of Instagram content you want to monitor for trigger keywords.</p>

              <div style={{ marginBottom: '2rem' }}>
                <label className={styles.label}>Campaign Name <span style={{ color: '#eb3fb4' }}>*</span></label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Summer Sale 2026 Lead Gen"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This is strictly for your internal Dashboard organization.</div>
              </div>

              {/* Type Selector Cards */}
              <div className={styles.typeGrid}>
                {[
                  { key: 'post', icon: '📸', label: 'Post / Reel', desc: 'Monitor comments on specific posts or reels', pro: false },
                  { key: 'story', icon: '⏱️', label: 'Story Reply', desc: 'Auto-reply to story responses', pro: true },
                  { key: 'dm', icon: '📩', label: 'Direct Message', desc: 'Trigger when someone DMs you a keyword', pro: true },
                ].map(t => {
                  const isPro = userPlan === 'PRO' || userPlan === 'ELITE';
                  const disabled = t.pro && !isPro;
                  
                  return (
                    <div
                      key={t.key}
                      onClick={() => !disabled && setTargetType(t.key)}
                      style={{
                        padding: '1.25rem', borderRadius: '16px', cursor: disabled ? 'default' : 'pointer', textAlign: 'center',
                        border: targetType === t.key ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: targetType === t.key ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s ease',
                        opacity: disabled ? 0.4 : 1,
                        position: 'relative'
                      }}
                    >
                      {t.pro && (
                        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', fontWeight: 700 }}>PRO</div>
                      )}
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t.icon}</div>
                      <div style={{ fontWeight: 700, color: targetType === t.key ? '#fff' : 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.25rem' }}>{t.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.desc}</div>
                      {disabled && (
                         <Link href="/pricing" style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem', display: 'block', textDecoration: 'none' }}>Upgrade to Unlock</Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Type-specific content below */}
              {targetType === 'post' && (
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>Select specific posts to monitor</h3>
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
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', marginTop: '0.5rem' }}>
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
                      <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>No posts available</p>
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
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Leave empty to apply to <strong>all future posts</strong> automatically.</p>
                    </div>
                  )}
                </div>
              )}

              {targetType === 'story' && (
                <div style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏱️</div>
                  <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>Story Reply Automation</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    This automation monitors <strong style={{ color: '#fff' }}>story replies</strong> from your followers. When someone replies to any of your stories with a matching keyword, Autodrop will automatically send them a DM with your configured content.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>Applies to all stories — no specific selection needed.</p>
                </div>
              )}

              {targetType === 'dm' && (
                <div style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📩</div>
                  <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>DM Keyword Automation</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    This automation triggers when someone <strong style={{ color: '#fff' }}>DMs your account</strong> with a specific keyword. AutoDROP will automatically send them your configured reply — with links, lead capture, or follow-gate included.
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>Works on all incoming DMs — no post selection needed.</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle}>2. Add Keywords</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Which words should trigger this automation?</label>
                <input type="text" className={styles.input} placeholder='e.g. "link", "price", "info", "🔥", "👀"' value={keywords} onChange={(e) => setKeywords(e.target.value)} autoFocus />
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>Separate multiple keywords with commas. <strong style={{ color: '#a855f7' }}>Leave empty → every {targetType === 'dm' ? 'DM' : 'comment'} gets a reply automatically.</strong></p>
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💡</span> <span><strong style={{ color: '#c4b5fd' }}>Tip:</strong> Emojis work as keywords too! e.g. 🔥, 👀, ❤️, 💰</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="enter" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 className={styles.stepTitle}>3. Public Reply Template</h2>
              
              {targetType !== 'post' ? (
                <div style={{ 
                  padding: '2.5rem 2rem', 
                  borderRadius: '24px', 
                  border: '1px solid rgba(99, 102, 241, 0.15)', 
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)', 
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center', 
                  margin: '1.5rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    📩
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>
                    No Public Reply Needed
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px', margin: 0 }}>
                    Since this automation is triggered in private by <strong style={{ color: '#fff' }}>{targetType === 'dm' ? 'an incoming DM' : 'a Story Reply'}</strong>, there is no public comment to reply to.
                  </p>
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '100px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: '0.85rem',
                    color: '#10b981',
                    fontWeight: 600
                  }}>
                    ✨ You can safely skip this step!
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Click <strong>Continue</strong> below to configure your DM response flow in Step 4.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>What should we publicly reply to their comment?</label>
                    <textarea className={styles.textarea} placeholder="Check your DM {{name}} 👀" value={replyTemplate} onChange={(e) => setReplyTemplate(e.target.value)} autoFocus />
                  </div>
                  
                  <div className={styles.formGroup} style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>👀 Anti-Ban Reply Preview</div>
                       {isLoadingPreviews && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                      Meta flags accounts that send the exact same reply repeatedly. We automatically <strong style={{color: '#a855f7'}}>spin</strong> your template to keep your account safe. Here are some examples of what we'll send:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {spinPreviews.map((preview, i) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '0.9rem', color: '#fff', display: 'inline-block', alignSelf: 'flex-start' }}>
                          {preview}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.formGroup} style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd', fontWeight: 600 }}>
                         <Sparkles size={18} /> Use Elite AI Engine
                         <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)', marginLeft: '0.5rem' }}>Coming Soon</span>
                       </div>
                       <button disabled className={styles.btnBack} style={{ padding: '0.5rem 1.5rem', opacity: 0.5, cursor: 'not-allowed' }}>
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
              <h2 className={styles.stepTitle}>4. DM Configuration</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Configure how the DM conversation flows when someone triggers the automation.</p>

              {/* Initial DM Text */}
              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Initial DM Message (shown with "Send me the link" button)</label>
                <input type="text" className={styles.input} placeholder="Thanks for your interest! Tap below to get the link 👇" value={initialDmText} onChange={(e) => setInitialDmText(e.target.value)} />
              </div>

              {/* Feature Type Selection */}
              {(() => {
                const isPro = userPlan === 'PRO' || userPlan === 'ELITE';
                const featureOptions = [
                  { key: 'standard', icon: '🔗', title: 'Standard Link', desc: 'Sends the link directly after they tap the button.', pro: false },
                  { key: 'follow_gate', icon: '🔒', title: 'Follow-Gate', desc: 'Requires following your account first.', pro: true },
                  { key: 'lead_capture', icon: '📋', title: 'Lead Capture', desc: 'Collects data before sending the link.', pro: true },
                ];
                return (
                  <div className={styles.featureGrid} style={{ marginBottom: '1.5rem' }}>
                    {featureOptions.map(f => {
                      const locked = f.pro && !isPro;
                      return (
                        <div
                          key={f.key}
                          onClick={() => !locked && setFeatureType(f.key)}
                          className={`${styles.featureCard} ${featureType === f.key ? styles.featureActive : ''}`}
                          style={{
                            opacity: locked ? 0.4 : 1,
                            cursor: locked ? 'default' : 'pointer',
                            position: 'relative',
                          }}
                        >
                          {f.pro && (
                            <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', fontWeight: 700 }}>PRO</div>
                          )}
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                          <h4>{f.title}</h4>
                          <p>{f.desc}</p>
                          {locked && (
                            <a href="/pricing" style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.5rem', display: 'block', textDecoration: 'none' }}>Upgrade to Unlock</a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Follow-Gate Explanation */}
              {featureType === 'follow_gate' && (
                <div style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', marginBottom: '1.5rem' }}>
                  <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem' }}>🔒 Follow-Gate Flow</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>After the user taps "Send me the link", they'll receive a message with two buttons:</p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <span style={{ padding: '0.4rem 1rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>👤 Visit Profile</span>
                    <span style={{ padding: '0.4rem 1rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>✅ I'm Following</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem', fontStyle: 'italic' }}>The system verifies their follow status before sending the link.</p>
                </div>
              )}

              {/* Lead Capture Configuration */}
              {featureType === 'lead_capture' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className={styles.label} style={{ marginBottom: '0.75rem' }}>Select data to collect from the user</label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Choose which information to request. Each field is validated automatically (e.g. phone numbers are verified by digit count and country code).</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {AVAILABLE_LEAD_FIELDS.map(field => (
                      <div
                        key={field.key}
                        onClick={() => toggleLeadField(field.key)}
                        style={{
                          padding: '0.6rem 1.2rem', borderRadius: '100px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                          border: leadCaptureFields.includes(field.key) ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: leadCaptureFields.includes(field.key) ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                          color: leadCaptureFields.includes(field.key) ? '#fff' : 'var(--text-muted)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span>{field.icon}</span> {field.label}
                        {leadCaptureFields.includes(field.key) && <span style={{ color: '#10b981' }}>✓</span>}
                      </div>
                    ))}
                  </div>

                  {leadCaptureFields.length > 0 && (
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1rem' }}>
                      <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>✓ {leadCaptureFields.length} field{leadCaptureFields.length > 1 ? 's' : ''} selected</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Users will be asked for each field in order: {leadCaptureFields.join(' → ')}</p>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Custom lead capture message (optional)</label>
                    <input type="text" className={styles.input} placeholder="Hey! We need a few details before sending the link..." value={leadCaptureAsk} onChange={(e) => setLeadCaptureAsk(e.target.value)} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This is shown before asking for the first field. Leave empty for default prompts.</p>
                  </div>
                </div>
              )}

              {/* Optional DM Message */}
              <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                <label className={styles.label}>Custom DM Message <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span></label>
                <textarea
                  className={styles.textarea}
                  placeholder="Type a custom message to send in the DM... e.g. Hey! Thanks for reaching out. Here's everything you need to know about our product."
                  value={dmMessage}
                  onChange={(e) => setDmMessage(e.target.value)}
                  rows={3}
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This message will be delivered when the user taps the button. Leave empty to only send links.</p>
              </div>

              {/* Destination Links */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Destination Link(s) & Button Names <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional if message is set)</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                      border: '1px dashed var(--border)', background: 'rgba(255,255,255,0.02)',
                      color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Plus size={14} /> Add Another Link
                  </button>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Links are delivered after the user taps the button in the DM.</p>
              </div>
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

              {errorMsg && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Error: {errorMsg}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
