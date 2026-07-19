import type { NavIconKey } from "./icons";

// Presentation view-model for the Shared Authenticated Shell (Doc-7C SR2/SR3/SR6 · IA §3/§4).
//
// These are PRESENTATION types, NOT Doc-5 contract DTOs. The real data is resolved SERVER-SIDE by the
// (deferred) Doc-7C data layer — active org + org list via `get_active_context` / `list_my_organizations`
// (Doc-5C §C8), notifications via M6 `Doc-5H` §5 — and mapped onto this view-model. The shell renders
// from these props and WIRES NOTHING (presentation-only). No contract field is invented; each concept
// binds its upstream owner by pointer.

/** Platform participation (Invariant #2) — drives which nav groups mount (Buyer / Vendor / Hybrid). */
export type PlatformParticipation = "buyer" | "vendor" | "hybrid" | "staff";

export interface ShellOrg {
  id: string;
  name: string;
  participation?: PlatformParticipation;
}

export interface ShellUser {
  name: string;
  email: string;
  /** Resolved avatar URL (from a `file_ref` — Doc-7C SR8); optional → initials fallback. */
  avatarUrl?: string;
}

export interface ShellIdentity {
  user: ShellUser;
  activeOrg: ShellOrg;
  /** Switchable orgs (`list_my_organizations` — Doc-5C §C8); switching re-resolves context (SR3, deferred). */
  organizations: ShellOrg[];
}

export interface NavItem {
  label: string;
  href: string;
  /** Serializable icon key resolved by the client nav components (see `icons.ts`). */
  icon?: NavIconKey;
  /** Optional count badge — MUST be non-disclosure-safe (Invariant #11; IA §4.1/§4.3). */
  badge?: number;
  disabled?: boolean;
  /**
   * Opt-in active-highlight relaxation for a query-less href: when `true`, this item highlights on ANY
   * URL whose pathname matches `href` (or a sub-path), regardless of the current query string. Default
   * (unset) keeps the strict rule — a query-less href matches only when the URL also carries no query,
   * so a query-bearing sibling in the SAME group (e.g. documents-hub `?stage=` filters vs the query-less
   * "Dashboard" child) never double-highlights. Set it on a SURFACE-PARENT item that owns its own
   * query-param views (e.g. the merged `/sell/rfqs` with `?view=`/`?state=`) so the parent stays lit
   * across its variants while any query-bearing deep-link keeps exact-match (Cluster #1 · Team-1 F2).
   */
  activeAcrossQuery?: boolean;
  /**
   * Optional one-level grouping (IA — Buyer sidebar sub-groups, e.g. "RFQs" containing "My RFQs" /
   * "Draft Requests" / "Closed RFQs"). When present, the client nav components (`Sidebar`/`MobileNav`)
   * render this item as a non-interactive group header (icon + label, `href` unused for the header
   * itself — kept as a stable fallback, never rendered as a link) followed by the indented children.
   * A workspace that never sets `children` renders exactly as before (flat items) — additive, optional.
   */
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  /** Section heading (e.g. "Procurement" — IA §4.3). */
  label?: string;
  /**
   * Co-mount SURFACE this section belongs to ("Buying" / "Selling" / "Trust"). Consecutive sections
   * carrying the same tag render as ONE bracketed block under a strong surface header, so a Hybrid
   * org's co-mounted Buyer and Vendor surfaces read as distinct blocks rather than a run-on list of
   * equal-weight sections — Invariant #2 "grouped, not merged" ([ESC-7G-A7]).
   *
   * SET BY THE SEAM, never derived here: `hybrid-nav.ts` states the boundary — "Identity/seam
   * validates·selects·tags·orders; presentation concatenates·renders". This is a DISPLAY LABEL the
   * shell renders verbatim; it is NOT a `PlatformParticipation` value and the shell never interprets
   * it (no per-surface branching, no colour map).
   *
   * Single-surface navs (buyer-only / vendor-only / admin / account) leave this unset and render
   * exactly as before — additive and optional.
   */
  surface?: string;
  items: NavItem[];
}

/** A breadcrumb trail entry (IA §4.5). Non-disclosure-safe: render only what is given. */
export interface BreadcrumbItem {
  label: string;
  /** Omit on the current (last) item. */
  href?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  href?: string;
  read?: boolean;
  timeLabel?: string;
}

/** A `+ Create` action — each maps to a wired command (e.g. `create_rfq`) when wired (IA §4.9). */
export interface QuickCreateItem {
  label: string;
  icon?: NavIconKey;
  href?: string;
  disabled?: boolean;
}

/**
 * One entry in the co-mount PARTICIPATION LENS control ([ESC-7G-A7R], Board-RULED 2026-07-15) — a
 * ROLE workspace the user may foreground.
 *
 * THE LENS IS NOT A TOGGLE, AND MUST NEVER BECOME ONE (SD-1/SD-3/SD-5, binding):
 *  • Both surfaces stay MOUNTED under every lens — the composed `nav` never shrinks. The lens only
 *    changes which co-mounted block the sidebar FOREGROUNDS; the other is always one click away.
 *    Removing a surface from `nav` would be the re-routing toggle that Doc-7A R6 §4.2 forbids
 *    ("a surface is a capability, not an exclusive app") and that `[ESC-7G-A7]` rejected.
 *  • It is NEVER an authorization boundary. It gates no route and hides no permitted action; the
 *    server re-validates regardless (Doc-7A §4.3 R7). "The lens gates X" is a BLOCKER on sight.
 *  • It is DERIVED FROM THE ROUTE and stored nowhere (SD-2) — so it cannot go stale, cannot lie about
 *    where you are, and asserts no client-side context (Invariant #5). The control is a NAVIGATION
 *    affordance, not a mode switch.
 *
 * SEAM-SUPPLIED, like the `NavSection.surface` tags it pairs with: the shell owns no route→surface
 * mapping of its own and interprets no participation.
 *
 * ALSO the element type of `ShellViewModel.foldableSurfaces` — the same three fields (label tying it
 * to a `NavSection.surface` tag, href, route prefix) are what a block needs in order to FOLD, and a
 * role workspace both folds and appears in the control. Membership of the two lists is what differs,
 * never the shape: `surfaces` ⊆ `foldableSurfaces`. See that field for the ruling and the reasoning.
 */
export interface SurfaceSwitchItem {
  /** Display label — MUST equal the `NavSection.surface` tag of the sections it foregrounds. */
  label: string;
  /** Where the control navigates — that surface's overview route. */
  href: string;
  /** Route prefix identifying this surface (e.g. `/sell`). Supplied here so the shell never has to
   *  derive one by string-surgery on `href`. */
  prefix: string;
}

export interface ShellViewModel {
  identity: ShellIdentity;
  nav: NavSection[];
  /**
   * Co-mount lens control — the ROLE workspaces, in order, for a Hybrid org. Unset for
   * single-surface navs (buyer-only / vendor-only / admin / account) → no control renders and every
   * block stays foregrounded, exactly as before this existed.
   *
   * TERMINAL surfaces are deliberately ABSENT here: `Trust` carries a `NavSection.surface` tag but no
   * entry in this list, which is precisely what keeps it visible under EVERY lens (SD-6) — it is
   * never foregrounded, never folded into an editable group, and never hidden behind a lens.
   */
  surfaces?: SurfaceSwitchItem[];
  /**
   * Every co-mounted block that FOLDS by route — the set the sidebar foregrounds exactly one of,
   * collapsing the rest to their one-click surface header. A SUPERSET of `surfaces`.
   *
   * WHY THIS IS A SEPARATE LIST (owner-RULED 2026-07-15). The A7 packet expressly RESERVED this
   * question — A7.4, "which groups are surface-specific vs shared? … **Board to confirm the split**"
   * — and the seam recorded its answer as a placeholder ("this fixture picks a sensible split",
   * `hybrid-shell-vm.ts`). The owner has now confirmed the split: Account (Surface E) folds exactly
   * like Buying/Selling, but it does NOT join the participation lens control.
   *
   * That distinction is the whole reason this field exists, and it is load-bearing:
   *  • Doc-7C §4.3 (FROZEN) composes the navigable surface set from "the organization's platform
   *    participation + the user's org role". Account is NEITHER — every user has it under every
   *    participation (Doc-7A_Structure §Doc-7E). It folds like a surface; it is not a role.
   *  • Putting it in `surfaces` would render it as a third segment of a control whose semantics are
   *    "participation/role grouping" (`[ESC-7B-SEGMENTED]`) and whose ruled scope is the two role
   *    workspaces (A7R SD-5, "always renders both options").
   *  • It would also hand a buyer-only org a two-entry "Buying | Account" control — a lens with
   *    nothing to lens, which `SurfaceSwitcher` documents it must not render.
   *
   * Splitting the lists keeps every A7R directive literally intact:
   *  • SD-1/SD-5 — nothing leaves `nav`; a folded block keeps its header as a one-click link back in.
   *  • SD-2 — still derived from the route (`resolveActiveSurface`), stored nowhere.
   *  • SD-3 — still gates nothing; the server re-validates regardless (R7).
   *  • SD-6 — `Trust` is in NEITHER list, which is exactly what keeps it drawn in full under every
   *    fold, and it stays TERMINAL (last) in the composed order.
   *
   * Unset ⇒ falls back to `surfaces`, so a nav authored before this field renders unchanged.
   */
  foldableSurfaces?: SurfaceSwitchItem[];
  quickCreate?: QuickCreateItem[];
  notifications?: NotificationItem[];
  /** Non-disclosure-safe unread count (IA §4.2/§5.4). */
  unreadCount?: number;
  /** Breadcrumb trail for the current page (IA §4.5). */
  breadcrumb?: BreadcrumbItem[];
  /** Mobile quick-bar destinations — a thumb-reach SUBSET of `nav` (IA §7). */
  quickBar?: NavItem[];
  /**
   * Optional topbar search shortcut — a plain LINK to an existing search-capable surface (e.g. Buyer
   * Discover / `search_catalog`, Doc-4D §B), never a fabricated live-search box (GI-12: no widget implies
   * functionality the surface does not have). Omitted workspaces render no search affordance.
   */
  search?: { placeholder: string; href: string };
}

/** Up-to-2-char initials for the avatar fallback (presentation helper). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
