export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header Skeleton */}
      <header style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ width: 140, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: '6px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        
        <div style={{ display: 'flex', gap: '2.5rem' }} className="hidden-mobile">
          <div style={{ width: 60, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
          <div style={{ width: 80, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
          <div style={{ width: 60, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
          <div style={{ width: 90, height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }} />
        </div>

        <div style={{ width: 90, height: 40, background: 'rgba(59,130,246,0.2)', borderRadius: '100px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </header>

      {/* Hero Skeleton */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12vh', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        
        {/* Top badge */}
        <div style={{ width: 180, height: 32, background: 'rgba(59,130,246,0.1)', borderRadius: '100px', marginBottom: '2rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

        {/* Hero title */}
        <div style={{ width: '100%', maxWidth: '800px', height: '12vw', maxHeight: '72px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ width: '80%', maxWidth: '600px', height: '12vw', maxHeight: '72px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '2.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        
        {/* Subtitle */}
        <div style={{ width: '60%', maxWidth: '450px', height: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '0.75rem' }} />
        <div style={{ width: '45%', maxWidth: '350px', height: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '3rem' }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ width: 160, height: 50, background: 'rgba(59,130,246,0.3)', borderRadius: '100px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <div style={{ width: 160, height: 50, background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }} />
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hidden-mobile { display: flex; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
