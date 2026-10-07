import { escapeHtml } from "@/lib/security";

interface Email {
  subject: string;
  html: string;
  text: string;
}

function layout(body: string, footerExtra = ""): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
        <tr>
          <td style="background:#334155;padding:28px 36px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">AfterCare</p>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Bereavement guidance &amp; support</p>
          </td>
        </tr>
        <tr><td style="padding:36px;">${body}</td></tr>
        <tr>
          <td style="background:#f5f5f4;border-top:1px solid #e7e5e4;padding:20px 36px;">
            <p style="margin:0;color:#a8a29e;font-size:12px;line-height:1.6;">
              AfterCare UK: bereavement guidance for UK families.<br>
              The information in this email is for guidance only and does not constitute legal or financial advice.
              ${footerExtra}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr><td align="center">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:#334155;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">${escapeHtml(label)}</a>
  </td></tr>
</table>`;
}

const h = (text: string) =>
  `<p style="margin:0 0 16px;color:#1c1917;font-size:18px;font-weight:600;">${text}</p>`;
const p = (text: string) =>
  `<p style="margin:0 0 20px;color:#57534e;font-size:15px;line-height:1.6;">${text}</p>`;
const small = (text: string) =>
  `<p style="margin:0;color:#a8a29e;font-size:12px;line-height:1.6;">${text}</p>`;

export function magicLinkEmail(link: string): Email {
  return {
    subject: "Sign in to AfterCare",
    html: layout(
      h("Sign in to AfterCare") +
        p("Click the button below to sign in. This link expires in 20 minutes and can only be used once.") +
        button(link, "Sign in to AfterCare →") +
        small("If you did not request this, you can safely ignore this email.")
    ),
    text: `Sign in to AfterCare: ${link}\n\nThis link expires in 20 minutes. If you did not request it, ignore this email.`,
  };
}

export function planConfirmationEmail(deceasedName: string, planUrl: string, urgentCount: number): Email {
  const name = escapeHtml(deceasedName);
  const urgent =
    urgentCount > 0
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin:0 0 24px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600;">
              You have ${urgentCount} urgent task${urgentCount > 1 ? "s" : ""} that need attention soon
            </p>
            <p style="margin:6px 0 0;color:#b91c1c;font-size:13px;">
              These include registering the death and contacting a funeral director. Please aim to complete these within the next 1 to 2 days.
            </p>
          </td></tr>
        </table>`
      : "";

  return {
    subject: `Your AfterCare plan for ${deceasedName} is saved`,
    html: layout(
      h("Your plan has been saved") +
        p(`We have saved your AfterCare bereavement plan for <strong>${name}</strong>. You can return to it at any time.`) +
        urgent +
        button(planUrl, "Open My Plan →") +
        small("Your progress saves automatically as you tick off tasks. You can invite family members to help from inside the plan.")
    ),
    text: `Your AfterCare plan for ${deceasedName} is saved.\n\nOpen it: ${planUrl}\n\nUrgent tasks remaining: ${urgentCount}`,
  };
}

export function reminderEmail(
  deceasedName: string,
  planUrl: string,
  pendingTasks: string[],
  daysSince: number,
  unsubscribeUrl: string
): Email {
  const list = pendingTasks
    .slice(0, 5)
    .map((t) => `<li style="margin:0 0 8px;color:#44403c;font-size:14px;">${escapeHtml(t)}</li>`)
    .join("");
  const more =
    pendingTasks.length > 5
      ? `<p style="margin:-16px 0 24px;color:#78716c;font-size:13px;">…and ${pendingTasks.length - 5} more</p>`
      : "";

  return {
    subject: `A gentle reminder: ${pendingTasks.length} task${pendingTasks.length > 1 ? "s" : ""} still to do`,
    html: layout(
      h("A gentle reminder about your plan") +
        p(
          `It has been ${daysSince} day${daysSince !== 1 ? "s" : ""} since you created your AfterCare plan for <strong>${escapeHtml(
            deceasedName
          )}</strong>. These tasks are still open. There is no rush, but some have legal deadlines:`
        ) +
        `<ul style="margin:0 0 24px;padding-left:20px;">${list}</ul>${more}` +
        button(planUrl, "Continue My Plan →"),
      `<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:#a8a29e;">Stop reminder emails</a>`
    ),
    text: `Tasks still open on your AfterCare plan for ${deceasedName}:\n- ${pendingTasks.join(
      "\n- "
    )}\n\nContinue: ${planUrl}\n\nStop reminders: ${unsubscribeUrl}`,
  };
}

export function inviteEmail(inviterEmail: string, inviteeName: string, deceasedName: string, signInUrl: string): Email {
  return {
    subject: `You've been invited to help with arrangements for ${deceasedName}`,
    html: layout(
      h(`Hello ${escapeHtml(inviteeName)},`) +
        p(
          `<strong>${escapeHtml(inviterEmail)}</strong> has invited you to help with the AfterCare plan for <strong>${escapeHtml(
            deceasedName
          )}</strong>. You'll be able to see the task list, tick off tasks, take on tasks and leave notes for the family.`
        ) +
        button(signInUrl, "Open the plan →") +
        small("You'll be asked to confirm your email address. No password is needed. If you weren't expecting this, you can ignore this email.")
    ),
    text: `${inviterEmail} has invited you to help with the AfterCare plan for ${deceasedName}.\n\nOpen the plan: ${signInUrl}`,
  };
}
