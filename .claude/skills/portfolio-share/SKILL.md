---
name: portfolio-share
description: Share a portfolio with a customer via a public link + WhatsApp message (Share Studio, simplified for MVP). Public link shows the teaser only. Use for the share flow, public portfolio page, WhatsApp/link generation.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Portföy Paylaşımı (link + WhatsApp)

## Purpose
Turn a portfolio into a customer-facing link an agent sends on WhatsApp. Public
view = teaser only; customers are not members and have no unlock path.

## Steps
1. Public route `/p/$slug` (no auth) → renders the TEASER (public columns) only.
2. WhatsApp: prebuilt message (title, price, key specs, link) + `wa.me` deep
   link + "Linki Kopyala". OG tags for rich previews.
3. Public page shows the agent's contact (so the customer reaches the agent).
4. A non-logged-in viewer who taps "Detay Talebi" is routed to login/signup
   (only members can request).

## Acceptance criteria
- `/p/$slug` works logged-out and shows ONLY public columns.
- Locked fields/documents never appear on `/p/$slug`.
- WhatsApp message + link open correctly on mobile.

## Guardrails
- Re-check the public projection at render time. PDF/QR/analytics = later phase.
