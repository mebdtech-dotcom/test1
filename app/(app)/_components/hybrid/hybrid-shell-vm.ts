// Hybrid Workspace — DEMO seam + ShellViewModel for the canonical Platform Shell ([ESC-7G-A7]
// realization of Doc-7A R6 / Doc-7C SR3 "Hybrid mounts both"). A Hybrid org (buys AND sells) sees ONE
// sidebar co-mounting BOTH surface sets, grouped-not-merged (Invariant #2) — never a toggle, never a
// cross-route swap (the re-routing toggle was rejected: `vendor_planning_and_design.md:97`).
//
// SEAM ROLE (this file stands in for the SR3 Identity/context layer, which is PARKED): it resolves
// participation → the surface groups to mount, and applies the co-mount TAGGING/ORDERING/Trust-
// isolation. The generic shell then only concatenates+renders via `composeNav` (app/(app)/_components/
// shell/hybrid-nav.ts) — the shell never derives or interprets participation.
//
// PRESENTATION FIXTURE ONLY. Production participation + the navigable surface set come from Identity
// Context (SR3 — `get_active_context`, participation + role + entitlement; Inv #5/#10), never hardcoded.
// No client-supplied org is trusted (Inv #5).
//
// DEMO IA (illustrative; the precise co-mounted IA is the open [ESC-7G-A7] Board question): the
// co-mount shows the two ROLE workspaces (Buying, Selling) + the terminal read-only Trust group.
// Cross-cutting ORG-LEVEL concerns (Team/Organization, Profile/Settings, Billing) are intentionally
// NOT duplicated under each surface here — they belong to the Account surface (Surface E, reached via
// the user menu) and the topbar. "Which groups are surface-specific vs shared" is exactly what the A7
// packet asks the Board; this fixture picks a sensible split to prove the co-mount + no-swap property.
import { BUYER_NAV, BUYER_QUICK_CREATE } from "../../(workspace)/buy/_components/buyer-nav-model";
import { VENDOR_NAV, VENDOR_QUICK_BAR, VENDOR_QUICK_CREATE } from "../vendor/vendor-shell-vm";
import { composeNav } from "../shell/hybrid-nav";
import type {
  NavItem,
  NavSection,
  PlatformParticipation,
  QuickCreateItem,
  ShellViewModel,
} from "../shell";

/** Seam transform — give a label-less LEAD section a co-mount group label. This is a SEAM/co-mount
 *  concern only (buyer-only / vendor-only rendering keep their bare lead section), so it lives here,
 *  NOT as a canonical `BUYER_NAV`/`VENDOR_NAV` edit (the "change canonical only when beneficial in
 *  every context" rule). Returns a NEW section — never mutates the source. */
function labelLeadSection(section: NavSection, label: string): NavSection {
  return { ...section, label };
}

const pickById = (nav: NavSection[], ids: string[]): NavSection[] =>
  nav.filter((section) => ids.includes(section.id));

/** Buying surface groups — buyer overview relabeled "Buying" + the buyer's own surface-specific
 *  groups. Org/Account groups are omitted (shared → Account surface; see header). */
function buyingGroups(): NavSection[] {
  return pickById(BUYER_NAV, [
    "overview",
    "procurement",
    "marketplace",
    "communication",
    "analytics",
  ]).map((section) => (section.id === "overview" ? labelLeadSection(section, "Buying") : section));
}

/** Selling surface groups — vendor primary relabeled "Selling" + the vendor showcase/docs groups. */
function sellingGroups(): NavSection[] {
  return pickById(VENDOR_NAV, ["primary", "showcase", "business-docs"]).map((section) =>
    section.id === "primary" ? labelLeadSection(section, "Selling") : section,
  );
}

/** Trust — the always-TERMINAL read-only group (extracted into its own section in VENDOR_NAV). */
function trustGroups(): NavSection[] {
  return pickById(VENDOR_NAV, ["performance"]);
}

/**
 * Seam: participation → the ordered nav SEGMENTS to mount (stand-in for SR3). Hybrid → both role
 * workspaces + terminal Trust; vendor-only → the full vendor nav; buyer-only → the full buyer nav.
 * Never advertises a surface the org does not participate in.
 */
export function resolveMountedNavGroups(participation: PlatformParticipation): NavSection[][] {
  switch (participation) {
    case "hybrid":
      return [buyingGroups(), sellingGroups(), trustGroups()];
    case "vendor":
      return [VENDOR_NAV];
    case "buyer":
    default:
      return [BUYER_NAV];
  }
}

/** Build a ShellViewModel `nav` for a participation by mounting (seam) then composing (shell). */
function composeNavFor(participation: PlatformParticipation): NavSection[] {
  return composeNav(...resolveMountedNavGroups(participation));
}

const vendorHref = (label: string, fallback: string): string =>
  VENDOR_QUICK_BAR.find((item) => item.label === label)?.href ?? fallback;

/** Mobile bottom-bar — a Hybrid thumb-reach SUBSET spanning BOTH surfaces (not a buyer-only or
 *  vendor-only bar). Final Hybrid quick-bar composition is an [ESC-7G-A7] IA question. */
export const HYBRID_QUICK_BAR: NavItem[] = [
  { label: "Buying", href: "/buy/dashboard", icon: "dashboard" },
  { label: "RFQs", href: "/buy/rfqs", icon: "rfqs" },
  { label: "Selling", href: vendorHref("Home", "/sell/dashboard"), icon: "showcase" },
  { label: "Trust", href: vendorHref("Trust", "/sell/trust"), icon: "trust" },
];

/** Hybrid `+ Create` — both surfaces' create actions (buyer RFQ + vendor catalog/ad). */
const HYBRID_QUICK_CREATE: QuickCreateItem[] = [...BUYER_QUICK_CREATE, ...VENDOR_QUICK_CREATE];

/**
 * Hybrid demo VM — the SAME co-mounted nav is rendered from BOTH the buyer and vendor route-group
 * layouts (see their `layout.tsx`) so a Hybrid user crossing Buying↔Selling sees an IDENTICAL
 * sidebar: proof of "mount both" with no swap. `notifications`/`unreadCount` are deliberately unset
 * (Inv #11: no fabricated non-disclosure-unsafe count) — the topbar center owns real notifications.
 */
export const HYBRID_SHELL_VM: ShellViewModel = {
  identity: {
    // Presentation fixture only. Production identity/participation resolves server-side (SR3).
    user: { name: "Anisur Rahman", email: "anisur@padmavalve.com.bd" },
    activeOrg: { id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" },
    organizations: [{ id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" }],
  },
  nav: composeNavFor("hybrid"),
  quickCreate: HYBRID_QUICK_CREATE,
  quickBar: HYBRID_QUICK_BAR,
  search: { placeholder: "Search RFQs, vendors, products…", href: "/buy/discover" },
};

/** Single-surface fixtures — prove participation-derived mounting (buyer-only → no Selling; vendor-
 *  only → no Buying). Presentation fixtures only (SR3 owns production participation). */
export const BUYER_ONLY_NAV: NavSection[] = composeNavFor("buyer");
export const VENDOR_ONLY_NAV: NavSection[] = composeNavFor("vendor");
