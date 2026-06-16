# Public Application / Waitlist Flow — VAULT

The public landing page is **invite / private beta** based. Public CTAs route to an
application (waitlist) section rather than directly into the dashboard.

## CTA behavior

- **"Üyelik Başvurusu Yap"** (navbar, hero, membership tiers, footer, mobile sticky)
  → smooth-scrolls to the application section `#basvuru` (`scrollToApply` in
  `src/routes/index.tsx`). Does NOT send users to the dashboard.
- **"Giriş Yap"** (navbar) → `/dashboard` (login/dashboard placeholder).
- **"Portföyleri Keşfet"** / "VAULT Akışını Gör" / "Share Studio'yu Gör" →
  dashboard deep links for product exploration.
- Membership "Başvur" / "İlgileniyorum" → also scroll to `#basvuru`.

## Application form (`src/components/landing/application-form.tsx`)

Fields: Ad Soyad, Şirket, Telefon, E-posta, Çalıştığınız bölgeler, Portföy tipi, Not.

Current behavior (MOCK ONLY):
- `handleSubmit` calls `preventDefault` and flips local `submitted` state.
- Success state: "Başvurunuz alındı. VAULT ekibi sizinle iletişime geçecek."
- No data is persisted or transmitted. No validation beyond HTML `required`.

## Backend TODOs

1. **Application storage**
   - Create `applications` table (full_name, company, phone, email, regions[],
     portfolio_type, note, status, created_at) with RLS + GRANTs.
   - Status workflow: `pending` → `approved` / `rejected`.
2. **Submit endpoint**
   - TanStack `createServerFn` (public, validated with Zod) OR
     `/api/public/applications` route with rate limiting + spam protection.
   - Persist row, return success; never expose other applicants' data.
3. **Team notification**
   - Email VAULT team on new application (Lovable AI Gateway / email provider).
   - Optional: confirmation email to applicant.
4. **Verification / onboarding**
   - On approval, provision verified profile + send invite link to onboarding.
5. **Analytics**
   - Track landing CTA clicks, section views, application conversion funnel.
6. **Public pages**
   - Real `/p/$slug` teaser portfolio and `/v/$username` public profile data
     (currently mock) to back share links shown in Share Studio.

## Mock-only items recap

- Application submit + success state (no persistence).
- All mockup data (portfolios, regions, experts, match scores, analytics stats).
- Trust-row numbers (500+ / 120+) are illustrative.
- Legal links (Gizlilik / Kullanım Şartları / KVKK) are placeholders.
