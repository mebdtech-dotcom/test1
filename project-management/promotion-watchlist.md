# Promotion Watchlist — shared-component promotions (FE-SH)

**FE Program Management v1.0** · Non-authoritative. **Owner (maintains): Architecture Board** —
state transitions are ruled at Board close only. The kit is the **frozen foundation**: extend,
never duplicate; every promotion is Board-gated and enters the kit as `[ESC-7B-…]`.

## Promotion lifecycle (no stage skipping — prevents duplicate-component accumulation)

```
Candidate → Approved (Board) → Extracted → Migrated → Old-removed → Closed
                 (+ Rejected / Deferred at any pre-Extracted stage)
```

| Stage | Requirement |
|---|---|
| **Approved** | all 4 criteria: ① used in ≥2 surfaces/workspaces · ② cited in ≥2 approved reviews (RV refs) · ③ byte-equivalence plan · ④ Board approval + `[ESC-7B-*]` registration |
| **Extracted** | component lands at its new home; consumers untouched |
| **Migrated** | all consumers repointed; **byte-equivalence proof per consumer** (RV-0038 precedent) |
| **Old-removed** | duplicate copies deleted; **grep-verified zero references** |
| **Closed** | Review-B regression pass + row finalized |

## Watchlist

| Candidate | Reason | Current consumers | Owner (Mnt) | Review refs | Target | Cost | State |
|---|---|---|---|---|---|---|---|
| FE-SH-01 `DataListTable` | buyer/vendor/admin parallel table stacks; `AdminQueueTable` alone has 19 consumers | buyer shared · vendor shared · admin (AdminQueueTable) | Kit owner | RV-0013 (canonical admin queue) · freeze-report OBS | FE-CLN-03 | L | Candidate |
| FE-SH-02 `WorkspaceTabs` | vendor M8 extraction proved the shape; buyer tab wrappers similar | vendor/shared · buyer RFQ detail tabs | Kit owner | Team-3 M8 pass (byte-identical) · RV-0075 | FE-CLN-03 | M | Candidate |
| FE-SH-03 `DescriptionList` | buyer + vendor + public keep parallel copies | vendor/shared · buyer `_components` · public microsite | Kit owner | Team-3 M8 pass · RV-0022/0031 detail pages | FE-CLN-03 | M | Candidate |
| FE-SH-04 `PresentationFormNote` | presentation-only form notice duplicated across admin/vendor | vendor/shared · admin editors | Kit owner | RV-0029 (promotion OBS) | FE-CLN-03 | S | Candidate |
| FE-SH-05 Status components (`state-display`/`StatusChip`) | frozen Doc-4M token chips consumed by every surface | all four surfaces | Kit owner | RV-0064 (additive state-display) · RV-0070 | FE-CLN-03 | M | Candidate |
| FE-SH-06 `ActivityTimeline` | shared lifecycle timeline (buyer activity, routing log) | buyer shared (P-BUY-10/13) | Kit owner | RV-0056 · RV-0064 | FE-CLN-03 | S | Candidate |
| `Callout` (buyer inline dup ~10×) | FZ-05 freeze finding — extract before F2-Z closes | buyer surface (inline copies) | Team-2 → Kit owner | `BUYER_FRONTEND_FREEZE_REPORT_v1.0.md` FZ-05 | FE-CLN-01 | S | Candidate |
| `EngagementDocumentFileCard` | already extracted at rule-of-three (PO/Challan/WCC) — watch for cross-surface need | buyer engagement docs | Team-2 | RV-0038 (byte-equivalence proof) | — | S | Deferred (single-surface today) |
| `RadioRow` consolidation | FZ-04 — hand-rolled radios across buyer/account forms | buyer + account forms | Kit owner | freeze report FZ-04 · RV-0036/0066 (OBS) | FE-DS-06 | S | Candidate |

FE-DS watch items (kit-owner scope, Board-gated): kit `FormField role="alert"` (FZ-09) · undefined
tokens `--iv-reading-max` / `--iv-form-max` (RV-0030/0087 OBS) · kit `Select` gap (RV-0029 OBS) ·
kit `Switch` gap (RV-0034 flag) — all → **FE-DS-06/FE-DS-07** scoping.
