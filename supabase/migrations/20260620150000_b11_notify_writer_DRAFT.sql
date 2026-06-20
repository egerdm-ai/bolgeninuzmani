-- =============================================================================
-- Migration: 20260620150000_b11_notify_writer  ⚠️ REVIEW GEREKLİ — DRAFT, NOT APPLIED
-- Project:   Bölgenin Uzmanı (bolgeninuzmani)
-- Slice:     B11 — Notify-writer (Detay Talebi → bildirim)
--
-- WHAT THIS DOES
--   * SECURITY DEFINER trigger function public.notify_on_detail_request() + an
--     AFTER INSERT OR UPDATE trigger on public.detail_requests. It writes a row into
--     public.notifications when:
--       - a request is CREATED  → notify the portfolio OWNER  ("Yeni detay talebi")
--       - status → 'approved'    → notify the REQUESTER        ("Talebiniz onaylandı")
--       - status → 'rejected'    → notify the REQUESTER        ("Talebiniz yanıtlandı"
--                                   + the owner's response_message if any)
--
-- ====================== WHY A TRIGGER (vs editing the RPCs) ==================
--   The request/approve/reject SECURITY DEFINER RPCs already validate authority and
--   then write detail_requests. A trigger reacts to those ALREADY-VALIDATED row
--   changes, so it needs no extra auth and — crucially — it does NOT require copying
--   the (evolving) RPC bodies, avoiding drift. It is the single writer to
--   notifications.
--
-- ====================== WHY THIS IS SAFE ====================================
-- (1) notifications stays NON-client-insertable. The B11 migration gives clients
--     only SELECT + UPDATE(read) and NO insert policy/grant. This definer trigger
--     (owner = function owner) is the ONLY thing that inserts rows; a client cannot
--     forge a notification for itself or anyone else.
-- (2) The recipient user_id is derived server-side: portfolios.owner_id (on insert)
--     or detail_requests.requester_id (on decision) — never from client input.
-- (3) security definer + `set search_path = public, pg_temp` (pinned). EXECUTE on
--     the trigger function is REVOKEd from public + anon (triggers fire regardless).
-- (4) No D13 locked field is read or copied — only titles/bodies the recipient is
--     already entitled to, + a navigation link to /dashboard/detail-requests.
--
-- APPLY: a human runs `supabase db push` (no type regen needed — no new table/column;
--   the client reads notifications already). After this, new requests/decisions start
--   dropping real notifications into the bell + /dashboard/notifications.
-- =============================================================================

create or replace function public.notify_on_detail_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (TG_OP = 'INSERT') then
    -- New request → notify the portfolio OWNER.
    insert into public.notifications (user_id, kind, title, body, link)
    select
      pf.owner_id,
      'request',
      'Yeni detay talebi',
      coalesce(pr.full_name, 'Bir üye') || ' bir portföyünüz için detay talebi gönderdi.',
      jsonb_build_object('to', '/dashboard/detail-requests')
    from public.portfolios pf
    left join public.profiles pr on pr.id = NEW.requester_id
    where pf.id = NEW.portfolio_id;

  elsif (TG_OP = 'UPDATE'
         and NEW.status is distinct from OLD.status
         and NEW.status in ('approved'::public.detail_request_status,
                            'rejected'::public.detail_request_status)) then
    -- Decision → notify the REQUESTER.
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      NEW.requester_id,
      'request',
      case when NEW.status = 'approved'::public.detail_request_status
           then 'Talebiniz onaylandı' else 'Talebiniz yanıtlandı' end,
      case when NEW.status = 'approved'::public.detail_request_status
           then 'Detay talebiniz onaylandı — kilitli bilgiler artık açık.'
           else coalesce(NEW.response_message, 'Detay talebiniz yanıtlandı.') end,
      jsonb_build_object('to', '/dashboard/detail-requests')
    );
  end if;

  return NEW;
end;
$$;

comment on function public.notify_on_detail_request() is
  'B11 notify-writer: inserts notifications on detail-request create/approve/reject. Definer; the ONLY writer to notifications (clients cannot insert).';

revoke execute on function public.notify_on_detail_request() from public, anon;

drop trigger if exists trg_notify_detail_request on public.detail_requests;
create trigger trg_notify_detail_request
  after insert or update on public.detail_requests
  for each row execute function public.notify_on_detail_request();
