import { ProsePage } from "@/components/layout/prose-page";
import { SITE } from "@/lib/site";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <ProsePage title="About AfterCare UK">
      <p>
        AfterCare UK is a free website that helps people in the UK deal with the practical tasks after someone dies. It
        turns a few simple questions into a personal checklist, explains each step in plain English and lets families
        share the work.
      </p>

      <h2>What it does</h2>
      <ul>
        <li>Creates a step-by-step plan based on your situation, including faith and cultural traditions if you choose to share them</li>
        <li>Explains how to register the death, arrange a funeral and tell the organisations that need to know</li>
        <li>Shows ways to reduce funeral costs and checks which government payments you may be able to claim</li>
        <li>Lets you invite family members, assign tasks and keep track of what has been done</li>
      </ul>

      <h2>Independent and free</h2>
      <p>
        AfterCare UK is independent. It is not part of the government, the NHS or any funeral business. It has no
        advertising and no paid partnerships, and nobody pays to be mentioned. Using it is free.
      </p>

      <h2>Where our information comes from</h2>
      <p>
        Our guidance is based on official sources, mainly GOV.UK, nidirect, mygov.scot, HM Courts and Tribunals Service,
        HMRC and the Department for Work and Pensions. We link to the official page for each step so you can check the
        details. The guidance was last checked against these sources on {SITE.contentReviewed}.
      </p>
      <p>
        AfterCare UK gives general guidance only. It is not legal, financial or medical advice. Rules can differ
        between England, Wales, Scotland and Northern Ireland, and they change over time. For advice about your own
        situation, speak to a solicitor, Citizens Advice or the organisation concerned.
      </p>

      <h2>Contact us</h2>
      <p>
        To report a mistake, suggest an improvement or ask a question, email{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. We aim to reply within 5 working days.
      </p>
    </ProsePage>
  );
}
