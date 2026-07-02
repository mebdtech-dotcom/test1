"use client";

// FE-PUB-09 MEGA_MENU — internal instance context: href resolution (Category Landing Contract
// default) + the optional analytics emitter (R3-NITPICK-02 typed envelope). No auto-
// instrumentation: if the app passes no `onEvent`, nothing fires (UX doc §7).

import * as React from "react";
import { categoryHref } from "../model/types";
import type { CategoryNodeVM, MenuAnalyticsEvent, MenuAnalyticsPayload } from "../model/types";

/** The event-specific half of the envelope — the instance context fills the shared payload. */
export type MenuAnalyticsEventInput =
  | { type: "menu_open" }
  | { type: "node_drill" }
  | { type: "node_navigate" }
  | { type: "menu_search_used"; query: string; resultCount: number }
  | { type: "menu_search_zero"; query: string }
  | { type: "quick_action_clicked"; action: string };

export interface MenuInstanceContextValue {
  source: MenuAnalyticsPayload["source"];
  hrefFor(node: CategoryNodeVM): string;
  /** Fire a typed analytics event with the shared envelope filled in. */
  emit(event: MenuAnalyticsEventInput, node?: CategoryNodeVM): void;
}

const MenuInstanceContext = React.createContext<MenuInstanceContextValue | null>(null);

function currentDevice(): MenuAnalyticsPayload["device"] {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
  return "desktop";
}

export interface MenuInstanceProviderProps {
  source: MenuAnalyticsPayload["source"];
  hrefFor?(node: CategoryNodeVM): string;
  onEvent?(event: MenuAnalyticsEvent): void;
  /** App-supplied auth state for the envelope; public anonymous instances default false. */
  authenticated?: boolean;
  pathFor?(node: CategoryNodeVM): CategoryNodeVM[];
  children: React.ReactNode;
}

export function MenuInstanceProvider({
  source,
  hrefFor = categoryHref,
  onEvent,
  authenticated = false,
  pathFor,
  children,
}: MenuInstanceProviderProps) {
  const value = React.useMemo<MenuInstanceContextValue>(
    () => ({
      source,
      hrefFor,
      emit(event, node) {
        if (!onEvent) return;
        const path = node && pathFor ? pathFor(node).map((n) => n.slug) : undefined;
        onEvent({
          ...event,
          source,
          device: currentDevice(),
          authenticated,
          nodeSlug: node?.slug,
          rootCategory: path?.[0],
          path,
        } as MenuAnalyticsEvent);
      },
    }),
    [source, hrefFor, onEvent, authenticated, pathFor],
  );
  return <MenuInstanceContext.Provider value={value}>{children}</MenuInstanceContext.Provider>;
}

export function useMenuInstance(): MenuInstanceContextValue {
  const ctx = React.useContext(MenuInstanceContext);
  if (!ctx)
    throw new Error("Mega-menu components must render inside <MegaMenu> / <MenuInstanceProvider>");
  return ctx;
}
