"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Folder,
  Inbox,
  Loader2,
  LogIn,
  MessageCircle,
  PoundSterling,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { generateActionPlan } from "@/lib/action-plan";
import { cn } from "@/lib/utils";
import type { IntakeFormData, ActionPlanTask } from "@/types";

interface SavedPlanSummary {
  id: string;
  intake_data: IntakeFormData;
  task_statuses: Record<string, string>;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  type: "urgent" | "reminder" | "info";
  title: string;
  body: string;
  planId?: string;
  read: boolean;
  time: string;
}

function buildNotifications(plans: SavedPlanSummary[]): Notification[] {
  const notes: Notification[] = [];
  plans.forEach((plan) => {
    const tasks = generateActionPlan(plan.intake_data);
    const urgentPending = tasks.filter(
      (t) => t.priority === "urgent" && plan.task_statuses?.[t.id] !== "completed"
    );
    const name = `${plan.intake_data.deceasedFirstName} ${plan.intake_data.deceasedLastName}`.trim();
    const daysSince = Math.floor(
      (Date.now() - new Date(plan.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (urgentPending.length > 0) {
      notes.push({
        id: `urgent-${plan.id}`,
        type: "urgent",
        title: `${urgentPending.length} urgent task${urgentPending.length > 1 ? "s" : ""} still outstanding`,
        body: `For ${name}: ${urgentPending[0].title}${urgentPending.length > 1 ? ` and ${urgentPending.length - 1} more` : ""}`,
        planId: plan.id,
        read: false,
        time: "Now",
      });
    }

    if (daysSince >= 5) {
      const completedCount = tasks.filter((t) => plan.task_statuses?.[t.id] === "completed").length;
      const pct = Math.round((completedCount / tasks.length) * 100);
      notes.push({
        id: `progress-${plan.id}`,
        type: "info",
        title: `${pct}% of tasks complete`,
        body: `${name} — ${completedCount} of ${tasks.length} tasks done`,
        planId: plan.id,
        read: false,
        time: `${daysSince} days ago`,
      });
    }
  });
  return notes;
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [plans, setPlans] = useState<SavedPlanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [looked, setLooked] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "notifications" | "documents" | "guidance">("overview");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // On mount, check localStorage for a previously looked-up email
  useEffect(() => {
    const saved = localStorage.getItem("aftercare_dashboard_email");
    if (saved) {
      setEmail(saved);
      setInputEmail(saved);
      loadPlans(saved);
    }
  }, []);

  const loadPlans = async (emailToLoad: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/plans-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToLoad }),
      });
      const { plans: fetched } = await res.json();
      setPlans(fetched ?? []);
      setNotifications(buildNotifications(fetched ?? []));
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
      setLooked(true);
    }
  };

  const handleLookup = () => {
    if (!inputEmail.trim() || !inputEmail.includes("@")) return;
    const e = inputEmail.trim().toLowerCase();
    setEmail(e);
    localStorage.setItem("aftercare_dashboard_email", e);
    loadPlans(e);
  };

  const markRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const TABS = [
    { id: "overview", label: "Overview", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell, count: unreadCount },
    { id: "documents", label: "Documents", icon: Folder },
    { id: "guidance", label: "Saved Guidance", icon: BookOpen },
  ] as const;

  const DOCUMENT_CATEGORIES = [
    { label: "Death Certificates", icon: FileText, desc: "Certified copies from the register office", status: "Upload" },
    { label: "Will & Probate", icon: Shield, desc: "Will, Grant of Probate, Letters of Administration", status: "Upload" },
    { label: "Financial Documents", icon: PoundSterling, desc: "Bank letters, pension documents, insurance", status: "Upload" },
    { label: "Funeral Documents", icon: FileText, desc: "Funeral receipts, cremation certificate, burial deed", status: "Upload" },
    { label: "Correspondence", icon: Inbox, desc: "Letters from HMRC, DWP, councils, solicitors", status: "Upload" },
  ];

  const SAVED_ARTICLES = [
    { title: "Registering a death", href: "/guidance/registering-a-death", category: "Legal" },
    { title: "Probate explained", href: "/guidance/probate-explained", category: "Legal" },
    { title: "Funeral Expenses Payment", href: "/guidance/funeral-support-payments", category: "Financial" },
    { title: "Council housing after death", href: "/guidance/council-housing-after-death", category: "Housing" },
  ];

  if (!email && !looked) {
    return (
      <div className="bg-stone-50 min-h-screen">
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Dashboard</h1>
            <p className="text-slate-500">Access your saved plans, track progress, and manage documents.</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="h-7 w-7 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Enter your email to continue</h2>
          <p className="text-slate-500 text-sm mb-8">
            We&apos;ll find any plans you&apos;ve saved and show your progress. No password needed.
          </p>

          <div className="space-y-3">
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Button className="w-full" onClick={handleLookup} loading={loading}>
              Find My Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-slate-400 mt-5">
            Don&apos;t have a plan yet?{" "}
            <Link href="/intake" className="text-slate-600 font-medium hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">My Dashboard</p>
              <h1 className="text-2xl font-bold text-slate-900">{email}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {plans.length} saved plan{plans.length !== 1 ? "s" : ""}
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {unreadCount} notification{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadPlans(email)}
                className="p-2 rounded-lg text-slate-400 hover:bg-stone-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("aftercare_dashboard_email");
                  setEmail("");
                  setInputEmail("");
                  setLooked(false);
                  setPlans([]);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Switch account
              </button>
            </div>
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
                  {"count" in tab && tab.count > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Overview tab ────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loading && (
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading your plans...</span>
              </div>
            )}

            {!loading && plans.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-1">No saved plans found</p>
                  <p className="text-slate-400 text-sm mb-6">
                    Plans saved under {email} will appear here.
                  </p>
                  <Link href="/intake">
                    <Button>Create a Plan</Button>
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
              const pct = Math.round((completed / tasks.length) * 100);

              return (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{name || "Unnamed plan"}</CardTitle>
                        {plan.intake_data.dateOfDeath && (
                          <p className="text-sm text-slate-500 mt-1">
                            Passed{" "}
                            {new Date(plan.intake_data.dateOfDeath).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <Link href={`/plan/${plan.id}`}>
                        <Button size="sm">
                          Open Plan
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress */}
                    <div className="mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Overall progress</span>
                        <span className="font-semibold text-slate-800">{pct}%</span>
                      </div>
                      <Progress value={completed} max={tasks.length} />
                      <div className="flex gap-4 mt-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-800">{tasks.length}</p>
                          <p className="text-xs text-slate-500">Total tasks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600">{completed}</p>
                          <p className="text-xs text-slate-500">Done</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-red-500">{urgent.length}</p>
                          <p className="text-xs text-slate-500">Urgent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-slate-600">{tasks.length - completed}</p>
                          <p className="text-xs text-slate-500">Remaining</p>
                        </div>
                      </div>
                    </div>

                    {/* Urgent tasks */}
                    {urgent.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <p className="text-sm font-semibold text-red-800">
                            {urgent.length} urgent task{urgent.length > 1 ? "s" : ""} still outstanding
                          </p>
                        </div>
                        <div className="space-y-2">
                          {urgent.slice(0, 3).map((t) => (
                            <div key={t.id} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                              <p className="text-sm text-red-700">{t.title}</p>
                            </div>
                          ))}
                          {urgent.length > 3 && (
                            <p className="text-xs text-red-500 ml-3.5">
                              +{urgent.length - 3} more urgent tasks
                            </p>
                          )}
                        </div>
                        <Link href={`/plan/${plan.id}`} className="mt-3 inline-flex items-center gap-1 text-sm text-red-700 font-medium hover:text-red-900">
                          Go to plan <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}

                    {urgent.length === 0 && completed === tasks.length && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm text-emerald-800 font-medium">All tasks completed</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-4">
                      Last updated{" "}
                      {new Date(plan.updated_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Quick access cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[
                { href: "/resources", icon: Clock, label: "Local Resources", desc: "Registry offices, funeral directors nearby" },
                { href: "/financial-support", icon: PoundSterling, label: "Financial Support", desc: "Check your eligibility" },
                { href: "/assistant", icon: MessageCircle, label: "AI Assistant", desc: "Ask any bereavement question" },
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

        {/* ── Notifications tab ───────────────────────────────── */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl space-y-3">
            {notifications.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No notifications right now.</p>
                </CardContent>
              </Card>
            )}

            {notifications.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-4 p-4 rounded-xl border transition-all",
                    n.type === "urgent" && !isRead
                      ? "bg-red-50 border-red-200"
                      : n.type === "reminder" && !isRead
                      ? "bg-amber-50 border-amber-200"
                      : "bg-white border-stone-200",
                    isRead && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      n.type === "urgent" ? "bg-red-100" : n.type === "reminder" ? "bg-amber-100" : "bg-slate-100"
                    )}
                  >
                    {n.type === "urgent" ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : n.type === "reminder" ? (
                      <Clock className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Bell className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium", n.type === "urgent" ? "text-red-800" : "text-slate-800")}>
                        {n.title}
                      </p>
                      {!isRead && (
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">{n.time}</span>
                      {n.planId && (
                        <Link
                          href={`/plan/${n.planId}`}
                          onClick={() => markRead(n.id)}
                          className="text-xs text-slate-600 font-medium hover:text-slate-800 flex items-center gap-0.5"
                        >
                          View plan <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                      {!isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Documents tab ───────────────────────────────────── */}
        {activeTab === "documents" && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-1">Document library — coming soon</p>
              <p className="text-sm text-blue-600">
                Soon you will be able to upload and store important documents here — death certificates, probate paperwork, insurance letters, and more.
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
                  <button
                    disabled
                    className="text-xs bg-stone-100 text-slate-400 px-3 py-1.5 rounded-lg cursor-not-allowed"
                  >
                    {cat.status}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Guidance tab ────────────────────────────────────── */}
        {activeTab === "guidance" && (
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              Articles saved to your library. Visit the{" "}
              <Link href="/guidance" className="text-slate-700 font-medium hover:underline">
                Guidance Hub
              </Link>{" "}
              to browse all topics.
            </p>

            {SAVED_ARTICLES.map((article) => (
              <Link key={article.href} href={article.href} className="group block">
                <div className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-4">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                    <BookOpen className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{article.title}</p>
                    <Badge variant="default" className="mt-1">{article.category}</Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              </Link>
            ))}

            <Link href="/guidance" className="block mt-4">
              <Button variant="outline" className="w-full">
                Browse all guidance articles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
