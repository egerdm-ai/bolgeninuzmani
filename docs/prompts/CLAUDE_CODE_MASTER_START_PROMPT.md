You are Claude Code working on the VAULT project.

VAULT is a private luxury real estate network for verified professionals in Turkey. It is not a generic listing marketplace. The main product word is “Portföy”, not “İlan”. The AI module is “VAULT Asistan”, not “AI Concierge”. The product combines private closed portfolios, buyer searches, region expertise, AI matching, request-access privacy, Share Studio and PDF/WhatsApp sharing.

Your first job is NOT to build backend immediately.

Your first job:
1. Inspect the repository.
2. Understand the current Loveable UI scaffold.
3. Create a full audit of routes, components, mock data, state handling, dead buttons and backend TODOs.
4. Preserve UI design. Do not redesign.
5. Create/refresh CLAUDE.md with project rules.
6. Produce a refactor and backend integration plan.

Read these docs first:
- README.md
- docs/00_MASTER_CANVAS.md
- docs/01_CURRENT_STATE_AUDIT.md
- docs/06_INFORMATION_ARCHITECTURE_ROUTES.md
- docs/08_MVP_P1_P2_SCOPE.md
- docs/15_DATABASE_SCHEMA_SUPABASE.md
- docs/16_RLS_PRIVACY_ACCESS_MODEL.md
- docs/17_AI_ARCHITECTURE_VAULT_ASSISTANT.md
- docs/18_MATCHING_ENGINE_REGION_WATCH.md
- docs/25_CLAUDE_CODE_SETUP.md

Rules:
- Do not connect Supabase until audit/refactor is approved.
- Do not remove routes.
- Do not rename visible Turkish product terms without approval.
- Do not expose locked fields in frontend data once backend exists.
- Use small commits/slices.
- Every change should include acceptance criteria and test notes.

Output files to create/update:
- CLAUDE.md
- docs/current-code-audit.md
- docs/route-inventory.md
- docs/component-inventory.md
- docs/mock-data-inventory.md
- docs/backend-integration-plan.md
- docs/refactor-plan.md
- docs/open-questions.md

Wait for approval before large refactors.
