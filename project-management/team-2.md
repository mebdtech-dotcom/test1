# Team-2 Queue — Buyer

**Owns:** `P-BUY-*` (Doc-7F · Doc-5E/5F/5D). Titles + bindings are the **source record** in
[`page_inventory.md`](../page_inventory.md). Work highest-priority `Ready` first. CRM pages
(`P-BUY-26/27`) are **buyer-private** (Invariant #11) — never leak, blacklist undetectable.

| ID | Title | Priority | Dependency | Status | Notes |
|---|---|---|---|---|---|
| P-BUY-01 | Buyer dashboard | P1 | Ready | 🟩 Built | refinement item (owner-named) |
| P-BUY-02 | Discover vendors | P1 | Ready | ⬜ | |
| P-BUY-03 | Vendor directory (in-app) | P2 | Ready | ⬜ | |
| P-BUY-04 | Vendor profile (in-app) | P2 | Ready | ⬜ | trust read-only |
| P-BUY-05 | Favorites | P2 | Ready | ⬜ | saved vendors |
| P-BUY-06 | RFQ list | P1 | Ready | 🟩 Built | cursor pagination |
| P-BUY-07 | RFQ create wizard | P1 | Ready | 🟩 Built | resumable draft |
| P-BUY-08 | RFQ detail — overview | P1 | Ready | 🟩 Built | status from Doc-4M |
| P-BUY-09 | RFQ detail — quotations | P1 | Ready | 🟩 Built | visibility-gated |
| P-BUY-10 | RFQ detail — activity | P2 | Ready | ⬜ | deferral invisible |
| P-BUY-11 | RFQ version history | P2 | Ready | ⬜ | versioned (Inv. #8) |
| P-BUY-12 | Internal approval | P1 | Ready | ⬜ | no auto-approve |
| P-BUY-13 | Routing log / invitations | P2 | Ready | ⬜ | no excluded vendor shown |
| P-BUY-14 | Quotation detail | P1 | Ready | 🟩 Built | |
| P-BUY-15 | Comparison statement | P1 | Ready | 🟩 Built | read-only, System-gen, **never recommends** (R6) |
| P-BUY-16 | Clarifications / thread | P1 | Ready | 🟩 Built | |
| P-BUY-17 | Award | P1 | Ready | ✅ Approved | RV-0005 PASS (re-review) — mock shortlist + working GET-form wizard nav (no default winner, R6); `<fieldset>/<legend>`. Both RV-0002 findings resolved |
| P-BUY-18 | Close lost | P2 | Ready | ✅ Approved | RV-0009 PASS (Team-4). reason_code enum VERBATIM (Doc-4E §E8.5); non-penalizing exemplary; notFound Inv #11; GET-form + loading.tsx. NIT: conditional-required not native-enforced |
| P-BUY-19 | Engagements | P1 | Ready | ✅ Approved | RV-0011 PASS (Team-4). Projection discipline exemplary — only the 3 frozen `list_engagements` fields; no free-text search; cursor pagination; genuine-empty (Inv #11) |
| P-BUY-20 | Engagement detail | P1 | Ready | ✅ Approved | RV-0015 PASS (Team-4). EXEMPLARY — only projected `get_engagement` fields; currency-driven Money (BDT not assumed); counterparty opaque ref (no coined name); ENG-01/02/03 registered, in-code only; money-boundary; notFound byte-identical. Model detail page |
| P-BUY-21 | Purchase order | P1 | Ready | ✅ Approved | RV-0022 PASS (Team-4). Projection verified verbatim vs Doc-4F §F5.8 (6 fields); PO body/total/list deliberately omitted (nothing coined); `can_approve_po` = real Doc-2 §7 slug, DISTINCT (never collapsed); money-boundary DF-6; notFound byte-identical, no leaf-ref leak; versioned Inv #8; loading.tsx; model detail page (on par with P-BUY-20) |
| P-BUY-22 | Payments | P1 | Ready | ✅ Approved | RV-0024 PASS (Team-4). `payment_records` projection verified verbatim vs Doc-2:783/Doc-4F §F5.6 {amount,currency,paid_at,method_note,status}; distinct slugs `can_record_payments`/`can_approve_payment` confirmed (Doc-4F §F5.6, "distinct"), Confirm only on `recorded`; money-boundary DF-6; notFound byte-identical; loading.tsx. Shared touches git-verified: `PaymentStatus`/`paymentStatusDisplay` additive, `stickyFirstColumn` pre-existing. Model detail page |
| P-BUY-23 | Trade invoice review | P2 | Ready | ⬜ | ≠ platform invoice |
| P-BUY-24 | Challan | P2 | Ready | ⬜ | |
| P-BUY-25 | WCC | P2 | Ready | ⬜ | |
| P-BUY-26 | CRM — vendor list | P2 | Ready | ⬜ | **buyer-private** (Inv. #11) |
| P-BUY-27 | CRM — vendor detail | P2 | Ready | ⬜ | **never leaks** — approve/blacklist private |
