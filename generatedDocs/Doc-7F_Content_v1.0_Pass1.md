# Doc-7F — Buyer Workspace — **Content Pass-1 (§0–§3)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§3 of `Doc-7F_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7F_Structure_v1.0_FROZEN` §0–§3; FR1 (§1) · FR8 (§2) · FR2 (§3) |
| Authority | Conforms to `Doc-7A`/`7B`/`7C` + Doc-4M/Doc-2 (upstream); consistent with frozen Doc-5E/5D Buyer surfaces |
| Posture | Reference-never-restate; **mechanism only — no JSX/page/route code**. Coins **nothing**; never invokes the engine |

> **Scope:** control & gating (§0), scope & the moat surface's place (§1), discovery (§2), RFQ authoring & internal approval (§3). §4–§10 + Appendix in Pass-2/3.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7F is a Doc-7 **surface** document. It **conforms to** `Doc-7A`/`Doc-7B`/`Doc-7C` and to Doc-4M/Doc-2 (upstream); it is **consistent with** the frozen **Doc-5E** (RFQ), **Doc-5F** (operations), **Doc-5D** (discovery) Buyer surfaces. On any conflict the higher document wins; Doc-7F is corrected.

### §0.2 Realize-never-redecide; the moat
Doc-7F binds **frozen Buyer-leg contracts** to views; it re-authors none and invents none. It **never invokes the matching/routing engine** (Doc-5E §8 System out-of-wire), **never auto-recommends/auto-selects a winner** (R6), and **never lets payment influence a matching display** (R7). Gaps → `[ESC-7-API]`, never coined.

### §0.3 Freeze obligation
Doc-7F passes the **full** `Doc-7A` Appendix A (FR11) and clears any carried `[ESC-7-*]` before freeze (governance §8 rules 1, 3).

---

## §1 — Scope & the Moat Surface's Place *(authors no kit/shell/other surface)*

### §1.1 What Doc-7F is
The authenticated **buyer's end-to-end procurement workspace** — discovery, RFQ authoring + internal approval, routing/invitation observability, quotation viewing, comparison, award, post-award operations, buyer-private CRM (FR1). It mounts in the Doc-7C **`(app)` group**, is **org-scoped** (the server-resolved active org; Buyer/Hybrid participation), and consumes the Doc-7B kit + Doc-7C server-side wired client **by reference**.

### §1.2 What Doc-7F is not
It authors no kit/shell (Doc-7B/7C), no other surface (Doc-7D/7E/7G/7H), **no vendor-leg** (quotation authoring/invitation response — Doc-7G), **no admin routing control** (Doc-7H), and **never the matching/routing engine** (Doc-5E §8). Users act, the organization owns (Invariant #5).

---

## §2 — Discovery *(mechanism only; Doc-5D buyer)*

### §2.1 Vendor discovery to invite
The buyer discovers vendors to invite to RFQs via **`search_catalog`** and **`list_vendor_directory`** (Doc-5D, BC-MKT-6) — read through the Doc-7C server-side wired client (cursor pagination, POLICY `page_size`). Results render with the Doc-7B **trust badge** (composed; `Doc-5G` public/User trust read) so the buyer sees vendor trust while sourcing.

### §2.2 Favorites (BC-MKT-7; User membership-only)
Bind **`add_catalog_favorite`** / **`remove_catalog_favorite`** / **`list_catalog_favorites`** (Doc-5D BC-MKT-7, **User membership-only** — verified). The buyer favorites vendors/catalog items for later RFQ invitation. Favorites are **own-org / membership-scoped** (not public — Doc-7D excludes them).

### §2.3 Discovery ≠ matching
Buyer-driven discovery (search/favorite) is **presentation over Doc-5D Public/User reads** and is **distinct from the governed M3 matching/routing** (which is the engine's, out-of-wire — §4). The buyer **chooses** whom to invite from discovery; the engine **separately** routes per governed rules. Display sort/filter **re-queries** the contract (`Doc-7B §4.3`), never a client reorder, and **never re-ranks M3 matching** (`Doc-7A §6.3`).

---

## §3 — RFQ Authoring & Internal Approval *(mechanism only; Doc-5E §4 Buyer)*

### §3.1 Binding (Buyer User commands + reads)
| View | Binds (frozen Doc-5E §4) |
|---|---|
| **RFQ draft / edit** | `create_rfq`, `update_rfq` |
| **Submit for internal approval** | `submit_rfq` |
| **Internal approval workflow** | `approve_rfq`, `reject_internal_rfq` |
| **Lifecycle actions** | `cancel_rfq`, `reissue_rfq` |
| **RFQ reads** | `get_rfq`, `list_rfqs`, `get_rfq_version` |

### §3.2 Internal approval mirrors factory spend authorization
The internal approval workflow (`submit_rfq` → `approve_rfq` / `reject_internal_rfq`) realizes the buyer org's **internal authorization of spend** (Master Architecture — "internal approval workflow that mirrors how factories actually authorize spending"). It is **org-internal** (the buyer org approves its own RFQ before it routes); it is **not** a platform decision and **not** vendor-visible.

### §3.3 State machine (Doc-4M)
RFQ lifecycle renders **only Doc-4M-permitted, Buyer-actor transitions** (`Doc-7A §7`): draft → submitted → (internally approved | rejected) → (routed by the engine) → … . The UI offers no transition the machine forbids; **`expire_rfq` and the routing/matching transitions are System (out-of-wire)** — displayed, never invoked (§4, Pass-2). Optimistic UI reconciles to server state (STATE/CONFLICT 409 → re-fetch).

### §3.4 Versioning & immutability
RFQ versions (`get_rfq_version`) realize Invariant #8 (nothing authoritative overwritten — versioned). `reissue_rfq` creates a new version/cycle, never mutating a frozen prior RFQ. The UI surfaces version history read-only.

### §3.5 Org-scoped; writes via server actions
All RFQ authoring/approval operates inside the **server-resolved active org** (`Doc-7C` SR3); writes are **server actions** with a stable idempotency key (`Doc-7A §5.6`); the client org ID is never trusted. Authz gating on RFQ slugs is **UX over server enforcement** (`Doc-7A §4.3`).

---

## Pass-1 self-check (pre-review)

- **Bindings verified:** §3 ↔ Doc-5E §4 (verified line 37); §2 ↔ Doc-5D BC-MKT-6/BC-MKT-7 (verified).
- **Moat respected:** §2.3/§3.3 — discovery ≠ matching; engine out-of-wire; never invoked.
- **Coins nothing:** 0 new module/contract/route-as-API/field/state/POLICY key.
- **Org-scoped:** §3.5 — active-org server-resolved; client org ID never trusted.
- **Open for review:** confirm `approve_rfq`/`reject_internal_rfq` are the internal-approval edges in Doc-4M (not vendor-visible); confirm the trust badge on discovery binds a Public/User Doc-5G read for the authenticated buyer.

*End of Content Pass-1 (§0–§3) — DRAFT. Realizes `Doc-7F_Structure_v1.0_FROZEN` §0–§3. Nothing coined; engine never invoked. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§4–§7).*
