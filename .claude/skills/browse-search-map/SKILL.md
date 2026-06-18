---
name: browse-search-map
description: Browse all portfolios with search, filters, and a MapLibre map (Keşfet screen), for logged-in agents. Teaser-level data only. Use for portfolio discovery, filtering, and map view.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Keşfet — Arama / Filtre / Harita

## Purpose
Logged-in agents browse every portfolio in the network at TEASER level: search,
filters, map.

## Steps
1. List + map split view (as in prototype). Logged-in agents only.
2. Filters: region/city/district, type, price range, rooms, features, status,
   "detay talebi açık", "bölge uzmanından".
3. Text search over title/location.
4. MapLibre + free tiles; markers from approx_lat/approx_lng (never exact).
5. Server-side filtering/pagination.

## Acceptance criteria
- Correct filtered/searched results; pagination works.
- Markers use approximate coordinates; no locked field in list/map payloads.

## Guardrails
- MapLibre only. Teaser columns only. Paginate.
