"use client";

import { useEffect } from "react";

export default function RedirectClient({ targetUrl }: { targetUrl: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      let finalUrl = targetUrl.trim();
      
      try {
        // If it lacks a scheme, assume https
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        
        const parsed = new URL(finalUrl);
        // Strictly enforce http/https
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          finalUrl = 'https://autodrop.in'; // Fallback for malicious schemes
        }
      } catch (e) {
        finalUrl = 'https://autodrop.in'; // Fallback on parse error
      }
      
      window.location.href = finalUrl;
    }, 2000);
    return () => clearTimeout(timer);
  }, [targetUrl]);

  return (
    <>
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(-8px); }
          50% { transform: translateY(8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseDots {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .rd-page {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          min-height: 100svh; background: #FAFAFA;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 2rem;
        }
        .rd-wrap {
          display: flex; flex-direction: column;
          align-items: center; gap: 1.5rem;
          animation: fadeInUp 0.5s ease-out both;
        }
        .rd-icon {
          animation: floatLogo 2.5s ease-in-out infinite;
        }
        .rd-icon img {
          width: 140px; height: 140px;
          object-fit: contain; display: block;
          filter: drop-shadow(0 8px 24px rgba(107, 124, 255, 0.3));
        }
        .rd-title {
          margin: 0; font-size: 1.9rem; font-weight: 800;
          color: #1E293B; text-align: center;
        }
        .rd-dots {
          animation: pulseDots 1.2s ease-in-out infinite;
          letter-spacing: 2px;
        }
        .rd-sub {
          margin: 0.25rem 0 0; color: #94A3B8;
          font-size: 0.95rem; font-weight: 500; text-align: center;
        }
        .rd-brand {
          color: #6B7CFF; font-weight: 800;
        }
        .rd-bar {
          width: 160px; height: 4px; border-radius: 4px;
          background: #E2E8F0; overflow: hidden; margin-top: 0.25rem;
        }
        .rd-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #6B7CFF, #8B9AFF);
          animation: fillBar 2s ease-in-out forwards;
        }
      `}</style>
      <div className="rd-page">
        <div className="rd-wrap">
          <div className="rd-icon">
            <img
              src="/autodrop_icon_transparent.png"
              alt="AutoDrop"
              width={140}
              height={140}
            />
          </div>
          <div>
            <h1 className="rd-title">
              Redirecting<span className="rd-dots"> ...</span>
            </h1>
            <p className="rd-sub">
              Automated by <span className="rd-brand">AutoDrop</span>
            </p>
          </div>
          <div className="rd-bar">
            <div className="rd-fill" />
          </div>
        </div>
      </div>
    </>
  );
}
