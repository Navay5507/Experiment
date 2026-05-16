import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ioredis', 'bullmq'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
