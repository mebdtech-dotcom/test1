# Doc-5H — Communication (M6 `communication`) API Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents for Doc-5H |
| Freeze Date | 2026-06-25 |
| Supersedes | `Doc-5H_Structure_Proposal_v0.1.md` (effective v0.2 — Board pre-authoring findings 1 BLOCKER + 4 MAJOR + 6 MINOR + 7 NITPICK incorporated; Independent Hard Review 2 MINOR + 2 NITPICK applied; authoring history + findings map retained there). Freeze readiness certified by `Doc-5H_Structure_Freeze_Audit_v1.0.md` |
| Module | Module 6 — Communication (`communication` schema; the delivery-only transport / fan-out layer) |
| Realizes | `Doc-4H` (M6 contracts, FROZEN — **23 contracts**, PassB BC-COMM-1…4 per-Contract-ID blocks) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B` (M0) out-of-wire boundary (R1); `Doc-5C` (M1) cross-cutting context/non-disclosure wire model; `Doc-5D` (M2) per-read disclosure-scope + per-command actor-side rule (§3 origin); `Doc-5F` (M4) two-sided actor + route/token split + state-map sharpening |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN — Core/Realtime consumed), Doc-4C v1.0 (FROZEN — Identity consumed), Doc-4H v1.0 (FROZEN), Doc-4M v1.0 (FROZEN — cross-module state-machine index; communication edges defined in Doc-2 §3.7/§10.7 + Doc-4H), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (with section-pointer column), ratified realization decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5H content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape this document:

1. **Realize, never re-decide.** Doc-4H fixed *what* M6's 23 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Doc-5H realizes Doc-4H's caller-facing surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4H / corpus by pointer.
2. **Conformance is an obligation.** Doc-5H passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, POLICY key, or **event**.

## Decisions ratified at structure freeze

- **R1 — Out-of-wire boundary.** Doc-5H realizes only the caller-facing HTTP surface. The following **4 System contracts have no caller wire** and are documented as the out-of-wire boundary (§8): `comm.create_notification.v1` (event-consumer fan-out from other modules' Doc-2 §8 events; idempotent on `source_event_id`), `comm.create_delivery_record.v1` (dispatch job → channel log), `comm.update_delivery_status.v1` (**provider-webhook callback — inbound infra**), `comm.retry_delivery.v1` (retry job). Also out-of-wire as a *mechanism*: any dual-audience read's internal-service leg. **Flag-and-halt if a caller wire is proposed for them.** (Authority `Doc-5A §1.3/§5/§11`; Doc-5B/5C/5F R1 precedent.)
- **R2 — Multi-actor: User + Admin; no public, System out-of-wire.** **User** (messaging `can_use_messaging`; notification recipient reads; support tickets `can_raise_support_ticket`) acting inside a server-validated active org (`Iv-Active-Organization`, never client-trusted — `Doc-4A §5.3`; `Doc-5A §7`); **Admin** support staff (`staff_can_support`, no org context — `Doc-5A §7.3`) on the ticket + delivery-status surfaces. **No public/anonymous surface.** System is out-of-wire (R1).
- **R3 — `communication` route prefix; `comm.` Contract-ID token** (deliberate split — `Doc-5A Appendix B.1` registers the M6 route namespace `communication`, `Doc-2 §0.3`; the Doc-4H Contract-ID operation token is `comm.<operation>.v1`, error-code namespace `comm_`, `Doc-4A Appendix B.2`; `comms` is the non-authoritative CLAUDE.md shorthand). **Path grammar (§5.3) derives from the route prefix `communication`, never from the `comm.` token stem.** **The `communication` route namespace is immutable after structure freeze** (re-allocation only by Doc-5A amendment — Gov-Note §5). Coins neither.
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs (`can_use_messaging`, `can_raise_support_ticket`, `staff_can_support`), §9 audit actions, and the §8 event catalog; carried gaps are bound by pointer and **escalated, never invented**: `[ESC-COMM-SLUG]` (Doc-2 §7 — notification/recipient-read slug), `[ESC-COMM-AUDIT]` (Doc-2 §9 — no Communication audit domain; every mutation carries it), `[ESC-COMM-POLICY]` (Doc-3 §12.2 — dedup/retry/backoff/rate/page keys), `[ESC-COMM-EVENT]` (Doc-2 §8 — none today) — `CHK-5A-121` (anti-invention) · `CHK-5A-154` (namespace token) · `Doc-4A §6.4`/§18.2.
- **R5 — Delivery-only / single-authorship (M6 signature).** M6 owns notification fan-out + delivery transport only; the **emitting module authors the Doc-2 §8 event, M6 consumes + dispatches**. `comm.create_notification` is a System event-consumer (out-of-wire §8), never caller-initiated; M6 authors **no** notification-production contract for another module and emits **no** Doc-2 §8 event. **Payload-observational rule:** a **consumed event payload is observational input only and never becomes API-contract authority** — M6 renders it as notification text, never re-exposes it as an owned read-model field or derived contract surface (no ownership leakage from the source module).
- **R6 — Delivery/governance firewall (DH-5/DH-6).** A delivery outcome is an **observability fact, never a score/eligibility/business signal**; M6 computes/owns no score; **no entitlement / plan / commercial state gates delivery in a way that touches trust, eligibility, or routing fairness.** **Notification read/archive state cannot influence prioritization, matching, or trust** — it is a per-recipient inbox fact only. Realized as §3 wire constraints, never a gating header/param.
- **R7 — RFQ scrub-rule seam (DH-3).** On an `rfq_clarification` thread, `comm.send_message` **reads the RFQ-owned raw-contact-scrub rule via the RFQ service and applies it content-side** at message-write; content rejected by the rule → `BUSINESS` error; `context_id` (`rfq_id`) is a bare UUID (no ownership transfer). **M6 cannot cache, copy, extend, or override the RFQ scrub rule** — it reads by service at write-time and applies the rule's verdict only; the rule definition remains wholly RFQ-owned (`Doc-4E`), no procurement decision made here.
- **R8 — Provider-webhook inbound boundary + delivery-aggregate ownership.** The **`Outbound Log` aggregate (channel structures `email_logs` / `sms_logs` / `whatsapp_logs`, VO `DeliveryStatus`) is M6-owned** (`communication` schema; `Doc-2 §10.7`; `Doc-4H` BC-COMM-3 "Owned Aggregate: Outbound Log"). **A provider callback mutates only M6-owned state** — the provider → webhook → M6 path writes M6's own Outbound Log; it is **never** a Platform-Core-owned read-model M6 mirrors (ownership stays in M6, not M0/infra). `comm.update_delivery_status` is driven by an **inbound provider callback — an email/SMS/WhatsApp infra signal, explicitly NOT a Doc-2 §8 domain event**; forward-only `queued → sent → delivered | failed` (retry `failed → queued`, no new state). The webhook **ingress is infrastructure**, not an M6 caller wire; the contract is out-of-wire (§8). **Flag-and-halt if a caller/tenant wire is proposed.**
- **R9 — Realtime chat = delivery channel, not an API surface.** `comm.send_message` / `comm.get_messages` are the caller wire; **realtime push (Supabase Realtime, DH-8 backing) is a delivery channel** (`Doc-5A §10` / `Doc-4A §15.7` — realtime = delivery channel), not a separate contract; `comm.get_messages` (Query) is the **source of truth**. **Realtime carries observations only and has no state-transition authority** — no message creation, mutation, or acknowledgement occurs through realtime; every state change is a §4 caller command.
- **R10 — Non-disclosure firewall.** Thread / message / notification / ticket / delivery reads are participant / recipient / scope-gated; a non-participant / non-recipient / out-of-scope read collapses to a uniform `NOT_FOUND` (`Doc-5A §6.3/§7`; `Doc-4A §7.5`); no cross-tenant leakage.
- **R11 — No emitted event surface; M6 is a consumer.** Unlike M2/M4, M6 emits **no** Doc-2 §8 event (delivery-only; `[ESC-COMM-EVENT]` — none today). The Doc-5A §11 outbox-emission surface is **N/A**; the provider webhook is **inbound infra**, not an M6-emitted webhook. No caller webhook/push surface (`Doc-5A §11.3`).
- **R12 — Append-only & no-destructive-close (Invariant #8).** Messages, delivery logs, and ticket messages are **append-only — never overwritten or hard-deleted**. `close_thread` closes the thread (`open → closed`) and **does not delete message history**; `archive_notification` advances inbox state (`read → archived`) and **does not delete the notification**. **Delivery logs are never caller-writable** — written only by the §8 System contracts. Thread/ticket close is **soft**, not delete.

## M6 surface partition (the structural spine)

> **23 Doc-4H contracts** (PassB BC-COMM-1…4 per-Contract-ID blocks) — **19 caller-facing**, **4 out-of-wire**. Each row carries an explicit **Doc-5H §** owner; every contract is assigned to exactly one section. §3 is a cross-cutting wire-model section and **owns no endpoint**.
>
> **Internal-service leg count declaration:** the M6 23-contract set contains **zero internal-service-only contracts**. The "dual-audience read internal-service leg" named in R1 is a **mechanism, not a counted contract** — it adds **no** row to the 23 and **no** HTTP surface (realized in-process in §8). The count is exactly **19 caller + 4 out = 23**, no hidden internal-service contracts.

| Doc-4H contracts | Nature | **Doc-5H §** |
|---|---|---|
| BC-COMM-1 `create_thread`, `send_message`, `add_thread_participant`, `remove_thread_participant`, `close_thread` · `get_thread`, `list_threads`, `get_messages` | User command / query (21.4 / 21.3; thread §3.7 machine; RFQ scrub seam — R7; realtime channel — R9) | **§4** `POST` / `GET` |
| BC-COMM-2 `mark_notification_read`, `archive_notification` · `get_notification`, `list_notifications` | User command / query (21.4 / 21.3; recipient-scoped; notification §10.7 machine) | **§5** `POST` / `GET` |
| BC-COMM-3 `get_delivery_status` | User / Admin query (21.3; own-record / `staff_can_support`) | **§6** `GET` |
| BC-COMM-4 `create_ticket`, `update_ticket`, `add_ticket_message`, `close_ticket` · `get_ticket`, `list_tickets` | User / Admin command / query (21.4 / 21.3; two-sided; ticket §3.7 machine) | **§7** `POST` / `GET` |
| BC-COMM-2 `create_notification` | System event-consumer fan-out (21.5; R5) | **§8** out-of-wire |
| BC-COMM-3 `create_delivery_record`, `update_delivery_status`, `retry_delivery` | System dispatch job / provider-webhook callback / retry job (21.5; R8) | **§8** out-of-wire |

§3 is a **cross-cutting wire-model section and owns no endpoint** — §4–§7 each depend on it (see §3 purpose).

### Section-level count reconciliation

| Doc-5H § | BC | Caller-facing | Routed to §8 (out-of-wire)¹ | Total |
|---|---|---|---|---|
| §4 | BC-COMM-1 Messaging | 8 | 0 | 8 |
| §5 | BC-COMM-2 Notifications | 4 | 1 | 5 |
| §6 | BC-COMM-3 Delivery Tracking | 1 | 3 | 4 |
| §7 | BC-COMM-4 Support | 6 | 0 | 6 |
| **Total** | | **19** | **4** | **23** |

> ¹ "Routed to §8" counts contracts from this BC assigned to §8 (the out-of-wire boundary section), **not** owned by the row's §-section. Counted for BC-completeness verification only; the partition table (authoritative) assigns all 4 out-of-wire contracts to §8.

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5H's precedence (… → Doc-4A → Doc-4H → Doc-5A → **Doc-5H** → Code); the obligation to conform to Doc-5A in full and pass Appendix A; realize-never-redecide; flag-and-halt.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M6 Surface Partition
- **Purpose:** what Doc-5H governs (the M6 caller-facing HTTP surface — User + Admin) and does not; carry the surface-partition + count-reconciliation tables; the **§1.x dependency boundary** (M6 realizes only M6 surfaces; cross-module → owning module's Doc-5x — Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Operations → Doc-5F, Trust → Doc-5G, Billing → Doc-5I, Admin → Doc-5J; **M6 consumes those modules' events/contracts, never realizes their surfaces**); register carried dependencies **DH-1…DH-8** + `[ESC-COMM-AUDIT]` / `[ESC-COMM-POLICY]` / `[ESC-COMM-SLUG]` / `[ESC-COMM-EVENT]` + **`[REC-COMM-OWNERSHIP]`** by pointer (resolved only via their Doc-4H channels; none resolved here).
- **Dependencies:** `Doc-5A §1`; `Doc-4H §H0`/PassA HA-8. **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `communication`-route HTTP surface — one row per **caller-facing** endpoint (the 19 User/Admin commands and queries): method (§5.2), path grammar (§5.3, prefix `communication`), actor + active-org applicability (§7), success status (§5.5). Command tokens = the exact `comm.<operation>` operation names **verbatim from the Doc-4H PassB per-Contract-ID blocks** (`comm.<operation>.v1`; `Doc-4A §21` / `Doc-5A §5`). **Inventory ordering within each section is non-authoritative and informational only; section ownership (the partition table) is authoritative — on any conflict, the partition table wins; inventory order never implies lifecycle order.** Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`communication`); `Doc-4H` PassB (23-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Actor, Delivery-Only & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*
- **Purpose:** the defining Doc-5H cross-cutting section — realize, on the wire, the mechanism §4–§7 endpoints all depend on (it instantiates no endpoint body): the **User / Admin** actor model — **explicitly NO public/anonymous actor** (stated once here, not split across sections); `Authorization` bearer = authentication only; **`Iv-Active-Organization` server-validated, never client-trusted** (R2); **`check_permission` is the sole authorization authority consumed by M6 surfaces; no parallel or shadow authorization path is permitted (`Doc-4A §5.3`, `Doc-4A §6`)**; the **delivery-only / single-authorship + firewall** constraints (R5/R6) and the **realtime = delivery channel, observations only** rule (R9) as wire constraints; the **non-disclosure firewall** (`NOT_FOUND` collapse on participant/recipient/scope-gated reads — R10); **ticket messages inherit the ticket's scope** (no independent scope). **State-machine authority wording mirrors the Doc-5F m-01 form verbatim** — edges defined in `Doc-2 §3.7/§10.7`; **Doc-4M = cross-module state-map index, not the edge definer**. **Per-read disclosure-scope rule (binding):** every read in §4–§7 declares its scope — Participant / Recipient / Own-or-Support / Shared — ambiguity = content blocker. **Per-command actor-side rule (binding):** every command declares its actor side — User / Admin / Either (BC-COMM-4 tickets are two-sided) — ambiguity = content blocker. No endpoint is instantiated here.
- **Dependencies:** `Doc-5A §6.3/§7/§10`; `Doc-4A §5/§5.3/§6/§7/§7.5/§15.7`; `Doc-4C §C3/§C8` (consumed authorization root); `Doc-4H §H4` (non-disclosure). **Detail:** cross-cutting wire-model declaration; bound, not redefined; no endpoint instantiation.

## §4 — Messaging & Threads Surface Realization (BC-COMM-1)
- **Purpose:** the §H4 messaging surface — `create_thread` (`direct` / `rfq_clarification`), `send_message` (**RFQ scrub-rule seam — read-by-service + content-side apply; no cache/copy/extend/override**, R7), `add_thread_participant` / `remove_thread_participant`, `close_thread` (`open → closed`, terminal; **history retained**, R12), and participant/scoped reads (`get_thread`, `list_threads`, `get_messages`) each **declaring disclosure scope** (§3 rule); **realtime is a delivery channel, observations only — `get_messages` is the source of truth** (R9); idempotency/concurrency (§9); error mapping (§6) with non-disclosure `NOT_FOUND` collapse; `[ESC-COMM-AUDIT]` on the un-enumerated messaging mutations; append-only messages (R12).
- **Dependencies:** `Doc-5A §5/§6/§9/§10`; `Doc-4H §H4`; `Doc-4M`; `Doc-2 §3.7/§10.7`; `Doc-4E` (RFQ scrub-rule, consumed — DH-3). **Detail:** command + scoped-read realization.

## §5 — Notifications Surface Realization (BC-COMM-2)
- **Purpose:** the §H5 notification surface — recipient reads (`get_notification`, `list_notifications`, recipient-scoped — `[ESC-COMM-SLUG]`) + `mark_notification_read` (`unread → read`) + `archive_notification` (`read → archived`, strict linear; **does not delete the notification**, R12), each declaring disclosure scope; **notification read/archive state never influences prioritization/matching/trust** (R6). `create_notification` (the System event-consumer fan-out from other modules' Doc-2 §8 events) is **out-of-wire** (§8/R5). Idempotency/concurrency; error mapping; `[ESC-COMM-AUDIT]`.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4H §H5`; `Doc-4M`; `Doc-2 §10.7`. **Detail:** recipient command + read realization.

## §6 — Delivery Tracking Surface Realization (BC-COMM-3)
- **Purpose:** the §H6 delivery surface — the **`Outbound Log` aggregate (`email_logs` / `sms_logs` / `whatsapp_logs`, VO `DeliveryStatus`) is M6-owned** (`Doc-2 §10.7`; `Doc-4H` BC-COMM-3); `get_delivery_status` (User own-record / Admin `staff_can_support`; cross-tenant prohibited → `NOT_FOUND`), declaring disclosure scope. The three write-path contracts — `create_delivery_record` (dispatch job), `update_delivery_status` (**provider-webhook callback; provider mutates only M6-owned Outbound Log; NOT a Doc-2 §8 event**, R8), `retry_delivery` (`failed → queued`) — are **out-of-wire** (§8). **Append-only logs, never caller-writable** (R12); a delivery outcome is observability only, never a score/eligibility signal (R6).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4H §H6`; `Doc-2 §10.7`. **Detail:** delivery-read realization + ownership statement.

## §7 — Support Communications Surface Realization (BC-COMM-4)
- **Purpose:** the §H7 support surface — `create_ticket`, `update_ticket`, `add_ticket_message` (append-only — R12), `close_ticket` (`resolved → closed`) and reads — **two-sided User(opener, `can_raise_support_ticket`) / Admin(staff, `staff_can_support`)**; ticket machine `open → in_progress → resolved → closed` (Doc-2 §3.7 / Doc-4H §H13; Doc-4M = index only — §3; per-command actor-side declared — §3 rule: User own-org legs vs Staff governance legs). **The support-ticket aggregate stays M6-owned** — Admin acts via `staff_can_support` as an authorized actor, but ownership never transfers to Admin (M8). **Ticket messages inherit ticket scope** (§3). Idempotency/concurrency; error mapping with `NOT_FOUND` collapse; `[ESC-COMM-AUDIT]`.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4H §H7`; `Doc-4M`; `Doc-2 §3.7`. **Detail:** two-sided command + read realization.

## §8 — Out-of-Wire Boundary (notification fan-out · delivery dispatch / provider-webhook / retry · internal legs)
- **Purpose:** declare that the 4 out-of-wire contracts have **no HTTP wire** — `create_notification` (System event-consumer fan-out), `create_delivery_record` (dispatch job), `update_delivery_status` (inbound provider-webhook callback — infra signal, not a Doc-2 §8 event), `retry_delivery` (retry job) — are in-process services / background workers / event consumers driven by other modules' events, the outbox, or provider callbacks. **Out-of-wire contracts have no caller wire in any protocol: no REST endpoint, no SSE stream, no WebSocket, no Webhook, no GraphQL.** **Flag-and-halt if any wire surface in any protocol is proposed** (an architecture change). Realtime push is a **delivery channel, not a contract** (R9); the provider-webhook ingress is **infrastructure**, not an M6-emitted webhook (R11). Implementation is code / Doc-6.
- **Dependencies:** `Doc-4H §H5/§H6`, PassA (DH-1…8); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-5H's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DH-1…DH-8 + `[ESC-COMM-AUDIT]` / `[ESC-COMM-POLICY]` / `[ESC-COMM-SLUG]` / `[ESC-COMM-EVENT]` + **`[REC-COMM-OWNERSHIP]`**) by pointer with each named resolution channel; statement that Doc-5H coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4H` PassA HA-8/HA-10. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5H Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M6 surface; the freeze evidence. Includes dedicated bands for the M6-unique risks not covered by a single `CHK-5A-xxx`: a **delivery-only / single-authorship band** (*M6 emits no Doc-2 §8 event; authors no other module's notification-production; a consumed payload never becomes contract authority*); a **delivery-aggregate-ownership band** (*the `Outbound Log` aggregate is M6-owned; a provider callback mutates only M6 state*); a **non-disclosure band** (*thread/notification/ticket/delivery reads scope-gated; `NOT_FOUND` collapse; no cross-tenant leak*); and an **append-only band** (*no destructive close/archive; delivery logs never caller-writable*).
- **Dependencies:** `Doc-5A Appendix A`; §3 (disclosure-scope + actor-side rules); R5/R8/R12. **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4H PassA HA-8/HA-10 — resolved only via named channels, never here)

| ID | Item | Doc-5H handling | Freeze gate? |
|---|---|---|---|
| **DH-1** | Identity — `check_permission` / org / active-org / `staff_can_support` / notification rules (read), consumed | Authorization resolved server-side via Identity (`Doc-4C §C3/§C8`); no shadow authz (§3); no Identity surface realized | **No** |
| **DH-2** | Marketplace — consume §8 events for fan-out; vendor refs by UUID | Events consumed by the §8 fan-out consumer; no Marketplace surface realized | **No** |
| **DH-3** | RFQ — consume §8 events; **read scrub-rule by service, apply content-side**; host `rfq_clarification` thread | `send_message` reads+applies the rule (R7); rule stays RFQ-owned (no cache/copy/extend/override); no procurement decision | **No** |
| **DH-4** | Operations — consume §8 events for party fan-out | §8 consumer; no Operations surface realized | **No** |
| **DH-5** | Trust firewall — consume §8 events; compute/own no score | §8 consumer; delivery outcome never a score/eligibility signal (R6); no Trust surface realized | **No** |
| **DH-6** | Billing — consume §8 events; no paid-plan delivery gating touching trust/eligibility | §8 consumer; firewall as §3 wire constraint (R6); no Billing surface realized | **No** |
| **DH-7** | Admin — consume §8 events; moderation/ban decision is Admin's | §8 consumer; ticket aggregate stays M6-owned, Admin acts via `staff_can_support` (R2/§7); no Admin surface realized | **No** |
| **DH-8** | Platform Core — audit-write / outbox / UUIDv7+human-ref / POLICY / flags / **Realtime backing**, consumed | Consumed via Doc-4B mechanisms by pointer; Realtime = delivery channel (R9); never re-implemented | **No** |
| `[ESC-COMM-AUDIT]` | Doc-2 §9 enumerates no Communication audit domain — every mutation carries it | Bound by pointer to the nearest Doc-2 §9 action; **interim**, not finalized; channel: Doc-2 §9 additive | **No** |
| `[ESC-COMM-POLICY]` | No `communication` POLICY namespace key (dedup / retry / backoff / rate / page) | Referenced by platform-default key name by pointer; channel: Doc-3 §12.2 additive; **`[ESC-COMM-POLICY]`-keyed contracts not finalized until registered** | **Tracked** — per-contract finalization; not a structural gate |
| `[ESC-COMM-SLUG]` | No distinct notification/recipient-read slug in Doc-2 §7 | Interim recipient/`staff_can_support` scope by pointer; channel: Doc-2 §7 additive; no slug invented | **No** |
| `[ESC-COMM-EVENT]` | M6 emits no Doc-2 §8 event today | §11 N/A (R11); if ever required, additive Doc-2 §8 patch; **never coin an event in Doc-5H** | **No** |
| **`[REC-COMM-OWNERSHIP]`** | Delivery-aggregate ownership must be explicit (BLOCKER BC-COMM-01) | **Confirmed against `Doc-4H` BC-COMM-3 ("Owned Aggregate: Outbound Log") + `Doc-2 §10.7`** — the `Outbound Log` aggregate is M6-owned; provider callbacks mutate only M6 state (R8/§6). Ownership explicit; satisfied at freeze | **Satisfied — reconfirm verbatim at content** |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DH-1…DH-8 / `[ESC-COMM-*]` · framework/DB/job-engine/Realtime implementation (code/Doc-6) · giving any of the 4 out-of-wire contracts a wire in any protocol · giving realtime push a contract surface (it is a delivery channel) · authoring any notification-production contract for another module (single-authorship — R5) · caching/copying/extending/overriding the RFQ scrub rule (DH-3/R7) · authoring any settlement/score/matching/ban surface · coining any endpoint/status/header/error-class/slug/POLICY key/**event**.

---

*End of Doc-5H Canonical Structure v1.0 (FROZEN) — structure only. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. Authoring history, Board-Findings Map, and self-audit retained in `Doc-5H_Structure_Proposal_v0.1.md` (v0.2); freeze readiness certified by `Doc-5H_Structure_Freeze_Audit_v1.0.md`. Next: content passes — Pass-1 (§0–§3 + inventory), Pass-2 (§4–§5), Pass-3 (§6–§9 + Appendix A) — each conforming to this structure.*
