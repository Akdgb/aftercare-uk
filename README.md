# AfterCare UK

Practical, compassionate help for UK families after someone dies. Answer a few
questions and AfterCare builds a personalised, prioritised task plan — registering
the death, funerals, Tell Us Once, probate, benefits, housing — that you can work
through alone or share with family.

## Features

- **Personalised action plan** — tasks tailored to where the person died, your
  relationship, housing, faith and finances, grouped by urgency.
- **Use it without an account** — the plan works straight away and is kept in the
  browser. Save it to an account (passwordless email sign-in) to open it anywhere.
- **Family workspace** — invite family by email; everyone can tick off tasks, say
  who's doing what, and leave notes on tasks.
- **Gentle reminders** — at most one email a week while urgent tasks are open
  (first 90 days), with one-click unsubscribe.
- **Print / save as PDF** of the plan.
- **Guidance library**, **funeral cost estimator**, **financial support checker**,
  **local services finder** (postcodes.io + OpenStreetMap) and an **AI assistant**.
- **Privacy controls** — delete a plan or your whole account from the dashboard;
  plans are purged automatically after 3 years.

## Tech

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Postgres via
`@vercel/postgres` (Neon) · Resend for email · OpenAI for the assistant ·
`jose` signed-cookie sessions · Vitest.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in at least SESSION_SECRET and POSTGRES_URL
npm run db:migrate           # creates/updates tables (safe to re-run)
npm run dev
```

Without `RESEND_API_KEY`, emails (including sign-in links) are printed to the
server console, so you can sign in locally by copying the link from there.
Without `OPENAI_API_KEY`, the assistant falls back to built-in answers for
common questions.

`@vercel/postgres` talks to Neon over WebSockets, so `POSTGRES_URL` should point at
a Neon / Vercel Postgres database (a free Neon branch works well for development).

### Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

CI runs all four on every pull request (`.github/workflows/ci.yml`).

## Deploying to Vercel

1. Import the repo into Vercel.
2. **Storage → Create → Postgres (Neon)** and connect it to the project — this adds
   `POSTGRES_URL`.
3. Add the other environment variables from `.env.example`
   (`SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`,
   `OPENAI_API_KEY`, `CRON_SECRET`).
4. Verify your sending domain in Resend and use it in `EMAIL_FROM`.
5. Run the schema once: `vercel env pull .env.local`, then
   `npm run db:migrate` (or paste `db/schema.sql` into the database's Query tab).
6. Deploy. `vercel.json` schedules `/api/cron/reminders` daily at 09:00 UTC; it
   sends reminders and enforces data retention.

## How it fits together

| Area | Where |
| --- | --- |
| Task generation | `lib/action-plan.ts` — stable task IDs; `normaliseTaskKeys` migrates progress saved under the old numeric IDs |
| Data access | `lib/db.ts` — every plan read goes through `getPlanForUser` (owner or invited member) |
| Auth | `lib/session.ts`, `lib/auth-db.ts`, `proxy.ts` (guards `/dashboard` and `/plan/<id>`) |
| Plan UI | `components/plan/plan-view.tsx`, shared by `/plan` (local) and `/plan/[id]` (saved, with family) |
| Emails | `lib/email.ts`, `lib/email-templates.ts` |
| Schema | `db/schema.sql` (idempotent) |

## Disclaimer

AfterCare provides general guidance, not legal or financial advice. Content
should be reviewed periodically against GOV.UK as fees and rules change.
