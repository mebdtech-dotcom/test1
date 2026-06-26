# Doc-8D — Content Pass-2 (§4–§7) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8D_Content_v1.0_Pass2.md` (§4–§7) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board · **Security Architect** |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 1 MAJOR + 1 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Content Pass-2 Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-6A §11/§5/R8/§4` · `Doc-3 §12` (+ per-module POLICY patches v1.2/v1.9) · `Doc-2 §7/§0.3/§6` · Invariant #8/#11 · `Doc-6C delegation_grants` · `Doc-6D` (tri-actor RLS, publish-state) · `Doc-6E`/`Doc-6F` (D3) · `Doc-5K R7` · `Doc-8B §3/§5` · `Doc-8C §8` seam · CLAUDE.md §2/§10 — all correctly invoked.
- §5 data-layer scope (row visibility, single-sourced criterion) + the §8 seam (8D RLS backstop / 8C app) — correctly carried from the structure.

0 BLOCKER. Migration (§4), the RLS structure (§5.1–§5.3), and cross-module integrity (§6) are sound. **One MAJOR on the crown-jewel facet labelling**, one paraphrase precision, one readiness nit.

### MAJOR-1 — §5.4 mislabels marketplace **publish-state visibility** as a "ready" **Invariant-#11 byte-equivalence** facet; the #11 gate is the **buyer-private** case (Doc-6F) and is entirely execution-deferred
§5.4 presents two byte-equivalence facets: "marketplace visibility (publish-state, `Doc-6D`) — ready now" and "buyer-private CRM exclusion (`Doc-6F`) — deferred." **This conflates two different non-disclosures.** **Invariant #11** is *"private exclusion stays private, **blacklist undetectable**"* — specifically the **buyer-private exclusion** (`buyer_vendor_statuses`, M4/`Doc-6F`). **Marketplace publish-state** is **general visibility-scope** (unpublished content is hidden) — `Doc-6D` froze with **"no `buyer_private` coined"**, so there is **no exclusion concept** in marketplace, only publish/unpublish. "Excluded vendor ≡ non-matched vendor" requires the exclusion concept, which exists only in M4/`Doc-6F`. So the **#11 byte-equivalence gate is entirely execution-deferred** (await `Doc-6F`); the marketplace publish-state is a **general visibility RLS** assertion (positive/negative/cross-tenant — ready now), **not** the #11 byte-equivalence.
**Required fix:** §5.4 — state the **#11 byte-equivalence gate (blacklist undetectable) is the buyer-private case (`buyer_vendor_statuses`, M4/`Doc-6F`) — authored now, entirely execution-deferred** until `Doc-6F` freezes. **Move marketplace publish-state visibility out of §5.4** into **§5.1 (positive) / §5.2–§5.3 (negative/cross-tenant)** as a general visibility RLS check (ready now — `Doc-6D` tri-actor). **Carry a clarification** that the frozen structure's D3/§5 "marketplace-visibility facet of byte-equivalence" is more precisely **general visibility RLS (ready)**, distinct from the **#11 byte-equivalence proper (buyer-private, deferred)** — additive content clarification (`CLAR-8D-1`), no frozen document edited.

### MINOR-1 — §5.1 paraphrases the Doc-6D tri-actor RLS behavior; assert per the frozen policy definitions
§5.1 describes "anonymous sees published-only; User sees own-org + published; Admin per policy." If the frozen `Doc-6D` RLS policies differ in nuance, the paraphrase **over-specifies** (a re-specification risk — Doc-8A §3.3).
**Required fix:** §5.1 — assert the positive cases **per the frozen `Doc-6D` RLS policy definitions by pointer**, not a paraphrase; the description is illustrative, the oracle is the actual frozen policy.

### NITPICK-1 — §4 Prisma-codegen integrity is also execution-deferred (needs Prisma + schema as code)
§4 marks the migration sequence execution-deferred but the **codegen-integrity** check (`generated-contracts-registry/` no-diff) equally needs the code/Prisma toolchain (NOT STARTED).
**Suggested fix:** §4 — group codegen-integrity with the migration sequence as execution-deferred; the targets (registered keys/roles, codegen freshness) are authored now.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§5.4 byte-equivalence at the DB is impossible — two different vendors have different ids/rows, so results can never be 'byte-identical'."* | **REJECTED (false).** Byte-equivalence is over the **observer's view**, not the two vendors' own rows. The test constructs the excluded case and the non-matched case and asserts the **querying buyer/anonymous sees the same result** — the excluded vendor does not appear, **exactly as** a non-matched vendor does not appear — so the buyer **cannot distinguish "blacklisted" from "never matched."** Equivalence of the **observer's result set**, not of vendor identities. That is precisely Invariant #11 (blacklist undetectable); the criterion is well-defined. (Reinforces MAJOR-1: this is the buyer-private case, Doc-6F.) No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 §5.4 marketplace-visibility mislabeled as #11 byte-equivalence | MAJOR | Pass-2 Patch — #11 gate = buyer-private (Doc-6F, deferred); marketplace → §5.1-5.3 general visibility; `CLAR-8D-1` |
| MINOR-1 §5.1 paraphrases Doc-6D RLS | MINOR | Pass-2 Patch — assert per frozen policy by pointer |
| NITPICK-1 §4 codegen deferred | NIT | Pass-2 Patch — group with migration deferred |

**Gate:** 1 MAJOR + 1 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited. The MAJOR is a crown-jewel correctness fix: Invariant #11 (blacklist undetectable) is the buyer-private case (Doc-6F), distinct from marketplace publish-state visibility.*
