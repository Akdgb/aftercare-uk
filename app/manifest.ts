import type { MetadataRoute } from "next";

// Lets people add AfterCare to their home screen and open it like an app
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AfterCare UK",
    short_name: "AfterCare",
    description: "A free, step-by-step plan for UK families after someone dies.",
    id: "/",
    start_url: "/plan",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f6f1",
    theme_color: "#f8f6f1",
    lang: "en-GB",
    categories: ["lifestyle", "health", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My plan", url: "/plan" },
      { name: "How are you today?", url: "/wellbeing" },
      { name: "Help", url: "/help" },
    ],
  };
}
