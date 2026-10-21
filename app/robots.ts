import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private or per-visitor pages, and search results (endless URL variations with nothing new to index).
        disallow: ["/admin", "/account", "/checkout", "/cart", "/api", "/login", "/register", "/reset-password", "/forgot-password", "/search"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
