# Claude Max Agents & Skills Methodology

## Company Brain
Claude projesinin ana knowledge context'i:
- Product vision
- Route inventory
- Database schema
- RLS rules
- AI architecture
- Jira backlog
- Design system
- User flows

## Önerilen agentlar
1. **Product Architect Agent**
   - Scope, flows, route decisions, UX consistency.
2. **Frontend UI Agent**
   - React components, design system, responsive, visual bugs.
3. **Backend Supabase Agent**
   - Schema, migrations, RLS, storage, RPC.
4. **AI Engineer Agent**
   - AI import, query parser, embeddings, match explanations.
5. **QA Agent**
   - Route tests, Playwright screenshots, acceptance criteria.
6. **Growth/Marketing Agent**
   - Landing, copy, onboarding, beta funnel.
7. **Business Analyst Agent**
   - Metrics, pricing, financial model, competitive analysis.
8. **Project Manager/Jira Agent**
   - Epics, sprint plans, dependencies, done criteria.

## Skill format
Her skill şu dosya formatında tutulabilir:
- Purpose
- Inputs needed
- What to inspect
- Steps
- Output format
- Acceptance criteria
- Guardrails

## Collaboration method
1. Product Architect değişikliği planlar.
2. İlgili specialist agent uygular.
3. QA Agent route/build/screenshot/test kontrol eder.
4. PM Agent Jira statüsünü günceller.
5. Company Brain docs güncellenir.
