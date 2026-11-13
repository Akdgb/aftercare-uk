import type { MetadataRoute } from "next";
import { articles } from "@/lib/guidance-content";
import { SITE } from "@/lib/site";

// Public pages Google can list, so people searching at the moment of need find them
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/intake",
    "/help",
    "/wellbeing",
    "/help/save-money",
    "/help/support",
    "/help/streaming",
    "/help/memorials",
    "/help/documents",
    "/financial-support",
    "/cost-estimator",
    "/partners",
    "/about",
    "/privacy",
    "/terms",
    "/cookies",
    "/accessibility",
  ];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...Object.values(articles).map((a) => ({ url: `${SITE.url}/guidance/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
