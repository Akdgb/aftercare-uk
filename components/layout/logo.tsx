import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: a soft leaf-heart mark plus the name in the display serif. */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 group", className)} aria-label="AfterCare home">
      <span
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
          inverted ? "bg-white/10" : "bg-ink-700"
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 17V10.5M12 13l2.2-2.2" stroke="#9db6ad" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className={cn("font-display text-xl font-semibold", inverted ? "text-white" : "text-ink-900")}>
        AfterCare
      </span>
    </Link>
  );
}
