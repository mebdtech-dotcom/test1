"use client";

// P-BUY-RFQ — Terms & conditions. PRESENTATION-ONLY with LOCAL client interactivity (the one section in
// this wizard permitted real client state — row add/remove + a small "saved bundle" convenience, per
// Board scope note on this task): a dynamic list of free-text condition rows (mirrors the Item
// Requirements List pattern in `item-requirements-table.tsx`) plus a save/load "bundle" affordance backed
// by `localStorage` (a pure client-side snippet library — NOT a form-draft autosave, and NOT wired to any
// server; there is no frozen `create_rfq`/`submit_rfq` field this maps onto yet — see `termsAndConditions`
// in `rfq-form-models.ts`). No fetch, no mutation, no submit.

import * as React from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { cn } from "@/frontend/lib/cn";
import { Select } from "../form-controls";
import { TitledCard } from "./rfq-sections";

const INPUT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-iv-ink-strong shadow-iv-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const MAX_ROWS = 20;
const MAX_BUNDLES = 5;
const BUNDLES_KEY = "ivendorz.rfq.termsBundles.v1";

interface TermsBundle {
  id: string;
  name: string;
  terms: string[];
}

let rowSeq = 0;
function nextRowId() {
  rowSeq += 1;
  return `term-${rowSeq}`;
}

interface TermRow {
  id: string;
  value: string;
}

function toRows(terms?: string[]): TermRow[] {
  if (terms && terms.length > 0) {
    return terms.map((t) => ({ id: nextRowId(), value: t }));
  }
  return [{ id: nextRowId(), value: "" }];
}

function loadBundles(): TermsBundle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BUNDLES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TermsBundle[];
  } catch {
    return [];
  }
}

function saveBundles(bundles: TermsBundle[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
  } catch {
    // localStorage unavailable (private mode / quota) — the convenience is best-effort only.
  }
}

export function TermsConditionsSection({ terms }: { terms?: string[] }) {
  const [rows, setRows] = React.useState<TermRow[]>(() => toRows(terms));
  const [bundles, setBundles] = React.useState<TermsBundle[]>([]);
  const [selectedBundleId, setSelectedBundleId] = React.useState("");
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [bundleName, setBundleName] = React.useState("");
  const [duplicateOf, setDuplicateOf] = React.useState<TermsBundle | null>(null);

  React.useEffect(() => {
    setBundles(loadBundles());
  }, []);

  function updateRow(id: string, value: string) {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  function addRow() {
    setRows((cur) => (cur.length >= MAX_ROWS ? cur : [...cur, { id: nextRowId(), value: "" }]));
  }

  function removeRow(id: string) {
    setRows((cur) => (cur.length > 1 ? cur.filter((r) => r.id !== id) : cur));
  }

  function applyBundle(id: string) {
    setSelectedBundleId(id);
    const bundle = bundles.find((b) => b.id === id);
    if (!bundle) return;
    setRows(
      bundle.terms.length > 0
        ? bundle.terms.map((t) => ({ id: nextRowId(), value: t }))
        : [{ id: nextRowId(), value: "" }],
    );
  }

  function confirmSaveBundle() {
    const name = bundleName.trim();
    if (!name) return;
    const nonEmptyTerms = rows.map((r) => r.value.trim()).filter((v) => v.length > 0);
    if (nonEmptyTerms.length === 0) return;

    // A name collision (case-insensitive) is ambiguous — ask whether the buyer meant to UPDATE the
    // existing bundle's contents or pick a different (renamed) bundle, rather than silently either
    // overwriting or creating a confusing duplicate-named entry.
    const existing = bundles.find((b) => b.name.trim().toLowerCase() === name.toLowerCase());
    if (existing && existing.id !== duplicateOf?.id) {
      setDuplicateOf(existing);
      return;
    }

    setBundles((cur) => {
      if (existing) {
        // Update in place — keep the existing bundle's position/id, replace its terms.
        const updated = cur.map((b) => (b.id === existing.id ? { ...b, terms: nonEmptyTerms } : b));
        saveBundles(updated);
        return updated;
      }
      // Eviction choice at the 5-bundle cap: evict the OLDEST saved bundle (FIFO) rather than blocking
      // the save — simpler UX than a disable-and-explain state, and "swap out an old bundle for a new
      // one" is a reasonable default for a small reusable-snippet convenience like this.
      const next = [...cur, { id: nextRowId(), name, terms: nonEmptyTerms }];
      const trimmed = next.length > MAX_BUNDLES ? next.slice(next.length - MAX_BUNDLES) : next;
      saveBundles(trimmed);
      return trimmed;
    });
    setBundleName("");
    setDuplicateOf(null);
    setSaveOpen(false);
  }

  return (
    <TitledCard title="Terms &amp; conditions">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            State any conditions vendors must accept to quote (e.g. inspection rights, warranty
            expectations, penalty clauses).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {bundles.length > 0 ? (
              <Select
                aria-label="Load a saved bundle"
                options={bundles.map((b) => ({ value: b.id, label: b.name }))}
                placeholder="Load bundle…"
                value={selectedBundleId}
                onChange={(e) => applyBundle(e.target.value)}
                className="h-8 w-40 text-xs"
              />
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => setSaveOpen((v) => !v)}
            >
              <Save aria-hidden className="size-3.5" />
              Save as bundle
            </Button>
          </div>
        </div>

        {saveOpen ? (
          <div className="rounded-md border border-dashed border-border bg-secondary/40 p-3">
            <p className="text-xs text-muted-foreground">
              Save the current rows (non-empty ones) as a reusable bundle for future RFQs. Up to{" "}
              {MAX_BUNDLES} bundles are kept — saving a 6th replaces the oldest.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                aria-label="Bundle name"
                className={cn(INPUT_CLASS, "max-w-xs")}
                value={bundleName}
                onChange={(e) => {
                  setBundleName(e.target.value);
                  setDuplicateOf(null);
                }}
                placeholder="e.g. Standard steel supply terms"
              />
              <Button
                type="button"
                size="sm"
                onClick={confirmSaveBundle}
                disabled={!bundleName.trim()}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSaveOpen(false);
                  setBundleName("");
                  setDuplicateOf(null);
                }}
              >
                Cancel
              </Button>
            </div>

            {duplicateOf ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-iv-warning-base/40 bg-iv-warning-subtle px-3 py-2 text-xs text-iv-warning-muted">
                <span>
                  A bundle named &ldquo;{duplicateOf.name}&rdquo; already exists — update it with
                  the current rows, or rename this one to save it separately.
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" onClick={confirmSaveBundle}>
                    Update &ldquo;{duplicateOf.name}&rdquo;
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setDuplicateOf(null)}
                  >
                    Let me rename
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <ul className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-2">
              <input
                type="text"
                aria-label={`Term ${i + 1}`}
                className={INPUT_CLASS}
                value={row.value}
                onChange={(e) => updateRow(row.id, e.target.value)}
                placeholder="e.g. Vendor must accept a pre-dispatch inspection"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove term ${i + 1}`}
                disabled={rows.length === 1 && rows[0].value.trim() === ""}
                onClick={() => removeRow(row.id)}
              >
                <Trash2 aria-hidden className="size-4 text-muted-foreground" />
              </Button>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit gap-1.5"
          onClick={addRow}
          disabled={rows.length >= MAX_ROWS}
        >
          <Plus aria-hidden className="size-3.5" />
          Add row
        </Button>
      </div>
    </TitledCard>
  );
}
