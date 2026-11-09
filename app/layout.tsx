import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/site";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// One plain typeface, made for government digital services: clear, calm and
// easy to read for anyone tired or stressed
const publicSans = Public_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-public-sans", display: "swap" });

const DESCRIPTION =
  "A free, step-by-step plan for families in the UK after someone dies. Register the death, plan an affordable funeral, claim financial support, share tasks with family and look after yourself.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "AfterCare UK: what to do after someone dies", template: "%s | AfterCare UK" },
  description: DESCRIPTION,
  applicationName: "AfterCare",
  // When the link is shared on WhatsApp, Messages or social media
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "AfterCare UK",
    title: "AfterCare UK: what to do after someone dies",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  // Installed on an iPhone home screen, it opens full screen like an app
  appleWebApp: { capable: true, title: "AfterCare", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f7f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={publicSans.variable}>
      <body className="min-h-screen flex flex-col bg-stone-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
