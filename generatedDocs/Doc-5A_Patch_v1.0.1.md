# Doc-5A Additive Patch v1.0.1 — Wire Result-Payload Property-Name Casing Ratification (`ESC-WIRE-FIELD-CASING`)

| Field | Value |
|---|---|
| **Patches** | Doc-5A (API Realization Metastandard) §3.2 — v1.0 → **v1.0.1** |
| **Class** | **Additive realization-convention ratification.** Amends ONE realization convention (§3.2 wire property-name casing) for the response `result`-payload scope only. No architecture rule changed (Doc-4A stays wire-format-neutral — see §1); no schema/entity/DTO/endpoint/enum-value/identifier change; no wire token, event, contract, or state change. |
| **Authorized by** | Human owner / Architecture Board ruling, 2026-07-10 — `ESC-WIRE-FIELD-CASING` **APPROVED Option B** (ratify the deviation). Packet: `governanceReviews/BOARD-PACKET-WIRE-FIELD-CASING_v1.0.md`. Raised by Review-A at RV-0153 (W2-IDN-6.5), F1 [MAJOR], as a program-level Flag-and-Halt. |
| **Frozen text** | `Doc-5A_Content_v1.0_Pass2` §3.2 (line 67) is NOT edited in place. This patch is the additive overlay; on any conflict for the response `result`-payload property-name casing, **this patch governs**; §3.2 continues to govern requests, envelope keys, and every non-result scope. |

## 1. Why this is within Doc-5A's authority to amend (not an architecture override)

§3.2's snake_case-on-the-wire rule is classified in the frozen text itself as a **[realization
convention]**, and its own Rationale (Pass2:69) states verbatim: *"Doc-4A fixes abstract field names
as `snake_case` but is **wire-format-neutral**."* The architecture (Doc-4A §3 → Doc-2 §3/§10) fixes
the ABSTRACT field names as `snake_case`; it does **not** mandate the wire-serialization casing.
Doc-5A §3.2 made the wire-casing realization choice (no-transform `snake_case`). An additive Doc-5A
patch may therefore amend that realization convention with human approval (§7/§8) **without touching
any architecture rule** — Doc-4A's abstract `snake_case` field names remain unchanged and
authoritative; only the Doc-5A wire-serialization realization, for one scope, is amended. This is
why the ruling is Option B (ratify a realization convention), not an ADR/architecture override.

## 2. The ratification

For **response `result`-payload property names only**, a JSON property name **MAY** serialize as the
**`camelCase`** realization of its abstract `snake_case` field name (the TypeScript-native house
shape), instead of the verbatim-`snake_case` form §3.2 otherwise requires. This ratifies the
delivered-and-review-closed house shape — Wave-1 D7 buyer-profile (`result.organizationId`,
test-pinned) · W2-IDN-6.1 (`result.userId`, `result.twoFaEnabled`, RV-0152) · W2-IDN-6.5
(`delegationGrantId`, `validFrom`/`validTo`, `permissionSet`, `pageInfo.hasMore`) — serialized as-is
by the shared `successResponse` edge (`src/shared/http/index.ts`).

The `camelCase`↔`snake_case` mapping is the standard deterministic transform (lowercase-alnum
`snake` segments → lower-camel; `is_`/`has_` predicates preserved), so contract↔wire traceability is
preserved — the mapping is mechanical and bijective over the §3.2 field-name grammar.

## 3. What does NOT change (stays exactly as §3.2/§3.3/§3.4 + the abstract corpus)

- **Request bodies + query params** — `snake_case` verbatim (unchanged; conforms already).
- **Envelope keys** — `reference_id`, `error_class`, `error_code`, etc. — `snake_case` verbatim (unchanged).
- **Enum VALUES (§3.3)** — the `snake_case` string token verbatim (unchanged; this patch governs property NAMES, never values).
- **Identifier VALUES (§3.4)** — UUID lowercase canonical (RFC-9562), `human_ref` uppercase-prefixed (unchanged).
- **Abstract field names (Doc-4A §3 → Doc-2 §3/§10)** — remain `snake_case` and authoritative; this patch changes only the WIRE realization of result-payload property names, never the abstract names.
- §3.1 (JSON/UTF-8), §3.2's non-result scopes, §3.3, §3.4 otherwise stand unchanged.

## 4. Acknowledged trade-off (Board packet §3, Option B)

The realized wire is now **mixed-casing**: `snake_case` requests / envelope / enum-values /
identifiers, `camelCase` result-payload property names. The §3.2 "no aliasing → single naming
authority" rationale is **scoped** (it continues to hold for every non-result scope) rather than
program-wide absolute. Every future wired module inherits this asymmetry; result-payload wire
property names are the `camelCase` transform of the abstract `snake_case` name. Accepted by owner
ruling as the ratified house shape.

## 5. Effect

- The delivered `result`-payload surfaces (D7 · W2-IDN-6.1 · 6.5 · every subsequent wired face) are
  **conformant by definition** — zero code change.
- `ESC-WIRE-FIELD-CASING` **RESOLVED**; RV-0153 F1 [MAJOR] **dissolves** (the divergence it flagged
  is now the ratified convention), un-gating the **W2-IDN-6.5** clean-gate close.
- Program-wide: all wired modules serialize result-payload property names in `camelCase` (this
  convention); requests / envelope / enum-values / identifiers in `snake_case`.

## 6. Coordinator follow-up (NOT executed by this file)

- Register this patch in `generatedDocs/00_AUTHORITY_MAP.md` (Doc-5A series row → v1.0.1 + a patch row).
- Close `ESC-WIRE-FIELD-CASING` in `esc_registry.md`; close **W2-IDN-6.5** (F1 dissolved; its code was B/M/M = 0).

---
*Additive patch; the frozen base text is never edited in place. Authorized by the human owner per
CLAUDE.md §7/§8 (`ESC-WIRE-FIELD-CASING` Option B ruling 2026-07-10). Amends a Doc-5A [realization
convention] only; Doc-4A architecture untouched. Coins nothing.*
