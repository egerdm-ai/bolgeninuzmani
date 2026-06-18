# Supabase Database Schema Plan

## Çekirdek tablolar
- `profiles`
- `companies`
- `regions`
- `professional_region_expertise`
- `portfolios`
- `portfolio_media`
- `portfolio_documents`
- `portfolio_residential_details`
- `portfolio_land_details`
- `portfolio_commercial_details`
- `portfolio_hotel_details`
- `portfolio_industrial_details`
- `portfolio_access_grants`
- `detail_requests`
- `my_searches`
- `network_searches`
- `match_results`
- `region_watches`
- `notifications`
- `favorites`
- `follows`
- `share_assets`
- `share_events`
- `ai_import_drafts`
- `portfolio_search_documents`
- `valuation_insights`
- `applications`

## Core `portfolios` alanları
- id, owner_id, company_id, slug
- title, short_description, public_description, private_description
- category, subcategory, transaction_type, status
- city, district, neighborhood, region_id, approx_lat/lng, exact_lat/lng
- location_privacy
- price, currency, price_display_type, min_price, max_price, price_per_m2
- gross_m2, net_m2, land_m2, indoor_m2, outdoor_m2
- room_count, bedroom_count, bathroom_count, parking_capacity
- feature flags: has_pool, has_sea_view, has_garden, has_security, has_pdf
- visibility_mode, request_access_required, hide_contact_info, access_validity_days
- data_completeness_score
- created_at, updated_at, published_at

## JSONB kullanımı
- `attributes jsonb` — kategoriye özel uzun kuyruk alanlar.
- `features text[]`
- `amenities text[]`
- `locked_fields jsonb`

## Search document
`portfolio_search_documents` her portföy için public/locked boundary'ye göre AI/semantic search metni üretir.
