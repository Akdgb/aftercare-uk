import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import Link from "next/link";
import { ClearDeviceData } from "@/components/privacy/clear-device-data";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How AfterCare UK collects, uses, and protects your personal data under UK GDPR.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-white border-b border-stone-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl font-semibold text-ink-900 mb-2">Privacy Policy</h1>
          <p className="text-ink-500 text-sm">Last updated: 19 November 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-ink-50 border border-ink-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-ink-800">
            <strong>Summary:</strong> We collect only the information needed to generate your bereavement plan.
            We do not sell your data, send marketing emails, or share your information with third parties for commercial purposes.
          </p>
        </div>

        <article className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100">

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">1. Who we are</h2>
            <div className="prose text-sm text-ink-600">
              <p>AfterCare UK is a free bereavement guidance service based in England.</p>
              <p><strong>Data controller:</strong> {SITE.operator ? `${SITE.operator}, trading as AfterCare UK` : "AfterCare UK"}</p>
              <p><strong>Contact:</strong> <a href={`mailto:${SITE.privacyEmail}`} className="text-ink-700 underline">{SITE.privacyEmail}</a></p>
              <p>
                {SITE.icoNumber
                  ? `We are registered with the Information Commissioner's Office (ICO). Registration number: ${SITE.icoNumber}.`
                  : "We are registering with the Information Commissioner's Office (ICO) as a data controller. Our registration number will be shown here."}
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">2. What data we collect</h2>
            <div className="prose text-sm text-ink-600">
              <p>When you use AfterCare, we may collect the following personal data:</p>
              <ul>
                <li><strong>Your contact details:</strong> email address</li>
                <li><strong>Your relationship</strong> to the deceased</li>
                <li><strong>Plan preferences:</strong> funeral type, housing situation, financial support needs and, only if you consent, faith and cultural background</li>
                <li><strong>Usage data:</strong> which tasks you have completed, when you last accessed your plan</li>
                <li><strong>Family workspace:</strong> the names and email addresses of people you invite to a plan, who has taken on which task, and notes left on tasks</li>
              </ul>
              <p>We also receive information about the deceased person. Under UK law, GDPR does not apply to people who have died. However, we treat all bereavement data with the same care and confidentiality as personal data.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">3. Why we collect it &amp; our lawful basis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left p-3 text-ink-700 font-medium border border-stone-200">Purpose</th>
                    <th className="text-left p-3 text-ink-700 font-medium border border-stone-200">Lawful basis (UK GDPR Article 6)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Generate your plan from your answers", "Contract: providing the service you ask for under our terms of use (Article 6(1)(b))"],
                    ["Save your plan to your email address so you can return to it", "Contract (Article 6(1)(b))"],
                    ["Send sign-in links and your plan link by email", "Contract (Article 6(1)(b))"],
                    ["Use your faith and cultural background answers to add tailored steps (optional)", "Consent (Article 6(1)(a)) and explicit consent (Article 9(2)(a))"],
                    ["Let family members you invite see and update a shared plan, and send their invitation email", "Contract with you (Article 6(1)(b)); for the people you invite, legitimate interests in delivering the invitation you asked us to send (Article 6(1)(f))"],
                    ["Send task reminder emails about your own plan (at most weekly; turn off any time)", "Legitimate interests in helping you meet deadlines you asked us to track (Article 6(1)(f)). These are service messages, not marketing. We do not send marketing emails."],
                    ["Keep the service secure, prevent abuse of sign-in and fix errors", "Legitimate interests in running a safe, working service (Article 6(1)(f))"],
                    ["Answer emails you send to us", "Legitimate interests in replying to you (Article 6(1)(f))"],
                    ["Comply with legal obligations", "Legal obligation"],
                  ].map(([purpose, basis]) => (
                    <tr key={purpose} className="border-b border-stone-100">
                      <td className="p-3 text-ink-600 border border-stone-200">{purpose}</td>
                      <td className="p-3 text-ink-600 border border-stone-200">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="special-category">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">Faith and cultural background (special category data)</h2>
            <div className="prose text-sm text-ink-600">
              <p>
                The questions about faith and cultural background are optional. Some traditions affect what needs to
                happen, for example burial within 24 hours, a nine night or burial in another country, so your answers
                let us add the right steps to your plan.
              </p>
              <p>
                Religious beliefs and racial or ethnic origin are &ldquo;special category&rdquo; data under UK GDPR. We
                only keep these answers if you tick the consent box (UK GDPR Article 9(2)(a), explicit consent). If you
                skip the questions or do not tick the box, we do not store them. Where the burial will take place is not
                special category data and is kept with the rest of the plan.
              </p>
              <p>
                You can withdraw consent at any time by choosing &ldquo;Remove faith and background details from this
                plan&rdquo; on your saved plan, by changing your answers, by deleting the plan or by emailing us. The
                answers are visible only to you and family members you invite to the plan.
              </p>
            <p>
              Task notes are free text. Please avoid writing health details or other sensitive information about
              yourself or other people in them. If you do, they are only visible to people on that plan, and they are
              deleted with the plan.
            </p>
            <p>
              Giving us your email address is optional. Without it you can still use AfterCare, but your plan is
              kept only on your device. We do not make decisions about you by automated means.
            </p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">4. How long we keep your data</h2>
            <div className="prose text-sm text-ink-600">
              <ul>
                <li><strong>Saved plans:</strong> 3 years from the date of creation, then automatically deleted</li>
                <li><strong>Your account:</strong> until you delete it from your dashboard (Account tab). This removes all plans you own.</li>
                <li><strong>Family members and task notes:</strong> deleted with the plan, or when the owner removes that person</li>
                <li><strong>Sign-in links:</strong> expire after 20 minutes (family invitation links after 7 days) and are deleted a day after they expire. If you ask us to save your plan, a copy is kept with the link until you open it, and is deleted with the link if you do not.</li>
                <li><strong>Hosting logs:</strong> basic request records kept by our hosting provider, Vercel, for the short period set by Vercel. We do not log the content of your plan or notes.</li>
                <li><strong>Emails you send to us:</strong> kept in our inbox while we deal with your message, and deleted within 2 years</li>
                <li><strong>Backups:</strong> deleted data can remain in our database provider&apos;s backups for a short period until they are overwritten. It is not used during that time.</li>
              </ul>
              <p>You can request deletion of your data at any time. See section 7.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">5. Who we share data with</h2>
            <div className="prose text-sm text-ink-600">
              <p>We use the following third-party processors. All are contractually required to process your data only on our instructions and in compliance with UK GDPR:</p>
              <ul>
                <li><strong>Neon Inc.</strong> (database hosting): stores your account and saved plans</li>
                <li><strong>Resend Inc.</strong> (email delivery): email addresses are processed to send sign-in links, family invitations, your plan link and reminders, and to receive emails you send to our hello@ and privacy@ addresses so we can read and reply to them</li>
                <li><strong>Vercel Inc.</strong> (website hosting and domain management): your requests are processed on Vercel servers in London</li>
              </ul>
              <p>
                We do not use analytics, advertising, tracking pixels or session recording tools. The website&apos;s fonts
                are stored on our own hosting, so your browser does not contact Google or any other font service.
              </p>
              <p><strong>We do not sell your data.</strong> We do not share your data with funeral directors, insurers, or any other commercial partners without your explicit consent.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">6. Transfers outside the UK</h2>
            <div className="prose text-sm text-ink-600">
              <p>
                Some of our processors are based in the USA. Transfers outside the UK are protected by either:
              </p>
              <ul>
                <li>The UK International Data Transfer Agreement (IDTA), or</li>
                <li>the UK Extension to the EU-US Data Privacy Framework (the &ldquo;UK-US data bridge&rdquo;), where the company is certified</li>
              </ul>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="device">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">Delete what is saved on this device</h2>
            <div className="prose text-sm text-ink-600">
              <p>Your plan, answers and wellbeing notes may be saved in this browser. You can remove all of them now. If you saved a plan to your email, you can delete it from your account page.</p>
            </div>
            <ClearDeviceData />
          </section>

          <section className="p-6 sm:p-8" id="rights">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">7. Your rights</h2>
            <div className="prose text-sm text-ink-600">
              <p>Under UK GDPR you have the following rights:</p>
              <ul>
                <li><strong>Right of access:</strong> request a copy of the data we hold about you</li>
                <li><strong>Right to erasure:</strong> delete individual plans, or your whole account, yourself from the Account page, or ask us to do it</li>
                <li><strong>Right to rectification:</strong> correct inaccurate data</li>
                <li><strong>Right to portability:</strong> receive your data in a machine-readable format</li>
                <li><strong>Right to object:</strong> object to processing based on legitimate interests</li>
                <li><strong>Right to stop reminders:</strong> use the link in any reminder email, or the Account tab on your dashboard</li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href={`mailto:${SITE.privacyEmail}`} className="text-ink-700 underline">
                  {SITE.privacyEmail}
                </a>. We will usually respond within one calendar month. If a request is complex, or you send several, we can extend this by up to two further months, and we will tell you why within the first month. We may ask you to confirm your identity first, for example by replying from the email address on your account, and we will not share information about other people, such as family members on a shared plan, without a lawful reason.
              </p>
              <p>
                You also have the right to lodge a complaint with the{" "}
                <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-ink-700 underline">
                  Information Commissioner&apos;s Office (ICO)
                </a>.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">8. Cookies</h2>
            <div className="prose text-sm text-ink-600">
              <p>AfterCare uses one cookie, to keep you signed in, and storage in your browser to keep your plan and answers on your device. Both are strictly necessary for the service you ask for, so we do not need a cookie banner. We do not use advertising, analytics or tracking cookies. <Link href="/cookies" className="text-ink-700 underline">See our cookie policy</Link>.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="wellbeing">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">Looking after you</h2>
            <div className="prose text-sm text-ink-600">
              <p>
                Your daily check-ins, the feelings you choose, anything you write and the dates you add in &ldquo;Looking
                after you&rdquo; are stored only in your browser on your own device. They are never sent to us or to
                anyone else, and they are not saved to your account. You can delete them at any time from that page, or
                by clearing your browser data.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="children">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">Children</h2>
            <div className="prose text-sm text-ink-600">
              <p>
                AfterCare is designed for adults dealing with the practical tasks after a death. You need to be 16 or
                over to create an account, and we ask for your age before you sign in. If you are under 16, we do not
                create an account or keep the email address you entered, and we point you to free support services
                for young people, such as Childline and Child Bereavement UK.
              </p>
              <p>
                If you think someone under 16 has given us their details, email us and we will delete them.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="terms">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">9. Terms of use</h2>
            <div className="prose text-sm text-ink-600">
              <p>Using AfterCare means you agree to our <Link href="/terms" className="text-ink-700 underline">terms of use</Link>.</p>
            </div>
          </section>

          <section className="p-6 sm:p-8" id="accessibility">
            <h2 className="text-lg font-semibold text-ink-800 mb-3">10. Accessibility</h2>
            <div className="prose text-sm text-ink-600">
              <p>
                We are committed to making AfterCare accessible to all users, including those with disabilities. If you experience any accessibility issues,
                please contact us at{" "}
                <a href={`mailto:${SITE.contactEmail}`} className="text-ink-700 underline">
                  {SITE.contactEmail}
                </a>{" "}
                and we will do our best to help.
              </p>
              <p>We aim to meet WCAG 2.1 AA standards.</p>
            </div>
          </section>

        </article>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-ink-500 hover:text-ink-700">
            ← Back to AfterCare
          </Link>
        </div>
      </div>
    </div>
  );
}
