"use client";

// Page-local centerpiece — the Industrial Procurement Command Center
// (landing_page_spec.md §2 · SEC-COMMAND-CENTER). Realizes the Doc-7D Public surface.
//
// GOVERNANCE (Doc-7D PR1/PR3/PR5 · spec §2.10) — this is PRESENTATION ONLY, ANONYMOUS, READ-ONLY:
//   • Binds NO Doc-5 contract and fetches nothing. Live marketplace search wires to M2
//     `search_catalog` / `list_vendor_directory` (BC-MKT-6 §8) in a later wave; here the input is a
//     presentation shell and the popular terms are a CURATED STATIC SEED (spec §2.3(f) — allowed,
//     never presented as a computed "trending" signal; SC GI-03/GI-04/GI-12).
//   • Performs NO mutation. Authenticated intents (Create RFQ / Find Suppliers) route to `(auth)`
//     (Doc-7D PR5; Doc-7E owns the auth action). Browsing categories stays anonymous.
//   • AI entry is a DISABLED "Coming Soon" affordance only — opens no panel (Invariant #12; ER ESC-7-AI).
//   • Fabricates NO suggestion rows, counts, or results (never re-ranks M3).
//
// REUSE: composes the frozen Doc-7B kit (Input · Button · Badge) — adds no kit primitive. The §2
// persistent "popular" row and the §2.4 suggest popover are consolidated here into one popular
// quick-pick row + an honest interim hint (no live suggest is wired yet). Extractable Unit — stays
// page-local per spec §1.5 / §2.
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  ClipboardList,
  Factory,
  Sparkles,
  ShieldCheck,
  Boxes,
  Clock,
  ArrowRight,
  Command,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Badge } from "@/frontend/primitives/badge";
import { Input } from "@/frontend/primitives/input";
import { cn } from "@/frontend/lib/cn";

// FE-PUB-01 delta: the previous 5 terms ("ball valves"/"VFD drives"/"gear pumps"/"industrial PPE" —
// only "MS plate" excepted) didn't substring-match any product in `discovery/seed.ts`, so clicking
// a chip and submitting landed on a dead-end "No results" — found during FE-PUB-07's audit (RV-0119),
// carried forward here since the seed is this page's own domain.
// FE-PUB-09 delta: the RV-0121-verified term list moved to `discovery/seed.ts` `POPULAR_SEARCHES`
// as the single shared source — the mega menu's Popular Searches strip consumes the same terms,
// so the two surfaces can never diverge. Terms unchanged, content byte-identical.
import { POPULAR_SEARCHES as DEFAULT_POPULAR_SEARCHES } from "../discovery/seed";

const AUTH_HREF = "/login"; // `(auth)` entry — Doc-7E owns the auth action (Doc-7D PR5).
const PUBLIC_BROWSE_HREF = "/categories"; // Explore Categories → P-PUB-11 category browse (M2.2).

interface CommandEntry {
  key: string;
  label: string;
  icon: LucideIcon;
  /** `nav` = anonymous public browse; `auth` = routes to `(auth)` (no anonymous mutation). */
  kind: "nav" | "auth";
  href: string;
}

const ENTRIES: CommandEntry[] = [
  {
    key: "explore",
    label: "Explore Categories",
    icon: LayoutGrid,
    kind: "nav",
    href: PUBLIC_BROWSE_HREF,
  },
  { key: "rfq", label: "Create RFQ", icon: ClipboardList, kind: "auth", href: AUTH_HREF },
  { key: "suppliers", label: "Find Suppliers", icon: Factory, kind: "auth", href: AUTH_HREF },
];

export interface CommandCenterProps {
  /** Curated static seed (spec §2.3(f)); injectable so a later wave can pass facet-backed terms. */
  popularSearches?: readonly string[];
}

export function CommandCenter({ popularSearches = DEFAULT_POPULAR_SEARCHES }: CommandCenterProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hintId = "cc-search-hint";
  const showHint = query.trim().length > 0;

  // ⌘K / Ctrl-K focuses the search input — the public mirror of the Universal Command Center (spec §2.6).
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      // Clear the query (hides the interim hint) but KEEP focus on the input (spec §2.6).
      setQuery("");
    }
  }

  function onSubmit(e: React.FormEvent) {
    // Marketplace search → the Search Experience (M2.3). URL-synced navigation only; fetches nothing here
    // (the /search page renders the interim seed-filtered results; the wired `search_catalog` lands later).
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  function fill(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  return (
    <div
      role="search"
      aria-label="Industrial Procurement Command Center"
      className={cn(
        "relative mx-auto w-full max-w-[var(--iv-container-md)] lg:max-w-[var(--iv-container-lg)]",
        "rounded-lg border border-border bg-popover p-4 shadow-iv-lg sm:rounded-xl sm:p-6 sm:shadow-iv-xl",
      )}
    >
      {/* Header row — title + ⌘K hint */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-2xs font-semibold uppercase tracking-wide text-iv-ink-heading">
          Industrial Procurement Command Center
        </p>
        <span
          aria-hidden="true"
          className="hidden items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 text-2xs text-muted-foreground sm:inline-flex"
        >
          <Command className="size-3" />K
        </span>
      </div>

      {/* Search input row — reuses the kit Input primitive (no duplication) */}
      <form onSubmit={onSubmit}>
        <label htmlFor="cc-search" className="sr-only">
          Search products, suppliers, and categories
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 z-[var(--iv-z-raised)] size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="cc-search"
              ref={inputRef}
              type="search"
              autoComplete="off"
              placeholder="Search products, suppliers, categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              aria-describedby={showHint ? hintId : undefined}
              className="h-11 pl-9 pr-3 text-base"
            />
            {showHint && (
              <div
                id={hintId}
                role="note"
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[var(--iv-z-dropdown)] rounded-md border border-border bg-popover p-3 text-sm text-muted-foreground shadow-iv-md animate-iv-scale-in motion-reduce:animate-none"
              >
                Marketplace search connects when the catalog is available — no results are shown
                yet.
              </div>
            )}
          </div>
          <Button type="submit" size="lg" aria-label="Search">
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </form>

      {/* Entry rail — anonymous browse + auth-routed intents + disabled AI affordance */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Procurement shortcuts">
        {ENTRIES.map((entry) => {
          const Icon = entry.icon;
          return (
            <Button
              key={entry.key}
              asChild
              variant={entry.kind === "auth" ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Link href={entry.href}>
                <Icon aria-hidden="true" /> {entry.label}
              </Link>
            </Button>
          );
        })}
        {/* AI affordance — spec §2.8/§2.10: aria-disabled (NOT native `disabled`) so it stays in the
            tab order; accessible name conveys future availability; inert (exposes no action). */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-disabled="true"
          aria-label="AI Assistant — coming soon"
          onClick={(e) => e.preventDefault()}
          className="gap-2 cursor-not-allowed opacity-60"
        >
          <Sparkles aria-hidden="true" /> AI Assistant
          <Badge variant="neutral" className="ml-1">
            Soon
          </Badge>
        </Button>
      </div>

      {/* Popular searches — curated static seed; clicking pre-fills the input (no recommendation) */}
      <div className="mt-4">
        <p className="mb-1.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
          Popular
        </p>
        <div className="flex flex-wrap gap-1.5">
          {popularSearches.map((term) => (
            <Button
              key={term}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => fill(term)}
            >
              {term}
            </Button>
          ))}
        </div>
      </div>

      {/* Trust strip — QUALITATIVE badges only; no fabricated counts (spec §2.3(g); SC GI-03/GI-12) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck aria-hidden="true" className="size-3.5 text-iv-success-base" /> Verified
          suppliers
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Boxes aria-hidden="true" className="size-3.5" /> Industrial categories
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" className="size-3.5" /> Published-only, always current
        </span>
      </div>
    </div>
  );
}
