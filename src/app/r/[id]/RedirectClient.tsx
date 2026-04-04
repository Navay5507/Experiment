"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function RedirectClient({ targetUrl }: { targetUrl: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      let finalUrl = targetUrl.trim();
      // Ensure absolute URL routing so 'google.com' doesn't become a relative path 
      if (!finalUrl.match(/^https?:\/\//i) && !finalUrl.match(/^[a-z]+:\/\//i)) {
        finalUrl = 'https://' + finalUrl;
      }
      window.location.href = finalUrl;
    }, 2200); // 2.2 second brand promotion delay
    return () => clearTimeout(timer);
  }, [targetUrl]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100svh', background: '#FAFAFA',
      color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}
      >
        {/* Floating Animated Logo */}
        <motion.div
           animate={{ y: [-5, 5, -5] }}
           transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
           style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '1.2rem', borderRadius: '15px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}
        >
          <MessageCircle size={36} />
        </motion.div>
        
        {/* Text Component exactly matching the requested vibe */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
            Redirecting
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </h1>
          <p style={{ margin: '0.75rem 0 0', color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>
            This conversation is automated by <span style={{ color: '#6366f1', fontWeight: 700 }}>Autodrop</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
