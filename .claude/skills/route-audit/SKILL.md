---
name: route-audit
description: Inventory and verify all routes, CTAs, links and interactions; find dead buttons, missing routes, terminology drift. Use during the initial audit and after UI changes. Read-only.
allowed-tools: Read, Bash, Grep, Glob
---

# Route / Button Audit

## Steps
1. Enumerate routes from the router/file-based routes.
2. Per screen: list CTAs/links and where they go (or don't).
3. Flag dead buttons, missing routes, mislabeled actions, brand/term drift
   (any leftover "VAULT" → Bölgenin Uzmanı; "Portföy" vs "Portföy" per decisions).
4. Capture Playwright route screenshots as a baseline.

## Output
`docs/route-inventory.md`, dead-button list, label issues, screenshots.

## Guardrails
Read-only. Report only; do not fix during audit. Do not remove routes.
