import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "AfterCare UK – Bereavement Guidance & Support",
  description:
    "AfterCare helps families navigate everything that needs to happen after a loved one passes away. Get a personalised action plan, local resources, and expert guidance.",
  keywords: ["bereavement", "death", "funeral guidance", "probate", "grief support", "UK"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-stone-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
