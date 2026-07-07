"use client";

// S4 Quote Authoring — INTERACTIVE QUOTATION WORKBENCH (owner functional spec 2026-07-06 + owner
// PRD delta 2026-07-07). The milestone's deliberate Client Component: live client-side authoring
// (amendable item rows, instant totals, AIT/VAT/grand-total math, currency switch, reusable
// condition sets, document-style preview dialog, device-local draft). Everything remains UNWIRED:
// no server write exists anywhere here; submit stays disabled (presentation); drafts/sets are
// device-local only (consistent with [ESC-7G-Q-DRAFT]). No submit success is ever simulated and no
// PDF/share instrument is fabricated (ESC-QTN-PDF-SHARE).
//
// Contract grounding — the frozen submit surface (`rfq.submit_quotation.v1`) carries exactly the
// EIGHT frozen fields; the jsonb internals are dev-doc scope (Doc-4E PassB-Part4). Everything this
// workbench renders beyond that vocabulary is registered intake, NOT contract:
//   · item amendments + dedicated amendment summary  → ESC-QTN-AMEND (buyer original never mutated)
//   · payment/general/exclusion/special-note groups  → ESC-QTN-TERMS-GROUPS
//   · reusable condition sets (max 5, device-local)  → ESC-QTN-CONDITION-SETS
//   · submission message/contact/remarks             → ESC-QTN-SUBMIT-INFO
//   · supported currency list (BDT/USD/EUR/GBP/CNY)  → ESC-QTN-CURRENCY-LIST
//   · per-line "Not offered" decision + reason       → same jsonb dev-doc class as ESC-QTN-AMEND
//     (the buyer's RFQ line is untouched; not-offered lines never contribute to totals)
//   · auto-PDF + share on submit                     → ESC-QTN-PDF-SHARE (browser print interim)
//   · buyer↔vendor negotiation loop                  → ESC-QTN-NEGOTIATION (no lifecycle affordance
//     coined here; only frozen facts render)
// Revision display is SYSTEM-MANAGED and read-only (owner ruling 2026-07-07 — ESC-QTN-REV-LABEL
// WITHDRAWN): shown as "Rev N" where N = the count of already-submitted immutable versions (frozen
// `current_version_no`); a never-submitted draft shows Rev 0. Never vendor-editable.
// Contact person/number default from the shell identity source (the signed-in user when wired);
// edits are quotation-local client state only — the user profile is never touched.
// Buyer-visible "Buyer conditions" bind EXISTING granted RfqSnapshotView fields only — never the
// ND-excluded routing/priority guidance (types.ts non-disclosure block). Own-data-only throughout
// (ND-1..ND-8): nothing about other vendors renders here.
//
// Native <select>/<textarea>/<input type=checkbox> appear ONLY where no kit primitive exists
// (RV-0029/0094 exemption; [ESC-7B-TEXTAREA] pending kit addition). Buttons/inputs are kit primitives.
import * as React from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Eye,
  MinusCircle,
  Pencil,
  Plus,
  PlusCircle,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";
import "./quotation-print.css";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { Input } from "@/frontend/primitives/input";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { EmptyState } from "@/frontend/components/empty-state";
import { FormField } from "@/frontend/components/form-field";

import { RichNoteEditor, RichNoteToolbar } from "@/frontend/components/rich-note-editor";
import { QuotationAttachments } from "./quotation-attachments";
import { QuotationDocument, type QuotationDocumentModel } from "./quotation-document";
import { QuotationSubmitPanel } from "./quotation-submit-panel";
import type { FileRefView, PriceBreakdownLine, QuotaView, RfqSnapshotView } from "./types";

/* ── Interim vocabularies (registered intake, see header) ─────────────────────────────────────── */

/** ESC-QTN-CURRENCY-LIST — owner-directed interim list; final list = M8 POLICY key. */
const SUPPORTED_CURRENCIES = ["BDT", "USD", "EUR", "GBP", "CNY"] as const;

const NATIVE_CONTROL_CLASS =
  "h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const TEXTAREA_CLASS =
  "min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** One client-local item row. `original` is the buyer's RFQ copy — always retained (ESC-QTN-AMEND). */
interface ItemRow {
  id: number;
  itemName: string;
  sizeSpec: string;
  /** Buyer quantity — locked (no quantity-amendment flag exists on the frozen RFQ surface). */
  qty?: number;
  unit?: string;
  /** Raw input string for smooth typing; parsed for math. */
  unitPrice: string;
  /** Vendor offer decision — the item stays visible, never removed; excluded from totals. */
  notOffered?: boolean;
  /** Optional reason shown with the Not offered status (e.g. "Out of stock"). */
  notOfferedNote?: string;
  /** Optional vendor short description for the line (wraps in the document; jsonb dev-doc class). */
  lineNote?: string;
  original: { itemName: string; sizeSpec: string };
}

type ConditionGroupKey = "payment" | "delivery" | "warranty" | "general" | "exclusion" | "notes";
type ConditionRows = Record<ConditionGroupKey, string[]>;

/** delivery/warranty anchor to frozen fields by exact name; the rest are ESC-QTN-TERMS-GROUPS. */
const CONDITION_GROUPS: {
  key: ConditionGroupKey;
  label: string;
  required?: boolean;
  frozenField?: string;
  hint?: string;
}[] = [
  { key: "payment", label: "Payment terms" },
  {
    key: "delivery",
    label: "Delivery terms",
    required: true,
    frozenField: "delivery_terms",
    hint: "Include your delivery schedule and the validity period for this quotation.",
  },
  { key: "warranty", label: "Warranty terms", frozenField: "warranty_terms" },
  { key: "general", label: "General terms" },
  { key: "exclusion", label: "Exclusion terms" },
  { key: "notes", label: "Special notes" },
];

/** ESC-QTN-CONDITION-SETS — device-local only. */
interface ConditionSet {
  name: string;
  conditions: ConditionRows;
}
const MAX_CONDITION_SETS = 5;
const CONDITION_SETS_STORAGE_KEY = "iv.vendor.quotation.condition-sets.v0";

/** [ESC-7G-Q-DRAFT] — the draft is a device-local convenience, never a server-persisted guarantee. */
const DEVICE_DRAFT_KEY_PREFIX = "iv.vendor.quotation.device-draft.v0:";

interface DeviceDraft {
  rows?: ItemRow[];
  amendNotes?: Record<number, string>;
  conditions?: ConditionRows;
  compliance?: string;
  submitMessage?: string;
  contactPerson?: string;
  contactNumber?: string;
  remarks?: string;
  currencyCode?: string;
  vatIncluded?: boolean;
  vatPct?: string;
  aitIncluded?: boolean;
  aitPct?: string;
  discountPct?: string;
  discountFlat?: string;
}

const parseAmount = (raw: string): number | undefined => {
  if (raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Plain grouped number — currency shows ONLY on the Grand total and in the "Unit rate (BDT)"
 *  column header (owner directive 2026-07-07). */
const formatNumber = (n: number) =>
  new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(n);

/** Scoped print (owner directive 2026-07-07): marks <body> so quotation-print.css shows ONLY the
 *  requested sheet — "rfq" = the buyer RFQ (authoring quick action), "offer" = the vendor offer
 *  document (preview dialog). User-agent print only (allowed interim, ESC-QTN-PDF-SHARE). */
export const printQuotationSheet = (kind: "rfq" | "offer") => {
  document.body.setAttribute("data-iv-print", kind);
  const cleanup = () => {
    document.body.removeAttribute("data-iv-print");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
};

// Rich Description editor + toolbar PROMOTED to the kit (2026-07-07): the buyer New-RFQ item list
// needs the same field — see @/frontend/components/rich-note-editor (extend-the-kit, no duplication).

const rowTotal = (row: ItemRow): number | undefined => {
  const price = parseAmount(row.unitPrice);
  if (row.qty == null || price == null) return undefined;
  return row.qty * price;
};

const isAmended = (row: ItemRow): boolean =>
  row.itemName !== row.original.itemName || row.sizeSpec !== row.original.sizeSpec;

const specLine = (itemName: string, sizeSpec: string): string =>
  [itemName, sizeSpec].filter(Boolean).join(" · ") || "—";

function seedRows(rfq?: RfqSnapshotView, lines?: PriceBreakdownLine[]): ItemRow[] {
  if (lines && lines.length > 0) {
    return lines.map((line, index) => ({
      id: index + 1,
      itemName: line.description ?? "",
      sizeSpec: "",
      qty: line.qty,
      unit: undefined,
      unitPrice: typeof line.unit_amount === "number" ? String(line.unit_amount) : "",
      original: { itemName: line.description ?? "", sizeSpec: "" },
    }));
  }
  if (rfq?.item_name || rfq?.quantity || rfq?.standards) {
    const parsedQty = rfq?.quantity != null && rfq.quantity !== "" ? Number(rfq.quantity) : NaN;
    return [
      {
        id: 1,
        itemName: rfq?.item_name ?? "",
        sizeSpec: rfq?.standards ?? "",
        qty: Number.isFinite(parsedQty) ? parsedQty : undefined,
        unit: rfq?.unit,
        unitPrice: "",
        original: { itemName: rfq?.item_name ?? "", sizeSpec: rfq?.standards ?? "" },
      },
    ];
  }
  return [];
}

export interface QuotationWorkbenchProps {
  rfq?: RfqSnapshotView;
  lines?: PriceBreakdownLine[];
  currency?: string;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  attachments?: FileRefView[];
  quota?: QuotaView;
  /** SYSTEM-MANAGED revision (read-only): count of already-submitted immutable versions (frozen
   *  `current_version_no`); a never-submitted draft is Rev 0. Never vendor-editable. */
  revisionNo?: number;
  /** Defaults from the shell identity source (the signed-in user when wired); quotation-local edits only. */
  defaultContactPerson?: string;
  defaultContactNumber?: string;
}

export function QuotationWorkbench({
  rfq,
  lines,
  currency = "BDT",
  deliveryTerms,
  warrantyTerms,
  specComplianceDeclaration,
  attachments,
  quota,
  revisionNo = 0,
  defaultContactPerson,
  defaultContactNumber,
}: QuotationWorkbenchProps) {
  /* ── Items & pricing ── */
  const [rows, setRows] = React.useState<ItemRow[]>(() => seedRows(rfq, lines));
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [amendNotes, setAmendNotes] = React.useState<Record<number, string>>({});
  const [currencyCode, setCurrencyCode] = React.useState(currency);
  const [vatIncluded, setVatIncluded] = React.useState(true);
  const [vatPct, setVatPct] = React.useState("10");
  const [aitIncluded, setAitIncluded] = React.useState(false);
  const [aitPct, setAitPct] = React.useState("5");
  const [discountPct, setDiscountPct] = React.useState("");
  const [discountFlat, setDiscountFlat] = React.useState("");
  /** Bumped after a device-draft restore so keyed Description editors remount with restored HTML. */
  const [restoreTick, setRestoreTick] = React.useState(0);
  /** Portal guard — the print sheets attach directly under <body> after mount (SSR-safe). */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const updateRow = (
    id: number,
    patch: Partial<
      Pick<ItemRow, "itemName" | "sizeSpec" | "unitPrice" | "notOfferedNote" | "lineNote">
    >,
  ) => setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  /** Offer decision only — the item stays visible and the buyer's RFQ line is untouched. */
  const toggleNotOffered = (id: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              notOffered: !row.notOffered,
              notOfferedNote: row.notOffered ? undefined : row.notOfferedNote,
            }
          : row,
      ),
    );
    setEditingId((current) => (current === id ? null : current));
  };

  const undoRow = (id: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, itemName: row.original.itemName, sizeSpec: row.original.sizeSpec }
          : row,
      ),
    );
    setAmendNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setEditingId((current) => (current === id ? null : current));
  };

  // Not-offered lines never contribute to totals (offer decision, not a removal).
  const totalAmount = rows.reduce(
    (sum, row) => (row.notOffered ? sum : sum + (rowTotal(row) ?? 0)),
    0,
  );
  // Discount (% + flat, capped at the total) applies before VAT/AIT — both compute on the
  // discounted base (jsonb dev-doc class, same as the other price_breakdown internals).
  const discountAmount = Math.min(
    totalAmount,
    (totalAmount * (parseAmount(discountPct) ?? 0)) / 100 + (parseAmount(discountFlat) ?? 0),
  );
  const discountedTotal = totalAmount - discountAmount;
  const vatAmount = vatIncluded ? (discountedTotal * (parseAmount(vatPct) ?? 0)) / 100 : 0;
  const aitAmount = aitIncluded ? (discountedTotal * (parseAmount(aitPct) ?? 0)) / 100 : 0;
  const grandTotal = discountedTotal + vatAmount + aitAmount;
  const amendedRows = rows.filter(isAmended);

  /* ── Commercial conditions ── */
  const [conditions, setConditions] = React.useState<ConditionRows>(() => ({
    payment: [],
    delivery: deliveryTerms ? [deliveryTerms] : [],
    warranty: warrantyTerms ? [warrantyTerms] : [],
    general: [],
    exclusion: [],
    notes: [],
  }));
  const [compliance, setCompliance] = React.useState(specComplianceDeclaration ?? "");

  const addConditionRow = (key: ConditionGroupKey) =>
    setConditions((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  const updateConditionRow = (key: ConditionGroupKey, index: number, value: string) =>
    setConditions((prev) => ({
      ...prev,
      [key]: prev[key].map((row, i) => (i === index ? value : row)),
    }));
  const removeConditionRow = (key: ConditionGroupKey, index: number) =>
    setConditions((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  /* ── Condition sets (device-local, ESC-QTN-CONDITION-SETS) ── */
  const [sets, setSets] = React.useState<ConditionSet[]>([]);
  const [setsLoaded, setSetsLoaded] = React.useState(false);
  const [newSetName, setNewSetName] = React.useState("");
  const [renamingSet, setRenamingSet] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONDITION_SETS_STORAGE_KEY);
      if (raw) setSets(JSON.parse(raw) as ConditionSet[]);
    } catch {
      // Unreadable device storage → start empty (device-local convenience only).
    }
    setSetsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!setsLoaded) return;
    try {
      window.localStorage.setItem(CONDITION_SETS_STORAGE_KEY, JSON.stringify(sets));
    } catch {
      // Storage full/blocked → the in-memory list still works for this visit.
    }
  }, [sets, setsLoaded]);

  const trimmedNewName = newSetName.trim();
  const canSaveSet =
    trimmedNewName !== "" &&
    sets.length < MAX_CONDITION_SETS &&
    !sets.some((set) => set.name === trimmedNewName);

  const saveSet = () => {
    if (!canSaveSet) return;
    setSets((prev) => [...prev, { name: trimmedNewName, conditions: { ...conditions } }]);
    setNewSetName("");
  };
  const loadSet = (name: string) => {
    const found = sets.find((set) => set.name === name);
    if (found) setConditions({ ...found.conditions });
  };
  const updateSet = (name: string) =>
    setSets((prev) =>
      prev.map((set) => (set.name === name ? { ...set, conditions: { ...conditions } } : set)),
    );
  const deleteSet = (name: string) => setSets((prev) => prev.filter((set) => set.name !== name));
  const renameSet = (name: string) => {
    const next = renameValue.trim();
    if (next === "" || sets.some((set) => set.name === next)) return;
    setSets((prev) => prev.map((set) => (set.name === name ? { ...set, name: next } : set)));
    setRenamingSet(null);
    setRenameValue("");
  };

  /* ── Submission info (ESC-QTN-SUBMIT-INFO) — contact defaults from the signed-in identity;
        edits are quotation-local only (the user profile is never touched). ── */
  const [submitMessage, setSubmitMessage] = React.useState("");
  const [contactPerson, setContactPerson] = React.useState(defaultContactPerson ?? "");
  const [contactNumber, setContactNumber] = React.useState(defaultContactNumber ?? "");
  const [remarks, setRemarks] = React.useState("");

  /* ── Device draft ([ESC-7G-Q-DRAFT]) ── */
  const draftKey = `${DEVICE_DRAFT_KEY_PREFIX}${rfq?.rfq_id ?? "unknown-rfq"}`;
  const [draftNote, setDraftNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as DeviceDraft;
      if (Array.isArray(draft.rows)) setRows(draft.rows);
      if (draft.amendNotes) setAmendNotes(draft.amendNotes);
      if (draft.conditions) setConditions(draft.conditions);
      if (typeof draft.compliance === "string") setCompliance(draft.compliance);
      if (typeof draft.submitMessage === "string") setSubmitMessage(draft.submitMessage);
      if (typeof draft.contactPerson === "string") setContactPerson(draft.contactPerson);
      if (typeof draft.contactNumber === "string") setContactNumber(draft.contactNumber);
      if (typeof draft.remarks === "string") setRemarks(draft.remarks);
      if (typeof draft.currencyCode === "string") setCurrencyCode(draft.currencyCode);
      if (typeof draft.vatIncluded === "boolean") setVatIncluded(draft.vatIncluded);
      if (typeof draft.vatPct === "string") setVatPct(draft.vatPct);
      if (typeof draft.aitIncluded === "boolean") setAitIncluded(draft.aitIncluded);
      if (typeof draft.aitPct === "string") setAitPct(draft.aitPct);
      if (typeof draft.discountPct === "string") setDiscountPct(draft.discountPct);
      if (typeof draft.discountFlat === "string") setDiscountFlat(draft.discountFlat);
      setRestoreTick((tick) => tick + 1);
      setDraftNote("Draft restored from this device.");
    } catch {
      // Unreadable draft → start from the seeded RFQ copy.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once per mount for this RFQ
  }, []);

  const saveDraft = () => {
    const draft: DeviceDraft = {
      rows,
      amendNotes,
      conditions,
      compliance,
      submitMessage,
      contactPerson,
      contactNumber,
      remarks,
      currencyCode,
      vatIncluded,
      vatPct,
      aitIncluded,
      aitPct,
      discountPct,
      discountFlat,
    };
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
      setDraftNote("Draft saved on this device.");
    } catch {
      setDraftNote("Could not save the draft on this device.");
    }
  };

  /* ── Preview dialog ── */
  const [previewOpen, setPreviewOpen] = React.useState(false);

  /** Buyer conditions (read only) — existing granted snapshot fields, never ND-excluded guidance. */
  const buyerConditions = [
    { label: "Brand preference", value: rfq?.brand_preference },
    { label: "Alternative brand", value: rfq?.alternative_brand },
    { label: "Condition", value: rfq?.product_condition },
    { label: "Standards", value: rfq?.standards },
    { label: "Certifications", value: rfq?.certifications },
    { label: "Delivery required by", value: rfq?.delivery_date_label },
    { label: "Delivery instructions", value: rfq?.delivery_instructions },
  ].filter((item) => item.value);

  const amendmentSummaryTable =
    amendedRows.length > 0 ? (
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">Buyer specification amendments</caption>
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Sl.
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Buyer specification
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Vendor amendment
              </th>
              <th scope="col" className="px-3 py-2 text-left font-medium">
                Notes (optional)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {amendedRows.map((row) => (
              <tr key={row.id} className="bg-iv-amber-50/60">
                <td className="px-3 py-2 text-muted-foreground">
                  {rows.findIndex((r) => r.id === row.id) + 1}
                </td>
                <td className="px-3 py-2">
                  {specLine(row.original.itemName, row.original.sizeSpec)}
                </td>
                <td className="px-3 py-2 font-medium">{specLine(row.itemName, row.sizeSpec)}</td>
                <td className="px-3 py-2">
                  <Input
                    value={amendNotes[row.id] ?? ""}
                    onChange={(event) =>
                      setAmendNotes((prev) => ({ ...prev, [row.id]: event.target.value }))
                    }
                    placeholder="e.g. Available stock"
                    aria-label={`Amendment note for row ${rows.findIndex((r) => r.id === row.id) + 1}`}
                    className="min-w-36"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null;

  /** Canonical document model — ONE template renders the preview AND the exported document
   *  (owner directive 2026-07-07: no simplified preview; what you see is what the buyer receives). */
  const documentModel: QuotationDocumentModel = {
    rfqHumanRef: rfq?.human_ref,
    revisionNo,
    currency: currencyCode,
    subject: rfq?.summary,
    client: {
      companyName: rfq?.buyer_org_name,
      siteLocation: rfq?.delivery_location ?? rfq?.delivery_geography,
      district: rfq?.delivery_district,
      deliveryDateLabel: rfq?.delivery_date_label,
      deliveryInstructions: rfq?.delivery_instructions,
    },
    lines: rows.map((row) => ({
      itemName: row.itemName,
      sizeSpec: row.sizeSpec,
      qty: row.qty,
      unit: row.unit,
      unitPrice: row.notOffered ? undefined : parseAmount(row.unitPrice),
      rowTotal: row.notOffered ? undefined : rowTotal(row),
      amended: isAmended(row),
      originalSpec: isAmended(row)
        ? specLine(row.original.itemName, row.original.sizeSpec)
        : undefined,
      amendmentNote: amendNotes[row.id],
      notOffered: row.notOffered,
      notOfferedNote: row.notOfferedNote,
      shortDescription: row.lineNote,
    })),
    totals: {
      totalAmount,
      discountAmount,
      discountedTotal,
      aitIncluded,
      aitPct: parseAmount(aitPct) ?? 0,
      aitAmount,
      vatIncluded,
      vatPct: parseAmount(vatPct) ?? 0,
      vatAmount,
      grandTotal,
    },
    terms: CONDITION_GROUPS.map((group) => ({
      label: group.label,
      rows: conditions[group.key].filter((v) => v.trim()),
    })).filter((group) => group.rows.length > 0),
    complianceDeclaration: compliance,
    buyerConditions: buyerConditions.map((item) => ({
      label: item.label,
      value: item.value as string,
    })),
    message: submitMessage,
    remarks,
    contactPerson,
    contactNumber,
    attachments: (attachments ?? [])
      .filter((file) => file.href)
      .map((file, index) => file.name ?? `Attachment ${index + 1}`),
  };

  return (
    <div className="space-y-6">
      {/* ── 1 · Item-wise quotation & pricing ── */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base">Item-wise quotation &amp; pricing</CardTitle>
            <p className="text-sm text-muted-foreground">
              Copied from the buyer&apos;s RFQ — the buyer specification stays locked. Use the amend
              control (or click the item name / size) to propose a change; amended rows highlight
              and can be reverted. Quantity is set by the buyer&apos;s RFQ.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {/* SYSTEM-MANAGED revision — read-only, never vendor-editable (owner ruling 2026-07-07). */}
            <span className="text-sm text-muted-foreground">
              Revision: <span className="font-medium text-foreground">Rev {revisionNo}</span>
            </span>
            <Badge variant="neutral">
              {rows.length} {rows.length === 1 ? "line" : "lines"}
            </Badge>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Currency
              {/* Native select: no kit Select primitive exists (RV-0029/0094 exemption). */}
              <select
                value={currencyCode}
                onChange={(event) => setCurrencyCode(event.target.value)}
                className={NATIVE_CONTROL_CLASS}
                aria-label="Quotation currency"
              >
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RichNoteToolbar hint="Select text in a Description cell, then apply. Enter adds a new line." />

          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">Item-wise quotation and pricing</caption>
                {/* Brand navy header tint (owner directive 2026-07-07) — KpiStatCard brand pattern. */}
                <thead className="bg-iv-navy-50 text-iv-navy-700 dark:bg-iv-navy-900/50 dark:text-iv-navy-200">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Sl.
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Item name
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Size / specification
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Qty / unit
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Unit rate ({currencyCode})
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Row total
                    </th>
                    <th scope="col" className="px-3 py-2 text-left font-medium">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      <span className="sr-only">Row actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, index) => {
                    const amended = isAmended(row);
                    const editing = editingId === row.id && !row.notOffered;
                    const total = row.notOffered ? undefined : rowTotal(row);
                    return (
                      <tr
                        key={row.id}
                        className={
                          row.notOffered ? "bg-muted/50" : amended ? "bg-iv-amber-50" : undefined
                        }
                      >
                        <td className="px-3 py-2 align-top">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">{index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label={
                                editing
                                  ? `Done amending row ${index + 1}`
                                  : `Amend item name or size of row ${index + 1}`
                              }
                              onClick={() => setEditingId(editing ? null : row.id)}
                              disabled={row.notOffered}
                            >
                              {editing ? (
                                <Check aria-hidden="true" />
                              ) : (
                                <Pencil aria-hidden="true" />
                              )}
                            </Button>
                          </div>
                          <div className="mt-1 flex flex-col items-start gap-1">
                            {row.notOffered ? <Badge variant="neutral">Not offered</Badge> : null}
                            {amended ? <Badge variant="amber">Amended</Badge> : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          {editing ? (
                            <Input
                              value={row.itemName}
                              onChange={(event) =>
                                updateRow(row.id, { itemName: event.target.value })
                              }
                              aria-label={`Item name for row ${index + 1}`}
                              className="min-w-40"
                            />
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto justify-start whitespace-normal px-1 py-0.5 text-left font-normal"
                              onClick={() => setEditingId(row.id)}
                              aria-label={`Amend item name of row ${index + 1}`}
                              disabled={row.notOffered}
                            >
                              {row.itemName || "—"}
                            </Button>
                          )}
                          {row.notOffered ? (
                            <Input
                              value={row.notOfferedNote ?? ""}
                              onChange={(event) =>
                                updateRow(row.id, { notOfferedNote: event.target.value })
                              }
                              placeholder="Reason (optional) — e.g. Out of stock"
                              aria-label={`Reason row ${index + 1} is not offered`}
                              className="mt-1 min-w-40"
                            />
                          ) : null}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {editing ? (
                            <Input
                              value={row.sizeSpec}
                              onChange={(event) =>
                                updateRow(row.id, { sizeSpec: event.target.value })
                              }
                              aria-label={`Size or specification for row ${index + 1}`}
                              className="min-w-40"
                            />
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto justify-start whitespace-normal px-1 py-0.5 text-left font-normal"
                              onClick={() => setEditingId(row.id)}
                              aria-label={`Amend size or specification of row ${index + 1}`}
                              disabled={row.notOffered}
                            >
                              {row.sizeSpec || "—"}
                            </Button>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right align-top tabular-nums">
                          {row.qty ?? "—"}
                          {row.unit ? (
                            <span className="block text-xs text-muted-foreground">{row.unit}</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            value={row.unitPrice}
                            onChange={(event) =>
                              updateRow(row.id, { unitPrice: event.target.value })
                            }
                            aria-label={`Unit rate for row ${index + 1} in ${currencyCode}`}
                            className="ml-auto w-28 text-right"
                            disabled={row.notOffered}
                          />
                        </td>
                        <td className="px-3 py-2 text-right align-top font-semibold tabular-nums text-iv-navy-700 dark:text-iv-navy-200">
                          {row.notOffered ? (
                            <span className="font-normal text-muted-foreground">Not offered</span>
                          ) : total != null ? (
                            formatNumber(total)
                          ) : (
                            <span className="font-normal text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <RichNoteEditor
                            key={`${row.id}:${restoreTick}`}
                            initialHtml={row.lineNote ?? ""}
                            onChange={(html) => updateRow(row.id, { lineNote: html })}
                            ariaLabel={`Description for row ${index + 1}`}
                          />
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          <div className="flex flex-col items-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label={
                                row.notOffered
                                  ? `Offer row ${index + 1} again`
                                  : `Mark row ${index + 1} as not offered`
                              }
                              onClick={() => toggleNotOffered(row.id)}
                            >
                              {row.notOffered ? (
                                <PlusCircle aria-hidden="true" />
                              ) : (
                                <MinusCircle aria-hidden="true" />
                              )}
                            </Button>
                            {amended && !row.notOffered ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label={`Revert row ${index + 1} to the buyer's original specification`}
                                onClick={() => undoRow(row.id)}
                              >
                                <RotateCcw aria-hidden="true" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No item lines shared"
              description="The buyer's item requirements appear here when the RFQ carries them."
            />
          )}

          {/* Financial summary — live math, single currency per quotation */}
          <dl className="ml-auto w-full max-w-md space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between font-medium">
              <dt>Total amount (sum of all rows)</dt>
              <dd className="tabular-nums">{formatNumber(totalAmount)}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">Discount %</dt>
              <dd className="flex items-center gap-2 tabular-nums">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={discountPct}
                  onChange={(event) => setDiscountPct(event.target.value)}
                  aria-label="Discount percentage"
                  className="w-20 text-right"
                />
                <span className="text-muted-foreground">%</span>
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">Discount (flat)</dt>
              <dd className="flex items-center gap-2 tabular-nums">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={discountFlat}
                  onChange={(event) => setDiscountFlat(event.target.value)}
                  aria-label={`Flat discount in ${currencyCode}`}
                  className="w-28 text-right"
                />
              </dd>
            </div>
            {discountAmount > 0 ? (
              <div className="flex items-center justify-between font-medium">
                <dt>Total after discount</dt>
                <dd className="tabular-nums">
                  <span className="mr-2 text-xs font-normal text-muted-foreground">
                    (− {formatNumber(discountAmount)})
                  </span>
                  {formatNumber(discountedTotal)}
                </dd>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">
                {/* Native checkbox: no kit Checkbox primitive exists (RV-0029/0094 exemption). */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={aitIncluded}
                    onChange={(event) => setAitIncluded(event.target.checked)}
                  />
                  Include AIT
                </label>
              </dt>
              <dd className="flex items-center gap-2 tabular-nums">
                {aitIncluded ? (
                  <>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={aitPct}
                      onChange={(event) => setAitPct(event.target.value)}
                      aria-label="AIT percentage"
                      className="w-20 text-right"
                    />
                    <span className="text-muted-foreground">%</span>
                    <span>{formatNumber(aitAmount)}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Excluded</span>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-muted-foreground">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={vatIncluded}
                    onChange={(event) => setVatIncluded(event.target.checked)}
                  />
                  Include VAT
                </label>
              </dt>
              <dd className="flex items-center gap-2 tabular-nums">
                {vatIncluded ? (
                  <>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={vatPct}
                      onChange={(event) => setVatPct(event.target.value)}
                      aria-label="VAT percentage"
                      className="w-20 text-right"
                    />
                    <span className="text-muted-foreground">%</span>
                    <span>{formatNumber(vatAmount)}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Excluded</span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-iv-navy-700 dark:text-iv-navy-200">
              <dt>Grand total</dt>
              <dd className="tabular-nums">
                <CurrencyDisplay amount={grandTotal} currency={currencyCode} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* ── 2 · Buyer specification amendments (dedicated — never mixed into pricing, PRD §8) ── */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
          <CardTitle className="text-base">Buyer specification amendments</CardTitle>
          {amendedRows.length > 0 ? (
            <Badge variant="amber">
              {amendedRows.length} {amendedRows.length === 1 ? "item" : "items"}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          {amendedRows.length > 0 ? (
            <>
              {amendmentSummaryTable}
              <p className="text-xs text-muted-foreground">
                The buyer&apos;s original requirement list is never altered — your proposed changes
                travel as this separate amendment summary so the buyer can review them clearly.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No specification amendments proposed.</p>
          )}
        </CardContent>
      </Card>

      {/* ── 3 · Commercial terms (vendor editable) ‖ Buyer conditions (read only) — PRD §3 ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Commercial terms, notes &amp; addenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]">
            {/* Vendor editable */}
            <div className="space-y-6">
              {/* Reusable condition sets — device-local (ESC-QTN-CONDITION-SETS) */}
              <div className="space-y-3 rounded-md border border-border bg-secondary/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-none">Reusable condition sets</h3>
                  <Badge variant="neutral">
                    {sets.length} of {MAX_CONDITION_SETS} saved
                  </Badge>
                </div>
                {sets.length > 0 ? (
                  <ul className="space-y-2">
                    {sets.map((set) => (
                      <li key={set.name} className="flex flex-wrap items-center gap-2 text-sm">
                        {renamingSet === set.name ? (
                          <>
                            <Input
                              value={renameValue}
                              onChange={(event) => setRenameValue(event.target.value)}
                              aria-label={`New name for condition set ${set.name}`}
                              className="h-8 w-48"
                            />
                            <Button type="button" size="sm" onClick={() => renameSet(set.name)}>
                              Save name
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setRenamingSet(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="min-w-32 font-medium">{set.name}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => loadSet(set.name)}
                            >
                              Load
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateSet(set.name)}
                            >
                              Update with current
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRenamingSet(set.name);
                                setRenameValue(set.name);
                              }}
                            >
                              Rename
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              aria-label={`Delete condition set ${set.name}`}
                              onClick={() => deleteSet(set.name)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No saved sets yet — save your standard terms once and reuse them on every
                    quotation.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={newSetName}
                    onChange={(event) => setNewSetName(event.target.value)}
                    placeholder="Set name (e.g. Standard steel supply terms)"
                    aria-label="Name for a new condition set"
                    className="h-8 w-64"
                  />
                  <Button type="button" size="sm" onClick={saveSet} disabled={!canSaveSet}>
                    Save current as set
                  </Button>
                  {sets.length >= MAX_CONDITION_SETS ? (
                    <span className="text-xs text-muted-foreground">
                      Maximum {MAX_CONDITION_SETS} sets — delete one to save another.
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sets are kept on this device until account-level storage connects in the
                  integration phase.
                </p>
              </div>

              {/* Vendor condition groups */}
              <div className="divide-y divide-border">
                {CONDITION_GROUPS.map((group) => (
                  <section key={group.key} className="space-y-2 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-none">
                        {group.label}
                        {group.required ? (
                          <span className="ml-0.5 text-destructive" aria-hidden="true">
                            *
                          </span>
                        ) : null}
                      </h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addConditionRow(group.key)}
                      >
                        <Plus aria-hidden="true" /> Add row
                      </Button>
                    </div>
                    {group.hint ? (
                      <p className="text-xs text-muted-foreground">{group.hint}</p>
                    ) : null}
                    {conditions[group.key].length > 0 ? (
                      <ol className="space-y-2">
                        {conditions[group.key].map((value, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">
                              {index + 1}
                            </span>
                            <Input
                              value={value}
                              onChange={(event) =>
                                updateConditionRow(group.key, index, event.target.value)
                              }
                              aria-label={`${group.label} row ${index + 1}`}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              aria-label={`Remove ${group.label} row ${index + 1}`}
                              onClick={() => removeConditionRow(group.key, index)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted-foreground">No rows yet.</p>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* Buyer conditions — read only, side-by-side (existing granted fields only) */}
            <aside className="h-fit space-y-3 rounded-md border border-border bg-muted/60 p-4 lg:sticky lg:top-20">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold leading-none">Buyer conditions</h3>
                <Badge variant="neutral">Read only</Badge>
              </div>
              {buyerConditions.length > 0 ? (
                <dl className="space-y-3">
                  {buyerConditions.map((item) => (
                    <div key={item.label}>
                      <dt className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  The buyer did not state additional conditions on this RFQ.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Stated by the buyer on the RFQ — these cannot be edited here.
              </p>
            </aside>
          </div>
        </CardContent>
      </Card>

      {/* ── 4 · Specification compliance (frozen `spec_compliance_declaration`, required) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Specification compliance</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Owner ruling 2026-07-07: NOT marked mandatory in the UI. NOTE: the frozen submit surface
              (Doc-4E) marks `spec_compliance_declaration` REQUIRED — the optionality change needs an
              additive Doc-4E patch (ESC-QTN-COMPLIANCE-OPT); the server gate is unchanged until then. */}
          <FormField
            id="spec-compliance"
            label="Specification compliance declaration"
            description="Optional — declare how your offer complies with each requirement in the attached specification."
          >
            {/* Native textarea interim ([ESC-7B-TEXTAREA]). */}
            <textarea
              name="spec_compliance_declaration"
              value={compliance}
              onChange={(event) => setCompliance(event.target.value)}
              className={TEXTAREA_CLASS}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* ── 5 · Attachments (frozen `attachments_refs`) ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <QuotationAttachments attachments={attachments} />
        </CardContent>
      </Card>

      {/* ── 6 · Quotation submission details ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quotation submission details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <FormField
              id="submit-message"
              label="Message for submit"
              description="A short covering message sent with your quotation."
            >
              <textarea
                value={submitMessage}
                onChange={(event) => setSubmitMessage(event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="contact-person"
                label="Contact person"
                description="Defaults to your signed-in account — edits apply to this quotation only, never your profile."
              >
                <Input
                  value={contactPerson}
                  onChange={(event) => setContactPerson(event.target.value)}
                />
              </FormField>
              <FormField
                id="contact-number"
                label="Mobile number (optional)"
                description="Defaults from your account profile when connected — edits apply to this quotation only."
              >
                <Input
                  type="tel"
                  value={contactNumber}
                  onChange={(event) => setContactNumber(event.target.value)}
                />
              </FormField>
            </div>
            <FormField id="submit-remarks" label="Remarks (optional)">
              <Input value={remarks} onChange={(event) => setRemarks(event.target.value)} />
            </FormField>
            <p className="text-xs text-muted-foreground">
              These submission details connect with a later contract update — they are kept with
              your draft on this device for now.
            </p>
          </div>

          <div className="border-t border-border pt-4">
            {/* Submit action + presentation note removed from the page (owner PRD 2026-07-07 §6/§7);
                the submit action lives in the preview dialog's Confirm & submit. */}
            <QuotationSubmitPanel
              quota={quota}
              showSubmitAction={false}
              showPresentationNote={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 7 · Preview CTA → full-screen document preview dialog (PRD §5/§7) ── */}
      <Button type="button" className="w-full" size="lg" onClick={() => setPreviewOpen(true)}>
        <Eye aria-hidden="true" />
        Preview quotation details &amp; terms
      </Button>
      {draftNote ? (
        <p role="status" className="text-center text-xs text-muted-foreground">
          {draftNote}
        </p>
      ) : null}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[92dvh] w-[96vw] max-w-5xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Quotation preview</DialogTitle>
            <DialogDescription>
              Read-only — your quotation exactly as the buyer will receive it. Your own offer only;
              nothing about other vendors is shown.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-100 px-4 py-6 sm:px-6">
            <QuotationDocument model={documentModel} />
          </div>

          <DialogFooter className="items-center gap-3 border-t border-border px-6 py-4 sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {draftNote ??
                "Submitting connects in the integration phase — it consumes one quota unit and locks this revision."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Edit
                </Button>
              </DialogClose>
              <Button type="button" variant="secondary" onClick={saveDraft}>
                Save draft
              </Button>
              <Button type="button" variant="outline" onClick={() => printQuotationSheet("offer")}>
                <Printer aria-hidden="true" /> Print
              </Button>
              <Button type="button" disabled>
                Confirm &amp; submit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print sheets — portaled directly under <body>; shown ONLY during a scoped print
          (quotation-print.css). "offer" reuses the canonical QuotationDocument (no drift);
          "rfq" is a buyer-RFQ-only paper sheet from the granted snapshot. */}
      {mounted
        ? createPortal(
            <div className="iv-print-sheet iv-print-offer bg-white">
              <QuotationDocument model={documentModel} />
            </div>,
            document.body,
          )
        : null}
      {mounted
        ? createPortal(
            <div className="iv-print-sheet iv-print-rfq mx-auto w-full max-w-[840px] space-y-6 bg-white p-8 text-sm text-slate-900">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
                <div>
                  <p className="text-2xl font-bold tracking-widest text-slate-900">
                    REQUEST FOR QUOTATION
                  </p>
                  <p className="mt-1 text-sm text-slate-500">As received from the buyer</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{rfq?.buyer_org_name ?? "—"}</p>
                  <p className="mt-0.5 font-mono text-sm">{rfq?.human_ref ?? "—"}</p>
                </div>
              </header>

              <section className="space-y-1">
                <h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                  Subject
                </h3>
                <p>{rfq?.summary ?? "—"}</p>
                {rfq?.scope_text ? (
                  <p className="whitespace-pre-line break-words text-slate-700">{rfq.scope_text}</p>
                ) : null}
              </section>

              <section className="space-y-2">
                <h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                  Details
                </h3>
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Plant / site", value: rfq?.delivery_site ?? rfq?.delivery_location },
                    { label: "District", value: rfq?.delivery_district },
                    { label: "Quote deadline", value: rfq?.window_deadline_label },
                    { label: "Delivery required by", value: rfq?.delivery_date_label },
                    { label: "Contact person", value: rfq?.contact_person },
                    { label: "Phone", value: rfq?.contact_phone ?? rfq?.contact_whatsapp },
                    { label: "Email", value: rfq?.contact_email },
                  ].map((row) => (
                    <div key={row.label}>
                      <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                        {row.label}
                      </dt>
                      <dd className="mt-0.5">{row.value ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="space-y-2">
                <h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                  Item requirements
                </h3>
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">Buyer item requirements</caption>
                  <thead>
                    <tr className="border-b border-slate-900 text-left text-2xs font-semibold uppercase tracking-wide text-slate-500">
                      <th scope="col" className="py-2 pr-2 font-semibold">
                        Sl.
                      </th>
                      <th scope="col" className="py-2 pr-2 font-semibold">
                        Item name
                      </th>
                      <th scope="col" className="py-2 pr-2 font-semibold">
                        Required specification
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Required quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 pr-2 text-slate-500">1</td>
                      <td className="py-2 pr-2">{rfq?.item_name ?? "—"}</td>
                      <td className="py-2 pr-2">{rfq?.standards ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">
                        {[rfq?.quantity, rfq?.unit].filter(Boolean).join(" ") || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="space-y-2">
                <h3 className="border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                  Buyer conditions
                </h3>
                <dl className="grid grid-cols-2 gap-3">
                  {buyerConditions.map((item) => (
                    <div key={item.label}>
                      <dt className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                        {item.label}
                      </dt>
                      <dd className="mt-0.5">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                {rfq?.delivery_instructions ? (
                  <p className="text-slate-700">{rfq.delivery_instructions}</p>
                ) : null}
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
