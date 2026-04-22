"use client";

import { useEffect } from "react";

export default function RedirectClient({ targetUrl }: { targetUrl: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      let finalUrl = targetUrl.trim();
      if (!finalUrl.match(/^https?:\/\//i) && !finalUrl.match(/^[a-z]+:\/\//i)) {
        finalUrl = 'https://' + finalUrl;
      }
      window.location.href = finalUrl;
    }, 2800); // 2.8 second brand display
    return () => clearTimeout(timer);
  }, [targetUrl]);

  return (
    <>
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDots {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .redirect-container {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          min-height: 100svh; background: #FAFAFA;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 2rem;
        }
        .redirect-content {
          display: flex; flex-direction: column;
          align-items: center; gap: 2rem;
          animation: fadeInUp 0.6s ease-out both;
        }
        .redirect-logo-wrap {
          animation: floatLogo 2.5s ease-in-out infinite;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 12px 30px -5px rgba(99, 102, 241, 0.35);
        }
        .redirect-logo {
          width: 100px; height: 100px;
          object-fit: contain; display: block;
        }
        .redirect-title {
          margin: 0; font-size: 2rem; font-weight: 800;
          color: #1E293B; text-align: center;
          display: flex; align-items: center; gap: 0.3rem;
        }
        .redirect-dots {
          animation: pulseDots 1.2s ease-in-out infinite;
          letter-spacing: 2px;
        }
        .redirect-subtitle {
          margin: 0; color: #94A3B8; font-size: 0.95rem;
          font-weight: 500; text-align: center;
        }
        .redirect-brand {
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          animation: shimmer 2s linear infinite;
        }
        .redirect-bar-track {
          width: 180px; height: 4px; border-radius: 4px;
          background: #E2E8F0; overflow: hidden; margin-top: 0.5rem;
        }
        .redirect-bar-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          animation: fillBar 2.8s ease-in-out forwards;
        }
        @keyframes fillBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <div className="redirect-container">
        <div className="redirect-content">
          <div className="redirect-logo-wrap">
            <img
              src="/autodrop_logo_transparent.png"
              alt="AutoDrop"
              className="redirect-logo"
              width={100}
              height={100}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 className="redirect-title">
              Redirecting<span className="redirect-dots">...</span>
            </h1>
            <p className="redirect-subtitle">
              This conversation is automated by <span className="redirect-brand">Autodrop</span>
            </p>
          </div>
          <div className="redirect-bar-track">
            <div className="redirect-bar-fill" />
          </div>
        </div>
      </div>
    </>
  );
}
