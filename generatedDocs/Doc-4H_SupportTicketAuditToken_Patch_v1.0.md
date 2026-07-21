# Doc-4H_SupportTicketAuditToken_Patch_v1.0 — Support-Ticket Audit Token Serialization

> **✅ STATUS: APPROVED (human — owner ruling 2026-07-11) + FOLDED into the corpus.** Corpus copy
> `generatedDocs/Doc-4H_SupportTicketAuditToken_Patch_v1.0.md`, registered in `00_AUTHORITY_MAP.md`, carried
> **alongside** the unedited frozen Doc-4H Pass-A / Pass-B set — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-4H_SupportTicketAuditToken_Patch_v1.0_PROPOSAL.md`.
> **Linked-pair** with the Doc-2 business patch (`Doc-2_Patch_v1.0.11_CommunicationSupportAudit`) — folded together.
> (Renumber act 2026-07-21: the Doc-2 leg moved v1.0.9 → **v1.0.11** / PATCH-D2-09 → **PATCH-D2-10** — main-lineage
> collision; **this patch's own version and content are unchanged**, only its citations of the Doc-2 leg are re-pointed.)
>
> Mirrors the **serialization-realization** precedents `Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2` (D7) and
> `Doc-4B_OutboxAuditToken_Patch_v1.0` (M0 outbox): the **business action** is owned by Doc-2 §9; the **wire token
> strings + `entity_type` + `old_value`/`new_value` mapping** are owned **here** (Doc-4 realization).

## Status

Approved realization patch — FOLDED 2026-07-11 (linked-pair with `Doc-2_Patch_v1.0.11`)

| Field | Value |
|---|---|
| Applies to | `Doc-4H_PassA_v1.0_FROZEN` §HA-9 + Pass-B Part-4 §HB-4.1/§HB-4.2/§HB-4.3/§HB-4.4 (BC-COMM-4 audit bindings) |
| Depends on | `Doc-2_Patch_v1.0.11` (the four business actions under the new §9 **Communication** domain) — folded together |
| Scope | **Serialization only** — the `action` token strings, `entity_type`, and `old_value`/`new_value` field mapping for the four BC-COMM-4 audited mutations. **No** business action coined here (Doc-2 owns those); **no** entity/aggregate/state/slug/event/POLICY change; **no** frozen text edited in place. |
| Purpose | Realize `[ESC-COMM-AUDIT]` at the **wire/serialization** layer so W3-COMM-1 can bind **exported constants** (never string literals — Board ruling 2026-06-30) whose business meaning traces to Doc-2 §9 (via `Doc-2_Patch_v1.0.11`). |
| Authority | CLAUDE.md §7/§8/§11/§13; Doc-4H §H6/§H7 (audit binding; `[ESC-COMM-AUDIT]`); Doc-2 §9 (field set + the four business actions via `Doc-2_Patch_v1.0.11`); Doc-4B `core.append_audit_record.v1` (append primitive, unchanged); `REFERENCE_Audited_Write_Pattern_v1.0` (§2 rule 6 — canonical constants; §3 — canonical from first row). |

---

# PATCH-4H-AUDIT-01 — Support-Ticket Audit Token Serialization

**Location (resolved by pointer, not edited in place):** Doc-4H Pass-B Part-4 §HB-4.1/§HB-4.2/§HB-4.3/§HB-4.4
**Audit Binding** blocks — each currently reads `[ESC-COMM-AUDIT]` (nearest §9 action by pointer; no action invented).
This patch pins the serialized realization of the four now-canonical Doc-2 §9 **Communication** business actions.

## 1. Token realization (the exported constants)

Realized as `src/modules/communication/domain/audit-actions.ts` → `SupportTicketAuditAction` (named constants,
imported everywhere; **never** hardcoded literals):

| Doc-2 §9 business action | `action` token (string) | `entity_type` | Constant |
|---|---|---|---|
| support ticket **create** | `support_ticket_created` | `support_tickets` | `SupportTicketAuditAction.CREATED` |
| support ticket **status change** | `support_ticket_status_changed` | `support_tickets` | `SupportTicketAuditAction.STATUS_CHANGED` |
| support ticket **message append** | `support_ticket_message_appended` | `ticket_messages` | `SupportTicketAuditAction.MESSAGE_APPENDED` |
| support ticket **close** | `support_ticket_closed` | `support_tickets` | `SupportTicketAuditAction.CLOSED` |

**Action ≡ contract executed (record what actually happened).** `update_ticket` → `STATUS_CHANGED` for **every**
transition it performs (`open→in_progress`, `in_progress→resolved`, and `resolved→closed` when reached via
`update_ticket`); `close_ticket` → `CLOSED` (the dedicated terminal command). The two tokens distinguish the invoked
command even where the resulting state coincides — exactly the §9 **Engagement** row's "status change" vs "close"
distinction. Four distinct tokens so the immutable ledger records the executed leg.

## 2. `old_value` / `new_value` mapping (§9 field set — ids + meta, not free text)

| Token | `entity_id` | `old_value` | `new_value` |
|---|---|---|---|
| `support_ticket_created` | new `support_tickets.id` | `null` | `{ "status": "open", "subject": <subject>, "priority": <priority> }` |
| `support_ticket_status_changed` | `support_tickets.id` | `{ "status": <prior> }` | `{ "status": <target> }` |
| `support_ticket_message_appended` | new `ticket_messages.id` | `null` | `{ "support_ticket_id": <ticket id>, "author_id": <actor> }` |
| `support_ticket_closed` | `support_tickets.id` | `{ "status": "resolved" }` | `{ "status": "closed" }` |

- **Message body is NOT serialized into the audit ledger.** The append audit records **ids + meta** only
  (`support_ticket_id`, `author_id`) — the free-text `body` lives in the immutable `ticket_messages` row itself
  (append-only trigger), mirroring the Doc-2 §8 "payload = ids + meta" discipline and avoiding duplicating free text
  into `core.audit_records`. The opener message created by `create_ticket` is part of the ticket-create aggregate
  transaction and is audited under `support_ticket_created` **only** (one audit record per create — no separate
  `MESSAGE_APPENDED` on the opener; Doc-4H §HB-4.1).

## 3. Binding rules (unchanged frozen posture, pinned here)

- **Same transaction** as the business write, via `core.append_audit_record.v1` **only** (non-`RETURNING`
  `createMany`; app-minted UUIDv7) — Doc-4B / `REFERENCE_Audited_Write_Pattern` §2 rules 5/7. If the append throws,
  the ticket/message write rolls back; if the write fails, no audit row is written.
- **Actor:** server-resolved — `actor_id` = acting user, `actor_type` = `User` (opener) or `Admin` (Support Staff),
  `organization_id` = active org (User leg) — never client input; the audit RLS `WITH CHECK` re-verifies. (Admin/staff
  leg attribution per Doc-2 §9 `actor_type[…Admin…]`; `staff_can_support`.)
- **No §8 event.** BC-COMM-4 emits none (Doc-4H §H7 / Doc-5H R11) — the audit record is the sole compliance record.
  This is the M6 audited-write variant: **write + audit, one txn, no outbox event** (unlike D7's write+audit+event).
- **Reads unaudited** (`get_ticket`/`list_tickets`) — Doc-4A §17.1.

## 4. Marker resolution (recorded, not edited in place)

- Doc-4H §HB-4.1 `[ESC-COMM-AUDIT]` → `support_ticket_created`.
- Doc-4H §HB-4.2 `[ESC-COMM-AUDIT]` → `support_ticket_status_changed`.
- Doc-4H §HB-4.3 `[ESC-COMM-AUDIT]` → `support_ticket_message_appended`.
- Doc-4H §HB-4.4 `[ESC-COMM-AUDIT]` → `support_ticket_closed`.

BC-COMM-4's other markers (`[ESC-COMM-SLUG]` residual read-slug; `[ESC-COMM-POLICY]` dedup — already cleared by
Doc-3 v1.5) are **unaffected**. The BC-COMM-1/2/3 `[ESC-COMM-AUDIT]` bindings remain interim (out of scope — resolved
by future additive patches appending to the §9 Communication row).

---

*End of Doc-4H_SupportTicketAuditToken_Patch_v1.0 — serialization-only realization of the four Doc-2 §9
Communication (support-ticket) business actions: four `action` tokens + `entity_type` + `old_value`/`new_value`
mapping; exported as `SupportTicketAuditAction.*`; no business action coined here, no event, no slug, no schema/state
change. **APPROVED & FOLDED (human, owner ruling 2026-07-11); linked-pair with
`Doc-2_Patch_v1.0.11_CommunicationSupportAudit`.***
