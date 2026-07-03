import {
  BarChart3,
  Bell,
  Building2,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Store,
  User,
} from "lucide-react";

/**
 * Structural navigation for the vendor shell.
 *
 * Labels + icons + routes + an optional static feature `tag` (e.g. "New")
 * only. No counts, statuses, or domain values live here — dynamic per-section
 * badges arrive separately via `navBadges` (keyed by `id`) from the adapter,
 * and the caller decides which slot is `active`.
 *
 * Mirrors the buyer nav model exactly (links + collapsible groups).
 */
type NavIcon = React.ComponentType<{ className?: string }>;

/** A single navigable link slot. */
export interface VendorNavLink {
  kind: "link";
  id: string;
  label: string;
  href: string;
  icon: NavIcon;
  /** Optional static feature marker (e.g. "New"). Structural, not domain data. */
  tag?: string;
}

/** A child link nested inside a collapsible group. */
export interface VendorNavChild {
  id: string;
  label: string;
  href: string;
  icon: NavIcon;
  tag?: string;
}

/** A collapsible group containing nested child links. */
export interface VendorNavGroup {
  kind: "group";
  id: string;
  label: string;
  icon: NavIcon;
  children: VendorNavChild[];
}

export type VendorNavEntry = VendorNavLink | VendorNavGroup;

export const VENDOR_NAV: VendorNavEntry[] = [
  {
    kind: "link",
    id: "dashboard",
    label: "Dashboard",
    href: "/vendor",
    icon: LayoutDashboard,
  },
  {
    kind: "group",
    id: "showcase",
    label: "Digital Showcase",
    icon: Store,
    children: [
      {
        id: "company-profile",
        label: "Company Profile",
        href: "#",
        icon: Building2,
      },
      {
        id: "product-portfolio",
        label: "Product Portfolio",
        href: "#",
        icon: Package,
      },
      {
        id: "project-portfolio",
        label: "Project Portfolio",
        href: "#",
        icon: FolderKanban,
      },
    ],
  },
  { kind: "link", id: "rfq-leads", label: "RFQ Leads", href: "#", icon: Inbox },
  {
    kind: "link",
    id: "buyer-inquiries",
    label: "Buyer Inquiries",
    href: "#",
    icon: MessageSquare,
  },
  {
    kind: "link",
    id: "profile-performance",
    label: "Profile Performance",
    href: "#",
    icon: BarChart3,
  },
  {
    kind: "link",
    id: "public-page",
    label: "Public Page",
    href: "#",
    icon: Globe,
  },
  {
    kind: "link",
    id: "notifications",
    label: "Notifications",
    href: "#",
    icon: Bell,
  },
  { kind: "link", id: "profile", label: "Profile", href: "#", icon: User },
  { kind: "link", id: "settings", label: "Settings", href: "#", icon: Settings },
];
