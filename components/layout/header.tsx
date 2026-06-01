"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "My Dashboard" },
  { href: "/resources", label: "Local Resources" },
  { href: "/guidance", label: "Guidance" },
  { href: "/financial-support", label: "Financial Support" },
  { href: "/assistant", label: "AI Assistant" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-slate-800 font-semibold text-lg tracking-tight">AfterCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-stone-100 text-slate-800 font-medium"
                    : "text-slate-500 hover:text-slate-800 hover:bg-stone-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <UserButton
                                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-slate-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <Link
                  href="/intake"
                  className="bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Start Your Plan
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md text-slate-500 hover:bg-stone-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2.5 text-sm rounded-md transition-colors",
                pathname === item.href
                  ? "bg-stone-100 text-slate-800 font-medium"
                  : "text-slate-600 hover:bg-stone-50"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm text-slate-600 font-medium">Sign in</button>
                </SignInButton>
                <Link
                  href="/intake"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg text-center"
                >
                  Start Your Plan
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
