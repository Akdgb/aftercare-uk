import Link from "next/link";
import { ProsePage } from "@/components/layout/prose-page";
import { SITE } from "@/lib/site";
import { LeafletForm } from "./leaflet-form";

export const metadata = {
  title: "For organisations",
  description: "Free resources for funeral directors, faith and community groups, hospices, employers and councils who support bereaved families.",
};

export default function PartnersPage() {
  const mail = (subject: string) => `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}`;
  return (
    <ProsePage title="For organisations">
      <p>
        AfterCare gives bereaved families a free, personal plan for everything that needs doing after a death. If your
        organisation supports families at this time, you can share it with them at no cost.
      </p>
      <p>
        It is free for families, has no adverts and no paid listings, and does not sell referrals to anyone. That makes
        it safe to recommend.
      </p>

      <h2>Give families a leaflet</h2>
      <p>
        Print a one-page leaflet with a QR code that takes families straight to AfterCare. You can add your
        organisation&apos;s name to it.
      </p>
      <LeafletForm />

      <h2>Who it helps</h2>
      <ul>
        <li>
          <strong>Funeral directors:</strong> families arrive more organised, and the savings checklist shows you are on
          their side.
        </li>
        <li>
          <strong>Mosques, churches, temples and community groups:</strong> steps for faith and cultural traditions,
          including burial in another country.
        </li>
        <li>
          <strong>Hospices and hospital bereavement offices:</strong> a clear next step to give families on the day.
        </li>
        <li>
          <strong>Employers and HR teams:</strong> practical support for staff who are bereaved, alongside your
          compassionate leave policy.
        </li>
        <li>
          <strong>Councils and register offices:</strong> a &ldquo;what happens next&rdquo; guide that works alongside
          Tell Us Once. We are looking for councils to run a free pilot.
        </li>
      </ul>

      <h2>Talk to us</h2>
      <ul>
        <li>
          <a href={mail("AfterCare pilot for our council")}>Run a pilot with your council</a>
        </li>
        <li>
          <a href={mail("Sharing AfterCare with families")}>Share AfterCare with the families you support</a>
        </li>
        <li>
          <a href={mail("Feedback on AfterCare content")}>Suggest a correction or a tradition we should include</a>
        </li>
      </ul>
      <p className="text-sm text-ink-500">
        Read <Link href="/about">about AfterCare</Link>, how we handle data in our <Link href="/privacy">privacy policy</Link>, and
        our <Link href="/accessibility">accessibility statement</Link>.
      </p>
    </ProsePage>
  );
}
