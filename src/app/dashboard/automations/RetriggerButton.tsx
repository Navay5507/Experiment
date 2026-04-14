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

    if (targetType !== 'post') {
      alert("To test this automation, use your personal Instagram account to reply to your page's story with the trigger keyword. The Instagram API does not allow pages to send test DMs to themselves.");
      return;
    }

    if (!confirm("This will scan your selected posts for past comments and dispatch DMs to those who matched but haven't received one yet. Proceed?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/automations/${automationId}/retrigger`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrigger");
      }

      alert(`Success! Queued DMs for ${data.queuedCount} past comments.`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleRetrigger} 
      className={styles.btnAction} 
      title={targetType === 'post' ? "Sync Past Comments" : "Send Test DM"} 
      disabled={loading}
      style={{ opacity: loading ? 0.5 : 1 }}
    >
      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    </button>
  );
}
