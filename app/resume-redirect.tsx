"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LOCAL_KEYS } from "@/lib/use-local-storage";

/** Sends returning users straight to their plan instead of the start screen. */
export function ResumeRedirect() {
  const router = useRouter();
  useEffect(() => {
    let hasLocal = false;
    try {
      hasLocal = Boolean(localStorage.getItem(LOCAL_KEYS.intake));
    } catch {}
    if (hasLocal) {
      router.replace("/plan");
      return;
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d?.email && router.replace("/plan"))
      .catch(() => {});
  }, [router]);
  return null;
}
