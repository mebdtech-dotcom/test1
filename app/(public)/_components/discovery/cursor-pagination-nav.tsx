"use client";

// Thin composition wrapper around the kit `PaginationControl` (Doc-7B) that wires its `onNext`/
// `onPrevious` callbacks to REAL cursor-bearing navigation for a server-rendered listing page — NOT a
// fork/duplicate of the primitive (the primitive owns 100% of the visual/interaction surface; this
// component supplies only the two navigation callbacks the primitive already declares as its
// surface-owned contract: "the surface owns the cursor handlers").
//
// Forward-only cursor semantics (Doc-5A §8.1/§8.2 — no offset, and NO server-issued "previous cursor"
// is ever defined). Backward navigation is realized honestly with a CURSOR BREADCRUMB carried in the
// URL, never `router.back()`/browser history (which a cold-loaded deep link `?cursor=X` does not have):
//   - `cursor` — the cursor of the CURRENT page (absent on page 1).
//   - `trail`  — a comma-joined ordered stack of the cursors of the PRIOR pages (empty/absent on
//                pages 1 and 2; base64url cursors never contain a comma, so the join is unambiguous).
// "Next": push the current `cursor` (if any) onto the trail, then navigate to the server-issued
// `next_cursor`. "Previous": pop the last trail entry and navigate to it (or, when the trail is empty,
// back to the bare page — dropping `cursor`/`trail` — i.e. page 1). Every OTHER query param
// (`q`/`tab` on `/search`) is preserved across every navigation. Because the trail travels IN the URL,
// a shared/bookmarked `?cursor=X&trail=Y` link opened cold in a new tab paginates backward correctly
// with zero reliance on in-app history. `hasPrevious` is simply "a `cursor` is present" (page ≥ 2).
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PaginationControl } from "@/frontend/components/pagination-control";

export interface CursorPaginationNavProps {
  hasMore: boolean;
  nextCursor?: string;
}

export function CursorPaginationNav({ hasMore, nextCursor }: CursorPaginationNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCursor = searchParams.get("cursor") ?? undefined;
  const trail = (searchParams.get("trail") ?? "").split(",").filter((c) => c.length > 0);
  const hasPrevious = currentCursor !== undefined;

  // Build a URL for the target page, preserving every OTHER existing query param and setting/clearing
  // ONLY `cursor` + `trail`.
  function href(cursor: string | undefined, nextTrail: string[]): string {
    const params = new URLSearchParams(searchParams.toString());
    if (cursor !== undefined) params.set("cursor", cursor);
    else params.delete("cursor");
    if (nextTrail.length > 0) params.set("trail", nextTrail.join(","));
    else params.delete("trail");
    const qs = params.toString();
    return qs.length > 0 ? `${pathname}?${qs}` : pathname;
  }

  function goNext() {
    if (nextCursor === undefined) return;
    // Push the current cursor (absent on page 1) onto the trail before advancing.
    const nextTrail = currentCursor !== undefined ? [...trail, currentCursor] : trail;
    router.push(href(nextCursor, nextTrail));
  }

  function goPrevious() {
    if (trail.length > 0) {
      // Pop the previous cursor off the trail and navigate to it.
      const prevCursor = trail[trail.length - 1];
      router.push(href(prevCursor, trail.slice(0, -1)));
    } else {
      // Empty trail ⇒ the previous page IS page 1: navigate to the bare page (no cursor, no trail).
      router.push(href(undefined, []));
    }
  }

  return (
    <PaginationControl
      hasMore={hasMore}
      hasPrevious={hasPrevious}
      onNext={nextCursor !== undefined ? goNext : undefined}
      onPrevious={hasPrevious ? goPrevious : undefined}
    />
  );
}
