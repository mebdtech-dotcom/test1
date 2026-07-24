"use client";

// Comparison Workspace — SAFE URL view-state (§2.11A.13 / §2.3.1). The single writer of the workspace's
// URL query. It encodes ONLY non-private presentation state and rebuilds the query from a fixed allow-list
// on every write, so buyer-authored content (evaluation, recommendation, exclusion reason, procurement
// purpose, negotiated value, signatory names, private notes) can NEVER be serialized — Inv #11.
//
// Allowed keys: `sel` (the 2–5 selection, multi-valued) · `mode` (compare|document) · `section` (scroll
// anchor) · `differences` (=1) · `focus` (a quotationId to emphasise). URL state is reversible via the
// browser's back/forward. Every writer merges into the current values, so setting one key never drops the
// others (the tray's `?sel=` write used to clobber the rest). `router.replace(..., { scroll: false })` keeps
// history clean and the scroll position stable.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type WorkspaceMode = "compare" | "document";

export interface WorkspaceView {
  mode: WorkspaceMode;
  section: string | null;
  differencesOnly: boolean;
  focusedVendor: string | null;
  sel: string[];
  setMode: (mode: WorkspaceMode) => void;
  setSection: (section: string | null) => void;
  setDifferencesOnly: (on: boolean) => void;
  setFocusedVendor: (quotationId: string | null) => void;
  setSel: (ids: string[]) => void;
}

interface ViewPatch {
  mode?: WorkspaceMode;
  section?: string | null;
  differencesOnly?: boolean;
  focusedVendor?: string | null;
  sel?: string[];
}

export function useWorkspaceView(): WorkspaceView {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode: WorkspaceMode = searchParams.get("mode") === "document" ? "document" : "compare";
  const section = searchParams.get("section");
  const differencesOnly = searchParams.get("differences") === "1";
  const focusedVendor = searchParams.get("focus");
  // getAll preserves the System-ordered multi-value `sel`; identity of the array is stable per render.
  const selKey = searchParams.toString();
  const sel = useMemo(() => searchParams.getAll("sel"), [selKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = useCallback(
    (patch: ViewPatch) => {
      const next = new URLSearchParams();
      // sel — always rebuilt from the allow-list (never carries anything else).
      const nextSel = patch.sel ?? searchParams.getAll("sel");
      nextSel.forEach((id) => next.append("sel", id));
      // mode — omit the default (compare) to keep the URL clean.
      const nextMode = patch.mode ?? mode;
      if (nextMode === "document") next.set("mode", "document");
      // section
      const nextSection = patch.section !== undefined ? patch.section : section;
      if (nextSection) next.set("section", nextSection);
      // differences
      const nextDiff =
        patch.differencesOnly !== undefined ? patch.differencesOnly : differencesOnly;
      if (nextDiff) next.set("differences", "1");
      // focus
      const nextFocus = patch.focusedVendor !== undefined ? patch.focusedVendor : focusedVendor;
      if (nextFocus) next.set("focus", nextFocus);
      // rfq — the Compare Quotes route (/buy/quotations/compare) carries its RFQ selection in the query
      // rather than a path segment. It is an opaque id and pure presentation state, so it joins the
      // allow-list; without it, the first tray write here would rebuild the query and drop the selected
      // RFQ, collapsing that page back to its picker. Absent on the per-RFQ route, where it is a no-op.
      const nextRfq = searchParams.get("rfq");
      if (nextRfq) next.set("rfq", nextRfq);

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, mode, section, differencesOnly, focusedVendor],
  );

  return {
    mode,
    section,
    differencesOnly,
    focusedVendor,
    sel,
    setMode: useCallback((m: WorkspaceMode) => apply({ mode: m }), [apply]),
    setSection: useCallback((s: string | null) => apply({ section: s }), [apply]),
    setDifferencesOnly: useCallback((on: boolean) => apply({ differencesOnly: on }), [apply]),
    setFocusedVendor: useCallback((q: string | null) => apply({ focusedVendor: q }), [apply]),
    setSel: useCallback((ids: string[]) => apply({ sel: ids }), [apply]),
  };
}
