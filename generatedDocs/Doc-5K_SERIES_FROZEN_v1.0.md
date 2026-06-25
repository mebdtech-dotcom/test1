# Doc-5K — AI Layer (M9 `ai`) API Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-5K Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | M9 — AI Layer (`ai` schema; the reserved advisory / derived-artifact layer) |
| Realizes | `Doc-4K_FROZEN_v1.0` (**16 contracts**, 4 families × 4 ops, BC-AI-1…4) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` governs**; gated by Doc-5A Appendix A |
| Freeze evidence | `Doc-5K_Content_Freeze_Audit_v1.0.md` — CONTENT-FREEZE-READY PASS; 0 open BLOCKER/MAJOR/MINOR |
| Note | This manifest is an additive peer-parity wrapper over the already-frozen `Doc-5K_Content_v1.0_FROZEN.md` (the consolidated content). It binds the effective set; restates nothing |

---

## Effective set (the authoritative Doc-5K)

| Artifact | Role |
|---|---|
| `Doc-5K_Structure_v1.0_FROZEN.md` | Frozen structure — partition spine, R1–R9, section map §0–§6 + Appendix A |
| `Doc-5K_Structure_Patch_CE-01_v1.0.md` | Additive structure patch (CE-01) |
| `Doc-5K_Content_v1.0_FROZEN.md` | **Consolidated frozen content** (Pass-1/2/3 merged) — the read surface + out-of-wire boundary + conformance + Appendix A attestation |
| `Doc-5K_Content_v1.0_Pass1…3.md` | Content source passes (authoring history + hard-review dispositions) |
| `Doc-3_Policy_Key_Registration_Patch_v1.8_AI.md` | Registers `ai.list_page_size_max` + 4 `ai.<bc>.ttl_seconds` keys; clears `[ESC-AI-POLICY]` |

## Partition (16 contracts)

| Class | Count | Contracts |
|---|---|---|
| Caller-facing (§4 reads) | **8** | `get/list_recommendation(s)` · `get/list_prediction(s)` · `get/list_classification(s)` · `get/list_similar_vendors` |
| Out-of-wire (§5) | **8** | `generate_*` (4, AI-Agent/System) · `expire_*` (4, System TTL hard-delete) |
| **Total** | **16** | |

All 8 caller-facing are **`GET` / `200`**, representation-or-`null`, cursor-only, Subject-Org tenancy (own-org `null` / cross-tenant `404` non-disclosure).

## Realization decisions (R1–R9) — by pointer

R1 out-of-wire (8: generate_* + expire_*) · R2 User read-only on the wire (AI-Agent/System out-of-wire; **no public, no Admin**) · R3 `ai` route=token (version = header, not path) · R4 no token invented · **R5 advisory / non-authoritative** (no caller bound; M9 writes only `ai.*`; no AI-attributed authoritative write; expired ≠ authoritative evidence) · **R6 score/decision firewall** (AI confidence ≠ Trust score; snapshot-only; no matching/routing/award) · **R7 regenerable disposable cache** (TTL hard-delete legitimate, not append-only; globally-unique cache identity) · R8 no §8 event (pull/derive-on-demand) · R9 tenancy non-disclosure (Subject-Org; bare-UUID similar-vendors). `[REC-AI-WIRE]` satisfied (generate_* out-of-wire; reconfirmed Pass-1/2/3).

## Carried items (non-gating; named channels only)

`[ESC-AI-POLICY]` → **RESOLVED** by `Doc-3 …Patch_v1.8_AI`. `[ESC-AI-AUDIT]` (Doc-2 §9), `[ESC-AI-EVENT]` (Doc-2 §8 — none), `[ESC-AI-SLUG]` (Doc-2 §7 — no `ai_` slug), DF-AI-1…6 — tracked; resolved only via their named channels. `[REC-AI-WIRE]` carried to code (verbatim reconfirm at implementation).

## Provenance (reference only)

Structure: Board pre-authoring → Independent Hard Review (REC-1 reconciled) → Structure Patch CE-01 → Structure Freeze Audit → FROZEN. Content: Pass-1/2/3 → hard-review dispositions → Content Freeze Audit (PASS) → `Doc-5K_Content_v1.0_FROZEN`.

---

*Doc-5K (M9 AI Layer) API realization is FROZEN. Realizes Doc-4K on HTTP — 16 contracts (8 caller-facing reads + 8 out-of-wire generate/expire); User read-only; advisory / non-authoritative; no score, no §8 event; regenerable disposable cache. On any conflict with a frozen Doc-4x/Doc-5A, the frozen corpus wins; flag-and-halt.*
