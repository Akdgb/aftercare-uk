import { GuidePage } from "@/components/help/guide-page";

export const metadata = { title: "Condolences and online memorials — AfterCare UK" };

export default function MemorialsPage() {
  return (
    <GuidePage
      title="Condolences and online memorials"
      intro="A place for people to share memories, leave messages, find the funeral details or give in their name. Most of these are free."
      steps={[
        {
          title: "Online memorial page",
          body: "A page with photos, stories and messages that friends and family anywhere in the world can add to. MuchLoved is a UK charity that offers them free.",
          link: { href: "https://www.muchloved.com", label: "MuchLoved" },
        },
        {
          title: "Funeral notice",
          body: "Let people know the date, time and place. Free online notice sites are quicker and cheaper than a newspaper notice.",
          link: { href: "https://funeral-notices.co.uk", label: "Funeral Notices" },
        },
        {
          title: "Donations in their memory",
          body: "Ask for donations to a charity that mattered to them instead of flowers. JustGiving lets you set up an 'in memory' page.",
          link: { href: "https://www.justgiving.com", label: "JustGiving" },
        },
        {
          title: "Help with funeral costs from friends and family",
          body: "Some families set up a fundraising page so people can contribute to the funeral itself — especially useful when relatives abroad can't attend.",
          link: { href: "https://www.gofundme.com/en-gb", label: "GoFundMe" },
        },
        {
          title: "Their social media",
          body: "Facebook and Instagram can turn an account into a memorial so friends can still post. You'll usually need a copy of the death certificate.",
          link: { href: "https://www.facebook.com/help/1506822589577997", label: "Facebook memorialisation" },
        },
        {
          title: "A family WhatsApp group",
          body: "Often the simplest of all: one group for sharing updates, the funeral link and memories.",
        },
      ]}
      footnote="We list these because they're widely used, not because they pay us — AfterCare has no paid partnerships. Check each site's fees before you start."
    />
  );
}
