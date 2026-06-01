"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Folder,
  Inbox,
  Loader2,
  MessageCircle,
  PoundSterling,
  RefreshCw,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateActionPlan } from "@/lib/action-plan";
import { cn } from "@/lib/utils";
import type { IntakeFormData } from "@/types";

interface SavedPlan {
  id: string;
  intake_data: IntakeFormData;
  task_statuses: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_CATEGORIES = [
  { label: "Death Certificates", icon: FileText, desc: "Certified copies from the register office" },
  { label: "Will & Probate", icon: Shield, desc: "Will, Grant of Probate, Letters of Administration" },
  { label: "Financial Documents", icon: PoundSterling, desc: "Bank letters, pension documents, insurance" },
  { label: "Funeral Documents", icon: FileText, desc: "Funeral receipts, cremation certificate, burial deed" },
  { label: "Correspondence", icon: Inbox, desc: "Letters from HMRC, DWP, councils, solicitors" },
];

const SAVED_ARTICLES = [
  { title: "Registering a death", href: "/guidance/registering-a-death", category: "Legal" },
  { title: "Probate explained", href: "/guidance/probate-explained", category: "Legal" },
  { title: "Funeral support payments", href: "/guidance/funeral-support-payments", category: "Financial" },
  { title: "Council housing after death", href: "/guidance/council-housing-after-death", category: "Housing" },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "documents" | "guidance">("overview");

  useEffect(() => {
    if (!isLoaded) return;
    loadPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      // If there's a pending plan in localStorage (just came from intake), save it first
      const pending = localStorage.getItem("aftercare_intake");
      if (pending) {
        const intakeData = JSON.parse(pending);
        const res = await fetch("/api/save-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intakeData, taskStatuses: {} }),
        });
        if (res.ok) {
          localStorage.removeItem("aftercare_intake");
          const { planId } = await res.json();
          // Go straight to the new plan
          router.push(`/plan/${planId}`);
          return;
        }
        // DB not set up — clear anyway to avoid re-saving
        localStorage.removeItem("aftercare_intake");
      }

      // Load all plans for this user
      const res = await fetch("/api/plans");
      if (res.ok) {
        const { plans: fetched } = await res.json();
        setPlans(fetched ?? []);
      }
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "My Plans", icon: FileText },
    { id: "documents", label: "Documents", icon: Folder },
    { id: "guidance", label: "Guidance", icon: BookOpen },
  ] as const;

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-900">
                {user?.firstName ? `Hello, ${user.firstName}` : "My Dashboard"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {plans.length} saved plan{plans.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={loadPlans}
              className="p-2 rounded-lg text-slate-400 hover:bg-stone-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-slate-700 text-slate-800"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── My Plans ──────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {plans.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-1">No plans yet</p>
                  <p className="text-slate-400 text-sm mb-6">
                    Complete the intake form to generate your personalised bereavement plan.
                  </p>
                  <Link href="/intake">
                    <Button>Create a Plan <ArrowRight className="h-4 w-4" /></Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {plans.map((plan) => {
              const tasks = generateActionPlan(plan.intake_data);
              const completed = tasks.filter((t) => plan.task_statuses?.[t.id] === "completed").length;
              const urgent = tasks.filter(
                (t) => t.priority === "urgent" && plan.task_statuses?.[t.id] !== "completed"
              );
              const name = `${plan.intake_data.deceasedFirstName} ${plan.intake_data.deceasedLastName}`.trim();
              const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

              return (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{name || "Unnamed plan"}</CardTitle>
                        {plan.intake_data.dateOfDeath && (
                          <p className="text-sm text-slate-500 mt-1">
                            Passed{" "}
                            {new Date(plan.intake_data.dateOfDeath).toLocaleDateString("en-GB", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </p>
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
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-semibold text-slate-800">{pct}%</span>
                      </div>
                      <Progress value={completed} max={tasks.length} />
                      <div className="flex gap-5 mt-3">
                        {[
                          { label: "Total", value: tasks.length, color: "text-slate-800" },
                          { label: "Done", value: completed, color: "text-emerald-600" },
                          { label: "Urgent left", value: urgent.length, color: "text-red-500" },
                          { label: "Remaining", value: tasks.length - completed, color: "text-slate-600" },
                        ].map((s) => (
                          <div key={s.label} className="text-center">
                            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                            <p className="text-xs text-slate-400">{s.label}</p>
                          </div>
                        ))}
                      </div>
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
                        {urgent.length > 3 && (
                          <p className="text-xs text-red-400 ml-3.5">+{urgent.length - 3} more</p>
                        )}
                        <Link href={`/plan/${plan.id}`} className="mt-3 inline-flex items-center gap-1 text-sm text-red-700 font-medium">
                          Go to plan <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}

                    {urgent.length === 0 && completed === tasks.length && tasks.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm text-emerald-800 font-medium">All tasks completed</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-3">
                      Last updated {new Date(plan.updated_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {[
                { href: "/resources", icon: Clock, label: "Local Resources", desc: "Registry offices, funeral directors" },
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

        {/* ── Documents ─────────────────────────────────── */}
        {activeTab === "documents" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-1">Document library — coming soon</p>
              <p className="text-sm text-blue-600">
                Upload and store important documents here — death certificates, probate paperwork, insurance letters, and more.
              </p>
            </div>
            {DOCUMENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.label} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{cat.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.desc}</p>
                  </div>
                  <button disabled className="text-xs bg-stone-100 text-slate-400 px-3 py-1.5 rounded-lg cursor-not-allowed">
                    Coming soon
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Guidance ──────────────────────────────────── */}
        {activeTab === "guidance" && (
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              Key articles for your situation. Browse all topics in the{" "}
              <Link href="/guidance" className="text-slate-700 font-medium hover:underline">Guidance Hub</Link>.
            </p>
            {SAVED_ARTICLES.map((article) => (
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
            <Link href="/guidance">
              <Button variant="outline" className="w-full mt-4">
                Browse all articles <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
