'use client';
import { useEffect } from 'react';

/** Dev-only: connect Reticle + install the React adapter, after hydration. */
export function ReticleDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    void import('@reticlehq/react').then(({ reticle, install }) => {
      install();
      reticle.connect({ url: 'ws://localhost:3000/reticle', projectId: 'autodrop-web-2e10f1fb' });
    });
  }, []);
  return null;
}
