"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { generateActionPlan } from "@/lib/action-plan";
import { isChildPlan } from "@/lib/child-plan";
import { Mark } from "@/components/brand/mark";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import type { ActionPlanTask, IntakeFormData } from "@/types";

// The plan as a designed A4 document: a cover with progress, the steps still
// left, and a page to write contacts on. Saved as PDF through the browser's
// own print dialog, so it works on every phone and computer with no extra service.

const STAGES: { priority: ActionPlanTask["priority"]; title: string }[] = [
  { priority: "urgent", title: "First few days" },
  { priority: "this-week", title: "This week" },
  { priority: "this-month", title: "This month" },
  { priority: "future", title: "When you are ready" },
];

/** A short, readable version of a link or phone number to print next to a step. */
function shortRef(task: ActionPlanTask): string {
  if (task.phone) return task.phone;
  if (!task.link) return "";
  if (task.link.startsWith("/")) return `${new URL(SITE.url).host}${task.link}`;
  try {
    const u = new URL(task.link);
    const path = u.pathname.replace(/\/$/, "");
    const short = `${u.host.replace(/^www\./, "")}${path}`;
    return short.length > 42 ? u.host.replace(/^www\./, "") : short;
  } catch {
    return "";
  }
}

export function planProgress(intake: IntakeFormData, statuses: Record<string, string>) {
  const tasks = generateActionPlan(intake).filter((t) => statuses[t.id] !== "not-needed");
  const left = tasks.filter((t) => statuses[t.id] !== "completed");
  return { tasks, left, done: tasks.length - left.length };
}

/** A short checklist for WhatsApp or a text message. */
export function planMessage(intake: IntakeFormData, statuses: Record<string, string>, url: string): string {
  const { tasks, left, done } = planProgress(intake, statuses);
  const name = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim();
  const next = STAGES.map((s) => left.filter((t) => t.priority === s.priority)).find((l) => l.length) ?? [];
  const lines = [
    `AfterCare plan for ${name}: ${done} of ${tasks.length} done`,
    "",
    next.length ? "Still to do next:" : "Everything on the plan is done.",
    ...next.slice(0, 8).map((t) => `☐ ${t.title}`),
    "",
    `Full plan: ${url}`,
  ];
  return lines.join("\n");
}

export function PlanDocument({
  intake,
  statuses,
  planUrl,
}: {
  intake: IntakeFormData;
  statuses: Record<string, string>;
  /** Where the QR code leads: the saved plan, or AfterCare's start page. */
  planUrl: string;
}) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toString(planUrl, { type: "svg", margin: 0, color: { dark: "#182a26", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [planUrl]);

  const { tasks, left, done } = planProgress(intake, statuses);
  const name = `${intake.deceasedFirstName} ${intake.deceasedLastName}`.trim() || "your loved one";
  const child = isChildPlan(intake);
  const printed = formatDate(new Date().toISOString().slice(0, 10));
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const contacts = child
    ? ["Funeral director", "Register office", "Hospital bereavement team", "GP surgery", "School or nursery", "Employer"]
    : ["Funeral director", "Register office", "Solicitor", "Bank", "GP surgery", "Employer"];

  return (
    <div className="plan-doc">
      {/* ── Cover ── */}
      <section className="doc-page doc-cover">
        <div className="doc-glow" aria-hidden="true" />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[10px] bg-ink-700 flex items-center justify-center">
              <Mark className="h-6 w-6" />
            </span>
            <span className="font-display text-xl font-semibold">AfterCare</span>
          </div>
          <h1 className="doc-title">
            A plan for
            <br />
            <i>{name}</i>
          </h1>
          <dl className="doc-facts">
            {intake.dateOfDeath && (
              <div>
                <dt>Died</dt>
                <dd>{formatDate(intake.dateOfDeath)}</dd>
              </div>
            )}
            <div>
              <dt>Printed</dt>
              <dd>{printed}</dd>
            </div>
          </dl>
          <div className="doc-progress">
            <p>
              <b>
                {done} of {tasks.length}
              </b>{" "}
              tasks done
            </p>
            <div className="doc-bar">
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
          <p className="doc-intro">
            There is a lot to sort out. This plan puts it in order, so you can take one step at a time. Tick things
            off as you go, and share it with anyone helping you.
          </p>
        </div>
        <div className="doc-tips">
          <div>
            <b>Start with the first step</b>The first few days have deadlines. Everything else can wait.
          </div>
          <div>
            <b>Share the load</b>Write who is doing what next to each step.
          </div>
          <div>
            <b>Keep contacts together</b>Use the page at the back for names and numbers.
          </div>
        </div>
        <div className="doc-qr">
          {qr && <div className="doc-qr-code" dangerouslySetInnerHTML={{ __html: qr }} />}
          <div>
            <b>Open this plan on your phone</b>
            <p>Scan the code to see the latest version, with links and guides.</p>
          </div>
        </div>
        <footer className="doc-foot">
          <span>{new URL(SITE.url).host}</span>
          <span>Guidance only, not legal or financial advice</span>
        </footer>
      </section>

      {/* ── Steps left ── */}
      <section className="doc-page doc-flow">
        <h2 className="doc-h2">Steps left</h2>
        <p className="doc-sub">{left.length ? "Tick each one when it is done." : "Every step on this plan is done."}</p>
        {STAGES.map((s) => {
          const steps = left.filter((t) => t.priority === s.priority);
          if (!steps.length) return null;
          return (
            <div key={s.priority} className="doc-stage">
              <h3>{s.title}</h3>
              {steps.map((t) => (
                <div key={t.id} className="doc-step">
                  <span className="doc-box" aria-hidden="true" />
                  <span className="doc-step-title">{t.title}</span>
                  <span className="doc-ref">{shortRef(t)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      {/* ── Contacts and help ── */}
      <section className="doc-page doc-flow">
        <h2 className="doc-h2">Key contacts</h2>
        <table className="doc-contacts">
          <thead>
            <tr>
              <th scope="col">Who</th>
              <th scope="col">Name</th>
              <th scope="col">Phone or email</th>
            </tr>
          </thead>
          <tbody>
            {[...contacts, "Other"].map((c) => (
              <tr key={c}>
                <td>{c}</td>
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
        <div className="doc-help">
          <h3>Help if you need it</h3>
          <div>
            <b>NHS 111</b>Urgent help, including your mental health. Choose option 2.
          </div>
          <div>
            <b>999</b>If someone is in danger.
          </div>
          <div>
            <b>Samaritans 116 123</b>Free, any time, day or night.
          </div>
          <div>
            {child ? (
              <>
                <b>Child Bereavement UK 0800 02 888 40</b>Support after the death of a child.
              </>
            ) : (
              <>
                <b>Cruse 0808 808 1677</b>Bereavement support.
              </>
            )}
          </div>
        </div>
        <div className="doc-notes">
          <h3>Notes</h3>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
