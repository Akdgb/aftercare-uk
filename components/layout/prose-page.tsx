import { BackLink } from "@/components/layout/back-link";

/** Plain text page layout used for About, Accessibility and similar pages. */
export function ProsePage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      <BackLink fallback="/" fallbackLabel="Home" />
      <h1 className="text-3xl font-semibold text-ink-900 mt-3">{title}</h1>
      {updated && <p className="text-sm text-ink-500 mt-1">Last updated {updated}</p>}
      <div className="mt-6 space-y-4 text-ink-700 leading-relaxed [&_h2]:font-sans [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-2 [&_a]:text-ink-800">
        {children}
      </div>
    </div>
  );
}
