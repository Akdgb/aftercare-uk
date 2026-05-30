import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "urgent" | "week" | "month" | "future" | "completed" | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-stone-100 text-slate-600",
    urgent: "bg-red-50 text-red-700 border border-red-200",
    week: "bg-amber-50 text-amber-700 border border-amber-200",
    month: "bg-blue-50 text-blue-700 border border-blue-200",
    future: "bg-stone-100 text-slate-600 border border-stone-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    info: "bg-slate-700 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
