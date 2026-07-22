// Real backend wiring for the public Vendor Directory (`app/(public)/vendors/page.tsx`) and the
// Search "Vendors" tab (`app/(public)/search/page.tsx`) — the SECOND M2 Wave-3 vertical slice
// (`marketplace.list_vendor_directory.v1`, Doc-5D_VendorDirectoryProjection_Patch_v1.0.3). Replaces
// the static `VENDORS` seed (`./seed.ts`) for these two surfaces only; `seed.ts` itself is UNTOUCHED —
// it still backs `getPublicVendorProfile`/products/showcase reads, out of this slice's scope.
//
// `slug` mapping: `VendorDirectoryListItem.slug` (contracts) → `VendorCardVM.slug` directly — see
// `contracts/types.ts`'s flagged deviation note on `VendorDirectoryListItem` for why the list
// projection carries `slug` at all. `verified` (Trust binary signal, DD-1) is DEFERRED — not realized
// by this slice (M5 doesn't exist yet), same posture as `app/(public)/vendors/[slug]/get-vendor.ts`'s
// `toVendorProfileVM`; absence renders as absence (GI-03), never a fabricated "pending" state.
import { listPublicVendorDirectory } from "@/server/marketplace";
import type {
  ListVendorDirectoryRequest,
  VendorDirectoryListItem,
} from "@/modules/marketplace/contracts";
import type { VendorCardVM } from "@/frontend/components/vendor-card";

export interface VendorDirectoryPage {
  items: VendorCardVM[];
  hasMore: boolean;
  nextCursor?: string;
}

function toVendorCardVM(item: VendorDirectoryListItem): VendorCardVM {
  const categoryNames = item.categories.map((c) => c.name);
  const location = [item.geography.division, item.geography.district, item.geography.industrialZone]
    .filter((part): part is string => part !== null && part.length > 0)
    .join(" · ");

  return {
    slug: item.slug,
    name: item.name,
    category: categoryNames[0] ?? "",
    location: location.length > 0 ? location : undefined,
    capability: {
      can_supply: item.capabilityFlags.canSupply,
      can_service: item.capabilityFlags.canService,
      can_fabricate: item.capabilityFlags.canFabricate,
      can_consult: item.capabilityFlags.canConsult,
    },
  };
}

/**
 * Fetch one page of the public vendor directory, mapped to the shared kit `VendorCard` VM
 * (Doc-5D §3 order: `name` asc). A malformed/stale `cursor` (e.g. a tampered URL param) degrades to
 * the FIRST page — never surfaced as a raw validation error to an anonymous visitor.
 */
export async function getVendorDirectoryPage(cursor?: string): Promise<VendorDirectoryPage> {
  const request: ListVendorDirectoryRequest = cursor !== undefined ? { cursor } : {};
  const outcome = await listPublicVendorDirectory(request);

  if ("invalidInput" in outcome) {
    const fallback = await listPublicVendorDirectory({});
    if ("invalidInput" in fallback) {
      return { items: [], hasMore: false };
    }
    return {
      items: fallback.items.map(toVendorCardVM),
      hasMore: fallback.pageInfo.hasMore,
      ...(fallback.pageInfo.nextCursor !== undefined
        ? { nextCursor: fallback.pageInfo.nextCursor }
        : {}),
    };
  }

  return {
    items: outcome.items.map(toVendorCardVM),
    hasMore: outcome.pageInfo.hasMore,
    ...(outcome.pageInfo.nextCursor !== undefined
      ? { nextCursor: outcome.pageInfo.nextCursor }
      : {}),
  };
}
