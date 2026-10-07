"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanView } from "@/components/plan/plan-view";
import { LOCAL_KEYS, useLocalStorage, writeLocal } from "@/lib/use-local-storage";
import type { IntakeFormData } from "@/types";

function parse<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** The unsaved plan, kept only in this browser until the user signs in to save it. */
export default function LocalPlanPage() {
  const router = useRouter();
  const [rawIntake] = useLocalStorage(LOCAL_KEYS.intake);
  const [rawStatuses, setRawStatuses] = useLocalStorage(LOCAL_KEYS.statuses);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intake = useMemo(() => parse<IntakeFormData>(rawIntake), [rawIntake]);
  const statuses = useMemo(() => parse<Record<string, string>>(rawStatuses) ?? {}, [rawStatuses]);

  const save = async () => {
    if (!intake) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeData: intake, taskStatuses: statuses }),
      });
      if (res.status === 401) {
        // Dashboard finishes the save once they're signed in
        writeLocal(LOCAL_KEYS.pendingSave, "1");
        const params = new URLSearchParams({ next: "/dashboard" });
        if (intake.email) params.set("email", intake.email);
        router.push(`/auth/signin?${params}`);
        return;
      }
      if (!res.ok) throw new Error();
      const { planId } = await res.json();
      writeLocal(LOCAL_KEYS.intake, null);
      writeLocal(LOCAL_KEYS.statuses, null);
      router.push(`/plan/${planId}`);
    } catch {
      setError("We couldn't save your plan just now. Your progress is still kept in this browser.");
      setSaving(false);
    }
  };

  if (rawIntake === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" />
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-500 mb-6">
          No plan found on this device. Answer a few questions to create your personalised plan, or sign in to see
          a plan you&apos;ve already saved.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/intake">
            <Button>Create my plan</Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline">Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PlanView
      intake={intake}
      statuses={statuses}
      onToggle={(taskId, next) => setRawStatuses(JSON.stringify({ ...statuses, [taskId]: next }))}
      banner={
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-[0_1px_2px_rgba(24,42,38,0.04)]">
          <span className="hidden sm:flex w-11 h-11 rounded-xl bg-amber-50 items-center justify-center flex-shrink-0">
            <Cloud className="h-5 w-5 text-amber-700" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-900">This plan is only saved in this browser</p>
            <p className="text-sm text-ink-600 mt-0.5">
              Save it to your account to open it on any device, get gentle reminders, and invite family to share the
              tasks.
            </p>
            {error && <p className="text-sm text-red-700 mt-1">{error}</p>}
          </div>
          <Button onClick={save} loading={saving} className="flex-shrink-0">
            Save &amp; share
          </Button>
        </div>
      }
    />
  );
}
