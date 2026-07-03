import { Package, User } from "lucide-react";

import type { SessionUser } from "../contracts";
import { NavList } from "./nav-list";

export interface SidebarProps {
  /** Current user; `null` renders a generic placeholder. */
  user: SessionUser | null;
  /** Id of the active nav slot (decided by the caller). */
  activeId?: string;
  /** Optional per-nav badge labels, keyed by nav id. */
  badges?: Record<string, string>;
}

/**
 * Desktop brand sidebar. Hidden below `lg`; the mobile drawer (see
 * `MobileNav`, mounted in the topbar) renders the same nav. Pure presentation —
 * all content arrives via props.
 */
export function Sidebar({ user, activeId, badges }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex size-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground">
          <Package className="size-5" />
        </div>
        <span className="text-base font-semibold text-sidebar-foreground">iVendorz</span>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
        <NavList activeId={activeId} badges={badges} />
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-[var(--radius)] px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
            {user ? (
              user.initials
            ) : (
              <User className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user ? user.name : "Not signed in"}
            </p>
            {user ? <p className="truncate text-xs text-foreground/70">{user.role}</p> : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
