# Bölgenin Uzmanı — Kurulum & İlerleme (adım adım)

Repo: `github.com/Egerdm/emsalsiz` · Lokal klasör + ürün adı: **bolgeninuzmani**
(Ürün markası: Bölgenin Uzmanı. Repo adı şimdilik `emsalsiz` kalabilir.)

---

## Nerede kaldık
Claude Code kuruldu, Superpowers eklendi, dev Supabase + boş repo hazır. Şimdi
kodu lokale alıp scaffold'u koyup audit'e geçiyoruz.

## A. Repoyu lokale al
```bash
# Claude Code içindeysen önce çık: /exit
mkdir -p ~/Developer && cd ~/Developer
git clone https://github.com/Egerdm/emsalsiz.git bolgeninuzmani
cd bolgeninuzmani
npm install
```
Repo boşsa: önce Lovable'da kodu GitHub'a pushla, sonra clone et.

## B. Scaffold + Company Brain
```bash
cd ~/Developer/bolgeninuzmani
unzip ~/Downloads/bolgeninuzmani-scaffold.zip -d /tmp/bs
cp -R /tmp/bs/bu-scaffold/. .
chmod +x .claude/hooks/*.sh
# Company Brain (master pack) → docs/
unzip ~/Downloads/VAULT_Claude_Transition_Master_Pack_v6.zip -d /tmp/pack
cp -R /tmp/pack/*/docs/.   docs/
cp -R /tmp/pack/*/prompts  docs/
cp -R /tmp/pack/*/data     docs/
git add -A && git commit -m "chore: bolgeninuzmani scaffold + company brain + decisions"
```

## C. Claude'u repo içinde aç
```bash
cd ~/Developer/bolgeninuzmani && claude
```
`/context` → CLAUDE.md + DECISIONS yüklü olmalı.

## D. Superpowers + Supabase
```
/reload-plugins
/doctor
```
Supabase MCP (repo scope + read-only) + skill:
```
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<PROJE_REF>&read_only=true"
/mcp        # supabase → Authenticate (tarayıcı OAuth, dev org)
npx skills add supabase/agent-skills
```

## E. Audit (Claude çalışır, sen onaylarsın)
- `docs/prompts/CLAUDE_CODE_MASTER_START_PROMPT.md` → First 10 Tasks.
- Çıktılar: route/component/mock envanteri + refactor + backend planı + open-questions.
- Birlikte gözden geçir → onayla → `touch .claude/AUDIT_APPROVED` → commit.
- Sonra Supabase MCP'yi read_only olmadan yeniden ekle (yazma açılır).

## F. MVP build sırası (audit sonrası)
Her slice: `/brainstorm` → plan → onay → execute → DoD (test + docs-sync + commit).
1. **Auth + profiles + user_roles** (profile skill)
2. **Portföy CRUD** — wizard, alanlar, görseller, durum; teaser vs kilitli alan + RLS (portfolio-crud)
3. **Portföy detay + WhatsApp paylaşım** `/p/$slug` public teaser (portfolio-share)
4. **Kontrollü erişim motoru** — detay talebi → onay → access_grants → kilitli alan açılması + gelen kutusu (access-request) ← kalp
5. **Keşfet** — arama / filtre / MapLibre harita (browse-search-map)

MVP biter. Sonraki fazlar: arayış → eşleştirme+bildirim → bölge uzmanı dizini →
takip → AI asistan → Share Studio (PDF/QR/analitik).

## G. Jira (opsiyonel, MVP build başında bağla)
```
claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp --scope project
/mcp        # atlassian → Authenticate
```
`/sse` endpoint'i 30 Haz 2026'da kapanıyor; `/mcp` kullan.

## Kırmızı çizgiler
- Audit onaylanmadan migration/yazma yok (Supabase read-only).
- Agent-only alanlar (exact_address, exact_lat/lng, private_notes) teaser/public/müşteri görünümüne asla sızmaz; maskeleme RLS/backend'de, frontend'de değil.
- Roller `user_roles`'tan; service-role sadece server-side.
- "VAULT" ve "İlan" terimleri kalmasın → marka "Bölgenin Uzmanı", varlık "Portföy".
- UI redesign yok; mevcut dark-luxury korunur.
