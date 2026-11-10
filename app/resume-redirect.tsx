"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOCAL_KEYS } from "@/lib/use-local-storage";

const SESSION_KEY = "aftercare_resumed";

/**
 * When someone opens AfterCare and already has a plan, take them to it, but
 * only once per visit. After that the logo and home links show this start
 * screen, with a link back to the plan.
 */
export function ResumeRedirect() {
  const router = useRouter();
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    let firstOpen = true;
    try {
      firstOpen = !sessionStorage.getItem(SESSION_KEY);
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}

    let hasLocal = false;
    try {
      hasLocal = Boolean(localStorage.getItem(LOCAL_KEYS.intake));
    } catch {}

    const found = () => {
      if (firstOpen) router.replace("/plan");
      else setHasPlan(true);
    };
    if (hasLocal) return found();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d?.email && found())
      .catch(() => {});
  }, [router]);

  if (!hasPlan) return null;
  return (
    <div className="max-w-5xl w-full mx-auto px-5 pt-2">
      <Link
        href="/plan"
        className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-stone-300 px-4 py-2 text-sm font-medium text-ink-800 hover:bg-white"
      >
        Continue your plan
      </Link>
    </div>
  );
}
