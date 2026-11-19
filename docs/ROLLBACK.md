# Going back to the last good version

Before every merge, the commit that is live is recorded below, so there is always a known good version to return to.

## Fastest: Vercel Instant Rollback (about 1 minute, no code change)
1. Vercel, aftercare-uk, **Deployments**.
2. Find the previous deployment marked **Production** (the one before the bad change).
3. Tap **... then Instant Rollback** (or **Promote to Production**).
The site switches back within seconds. Then tell Claude, so the code can be fixed properly.

Rolling back the website does not undo database changes. So far, database changes only add columns, so older versions keep working with them.

## Permanent: revert the code
Ask Claude: "revert to <commit> from ROLLBACK.md". Claude opens a pull request restoring that version, which goes live on "merge it".

## Live versions before each merge
| Date | Live commit before the merge | Change being merged |
|---|---|---|
| 19 November 2026 | c53943a | Saving the plan from the sign-in email in any browser; calmer share message |
| 19 November 2026 | 63535ea | Age group wording; one-email family invitations; account deletion confirmation email |
