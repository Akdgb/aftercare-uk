export function planConfirmationEmail(
  deceasedName: string,
  planUrl: string,
  urgentCount: number
): { subject: string; html: string } {
  return {
    subject: `Your AfterCare plan is saved — ${deceasedName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#334155;padding:28px 36px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">AfterCare</p>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Bereavement guidance & support</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 16px;color:#1c1917;font-size:18px;font-weight:600;">Your plan has been saved</p>
            <p style="margin:0 0 20px;color:#57534e;font-size:15px;line-height:1.6;">
              We have saved your AfterCare bereavement plan for <strong>${deceasedName}</strong>.
              You can return to your plan at any time using the button below.
            </p>

            ${urgentCount > 0 ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;margin:0 0 24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0;color:#991b1b;font-size:14px;font-weight:600;">
                  ⚠ You have ${urgentCount} urgent task${urgentCount > 1 ? "s" : ""} that need attention soon
                </p>
                <p style="margin:6px 0 0;color:#b91c1c;font-size:13px;">
                  These include registering the death and contacting a funeral director. Please aim to complete these within the next 1–2 days.
                </p>
              </td></tr>
            </table>
            ` : ""}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td align="center">
                  <a href="${planUrl}" style="display:inline-block;background:#334155;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
                    Open My Plan →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#78716c;font-size:13px;">Or copy this link into your browser:</p>
            <p style="margin:0 0 24px;background:#f5f5f4;border-radius:8px;padding:10px 14px;color:#44403c;font-size:12px;font-family:monospace;word-break:break-all;">${planUrl}</p>

            <p style="margin:0;color:#a8a29e;font-size:12px;line-height:1.6;">
              Bookmark this link or keep this email so you can return to your plan at any time.
              Your progress saves automatically as you tick off tasks.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f4;border-top:1px solid #e7e5e4;padding:20px 36px;">
            <p style="margin:0;color:#a8a29e;font-size:12px;line-height:1.6;">
              AfterCare UK — Bereavement guidance for UK families.<br>
              The information in this email is for guidance only and does not constitute legal or financial advice.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export function reminderEmail(
  deceasedName: string,
  planUrl: string,
  urgentTasks: string[],
  daysSince: number
): { subject: string; html: string } {
  const taskListHtml = urgentTasks
    .slice(0, 5)
    .map((t) => `<li style="margin:0 0 8px;color:#44403c;font-size:14px;">${t}</li>`)
    .join("");

  return {
    subject: `Reminder: ${urgentTasks.length} urgent task${urgentTasks.length > 1 ? "s" : ""} still to complete — AfterCare`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7e5e4;overflow:hidden;">
        <tr>
          <td style="background:#334155;padding:28px 36px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">AfterCare</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <p style="margin:0 0 16px;color:#1c1917;font-size:17px;font-weight:600;">
              A gentle reminder about your plan
            </p>
            <p style="margin:0 0 20px;color:#57534e;font-size:15px;line-height:1.6;">
              It has been ${daysSince} day${daysSince !== 1 ? "s" : ""} since you created your AfterCare plan for <strong>${deceasedName}</strong>.
              These tasks still need to be completed:
            </p>
            <ul style="margin:0 0 24px;padding-left:20px;">
              ${taskListHtml}
            </ul>
            ${urgentTasks.length > 5 ? `<p style="margin:-16px 0 24px;color:#78716c;font-size:13px;">...and ${urgentTasks.length - 5} more</p>` : ""}
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${planUrl}" style="display:inline-block;background:#334155;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
                  Continue My Plan →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f5f5f4;border-top:1px solid #e7e5e4;padding:20px 36px;">
            <p style="margin:0;color:#a8a29e;font-size:12px;">
              AfterCare UK — guidance only, not legal advice.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
