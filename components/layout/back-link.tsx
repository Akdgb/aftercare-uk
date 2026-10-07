"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const PREV = "aftercare_prev_path";
const CUR = "aftercare_cur_path";
const EVENT = "aftercare-nav";

/** Called on every route change (from the header) to remember the previous page in this tab. */
export function recordNavigation(pathname: string) {
  try {
    const cur = sessionStorage.getItem(CUR);
    if (cur === pathname) return;
    if (cur) sessionStorage.setItem(PREV, cur);
    sessionStorage.setItem(CUR, pathname);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage blocked: back links fall back to their default destination
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function labelFor(path: string): string {
  if (path.startsWith("/plan")) return "Back to your plan";
  if (path === "/help") return "Back to Help";
  if (path === "/cost-estimator") return "Back to the cost estimate";
  if (path === "/dashboard") return "Back to your account";
  if (path === "/family") return "Back to Family";
  return "Back";
}

/**
 * Returns people to the page they came from (for example their plan),
 * or to `fallback` if they opened this page directly.
 */
export function BackLink({ fallback = "/help", fallbackLabel = "Help", className }: { fallback?: string; fallbackLabel?: string; className?: string }) {
  const router = useRouter();
  const prev = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(PREV);
      } catch {
        return null;
      }
    },
    () => null
  );
  const cls = cn("inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900", className);
  if (prev) {
    return (
      <button type="button" onClick={() => router.back()} className={cls}>
        <ArrowLeft className="h-4 w-4" /> {labelFor(prev)}
      </button>
    );
  }
  return (
    <Link href={fallback} className={cls}>
      <ArrowLeft className="h-4 w-4" /> {fallbackLabel}
    </Link>
  );
}
