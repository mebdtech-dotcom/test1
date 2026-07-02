"use client";

// FE-PUB-09 MEGA_MENU — TaxonomyProvider (MEGA_MENU_COMPONENT_SPEC.md §Providers).
// Holds the resolved, immutable taxonomy forest + normalized index for every consumer beneath
// it. NEVER fetches (kit rule BR4/BR10): the app layer resolves the data (static seed import in
// a server component today; the `list_categories` contract adapter later — [ESC-7-API-CATNAV])
// and passes the serializable flat list + overlay down ONCE; the index is built and memoized
// here exactly once per data identity.

import * as React from "react";
import { buildTaxonomyIndex } from "../model/taxonomy-index";
import type { CategoryNodeData, PresentationOverlay, TaxonomyIndex } from "../model/types";

const TaxonomyContext = React.createContext<TaxonomyIndex | null>(null);

export interface TaxonomyProviderProps {
  /** Flat frozen-entity mirror rows (active nodes only) — serializable across the RSC boundary. */
  nodes: CategoryNodeData[];
  overlay?: PresentationOverlay;
  children: React.ReactNode;
}

export function TaxonomyProvider({ nodes, overlay, children }: TaxonomyProviderProps) {
  const parent = React.useContext(TaxonomyContext);
  if (process.env.NODE_ENV !== "production" && parent) {
    // Nested providers forbidden (spec §Providers) — one instance per surface tree.
    console.warn("TaxonomyProvider: nested provider detected — one instance per surface tree.");
  }
  const index = React.useMemo(() => buildTaxonomyIndex(nodes, overlay), [nodes, overlay]);
  return <TaxonomyContext.Provider value={index}>{children}</TaxonomyContext.Provider>;
}

export function useTaxonomy(): TaxonomyIndex {
  const ctx = React.useContext(TaxonomyContext);
  if (!ctx) throw new Error("useTaxonomy must be used inside <TaxonomyProvider>");
  return ctx;
}

/** Non-throwing variant for slots that degrade when no taxonomy is mounted (empty-state contract). */
export function useTaxonomyOrNull(): TaxonomyIndex | null {
  return React.useContext(TaxonomyContext);
}
