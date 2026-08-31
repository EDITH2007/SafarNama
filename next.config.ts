import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://js.puter.com https://puter.com https://*.puter.com",
  "style-src 'self' 'unsafe-inline' https://translate.googleapis.com https://www.gstatic.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://translate.google.com https://translate.googleapis.com https://www.gstatic.com https://*.gstatic.com https://fonts.gstatic.com https://*.google.com https://*.googleapis.com https://*.googleusercontent.com https://images.unsplash.com https://source.unsplash.com https://*.unsplash.com https://upload.wikimedia.org https://*.wikimedia.org https://images.pexels.com https://*.pexels.com https://i.imgur.com https://*.imgur.com https://res.cloudinary.com https://*.cloudinary.com https://*.tile.openstreetmap.org https://*.convex.cloud https://*.convex.site https://avatars.githubusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com https://*.convex.cloud wss://*.convex.cloud https://*.convex.site wss://*.convex.site https://js.puter.com https://api.puter.com https://puter.com https://*.puter.com wss://*.puter.com https://open.er-api.com https://api.exchangerate-api.com https://v6.exchangerate-api.com",
  "frame-src 'self' https://translate.google.com https://translate.googleapis.com https://maps.google.com https://www.google.com https://*.google.com https://js.puter.com https://puter.com https://*.puter.com",
  "child-src 'self' blob: https://translate.google.com https://translate.googleapis.com https://maps.google.com https://*.google.com https://*.puter.com",
  "worker-src 'self' blob:",
  "media-src 'self' data: blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
