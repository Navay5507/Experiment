"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import styles from "../dashboard.module.css";

export default function RetriggerButton({ automationId, hasMediaId, targetType }: { automationId: string; hasMediaId: boolean; targetType: string }) {
  const [loading, setLoading] = useState(false);

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
      alert(`Success! Queued automation for ${data.queuedCount} ${label}.`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@keyframes retrigger-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
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
