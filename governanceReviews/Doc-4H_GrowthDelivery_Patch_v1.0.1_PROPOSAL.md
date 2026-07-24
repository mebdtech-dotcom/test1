# Doc-4H — Additive Patch v1.0.1 (Growth Hub: Invitation External Delivery) — M6 Communication

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside the frozen Doc-4H set (`Doc-4H_PassA_v1.0_FROZEN` + PassB Parts 1–4) **without editing it in place**. |
| **Date** | 2026-07-19 · **Kind** Additive — **one new BC-COMM-3 System consumer contract** (`comm.dispatch_invitation_delivery.v1`, authored §HB-3.6-style in the frozen Part-3 12-section grammar), the Part-3 §H.7 consumption flip, an invitation-specific **retry guard**, and the GI-3 confinement bindings. Coins **no** entity, state, transition, slug, audit action, POLICY key, template, or domain event (packet §B4: *"No new domain event required"*). |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.3(1) (`InvitationIssued`, consumer M6) + §A.4(4) (`identity.resolve_invitation_delivery_payload.v1`) + §A.7 **GI-3** (confinement + the **M6 operational exception**) + **§B4** (external-address delivery; delivery-result lifecycle owned by M6's frozen delivery log; duplicate-consumer suppression idempotent on `event_id`; **must not retry a `revoked`/`expired` invitation**; targeted channels only); Q-16 (ratified with the delivery-security revision); frozen Part-3 grammar (H.1–H.10, the 12-section record shape); the §HB-2.1 consumed-event-effect model; Doc-4A §4.4 (single-authorship) + §16 (event contract standard) + §16.5 payload rules. |
| **Depends on** | `Doc-2_Patch_v1.0.11` §4 (the event), `Doc-4C_…v1.0.3` (the delivery-payload contract — internal-service, M6 sole caller), `Doc-4J_…v1.0.1` (catalog), `Doc-4L_…v1.0.1` (flow row L9-1), `Doc-3_…v1.12_GrowthHub` (the invite POLICY keys — renumbered to v1.12 — the next verified-available Doc-3 version on `main` per Amendment A-1; §6 fold-note). **Atomic fold** — the consumer's trigger and its payload source do not exist without them. |

---

## §1 — Why BC-COMM-3, and why a new contract

The invitee is **external — not yet a platform identity**. BC-COMM-2's consumed-event effect
(`comm.create_notification.v1`) is structurally unreachable for this delivery: its recipient fields
(`recipient_user_id`/`recipient_organization_id`, Doc-2 §10.7) are platform identities and its channel is
`in_app` only. **No notification is created for an invitation — BC-COMM-2 is untouched.** The delivery is
an **Outbound Log dispatch**: BC-COMM-3's frozen aggregate already carries the three targeted channel
structures (`email_logs`/`sms_logs`/`whatsapp_logs` — the `recipient_type` enum `email|sms|whatsapp` maps
1:1 onto the frozen `channel` enum), a value-typed `recipient_ref`, and the frozen delivery lifecycle
`queued → sent → delivered | failed` (+ `failed → queued` retry) that the packet **pins as the
delivery-result owner** (§B4 / Board MINOR-1). What the frozen inventory lacks is a **trigger**: Part-3's
write path is driven only by the internal BC-COMM-2 fan-out and the provider callback, and Part-3 §H.7
consumes no Doc-2 §8 event. This patch adds that trigger as **one new System consumer contract** — the
§HB-2.1 consumed-event-effect model applied in BC-COMM-3 — leaving all four frozen Part-3 contracts
verbatim. Open `link`/`qr` invitations never reach M6 (no event is emitted for them — Doc-2 §8 row).

---

## §HB-3.6 (NEW) — `comm.dispatch_invitation_delivery.v1` — Dispatch Invitation Delivery (consumed-event effect)

**1. Contract Metadata** — **Contract ID:** `comm.dispatch_invitation_delivery.v1` · **Name:** Dispatch
Invitation Delivery · **Owning BC:** BC-COMM-3 · **Aggregate:** Outbound Log
(`email_logs`/`sms_logs`/`whatsapp_logs`) · **Operation Type:** 21.5 System (consumed-event effect) ·
**Actor:** System (no active org context — Doc-4A §5.2/§15.5) · **Permission Family:** none (System; no slug).

**2. Request Schema** *(driven by the consumed `InvitationIssued` event — not a public API surface; fields = the event payload, Doc-2 §8 as amended by `Doc-2_Patch_v1.0.11` §4)*

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `event_id` | uuid | Required | Doc-2 §8; Doc-4A §16 | the consumed event id — the idempotency key (packet §B4 duplicate-consumer suppression) |
| `occurred_at` | timestamptz | Required | Doc-2 §8 (amended) | event envelope timestamp; carried — not dispatch-relevant |
| `growth_invitation_id` | uuid | Required | Doc-2 §8 (amended) | opaque M1 reference; never dereferenced by table — M1 data arrives only via the delivery-payload contract |
| `recipient_type` | enum(`email`,`sms`,`whatsapp`) | Required | Doc-2 §8 (amended) | targeted only (the event never fires for `link`/`qr`); maps 1:1 to the frozen `channel` enum |
| `delivery_reference_id` | uuid | Required | Doc-2 §8 (amended); packet §A.4(4) | the handle for `identity.resolve_invitation_delivery_payload.v1` — **the event carries no raw token and no `recipient_identifier`** (Doc-4A §16.5 thin-payload / GI-3 / Board MAJOR-1) |

**3. Response Schema** — **21.5 System: `Response: none`** (consumer effect). Internal result: the created
channel-log row at `status=queued` — (`id`, `channel` = the mapped `recipient_type`, `recipient_ref` =
`recipient_identifier` (fetched transiently, §5), `template`, `status=queued`, `source_event_id` =
**`event_id`**, `created_at`) — the frozen §HB-3.1 row shape, no column added. **`template` provenance:**
the invitation provider-template id is selected by **infra-owned provider/template configuration** (the
frozen Part-3 model — "provider template id … referenced only"; provider configuration is not owned by
BC-COMM-3); the BC-COMM-2 content-ownership constraint does not apply on this path (no notification
exists); the only M1-sourced render parameter is the transient `signed_invitation_url`; selection detail =
implementation scope, **no template coined**. **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2
§10.7; Doc-4A §15.5/§12.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `recipient_type` ∈ enum; ids uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is **System**; inbound is the registered `InvitationIssued` consumption | `SYSTEM` |
| 3 AUTHZ | Doc-4A §15.5 | System effect — no slug; not user-initiated | — |
| 4 SCOPE | Doc-4A §7.3 | writes Communication's own channel-log row only | — |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (Part-3 H.3) | — |
| 6 STATE | Doc-2 §10.7 | n/a — create has no prior state (enters `queued`); **pre-dispatch liveness:** the payload resolve (stage 7) returns the sole go/no-go — a not-live invitation yields no dispatch | — |
| 7 REFERENCE | Doc-4A §4.5; DH-1 | `delivery_reference_id` resolves via `identity.resolve_invitation_delivery_payload.v1` (internal-service, M6 sole caller — `Doc-4C_…v1.0.3` §C13) → `{recipient_type, recipient_identifier, signed_invitation_url}`; the **definitive** `identity_growth_invite_delivery_not_resolvable` (unknown/`revoked`/`expired` — the reconciled seam split) → no dispatch (permanent, no row); the **transient** `identity_growth_invite_delivery_unavailable` → `DEPENDENCY` (retryable); the provider `template` resolvable (the frozen §HB-3.1 stage-7 model) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | dispatch logging only — **no business decision** (transport, never decide, Part-3 H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dispatch dedup + retry/backoff ride the frozen `[ESC-COMM-POLICY]` keys; no new key coined | — |

**5. Authorization Matrix** — **Actor:** System · **Authority:** Doc-4A §5.2/§15.5 · **Scope:** writes
Communication's own channel-log rows only; reads M1 **only** through the delivery-payload contract (DH-1
seam — never a table) · **Restrictions:** no user slug; cannot act outside the consumed-event effect ·
**Cross-tenant:** n/a (external recipient; no tenant row is read) · **Protected-fact:** n/a (no
caller-facing existence probe).

**6. State Enforcement** — Creates the channel-structure row (selected by `recipient_type`) at **`queued`**
— the frozen entry transition of the frozen lifecycle `queued → sent → delivered | failed` (+ `failed →
queued` retry). Downstream advancement is **exclusively** the frozen `comm.update_delivery_status.v1` /
`comm.retry_delivery.v1` machinery (the packet-pinned delivery-result owner). **No state invented; no
transition added.**

**7. Audit Binding** — Audit trigger: invitation-delivery dispatch · Audit owner: Communication ·
Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by
pointer; **no action invented**) · Required audit record: attribution **System**,
`entity_type=<channel>_logs`, `entity_id`, action, `event_id`, `delivery_reference_id`, timestamp via
Doc-4B (in-transaction). **The audit record carries NO `recipient_identifier` and no signed URL** (GI-3 —
the address lives only in the channel-log row, §5 below).

**8. Event Binding** — **Consumed:** **`InvitationIssued`** (M1-owned; Doc-2 §8 as amended; catalog =
`Doc-4J_…v1.0.1`; flow = `Doc-4L_…v1.0.1` L9-1), idempotent on `event_id` (Doc-4A §16). **Produced:**
**none** — packet §B4: *"No new domain event required"*; delivery outcomes stay in the Outbound Log.
**Ownership:** the producing module (M1) owns the event; dispatching transfers no ownership
(single-authorship, Doc-4A §4.4 — M1 authored the production and delivery-payload contracts; M6 owns only
this consumer effect).

**9. Error Register** — `VALIDATION` (malformed event fields) · `SYSTEM` (non-System invocation /
unrecognized event) · `REFERENCE` (M1 returns the definitive `identity_growth_invite_delivery_not_resolvable`
— unknown/`revoked`/`expired`; or the template does not resolve — no dispatch, `retryable:false`) ·
`DEPENDENCY` (M1 returns the transient `identity_growth_invite_delivery_unavailable`, or the channel
provider is transiently unavailable — `retryable:true`). No `AUTHORIZATION` (System). No `STATE` (create).
No new error code coined **here** (both M1-side codes are Doc-4C's — the reconciled §C13 register;
provider-side handling is the frozen Part-3 register's).

**Error Boundary block (Doc-4A §12.4/§12.6):** `REFERENCE` (definitive: not-live/unknown reference —
**terminal, never re-dispatched**) is distinct from `DEPENDENCY` (transient: resolve/provider unavailable
— retried under the frozen POLICY budget) — never merged (Part-3 H.4). `Timing-Uniformity`: n/a (no
caller-facing existence probe).

**10. Idempotency Rules** — `Idempotency: required`; **consumer-idempotent on `event_id`** (packet §B4
duplicate-consumer suppression; Doc-4A §16) — re-delivery of the same event → the same channel-log row,
**no duplicate row, no duplicate audit, no duplicate provider send**; the row-level dedup composes with
the frozen fan-out-unit key (`source_event_id` + recipient + channel = here `event_id` +
`recipient_identifier` + channel). Dedup window `[ESC-COMM-POLICY]` (no key invented).

**11. Cross-Module References** — **Identity (DH-1):** the consumed `InvitationIssued` event + the
`identity.resolve_invitation_delivery_payload.v1` call (the **sole** M1 data path — GI-3); no new
dependency marker coined. **Platform Core (DH-8):** audit/outbox. **Channel providers:** infra transport
(configuration not owned). No producer entity owned; no score (DH-5 firewall); no procurement decision
(DH-3 moat).

**12. AI-Agent Notes** — System-only consumed-event effect; **never user-initiated**. Fetch the recipient
and the signed one-time URL **just-in-time** via the delivery-payload contract — **never from the event,
never from an M1 table**. The address enters ONLY the channel-log row (`recipient_ref`) and the provider
call; the signed URL is consumed at send time and **never persisted** (the log stores `template` +
`provider_ref` — the frozen schema has no content column). Map `recipient_type`→channel 1:1; `link`/`qr`
never arrive. Dedup strictly on `event_id`. A not-live invitation = terminal no-dispatch, never retried.
Compute no score (firewall); decide nothing (moat). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §2 — Invitation retry guard (binds the dispatch path; frozen `retry_delivery` untouched)

The frozen retry machinery (`comm.retry_delivery.v1`: `failed → queued`, POLICY budget, `RATE_LIMITED` on
exhaustion) **owns** invitation-delivery retries unchanged. This patch adds one **pre-re-dispatch guard on
the invitation dispatch path only** (packet §B4, binding).

**Executor and inputs (Review-B F-1):** the guard runs in the **invitation-delivery retry-job
orchestration** (implementation-wired — the §6 "consumer wiring (Inngest)" scope), **before** it invokes
the frozen `comm.retry_delivery.v1`. Invitation-origin rows are identified by their persisted
`source_event_id` (= the consumed `event_id`); the guard's `delivery_reference_id` is recovered by
re-reading the **persisted M0 outbox event payload** for that `event_id` (Doc-4B) — **never a new
channel-log column, never an M1 table read.** The guard then **re-resolves**
`identity.resolve_invitation_delivery_payload.v1`:

- **live** → re-dispatch proceeds under the frozen budget (a fresh short-lived signed URL is obtained;
  the stale one is never re-sent);
- **not live** — the definitive `identity_growth_invite_delivery_not_resolvable` (unknown/`revoked`/
  `expired` — the reconciled Doc-4C §C13 register) → **permanent-failure classification: the record stays
  `failed`, no re-queue, no provider send** — *"must not retry a `revoked`/`expired` invitation"* (§B4).
  *(Redemption capacity is not a resolve predicate — an exhausted-but-live targeted invitation still
  resolves; GI-1 gates at redemption, so a re-send is harmless.)*

Provider-timeout handling, **provider-side** permanent-failure classification, and the retry/backoff
budget remain the frozen Part-3 register's (`[ESC-COMM-POLICY]`; `RATE_LIMITED` ≠ `DEPENDENCY`). No frozen
contract row, stage, or error changes; the guard is orchestration-level, outside every frozen contract
body.

---

## §3 — Consumption flips (additive; the Doc-4I §2 model)

**(a) Part-3 §H.7.** Frozen (Part3:25) reads: *"**BC-COMM-3 emits NO Doc-2 §8 domain event and consumes
none** (Doc-4A §16.4 — no event coined)."* Effective reading:

> **BC-COMM-3 emits no Doc-2 §8 domain event and — via this patch — consumes exactly one: the M1-owned
> `InvitationIssued`** (idempotent on `event_id`; ownership stays with M1; no event coined).

The same addition reads into the Part-3 consolidation invariants line (Part3:242 — *"Emits zero Doc-2 §8
events and consumes none"*) and the frozen Pass-A event inventory (HA-7/B.6), which gains the
`identity → InvitationIssued → BC-COMM-3 dispatch` consumption row.

**(b) BC-COMM-2 untouched.** Part-2 §H.7's consumed catalog (B.6 — DH-2…DH-7 producers) is **not**
extended: `InvitationIssued` is consumed by **BC-COMM-3** (this patch), not by the notification effect;
no in-app notification exists for an external invitee. Every Part-2 contract, row, and invariant stands
verbatim.

---

## §4 — Register overlay (Part-3 §HB-3.5 consolidation table) — one row added

| Contract | Op | Aggregate | Actor | Permission | Events | Audit |
|---|---|---|---|---|---|---|
| `comm.dispatch_invitation_delivery.v1` | 21.5 System | Outbound Log (`<channel>_logs`) | System | none (System) | **consumes `InvitationIssued`** (M1-owned); produces none | `[ESC-COMM-AUDIT]` |

The four frozen rows stand verbatim; the frozen contract-inventory gate (Part3:13) is respected — the
frozen four are neither renamed nor altered; this patch **adds** a fifth via the additive channel.
**Pass-A inventory overlay (Review-A F-2):** the authoritative Pass-A inventory (**§HA-4.3 / Appendix A
rows 10–13**) reads effectively as **five** BC-COMM-3 contracts — the frozen four **+
`comm.dispatch_invitation_delivery.v1`** (declared here, the §3(a) HA-7/B.6 treatment applied to the
contract inventory; the frozen rows untouched) — so a future audit run against §HA-4.3 finds no
unregistered contract.

---

## §5 — GI-3 confinement bindings (packet §A.7 — the M6 operational exception, exactly scoped)

- The **external address** (`recipient_identifier`) is obtained **transiently** per dispatch/retry via
  the delivery-payload contract and persists **only** in the append-only channel-log row
  (`recipient_ref`) — *"delivery infrastructure, barred from M1 business data / cross-module events /
  analytics / audit"* (GI-3). It never enters a §9 audit record, a Doc-2 §8 event, an analytics
  projection, or any other M6 surface.
- The **signed invitation URL** is short-lived/one-time (Doc-4C §C13); it is consumed at provider-send
  time and never persisted anywhere in M6.
- M6 holds **no M1 business data**: `growth_invitation_id`/`delivery_reference_id` are opaque references;
  invitation state is never cached — liveness is re-checked through the contract on every (re-)dispatch
  (§2).

---

## §6 — Boundary re-affirmations, compatibility & checklist

- **Frozen inventory intact:** the four Part-3 contracts, the lifecycle (`queued → sent → delivered |
  failed` + `failed → queued`), the append-only aggregate, H.1–H.10, and every Part-1/1b/2/4 surface
  stand verbatim. BC-COMM-2/BC-COMM-1/BC-COMM-4 untouched.
- **Delivery is transport, never a decision** (Part-3 H.10): a delivery outcome is an observability fact;
  no score, no procurement signal, no governance signal.
- **Single-authorship (Doc-4A §4.4):** M1 authored the event production and the delivery-payload
  contract; M6 authors only this consumer effect — the `VendorBanned` consumer model.
- Carried markers **identity-unchanged**: DH-1/DH-8, `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`,
  `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]` (still "none today" for **emission**). **DH-1's consumed content
  grows** (Review-A F-6, declared here): + the `InvitationIssued` consumption + the
  `identity.resolve_invitation_delivery_payload.v1` call (§HB-3.6 item 11); the marker itself is
  unchanged. Carried realization: event/payload = `Doc-2_Patch_v1.0.11` §4; payload contract =
  `Doc-4C_…v1.0.3` §C13; catalog = `Doc-4J_…v1.0.1`; flow = `Doc-4L_…v1.0.1` L9-1; POLICY keys =
  `Doc-3_…v1.12_GrowthHub` (`[DC-5]`); consumer wiring (Inngest) = implementation scope.
  **Fold-notes:** the set's `[DC-5]` label reuse is a fold-confirm item (the original `[DC-5]` was
  cleared by Doc-3 v1.9 — the `00_AUTHORITY_MAP.md` Doc-3 v1.9 row, :131 at Final-Gate audit time,
  cite-by-row governs); and the packet's "Doc-3 v1.13" number was
  **contested** by a pending EvidenceHandling POLICY-key proposal (a branch-only working record — neither on `main` nor carried here) (Review-B
  F-5) — **resolved on reconcile: the sibling is authored as `…v1.12_GrowthHub` — the next verified-available Doc-3 version on `main` — per Amendment A-1**; the Board re-verifies both
  numbers at fold.

**Checklist:** □ no new module · □ no ownership change · □ no governance-signal change · □ no
cross-module DB access/FK (M1 data only via the delivery-payload contract) · □ no frozen doc edited ·
□ no event/state/slug/audit-action/POLICY-key/template coined · □ one new contract-ID added additively
(the packet §B4 mandate) · □ GI-3 confinement bound (§5) · □ revoked/expired never retried (§2) ·
□ targeted channels only · □ atomic fold with the 9 sibling patches.
