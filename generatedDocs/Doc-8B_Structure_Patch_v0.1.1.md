# Doc-8B — Structure **Patch v0.1.1** (Hard Review disposition) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-8B_Structure_Proposal_v0.1.md` |
| Against | `Doc-8B_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 OBSERVATION + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → freeze-ready **pending Board ratification of D1 (tooling)** |
| Method | Additive structure patch — no frozen document edited; nothing coined. Effective Doc-8B structure = `Proposal_v0.1` **as amended below** |

---

## Disposition of findings

### MINOR-1 — D1 must record clearing the Doc-8A-carried `[ESC-8-TOOLING]` → **FIXED**
D1 and §9 gain:
> **D1 clears the Doc-8A-carried `[ESC-8-TOOLING]`.** On Board ratification at Doc-8B structure freeze, `[ESC-8-TOOLING]` is **resolved**, recorded by an additive note in the `Doc-8A_SERIES_FROZEN_v1.0` manifest (the POLICY-patch precedent — each `Doc-3 §12.2` patch clears its `[ESC-*-POLICY]` gate) + the orientation ledgers (`CORPUS_INDEX`, `00_AUTHORITY_MAP`, roadmap). Doc-8B does not resolve it silently; the clearance is cross-referenced both directions (Doc-8A ledger ⇄ Doc-8B D1).

### MINOR-2 — no outbox inspection/drain for Band-F → **FIXED**
§7 gains a clause (and §1 scope notes the capability):
> **§7.x Deterministic outbox observer/drainer (Band-F enabler).** The harness provides a way to (a) **inspect** `core.outbox_events` rows after a transaction (so a suite asserts a business write + outbox insert committed/rolled-back together — `Doc-6A §7`, `CHK-8-051`), and (b) a controlled **"dispatch tick"** that feeds pending rows to the **mocked Inngest double** (§7) so a suite asserts the `pending→dispatched→archived` lifecycle + `Doc-4L` fan-out (`CHK-8-052`) — **without a live async runtime**. Mocking Inngest alone is insufficient; the outbox row must be observable. Bound by pointer to `Doc-6A §7` + `Doc-4L`.

### OBSERVATION-1 — pgTAP non-TS dependency → **FIXED (D1 re-framed)**
D1's RLS/SQL row is re-framed to present the TS-native path as the recommended primary:
> | RLS / SQL conformance path | **Primary: TS-native transactional SQL** (executed through the runner against the Supabase test DB; per-case DB-role/`SET LOCAL` switching) — single toolchain. **Optional: pgTAP** where in-DB assertions are clearer. | Asserts the Band-C RLS positive/negative/cross-tenant byte-equivalence gate at the DB layer; TS-native keeps one toolchain (CLAUDE.md §2 end-to-end TS) |

Both remain D1 sub-options for the Board; recommendation is TS-native primary.

### NITPICK-1 — §9 "passes Band A" imprecise → **FIXED (applied)**
§9 restated:
> Doc-8B **directly satisfies Bands H and I** (`CHK-8-070…074` isolation/determinism/CI; `CHK-8-080/081` out-of-test). **Band A (oracle-by-pointer) is N/A** to the harness — it authors no assertions; Band A is satisfied by the discipline suites that consume the harness. **Bands B–G are N/A** (the harness provides the means those suites assert with).

### REJECTED finding — upheld
"Doc-8B resolving `[ESC-8-TOOLING]` violates realize-never-redecide" stays **REJECTED as false** — Doc-8A R3 delegated the choice; resolving a delegated implementation choice is the Doc-6A R3(b) precedent, not a re-decision. (MINOR-1 adds the record-back.)

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 2 | **0** |
| OBSERVATION | 1 | 0 (D1 re-framed) |
| NITPICK | 1 | 0 (applied) |

---

## Short Re-Review (closure confirmation)

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 record-back of `[ESC-8-TOOLING]` clearance | MINOR | **CLOSED** — D1/§9 cross-reference the Doc-8A manifest + ledgers |
| MINOR-2 outbox observer/drainer | MINOR | **CLOSED** — §7.x added; Band-F enabler bound to `Doc-6A §7`/`Doc-4L` |
| OBSERVATION-1 pgTAP dependency | OBS | **CLOSED** — D1 re-framed: TS-native SQL primary, pgTAP optional |
| NITPICK-1 Band-A applicability | NIT | **CLOSED** — Bands H/I direct; A/B–G N/A |
| REJECTED ([ESC-8-TOOLING] re-decide) | — | **Upheld false** |

No new defect. **0 open BLOCKER/MAJOR/MINOR → structure freeze-ready**, with one gate remaining: **D1 (tooling) is a Board ratification** owed at the freeze step (Board Chair sign-off — Doc-6A R3(b) precedent). Freeze proceeds once the Board ratifies (or overrides) D1.

*End of Structure Patch v0.1.1 + Short Re-Review. Nothing coined; no frozen document edited. Next: Board ratification of D1 → Structure Freeze Audit → `Doc-8B_Structure_v1.0_FROZEN` → Doc-8B content passes.*
