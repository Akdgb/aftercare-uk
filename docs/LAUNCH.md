# AfterCare launch checklist: live on Friday 20 November 2026

Tick a box only when the thing is done and checked. [ ] = to do, [x] = done.

## Tuesday 17 November
**Claude**
- [ ] Build "Save or share as PDF" (cover with progress bar, steps left only, contacts page)
- [ ] Add "Send as a message" for WhatsApp
- [ ] Send owner a real PDF from a test plan

**Owner**
- [ ] Buy the domain (for example aftercare-uk.co.uk, about £10 a year from Cloudflare or Namecheap)
- [ ] Vercel → aftercare-uk project → Settings → Domains → add the domain, then follow its DNS instructions
- [ ] Decide the name for the privacy policy: your full name, or your company name

## Wednesday 18 November: email
**Owner**
- [ ] Make a free Resend account (resend.com), add the domain, copy its DNS records into your domain settings, wait for "Verified"
- [ ] In Resend, create an API key and copy it (do not paste it in chat)
- [ ] Set up free email forwarding so hello@ and privacy@ your domain reach your own inbox (Cloudflare Email Routing or ImprovMX)
- [ ] Pay the ICO data protection fee at ico.org.uk (about £52 a year) and note the registration number
- [ ] Vercel → Settings → Environment Variables, add (Production), then Redeploy:
  - NEXT_PUBLIC_APP_URL = https://your-domain
  - RESEND_API_KEY = the key from Resend
  - EMAIL_FROM = AfterCare <no-reply@your-domain>
  - NEXT_PUBLIC_CONTACT_EMAIL = hello@your-domain
  - NEXT_PUBLIC_PRIVACY_EMAIL = privacy@your-domain
  - NEXT_PUBLIC_OPERATOR_NAME = your name or company
  - NEXT_PUBLIC_ICO_NUMBER = your ICO number
- [ ] Check these already exist in Vercel: SESSION_SECRET, DATABASE_URL, CRON_SECRET

**Claude**
- [ ] Merge everything waiting (after owner says "merge it")
- [ ] Update the handover note

## Thursday 19 November: test day
**Owner, on your own phone, with your real email**
- [ ] Make an adult plan, enter your email on "Keep your plan safe", open the email, plan appears
- [ ] Make a child plan; check no adult steps (probate, will, housing)
- [ ] Tick a task, untick it, use "This doesn't apply to us" and Undo
- [ ] Save as PDF and share it to WhatsApp
- [ ] Invite one family member; they open the plan and tick something; you see it
- [ ] Add AfterCare to your home screen and sign in there
- [ ] Ask 2 testers to do the same and send you notes

**Claude**
- [ ] Fix anything found the same day

## Friday 20 November: go live
- [ ] Final check of the live site on a phone (Claude and owner)
- [ ] Owner: share the link
