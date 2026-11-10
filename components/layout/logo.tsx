import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mark } from "@/components/brand/mark";

/** The one AfterCare logo: the mark plus the name in the display serif. Use this everywhere. */
export function Logo({
  className,
  inverted = false,
  href = "/",
}: {
  className?: string;
  inverted?: boolean;
  /** Pass null for a logo that is not a link, such as on a printed leaflet. */
  href?: string | null;
}) {
  const content = (
    <>
      <span
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
          inverted ? "bg-white/10" : "bg-ink-700"
        )}
      >
        <Mark className="h-6 w-6" />
      </span>
      <span className={cn("font-display text-xl font-semibold", inverted ? "text-white" : "text-ink-900")}>
        AfterCare
      </span>
    </>
  );
  if (href === null) return <span className={cn("flex items-center gap-2.5", className)}>{content}</span>;
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 group", className)} aria-label="AfterCare home">
      {content}
    </Link>
  );
}
