// P-PUB Explorer SEO nav (FE-PUB-09 Phase 1 — ARCH §7 SEO). SERVER-rendered, crawlable L1/L2
// category links in real `<a href>` markup inside a labelled <nav>; visually hidden (the
// interactive Explorer is the visible surface — this progressive-enhancement baseline costs the
// client bundle NOTHING because it ships zero JS). Slugs come from the taxonomy seed verbatim;
// hrefs follow the Category Landing Contract (ARCH §9.1).

import taxonomySeed from "@/frontend/navigation/model/taxonomy.v1.json";
import { buildTaxonomyIndex, categoryHref, OVERLAY_V1 } from "@/frontend/navigation";
import type { CategoryNodeData } from "@/frontend/navigation";

const index = buildTaxonomyIndex(taxonomySeed.nodes as CategoryNodeData[], OVERLAY_V1);

export function ExplorerSeoNav() {
  return (
    <nav aria-label="Categories" className="sr-only">
      <ul>
        {index.roots.map((root) => (
          <li key={root.id}>
            <a href={categoryHref(root)}>{root.name}</a>
            {root.children.length > 0 ? (
              <ul>
                {root.children.map((child) => (
                  <li key={child.id}>
                    <a href={categoryHref(child)}>{child.name}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
