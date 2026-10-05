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

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Postgres via the
dependency-free [`postgres`](https://github.com/porsager/postgres) driver (works
with any Postgres host) · `jose` signed-cookie sessions · Zod · Vitest.
Email (Resend) and the AI assistant (OpenAI) are called over plain HTTPS — no SDKs.

## Run it locally

You need Node.js 20+ and Docker.

```bash
npm install
cp .env.example .env.local     # then set SESSION_SECRET (see the file)
docker compose up -d           # starts a local Postgres
npm run dev                    # http://localhost:3000
```

No email or AI keys are needed locally: sign-in links and other emails are
printed in the terminal running `npm run dev` — copy the link into your browser.
The assistant falls back to built-in answers for common questions.

### Checks

```bash
npm run lint
npm run typecheck
npm test        # add TEST_DATABASE_URL=... to also run the database tests
npm run build
```

`TEST_DATABASE_URL` must point at a **throwaway** database — the tests empty it.
CI runs everything, including the database tests, on every pull request.

## Deploying (Vercel + Neon)

1. Create a free Postgres database at [neon.tech](https://neon.tech) (choose the
   London/EU region) and copy its **pooled** connection string.
2. Import the GitHub repo into [Vercel](https://vercel.com/new).
3. In Vercel → Settings → Environment Variables, add the variables from
   `.env.example`: `DATABASE_URL` (the Neon string, ending in `?sslmode=require`),
   `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, and optionally
   `RESEND_API_KEY` + `EMAIL_FROM` (real emails) and `OPENAI_API_KEY` (AI assistant).
4. Deploy. The app creates and upgrades its own database tables when it starts
   (`instrumentation.ts`); `npm run db:migrate` does the same by hand if you want. `vercel.json` runs `/api/cron/reminders` daily at 09:00 UTC to send
   reminders and delete expired data.

Any other Postgres host (Supabase, Railway, a VPS…) works the same way — only
`DATABASE_URL` changes. If you switch from Neon, update the processor list in
`app/privacy/page.tsx`.

## How it fits together

| Area | Where |
| --- | --- |
| Task generation | `lib/action-plan.ts` — stable task IDs; `normaliseTaskKeys` migrates progress saved under the old numeric IDs |
| Data access | `lib/postgres.ts` (connection), `lib/db.ts` — every plan read goes through `getPlanForUser` (owner or invited member) |
| Auth | `lib/session.ts`, `lib/auth-db.ts`, `proxy.ts` (guards `/dashboard` and `/plan/<id>`) |
| Plan UI | `components/plan/plan-view.tsx`, shared by `/plan` (local) and `/plan/[id]` (saved, with family) |
| Emails | `lib/email.ts`, `lib/email-templates.ts` |
| Schema | `db/schema.mjs` (idempotent; applied automatically on startup) |

## Disclaimer

AfterCare provides general guidance, not legal or financial advice. Content
should be reviewed periodically against GOV.UK as fees and rules change.
