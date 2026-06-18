# DECISIONS_LOCKED.md — Bölgenin Uzmanı

Source of truth for resolved founder decisions. Engineering follows these.
_Owner: Ege Erdem (technical founder)._

---

## Brand & naming
- **D0 — Brand: Bölgenin Uzmanı** (was "VAULT"; retire VAULT everywhere).
  Technical/repo/folder: `bolgeninuzmani`. GitHub remote may stay `emsalsiz`.
- **D-term — Product term is "Portföy"**, NOT "İlan". İlan is never a product term.

## The heart — controlled access (IN the MVP)
- **D-core — Controlled access is the product's heart and is built in MVP:**
  locked fields → Detay Talebi → owner approval → `portfolio_access_grants` →
  unlock. Not deferred.
- **D6 — Grant scope = bulk** (all locked fields unlock together).
- **D7 — Grant lifetime = permanent** (`expires_at` NULL; revoke is later).
- **D5 — Requests are member-only** (`requester_id` NOT NULL → profiles). A
  non-logged-in customer who taps "Detay Talebi" is routed to login/signup.
- RLS decides locked visibility on **grants** (`has_portfolio_access`), never on
  `detail_requests.status`.

## Access layers & views
- **D-views — Three view modes:** owner (full) · other logged-in agent (teaser +
  request path) · customer via shared link (PUBLIC teaser only, no unlock path).
- **D-customer — Customer shared view:** mostly open; HIDDEN = exact address +
  exact pin, tapu/documents/PDF, malik_info, private_description, private_notes.
  Visible = photos, price, type, rooms, m², features, approx location, and the
  **agent's contact**.
- **D8 — Agent's own contact is OPEN everywhere** (phone/email/WhatsApp). This is
  how customers reach the agent via the shared link. (Distinct from malik_info,
  which is locked.)

## Locked field set
exact_address, exact_lat/exact_lng, tapu/documents/PDF, malik_info,
private_description, private_notes.

## Roles & admin
- **D9 — Roles via `user_roles` table** + `has_role()` security-definer. Never a
  `profiles` column. Roles: `admin`, `agent`.
- **D10 — Founders are admin** (Ege + Taylan) with monitoring dashboards. Agents
  manage only their own profile + portfolios.

## Infra & go-to-market
- **D1 — Own Supabase.** Free dev/staging now + seeding; upgrade org to **Pro**
  when real beta users arrive (kills 7-day pause, adds backups; one click, no
  data loss).
- **D2 — AI: Anthropic** (later phase). Haiku extraction, Sonnet assistant.
  AI output is a draft; a human publishes; AI respects access control.
- **D3 — Map: MapLibre.** **D4 — Deploy: Vercel; Email: Resend (P1).**
- **D11 — Onboarding manual/admin-driven** at first; founders create/verify
  agents and seed portfolios. Landing form → record + admin email notice.
- **D12 — Pricing:** free private beta; paid after ~40–50 active beta agents.

## Phasing
- **MVP:** auth+profiles+roles · Portföy CRUD (teaser/locked) · detay+WhatsApp
  share · controlled-access engine · Keşfet (search/filter/map).
- **Later:** Arayış · eşleştirme+bildirim · bölge uzmanı dizini · takip · AI
  asistan · Share Studio full (PDF/QR/analytics).

## Carried-over invariants
- Locked fields never leak to teaser/public/customer; masking at RLS/backend.
- Exploration/reads anon/read-only; service role server-side only.
- No UI redesign; preserve the dark-luxury system (now Bölgenin Uzmanı).
