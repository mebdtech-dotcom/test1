# Journeys — Communication (M6)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File F — Communication
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M6 Communication (`communication` · Doc-4H)
**Journeys:** J-NTF · J-CHAT · J-TKT
**Legend/notation:** atlas §2 · **Actor journeys composed:** every actor journey rides these
rails (marketplace_ux.md §8)

> **Authority stance.** Non-authoritative companion. States resolve to **Doc-2 §3** (`threads`,
> `thread_participants`, channel logs, `support_tickets`); contracts to **Doc-4H** (BC-COMM-1
> Messaging · BC-COMM-2 Notifications · BC-COMM-3 Delivery Tracking · BC-COMM-4 Support).
> Binding rail: **M6 is delivery-only** — it transmits and logs, owns no business content, and
> its notifications are **M0-outbox consumers**; delivery logs are **append-only**. "Delivery
> Tracking" here means **message/channel delivery** — never goods delivery (that is J-DLV,
> File E). On any conflict the frozen corpus wins and this file is patched.

---

## F1. Notification Delivery Journey — `J-NTF`

**Breadcrumb:** Atlas ▸ Communication ▸ Notification Delivery Journey

| Ownership | |
|---|---|
| Owner Module | M6 Communication (BC-COMM-2 notifications · BC-COMM-3 delivery tracking) |
| Participating Modules | M0 (outbox producer side — every business event); all modules as event sources by pointer |
| Authoritative Documents | Doc-2 §3 (`email/sms/whatsapp` logs); Doc-4H BC-COMM-2/3 |
| Read-only References | Doc-7C (shell notification center) |

**Actors:** ⚙ System (consume → generate → dispatch). Primary — recipient User (read).

**Intent arc:** Event → Signal → Reach → Read.
**Goal:** turn frozen business events into delivered, logged, read notifications — without M6
ever owning the business fact.

**Entry:** a business event lands on the M0 outbox (e.g. `(VendorInvited)`, seam M6-2).
**Exit:** notification read in-app; channel log terminal `[delivered]` or `[failed]`.

```
outbox event → ⚙ consume (BC-COMM-2) → generate notification → dispatch per channel →
log [queued] → [sent] → [delivered] / [failed] → recipient reads (in-app)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3, channel log) | Outcome / governance |
|---|---|---|---|---|
| J-NTF-01 | Consume | ⚙ outbox consumer (BC-COMM-2, Doc-4H) | — | M6 consumes; **never produces business events** |
| J-NTF-02 | Generate | notification composition per event + recipient rules | — | Content by pointer to the owning module's fact |
| J-NTF-03 | Dispatch | channel adapters (email/SMS/WhatsApp/in-app) | `[queued] → [sent]` | Delivery-only; provider adapters replaceable (infrastructure) |
| J-NTF-04 | Track | delivery tracking (BC-COMM-3) | `[sent] → [delivered]` / `[failed]` | **Append-only logs** — audit-grade trail |
| J-NTF-05 | Read | in-app notification center | — | Read state is presentation; no business effect |

**Governance rails:** notification content must never leak what its recipient could not read
directly (byte-equivalence — e.g. deferral, exclusion, and buyer-private facts generate nothing);
a thread-close notification is a **derived effect of state**, not an event (Doc-4H Part1b).
**Success:** ✔ every notification traceable to an outbox event; ✔ channel trail append-only;
✔ zero disclosure beyond the recipient's own read rights.

**Related:** fan-out arm of seam M6-2 (J-RINV) and every event-emitting journey · surfaces in the
Doc-7C shell across all actor journeys.

---

## F2. Messaging Thread Lifecycle — `J-CHAT`

**Breadcrumb:** Atlas ▸ Communication ▸ Messaging Thread Lifecycle

| Ownership | |
|---|---|
| Owner Module | M6 Communication (BC-COMM-1, `threads` + `thread_participants` + messages) |
| Participating Modules | business anchors by pointer (RFQ clarifications → J-QUO/J-CMP; engagement talk → J-DSP) |
| Authoritative Documents | Doc-2 §3 (`threads.status open/closed`; `thread_participants.status active/removed`); Doc-4H BC-COMM-1 (+ Part1b Participant & Close, `comm.close_thread.v1`) |
| Read-only References | Doc-7F/7G messaging surfaces |

**Actors:** Primary — participant Users (`«can_use_messaging»`).

**Intent arc:** Question → Exchange → Resolution → Record.
**Goal:** governed conversation containers — messages are **append-only**; the only lifecycle is
the container's `[open] → [closed]`.

**Entry:** a thread exists (e.g. created around an RFQ clarification via `manage_clarification`)
with the actor as participant `[active]`.
**Exit:** thread `[closed]` (soft-delete = close; terminal-idempotent).

```
[open] → messages append (participants [active]) → participant changes → close (participant) → [closed]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-CHAT-01 | Converse | message + attachment appends (BC-COMM-1) | thread `[open]` | Append-only — nothing edited or deleted |
| J-CHAT-02 | Manage participants | participant grant/removal | participant `[active]` / `[removed]` | Granting requires the thread `[open]` (STATE error on closed) |
| J-CHAT-03 | Close | `comm.close_thread.v1` (participant; `expected_status` optimistic guard) | `[open] → [closed]` | **Participant-initiated only — no auto-close is ratified**; re-close = idempotent no-op |
| J-CHAT-04 | Notify | close notification | — | **BC-COMM-2 derived effect of state — emits no event** (→ J-NTF) |

**Governance rails:** threads carry conversation, never business state — a clarification thread
influences a quotation only through governed M3 contracts (J-QUO-04); attachments follow the
same append-only record; cross-party visibility is participant-scoped.
**Success:** ✔ container lifecycle exactly two states; ✔ appends immutable; ✔ close
participant-owned and idempotent.

**Related:** clarification legs J-QUO-04/J-CMP-03 · dispute talk J-DSP-04 · composed by
`J-PROC-10`, `J-SUP` exchanges.

---

## F3. Support Ticket Lifecycle — `J-TKT`

**Breadcrumb:** Atlas ▸ Communication ▸ Support Ticket Lifecycle

| Ownership | |
|---|---|
| Owner Module | M6 Communication (BC-COMM-4, `support_tickets`) |
| Participating Modules | M8 (staff handling side) |
| Authoritative Documents | Doc-2 §3 (`support_tickets`: `status open/in_progress/resolved/closed`, `organization_id`, `opened_by`, `subject`, `priority`); Doc-4H BC-COMM-4 |
| Read-only References | Doc-7E (user side) · Doc-7H (staff side) |

**Actors:** Primary — org User (opens). Supporting — staff (assign/resolve).

**Intent arc:** Problem → Help → Fix → Record.
**Goal:** platform support with a full audit trail — the user's problem, the staff's handling,
the resolution.

**Entry:** authenticated user with an org context (ticket carries `organization_id`, `opened_by`).
**Exit:** `[closed]` (only from `[resolved]`).

```
[open] → assign/work → [in_progress] → [resolved] → [closed]
(strictly linear per Doc-4H BC-COMM-4 — no reopen edge; a non-[resolved] ticket cannot be closed)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-TKT-01 | Open | `comm.create_ticket.v1` (subject, priority) | `[open]` | Org-scoped record |
| J-TKT-02 | Work | `comm.update_ticket.v1` (per-transition actor authority explicit) + `comm.add_ticket_message.v1` | `[open] → [in_progress]` | Staff act on the ticket by ID (Doc-7H) |
| J-TKT-03 | Resolve | `comm.update_ticket.v1` | `[in_progress] → [resolved]` | — |
| J-TKT-04 | Close | `comm.close_ticket.v1` | `[resolved] → [closed]` | Terminal; record retained; **only `[resolved]` may close** (Doc-4H) — an unhappy resolution opens a fresh ticket |

> **Variance note (registered):** Doc-4M §M5 consolidates additional ticket edges (reopen,
> non-resolved close) that the owning Doc-4H contracts forbid ("no state added; no transition
> added"). This journey binds the **Doc-4H** machine (per-module authority); the variance is
> Flag-and-Halt registered as **`ESC-JRN-TKT-MACHINE`** (esc_registry.md) — human corpus
> reconciliation, mirroring `ESC-7G-LEAD-MACHINE`.

**Governance rails:** support handling never becomes a bypass — a support action that touches a
business record executes through the owning module's contracts (Red-Flag: Admin never bypasses a
module's domain); ticket content follows tenancy (org + staff read).
**Success:** ✔ full status trail; ✔ reopen path exercised without new tickets; ✔ any business
side-effect attributable to an owning-module contract.

**Related:** staff side composed by `J-ADM` (console) · complaints that allege fraud route to
J-CMPL · user side surfaces in Doc-7E.

---

## Not Covered (File F ledger)

| Item | Why | Pointer |
|---|---|---|
| Goods-delivery tracking | False friend — BC-COMM-3 is message/channel delivery; physical logistics is challan-evidenced | J-DLV (File E) |
| Offline / push-notification device state | Not ratified (FE guardrail: no offline state, §11.3 planning rulings) | fe-planning governance |
| Email-only supplier participation | Future extension FX-EMAIL — reserved, not designed | marketplace_ux.md §12 |
| Notification preference matrix | Rides BC-COMM-2 config by pointer; no separate lifecycle | Doc-4H |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §8 (cross-journey
rails) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-F.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*
