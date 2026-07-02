"use client";

// FE-PUB-09 MEGA_MENU — MegaMenuSearch (SPEC §Mega-menu tier · UX doc §5 · Phase 3).
// Quick TAXONOMY-NODE filter — jumps to visible nodes. NOT product search: filters the
// already-loaded tree only (name, slug, overlay synonyms; pure, debounced ~120ms); no network,
// no `search_catalog` — the zero-result path HANDS OFF to the real search surface instead.
// Results: flat list (max 12), full ancestor trail per hit (the disambiguator), matched
// substring wrapped in an accessible token-styled <mark> (R2-NITPICK-03). `/` focuses this
// input (SPEC addendum keyboard table) via [data-mega-menu-search].

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "../../lib/cn";
import { Input } from "../../primitives/input";
import { useTaxonomy } from "../providers/taxonomy-provider";
import { useMenuState } from "../providers/menu-state-provider";
import { useMenuInstance } from "./menu-context";
import type { CategoryNodeVM } from "../model/types";

const DEBOUNCE_MS = 120;

/** Wrap the first case-insensitive occurrence of `query` in an accessible <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1 || !query) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-iv-amber-50 px-0.5 text-iv-amber-700">
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}

export interface MegaMenuSearchProps {
  placeholder?: string;
  maxResults?: number;
  /** The real product-search surface the zero-result state hands off to. */
  searchHref?: string;
  className?: string;
  onResultSelect?(node: CategoryNodeVM): void;
}

export function MegaMenuSearch({
  placeholder = "Find a category… (genset, GI pipe, VFD)",
  maxResults = 12,
  searchHref = "/search",
  className,
  onResultSelect,
}: MegaMenuSearchProps) {
  const taxonomy = useTaxonomy();
  const { query, setQuery, openPath } = useMenuState();
  const { hrefFor, emit } = useMenuInstance();
  const [debounced, setDebounced] = React.useState(query);
  const listRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reportedZero = React.useRef<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const results = React.useMemo(
    () => (debounced.trim() ? taxonomy.filter(debounced).slice(0, maxResults) : []),
    [taxonomy, debounced, maxResults],
  );

  // Analytics: fire once per settled query (menu_search_used; zero-result feeds the synonym
  // dictionary growth loop — taxonomy governance §9).
  React.useEffect(() => {
    const q = debounced.trim();
    if (!q || reportedZero.current === q) return;
    reportedZero.current = q;
    if (results.length === 0) emit({ type: "menu_search_zero", query: q });
    else emit({ type: "menu_search_used", query: q, resultCount: results.length });
  }, [debounced, results, emit]);

  const listboxId = React.useId();

  return (
    <div role="search" className={cn("border-b border-border p-2", className)}>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          data-mega-menu-search
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listboxId}
          aria-label="Find a category"
          placeholder={placeholder}
          value={query}
          className="pl-8"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // First ESC clears the query (UX §4); an empty query lets ESC bubble to close.
            if (e.key === "Escape" && query) {
              e.stopPropagation();
              setQuery("");
              return;
            }
            if (e.key === "ArrowDown" && results.length > 0) {
              e.preventDefault();
              listRef.current?.querySelector<HTMLElement>("a")?.focus();
            }
          }}
        />
      </div>
      <p aria-live="polite" className="sr-only">
        {debounced.trim() ? `${results.length} categories` : ""}
      </p>

      {debounced.trim() ? (
        results.length > 0 ? (
          <ul id={listboxId} ref={listRef} className="mt-1 max-h-72 overflow-y-auto">
            {results.map((node) => {
              const trail = taxonomy.pathTo(node.id);
              return (
                <li key={node.id}>
                  <Link
                    href={hrefFor(node)}
                    className="flex min-h-[44px] flex-col justify-center gap-0.5 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    onClick={() => {
                      emit({ type: "node_navigate" }, node);
                      onResultSelect?.(node);
                    }}
                    onKeyDown={(e) => {
                      // → reveals the node in the columns instead of navigating (UX §5.3).
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        openPath(trail.map((n) => n.id));
                        setQuery("");
                        inputRef.current?.focus();
                      }
                    }}
                  >
                    <span className="font-medium">
                      <Highlight text={node.name} query={debounced.trim()} />
                    </span>
                    {trail.length > 1 ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {trail
                          .slice(0, -1)
                          .map((n) => n.name)
                          .join(" › ")}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-2.5 py-3 text-sm text-muted-foreground">
            No matching category.{" "}
            <Link
              href={`${searchHref}?q=${encodeURIComponent(debounced.trim())}`}
              className="font-medium text-iv-ink-heading hover:underline"
              onClick={() =>
                emit({ type: "quick_action_clicked", action: "search_products_handoff" })
              }
            >
              Search products instead →
            </Link>
          </div>
        )
      ) : null}
    </div>
  );
}
