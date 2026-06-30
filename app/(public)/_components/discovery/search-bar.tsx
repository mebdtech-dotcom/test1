"use client";

// SearchBar — the real catalog search field (Doc-7D · landing_page_spec §2 · M2.3 Phase 1). A Client
// Component: keyboard support (⌘K/Ctrl-K focus · Esc clear · Enter submit), a loading affordance, and
// URL SYNCHRONIZATION — on submit it navigates to the results route (`/search?q=`). PRESENTATION-ONLY:
// it fetches nothing; the results page reads `?q=` and renders the interim seed-filtered results. The
// wired `search_catalog` (BC-MKT-6 §8) replaces the seed filter later; this never re-ranks M3 (GI-04).
import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";

export interface SearchBarProps {
  /** Initial query — the server reads `?q=` and passes it (keep the field in sync after navigation). */
  defaultQuery?: string;
  placeholder?: string;
  /** Results route to submit to. */
  action?: string;
  /** Autofocus on mount (e.g. on the results page). */
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  defaultQuery = "",
  placeholder = "Search products, suppliers, categories…",
  action = "/search",
  autoFocus = false,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultQuery);
  const [pending, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Page-level ⌘K / Ctrl-K focuses the field (mirrors the landing Command Center).
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    // URL synchronization (presentation): navigate to the results route with ?q=. No fetch here.
    startTransition(() => router.push(q ? `${action}?q=${encodeURIComponent(q)}` : action));
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setQuery("");
  }

  return (
    <form role="search" onSubmit={submit} className={cn("flex items-center gap-2", className)}>
      <label className="relative flex-1">
        <span className="sr-only">Search the marketplace</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          type="search"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          className="h-11 pl-9 pr-3 text-base"
        />
      </label>
      <Button type="submit" size="lg" aria-label="Search" disabled={pending}>
        {pending ? (
          <Loader2 aria-hidden="true" className="animate-spin" />
        ) : (
          <Search aria-hidden="true" />
        )}
      </Button>
    </form>
  );
}
