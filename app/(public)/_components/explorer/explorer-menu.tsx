"use client";

// P-PUB header Industrial Category Explorer — the HEAVY chunk (FE-PUB-09 Phase 1).
// Loaded lazily by `explorer.tsx`'s preload ladder (ARCH §9.5): the taxonomy seed JSON, the
// overlay, and the mega-menu panel code all live in THIS chunk, so the header pays nothing
// until first hover intent. Data: build-time seed generated from Taxonomy Content v1.0
// Appendix C (interim under [ESC-7-API-CATNAV]) + curated discovery-seed slot data — the kit
// receives everything by props and fetches nothing.

import * as React from "react";
import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import {
  MegaMenu,
  OVERLAY_V1,
  INDUSTRY_SHORTCUTS_V1,
  TaxonomyProvider,
} from "@/frontend/navigation";
import type { CategoryNodeData, MenuVendorVM } from "@/frontend/navigation";
import { FEATURED_VENDORS, POPULAR_SEARCHES } from "../discovery/seed";

const NODES = taxonomySeed.nodes as CategoryNodeData[];

// Interim vendor rows for the panel rail (MAJOR-02): the SAME curated seed identities the
// discovery surfaces use — never fabricated; replaced by contract data with the projection.
// Capability = the frozen 4-flag matrix ONLY (Invariant #1).
const MENU_VENDORS: MenuVendorVM[] = FEATURED_VENDORS.map((v) => ({
  slug: v.slug,
  name: v.name,
  verified: v.verified,
  capability: v.capability,
}));

export interface ExplorerMenuProps {
  defaultOpen?: boolean;
}

export default function ExplorerMenu({ defaultOpen }: ExplorerMenuProps) {
  return (
    <TaxonomyProvider nodes={NODES} overlay={OVERLAY_V1}>
      <MegaMenu
        source="header"
        defaultOpen={defaultOpen}
        popularSearches={[...POPULAR_SEARCHES]}
        industryShortcuts={INDUSTRY_SHORTCUTS_V1}
        vendors={MENU_VENDORS}
      />
    </TaxonomyProvider>
  );
}
