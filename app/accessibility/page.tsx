import { ProsePage } from "@/components/layout/prose-page";
import { SITE } from "@/lib/site";

export const metadata = { title: "Accessibility statement" };

export default function AccessibilityPage() {
  return (
    <ProsePage title="Accessibility statement" updated="7 October 2026">
      <p>
        This statement applies to the AfterCare UK website. We want as many people as possible to be able to use it.
        For example, you should be able to:
      </p>
      <ul>
        <li>change colours, contrast levels and fonts using your browser or device settings</li>
        <li>zoom in up to 400% without the text spilling off the screen</li>
        <li>navigate most of the website using just a keyboard</li>
        <li>navigate most of the website using speech recognition software</li>
        <li>listen to most of the website using a screen reader</li>
      </ul>
      <p>We have also made the text as simple as possible to understand.</p>

      <h2>How accessible this website is</h2>
      <p>
        We test the website against the Web Content Accessibility Guidelines (WCAG) version 2.2 at level AA. Automated
        testing of every page found no failures that affect use. We know some parts may still not be fully accessible:
      </p>
      <ul>
        <li>the AI assistant&apos;s answers are added to the page as they arrive and may not always be announced by screen readers</li>
        <li>the map of local services relies on information from third parties and some entries may be incomplete</li>
        <li>some links go to other organisations&apos; websites, which we do not control</li>
      </ul>

      <h2>Feedback and contact information</h2>
      <p>
        If you need information on this website in a different format, or you find a problem not listed on this page,
        email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. We will consider your request and reply
        within 5 working days.
      </p>

      <h2>Enforcement procedure</h2>
      <p>
        AfterCare UK is not a public sector body. When public bodies use or recommend this service, the Public Sector
        Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 may apply to them. The
        Equality and Human Rights Commission (EHRC) enforces these regulations in Great Britain. If you are not happy
        with how we respond to your complaint, contact the{" "}
        <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener noreferrer">
          Equality Advisory and Support Service (EASS)
        </a>
        . In Northern Ireland, contact the{" "}
        <a href="https://www.equalityni.org/Home" target="_blank" rel="noopener noreferrer">
          Equality Commission for Northern Ireland
        </a>
        .
      </p>

      <h2>Technical information about this website&apos;s accessibility</h2>
      <p>
        This website is partially compliant with WCAG 2.2 AA because of the issues listed above. It has not yet been
        audited by an independent accessibility specialist. We plan to arrange an independent audit and will update
        this statement with the results.
      </p>

      <h2>How we tested this website</h2>
      <p>
        On 7 October 2026 we tested every page of the website with automated tools (axe-core) on a mobile screen size,
        checking against WCAG 2.2 level A and AA, and fixed the issues found. We also checked keyboard use on the main
        journey of creating and updating a plan.
      </p>

      <h2>Preparation of this statement</h2>
      <p>This statement was prepared on 7 October 2026. It will be reviewed at least once a year.</p>
    </ProsePage>
  );
}
