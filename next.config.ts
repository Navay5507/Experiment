import type { NextConfig } from "next";
import { withReticle } from '@reticlehq/next';

const securityHeaders = [
  // Force HTTPS — tells browsers/Meta scanners this site always uses encrypted connections
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevent MIME-type sniffing attacks
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // XSS protection for older browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Control referrer info sent to other sites
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict unnecessary browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['ioredis', 'bullmq'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  outputFileTracingExcludes: {
    '/middleware': [
      './node_modules/ioredis/**/*',
      './node_modules/bullmq/**/*',
    ],
    '/proxy': [
      './node_modules/ioredis/**/*',
      './node_modules/bullmq/**/*',
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to ALL routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withReticle(nextConfig);
