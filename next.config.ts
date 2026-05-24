import type { NextConfig } from "next";

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
};

export default nextConfig;
