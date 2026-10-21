import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets several dev servers run side by side (NEXT_DIST_DIR=.next-a next dev -p 3001)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  devIndicators: false,
  // Public pages prerender to a static shell; only per-visitor parts (bag, session) stream in.
  cacheComponents: true,
  // Off on purpose: with it on (16.4.2) the router leaves its route prefetches unread, so every page
  // holds ~8 requests open, enough to stall a browser's 6 connections on an HTTP/1.1 host. Revisit on upgrade.
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      // Admin uploads go to Vercel Blob in production
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  serverExternalPackages: ["@libsql/client", "libsql"],
  experimental: {
    // Admin image uploads go through Server Actions
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
