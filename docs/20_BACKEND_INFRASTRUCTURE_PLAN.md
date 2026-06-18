# Backend Infrastructure Plan

## Stack önerisi
- Frontend: React/Vite/TypeScript (Loveable çıktısına göre).
- Backend: Supabase Postgres + Auth + Storage + Edge Functions.
- Hosting: Vercel veya Lovable publish → sonra Vercel.
- AI: OpenAI/Anthropic API via Edge Functions/server routes.
- PDF: server-side HTML-to-PDF (Playwright/Puppeteer) veya hosted function.
- Email: Resend/SendGrid.
- WhatsApp: P1 WhatsApp Business Cloud API.
- Analytics: PostHog/Umami veya custom event tables.

## Backend slice sırası
1. Supabase foundation
2. Auth + profile
3. Portfolios CRUD
4. Media/documents storage
5. RLS locked fields
6. Detail requests/access grants
7. Search filters/saved searches
8. Region watches/notifications
9. Matching engine jobs
10. Share Studio/PDF
11. AI Import/Search
12. Public pages `/p`, `/v`

## Environment variables
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- OPENAI_API_KEY / ANTHROPIC_API_KEY
- RESEND_API_KEY
- APP_BASE_URL
- STORAGE_BUCKET_MEDIA
- STORAGE_BUCKET_DOCUMENTS
