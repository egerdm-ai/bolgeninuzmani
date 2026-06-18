# Modular Product Architecture

## Neden modüler?
VAULT büyüdükçe her ürün parçası bağımsız geliştirilebilir, test edilebilir ve gerektiğinde ayrı paket/feature olarak sunulabilir.

## Modüller
- `portfolio-core` — portfolio CRUD, detail, privacy.
- `search-discovery` — map/list/filter search.
- `buyer-searches` — Arayışlarım / network arayışları.
- `matching-engine` — score/explanation/jobs.
- `professionals-network` — profiles, follow, expertise regions.
- `regions-watch` — regions, watches, region analytics.
- `detail-requests` — access requests, grants.
- `share-studio` — WhatsApp/link/PDF/share events.
- `vault-assistant` — AI import/search/matching/pdf.
- `notifications` — in-app/email/WhatsApp.
- `admin` — verification/applications/moderation.

## Code organization önerisi
```
src/
  components/
    layout/
    ui/
    portfolio/
    search/
    professionals/
    regions/
    searches/
    matches/
    requests/
    assistant/
    share/
  lib/
    data/         # backend abstraction layer
    supabase/
    ai/
    matching/
    permissions/
  types/
  pages/routes/
```
