"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

// Plain-English labels: people arriving here are often exhausted and grieving
const NAV = [
  { href: "/guidance", label: "Guidance" },
  { href: "/financial-support", label: "Money help" },
  { href: "/resources", label: "Find services" },
  { href: "/cost-estimator", label: "Funeral costs" },
  { href: "/assistant", label: "Ask a question" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEmail(d?.email ?? null))
      .catch(() => null);
  }, [pathname]);

  // Close the mobile menu after navigating
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setEmail(null);
    // Full reload on purpose: drops all in-memory data from the old session
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="print:hidden sticky top-0 z-50 bg-stone-50/85 backdrop-blur-md border-b border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-ink-100 text-ink-900 font-medium"
                    : "text-ink-600 hover:text-ink-900 hover:bg-stone-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {email ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-ink-700 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-ink-800 transition-colors"
                >
                  My plans
                </Link>
                <button
                  onClick={signOut}
                  title={`Signed in as ${email}`}
                  className="text-sm text-ink-600 hover:text-ink-900 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-ink-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
                <Link
                  href="/intake"
                  className="bg-ink-700 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-ink-800 transition-colors"
                >
                  Start your plan
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 -mr-2 rounded-lg text-ink-700 hover:bg-stone-100"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-6 h-[calc(100dvh-4rem)] overflow-y-auto animate-fade-up">
          <Link
            href={email ? "/dashboard" : "/intake"}
            className="block w-full text-center bg-ink-700 text-white font-medium py-3.5 rounded-xl mb-4"
          >
            {email ? "My plans" : "Start your plan"}
          </Link>
          <nav className="space-y-1" aria-label="Main">
            {[{ href: "/plan", label: "My plan on this device" }, { href: "/family", label: "Family" }, ...NAV].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-4 py-3.5 text-base rounded-xl",
                    isActive(item.href) ? "bg-ink-100 text-ink-900 font-medium" : "text-ink-700 hover:bg-stone-100"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
          <div className="mt-4 pt-4 border-t border-stone-200">
            {email ? (
              <button onClick={signOut} className="w-full text-left px-4 py-3.5 text-base text-ink-700 rounded-xl hover:bg-stone-100">
                Sign out <span className="text-ink-400 text-sm">({email})</span>
              </button>
            ) : (
              <Link href="/auth/signin" className="block px-4 py-3.5 text-base text-ink-700 rounded-xl hover:bg-stone-100">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
