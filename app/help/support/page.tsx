import { ExternalLink, Phone } from "lucide-react";
import { ProsePage } from "@/components/layout/prose-page";

export const metadata = { title: "Someone to talk to" };

type Line = { name: string; what: string; phone?: string; text?: string; hours: string; where: string; url: string };

const URGENT: Line[] = [
  {
    name: "Samaritans",
    what: "For anyone who is struggling to cope or having thoughts of suicide. You do not have to be suicidal to call.",
    phone: "116 123",
    hours: "Any time, day or night. Free.",
    where: "UK and Ireland",
    url: "https://www.samaritans.org",
  },
  {
    name: "Shout",
    what: "A free text service if you would rather not talk on the phone.",
    text: "Text SHOUT to 85258",
    hours: "Any time, day or night",
    where: "UK",
    url: "https://giveusashout.org",
  },
];

const GRIEF: Line[] = [
  {
    name: "Cruse Bereavement Support",
    what: "The UK's leading bereavement charity. Trained volunteers listen and can arrange further support.",
    phone: "0808 808 1677",
    hours: "Monday and Wednesday to Friday 9:30am to 5pm, Tuesday 1pm to 8pm",
    where: "England, Wales and Northern Ireland",
    url: "https://www.cruse.org.uk",
  },
  {
    name: "Cruse Scotland",
    what: "A separate charity offering the same kind of support in Scotland.",
    phone: "0808 802 6161",
    hours: "Monday to Friday 9am to 8pm, weekends 10am to 2pm",
    where: "Scotland",
    url: "https://www.crusescotland.org.uk",
  },
  {
    name: "Marie Curie Support Line",
    what: "Support for anyone affected by terminal illness or the death of someone close, including free bereavement sessions.",
    phone: "0800 090 2309",
    hours: "Check the website for current opening hours",
    where: "UK",
    url: "https://www.mariecurie.org.uk/support",
  },
  {
    name: "Muslim Bereavement Support Service",
    what: "Bereavement support for Muslim women, offered in line with Islamic values.",
    phone: "020 3468 7333",
    hours: "Check the website for current opening hours",
    where: "UK",
    url: "https://mbss.org.uk",
  },
];

const SPECIFIC: Line[] = [
  {
    name: "Child Bereavement UK",
    what: "For children and young people who are grieving, and for families after the death of a child.",
    phone: "0800 02 888 40",
    hours: "Monday to Friday 9am to 5pm",
    where: "UK",
    url: "https://www.childbereavementuk.org",
  },
  {
    name: "Winston's Wish",
    what: "Support for children and young people after the death of a parent or sibling, and advice for the adults caring for them.",
    phone: "08088 020 021",
    hours: "Monday to Friday 8am to 8pm",
    where: "UK",
    url: "https://www.winstonswish.org",
  },
  {
    name: "Sands",
    what: "For anyone affected by the death of a baby during pregnancy or after birth.",
    phone: "0808 164 3332",
    hours: "Check the website for current opening hours",
    where: "UK",
    url: "https://www.sands.org.uk",
  },
  {
    name: "The Compassionate Friends",
    what: "Support from other bereaved parents after the death of a son or daughter of any age.",
    phone: "0345 123 2304",
    hours: "Every day 10am to 4pm and 7pm to 10pm",
    where: "UK",
    url: "https://www.tcf.org.uk",
  },
  {
    name: "Survivors of Bereavement by Suicide",
    what: "Support for adults bereaved by suicide, from people who have been through it.",
    phone: "0300 111 5065",
    hours: "Every day 9am to 7pm",
    where: "UK",
    url: "https://uksobs.com",
  },
  {
    name: "Sudden",
    what: "For people bereaved by a sudden death, such as a road crash.",
    phone: "0800 2600 400",
    hours: "Check the website for current opening hours",
    where: "UK",
    url: "https://www.sudden.org",
  },
  {
    name: "WAY Widowed and Young",
    what: "A peer support network for people widowed before the age of 51.",
    hours: "Membership based. See the website for details.",
    where: "UK",
    url: "https://www.widowedandyoung.org.uk",
  },
];

function Lines({ items }: { items: Line[] }) {
  return (
    <ul className="!list-none !pl-0 space-y-3">
      {items.map((l) => (
        <li key={l.name} className="bg-white border border-stone-200 rounded-2xl p-4">
          <p className="font-semibold text-ink-900">{l.name}</p>
          <p className="text-sm text-ink-600 mt-1">{l.what}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
            {l.phone && (
              <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 font-semibold !no-underline bg-ink-700 !text-white px-3 py-1.5 rounded-lg">
                <Phone className="h-4 w-4" /> {l.phone}
              </a>
            )}
            {l.text && (
              <a href="sms:85258?body=SHOUT" className="inline-flex items-center gap-1.5 font-semibold !no-underline bg-ink-700 !text-white px-3 py-1.5 rounded-lg">
                {l.text}
              </a>
            )}
            <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
              Website <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <p className="text-xs text-ink-500 mt-2">
            {l.hours} · {l.where}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function SupportPage() {
  return (
    <ProsePage title="Someone to talk to">
      <p>
        Grief affects everyone differently. These organisations are free, confidential and independent of AfterCare.
        Opening hours can change, so check the website if you cannot get through.
      </p>
      <p className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-ink-800">
        If someone is in immediate danger, call <a href="tel:999">999</a>. For urgent mental health help in England,
        call <a href="tel:111">NHS 111</a> and choose the mental health option.
      </p>
      <h2>If you are struggling right now</h2>
      <Lines items={URGENT} />
      <h2>Bereavement support</h2>
      <Lines items={GRIEF} />
      <h2>Support for particular situations</h2>
      <Lines items={SPECIFIC} />
      <p className="text-sm text-ink-500">
        Information checked October 2026. AfterCare is not connected to these organisations and is not paid to list
        them.
      </p>
    </ProsePage>
  );
}
