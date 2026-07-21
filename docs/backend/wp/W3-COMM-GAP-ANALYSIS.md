# W3-COMM Gap Analysis — M6 `communication` Wave-3 Remainder

**Status:** Working document (non-authoritative; coins nothing — every row binds a frozen doc by
pointer). **Branch:** `wave/3-communication`. **Baseline:** `301e6b3` (W3-COMM-1 support-tickets
pilot, CLOSED). **Authority:** `Doc-5H_Content_v1.0_Pass1..3` (23-contract partition — 19
caller-facing + 4 out-of-wire), `Doc-4H` Pass-B Parts 1/1b/2/3/4, `Doc-6H_Content_v1.0_Pass1..3`,
`docs/backend/growth_hub_p2_lane_routing.md` (lane exclusions). On any conflict the frozen
document wins.

---

## 1. Built surface (as of `301e6b3`)

| Layer | Built |
|---|---|
| `src/modules/communication/` | BC-COMM-4 vertical: domain (ticket state machine, audit tokens, `comm_support_ticket_*` codes), application (4 commands + 2 queries), infrastructure (support-ticket repo + `communication.command_dedup` §B.6 replay store), api wire mappers, contracts facade |
| `src/server/communication/` | Support-ticket composition (two-sided actor; `withActiveOrg` / `withStaffContext`; `[ESC-COMM-STAFF-AUTHZ]` advisory gate), §B.6 dedup helper |
| Routes | `POST/GET /communication/tickets` · `GET /communication/tickets/{id}` · `POST …/{id}/update_ticket` · `POST …/{id}/ticket-messages` · `POST …/{id}/close_ticket` |
| Prisma / migrations | `communication.support_tickets` + `ticket_messages` + enum + immutability trigger + RLS (`20260711160000`) · `communication.command_dedup` (`20260711161000`) · POLICY seeds (`communication.idempotency_dedup_window`, `communication.list_page_size_max` — Doc-3 v1.5) |
| Tests | `tests/integration/support-ticket-slice.test.ts` (8C) · `tests/integration/support-tickets-rls.test.ts` (8D) |

## 2. Contract-by-contract status (23 = 19 caller-facing + 4 out-of-wire — Doc-5H §1.2)

### BC-COMM-1 Messaging & Threads (8 caller-facing — Doc-5H §4; Doc-4H Pass-B Part 1/1b)

| # | Contract | Status |
|---|---|---|
| 1 | `comm.create_thread.v1` | **MISSING** |
| 2 | `comm.send_message.v1` | **MISSING** (RFQ scrub seam — see §4 note N1) |
| 3 | `comm.add_thread_participant.v1` | **MISSING** |
| 4 | `comm.remove_thread_participant.v1` | **MISSING** |
| 5 | `comm.close_thread.v1` | **MISSING** |
| 6 | `comm.get_thread.v1` | **MISSING** |
| 7 | `comm.list_threads.v1` | **MISSING** |
| 8 | `comm.get_messages.v1` | **MISSING** |

### BC-COMM-2 Notifications (4 caller-facing + 1 out-of-wire — Doc-5H §5/§8; Doc-4H Pass-B Part 2 + Patch)

| # | Contract | Status |
|---|---|---|
| 9 | `comm.mark_notification_read.v1` | **MISSING** |
| 10 | `comm.archive_notification.v1` | **MISSING** |
| 11 | `comm.get_notification.v1` | **MISSING** |
| 12 | `comm.list_notifications.v1` | **MISSING** |
| 20 | `comm.create_notification.v1` (out-of-wire, System event-consumer) | **MISSING** (contract service; per-event Inngest fan-out subscriptions gated on DH-1 — see §4 note N2) |

### BC-COMM-3 Delivery Tracking (1 caller-facing + 3 out-of-wire — Doc-5H §6/§8; Doc-4H Pass-B Part 3)

| # | Contract | Status |
|---|---|---|
| 13 | `comm.get_delivery_status.v1` | **MISSING** on this branch |
| 21 | `comm.create_delivery_record.v1` (out-of-wire, System dispatch job) | **MISSING** on this branch |
| 22 | `comm.update_delivery_status.v1` (out-of-wire, provider-webhook callback) | **MISSING** on this branch |
| 23 | `comm.retry_delivery.v1` (out-of-wire, System retry job) | **MISSING** on this branch |

> **Branch-coordination note (binding for WP sequencing):** `wave/3-communication-growth`
> (W3-COMM-GRW-1, gated 0·0·0, merged into `growth/integration`) already realized the **Doc-6H §3.3
> channel-log schema slice** (`email_logs`/`sms_logs`/`whatsapp_logs` + immutability triggers + RLS)
> and the additive `comm.dispatch_invitation_delivery.v1`. The four **frozen** Part-3 contracts
> above remain THIS lane's scope (`growth_hub_p2_lane_routing.md` routes away only the growth
> dispatch contract, its retry guard, the secure delivery store, and the M0 `ReadOutboxEvent`
> re-read). The BC-COMM-3 WP must therefore be built **after** reconciling with that branch's §3.3
> migration (identical Doc-6H §3.3 DDL; the integration merge must not apply it twice).

### BC-COMM-4 Support Communications (6 caller-facing — Doc-5H §7; Doc-4H Pass-B Part 4)

| # | Contract | Status |
|---|---|---|
| 14 | `comm.create_ticket.v1` | **BUILT** (`301e6b3`) |
| 15 | `comm.update_ticket.v1` | **BUILT** |
| 16 | `comm.add_ticket_message.v1` | **BUILT** |
| 17 | `comm.close_ticket.v1` | **BUILT** |
| 18 | `comm.get_ticket.v1` | **BUILT** |
| 19 | `comm.list_tickets.v1` | **BUILT** |

**Totals: 6 BUILT · 17 MISSING (13 caller-facing + 4 out-of-wire).**

## 3. Proposed WP slicing (tracker order: notifications → chat/threads → delivery logs)

| WP | Scope | Contracts | Schema | Notes |
|---|---|---|---|---|
| **W3-COMM-2** (this dispatch) | BC-COMM-2 Notifications vertical | 5 (#9–12 caller-facing + #20 as an in-process contract service) | Doc-6H §3.2 `notifications` + RLS | Audit = interim `[ESC-COMM-AUDIT]` binding (Doc-2 Patch v1.0.9 scope boundary keeps BC-COMM-2 on the interim marker); per-event fan-out subscriptions deferred (N2) |
| **W3-COMM-3** | BC-COMM-1 Messaging & Threads vertical | 8 (#1–8) | Doc-6H §3.1 `threads`/`messages`/`thread_participants` + RLS | `send_message` RFQ scrub seam empty-tolerant (N1); slug `can_use_messaging` (enumerated — Doc-5H §3.2) |
| **W3-COMM-4** | BC-COMM-3 Delivery Tracking | 4 (#13 read + #21–23 out-of-wire System) | Doc-6H §3.3 logs — **reconcile with `wave/3-communication-growth` first** | Provider-webhook ingress = infrastructure (R8); delivery logs never caller-writable (R12) |
| **W3-COMM-5** | Notification fan-out consumer wiring (Inngest subscriptions per producing-module §8 event) | consumer wiring for #20 (no new contract) | none | **Gated** on DH-1 Identity-owned notification rules / recipient resolution (`[ESC-COMM-NOTIF-RULES]`, §4 N2) |

## 4. Carried items / escalations for this remainder

- **N1 — RFQ scrub seam (DH-3/R7):** M3 does not exist until Wave 4. `comm.send_message.v1` on an
  `rfq_clarification` thread must read the RFQ-owned scrub rule via the RFQ service. W3-COMM-3
  builds the seam as an injected port that is **empty-tolerant** (no M3 → `rfq_clarification`
  thread creation carries the `rfq_id` as a bare UUID reference only); if review reads Doc-4H
  Part-1 as hard-requiring a live scrub verdict, the leg is `[ESC-*]`-recorded and skipped.
- **N2 — `[ESC-COMM-NOTIF-RULES]` (DH-1):** recipient resolution + title/body derivation for
  `comm.create_notification.v1` are **Identity-owned rules consumed read-only** (Doc-4H §HB-2.1).
  No such M1 surface exists yet. The contract service takes **resolved** recipients per the frozen
  request schema (recipient fields are inputs); the per-event fan-out subscriptions that would
  RESOLVE recipients stay unbuilt until the M1 rules surface exists (W3-COMM-5, Board-visible).
- **N3 — `[ESC-COMM-AUDIT]` (BC-COMM-2/BC-COMM-1 legs):** Doc-2 Patch v1.0.9 resolved the marker
  for **BC-COMM-4 only** and states the other M6 audited surfaces "remain on their interim
  binding" pending "a future, separate §9 additive that appends to this same Communication row."
  W3-COMM-2 follows the accepted W3-COMM-GRW-1 precedent: distinct interim serialization tokens,
  disclosed in `domain/audit-actions.ts` under the `[ESC-COMM-AUDIT]` marker, pending the Doc-2 §9
  additive + Doc-4H token-ratification patch (Board item).
- **N4 — `[ESC-COMM-SLUG]`:** no distinct Doc-2 §7 recipient read/state slug exists for
  notifications (Doc-4H §H5). The composition gates on authenticated User + server-resolved active
  org + recipient scope (RLS backstop); **no slug invented, none borrowed.**
- **N5 — Doc-2 corpus-copy collision (pre-existing, Board item):** this branch's
  `generatedDocs/Doc-2_Patch_v1.0.9.md` (support-ticket audit actions) collides with the main
  line's v1.0.9 (VBR) — renumbering already flagged by the Lane-C record in
  `growth_hub_p2_lane_routing.md`. Not resolved here.

---

*End of gap analysis. W3-COMM-2 (BC-COMM-2 Notifications) is the first build slice.*
