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
              // Allow Google/Firebase auth scripts (gapi) + Next dev tooling
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com",
              "script-src-elem 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://accounts.google.com https://apis.google.com",
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
