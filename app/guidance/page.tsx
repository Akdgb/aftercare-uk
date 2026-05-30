import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const articles = [
  {
    slug: "what-happens-after-someone-dies",
    title: "What happens after someone dies?",
    summary: "A step-by-step overview of the immediate period after a death — what to expect and what needs to happen.",
    readTime: 5,
    category: "Getting started",
    featured: true,
  },
  {
    slug: "registering-a-death",
    title: "Registering a death",
    summary: "Who can register, what documents you need, where to go, and what certificates you receive.",
    readTime: 4,
    category: "Legal",
  },
  {
    slug: "burial-vs-cremation",
    title: "Burial vs cremation",
    summary: "A clear comparison of burial and cremation — costs, timescales, environmental considerations, and what happens to remains.",
    readTime: 5,
    category: "Funerals",
  },
  {
    slug: "funeral-costs-explained",
    title: "Funeral costs explained",
    summary: "What a funeral typically costs in the UK, what affects the price, and how to keep costs manageable.",
    readTime: 6,
    category: "Funerals",
  },
  {
    slug: "direct-cremation-explained",
    title: "Direct cremation explained",
    summary: "What direct cremation is, what it includes, how much it costs, and whether it is right for your family.",
    readTime: 4,
    category: "Funerals",
  },
  {
    slug: "funeral-support-payments",
    title: "Funeral support payments",
    summary: "Government payments available to help cover funeral costs — eligibility, amounts, and how to apply.",
    readTime: 5,
    category: "Financial support",
  },
  {
    slug: "probate-explained",
    title: "Probate explained",
    summary: "When probate is needed, how to apply, how long it takes, and what happens to the estate.",
    readTime: 7,
    category: "Legal",
  },
  {
    slug: "council-housing-after-death",
    title: "Council housing after death",
    summary: "Your rights as a family member to succeed to a council tenancy, and what happens if you cannot.",
    readTime: 5,
    category: "Housing",
  },
  {
    slug: "repatriation-explained",
    title: "Repatriation explained",
    summary: "How to arrange for a body to be returned to another country — costs, documentation, and who can help.",
    readTime: 5,
    category: "Funerals",
  },
  {
    slug: "tell-us-once",
    title: "Tell Us Once — notifying the government",
    summary: "How to use the Tell Us Once service to notify HMRC, DWP, DVLA, and other departments in a single step.",
    readTime: 3,
    category: "Government",
  },
];

const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];

export default function GuidancePage() {
  const featured = articles.filter((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Guidance Hub</h1>
            <p className="text-slate-500">
              Plain-English explanations of every process — written to inform, not confuse.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Featured */}
        {featured.map((article) => (
          <Link key={article.slug} href={`/guidance/${article.slug}`} className="block mb-8">
            <div className="bg-slate-700 rounded-2xl p-8 text-white hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-slate-300" />
                <span className="text-sm text-slate-300">{article.category}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">{article.title}</h2>
              <p className="text-slate-300 max-w-xl leading-relaxed">{article.summary}</p>
              <div className="flex items-center gap-4 mt-5">
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime} min read
                </span>
                <span className="flex items-center gap-1 text-sm text-white font-medium">
                  Read article
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Articles by category */}
        {categories
          .filter((c) => c !== "All")
          .map((category) => {
            const catArticles = rest.filter((a) => a.category === category);
            if (!catArticles.length) return null;
            return (
              <div key={category} className="mb-10">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-stone-200 pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catArticles.map((article) => (
                    <Link key={article.slug} href={`/guidance/${article.slug}`} className="group">
                      <Card className="h-full hover:shadow-md hover:border-slate-300 transition-all">
                        <CardContent className="p-5">
                          <h3 className="text-sm font-semibold text-slate-800 mb-2 group-hover:text-slate-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">{article.summary}</p>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              {article.readTime} min
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                              Read
                              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
