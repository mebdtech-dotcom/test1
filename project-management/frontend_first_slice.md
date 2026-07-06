# iVendorz — Frontend First Slice (Wave-3-ready plan)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.1** — Frontend First Slice (non-authoritative companion; **planned, not started**)
**Date:** 2026-06-29
**Companions:** [`landing_page_spec.md`](../docs/product/ux/landing_page_spec.md) · [`page_inventory.md`](../docs/product/ux/page_inventory.md) · [`screen_specifications.md`](../docs/product/ux/screen_specifications.md) · [`page_templates.md`](../docs/frontend/design-system/page_templates.md) · [`shared_conventions.md`](../docs/frontend/components/shared_conventions.md) · [`esc_registry.md`](../esc_registry.md)

---

## 0. Precedence, scope & sequencing (read first)

Non-authoritative companion. It **records the chosen first *frontend* implementation slice** so it is
ready to execute **when the roadmap reaches it** — it **does not reorder the roadmap and authorizes no
out-of-sequence build**. Precedence: it conforms to the frozen corpus and the **`Build_Roadmap_v1.0.md`**.

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this plan conforms upward
```

> **Sequencing fact (binding):** the build is **M0→M1 (Wave 2, current) → M2·M5·M6·M7 (Wave 3) → …**
> (`Build_Roadmap_v1.0.md`). This slice is the **Public surface (Doc-7D)**, which binds **M2** reads,
> so it is **Wave 3** work — built "per surface, once its module's Doc-5 surface is wired" (roadmap
> §Frontend). The **authoritative** FE design is **Doc-7D** (FROZEN); this plan + the companion docs
> are non-authoritative supplements.

---

## 1. Why this slice (rationale)

It is the cleanest possible **frontend walking skeleton**: **anonymous, read-only**, **no auth, no
active-org, no mutations**, binding only **three** wired Public reads + the public trust badge. It
exercises the whole shell + discovery stack end-to-end before any authenticated complexity.

## 2. Readiness gate (ALL must be green before this slice starts)

- [ ] **Wave 2 delivered** — M0 → M1 complete (`Build_Roadmap_v1.0.md` §Wave 2).
- [ ] **M2 Marketplace built** with its **wired Doc-5D API**: `search_catalog`, `list_vendor_directory`,
      `get_public_vendor_profile` (+ public **trust badge** read, Doc-5G) — Wave 3.
- [ ] **Doc-8 8D** public/anonymous tri-actor suite available (the conformance gate).
- [ ] Doc-7C app shell + Doc-7B kit realized to the extent these pages mount.

Until then this slice is **planned, not buildable**. (A non-production prototype with mocked data was
considered and **declined** in favor of following the roadmap.)

## 3. The slice (your chosen order)

| # | Step | Page(s) (PI) | Template (PT) | Binds (M2 Doc-5D) | Notes / ESC (ER) |
|---|---|---|---|---|---|
| 1 | **Landing** | `P-PUB-01` | `T-LANDING` | the 3 reads via the command center | full spec = `LP` |
| 2 | **Industrial Procurement Command Center** | `LP §2` `SEC-COMMAND-CENTER` | (in `T-LANDING`) | `search_catalog`, `list_vendor_directory` | Create RFQ / Find Suppliers → route to `(auth)`; AI = "Coming Soon" `ESC-7-AI` |
| 3 | **Industrial Category Explorer** | `P-PUB-07/08/09` | `T-LISTING` | `search_catalog` facets | full tree blocked → `ESC-7-API-CATNAV` (facets only) |
| 4 | **Universal Search** | `P-PUB-10` · `P-PUB-19` | `T-LISTING` | `search_catalog` | FTS now |
| 5 | **Vendor Directory** | `P-PUB-12` | `T-LISTING` | `list_vendor_directory` | — |
| 6 | **Vendor Profile / Microsite** | `P-PUB-13`…`P-PUB-17` | `T-DETAILS` | `get_public_vendor_profile` + trust badge (M5, read-only) | published-only; product detail → `ESC-7-API-PRODDETAIL` |

**Build order within the slice:** 5 → 4 → 6 → 3 → 1/2 (data-bearing list/detail first, then the Landing
+ command center compose them). Adjust during Wave 3 planning.

## 4. Inherited governance (no restatement — see `SC`)

All pages inherit `GI-01…12` (`SC §1`): **published-only, zero buyer-private concept** (Invariant #11),
**no M3 re-rank** (GI-04), **cursor pagination** (GI-03), anonymous → any authed action routes to
`(auth)`, trust **displayed never computed**, WCAG-AA (GI-06), mobile-first (GI-07). Presets `TB-LIST`/
`SK-LIST`/`SK-CARD`/`MB-LIST` etc. (`SC §3`).

## 5. ESC gaps that cap fidelity at first ship (see `ER`)

`ESC-7-API-CATNAV` (category tree) · `ESC-7-API-PRODDETAIL` (public product page) · `ESC-7-API/stats`
(marketplace statistics) · `ESC-7-API-ADS` (anonymous ads) · `ESC-7-AI` (assistant). Each ships its
ER-defined interim; full fidelity awaits the additive Doc-5x patches (Board).

## 6. Definition of Ready / Done & gates

Owned by `Build_Roadmap_v1.0.md` (Definitions of Ready/Done) + the **Doc-8** conformance fabric — this
plan **points** to them and authors no acceptance criteria (Doc-8 owns testing).

---

*Non-authoritative. Conforms upward; coins nothing; reorders no roadmap. On any conflict the frozen
document wins and this file is patched to match.*
