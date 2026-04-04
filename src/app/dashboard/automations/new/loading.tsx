import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-muted)' }}>
      <Loader2 className="animate-spin" size={40} style={{ opacity: 0.3 }} />
      <p style={{ fontSize: '0.9rem' }}>Initializing automation wizard...</p>
    </div>
  );
}
