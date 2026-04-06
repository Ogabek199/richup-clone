import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Basic CSP (kept permissive for Firebase/Next; tighten later if needed)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
