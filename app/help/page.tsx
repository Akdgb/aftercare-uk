import { articles } from "@/lib/guidance-content";
import { HelpList, type HelpItem } from "./help-list";

export const metadata = { title: "Help" };

// Everything that is not the plan lives here, as one searchable list.
const TOOLS: HelpItem[] = [
  { href: "/wellbeing", title: "Looking after you", desc: "Check in, take a breath and find support", kind: "tool", icon: "heart" },
  { href: "/financial-support", title: "Money you could claim", desc: "2-minute check for government payments", kind: "tool", icon: "money" },
  { href: "/cost-estimator", title: "Funeral cost estimate", desc: "See typical prices before you call anyone", kind: "tool", icon: "calc" },
];

// Official government services, linked rather than copied, so they are always current
const OFFICIAL: HelpItem[] = [
  { href: "https://www.gov.uk/after-a-death", title: "What to do after someone dies", desc: "GOV.UK step-by-step guide", kind: "official", icon: "gov" },
  { href: "https://www.gov.uk/register-offices", title: "Find a register office", desc: "To register the death", kind: "official", icon: "gov" },
  { href: "https://www.gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once", title: "Tell Us Once", desc: "Tell most government services at once", kind: "official", icon: "gov" },
  { href: "https://www.gov.uk/find-local-council", title: "Find your local council", desc: "Cemeteries, crematoriums and bereavement services", kind: "official", icon: "gov" },
  { href: "https://www.gov.uk/funeral-payments", title: "Help with funeral costs", desc: "Funeral Expenses Payment", kind: "official", icon: "gov" },
  { href: "https://www.gov.uk/bereavement-support-payment", title: "Bereavement Support Payment", desc: "If your partner died", kind: "official", icon: "gov" },
  { href: "https://www.gov.uk/applying-for-probate", title: "Apply for probate", desc: "Dealing with the estate", kind: "official", icon: "gov" },
  { href: "https://www.mygov.scot/death", title: "In Scotland", desc: "mygov.scot: what to do after a death", kind: "official", icon: "gov" },
  { href: "https://www.nidirect.gov.uk/information-and-services/death-and-bereavement", title: "In Northern Ireland", desc: "nidirect: death and bereavement", kind: "official", icon: "gov" },
];

export default function HelpPage() {
  const guides: HelpItem[] = [
    { href: "/help/support", title: "Getting support", desc: "NHS help first, then free national helplines", kind: "guide", icon: "book" },
    { href: "/help/streaming", title: "Stream the funeral to family abroad", desc: "WhatsApp, Zoom or a venue webcast", kind: "guide", icon: "book" },
    { href: "/help/memorials", title: "Condolences and online memorials", desc: "Free memorial pages, notices and donations", kind: "guide", icon: "book" },
    { href: "/help/documents", title: "Documents you'll need", desc: "What to gather and where it comes from", kind: "guide", icon: "book" },
    ...Object.values(articles).map((a): HelpItem => ({
    href: `/guidance/${a.slug}`,
    title: a.title,
    desc: `${a.readTime} minute read`,
    kind: "guide",
    icon: "book",
  })),
  ];
  return <HelpList tools={TOOLS} official={OFFICIAL} guides={guides} />;
}
