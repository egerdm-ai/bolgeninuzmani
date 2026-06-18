# Claude Code Setup Plan

## Repo geçişi
1. Loveable export → GitHub repo.
2. Baseline commit: `lovable-ui-scaffold-v1`.
3. Bu knowledge base paketi repo içine `/docs/company-brain/` veya `/vault-brain/` olarak eklenir.
4. Claude Code ilk iş audit yapar, backend'e hemen geçmez.

## İlk Claude hedefi
- Reponun route/component/data yapısını anlamak.
- Dead buttons ve route tutarsızlıklarını çıkarmak.
- Mock data contracts ve backend TODO'ları map etmek.
- Component dağınıklığını temizlemek.
- CLAUDE.md ve project rules oluşturmak.

## Claude rules
- UI redesign yok, mevcut dark luxury tasarım korunacak.
- Önce audit, sonra küçük refactor, sonra backend slice.
- RLS/access model olmadan locked fields backend'e bağlanmayacak.
- Her feature için tests/acceptance criteria yazılacak.
- Her backend değişikliği migration + types + RLS policy + seed + UI connection şeklinde ilerleyecek.

## Gerekli local tools
- Node.js
- npm/pnpm
- Supabase CLI
- GitHub CLI
- Playwright
- Claude Code
- Jira access
