"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import styles from "../dashboard.module.css";

export default function RetriggerButton({ automationId, hasMediaId }: { automationId: string; hasMediaId: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleRetrigger = async () => {
    if (!hasMediaId) {
      alert("Retrigger is only available for automations with specific posts selected. Go to Edit and select a post.");
      return;
    }

    if (!confirm("This will scan the selected posts for past comments and dispatch DMs to those who matched but haven't received a DM yet. Proceed?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/automations/${automationId}/retrigger`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync past comments");
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
      title="Sync Past Comments" 
      disabled={loading}
      style={{ opacity: loading ? 0.5 : 1 }}
    >
      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    </button>
  );
}
