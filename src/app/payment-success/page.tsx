"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100svh', background: '#0F172A', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '500px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', animation: 'slideUp 0.5s ease-out' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'scaleIn 0.5s ease-out 0.2s both' }}>
          <CheckCircle size={40} />
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#F8FAFC' }}>
          Payment Successful!
        </h1>
        
        <p style={{ color: '#94A3B8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Welcome to AutoDrop Pro. Your account has been instantly upgraded. You are now ready to automate your Instagram engagement and capture leads on autopilot.
        </p>
        
        <Link 
          href="/dashboard" 
          style={{ 
            display: 'inline-block', 
            background: 'linear-gradient(135deg, #6B7CFF 0%, #4F46E5 100%)', 
            color: 'white', 
            textDecoration: 'none', 
            padding: '1rem 2.5rem', 
            borderRadius: '12px', 
            fontWeight: 600, 
            fontSize: '1.1rem', 
            transition: 'transform 0.2s, box-shadow 0.2s', 
            boxShadow: '0 8px 20px rgba(107, 124, 255, 0.3)' 
          }}
        >
          Go to Dashboard
        </Link>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
