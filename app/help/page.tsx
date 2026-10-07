import { articles } from "@/lib/guidance-content";
import { HelpList, type HelpItem } from "./help-list";

export const metadata = { title: "Help — AfterCare UK" };

// Everything that isn't the plan lives here, as one searchable list.
const TOOLS: HelpItem[] = [
  { href: "/financial-support", title: "Money you could claim", desc: "2-minute check for government payments", kind: "tool", icon: "money" },
  { href: "/cost-estimator", title: "Funeral cost estimate", desc: "See typical prices before you call anyone", kind: "tool", icon: "calc" },
  { href: "/resources", title: "Services near you", desc: "Register office, funeral directors, crematoriums", kind: "tool", icon: "map" },
  { href: "/assistant", title: "Ask a question", desc: "Type anything and get a plain answer", kind: "tool", icon: "chat" },
];

export default function HelpPage() {
  const guides: HelpItem[] = [
    { href: "/help/streaming", title: "Stream the funeral to family abroad", desc: "WhatsApp, Zoom or a venue webcast", kind: "guide", icon: "book" },
    { href: "/help/memorials", title: "Condolences and online memorials", desc: "Free memorial pages, notices and donations", kind: "guide", icon: "book" },
    { href: "/help/documents", title: "Documents you'll need", desc: "What to gather and where it comes from", kind: "guide", icon: "book" },
    ...Object.values(articles).map((a): HelpItem => ({
    href: `/guidance/${a.slug}`,
    title: a.title,
    desc: `${a.category} · ${a.readTime} min read`,
    kind: "guide",
    icon: "book",
  })),
  ];
  return <HelpList tools={TOOLS} guides={guides} />;
}
