import {
  BarChart3,
  Bell,
  Boxes,
  Briefcase,
  Building2,
  CheckSquare,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  Files,
  FileText,
  FolderTree,
  Globe,
  Handshake,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Library,
  Lock,
  Megaphone,
  MessageSquare,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

// Nav icon registry — maps a SERIALIZABLE string key to a Lucide component.
//
// WHY KEYS, NOT COMPONENTS: nav data crosses the RSC server→client boundary (the server shell passes
// `nav` to the client Sidebar / MobileNav / QuickCreate). React cannot serialize a component across
// that boundary, so NavItem / QuickCreateItem carry an icon KEY (a plain string) and the CLIENT nav
// components resolve it here, in client scope. A workspace adds its icons by extending this map.
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  rfqs: ClipboardList,
  quotations: FileText,
  vendors: Users,
  orders: Package,
  microsite: Store,
  products: Boxes,
  leads: Inbox,
  advertising: Megaphone,
  settings: Settings,
  billing: CreditCard,
  team: UserPlus,
  // Buyer workspace (Doc-7F §4.1).
  discover: Search,
  favorites: Star,
  approvals: CheckSquare,
  engagements: Briefcase,
  crm: Users,
  // Cross-workspace Documents hub (FE-DOC, P-DOC-01/02 — page_inventory §8A/§12).
  documents: Files,
  // Vendor workspace (Doc-7G).
  company: Building2,
  catalog: Package,
  categories: FolderTree,
  specLibrary: Library,
  branding: Globe,
  pipeline: ClipboardList,
  deals: Handshake,
  trust: ShieldCheck,
  org: Users,
  // Account & Identity (Doc-7E).
  account: CircleUserRound,
  members: Users,
  roles: ShieldCheck,
  delegation: KeyRound,
  security: Lock,
  // Buyer sidebar IA (BX-04) — Communication + Analytics groups.
  notifications: Bell,
  messages: MessageSquare,
  reports: BarChart3,
} as const satisfies Record<string, LucideIcon>;

export type NavIconKey = keyof typeof NAV_ICONS;
