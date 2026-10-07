import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export type GuideStep = { title: string; body: React.ReactNode; link?: { href: string; label: string } };

/** Simple numbered guide used for the shorter Help pages. */
export function GuidePage({
  title,
  intro,
  steps,
  footnote,
}: {
  title: string;
  intro: React.ReactNode;
  steps: GuideStep[];
  footnote?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
      <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Help
      </Link>
      <h1 className="text-3xl font-semibold text-ink-900 mt-3">{title}</h1>
      <div className="text-ink-600 mt-2">{intro}</div>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="bg-white border border-stone-200 rounded-2xl p-4 flex gap-3">
            <span className="w-7 h-7 rounded-full bg-ink-700 text-white text-sm font-semibold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink-900">{s.title}</p>
              <div className="text-sm text-ink-600 mt-1 leading-relaxed">{s.body}</div>
              {s.link && (
                <a
                  href={s.link.href}
                  target={s.link.href.startsWith("/") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-ink-700 underline underline-offset-4"
                >
                  {s.link.label} {!s.link.href.startsWith("/") && <ExternalLink className="h-3.5 w-3.5" />}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
      {footnote && <p className="text-xs text-ink-500 mt-6">{footnote}</p>}
    </div>
  );
}
