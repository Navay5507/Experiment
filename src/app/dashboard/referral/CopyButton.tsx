"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import styles from "../dashboard.module.css";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      className={styles.btnAction}
      style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: copied ? '#10b981' : 'var(--primary)',
        borderColor: copied ? '#10b981' : 'var(--primary)',
        transition: 'all 0.2s',
      }}
      onClick={handleCopy}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
