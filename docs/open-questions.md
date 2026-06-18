# Open Questions — Bölgenin Uzmanı (audit output)

> Decisions that need a human before/while building. Resolved items belong in
> `docs/DECISIONS_LOCKED.md`. Raised during the Claude audit (2026-06-18).

## Blocking the first backend slice

1. **Audit approval gate.** Do you approve this audit so backend work can begin?
   Per `CLAUDE.md`, nothing is written/migrated until `.claude/AUDIT_APPROVED`
   exists. Create it to unblock Slice 1.

2. **Supabase project target.** Which Supabase project/org should dev/staging use?
   The MCP is connected — confirm the project so M1 (auth+profiles+roles) can be
   drafted to `supabase/migrations/`. (D1 says own Supabase, free now.)

3. **Invite / onboarding mechanics for MVP.** D11 says manual/admin-driven. For
   Slice 1: do we build email/password sign-in for admin-created agents, magic
   link, or invite-token? Landing apply form → which table + who gets notified?

## Naming / brand

4. **Assistant name.** "VAULT Asistan" must be rebranded. Is it **"Bölgenin Uzmanı
   Asistan"**, just **"Asistan"**, or another name? (Blocks the brand sweep
   wording, R0.3. AI is Later phase regardless.)

5. **Public share domain.** Mock copy uses `vault.app`. What is the real domain for
   `/p/$slug` customer links (e.g. `bolgeninuzmani.app`, a `.com.tr`, Vercel
   subdomain)? Needed for share copy + OG tags.

6. **`components/vault/` folder rename?** Internal only (not user-visible). Rename
   to `components/portfolio`/`components/app`, or leave as-is to avoid churn?
   Recommendation: leave for now; low value, high diff.

## Structure / scope

7. **Duplicate AI routes.** OK to consolidate `dashboard/concierge` into
   `dashboard/assistant` and retire `concierge`? Route removal needs your approval
   (gate). `ai-import` kept separate. (All Later phase.)

8. **Portfolio edit route.** Confirm we add `/dashboard/portfolios/$id/edit`
   (the missing CRUD "U") in the Portföy CRUD slice and wire the existing
   "Düzenle" button.

## Data model gaps

9. **Locked field set in the model.** Confirm the schema adds `exact_lat`,
   `exact_lng`, `malik_info` (name + contact), `private_description`,
   `private_notes` as **locked** columns (they're absent from the mock today).
   Also confirm the create-wizard should collect them.

10. **Membership tier vs role.** Mock `membershipTier` (standard/pro/elite) and
    `membershipBadge` (Elite/Pro/Private Beta) are **billing/display**, distinct
    from auth roles (admin/agent via `user_roles`). Confirm tiers are display-only
    for MVP and carry no access logic (D9 + Invariant #3).

11. **Customer link auth boundary.** Confirm: a customer on `/p/$slug` who taps
    "Detay Talebi" is routed to login/signup (D5, member-only requests), and the
    teaser shows the **agent's own** contact (D8) but never `malik_info`.

## Process

12. **Jira project key.** `jira-sync` expects a key per slice. What is the Jira
    project key, and is the Atlassian MCP connected? (Not connected/observed in
    this session.)

13. **Screenshots / QA baseline.** Should I run the dev server + `qa` agent to
    capture the route-screenshot baseline (`docs/23_SCREENSHOT_CAPTURE_PLAN.md`)
    now, or after the brand sweep so screenshots reflect correct branding?
