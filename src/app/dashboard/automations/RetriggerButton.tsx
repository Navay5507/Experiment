"use client";

import { useState } from "react";
import { RefreshCw, ShieldCheck, X } from "lucide-react";
import styles from "../dashboard.module.css";

export default function RetriggerButton({ automationId, hasMediaId, targetType }: { automationId: string; hasMediaId: boolean; targetType: string }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ queuedCount: 0, queuedImmediate: 0, queuedDelayed: 0, label: '' });

  const handleRetrigger = async () => {
    // For post automations: require media ID
    if (targetType === 'post' && !hasMediaId) {
      alert("Retrigger is only available for automations with specific posts selected. Go to Edit and select a post.");
      return;
    }

    // Story automations cannot be retriggered (no API to fetch past story replies)
    if (targetType === 'story') {
      alert("Story automations cannot be retriggered. To test, reply to your story from a personal account with the trigger keyword.");
      return;
    }

    // Confirmation message based on type
    const confirmMsg = targetType === 'dm'
      ? "This will scan your recent DM conversations for keyword matches that were missed and send them the automation reply. Proceed?"
      : "This will scan your selected posts for past comments and dispatch DMs to those who matched but haven't received one yet. Proceed?";

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/automations/${automationId}/retrigger`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrigger");
      }

      const label = targetType === 'dm' ? 'DM conversations' : 'past comments';
      setModalData({ 
        queuedCount: data.queuedCount || 0, 
        queuedImmediate: data.queuedImmediate || 0, 
        queuedDelayed: data.queuedDelayed || 0, 
        label 
      });
      setShowModal(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes retrigger-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxWidth: '28rem', width: '90%', padding: '24px', position: 'relative', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', color: '#9CA3AF', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#EFF6FF', color: '#3B82F6', padding: '10px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>Anti-Ban Engine Active</h3>
            </div>
            
            <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px', marginTop: 0 }}>
              Successfully scanned and queued <strong>{modalData.queuedCount} {modalData.label}</strong>.
            </p>

            <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ color: '#059669', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', marginTop: '5px', flexShrink: 0 }}></span>
                  <span style={{ lineHeight: 1.5 }}><strong>{modalData.queuedImmediate}</strong> will execute immediately.</span>
                </div>
                <div style={{ color: '#D97706', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', marginTop: '5px', flexShrink: 0 }}></span>
                  <span style={{ lineHeight: 1.5 }}><strong>{modalData.queuedDelayed}</strong> are in the 24-hour cooldown queue to protect your account.</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              style={{ width: '100%', backgroundColor: '#2563EB', color: '#ffffff', fontWeight: 500, fontSize: '0.95rem', padding: '10px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <button 
        type="button"
        onClick={handleRetrigger} 
        className={styles.btnAction} 
        title={targetType === 'dm' ? "Scan DMs for Missed Keywords" : targetType === 'post' ? "Sync Past Comments" : "Test Automation"} 
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        <RefreshCw size={16} style={loading ? { animation: 'retrigger-spin 1s linear infinite' } : undefined} />
      </button>
    </>
  );
}
