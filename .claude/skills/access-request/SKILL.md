---
name: access-request
description: The controlled-access heart — Detay Talebi (detail request) + approve/reject + portfolio_access_grants + the RLS that unlocks locked fields for an agent. Use for anything touching locked-field access, the request inbox, or grants.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Detay Talebi & Erişim İzni (controlled access)

## Purpose
The product's core. An agent requests locked details of another agent's
portfolio; the owner approves; a durable grant unlocks the locked fields. RLS
reads the grant — never the request status — to decide visibility.

## Data
- `detail_requests`: portfolio_id, requester_id (NOT NULL → profiles; member-only),
  owner_id, message, status (new/reviewed/approved/rejected), timestamps.
- `portfolio_access_grants`: portfolio_id, grantee_id, granted_by, request_id,
  created_at, expires_at (NULL = permanent).

## Steps
1. Migrations for both tables.
2. `has_portfolio_access(portfolio_id, uid)` security-definer: true if owner OR
   an active (non-expired) grant exists.
3. RLS:
   - detail_requests: visible to requester + owner only.
   - locked columns/documents: readable when `has_portfolio_access(...)`.
4. Flows: send request (auth required) → owner inbox → approve (insert grant,
   BULK = all locked fields, permanent) / reject (status only).
5. Signed URLs for locked documents issued only when access check passes.
6. In-app notifications on new request / approval (MVP).

## Acceptance criteria
- Customer (anon) and non-granted agents: locked fields masked, docs inaccessible.
- After approval: requester sees ALL locked fields (bulk) + valid signed URLs.
- Non-member cannot create a request. Approval is the ONLY path that creates a grant.
- RLS decides on grants, never on detail_requests.status.

## Guardrails
- Bulk + permanent grants (expires_at NULL). Signed URLs short-lived.
- Never expose locked data via teaser/public/customer paths.
