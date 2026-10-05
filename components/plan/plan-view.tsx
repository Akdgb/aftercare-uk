"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Filter,
  Home,
  Phone,
  PoundSterling,
  Printer,
  Scale,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { generateActionPlan } from "@/lib/action-plan";
import { cn, formatDate } from "@/lib/utils";
import type { ActionPlanTask, IntakeFormData } from "@/types";

export type TaskStatus = ActionPlanTask["status"];

const CATEGORY_META: Record<ActionPlanTask["category"], { label: string; icon: React.ElementType; color: string }> = {
  immediate: { label: "Immediate", icon: AlertCircle, color: "text-red-500" },
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
  future: { label: "Later", variant: "future", icon: Circle },
};

const PRIORITY_ORDER: ActionPlanTask["priority"][] = ["urgent", "this-week", "this-month", "future"];
const CATEGORIES = Object.keys(CATEGORY_META) as ActionPlanTask["category"][];

interface PlanViewProps {
  intake: IntakeFormData;
  statuses: Record<string, string>;
  onToggle: (taskId: string, next: TaskStatus) => void;
  /** Rendered next to the Print button (e.g. save status, share). */
  headerActions?: React.ReactNode;
  /** Rendered above the task list (e.g. "save your plan" prompt). */
  banner?: React.ReactNode;
  /** Extra panels in the right-hand sidebar (e.g. family members). */
  sidebar?: React.ReactNode;
  /** Extra per-task controls (e.g. assignee and notes). */
  renderTaskExtras?: (task: ActionPlanTask) => React.ReactNode;
  /** Optional extra filter, e.g. "assigned to me". */
  extraFilter?: { label: string; test: (task: ActionPlanTask) => boolean };
}

export function PlanView({
  intake,
  statuses,
  onToggle,
  headerActions,
  banner,
  sidebar,
  renderTaskExtras,
  extraFilter,
}: PlanViewProps) {
  const [priority, setPriority] = useState<ActionPlanTask["priority"] | "all">("all");
  const [category, setCategory] = useState<ActionPlanTask["category"] | "all">("all");
  const [onlyExtra, setOnlyExtra] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  const tasks = useMemo(
    () =>
      generateActionPlan(intake).map((t) => ({
        ...t,
        status: (statuses[t.id] as TaskStatus) ?? "pending",
      })),
    [intake, statuses]
  );

  const completed = tasks.filter((t) => t.status === "completed").length;
  const urgentLeft = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  const filtered = tasks.filter(
    (t) =>
      (priority === "all" || t.priority === priority) &&
      (category === "all" || t.category === category) &&
      (!onlyExtra || !extraFilter || extraFilter.test(t)) &&
      (!hideDone || t.status !== "completed")
  );

  const name = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim();

  return (
    <div className="bg-stone-50 min-h-screen print:bg-white">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Personal Bereavement Plan</p>
              <h1 className="text-2xl font-bold text-slate-900">{name || "Your plan"}</h1>
              {intake.dateOfDeath && (
                <p className="text-sm text-slate-500 mt-1">Passed away on {formatDate(intake.dateOfDeath)}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {headerActions}
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print / PDF
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
            <Stat value={tasks.length} label="Total tasks" />
            <Stat value={urgentLeft} label="Urgent remaining" className="text-red-600" />
            <Stat value={completed} label="Completed" className="text-emerald-600" />
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <Progress value={completed} max={tasks.length} showLabel />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-4">
        {banner && <div className="mb-6 print:hidden">{banner}</div>}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className="lg:w-56 flex-shrink-0 print:hidden">
            <div className="bg-white rounded-xl border border-stone-200 p-4 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Filter tasks</span>
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">By timeframe</p>
              <div className="space-y-1">
                {(["all", ...PRIORITY_ORDER] as const).map((p) => (
                  <FilterButton key={p} active={priority === p} onClick={() => setPriority(p)}>
                    {p === "all" ? "All tasks" : PRIORITY_META[p].label}
                    <span className="float-right text-xs text-slate-400">
                      {p === "all" ? tasks.length : tasks.filter((t) => t.priority === p).length}
                    </span>
                  </FilterButton>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-4 mb-2">By category</p>
              <div className="space-y-1">
                {(["all", ...CATEGORIES] as const).map((c) => (
                  <FilterButton key={c} active={category === c} onClick={() => setCategory(c)}>
                    {c === "all" ? "All categories" : CATEGORY_META[c].label}
                  </FilterButton>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
                  Hide completed
                </label>
                {extraFilter && (
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={onlyExtra} onChange={(e) => setOnlyExtra(e.target.checked)} />
                    {extraFilter.label}
                  </label>
                )}
              </div>
            </div>
          </aside>

          {/* Tasks */}
          <div className="flex-1 min-w-0 space-y-8">
            {PRIORITY_ORDER.map((p) => {
              const group = filtered.filter((t) => t.priority === p);
              if (!group.length) return null;
              const meta = PRIORITY_META[p];
              const PIcon = meta.icon;
              return (
                <section key={p} className="print:break-inside-avoid-page">
                  <div className="flex items-center gap-2 mb-4">
                    <PIcon className="h-4 w-4 text-slate-500" />
                    <h2 className="text-base font-semibold text-slate-800">{meta.label}</h2>
                    <Badge variant={meta.variant}>{group.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={() => onToggle(task.id, task.status === "completed" ? "pending" : "completed")}
                        extras={renderTaskExtras?.(task)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <p>No tasks match the current filter.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4 print:hidden">
            {sidebar}
            <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-3">Quick links</p>
              {[
                { href: "/resources", label: "Find local services", icon: Building2 },
                { href: "/financial-support", label: "Check financial support", icon: PoundSterling },
                { href: "/cost-estimator", label: "Estimate funeral costs", icon: Calendar },
                { href: "/assistant", label: "Ask the AI assistant", icon: ArrowRight },
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
          </aside>
        </div>

        <p className="hidden print:block text-xs text-slate-500 mt-8">
          Printed from AfterCare UK. This plan is guidance only and does not constitute legal or financial advice.
        </p>
      </div>
    </div>
  );
}

function Stat({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
      <p className={cn("text-2xl font-bold text-slate-800", className)}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
        active ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-500 hover:bg-stone-50"
      )}
    >
      {children}
    </button>
  );
}

function TaskCard({
  task,
  onToggle,
  extras,
}: {
  task: ActionPlanTask;
  onToggle: () => void;
  extras?: React.ReactNode;
}) {
  const cat = CATEGORY_META[task.category];
  const CatIcon = cat.icon;
  const done = task.status === "completed";

  return (
    <Card className={cn("transition-all print:shadow-none print:break-inside-avoid", done && "opacity-60 print:opacity-100")}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <button
            onClick={onToggle}
            className="flex-shrink-0 mt-0.5"
            aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
          >
            {done ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-stone-300 hover:text-slate-400 transition-colors" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <p className={cn("text-sm font-medium text-slate-800", done && "line-through text-slate-400")}>
                {task.title}
              </p>
              <div className="flex items-center gap-1.5">
                <CatIcon className={cn("h-3.5 w-3.5", cat.color)} />
                <span className="text-xs text-slate-500">{cat.label}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{task.description}</p>
            {(task.link || task.phone) && (
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {task.link && (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="print:hidden">Official guidance</span>
                    <span className="hidden print:inline">{task.link}</span>
                  </a>
                )}
                {task.phone && (
                  <a
                    href={`tel:${task.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {task.phone}
                  </a>
                )}
              </div>
            )}
            {extras && <div className="print:hidden">{extras}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
