import Link from "next/link";
import { ProsePage } from "@/components/layout/prose-page";
import { SITE } from "@/lib/site";

export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  const who = SITE.operator ? `${SITE.operator}, trading as AfterCare UK` : "AfterCare UK";
  return (
    <ProsePage title="Terms of use" updated="November 2026">
      <p>
        These terms explain how you can use AfterCare UK. The service is run by {who}. By using AfterCare you agree to
        them. If you have a question, email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>What AfterCare is</h2>
      <p>
        AfterCare gives general guidance on the practical steps after someone dies in the UK, and a checklist based on
        your answers. It is guidance only. It is not legal, financial, medical or tax advice. For advice about your own
        situation, speak to a qualified professional, such as a solicitor, the register office, an accountant or your GP.
      </p>
      <p>
        We check our guidance against official sources such as GOV.UK, mygov.scot and nidirect, and say when it was last
        checked. Rules and fees change, so always confirm important details, such as deadlines and payments, with the
        organisation concerned.
      </p>

      <h2>It is free</h2>
      <p>
        AfterCare is free to use. There are no fees, subscriptions or payments, so there is nothing to refund. We do not
        sell anything through AfterCare and we are not paid to list the organisations or helplines we mention.
      </p>

      <h2>Your plan and account</h2>
      <ul>
        <li>You can use AfterCare without an account. Your plan is then saved only on your device.</li>
        <li>You must be 16 or over to save a plan with your email address.</li>
        <li>Keep access to your email account secure, as the sign-in links we send give access to your plan.</li>
        <li>
          If you invite family members to a plan, they can see the plan and its answers. Only invite people you trust.
        </li>
        <li>
          You can delete your account and plans at any time from your account page, and clear anything saved on your
          device from our <Link href="/privacy#device">privacy page</Link>.
        </li>
      </ul>

      <h2>Using AfterCare fairly</h2>
      <p>
        Do not misuse the service, for example by trying to access other people&apos;s plans, sending invitations to
        people who have not agreed to receive them, or disrupting the website.
      </p>

      <h2>Our responsibility to you</h2>
      <p>
        We work hard to keep AfterCare accurate and available, but we cannot promise it will always be error free or
        available. We are not responsible for decisions you make based on general guidance, or for the services of other
        organisations we link to. Nothing in these terms limits our responsibility where the law does not allow it, for
        example for death or personal injury caused by our negligence, or your rights as a consumer.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms or change the service. If a change matters, we will say so on this page and update the
        date at the top.
      </p>

      <h2>The law that applies</h2>
      <p>
        These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can
        also bring a claim in your local courts, and you keep the consumer rights you have there.
      </p>

      <p>
        See also our <Link href="/privacy">privacy policy</Link> and <Link href="/cookies">cookie policy</Link>.
      </p>
    </ProsePage>
  );
}
