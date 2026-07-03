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
  /** Section heading (e.g. "Procurement" / "Selling" for Hybrid orgs — IA §4.3). */
  label?: string;
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

export interface ShellViewModel {
  identity: ShellIdentity;
  nav: NavSection[];
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
