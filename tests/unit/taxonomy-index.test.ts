// FE-PUB-09 MEGA_MENU Phase 0 exit tests (MEGA_MENU_IMPLEMENTATION_PLAN.md):
// index unit tests + seed validation (794 ratified nodes) + overlay lint. Pure — no DOM, no DB.

import { describe, expect, it } from "vitest";
import seed from "@/frontend/navigation/model/taxonomy.v1.json";
import {
  buildTaxonomyIndex,
  findDeadOverlayKeys,
} from "@/frontend/navigation/model/taxonomy-index";
import { OVERLAY_V1 } from "@/frontend/navigation/model/overlay.v1";
import { categoryHref } from "@/frontend/navigation/model/types";
import type { CategoryNodeData } from "@/frontend/navigation/model/types";

const NODES = seed.nodes as CategoryNodeData[];

describe("taxonomy.v1.json seed (Taxonomy Content v1.0, P1-approved)", () => {
  it("carries exactly the ratified 794 nodes (13 L1 · 87 L2 · 354 L3 · 340 L4)", () => {
    expect(NODES).toHaveLength(794);
    const byLevel = NODES.reduce<Record<number, number>>((acc, n) => {
      acc[n.level] = (acc[n.level] ?? 0) + 1;
      return acc;
    }, {});
    expect(byLevel).toEqual({ 1: 13, 2: 87, 3: 354, 4: 340 });
  });

  it("has unique slugs and ids, and every non-root parentId resolves", () => {
    const ids = new Set(NODES.map((n) => n.id));
    const slugs = new Set(NODES.map((n) => n.slug));
    expect(ids.size).toBe(NODES.length);
    expect(slugs.size).toBe(NODES.length);
    for (const n of NODES) {
      if (n.level === 1) expect(n.parentId).toBeNull();
      else expect(n.parentId && ids.has(n.parentId)).toBe(true);
    }
  });
});

describe("buildTaxonomyIndex", () => {
  const index = buildTaxonomyIndex(NODES, OVERLAY_V1);

  it("builds the 13-root forest with children attached", () => {
    expect(index.roots).toHaveLength(13);
    const raw = index.bySlug.get("raw-materials");
    expect(raw?.children.length).toBeGreaterThan(0);
    expect(raw?.children.every((c) => c.level === 2)).toBe(true);
  });

  it("pathTo returns ancestors root-first ending at the node", () => {
    const leaf = index.bySlug.get("centrifugal-pumps");
    expect(leaf).toBeDefined();
    const path = index.pathTo(leaf!.id);
    expect(path[0]!.level).toBe(1);
    expect(path[path.length - 1]!.slug).toBe("centrifugal-pumps");
    expect(path.map((n) => n.level)).toEqual([1, 2, 3, 4]);
  });

  it("filter matches names, slugs, and overlay synonyms (genset / GI pipe / PFI)", () => {
    expect(index.filter("genset").some((n) => n.slug === "diesel-generators")).toBe(true);
    expect(index.filter("GI pipe").some((n) => n.slug === "ms-gi-pipes")).toBe(true);
    expect(index.filter("pfi").some((n) => n.slug === "fire-protection-epc")).toBe(true);
    expect(index.filter("")).toHaveLength(0);
  });

  it("hidden nodes are vetoed from forest and filter but stay resolvable (deep links)", () => {
    const hiddenIndex = buildTaxonomyIndex(NODES, { "centrifugal-pumps": { hidden: true } });
    expect(
      hiddenIndex.filter("centrifugal pumps").some((n) => n.slug === "centrifugal-pumps"),
    ).toBe(false);
    const parent = hiddenIndex.bySlug.get("industrial-pumps");
    if (parent) expect(parent.children.some((c) => c.slug === "centrifugal-pumps")).toBe(false);
    expect(hiddenIndex.bySlug.get("centrifugal-pumps")).toBeDefined();
  });

  it("siblings sort by overlay order first, then name", () => {
    const ordered = buildTaxonomyIndex(NODES, { "mro-consumables": { order: 0 } });
    expect(ordered.roots[0]!.slug).toBe("mro-consumables");
  });
});

describe("overlay v1 lint (MEGA_MENU_DATA_MODEL §3)", () => {
  it("every overlay key is an active slug — zero dead entries", () => {
    expect(findDeadOverlayKeys(NODES, OVERLAY_V1)).toEqual([]);
  });

  it("all 13 roots carry a launch glyph key", () => {
    for (const root of NODES.filter((n) => n.level === 1)) {
      expect(OVERLAY_V1[root.slug]?.icon, `root ${root.slug} missing icon`).toBeDefined();
    }
  });
});

describe("Category Landing Contract (ARCH §9.1)", () => {
  it("default href targets the existing FE-PUB-04 landing route", () => {
    expect(categoryHref({ slug: "centrifugal-pumps" })).toBe(
      "/marketplace/category/centrifugal-pumps",
    );
  });
});
