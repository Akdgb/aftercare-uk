import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-ink-800 placeholder-ink-400",
            "focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent",
            "disabled:bg-stone-50 disabled:text-ink-500",
            error && "border-red-400 focus:ring-red-300",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
