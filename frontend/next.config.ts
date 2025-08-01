import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      // Turbopack 설정
    }
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;