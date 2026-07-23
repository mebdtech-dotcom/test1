-- Doc-6H — M6 Communication (`communication`) — notifications dedup-key hardening (forward-only;
-- Doc-6A §11). W3-COMM-2 follow-up: replaces the non-unique H.8 idempotency PROBE
-- (`notifications_source_event_idx`, `communication_notifications` migration — applied on main and
-- therefore immutable; hardened here as a follow-up, never by editing it) with the UNIQUE dedup KEY.
-- A non-unique probe leaves a TOCTOU window: two concurrent re-deliveries of the same §8 event can
-- both pass the pre-insert read and BOTH insert. UNIQUE closes it at the storage layer — create
-- catches the violation (P2002) and re-reads the winner.
--
-- [§2.5 choice] the H.8 event-consumer idempotency KEY (`source_event_id` + recipient) — exactly-once
-- effect over at-least-once delivery (Doc-4A §16; Doc-4H §HB-2.1 item 10). UNIQUE so a concurrent
-- re-delivery cannot double-insert; NULLS NOT DISTINCT so an org-wide notification
-- (recipient_user_id NULL) still dedupes; partial (source_event_id IS NOT NULL) — only event-sourced
-- rows participate in the fan-out dedup. Safe to add UNIQUE: the create path is not yet wired to a
-- consumer, so no pre-existing rows can violate the key. IF EXISTS / IF NOT EXISTS: converges both
-- live states (base probe applied via main; or a dev DB where the key already exists).

DROP INDEX IF EXISTS communication.notifications_source_event_idx;
CREATE UNIQUE INDEX IF NOT EXISTS notifications_source_event_key ON communication.notifications (source_event_id, recipient_organization_id, recipient_user_id) NULLS NOT DISTINCT WHERE source_event_id IS NOT NULL;
