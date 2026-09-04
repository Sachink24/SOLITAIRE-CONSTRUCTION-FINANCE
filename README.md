# Construction Finance Website — Solitaire Finz Mart

## What this is
A standalone public marketing site (Diamond Noir theme, matching your existing brand) for the
Construction Finance product line: hero, benefits, 10-step process, eligibility calculator,
required documents, financing solutions, lender partners, success stories, FAQ, an "Apply Now"
form, and a callback form. Legal pages: Privacy Policy, Terms & Conditions, Disclaimer, Grievance.

## Backend that's already live
- Supabase project: `nbpvamrwzqrgoiwpadwc` (your existing SOLITAIRE project — no new project created)
- New table: `public.website_enquiries`
  - RLS enabled: anyone (anon) can INSERT, only staff roles
    (`super_admin`, `admin`, `dsa`, `operations`, `business_associate`) can SELECT/UPDATE
  - This is deliberately separate from your internal `leads` table — it's a public intake
    buffer. Your team reviews and manually (or later, automatically) converts a qualified
    `website_enquiries` row into a proper `leads` record.
- The anon key used in `assets/app.js` is your public anon key — safe to expose in frontend
  code, since RLS is what actually restricts access, not the key's secrecy.

## How to add this to your associate-app repo
1. Copy the whole `construction-finance-website/` folder into your
   `sachink24/associate-app` repository, e.g. as a top-level folder named `construction-finance/`.
2. Commit and push — GitHub Pages will serve it at:
   `https://sachink24.github.io/associate-app/construction-finance/`
3. Optional: if you want it at your own domain (e.g. `solitairefinzmart.com`) or as the
   *root* site instead of a subfolder, either:
   - Point a custom domain's CNAME at GitHub Pages and set `construction-finance/index.html`
     as the root, or
   - Move the folder contents to the repo root of a dedicated repo.

## Reviewing submitted enquiries
Until you build a UI panel for it, you can view submissions directly in the Supabase dashboard
(Table Editor → `website_enquiries`), or I can build a simple "Website Enquiries" screen inside
your Admin Panel that lists these and lets staff convert one into a `leads` record with one click
— just ask.

## Things to personalize before going live
- Replace placeholder phone number (`+91 00000 00000`) and email
  (`contact@solitairefinzmart.example`) throughout `index.html` and the legal pages, and in the
  WhatsApp links (`wa.me/910000000000`).
- Review the compliance/disclaimer text in the footer and `disclaimer.html` — it's written to
  avoid guaranteeing approval/rate/amount per standard DSA compliance practice, but you may want
  your own review.
- The eligibility calculator uses a simple indicative heuristic (55–70% of project cost as a
  funding range, 25% minimum promoter contribution) — tell me if you'd like different assumptions.
- Swap the "Success Stories" placeholder quotes for real (anonymized or named-with-consent)
  client testimonials when you have them.

## Not yet included from the original brief
This delivers the **public website only** (section 3–9, 51–54 of your spec). The full internal
operating system — CRM, credit/legal/technical workflow engine, sanction & disbursement tracking,
commission module, SLA/TAT engine, RBAC-gated dashboards — already exists in large part across
your `associate-app`, `SOLITAIRE-Admin-Panel`, and `SOLITAIRE-Legal-Technical-Credit` repos. Let me
know which specific gaps from the spec (e.g. CP/conditions-precedent tracking, disbursement
tranches, OCR on documents) you want added next, and we'll tackle them one module at a time.
