import {
  Bell,
  BookMarked,
  ClipboardList,
  FileEdit,
  FilePlus2,
  FileText,
  Gift,
  GitCompareArrows,
  Heart,
  History,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  Settings,
  User,
  Users,
} from "lucide-react";

/**
 * Structural navigation for the buyer shell.
 *
 * Labels + icons + routes + an optional static feature `tag` (e.g. "New")
 * only. No counts, statuses, or domain values live here — dynamic per-section
 * badges arrive separately via `navBadges` (keyed by `id`) from the adapter,
 * and the caller decides which slot is `active`.
 */
type NavIcon = React.ComponentType<{ className?: string }>;

/** A single navigable link slot. */
export interface BuyerNavLink {
  kind: "link";
  id: string;
  label: string;
  href: string;
  icon: NavIcon;
  /** Optional static feature marker (e.g. "New"). Structural, not domain data. */
  tag?: string;
}

/** A child link nested inside a collapsible group. */
export interface BuyerNavChild {
  id: string;
  label: string;
  href: string;
  icon: NavIcon;
  tag?: string;
}

/** A collapsible group containing nested child links. */
export interface BuyerNavGroup {
  kind: "group";
  id: string;
  label: string;
  icon: NavIcon;
  children: BuyerNavChild[];
}

export type BuyerNavEntry = BuyerNavLink | BuyerNavGroup;

export const BUYER_NAV: BuyerNavEntry[] = [
  { kind: "link", id: "dashboard", label: "Dashboard", href: "/buyer", icon: LayoutDashboard },
  { kind: "link", id: "post-rfq", label: "Post RFQ", href: "#", icon: FilePlus2 },
  { kind: "link", id: "my-rfqs", label: "My RFQs", href: "#", icon: FileText },
  {
    kind: "link",
    id: "draft-request",
    label: "Draft Request",
    href: "/buyer/draft-request",
    icon: FileEdit,
    tag: "New",
  },
  { kind: "link", id: "quotations", label: "Quotations", href: "#", icon: ClipboardList },
  {
    kind: "link",
    id: "compare-quotes",
    label: "Compare Quotes",
    href: "#",
    icon: GitCompareArrows,
  },
  {
    kind: "group",
    id: "purchase-orders",
    label: "Purchase Orders",
    icon: Package,
    children: [
      {
        id: "po-active",
        label: "Active Orders",
        href: "/buyer/purchase-orders/active",
        icon: ListChecks,
      },
      {
        id: "po-history",
        label: "Order History",
        href: "/buyer/purchase-orders/history",
        icon: History,
      },
    ],
  },
  {
    kind: "link",
    id: "spec-library",
    label: "Spec Library",
    href: "/buyer/spec-library",
    icon: BookMarked,
    tag: "New",
  },
  { kind: "link", id: "suppliers", label: "Suppliers", href: "#", icon: Users },
  {
    kind: "link",
    id: "saved-suppliers",
    label: "Saved Suppliers",
    href: "/buyer/saved-suppliers",
    icon: Heart,
    tag: "New",
  },
  { kind: "link", id: "messages", label: "Messages", href: "#", icon: MessageSquare },
  { kind: "link", id: "notifications", label: "Notifications", href: "#", icon: Bell },
  {
    kind: "link",
    id: "referral-rewards",
    label: "Referral Rewards",
    href: "/buyer/referral-rewards",
    icon: Gift,
    tag: "New",
  },
  { kind: "link", id: "profile", label: "Profile", href: "#", icon: User },
  { kind: "link", id: "settings", label: "Settings", href: "#", icon: Settings },
];
