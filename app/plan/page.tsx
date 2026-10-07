"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cloud, Loader2, Mail } from "lucide-react";
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
  const [linkSentTo] = useLocalStorage(LOCAL_KEYS.linkSentTo);
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

  if (!intake) return <NoLocalPlan />;

  return (
    <PlanView
      intake={intake}
      statuses={statuses}
      editHref="/edit-answers?plan=local"
      onToggle={(taskId, next) => setRawStatuses(JSON.stringify({ ...statuses, [taskId]: next }))}
      banner={
        linkSentTo ? (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-emerald-700 shrink-0" />
            <p className="flex-1 text-sm text-ink-700">
              <span className="font-medium text-ink-900">Check your email.</span> Open the link we sent to{" "}
              <span className="font-medium">{linkSentTo}</span> to save this plan and switch on reminders.
            </p>
            <button onClick={save} className="text-sm font-medium text-ink-700 underline underline-offset-4 shrink-0">
              Resend
            </button>
          </div>
        ) : (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3">
          <Cloud className="h-5 w-5 text-amber-700 shrink-0" />
          <p className="flex-1 text-sm text-ink-700">
            <span className="font-medium text-ink-900">Only saved on this device.</span> Save it to share with family
            and open it anywhere.
            {error && <span className="block text-rose-700 mt-1">{error}</span>}
          </p>
          <Button onClick={save} loading={saving} size="sm" className="shrink-0">
            Save &amp; share
          </Button>
        </div>
        )
      }
    />
  );
}

/** No plan on this device: open the newest saved plan if signed in, else offer to start. */
function NoLocalPlan() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const latest = d?.plans?.[0];
        if (latest) router.replace(`/plan/${latest.id}`);
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-20 text-center">
      <h1 className="text-3xl font-semibold text-ink-900">No plan yet</h1>
      <p className="text-ink-600 mt-3">Answer a few quick questions and we&apos;ll build your checklist.</p>
      <Link
        href="/intake"
        className="mt-8 w-full inline-flex items-center justify-center bg-ink-700 text-white text-lg font-medium py-4 rounded-2xl hover:bg-ink-800"
      >
        Start
      </Link>
      <Link href="/auth/signin" className="block mt-4 text-sm font-medium text-ink-700 underline underline-offset-4">
        I already have a saved plan
      </Link>
    </div>
  );
}
