import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Help replaced the separate guidance hub
  async redirects() {
    return [{ source: "/guidance", destination: "/help", permanent: false }];
  },
  // Standard security headers checked by public sector IT reviews
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
  experimental: {
    // Vercel restores .next/cache between builds; a warm Turbopack cache once
    // shipped new pages with the previous build's stylesheet. Always build cold.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
