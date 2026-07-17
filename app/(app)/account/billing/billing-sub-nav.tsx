// Billing SECONDARY NAV (IA §4.4 · §6.2) — the sub-nav that reaches the Billing section's sibling
// pages. SERVER COMPONENT; navigation, not state.
//
// WHY THIS EXISTS: `information_architecture.md` §6.2 nests Plans / Subscription / Usage & quota /
// Lead credits / Platform invoices under **Billing**, and §4.4 names this exact case as its example of
// a secondary nav ("e.g. Billing → Plans / Usage / Invoices"). `page_inventory.md` §12 classes those
// pages `Secondary`/`Contextual` — "sub-page", reached from a primary destination — on its rule
// "Secondary/contextual pages are reached from these destinations". That promise was unbuilt:
// `/account/billing` rendered a bare plans catalog, so `/account/usage` and `/account/lead-credits`
// had ZERO inbound links anywhere in the codebase. This is the destination they hang off.
//
// AUTHORITY NOTE: `page_inventory.md` (DRAFT v0.5) and `information_architecture.md` (DRAFT v0.3) are
// **non-authoritative companions** — absent from `00_AUTHORITY_MAP.md`/`CORPUS_INDEX.md`, they coin
// nothing and conform upward to the frozen Doc-7 program (CLAUDE.md §7/§11). They are amendable by
// owner ruling, and both were amended on 2026-07-17 to promote Referral (see `account-nav-model.ts`).
// Do not cite either as frozen.
//
// NOT TABS, BY CONSTRUCTION: each entry is a real route that already exists and owns its own URL, so
// these are `<Link>`s, not Radix tab panels. `WorkspaceTabs` (in-page tabs, used by `/sell/billing`)
// would render each view INLINE — leaving these routes just as unreachable and duplicating their
// content at a second URL on the same surface. A row of route-links is what this actually is, so it is
// a labelled `<nav>` of links, not a `tablist` ([ESC-7B-SEGMENTED]: `tabs` is the wrong semantics —
// that handle stays OPEN; whoever closes it should sweep this site along with the other ~4 copies).
//
// The repo's established idiom for a route-link row — `Button asChild` + `<Link>` + `aria-current`, with
// the active key passed BY PROP (the documents hub's ViewChips idiom, ~25 sites; cf.
// `_components/vendor/rfq/inbox-state-filter.tsx`). Deliberately hook-free/RSC-friendly: `usePathname`
// is unnecessary here because each page is its own route and names its own section literally.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";

/** The Billing section's pages, in `information_architecture.md` §6.2 order. Labels are IA §6.2's own;
 *  hrefs are the existing canonical Surface E routes (nothing new is routed here).
 *
 *  REFERRAL (P-ACC-22) IS DELIBERATELY ABSENT. IA §6.2 originally nested Rewards here, but the owner
 *  ruled it a first-class sidebar destination on 2026-07-17 ("Billing should only manage reward
 *  accounting after eligibility is determined") — so it is reached from the sidebar, not from Billing,
 *  and §6.2 was amended to match. Do not re-add it here without reversing that ruling. */
const BILLING_SECTIONS = [
  { key: "plans", label: "Plans", href: "/account/billing" },
  { key: "subscription", label: "Subscription", href: "/account/subscription" },
  { key: "usage", label: "Usage & quota", href: "/account/usage" },
  { key: "lead-credits", label: "Lead credits", href: "/account/lead-credits" },
  { key: "invoices", label: "Platform invoices", href: "/account/invoices" },
] as const;

export type BillingSectionKey = (typeof BILLING_SECTIONS)[number]["key"];

export interface BillingSubNavProps {
  /** The section the current page IS — each Billing route passes its own key. */
  active: BillingSectionKey;
}

export function BillingSubNav({ active }: BillingSubNavProps) {
  return (
    <nav aria-label="Billing sections" className="mb-6 flex flex-wrap items-center gap-2">
      {BILLING_SECTIONS.map((section) => {
        const isActive = section.key === active;
        return (
          <Button
            key={section.key}
            asChild
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            aria-current={isActive ? "page" : undefined}
          >
            <Link href={section.href}>{section.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
