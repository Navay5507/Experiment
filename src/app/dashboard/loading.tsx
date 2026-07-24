export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', color: 'var(--text-muted)' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid rgba(107, 124, 255, 0.2)', 
        borderTopColor: 'var(--primary)', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
      <p style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.5px' }}>Loading data...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
