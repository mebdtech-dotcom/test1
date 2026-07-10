# BOARD PACKET — Wire Result-Payload Field Casing · `ESC-WIRE-FIELD-CASING` v1.0

| Field | Value |
|---|---|
| **Class** | Flag-and-Halt escalation (CLAUDE.md §11) — frozen-corpus vs ratified-house-shape conflict; program-level (all wired modules), raised on the identity surface |
| **Raised by** | Review-A at RV-0153 (W2-IDN-6.5), F1 [MAJOR], 2026-07-10 — an un-logged, un-litigated divergence class (grep of the review log + governance records: zero prior adjudications of wire casing) |
| **Decides** | Human Architecture Board (owner). Doc-5A is rank-0 frozen; only an additive patch with human approval can alter it (§7/§8) |
| **Status** | ✅ **RESOLVED 2026-07-10 — owner ruled Option B** (ratify the deviation). Instrument: `generatedDocs/Doc-5A_Patch_v1.0.1.md` (Authority-Map-registered); Review-A PASS 0/0/0/0/1 (`Doc-5A_Patch_v1.0.1_REVIEW-A.md`). RV-0153 F1 dissolved; W2-IDN-6.5 closed; `ESC-WIRE-FIELD-CASING` closed in `esc_registry.md`. Zero code change (delivered surfaces conformant by definition). |

## 1. The conflict (both sources, verbatim)

**Frozen (Doc-5A §3, Pass2:67 — binding realization convention):**
> "A JSON property name MUST equal the abstract field name from the owning corpus location
> **verbatim, in `snake_case`** … **No casing transformation is applied on the wire (no
> `camelCase`/`PascalCase` aliasing).**"

**Ratified house shape (delivered and review-closed):** response `result` payloads serialize
TypeScript-native **camelCase** — since the Wave-1 D7 buyer-profile wire
(`result.organizationId`, test-pinned), through the W2-IDN-6.1 faces closed at RV-0152
(`result.userId`, `result.twoFaEnabled`), now instantiated by the W2-IDN-6.5 faces
(`delegationGrantId`, `validFrom/validTo`, `permissionSet`, `pageInfo.hasMore`). The
serialization edge (`successResponse`, `src/shared/http/index.ts`) wraps the TS object as-is.

**What conforms already:** the entire request side (routes read snake_case bodies/query params),
and the envelope keys (`reference_id` · `error_class` · `error_code`). The divergence is
**response `result` payloads only**.

## 2. Why this reaches the Board

Architecture is supreme (§7); implementation must conform — but the divergent shape was itself
ratified by passed reviews across three WPs (D7 · 6.1 · 6.5) that never litigated casing. A local
fix would silently rewrite two closed WPs' delivered surfaces; a local "leave it" would silently
override a frozen document. Both are forbidden — hence Flag-and-Halt.

## 3. Options

**Option A — Conform to frozen (snake_case on the wire).**
One shared snake_case serialization at the envelope edge (`successResponse`/the api mappers) +
a bounded retrofit sweep of the D7, 6.1, and 6.5 faces and their wire-test pins.
- For: corpus supremacy holds with zero frozen-text change; timing is favorable — WP-1.9 infra is
  Board-parked, nothing is deployed, **no external consumer exists yet**; the change is mechanical
  (one serializer, one sweep); FE consumption (Wave-4/5 wiring) then meets the documented wire.
- Cost: touches three delivered surfaces + test pins (delta-re-verify class, not full re-review);
  ~1 small dedicated WP.
- Suggested vehicle: a dedicated hygiene WP (or fold into the W2-IDN-6.7 verify-under-full-gate
  row, which already carries a D7 reconcile) — landing **before the Wave-2 Integration Audit**,
  which would otherwise re-surface this finding at the wave exit gate.

**Option B — Ratify the deviation (additive Doc-5A §3 patch).**
An additive patch declaring camelCase as the ratified result-payload realization
(requests/envelope stay snake_case as delivered).
- For: zero code change; the delivered surfaces become conformant by definition.
- Cost: a rank-0 frozen-doc patch + Authority-Map row; permanently normalizes a mixed-casing wire
  (snake_case requests/envelope vs camelCase results); every future module inherits the asymmetry;
  the metastandard's "no aliasing" rationale (deterministic contract↔wire traceability) is
  weakened program-wide.

## 4. Companion decision — the W2-IDN-6.5 gate

RV-0153's reviewer explicitly left this to the Board: F1 may be ruled **non-gating for the 6.5
close** (disposition to this program-level handle, remediation program-wide) — 6.5's own work is
otherwise clean (F2 is being fixed forward in-WP). Without this ruling, F1's MAJOR sits on 6.5's
ledger and blocks its clean-gate close.

## 5. Recommendation (Orchestrator — non-binding)

**Option A**, executed as one dedicated sweep WP before the Wave-2 Integration Audit, **plus**
ruling F1 non-gating for the 6.5 close (disposition to this handle). Rationale: the frozen text is
unambiguous and the deviation is young — pre-deploy, pre-consumer, mechanically fixable at one
edge; ratifying a mixed-casing wire (Option B) trades a one-time bounded sweep for a permanent
program-wide asymmetry.

## 6. Decision asks

1. **A or B** (wire casing disposition).
2. **6.5 gating**: is F1 non-gating for the W2-IDN-6.5 clean-gate close (→ program handle)?
3. If A: confirm the vehicle (dedicated sweep WP before the Wave-2 Integration Audit).

---
*Escalation packet; coins nothing, edits no frozen text. Evidence: RV-0153 F1
(`project-management/review-log.md`) · Doc-5A §3 Pass2:67 · the delivered faces cited above.*
