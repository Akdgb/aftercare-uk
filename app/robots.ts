import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Personal and signed-in pages are never indexed
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/plan", "/dashboard", "/edit-answers", "/auth/", "/unsubscribe"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
