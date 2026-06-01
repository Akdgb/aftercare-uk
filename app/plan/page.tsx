"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Home,
  PoundSterling,
  Scale,
  Share2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { generateActionPlan } from "@/lib/action-plan";
import { cn } from "@/lib/utils";
import type { ActionPlanTask, IntakeFormData } from "@/types";

const CATEGORY_META: Record<
  ActionPlanTask["category"],
  { label: string; icon: React.ElementType; color: string }
> = {
  immediate: { label: "Immediate Actions", icon: AlertCircle, color: "text-red-500" },
  legal: { label: "Legal", icon: Scale, color: "text-purple-500" },
  financial: { label: "Financial", icon: PoundSterling, color: "text-emerald-600" },
  government: { label: "Government", icon: Building2, color: "text-blue-500" },
  housing: { label: "Housing", icon: Home, color: "text-amber-500" },
  personal: { label: "Personal", icon: User, color: "text-slate-500" },
};

const PRIORITY_META: Record<
  ActionPlanTask["priority"],
  { label: string; variant: "urgent" | "week" | "month" | "future"; icon: React.ElementType }
> = {
  urgent: { label: "Urgent", variant: "urgent", icon: AlertCircle },
  "this-week": { label: "This Week", variant: "week", icon: Clock },
  "this-month": { label: "This Month", variant: "month", icon: Calendar },
  future: { label: "Future", variant: "future", icon: Circle },
};

const DEFAULT_DATA: IntakeFormData = {
  deceasedFirstName: "Your loved one",
  deceasedLastName: "",
  dateOfDeath: "",
  locationOfDeath: "",
  currentLocation: "hospital",
  relationship: "Son / Daughter",
  postcode: "",
  email: "",
  phone: "",
  funeralPreference: "unsure",
  faith: "none",
  housingType: "owned",
  receivingBenefits: "unsure",
  needsFinancialHelp: "unsure",
};

export default function PlanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ActionPlanTask[]>([]);
  const [intakeData, setIntakeData] = useState<IntakeFormData>(DEFAULT_DATA);
  const [filter, setFilter] = useState<ActionPlanTask["priority"] | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ActionPlanTask["category"] | "all">("all");

  useEffect(() => {
    const stored = localStorage.getItem("aftercare_intake");
    const data: IntakeFormData = stored ? JSON.parse(stored) : DEFAULT_DATA;
    setIntakeData(data);
    const plan = generateActionPlan(data);
    // restore any saved statuses
    const savedStatuses = localStorage.getItem("aftercare_task_statuses");
    if (savedStatuses) {
      const statuses: Record<string, ActionPlanTask["status"]> = JSON.parse(savedStatuses);
      plan.forEach((t) => {
        if (statuses[t.id]) t.status = statuses[t.id];
      });
    }
    setTasks(plan);
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "completed" ? ("pending" as const) : ("completed" as const) }
          : t
      );
      const statuses: Record<string, ActionPlanTask["status"]> = {};
      updated.forEach((t) => (statuses[t.id] = t.status));
      localStorage.setItem("aftercare_task_statuses", JSON.stringify(statuses));
      return updated;
    });
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;

  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (filter === "all" || t.priority === filter) &&
          (categoryFilter === "all" || t.category === categoryFilter)
      ),
    [tasks, filter, categoryFilter]
  );

  const grouped = useMemo(() => {
    const g: Record<string, ActionPlanTask[]> = {};
    filtered.forEach((t) => {
      if (!g[t.priority]) g[t.priority] = [];
      g[t.priority].push(t);
    });
    return g;
  }, [filtered]);

  const priorityOrder: ActionPlanTask["priority"][] = ["urgent", "this-week", "this-month", "future"];

  if (tasks.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-6">No plan found. Please complete the intake form first.</p>
        <Link href="/intake">
          <Button>Start the Intake Form</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Personal Bereavement Plan</p>
              <h1 className="text-2xl font-bold text-slate-900">
                {intakeData.deceasedFirstName} {intakeData.deceasedLastName}
              </h1>
              {intakeData.dateOfDeath && (
                <p className="text-sm text-slate-500 mt-1">
                  Passed away on{" "}
                  {new Date(intakeData.dateOfDeath).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Progress summary */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total tasks</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-2xl font-bold text-red-600">
                {tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Urgent remaining</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Completed</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <Progress value={completedCount} max={totalCount} showLabel />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-stone-200 p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter tasks</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">By timeframe</p>
                {(["all", "urgent", "this-week", "this-month", "future"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      filter === p
                        ? "bg-slate-100 text-slate-800 font-medium"
                        : "text-slate-500 hover:bg-stone-50"
                    )}
                  >
                    {p === "all" ? "All tasks" : PRIORITY_META[p]?.label}
                    <span className="float-right text-xs text-slate-400">
                      {p === "all"
                        ? tasks.length
                        : tasks.filter((t) => t.priority === p).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-1 mt-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">By category</p>
                {(["all", "immediate", "legal", "financial", "government", "housing", "personal"] as const).map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setCategoryFilter(c)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        categoryFilter === c
                          ? "bg-slate-100 text-slate-800 font-medium"
                          : "text-slate-500 hover:bg-stone-50"
                      )}
                    >
                      {c === "all" ? "All categories" : CATEGORY_META[c]?.label}
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>

          {/* Task list */}
          <div className="flex-1 space-y-8">
            {priorityOrder.map((priority) => {
              const pTasks = grouped[priority];
              if (!pTasks?.length) return null;
              const meta = PRIORITY_META[priority];
              const PIcon = meta.icon;

              return (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-4">
                    <PIcon className="h-4 w-4 text-slate-500" />
                    <h2 className="text-base font-semibold text-slate-800">{meta.label}</h2>
                    <Badge variant={meta.variant}>{pTasks.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {pTasks.map((task) => {
                      const catMeta = CATEGORY_META[task.category];
                      const CatIcon = catMeta.icon;
                      const done = task.status === "completed";

                      return (
                        <Card
                          key={task.id}
                          className={cn(
                            "transition-all",
                            done && "opacity-60"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="flex-shrink-0 mt-0.5"
                                aria-label={done ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {done ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-stone-300 hover:text-slate-400 transition-colors" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <p
                                    className={cn(
                                      "text-sm font-medium text-slate-800",
                                      done && "line-through text-slate-400"
                                    )}
                                  >
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <CatIcon className={cn("h-3.5 w-3.5", catMeta.color)} />
                                    <span className="text-xs text-slate-500">{catMeta.label}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">{task.description}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                  {task.link && (
                                    <a
                                      href={task.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      View guidance
                                    </a>
                                  )}
                                  {task.phone && (
                                    <a
                                      href={`tel:${task.phone}`}
                                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                                    >
                                      {task.phone}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No tasks match the current filter.</p>
              </div>
            )}
          </div>

          {/* Quick links sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-stone-200 p-4 sticky top-24 space-y-4">
              <p className="text-sm font-medium text-slate-700">Quick actions</p>
              <div className="space-y-2">
                {[
                  { href: "/resources", label: "Find local services", icon: Building2 },
                  { href: "/financial-support", label: "Check financial support", icon: PoundSterling },
                  { href: "/assistant", label: "Ask the AI assistant", icon: ArrowRight },
                  { href: "/family", label: "Share with family", icon: Share2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Icon className="h-4 w-4 text-slate-400" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-600">
                  Your progress is saved automatically. You can return to this page at any time.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
