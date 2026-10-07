import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Help replaced the separate guidance hub
  async redirects() {
    return [{ source: "/guidance", destination: "/help", permanent: false }];
  },
  experimental: {
    // Vercel restores .next/cache between builds; a warm Turbopack cache once
    // shipped new pages with the previous build's stylesheet. Always build cold.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
