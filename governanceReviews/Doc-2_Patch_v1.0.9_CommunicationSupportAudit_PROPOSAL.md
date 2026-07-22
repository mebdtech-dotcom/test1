# Doc-2_Patch_v1.0.9_CommunicationSupportAudit_PROPOSAL.md

> **⏳ STATUS: PROPOSED — awaiting human (owner/Board) approval + fold.** On approval this becomes the corpus
> copy `generatedDocs/Doc-2_Patch_v1.0.9.md` (producing **Doc-2 v1.0.9**), registered in `00_AUTHORITY_MAP.md`,
> carried **alongside** the unedited frozen `Doc-2_…_v1.0.2` (+ patches v1.0.3…v1.0.8) — **no frozen file edited
> in place.** **Linked-pair** with the Doc-4H realization patch
> (`Doc-4H_SupportTicketAuditToken_Patch_v1.0`) — to be approved/folded together.
>
> Mirrors the **D7 precedent** (`Doc-2_Patch_v1.0.4_BuyerProfileAudit` + `Doc-4C_BuyerProfileAuditToken`): Doc-2
> carries **business semantics only**; the wire-level audit **token** realization lives in the Doc-4H patch.

## Status

Proposed Patch — awaiting human approval (architecture-affecting → CLAUDE.md §8)

| Field | Value |
|---|---|
| Applies to | `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` (+ additive patches v1.0.3…v1.0.8) |
| Produces | Doc-2 **v1.0.9** (v1.0.8 + this patch) |
| Scope | **One additive business audit domain** — a new **Communication** row in §9 Audit Mapping enumerating **four** support-ticket business actions — **nothing else.** No entity changes, no ownership changes, no schema changes, no event-catalog changes, no state-machine changes, no slug/permission changes, **and no wire-level token/serialization** (that is the Doc-4H realization patch's remit, per the D7 Board ruling). |
| Purpose | **Resolve `[ESC-COMM-AUDIT]` for the BC-COMM-4 (Support Communications) mutations** (`comm.create_ticket.v1`, `comm.update_ticket.v1`, `comm.add_ticket_message.v1`, `comm.close_ticket.v1`) at the **business-semantic** layer. Doc-2 §9 enumerates **no Communication audit domain** (the frozen `[ESC-COMM-AUDIT]` marker names exactly this gap: Doc-4H §H6/§H7, Doc-5H §7.5, Doc-6H §8). The first M6 audited write therefore has **no canonical §9 action** to record. This patch enumerates the four support-ticket business actions so the immutable ledger is **semantically correct from the first persisted row.** |
| Raised by | W3-COMM-1 (M6 support-ticket pilot slice) prerequisite; owner-directed (2026-07-11): `[ESC-COMM-AUDIT]` resolution = **Path A** (additive Doc-2 §9 + Doc-4H serialization, human-approved) — "the audit action must be canonical from the first persisted row" (`REFERENCE_Audited_Write_Pattern_v1.0` §3). |
| Authority | CLAUDE.md §7 (authority order; Doc-2 = rank 0), §8 (architecture-affecting → **human approval**), §11 (additive only; never edit a frozen doc in place), §13; Doc-2 §9 (Audit Mapping); Doc-4H §H6/§H7 + `[ESC-COMM-AUDIT]` (the gap this resolves at the business layer); Doc-5H §7.5 (audit binding, unchanged); Doc-4B `core.append_audit_record.v1` (the append primitive, unchanged). |

All frozen architecture decisions, aggregate boundaries, ownership rules, tenancy rules, the §9 field set, the
delivery-only / single-authorship / non-disclosure firewalls, and the `core.append_audit_record.v1` primitive are
**preserved**. The freeze on Doc-2 remains in force; this patch is the minimal additive exception, routed through
change management (human approval), mirroring the lifecycle used for `Doc-2_Patch_v1.0.4` (D7 buyer-profile audit).

---

# PATCH-D2-09 — Communication (Support-Ticket) Audit Actions (resolves `[ESC-COMM-AUDIT]` for BC-COMM-4, business layer)

**Location:** §9 Audit Mapping — a **new domain row** ("Communication") appended to the "Actions that MUST create
audit records" table.

**Rationale for a new Communication domain.** The **Support Ticket** aggregate (`communication.support_tickets` +
`communication.ticket_messages`) is owned by **M6 Communication, BC-COMM-4** (Doc-4H Pass-A §HA-4.4, A-04; Doc-2
§10.7). No existing §9 domain owns it — it is **not** RFQ/Quotation/Vendor/Organization/Financial/Trust/Buyer-CRM/
Profile-experience/Documents/Engagement/Reviews/Admin/Platform. The frozen `[ESC-COMM-AUDIT]` marker names the gap
verbatim ("Doc-2 §9 enumerates no Communication audit domain"); its channel is "Doc-2 §9 additive." This patch adds
that domain — the **canonical home** the interim marker already pointed to — and enumerates only the support-ticket
actions realized by W3-COMM-1.

**Exact additive change** — append **one new domain row** enumerating **four** business actions, following the §9
style that keeps distinct lifecycle legs distinct (mirroring the **Engagement** row's "open, status change, close"
and the create-≠-update separation the Board ruled on for buyer-profile):

```
support ticket create, status change, message append, close
```

**Business-action semantics (each MUST create an audit record):**

| Business action | Trigger contract | Aggregate row | actor_type |
|---|---|---|---|
| support ticket **create** | `comm.create_ticket.v1` | `support_tickets` (enters `open`) + opener `ticket_messages` | User |
| support ticket **status change** | `comm.update_ticket.v1` | `support_tickets` (`open→in_progress`, `in_progress→resolved`, `resolved→closed`) | User / Admin |
| support ticket **message append** | `comm.add_ticket_message.v1` | `ticket_messages` (append-only) | User / Admin |
| support ticket **close** | `comm.close_ticket.v1` | `support_tickets` (`resolved→closed`, terminal) | User / Admin |

**Layer boundary (D7 Board ruling — preserved).** Doc-2 enumerates **only the business actions**. The **wire-level
realization** — serialized `action` token strings, `entity_type`, and the `old_value`/`new_value` mapping — is **NOT**
specified here; it is owned by the **Doc-4H realization patch** (`Doc-4H_SupportTicketAuditToken_Patch_v1.0`), so a
future change to *serialization* touches Doc-4H, never reopens rank-0 Doc-2.

**Rules (business-semantic):**

- **Audited in the SAME transaction** as the ticket/message write, via `core.append_audit_record.v1` **only**
  (Doc-4B §A10 / §17.1; the proven `audit_records_context_append` RLS path, ADR-021) — atomic with the business
  write. Create, status change, message append, and close are **distinct** audit actions (the command records
  whichever leg it executed).
- **Actor:** the acting **User** (ticket opener, own-org) **or Admin** (Support Staff, `staff_can_support`) — Doc-2 §9
  governance label `actor_type[User|Admin|…]`, unchanged. Attribution is the standard §9 field set (`audit_id,
  actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address,
  user_agent`) — unchanged. (Admin acts via `staff_can_support`; ownership never transfers to M8 — Doc-5H m-COMM-03.)
- **No event coined:** Doc-2 §8 posture intact — BC-COMM-4 emits **no** domain event and consumes none (Doc-4H §H7 /
  Doc-5H R11); the audit record is the sole compliance record. **This is not a D7 clone** — there is **no** outbox
  event leg; the M6 audited write is `business write + audit append` in one transaction.
- **Scope boundary — only support tickets:** this patch resolves `[ESC-COMM-AUDIT]` **for the four BC-COMM-4
  mutations only.** The other M6 audited surfaces that also carry `[ESC-COMM-AUDIT]` — BC-COMM-2 notification
  read-state (`mark_notification_read`, `archive_notification`) and BC-COMM-1 messaging (`send_message`,
  participant/close) — **remain on their interim binding** and are **out of scope** here (a future, separate §9
  additive that **appends** to this same Communication row — kept small per the D7 precedent). This patch coins
  **four** business audit actions, nothing more.

---

# Resulting §9 Audit Mapping table (additive row — full context)

Before (tail of the §9 domain table):

```
| Admin | ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss |
| Platform | system_configuration change, feature flag change, audit redaction (event), Super Admin access (flagged), service-role sensitive operations |
```

After (one new **Communication** row appended; every other row unchanged):

```
| Admin | ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss |
| Platform | system_configuration change, feature flag change, audit redaction (event), Super Admin access (flagged), service-role sensitive operations |
| Communication | support ticket create, status change, message append, close (BC-COMM-4; User opener / Support Staff; emits no §8 event) |
```

(Every other §9 domain row is unchanged. The §9 preamble, field set, and redaction rule are unchanged.)

---

# Downstream resolution (recorded, not edited here)

- **Doc-4H realization patch (companion):** `Doc-4H_SupportTicketAuditToken_Patch_v1.0` pins the **serialized
  realization** of these four business actions — the `action` token strings, `entity_type`, and `old_value`/
  `new_value` mapping. The token literals are owned **there** (Doc-4 realization), not in Doc-2 (D7 Board ruling).
- **Doc-4H §H6/§H7 (BC-COMM-4):** the `[ESC-COMM-AUDIT]` marker on the four mutations is **resolved by pointer** —
  the business action is now a canonical §9 enumeration (this patch) and its serialization is pinned in the Doc-4H
  realization patch. Doc-4H's frozen text is **not edited in place**; the resolution is recorded. `[ESC-COMM-SLUG]`
  and `[ESC-COMM-POLICY]` on BC-COMM-4 are **unaffected** (the latter already cleared by Doc-3 v1.5).
- **W3-COMM-1 (M6 support-ticket pilot):** implements the four mutations against the **exported audit-action
  constants** (`SupportTicketAuditAction.*`, sourced from the Doc-4H-pinned tokens) — never hardcoded literals — so
  the audited writes ship with a canonical Doc-2 §9 business action from row one.

---

*End of Doc-2_Patch_v1.0.9 (PROPOSED) — minimal additive §9 enumeration of the **four business** support-ticket audit
actions under a new **Communication** domain; resolves `[ESC-COMM-AUDIT]` for the BC-COMM-4 mutations only at the
business-semantic layer; coins four business actions, no token/serialization, no event, no slug, no schema/ownership/
state change. Serialization is the Doc-4H realization patch's remit (D7 Board ruling). Downstream: Doc-4H §H6/§H7
(markers resolved by pointer + token realization), Doc-4B `core.append_audit_record.v1` (unchanged), W3-COMM-1
(exported action constants). **Linked-pair with `Doc-4H_SupportTicketAuditToken_Patch_v1.0`. Awaiting human approval
+ fold.***
