import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://translate.google.com https://translate.googleapis.com https://www.gstatic.com https://*.google.com https://*.googleapis.com https://images.unsplash.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://*.convex.cloud wss://*.convex.cloud",
              "frame-src 'self' https://translate.google.com https://maps.google.com https://*.google.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
