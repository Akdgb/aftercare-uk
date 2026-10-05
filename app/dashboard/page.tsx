"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Folder,
  Loader2,
  MessageCircle,
  PoundSterling,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateActionPlan } from "@/lib/action-plan";
import { LOCAL_KEYS, writeLocal } from "@/lib/use-local-storage";
import { cn, formatDate } from "@/lib/utils";
import type { IntakeFormData } from "@/types";

interface PlanSummary {
  id: string;
  role: "owner" | "member";
  intake_data: IntakeFormData;
  task_statuses: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const DOCUMENTS = [
  {
    label: "Medical Certificate of Cause of Death (MCCD)",
    from: "The doctor or medical examiner — usually sent straight to the register office",
    needed: "To register the death",
  },
  {
    label: "Certified copies of the death certificate",
    from: "The register office when you register (cheaper at the time than later)",
    needed: "Banks, pensions, insurers, utilities, probate",
  },
  {
    label: "Green form (Certificate for Burial or Cremation)",
    from: "The registrar, after registering",
    needed: "Give to the funeral director",
  },
  {
    label: "Tell Us Once reference number",
    from: "The registrar",
    needed: "To notify government departments in one go",
  },
  {
    label: "The will (if there is one)",
    from: "Home, a solicitor, a bank, or the Probate Service's will storage",
    needed: "To find the executor and apply for probate",
  },
  {
    label: "Birth and marriage / civil partnership certificates",
    from: "The deceased's papers, or order copies from GRO",
    needed: "Registration, pensions and bereavement benefits",
  },
  {
    label: "Bank, pension, insurance and property paperwork",
    from: "Statements and letters in the deceased's papers",
    needed: "Valuing the estate and contacting each organisation",
  },
  {
    label: "Funeral invoice and receipts",
    from: "The funeral director",
    needed: "Funeral Expenses Payment claims and reclaiming costs from the estate",
  },
];

const ARTICLES = [
  { title: "Registering a death", href: "/guidance/registering-a-death", category: "Legal" },
  { title: "Probate explained", href: "/guidance/probate-explained", category: "Legal" },
  { title: "Funeral support payments", href: "/guidance/funeral-support-payments", category: "Financial" },
  { title: "Council housing after death", href: "/guidance/council-housing-after-death", category: "Housing" },
];

const TABS = [
  { id: "overview", label: "My Plans", icon: FileText },
  { id: "documents", label: "Documents", icon: Folder },
  { id: "guidance", label: "Guidance", icon: BookOpen },
  { id: "account", label: "Account", icon: Settings },
] as const;

type Tab = (typeof TABS)[number]["id"];

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
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const data = await fetchDashboard().catch(() => null);
    if (data) {
      setPlans(data.plans);
      setAccount(data.account);
    }
    setRefreshing(false);
  }, []);

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
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const owned = plans.filter((p) => p.role === "owner");
  const shared = plans.filter((p) => p.role === "member");

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
              {account && <p className="text-sm text-slate-500 mt-1">Signed in as {account.email}</p>}
            </div>
            <button
              onClick={refresh}
              className="p-2 rounded-lg text-slate-400 hover:bg-stone-100 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </button>
          </div>

          <div className="flex gap-1 mt-6 -mb-px overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    tab === t.id
                      ? "border-slate-700 text-slate-800"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === "overview" && (
          <div className="space-y-6">
            {owned.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-1">No plans yet</p>
                  <p className="text-slate-400 text-sm mb-6">
                    Answer a few questions to generate your personalised bereavement plan.
                  </p>
                  <Link href="/intake">
                    <Button>
                      Create a Plan <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {owned.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}

            {shared.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 pt-2">
                  <Users className="h-4 w-4" /> Shared with you
                </h2>
                {shared.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </>
            )}

            {owned.length > 0 && (
              <Link href="/intake" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800">
                + Create another plan
              </Link>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {[
                { href: "/resources", icon: Building2, label: "Local Resources", desc: "Register offices, funeral directors" },
                { href: "/financial-support", icon: PoundSterling, label: "Financial Support", desc: "Check your eligibility" },
                { href: "/assistant", icon: MessageCircle, label: "AI Assistant", desc: "Ask any question" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className="h-full hover:shadow-md hover:border-slate-300 transition-all">
                      <CardContent className="p-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                          <Icon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-sm font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {tab === "documents" && (
          <div className="max-w-3xl space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              The paperwork you&apos;re most likely to need, where it comes from, and what it&apos;s for. Keep originals
              together in one folder — most organisations will ask for a certified copy of the death certificate.
            </p>
            {DOCUMENTS.map((doc) => (
              <div key={doc.label} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{doc.label}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-600">Where from:</span> {doc.from}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-600">Needed for:</span> {doc.needed}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "guidance" && (
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              Key articles for your situation. Browse all topics in the{" "}
              <Link href="/guidance" className="text-slate-700 font-medium hover:underline">
                Guidance Hub
              </Link>
              .
            </p>
            {ARTICLES.map((article) => (
              <Link key={article.href} href={article.href} className="group block">
                <div className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-4">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                    <BookOpen className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{article.title}</p>
                    <span className="text-xs text-slate-400">{article.category}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "account" && account && <AccountSettings account={account} onChange={setAccount} />}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanSummary }) {
  const tasks = generateActionPlan(plan.intake_data);
  const completed = tasks.filter((t) => plan.task_statuses?.[t.id] === "completed").length;
  const urgent = tasks.filter((t) => t.priority === "urgent" && plan.task_statuses?.[t.id] !== "completed");
  const name = `${plan.intake_data.deceasedFirstName} ${plan.intake_data.deceasedLastName}`.trim();
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{name || "Unnamed plan"}</CardTitle>
            {plan.intake_data.dateOfDeath && (
              <p className="text-sm text-slate-500 mt-1">Passed {formatDate(plan.intake_data.dateOfDeath)}</p>
            )}
          </div>
          <Link href={`/plan/${plan.id}`}>
            <Button size="sm">
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-600">Progress</span>
          <span className="font-semibold text-slate-800">{pct}%</span>
        </div>
        <Progress value={completed} max={tasks.length} />
        <div className="flex gap-5 mt-3 mb-4">
          {[
            { label: "Total", value: tasks.length, color: "text-slate-800" },
            { label: "Done", value: completed, color: "text-emerald-600" },
            { label: "Urgent left", value: urgent.length, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {urgent.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                {urgent.length} urgent task{urgent.length > 1 ? "s" : ""} outstanding
              </p>
            </div>
            {urgent.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-start gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{t.title}</p>
              </div>
            ))}
            {urgent.length > 3 && <p className="text-xs text-red-400 ml-3.5">+{urgent.length - 3} more</p>}
          </div>
        )}

        {completed === tasks.length && tasks.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-800 font-medium">All tasks completed</p>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3">Last updated {formatDate(plan.updated_at)}</p>
      </CardContent>
    </Card>
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
    else setError("Couldn't update your preference. Please try again.");
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
      setError("Couldn't delete your account. Please try again or email privacy@aftercare-uk.co.uk.");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Reminder emails</p>
            <p className="text-xs text-slate-500 mt-1">
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
              account.remindersEnabled ? "bg-slate-700" : "bg-stone-300"
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

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-slate-800">Your data</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Plans are kept for 3 years and then deleted automatically. You can delete individual plans from inside each
            plan, or delete everything now. See our{" "}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
          <Button variant="outline" size="sm" onClick={deleteAccount} disabled={busy} className="text-red-700 border-red-200 hover:bg-red-50">
            Delete my account and all data
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
