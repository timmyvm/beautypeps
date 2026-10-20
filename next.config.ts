import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets several dev servers run side by side (NEXT_DIST_DIR=.next-a next dev -p 3001)
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
