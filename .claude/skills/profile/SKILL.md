---
name: profile
description: Agent profile + auth — sign up / sign in, create and edit the agent (emlakçı) profile, expertise regions/types, contact info. Use for anything touching auth, profiles, or the Profilim screen.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Profile & Auth (Portföy platform)

## Purpose
Authenticated agents with a real profile. Foundation for everything else.

## Steps
1. Supabase Auth (email/password to start). On sign-up, create a `profiles` row.
2. `profiles`: name, title, company, location, phone, email, whatsapp,
   expertise_regions[], expertise_types[], avatar, website. Contact is public.
3. `user_roles` (admin | agent) + `has_role()` security-definer. Founders = admin.
4. RLS: a user reads/updates only their own profile; public can read the public
   profile fields (name, contact, expertise) for shared listing pages.
5. Wire Profilim (edit) + Profili Önizle (public view).

## Acceptance criteria
- New agent can sign up, gets a profile + `agent` role.
- A user can edit only their own profile (RLS verified).
- Admin role is read from `user_roles`, never from a profile column.

## Guardrails
- Roles never from `profiles`. Service role server-side only.
