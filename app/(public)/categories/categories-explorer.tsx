"use client";

// P-PUB-07 /categories inline Explorer (FE-PUB-09 Phase 1 — UX doc §8 "/categories page":
// same components, INLINE, no popover; persistent columns on desktop). The server-rendered
// sections below it are the no-JS/SEO fallback; this surface is the fast drill for mouse/
// keyboard users. Data: same build-time taxonomy seed + overlay as the header instance.

import * as React from "react";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import {
  MegaMenuColumns,
  MegaMenuSearch,
  MegaMenuTrail,
  MenuInstanceProvider,
  NavigationMenuStateProvider,
  OVERLAY_V1,
  TaxonomyProvider,
} from "@/frontend/navigation";
import type { CategoryNodeData } from "@/frontend/navigation";

const NODES = taxonomySeed.nodes as CategoryNodeData[];

export function CategoriesExplorer() {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-card lg:block">
      <TaxonomyProvider nodes={NODES} overlay={OVERLAY_V1}>
        <MenuInstanceProvider source="categories-page">
          <NavigationMenuStateProvider>
            <MegaMenuSearch />
            <MegaMenuColumns />
            <MegaMenuTrail className="border-t border-border" />
          </NavigationMenuStateProvider>
        </MenuInstanceProvider>
      </TaxonomyProvider>
    </div>
  );
}
