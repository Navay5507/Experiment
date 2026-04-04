import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0d1117',
      color: 'var(--text-muted)',
      gap: '1rem'
    }}>
      <Loader2 className="animate-spin" size={40} style={{ opacity: 0.3 }} />
      <p style={{ fontSize: '0.9rem' }}>Detecting your location & currency...</p>
    </div>
  );
}
