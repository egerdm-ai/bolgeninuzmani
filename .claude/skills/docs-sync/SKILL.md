---
name: docs-sync
description: Keep Company Brain docs current. Use whenever a slice changes schema, routes, flows, scope, or a decision — update the affected docs/ file in the same slice.
allowed-tools: Read, Edit, Write, Grep, Glob
---

# Docs Sync

## Steps
1. Identify affected docs (schema, RLS, routes, flows, scope, DECISIONS_LOCKED).
2. Update concisely in the same slice.
3. If a decision changed, update DECISIONS_LOCKED.md with the date.
4. Include the doc change in the same commit.

## Guardrails
Keep docs concise; link, don't copy code. No behavior change ships without a
matching doc update.
