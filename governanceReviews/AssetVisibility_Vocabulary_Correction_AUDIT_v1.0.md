# `AssetVisibility` vocabulary correction — bounded audit (steps 1–2) · ⛔ HALT before step 3

| Field | Value |
|---|---|
| **Status** | 🟡 **AUDIT COMPLETE · RENAME HALTED — owner ruling requested.** Steps 1–2 of the ruled correction are done. **Step 3 (replace `public` with `published`) must not proceed as specified** — the audit shows the premise is incomplete. |
| **Opened by** | Owner ruling 2026-07-20 §4: *"Create a separate bounded correction… If `public` is serialized, persisted, or consumed externally, halt and report before renaming. Otherwise this is a vocabulary-alignment refactor, not a new domain decision."* |
| **Scope** | `app/(app)/_components/vendor/microsite/types.ts` and its consumers. **Deliberately outside the DS-W0-R1 journey refactor**, per the same ruling. |
| **Halt reason** | Not the anticipated one. The value is **not** serialized, persisted, or externally consumed (§2 — the halt condition does not fire). It halts because **one frontend type is standing in for three different frozen concepts**, one of which has no backing column at all, so a blanket rename would be wrong for two of the three consumers (§3). |

---

## §1 — Consumer audit (ruling step 1)

Seven references, all inside the vendor Microsite presentation feature:

| # | Site | Role |
|---|---|---|
| 1 | `types.ts:24` | `export type AssetVisibility = "draft" \| "public"` — the definition |
| 2 | `types.ts:51` | `MicrositeSectionView.visibility` — **sections** |
| 3 | `types.ts:80` | `BrandingAssetView.visibility` — **branding assets** |
| 4 | `types.ts:95` | `SeoSettingsView.visibility` — **SEO settings** |
| 5 | `status-chips.tsx:45,49,54-55` | `VisibilityChip` — tone map, label map, and an `?? "draft"` default |
| 6 | `types.ts:70` | `isPubliclyVisibleSection()` — compares `visibility === "public"` |
| 7 | `index.ts:33` | barrel re-export |

No consumer outside this feature. No buyer, admin, or public surface imports it.

## §2 — Boundary check (ruling step 2) — the stated halt condition does **not** fire

| Boundary | Result |
|---|---|
| Serialized (`JSON.stringify`, flight payload as data, form value) | **No** — swept both features: no `JSON.stringify`, no `formData`, every control `disabled` |
| Persisted (Prisma, server action, storage) | **No** — no `prisma`, no `"use server"`, no `localStorage`/`sessionStorage` |
| Consumed externally (fetch, URL param, API) | **No** — no `fetch(`, no `searchParams` binding; the whole feature is presentation-only with zero wired reads |
| Rendered | **Yes, and only that** — as the display labels "Draft" / "Public" via the kit `StatusChip` |

So the value never leaves the render. On the owner's stated test this would be a safe
vocabulary-alignment refactor. **It isn't — for a reason the test did not anticipate.**

## §3 — ⛔ The finding that halts step 3: one type, three frozen concepts

The three fields typed `AssetVisibility` map to three *different* frozen realities:

| Consumer | Frozen backing | Frozen vocabulary | Is `"public"` wrong here? |
|---|---|---|---|
| `MicrositeSectionView.visibility` | `profile_sections.publish_state` (Doc-6D Pass2:164, `:184` **PUB-1**) | `ENUM('draft','published')` — PUB-1 **explicitly coins no third value** | **Yes** — should be `published` |
| `BrandingAssetView.visibility` | **no column exists** — Doc-6D Pass2:291-292: branding assets and SEO settings have *"no own `publish_state` column"*; public-read is gated on **the parent being public** | none of its own | **Neither** — the field models something the schema does not have |
| `SeoSettingsView.visibility` | same as above | none of its own | **Neither** — same |
| *(for contrast)* `vendor_profiles.visibility` | `marketplace.vendor_visibility` (Doc-6D Pass1:58, `:77`) | `ENUM('public')` — **single value**, no `draft`, no `buyer_private` (MK-CR3) | **No** — `'public'` is correct and frozen here |

Two consequences:

1. **`public → published` is right for exactly one of the three consumers.** Applying it to branding
   and SEO would replace one wrong vocabulary with another wrong vocabulary.
2. **Branding and SEO carry a field the frozen schema does not define.** Deciding what their
   "visibility" *means* — derived from the parent profile's `visibility`? dropped entirely? — is a
   **modelling decision about a presentation surface**, not a rename. That is the line the ruling
   itself drew ("not a new domain decision"), and this crosses it.

Additionally, `VisibilityChip` defaults an absent value to `"draft"` (`status-chips.tsx:55`) — the
same fabricate-a-lifecycle-from-an-absence class already corrected in `MicrositeStatusChip` this
session. It is currently unreachable (sections render only when data exists) but it is the same bug.

## §4 — Recommended correction (for owner ruling; **not executed**)

Split the type rather than rename it:

1. **Sections** — introduce `SectionPublishState = "draft" | "published"` bound to
   `profile_sections.publish_state`, cite PUB-1, and update `isPubliclyVisibleSection` to
   `publish_state === "published" && is_visible === true` (the two-axis predicate is already correct;
   only the token changes).
2. **Branding / SEO** — **remove** `visibility` from `BrandingAssetView` and `SeoSettingsView`, or
   replace it with an explicitly-named derived display prop (e.g. `parent_is_public?: boolean`)
   documenting that the schema has no own column and public-read is parent-gated. **Owner/Board to
   choose** — this is the modelling decision above.
3. **`VisibilityChip`** — render an honest absence instead of defaulting to "Draft", matching the
   `MicrositeStatusChip` correction.
4. **Retire `AssetVisibility`** once no consumer remains, or narrow it to the single legitimate
   `vendor_profiles.visibility` use if one appears.
5. **Verification** — exhaustive-switch typing on the new union (no `default:` fallthrough), a
   render check per consumer, `tsc`/eslint clean, and a corpus re-cite of Pass1:58 / Pass2:164,184 /
   Pass2:291-292.

## §5 — Blast radius if it proceeds

`microsite/types.ts` · `microsite/status-chips.tsx` · `microsite/index.ts` ·
`microsite/microsite-builder.tsx` (renders `VisibilityChip`) · `microsite/preview-publish-panel.tsx`
(consumes the predicate) · `showcase/journey-overview.tsx` (consumes the predicate). Six files, all
presentation, no route or contract touched. Nothing outside the vendor workspace.

---

*Steps 1–2 executed as ruled; step 3 halted and reported, per the ruling's own instruction to stop
before renaming if the premise does not hold. Raise ≠ Accept (§13): this proposes, it does not
decide. Nothing was changed under this audit.*
