-- Doc-4B §16 — realize `core.write_outbox_event.v1`, the M0 transactional-outbox WRITE primitive (the
-- mechanism every emitting contract's §16.2 Events-Produced resolves to). W3-BILL-4 needs it for the
-- platform's FIRST §8 event emission (`SubscriptionPurchased` from `billing.purchase_subscription.v1`).
--
-- SECURITY DEFINER — the `core.allocate_human_ref` precedent (Doc-6B §3.3): a tenant-context caller
-- (e.g. `purchase_subscription` under `withActiveOrg`, `app.is_platform_staff = false`) inserts the
-- outbox row INSIDE its business transaction (Doc-4B §16.2 — atomic) WITHOUT the direct-table
-- `outbox_events_platform_staff` RLS (core_init) rejecting it. The function is the sanctioned privileged
-- write path; the dispatcher's read/advance stays platform-staff-only. STRUCTURAL insert only (Doc-4B §16
-- — no business-semantics validation; the OWNING module is responsible for `event_name` existence in
-- Doc-2 §8, event ownership §16.6, thin-payload §16.5, and the Privacy-Review §16.3). `id` is app-minted
-- (UUIDv7, time-ordered — the dispatcher orders by it); `status`/`attempts`/timestamps default (core_init).

CREATE FUNCTION "core".write_outbox_event(
  p_id            uuid,
  p_event_name    text,
  p_event_version integer,
  p_aggregate_id  uuid,
  p_payload       jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = core, pg_temp
AS $$
BEGIN
  INSERT INTO core.outbox_events (id, aggregate_id, event_name, event_version, payload_jsonb)
    VALUES (p_id, p_aggregate_id, p_event_name, p_event_version, p_payload);
END $$;
