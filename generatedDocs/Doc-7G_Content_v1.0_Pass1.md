# Doc-7G — Vendor Workspace — **Content Pass-1 (§0–§5)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§5 of `Doc-7G_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§6–§11 + Appendix) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7G_Structure_v1.0_FROZEN` §0–§5; GR1/GR11 (§1) · GR2 (§2) · GR3 (§3) · GR4 (§4) · GR5 (§5) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with frozen Doc-5D Vendor surfaces |
| Posture | Reference-never-restate; **mechanism only — no JSX/page/route code**. Coins **nothing** |

> **Scope:** control & gating (§0), scope & place (§1), vendor profile management (§2), microsite & presentation (§3), catalog & products (§4), advertising (§5). §6–§11 + Appendix (invitation/quotation/lead/post-award/byte-equivalence/composition) in Pass-2.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7G is a Doc-7 **surface** document. It **conforms to** `Doc-7A`/`Doc-7B`/`Doc-7C` and to Doc-4M/Doc-2 (upstream); it is **consistent with** the frozen **Doc-5D** (vendor presentation), **Doc-5E** (quotation/invitation), **Doc-5F** (vendor-leg ops) surfaces. On any conflict the higher document wins; Doc-7G is corrected.

### §0.2 Realize-never-redecide; the byte-equivalence attestation
Doc-7G binds **frozen Vendor-leg contracts** to views; it re-authors none and invents none. It carries the **load-bearing byte-equivalence attestation** (§10, Pass-2; Invariant #11): a blacklisted/excluded vendor's experience is byte-equivalent to a non-matched vendor's. The vendor **declares** its financial tier (M5 verifies) and **mutates no platform-wide score**. Gaps → `[ESC-7-API]`, never coined.

### §0.3 Freeze obligation
Doc-7G passes the **full** `Doc-7A` Appendix A (GR12) and clears any carried `[ESC-7-*]` before freeze (governance §8 rules 1, 3). The byte-equivalence attestation (§10) is the load-bearing freeze obligation.

---

## §1 — Scope & the Vendor Workspace's Place *(authors no kit/shell/other surface)*

The authenticated **vendor's workspace** — profile & microsite management, catalog/products, ads, invitation inbox, quotation authoring, lead pipeline, post-award vendor-leg (GR1). Mounts in the Doc-7C **`(app)` group**, is **org-scoped** (server-resolved active org; Vendor/Hybrid participation), and consumes the Doc-7B kit + Doc-7C server-side wired client **by reference**. It authors no kit/shell, no other surface (Doc-7D/7E/7F/7H), **no buyer-leg**, **no admin surface**, and **never the matching/routing engine**. Users act, the organization owns (Invariant #5).

---

## §2 — Vendor Profile Management *(mechanism only; Doc-5D BC-MKT-1)*

### §2.1 Binding
| View | Binds (frozen Doc-5D BC-MKT-1) |
|---|---|
| **Create / claim profile** | `create_vendor_profile`, `claim_vendor_profile` (**carries `Doc-5D` DD-7**, tracked) |
| **Edit profile / ownership** | `update_vendor_profile`, `transfer_vendor_ownership` |
| **Capacity profile** | `upsert_vendor_capacity_profile` |
| **Declared financial tier** | `set_declared_financial_tier` |
| **Reads** | `get_vendor_profile`, `get_vendor_capacity_profile`, `get_declared_financial_tier`, `get_financial_tier_history` |

### §2.2 Capability matrix (Invariant #1)
Vendor capability is realized as a **matrix of 4 flags** — `can_supply` / `can_service` / `can_fabricate` / `can_consult` — **not a label** (Invariant #1). The profile editor presents the four independently; the UI never collapses them to a single "vendor type."

### §2.3 Declared tier ≠ verified tier (score firewall)
`set_declared_financial_tier` lets the vendor **declare** its financial tier; the **M5-verified tier is read-only** (the vendor never sets it — it is auto-verified under System; governance firewall). The UI clearly distinguishes **declared** (vendor-set) from **verified** (M5, read-only); the vendor mutates no platform-wide score.

### §2.4 Claim lifecycle & visibility
`claim_vendor_profile` realizes the claim lifecycle (carrying `Doc-5D` DD-7, by pointer — not re-decided here). Profile visibility scope (`buyer_private` | `public`) and claim state render per Doc-4M; org-scoped; writes via server actions + idempotency key.

---

## §3 — Microsite & Presentation Management *(mechanism only; Doc-5D BC-MKT-4; Content≠Presentation; R5)*

### §3.1 The vendor manages the draft projection
The vendor manages the **draft (controlling-org) projection** of its microsite/presentation; the BC-MKT-4 presentation commands + **`publish_*`/`unpublish_*`** are bound at content (bind-or-ESC). **`publish_*` drives the draft→published transition** (Doc-4M); **no draft state leaks to the public surface** (`Doc-5D R5`). The **published projection renders in Doc-7D** (Public) — two surfaces, one owner (Doc-7A §6.2).

### §3.2 Content ≠ Presentation; vendor-branded theming
The microsite renders **M2-owned content** with **vendor-branded presentation** (Doc-7B microsite theme override — presentation-only, owns no content). The vendor edits content + theme in the draft; the published projection is what the public sees.

---

## §4 — Catalog & Products *(mechanism only; Doc-5D BC-MKT-3/2)*

### §4.1 Products & specs (BC-MKT-3)
Bind `create_product`, `update_product`, `set_product_status`, `link_product_spec`, `unlink_product_spec`, `create_spec_library_entry`, `update_spec_library_entry`, `add_spec_document`, `supersede_spec_document` + reads (`get_product`, `list_products`, `get_spec_library_entry`, `get_spec_document`). Products follow draft/published (R5); spec documents are **versioned** (`supersede_spec_document` — Invariant #8, never overwritten).

### §4.2 Category assignment (BC-MKT-2)
Bind `assign_category`, `update_category_assignment`, `remove_category_assignment` + `list_categories`/`get_category_assignments`. **Categories are Admin-governed** (`create_category` is Admin — Doc-7H); the vendor only **assigns** its products to existing categories.

---

## §5 — Advertising *(mechanism only; Doc-5D BC-MKT-5 vendor leg)*

### §5.1 Binding
Bind `create_advertisement`, `submit_advertisement`, `set_advertisement_state` (User leg) + reads (`get_advertisement`, `list_advertisements`). The vendor creates and **submits** an ad.

### §5.2 The vendor submits; Admin reviews
**`review_advertisement` is Admin governance** (Doc-7H) — **not** here. The ad lifecycle (draft → submitted → reviewed → active/rejected) renders per Doc-4M; the vendor sees its ad's state but never performs the review. Entitlement (the vendor's plan) gates ad capacity via the wired billing read (the quota indicator — §11, Pass-2), never a name-string check.

---

## Pass-1 self-check (pre-review)

- **Bindings verified:** §2 ↔ Doc-5D BC-MKT-1 (verified line 40/42); §4 ↔ BC-MKT-3/2 (line 44/45); §5 ↔ BC-MKT-5 (line 47).
- **Firewall:** §2.3 — declared ≠ verified tier; vendor mutates no score.
- **Content≠Presentation:** §3 — vendor manages draft; published renders in Doc-7D; no draft leak (R5).
- **Coins nothing:** 0 new module/contract/route-as-API/field/state/POLICY key.
- **Open for review:** confirm the BC-MKT-4 publish/unpublish command names at content; confirm `transfer_vendor_ownership` vs the org-level `transfer_ownership` (Doc-5C §C5) are distinct (vendor-profile ownership vs org ownership).

*End of Content Pass-1 (§0–§5) — DRAFT. Realizes `Doc-7G_Structure_v1.0_FROZEN` §0–§5. Nothing coined. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§6–§11 + Appendix).*
