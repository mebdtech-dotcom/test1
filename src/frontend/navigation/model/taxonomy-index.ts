// FE-PUB-09 MEGA_MENU — normalized taxonomy index (MEGA_MENU_DATA_MODEL.md §2, ARCH §3/§7).
// Pure functions, no React, no fetch. Built ONCE per provider from the flat CategoryNodeData
// list + presentation overlay; nodes are stored once and shared by reference. Rendering is
// depth-recursive — `level` is display metadata, never a loop bound.

import type { CategoryNodeData, CategoryNodeVM, PresentationOverlay, TaxonomyIndex } from "./types";

/**
 * Build the VM forest + index. Overlay entries decorate matching slugs only — an overlay key
 * that matches no node is a dead entry (reported by `findDeadOverlayKeys`, warned at build
 * time); the overlay can never add, rename, or re-parent nodes (no name field exists at all).
 * `hidden` nodes (presentation veto) are excluded from the forest and the filter, but stay
 * resolvable by id/slug so deep links can still label themselves.
 */
export function buildTaxonomyIndex(
  nodes: CategoryNodeData[],
  overlay: PresentationOverlay = {},
): TaxonomyIndex {
  const byId = new Map<string, CategoryNodeVM>();
  const bySlug = new Map<string, CategoryNodeVM>();
  const roots: CategoryNodeVM[] = [];

  for (const node of nodes) {
    const vm: CategoryNodeVM = { ...node, ...overlay[node.slug], children: [] };
    byId.set(vm.id, vm);
    bySlug.set(vm.slug, vm);
  }

  for (const vm of byId.values()) {
    if (vm.parentId === null) {
      if (!vm.hidden) roots.push(vm);
      continue;
    }
    const parent = byId.get(vm.parentId);
    // Orphans (parent missing from an upstream slice) are dropped rather than fabricated a home.
    if (parent && !vm.hidden) parent.children.push(vm);
  }

  const sortSiblings = (list: CategoryNodeVM[]) => {
    list.sort((a, b) => {
      const ao = a.order ?? Number.POSITIVE_INFINITY;
      const bo = b.order ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      return a.name.localeCompare(b.name, "en");
    });
    list.forEach((n) => sortSiblings(n.children));
  };
  sortSiblings(roots);

  function pathTo(id: string): CategoryNodeVM[] {
    const path: CategoryNodeVM[] = [];
    let current = byId.get(id);
    while (current) {
      path.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return path;
  }

  function filter(query: string): CategoryNodeVM[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits: CategoryNodeVM[] = [];
    for (const vm of byId.values()) {
      if (vm.hidden) continue;
      if (
        vm.name.toLowerCase().includes(q) ||
        vm.slug.includes(q) ||
        vm.synonyms?.some((s) => s.toLowerCase().includes(q))
      ) {
        hits.push(vm);
      }
    }
    hits.sort((a, b) => {
      // Exact-ish (prefix) matches first, then shallow before deep, then alphabetical.
      const ap = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bp = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name, "en");
    });
    return hits;
  }

  return { roots, byId, bySlug, pathTo, filter };
}

/** Overlay lint (MEGA_MENU_DATA_MODEL.md §3): every overlay key must be an active slug. */
export function findDeadOverlayKeys(
  nodes: Pick<CategoryNodeData, "slug">[],
  overlay: PresentationOverlay,
): string[] {
  const slugs = new Set(nodes.map((n) => n.slug));
  return Object.keys(overlay).filter((key) => !slugs.has(key));
}
