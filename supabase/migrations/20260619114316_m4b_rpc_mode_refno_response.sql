-- =============================================================================
-- Migration: 20260619114316_m4b_rpc_mode_refno_response  (DRAFT — NOT APPLIED)
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     M4b — wire the M4 columns into the RPCs (FOLLOW-UP to M4 schema)
--
-- WHAT THIS DOES (RPC-only; no table/RLS/column change)
--   M4 (20260619112555) ADDED the columns but deliberately did NOT touch any RPC.
--   This migration does ONLY that follow-up, by `create or replace` on the four
--   functions, copying their CURRENT bodies VERBATIM and making minimal additions:
--
--   (a) get_public_portfolio(_slug)         — ADD 'mode' + 'ref_no' to the SAME
--       top-level teaser jsonb_build_object. Nothing else changes.
--   (b) get_public_agent_portfolios(_user)  — ADD 'ref_no' + 'mode' to EACH card's
--       per-row jsonb_build_object. Nothing else changes.
--   (c) approve_detail_request / reject_detail_request — add a SECOND optional
--       parameter `_response_message text default null` and write it into the
--       UPDATE(s) that set status (D38). Owner-only authorization is UNCHANGED.
--
-- ================================ WHY SAFE ===================================
--   * mode + ref_no are PUBLIC, NON-IDENTIFYING (a mode label + a reference
--     number). M4 already declared them teaser-safe (D36/D39). They touch NO
--     locked source: get_public_portfolio / get_public_agent_portfolios still
--     never reference portfolio_private or portfolio_documents, still filter
--     images to visibility='public', and still gate on status='active'
--     (+ profiles.status='verified' for the agent list). The allow-list grows by
--     exactly two public scalars; no locked column is named.
--   * response_message (D38) is written ONLY inside the owner-validated
--     approve/reject RPCs, and lives on detail_requests — a MEMBER-ONLY table
--     (RLS enabled + FORCED, SELECT visible only to requester/owner, no write
--     policies). It NEVER enters get_public_portfolio, get_public_agent_portfolios,
--     get_public_profile, or any other anon path. No anon path is edited to read it.
--   * NO locked handling, status gate, image-visibility filter, or authorization
--     check is changed. The owner-only `owns_portfolio` guards in approve/reject
--     are copied VERBATIM; the idempotent/atomic logic is unchanged.
--   * search_path stays pinned (public, pg_temp); SECURITY DEFINER + stable/volatile
--     + language preserved exactly per function. Idempotent create-or-replace.
--
-- (c) SIGNATURE CHANGE — why we DROP the 1-arg overloads first
--   Postgres treats approve_detail_request(uuid, text) as a NEW overload distinct
--   from approve_detail_request(uuid); a bare `create or replace` of the 2-arg form
--   would LEAVE the old 1-arg function in place, producing a dangling overload that
--   (a) is no longer used once the app passes the 2nd arg (PARÇA 2) and (b) makes
--   `approve_detail_request(<uuid>)` ambiguous-free but stale. Cleanest is to DROP
--   the old 1-arg functions, then CREATE the 2-arg versions. This is dependency-safe
--   here: these RPCs are NOT referenced by any view, RLS policy, trigger, or other
--   function (they are only called by the app over PostgREST), so dropping them
--   breaks nothing in the DB. The app is updated to pass _response_message in PARÇA 2.
--   `default null` keeps the new signature callable with a single argument too.
--
-- DECISIONS HONORED
--   D36 — mode (controlled|call_only) is a PUBLIC teaser column → in the teaser RPCs.
--   D39 — ref_no (BU-XXXXXX) is PUBLIC, non-identifying → in the teaser RPCs.
--   D38 — owner approve/reject response message, set inside the owner-only RPCs.
--   D13 — anon teaser served only via these definer allow-list RPCs.
--   Invariant #1 — locked fields never reach public/customer paths (unchanged).
--   Invariant #2 — locked visibility decided on GRANTS, never detail_requests.status
--                  (response_message is bookkeeping on detail_requests; no RLS reads it).
--
-- APPLY: a human runs `supabase db push`. Do NOT auto-apply. Regenerate TS types
--   afterwards: the approve/reject RPC arg lists change (uuid → uuid, text), so the
--   app MUST pass _response_message (PARÇA 2, app code), and the two teaser RPCs gain
--   'mode' + 'ref_no' keys in their jsonb shape.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- (a) get_public_portfolio(_slug) — ADD 'mode' + 'ref_no' to the teaser object.
--     Body copied VERBATIM from 20260618223704_slice3_public_teaser_rpc; the only
--     change is the two added keys below. Still SQL / stable / SECURITY DEFINER,
--     search_path pinned, status='active' gate, no locked sources referenced,
--     images filtered to visibility='public', PUBLIC attributes bag + coarse pin.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_portfolio(_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    -- teaser scalar columns (PUBLIC only) ------------------------------------
    'id',               p.id,
    'slug',             p.slug,
    'title',            p.title,
    'public_description', p.public_description,
    'price',            p.price,
    'currency',         p.currency,
    'transaction_type', p.transaction_type,
    'category',         p.category,
    'subcategory',      p.subcategory,
    'room_count',       p.room_count,
    'gross_m2',         p.gross_m2,
    'net_m2',           p.net_m2,
    'land_m2',          p.land_m2,
    'features',         p.features,
    'city',             p.city,
    'district',         p.district,
    'neighborhood',     p.neighborhood,
    -- M4b: PUBLIC, non-identifying teaser scalars (D36 mode, D39 ref_no).
    'mode',             p.mode,
    'ref_no',           p.ref_no,
    -- COARSE pin only (D30). Exact coords (portfolio_private) NEVER selected.
    'approx_lat',       p.approx_lat,
    'approx_lng',       p.approx_lng,
    'created_at',       p.created_at,
    -- D33 PUBLIC bag ONLY. The LOCKED portfolio_private.attributes is never read.
    'attributes',       p.attributes,
    -- PUBLIC images only (D34). visibility='locked' rows are excluded. Client
    -- builds the public-bucket URL from `path` (bucket is public-read).
    'images', coalesce(
      (
        select jsonb_agg(
                 jsonb_build_object(
                   'path',       img.path,
                   'sort_order', img.sort_order,
                   'is_cover',   img.is_cover
                 )
                 order by img.sort_order, img.is_cover desc
               )
        from public.portfolio_images img
        where img.portfolio_id = p.id
          and img.visibility = 'public'::public.image_visibility
      ),
      '[]'::jsonb
    ),
    -- owner's PUBLIC profile fields (D8: agent's own contact is OPEN). No id,
    -- no status, no auth/email fields beyond the OPEN contact_email.
    'agent', (
      select jsonb_build_object(
               'username',           pr.username,
               'full_name',          pr.full_name,
               'title',              pr.title,
               'company_name',       pr.company_name,
               'avatar_url',         pr.avatar_url,
               'bio',                pr.bio,
               'contact_phone',      pr.contact_phone,
               'contact_email',      pr.contact_email,
               'contact_whatsapp',   pr.contact_whatsapp,
               'expertise_regions',  pr.expertise_regions,
               'expertise_types',    pr.expertise_types
             )
      from public.profiles pr
      where pr.id = p.owner_id
    )
  )
  from public.portfolios p
  where p.slug = _slug
    and p.status = 'active'::public.portfolio_status;
$$;

comment on function public.get_public_portfolio(text) is
  'D13: anon-callable SECURITY DEFINER teaser for /p/$slug. Returns a jsonb allow-list of PUBLIC columns ONLY for an ACTIVE portfolio (else NULL). Never references portfolio_private/portfolio_documents; images filtered to visibility=public; only the PUBLIC attributes bag and the COARSE approx pin (D30) are exposed; the agent block is the owner OPEN contact (D8). M4b: also exposes PUBLIC mode (D36) + ref_no (D39). Anon has EXECUTE on this function and NO base-table grants.';

-- create or replace preserves the M2/slice3 execute grants (anon, authenticated).
-- Re-issue to match the original migration exactly (lock down, then grant).
revoke execute on function public.get_public_portfolio(text) from public;
grant  execute on function public.get_public_portfolio(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- (b) get_public_agent_portfolios(_username) — ADD 'ref_no' + 'mode' to EACH card.
--     Body copied VERBATIM from 20260619075951_slice3_agent_portfolios_rpc; the
--     only change is the two added keys inside the per-row card object. Still SQL /
--     stable / SECURITY DEFINER, search_path pinned, verified+active gate, public
--     cover-path logic, no locked sources referenced.
-- -----------------------------------------------------------------------------
create or replace function public.get_public_agent_portfolios(_username text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(card order by created_at desc), '[]'::jsonb)
  from (
    select
      p.created_at as created_at,
      jsonb_build_object(
        'id',               p.id,
        'slug',             p.slug,
        'title',            p.title,
        'price',            p.price,
        'currency',         p.currency,
        'transaction_type', p.transaction_type,
        'category',         p.category,
        'subcategory',      p.subcategory,
        'city',             p.city,
        'district',         p.district,
        'neighborhood',     p.neighborhood,
        'created_at',       p.created_at,
        -- M4b: PUBLIC, non-identifying teaser scalars (D39 ref_no, D36 mode).
        'ref_no',           p.ref_no,
        'mode',             p.mode,
        -- single PUBLIC cover path (client builds the public-bucket URL); locked
        -- images (visibility='locked') are never considered.
        'cover_path', (
          select img.path
          from public.portfolio_images img
          where img.portfolio_id = p.id
            and img.visibility = 'public'::public.image_visibility
          order by img.is_cover desc, img.sort_order
          limit 1
        )
      ) as card
    from public.portfolios p
    join public.profiles pr on pr.id = p.owner_id
    where pr.username = _username
      and pr.status = 'verified'::public.profile_status
      and p.status = 'active'::public.portfolio_status
  ) t;
$$;

comment on function public.get_public_agent_portfolios(text) is
  'D13: anon-callable SECURITY DEFINER list of a VERIFIED agent''s ACTIVE portfolios as TEASER cards (jsonb array, explicit PUBLIC allow-list + public cover path only). Never references portfolio_private/portfolio_documents or locked images. M4b: each card also exposes PUBLIC ref_no (D39) + mode (D36). anon has EXECUTE and no base-table grants.';

-- create or replace preserves grants; re-issue to match the original migration.
revoke execute on function public.get_public_agent_portfolios(text) from public;
grant  execute on function public.get_public_agent_portfolios(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- (c) approve_detail_request / reject_detail_request — add the optional
--     _response_message arg (D38) and persist it on the status UPDATE(s).
--
--     DROP the old 1-arg overloads FIRST (dependency-safe: not referenced by any
--     view/policy/trigger/function — app-only callers), then CREATE the 2-arg
--     versions. Bodies copied VERBATIM; owner-only `owns_portfolio` checks and the
--     atomic/idempotent logic are UNCHANGED. Each `update ... set status = ...,
--     updated_at = now()` also sets `response_message = _response_message`.
--     `default null` keeps single-arg calls resolvable until PARÇA 2 ships.
-- -----------------------------------------------------------------------------

drop function if exists public.approve_detail_request(uuid);
drop function if exists public.reject_detail_request(uuid);

create or replace function public.approve_detail_request(
  _request_id       uuid,
  _response_message text default null
)
returns public.portfolio_access_grants
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller   uuid := (select auth.uid());
  req      public.detail_requests;
  existing public.portfolio_access_grants;
  granted  public.portfolio_access_grants;
begin
  if caller is null then
    raise exception 'Yetkisiz: oturum bulunamadı.' using errcode = '28000';
  end if;

  select dr.* into req
  from public.detail_requests dr
  where dr.id = _request_id;

  if not found then
    raise exception 'Detay talebi bulunamadı.' using errcode = 'P0002';
  end if;

  -- Only the portfolio owner may approve.
  if not public.owns_portfolio(req.portfolio_id, caller) then
    raise exception 'Yalnızca portföy sahibi talebi onaylayabilir.' using errcode = '42501';
  end if;

  -- Idempotent: if there is already an ACTIVE grant for this (portfolio, requester),
  -- ensure the request reads approved and return that grant — never a duplicate.
  select g.* into existing
  from public.portfolio_access_grants g
  where g.portfolio_id = req.portfolio_id
    and g.grantee_id   = req.requester_id
    and g.revoked_at is null
    and (g.expires_at is null or g.expires_at > now())
  limit 1;

  if found then
    if req.status <> 'approved'::public.detail_request_status then
      update public.detail_requests
      set status = 'approved'::public.detail_request_status,
          response_message = _response_message,
          updated_at = now()
      where id = req.id;
    end if;
    return existing;
  end if;

  -- Mark the request approved.
  update public.detail_requests
  set status = 'approved'::public.detail_request_status,
      response_message = _response_message,
      updated_at = now()
  where id = req.id;

  -- Create ONE bulk (D6) + permanent (D7, expires_at NULL) grant.
  insert into public.portfolio_access_grants
    (portfolio_id, grantee_id, granted_by, request_id, expires_at, revoked_at)
  values
    (req.portfolio_id, req.requester_id, caller, req.id, null, null)
  returning * into granted;

  return granted;
end;
$$;

comment on function public.approve_detail_request(uuid, text) is
  'Portfolio owner approves a request. Atomic + idempotent: returns the existing ACTIVE grant if one exists (no duplicate); else sets status=approved and inserts ONE bulk (D6) + permanent (D7, expires_at NULL) grant. M4b: also persists the optional owner note _response_message (D38) on the request''s status UPDATE(s). Caller must own the portfolio (owns_portfolio). SECURITY DEFINER so it can write both no-write-RLS tables after validating ownership.';

create or replace function public.reject_detail_request(
  _request_id       uuid,
  _response_message text default null
)
returns public.detail_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller  uuid := (select auth.uid());
  req     public.detail_requests;
  updated public.detail_requests;
begin
  if caller is null then
    raise exception 'Yetkisiz: oturum bulunamadı.' using errcode = '28000';
  end if;

  select dr.* into req
  from public.detail_requests dr
  where dr.id = _request_id;

  if not found then
    raise exception 'Detay talebi bulunamadı.' using errcode = 'P0002';
  end if;

  -- Only the portfolio owner may reject.
  if not public.owns_portfolio(req.portfolio_id, caller) then
    raise exception 'Yalnızca portföy sahibi talebi reddedebilir.' using errcode = '42501';
  end if;

  -- No-op if already rejected.
  if req.status = 'rejected'::public.detail_request_status then
    return req;
  end if;

  update public.detail_requests
  set status = 'rejected'::public.detail_request_status,
      response_message = _response_message,
      updated_at = now()
  where id = req.id
  returning * into updated;

  -- Deliberately NO grant created. Rejecting never unlocks anything.
  return updated;
end;
$$;

comment on function public.reject_detail_request(uuid, text) is
  'Portfolio owner rejects a request. Sets status=rejected (no-op if already rejected); creates NO grant. M4b: also persists the optional owner note _response_message (D38) on the status UPDATE. Caller must own the portfolio. Invariant #2: rejection is bookkeeping; locked visibility is governed by grants, not request status.';

-- Lock down the NEW 2-arg signatures: revoke from public/anon, grant to
-- authenticated only (members). Mirrors the original M3 grant block exactly.
-- NOTE: the old 1-arg overloads were dropped above, so no stale overload remains.
revoke execute on function public.approve_detail_request(uuid, text) from public, anon;
revoke execute on function public.reject_detail_request(uuid, text)  from public, anon;

grant execute on function public.approve_detail_request(uuid, text)  to authenticated;
grant execute on function public.reject_detail_request(uuid, text)   to authenticated;

-- =============================================================================
-- END M4b — wire mode (D36) + ref_no (D39) into teaser RPCs; response_message
--           (D38) into the owner-only approve/reject RPCs.
-- =============================================================================
