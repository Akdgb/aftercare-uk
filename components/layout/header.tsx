"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, ListChecks, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

// Four tabs, app-style: everything is reachable in one tap from anywhere.
const TABS = [
  { href: "/plan", label: "Plan", icon: ListChecks, match: ["/plan", "/intake"] },
  {
    href: "/help",
    label: "Help",
    icon: CircleHelp,
    match: ["/help", "/guidance", "/financial-support", "/cost-estimator", "/resources", "/assistant"],
  },
  { href: "/family", label: "Family", icon: Users, match: ["/family"] },
  { href: "/dashboard", label: "Account", icon: UserRound, match: ["/dashboard", "/auth", "/privacy"] },
];

export function Header() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSignedIn(Boolean(d?.email)))
      .catch(() => null);
  }, [pathname]);

  // The landing screen is a single full-screen start page with no navigation
  if (pathname === "/") return null;

  const active = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(m + "/"));
  const tabs = TABS.map((t) => (t.label === "Account" && !signedIn ? { ...t, href: "/auth/signin" } : t));

  return (
    <>
      {/* Top bar */}
      <header className="print:hidden sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-100 rounded-xl" aria-label="Main">
            {tabs.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg transition-all",
                  active(t.match) ? "bg-white text-ink-900 font-medium shadow-sm" : "text-ink-600 hover:text-ink-900"
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar on phones */}
      <nav
        className="print:hidden md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-[env(safe-area-inset-bottom)]"
        aria-label="Main"
      >
        <div className="grid grid-cols-4">
          {tabs.map((t) => {
            const on = active(t.match);
            return (
              <Link
                key={t.label}
                href={t.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
                  on ? "text-ink-900" : "text-ink-400"
                )}
                aria-current={on ? "page" : undefined}
              >
                <span className={cn("px-4 py-1 rounded-full transition-colors", on && "bg-ink-100")}>
                  <t.icon className="h-5 w-5" />
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
