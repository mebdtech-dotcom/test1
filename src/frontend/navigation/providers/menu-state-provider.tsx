"use client";

// FE-PUB-09 MEGA_MENU — NavigationMenuStateProvider (MEGA_MENU_COMPONENT_SPEC.md §Providers).
// UI state for ONE menu instance: open state, active drill path, mobile drill stack, search
// query. No taxonomy data lives here; no selection state either (pickers own selection via
// props — caps/validation stay app-side). Controlled-prop escape hatches let embedding apps
// drive the menu (`open`/`onOpenChange`, `activePath`/`onActivePathChange`).

import * as React from "react";

export interface MenuState {
  open: boolean;
  setOpen(open: boolean): void;
  close(): void;
  /** Active drill path (node ids, root-first). Drives desktop columns AND the mobile stack. */
  activePath: string[];
  /** Set the active node at a drill level, truncating deeper levels. */
  setActiveAt(level: number, id: string): void;
  /** Mobile drill-in: push a node onto the stack. */
  drillIn(id: string): void;
  /** Mobile back: pop the stack. */
  drillBack(): void;
  resetPath(): void;
  query: string;
  setQuery(query: string): void;
  /** Hover-intent delays (ms) — token-tunable via props, not constants in components. */
  hoverIntentDelay: { in: number; out: number };
}

const MenuStateContext = React.createContext<MenuState | null>(null);

export interface NavigationMenuStateProviderProps {
  open?: boolean;
  onOpenChange?(open: boolean): void;
  activePath?: string[];
  onActivePathChange?(path: string[]): void;
  /** Default 80ms in / 250ms out (UX doc §1). */
  hoverIntentDelay?: { in: number; out: number };
  children: React.ReactNode;
}

export function NavigationMenuStateProvider({
  open: openProp,
  onOpenChange,
  activePath: activePathProp,
  onActivePathChange,
  hoverIntentDelay = { in: 80, out: 250 },
  children,
}: NavigationMenuStateProviderProps) {
  const [openState, setOpenState] = React.useState(false);
  const [pathState, setPathState] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");

  const open = openProp ?? openState;
  const activePath = activePathProp ?? pathState;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpenState(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const setPath = React.useCallback(
    (next: string[]) => {
      if (activePathProp === undefined) setPathState(next);
      onActivePathChange?.(next);
    },
    [activePathProp, onActivePathChange],
  );

  const value = React.useMemo<MenuState>(
    () => ({
      open,
      setOpen,
      close: () => {
        setOpen(false);
        setQuery("");
      },
      activePath,
      setActiveAt: (level, id) => setPath([...activePath.slice(0, level), id]),
      drillIn: (id) => setPath([...activePath, id]),
      drillBack: () => setPath(activePath.slice(0, -1)),
      resetPath: () => setPath([]),
      query,
      setQuery,
      hoverIntentDelay,
    }),
    [open, setOpen, activePath, setPath, query, hoverIntentDelay],
  );

  return <MenuStateContext.Provider value={value}>{children}</MenuStateContext.Provider>;
}

export function useMenuState(): MenuState {
  const ctx = React.useContext(MenuStateContext);
  if (!ctx) throw new Error("useMenuState must be used inside <NavigationMenuStateProvider>");
  return ctx;
}
