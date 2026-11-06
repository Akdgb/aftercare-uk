import { ExternalLink, Phone } from "lucide-react";
import { ProsePage } from "@/components/layout/prose-page";
import { HELPLINES, NHS_GRIEF_URL, NHS_TALKING_THERAPIES_URL, NHS_URGENT_URL, telHref } from "@/lib/support";

export const metadata = { title: "Getting support" };

function NhsLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
      {children} <ExternalLink className="h-3.5 w-3.5" />
      <span className="sr-only">(opens nhs.uk in a new tab)</span>
    </a>
  );
}

export default function SupportPage() {
  return (
    <ProsePage title="Getting support">
      <p>Grief affects everyone differently. The NHS is the place to start if you need help with how you are feeling.</p>

      <h2>Urgent help</h2>
      <ul>
        <li>
          If someone is in danger or has seriously hurt themselves, call <a href="tel:999">999</a>.
        </li>
        <li>
          For urgent mental health help in England or Wales, call <a href="tel:111">111</a> and choose option 2. In
          Scotland, call NHS 24 on 111. In Northern Ireland, contact your GP or call 999 in an emergency.
        </li>
        <li>
          <NhsLink href={NHS_URGENT_URL}>Where to get urgent help for mental health (NHS)</NhsLink>
        </li>
      </ul>

      <h2>Support from the NHS</h2>
      <ul>
        <li>
          <strong>Your GP</strong> can talk to you about how you are coping, give you a fit note if you are not well
          enough to work, and refer you for support.
        </li>
        <li>
          <strong>NHS Talking Therapies</strong> are free. In England you can refer yourself online if you are
          registered with a GP. Elsewhere in the UK, ask your GP.{" "}
          <NhsLink href={NHS_TALKING_THERAPIES_URL}>Find a service</NhsLink>
        </li>
        <li>
          <NhsLink href={NHS_GRIEF_URL}>NHS advice on grief after bereavement or loss</NhsLink>
        </li>
      </ul>

      <h2>Free national helplines</h2>
      <p>These are independent charities. AfterCare is not connected to them and is not paid to list them.</p>
      {HELPLINES.map((g) => (
        <section key={g.group}>
          <h3 className="font-sans font-semibold text-ink-900 mt-5 mb-2">{g.group}</h3>
          <ul className="!list-none !pl-0 space-y-2">
            {g.lines.map((l) => (
              <li key={l.name} className="bg-white border border-stone-200 rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-ink-900">{l.name}</p>
                  {l.phone && (
                    <a href={telHref(l.phone)} className="inline-flex items-center gap-1.5 text-sm font-semibold !no-underline bg-ink-700 !text-white px-3 py-1.5 rounded-lg">
                      <Phone className="h-4 w-4" /> {l.phone}
                    </a>
                  )}
                  {l.text && (
                    <a href="sms:85258?body=SHOUT" className="inline-flex items-center text-sm font-semibold !no-underline bg-ink-700 !text-white px-3 py-1.5 rounded-lg">
                      {l.text}
                    </a>
                  )}
                </div>
                <p className="text-sm text-ink-600 mt-1">{l.what}</p>
                <p className="text-xs text-ink-500 mt-1">
                  {l.hours} · {l.where}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm text-ink-500">Checked November 2026. Opening hours can change.</p>
    </ProsePage>
  );
}
