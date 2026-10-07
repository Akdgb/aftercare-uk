"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { Card, CardContent } from "@/components/ui/card";
import { generateActionPlan } from "@/lib/action-plan";
import { LOCAL_KEYS, writeLocal } from "@/lib/use-local-storage";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";
import type { IntakeFormData } from "@/types";

interface PlanSummary {
  id: string;
  role: "owner" | "member";
  intake_data: IntakeFormData;
  task_statuses: Record<string, string>;
  created_at: string;
  updated_at: string;
}

async function fetchDashboard() {
  const [plansRes, accountRes] = await Promise.all([fetch("/api/plans"), fetch("/api/account")]);
  const plans: PlanSummary[] = plansRes.ok ? ((await plansRes.json()).plans ?? []) : [];
  const account = accountRes.ok ? await accountRes.json() : null;
  return { plans, account: account as { email: string; remindersEnabled: boolean } | null };
}

export default function DashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState<{ email: string; remindersEnabled: boolean } | null>(null);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Finish saving a plan the user asked to save before signing in
      try {
        if (localStorage.getItem(LOCAL_KEYS.pendingSave)) {
          const intakeData = JSON.parse(localStorage.getItem(LOCAL_KEYS.intake) ?? "null");
          const taskStatuses = JSON.parse(localStorage.getItem(LOCAL_KEYS.statuses) ?? "{}");
          writeLocal(LOCAL_KEYS.pendingSave, null);
          if (intakeData) {
            const res = await fetch("/api/save-plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ intakeData, taskStatuses }),
            });
            if (res.ok) {
              const { planId } = await res.json();
              writeLocal(LOCAL_KEYS.intake, null);
              writeLocal(LOCAL_KEYS.statuses, null);
              writeLocal(LOCAL_KEYS.linkSentTo, null);
              router.replace(`/plan/${planId}`);
              return;
            }
          }
        }
      } catch {
        // Fall through to showing the dashboard; the local plan is untouched
      }

      const data = await fetchDashboard().catch(() => null);
      if (cancelled) return;
      if (data) {
        setPlans(data.plans);
        setAccount(data.account);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-ink-400 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  const owned = plans.filter((p) => p.role === "owner");
  const shared = plans.filter((p) => p.role === "member");

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
      <h1 className="text-3xl font-semibold text-ink-900">Account</h1>
      {account && <p className="text-ink-500 mt-1">{account.email}</p>}

      <div className="flex items-center justify-between mt-8 mb-3">
        <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide">Your plans</h2>
        <Link href="/intake" className="text-sm font-medium text-ink-700 hover:text-ink-900">
          + New plan
        </Link>
      </div>
      {owned.length === 0 && shared.length === 0 ? (
        <Link
          href="/intake"
          className="block text-center bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-ink-600 hover:border-ink-300"
        >
          No plans yet. <span className="font-medium text-ink-900 underline underline-offset-4">Start one</span>
        </Link>
      ) : (
        <div className="space-y-3">
          {[...owned, ...shared].map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      {account && (
        <>
          <h2 className="font-sans text-sm font-semibold text-ink-500 uppercase tracking-wide mt-10 mb-3">Settings</h2>
          <AccountSettings account={account} onChange={setAccount} />
        </>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanSummary }) {
  const tasks = generateActionPlan(plan.intake_data);
  const completed = tasks.filter((t) => plan.task_statuses?.[t.id] === "completed").length;
  const name = `${plan.intake_data.deceasedFirstName} ${plan.intake_data.deceasedLastName}`.trim();
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Link
      href={`/plan/${plan.id}`}
      className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 hover:border-ink-300 active:scale-[0.99] transition-all"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-900 truncate">
          {name || "Unnamed plan"}
          {plan.role === "member" && <span className="ml-2 text-xs font-normal text-ink-500">Shared with you</span>}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-ink-500 tabular-nums">
            {completed}/{tasks.length} done
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-ink-300 shrink-0" />
    </Link>
  );
}

function AccountSettings({
  account,
  onChange,
}: {
  account: { email: string; remindersEnabled: boolean };
  onChange: (a: { email: string; remindersEnabled: boolean }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleReminders = async () => {
    const remindersEnabled = !account.remindersEnabled;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remindersEnabled }),
    }).catch(() => null);
    if (res?.ok) onChange({ ...account, remindersEnabled });
    else setError("Could not update your preference. Please try again.");
    setBusy(false);
  };

  const deleteAccount = async () => {
    const typed = prompt(
      "This permanently deletes your account, every plan you own (including for family members you invited), and removes you from shared plans.\n\nType DELETE to confirm."
    );
    if (typed !== "DELETE") return;
    setBusy(true);
    const res = await fetch("/api/account", { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      // Full reload on purpose: drops all in-memory data from the old session
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    } else {
      setError(`We could not delete your account. Please try again or email ${SITE.privacyEmail}.`);
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink-800">Reminder emails</p>
            <p className="text-xs text-ink-500 mt-1">
              At most one gentle email a week while urgent or this-week tasks are still open, for up to 90 days.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={account.remindersEnabled}
            onClick={toggleReminders}
            disabled={busy}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
              account.remindersEnabled ? "bg-ink-700" : "bg-stone-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                account.remindersEnabled && "translate-x-5"
              )}
            />
            <span className="sr-only">Reminder emails</span>
          </button>
        </CardContent>
      </Card>

      <ShareButton />

      <button
        onClick={async () => {
          await fetch("/api/auth/signout", { method: "POST" });
          // Full reload on purpose: drops all in-memory data from the old session
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = "/";
        }}
        className="w-full flex items-center justify-center gap-2 bg-white border border-stone-200 rounded-2xl p-4 text-ink-800 font-medium hover:border-ink-300"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-ink-800">Your data</p>
          <p className="text-xs text-ink-500 mt-1 mb-4">
            Plans are kept for 3 years and then deleted automatically. You can delete individual plans from inside each
            plan, or delete everything now. See our{" "}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
          <Button variant="outline" size="sm" onClick={deleteAccount} disabled={busy} className="text-rose-800 border-red-200 hover:bg-red-50">
            Delete my account and all data
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-rose-700">{error}</p>}
    </div>
  );
}
