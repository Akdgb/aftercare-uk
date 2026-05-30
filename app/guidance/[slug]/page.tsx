import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ExternalLink } from "lucide-react";
import { articles } from "@/lib/guidance-content";

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return {};
  return {
    title: `${article.title} – AfterCare Guidance`,
    description: article.title,
  };
}

export default async function GuidanceArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) notFound();

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line) => {
        if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
        if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
        if (line.startsWith("- ")) return `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`;
        if (line.startsWith("| ")) {
          const cells = line
            .split("|")
            .filter((c) => c.trim() && !c.match(/^[-\s|]+$/))
            .map((c) => `<td>${c.trim()}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        }
        if (!line.trim()) return "<br/>";
        const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return `<p>${formatted}</p>`;
      })
      .join("\n");
  };

  const related = Object.values(articles)
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <Link
          href="/guidance"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Guidance Hub
        </Link>

        <article className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-10">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-stone-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
                {article.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Updated {article.lastUpdated}
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
          />

          {/* Gov.UK banner */}
          <div className="mt-10 p-5 bg-stone-50 border border-stone-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-700 mb-2">Official government guidance</p>
            <p className="text-sm text-slate-600 mb-3">
              For the most up-to-date official information, always check GOV.UK.
            </p>
            <a
              href="https://www.gov.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-700 font-medium hover:text-slate-900"
            >
              <ExternalLink className="h-4 w-4" />
              Visit GOV.UK
            </a>
          </div>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Related guidance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/guidance/${rel.slug}`}
                  className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <p className="text-sm font-medium text-slate-800 group-hover:text-slate-600 mb-1">
                    {rel.title}
                  </p>
                  <span className="text-xs text-slate-400">{rel.readTime} min read</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
