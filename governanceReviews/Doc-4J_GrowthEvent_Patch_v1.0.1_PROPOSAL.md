# Doc-4J — Additive Patch v1.0.1 (Growth Hub Event-Catalog Registration) — Authoritative Event Catalog

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (atomic with the 10-patch Growth Hub set). Additive; carried alongside frozen `Doc-4J_FROZEN_v1.0` **without editing it in place**. |
| **Date** | 2026-07-19 · **Kind** Additive — registers **2 M1-produced events** in the authoritative event catalog. Coins **no** event (both are Board-frozen in the Growth Hub packet §A.3), no Admin contract, no BC, no slug, no audit action. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.3; the `00_AUTHORITY_MAP.md` **Doc-4J row** ("Authoritative event catalog" — :69 at Final-Gate audit time; the map is living, cite-by-row governs); Master §15.3 growth clause (`Master_System_Architecture_v1.0_FINAL.md:1015` — *"The catalog grows by adding events under the owning module"*); Doc-4A §4.4 (single-authorship) + §16 (event contract standard, idempotent consumers) + **§16.5 payload rules (thin payloads)**, bound at the M0 outbox write (Doc-4B `write_outbox_event` — *"thin payload per §16.5"*). |
| **Depends on** | `Doc-2_Patch_v1.0.11` §4 (the canonical §8 producer rows + payloads — the *what*), `Doc-4C_…v1.0.3` (production contracts + §C12.7 outbox flip), `Doc-4H_…` (M6 consumer), `Doc-4I_…` (M7 System branch), `Doc-4L_…v1.0.1` (flow map), `Doc-6C_…v1.0.4` (schema/GI enforcement). *(Doc-3 · Doc-5C · Doc-7E complete the 10-patch atomic set but are not registration dependencies.)* **Atomic fold** — this registration dangles without them. |

---

## §1 — Why this patch exists (catalog authority, not module scope)

Doc-4J carries two roles: the **M8 Admin module specification** (the frozen six-BC content) and the
**authoritative platform event catalog** (the `00_AUTHORITY_MAP.md` Doc-4J row — :69 at Final-Gate audit
time, cite-by-row governs; CLAUDE.md §9 pointer). The Growth Hub
set adds the platform's first two **M1-produced** §8 events; the catalog role is what obliges a Doc-4J
patch. Master §15.3 makes the addition lawful **without touching rank-0**: the frozen catalog text itself
provides the growth channel — events are added *under the owning module* — so the Master table is never
edited; the additions register **here** (the authoritative catalog document) and canonically in **Doc-2 §8**
(`Doc-2_Patch_v1.0.11` §4).

**Registration ≠ ownership.** The catalog living in the M8 document confers **no** M8 authority over these
events: they are **M1-owned** (produced by `identity`; One Module, One Owner). M8 neither produces, gates,
nor validates anything Growth Hub (campaign validation owner = **M1** reading M0 config — Board MINOR-3;
M8 is explicitly **not** the validation/authorization owner).

---

## §2 — Catalog registration — 2 events, producer `identity` (M1)

Registered in the frozen **H.7 authority grammar** (the `VendorBanned` model: producer/entity/trigger,
single-authorship, consumers own their effects). Full payload rows bind **by pointer** to the canonical
Doc-2 §8 rows (`Doc-2_Patch_v1.0.11` §4) — never restated; the guard-relevant facts below are summarized
with their rulings only.

**(1) `InvitationIssued`** — producer **`identity` / `growth_invitations`** (contract group Doc-4C §C13,
`Doc-4C_…v1.0.3`) · trigger **`identity.create_invitation.v1`**, **targeted `recipient_type` only**
(email/sms/whatsapp); **never emitted for open `link`/`qr`** (no delivery leg exists). Single-authorship
(Doc-4A §4.4): M1 authors production **and** the delivery-payload surface
(`identity.resolve_invitation_delivery_payload.v1` — internal-service, M6 sole caller); the consumer owns
its effect. **Consumer: M6** (`Doc-4H_…` patch) — external-address delivery; fetches the recipient + a
short-lived one-time signed URL via the delivery-payload contract, **never from the event** (the payload
carries `delivery_reference_id`, **no raw token, no `recipient_identifier`** — Doc-4A §16.5 thin-payload,
bound by Doc-4B's `write_outbox_event` / GI-3 / Board MAJOR-1).

**(2) `InvitationConverted`** — producer **`identity` / `invitation_conversions`** · trigger = the
**`provisionIdentity` in-txn attribution step** (Doc-4C §PROV-EXT; an application-service step inside the
single provisioning transaction — Board MAJOR-2 — not a caller-facing wire contract); fires on conversion
`→ registered` (attribution bound). **Consumers:** **M7** — `billing.track_referral` under its **additive
System event-create branch** (`Doc-4I_…` patch; Q-15 guards: callable only from this registered consumer ·
idempotent on `event_id` · referrer/referred taken from the event, no caller override · audit under the
**System actor** — the Doc-2 §9 `actor_type` label `System`, frozen DB label `core.ActorType 'system'`) →
referral `pending` (the frozen `pending→qualified→rewarded` machine untouched);
**M8 — P4 only, observe-only** analytics projection, **deferred** — no M8 consumer contract is authored in
this set; when P4 arrives it is its own additive patch. Payload carries the P4 snapshot dimensions
(`campaign_key`, `recipient_type`) and **no `recipient_identifier`** (GI-3).

**Both events:** written via the **M0 transactional outbox** in the same transaction as the business write
(Doc-4B; M1's consumption of `core.write_outbox_event.v1` is declared by the Doc-4C §C12.7 flip); envelope
carries `event_name` + `event_version` (Master §15.2); **consumers are idempotent on `event_id`** (the
frozen packet's §A.3/§B4 keying; the general duplicate-tolerance obligation = Master §15.2 / Doc-4A §16).

### Catalog domain-table overlay (Master §15.3 shape; registered here, Master not edited)

| Domain | Events |
|---|---|
| Identity (Growth Hub) | InvitationIssued, InvitationConverted |

**Effective platform catalog = Doc-2 §8 as amended** (the canonical enumeration — it already carries
events added by prior architecture/doc patches beyond the Master §15.3 base table, e.g. `RFQMatched`/
`RFQRouted` per Architecture Patch v1.0.1) **+ this registration**; the row above extends the **Master
§15.3-shaped view only** (Master not edited). Flow realization (producer→consumer rows, L3 permission
row) = `Doc-4L_…v1.0.1`.

---

## §3 — Admin (M8) frozen invariants — UNTOUCHED, re-affirmed

- **H.7 stands verbatim:** *"`VendorBanned` is the sole **Admin-owned** Doc-2 §8 event."* The two new
  events are **M1-owned** — Admin's produced-event set is unchanged; BC-ADM-1/3/4/5/6 still produce
  **No Event**.
- **No Admin surface changes:** no BC, aggregate, contract, lifecycle, slug, audit action, dependency
  marker, or read model of the frozen six-BC content is touched. Appendix A (contract register) and
  Appendix B (carried markers) are unchanged; **`[ESC-ADM-EVENT]` remains "none coined."**
- **`DR-ADM-COMM` still does not exist** — M6's Growth Hub role is a consumer of an **M1** event, not an
  Admin dependency.
- **M8's only future relation** to these events is the P4 observe-only `InvitationConverted` projection
  (Growth Hub packet §A.3) — consumption, not production; deferred; nothing here grants it.
- **Moat/firewall posture unchanged:** growth invitations are promotional acquisition — no procurement
  matching/routing/ranking/award/eligibility effect (moat); no governance-signal effect (firewall §4);
  the reward stays milestone-gated in M7 under Doc-3 POLICY.

---

## §4 — Compatibility, additivity & carried realization

**Additive only.** No frozen text edited; the effective reading = `Doc-4J_FROZEN_v1.0` + this patch.
Nothing coined: both events, their payloads, producers, consumers, and guards are frozen upstream
(Growth Hub packet §A.3 / `Doc-2_Patch_v1.0.11` §4); this patch performs the catalog's **registration act**
only. Backward compatible: no existing producer/consumer/contract changes behavior; a reader of the frozen
doc alone remains correct about every Admin obligation.

| Piece | Realized by (pointer) |
|---|---|
| Canonical §8 rows + payloads | `Doc-2_Patch_v1.0.11` §4 |
| Production contracts + outbox flip + audit tokens | `Doc-4C_…v1.0.3` (§C13 · §PROV-EXT · §C12.7-FLIP · §9) |
| M6 delivery consumer + delivery-result lifecycle | `Doc-4H_…` patch |
| M7 System event-create branch (Q-15 guards) | `Doc-4I_…` patch |
| Flow rows + L3 permission row | `Doc-4L_…v1.0.1` |
| Schema (entities, RLS, GI-1/2/3 enforcement) | `Doc-6C_…v1.0.4` |

**Casing note for the Board fold (Review-B F1):** the set's canonical System-actor statement is the
Doc-2 §9 enum label **`System`** (frozen DB label `core.ActorType 'system'` — lowercase on the wire, the
2026-06-30 migration precedent). The stamped packet's `actor_type=SYSTEM` literal (packet lines 27/99/136)
is a casing variant of the same ratified guard — the fold should pin `System`/`'system'` set-wide; no
sibling drift remains in the patch texts.

**Citation note for the Board fold (fix-verification OBS):** the stamped packet's §G (:246) carries the
wrong-owner shorthand *"Doc-4B §16.5 / §7.5"* that this set's patch texts render correctly as **Doc-4A
§16.5** (payload rules), bound at Doc-4B's `write_outbox_event`. The packet text is stamped and uneditable;
the fold should read its shorthand accordingly.

**Checklist:** □ no new module · □ no ownership change · □ no governance-signal change · □ no
cross-module DB access/FK · □ no frozen doc edited · □ no event coined (2 registered, both Board-frozen) ·
□ no Admin BC/contract/slug/audit change · □ atomic fold with the 9 sibling patches.
