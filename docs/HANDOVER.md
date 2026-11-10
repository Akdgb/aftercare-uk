# AfterCare UK: handover for the next session

AfterCare UK is a free bereavement checklist for the UK. Someone answers a few questions after a death and gets a
step-by-step plan, with a wellbeing space for the weeks after. Next.js 16 (App Router, Turbopack, `proxy.ts`),
React 19, Tailwind v4 `@theme` tokens, Postgres (postgres.js), jose sessions, Resend, Vitest, Playwright. Hosted on
Vercel (lhr1). Read `AGENTS.md` first: this Next.js version differs from older docs.

## Owner's standing rules

- Merge only when the owner says "merge it".
- Show findings or a plan and wait for approval before changing code.
- Plain, professional GOV.UK-style English. No em dashes. No slang.
- NHS first, charities second. Charities appear only as phone numbers on the support page, never as live links.
- No AI assistant, no in-house maps or postcode search. Link to GOV.UK, mygov.scot and nidirect instead.
- Keep it simple for bereaved people. No flashy fonts. It must not look like AI-generated "slop".
- Accounts are for people aged 16 or over (`components/auth/age-question.tsx`, `app/api/auth/magic-link/route.ts`).
- Faith and cultural background are special category data and need consent (`faithConsent`).

## Where things stand

- PR #9 (branch `claude/modest-lamport-pof0tq`) is open and green. It holds the "Calmer, cleaner look" restyle, the
  Impeccable skill, the critique fixes (inline errors, Undo, remembered "Not yet", shorter setup, calm Help list) and
  the 16+ age limit.
- The owner does NOT like the restyle in commit `bf8f1d9` ("Calmer, cleaner look"). It replaced their headline,
  fonts, warm background and soft glow, and looks flatter. Keep the usability fixes from later commits.

## Next task: new design direction

The owner chose a **new design direction**, guided by a real-world design plugin rather than generic taste.

1. Install the **Website Design** plugin (UXKIN) from the Anthropic directory. Also useful: **audit-suite**
   (Emil Kowalski's design engineering and web animation guides) and **UI Design Review**.
2. Pick a direction from real, well-made websites in the same space (calm, trustworthy public-service or health
   products). Write it down as `DESIGN.md` and show the owner before building.
3. Start page headline: keep **"We'll help you with what comes next."** and make the line under it say plainly
   that this is for after someone dies. The old start page is in `git show bf8f1d9^:app/page.tsx`.
4. Add gentle, purposeful animation: buttons that press in, smooth movement between questions, a satisfying tick
   when a task is done, "Up next" moving to the next card. Respect `prefers-reduced-motion`.
5. Send before-and-after screenshots at phone size and wait for approval.

## Local setup in a fresh container

```sh
npm ci
pg_ctlcluster 16 main start
# role/databases if missing: user and password "aftercare", databases "aftercare" and "aftercare_test"
TEST_DATABASE_URL=postgres://aftercare:aftercare@localhost:5432/aftercare_test npx vitest run   # 56 tests
npm run build && PORT=3100 npx next start
```

Keep test scripts and screenshots outside the repo (for example `/tmp`), so they are never committed.

## The owner's own to-dos (not code)

Buy a domain and set `NEXT_PUBLIC_APP_URL` with https; set up Resend DNS; pay the ICO fee and add their name or
company to the privacy policy; set `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_PRIVACY_EMAIL`; check the Neon
region; move to Vercel Pro once commercial.
