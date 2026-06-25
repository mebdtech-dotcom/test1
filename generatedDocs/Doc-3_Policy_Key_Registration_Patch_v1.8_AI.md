# Doc-3 — Policy Key Registration Patch v1.8 (AI Layer / M9)

| Field | Value |
|---|---|
| Patch | Doc-3 Policy Key Registration Patch v1.8 — AI Layer |
| Type | **Additive** registration into `Doc-3 §12.2` POLICY key registry. Frozen Doc-3 not edited in place |
| Status | **APPROVED** (additive, non-semantic; same class as Patches v1.1–v1.7) |
| Authority | `Doc-4A §18.2` (POLICY-by-key, never by value); `Doc-3 §12.2` (POLICY configuration layer / key registry); `Doc-4K §B.12` (artifact TTL / regenerable-cache lifecycle); `Doc-2 §10.10` |
| Purpose | Register the `ai.*` API-realization + cache-lifecycle POLICY keys referenced by Doc-5K; clears the Doc-5K `[ESC-AI-POLICY]` carried item |
| Scope guard | **No semantic / advisory / scoring / matching change.** Page-size is a wire-realization tunable; TTL keys are regenerable-cache lifecycle config (`Doc-4K §B.12`). AI remains advisory-only; no score, no §8 event |

---

## New namespace

`ai` — added to the `Doc-3 §12.2` POLICY namespace set (alongside `core`, `rfq`, `marketplace`, `trust`, `operations`, `communication`, `billing`, `admin`). No existing key altered.

## Registered keys

| Key | Type | Meaning | Bound by |
|---|---|---|---|
| `ai.list_page_size_max` | integer | Max `page_size` for the `ai.*` cursor-list reads (`Doc-4A §9.6/§18` / `Doc-5A §8.5`); over-max → `400 VALIDATION` | Doc-5K §3.x; all 8 `ai.*` list/read contracts |
| `ai.recommendation.ttl_seconds` | duration | Recommendation artifact TTL — `expires_at = generated_at + ttl` (`Doc-4K §B.12`; regenerable-cache hard-delete by `expire_recommendations`) | Doc-5K BC-AI-1 (out-of-wire generate/expire) |
| `ai.prediction.ttl_seconds` | duration | Prediction artifact TTL (`Doc-4K §B.12`) | Doc-5K BC-AI-2 |
| `ai.classification.ttl_seconds` | duration | Classification-result artifact TTL (`Doc-4K §B.12`) | Doc-5K BC-AI-3 |
| `ai.similar_vendors.ttl_seconds` | duration | Similar-vendor-result artifact TTL (`Doc-4K §B.12`) | Doc-5K BC-AI-4 |

> Values are configuration (`core.system_configuration`), not fixed on the wire or in this patch (`Doc-4A §18.2`). The 4 per-BC TTL keys realize Doc-5K's intended-name `policy.ai.<bc>.ttl_seconds` under the `ai.` namespace convention. Doc-5K references these keys by name only.

## Notes

- **No `ai.idempotency_dedup_window`** registered: the M9 wire surface is **8 reads** (no caller mutation). The `generate_*` idempotent upsert on `(subject_org_id, entity_ref_id, model_version)` is **out-of-wire / in-process** (`Doc-4K`; Doc-6 cache concern) — not a wire dedup window.
- TTL governs the **regenerable disposable cache** (`Doc-4K §B.12`; hard-delete legitimate, **not** Invariant #8 append-only). TTL expiration ≠ business invalidation.

## Gate closure

- **`[ESC-AI-POLICY]` → RESOLVED.** Doc-5K references `ai.list_page_size_max` (reads) and `ai.<bc>.ttl_seconds` (cache lifecycle) by key.

---

*Additive Doc-3 §12.2 registration, approved. Mirrors Patches v1.1–v1.7. No semantic change; clears the Doc-5K `[ESC-AI-POLICY]` carried item. Fold into the Doc-3 effective patch set under architecture governance.*
