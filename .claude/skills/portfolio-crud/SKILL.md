---
name: portfolio-crud
description: Portföy create / edit / list / detail, wired to Supabase, with teaser-vs-locked field separation. Use for the create wizard, "Portföylerim", portfolio detail, and portfolio data flows. Replaces mock data incrementally.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Portföy CRUD

## Purpose
Agents create and manage portfolios. Move from mock state to Supabase, one slice
at a time, without breaking the UI or leaking locked fields.

## Data
- `portfolios`: owner_id, category, subcategory, transaction_type, title,
  public_description, price, currency, gross_m2, net_m2, land_m2, room_count,
  features[], status (draft/active/passive/sold), city, district, neighborhood,
  approx_lat, approx_lng, slug,
  **LOCKED:** exact_address, exact_lat, exact_lng, private_description,
  malik_info (owner/malik + contact), private_notes.
- `portfolio_images`: portfolio_id, path, order, is_cover.
- `portfolio_documents` (locked): portfolio_id, path (private bucket), kind (tapu/pdf...).

## Steps
1. Inspect current mock data + components.
2. Migration: `portfolios` + images + documents + RLS:
   - owner: full CRUD on own.
   - other logged-in agents: read PUBLIC columns of `active` portfolios (teaser).
   - public/anon: read PUBLIC columns of `active` portfolios (shared link).
   - LOCKED columns/documents: owner OR active grant only (see access-request).
3. Typed data-access layer; teaser/public queries select PUBLIC columns ONLY.
4. Replace mock reads then writes incrementally. Empty/loading/error states.

## Acceptance criteria
- Teaser/public/anon queries never return LOCKED columns. Verify the payload.
- Owner full; other agents teaser; create wizard saves draft; publish → active.

## Guardrails
- No `select *` in client-reachable code. Locked columns excluded from teaser path.
