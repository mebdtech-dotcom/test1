"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuQuickActions (Approval Addendum MINOR-03, trimmed).
// Panel footer action row: Post RFQ · Browse Vendors · Compare Vendors — links only to
// EXISTING surfaces ("Request Quote" was dropped: duplicate verb for Post RFQ; one RFQ CTA per
// surface). Defaults are the public-instance trio; apps may override the list.

import * as React from "react";
import Link from "next/link";
import { FilePlus2, GitCompareArrows, Store } from "lucide-react";
import { cn } from "../../lib/cn";
import { buttonVariants } from "../../primitives/button";
import { useMenuInstance } from "./menu-context";
import type { QuickAction } from "../model/types";

const DEFAULT_ACTIONS: QuickAction[] = [
  // Public anonymous surface: RFQ creation is authenticated — the CTA routes to sign-in.
  { label: "Post RFQ", href: "/login" },
  { label: "Browse Vendors", href: "/vendors" },
  { label: "Compare Vendors", href: "/compare" },
];

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Post RFQ": FilePlus2,
  "Browse Vendors": Store,
  "Compare Vendors": GitCompareArrows,
};

export interface MegaMenuQuickActionsProps {
  actions?: QuickAction[];
  className?: string;
  onActionClick?(action: QuickAction): void;
}

export function MegaMenuQuickActions({
  actions = DEFAULT_ACTIONS,
  className,
  onActionClick,
}: MegaMenuQuickActionsProps) {
  const { emit } = useMenuInstance();
  if (actions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 px-3 py-2", className)}>
      {actions.map((action, i) => {
        const Icon = ACTION_ICONS[action.label];
        return (
          <Link
            key={action.label}
            href={action.href}
            className={cn(buttonVariants({ variant: i === 0 ? "primary" : "outline", size: "sm" }))}
            onClick={() => {
              emit({ type: "quick_action_clicked", action: action.label });
              onActionClick?.(action);
            }}
          >
            {Icon ? <Icon aria-hidden className="size-3.5" /> : null}
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
