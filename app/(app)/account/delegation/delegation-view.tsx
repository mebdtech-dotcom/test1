"use client";

// Delegation grants list — P-ACC-11 (Doc-7E · T-LISTING). Client Component holding only ephemeral filter
// state (Doc-7C §2.3). PRESENTATION-ONLY: it reads and mutates nothing.
//
// FIELD DISCIPLINE (invent nothing) — reworked per RV-0059:
//  • Rows map to the frozen `identity.list_delegation_grants.v1` DTO, which projects OPAQUE IDS ONLY:
//    `{ delegation_grant_id, controlling_organization_id, representative_organization_id,
//    vendor_profile_id, permission_set, valid_from, valid_to, status }` (Doc-4C §C9). It projects NO
//    display names, so this page shows the OPAQUE refs (mono) — never a resolved org/profile name (there
//    is no sanctioned resolution read to cite). Same discipline as the engagement counterparty precedent
//    (P-BUY-19/20): "opaque party ref only — no display name is projected."
//  • Grant states are the FULL frozen §5.10 set: `draft → active → suspended ⇄ active → revoked` /
//    `active → expired` (Doc-2 §5.10:581–588). `draft` is the pre-active state (controller-side, before
//    grant); every state has a chip mapping so a wired list never renders an unmapped status.
//  • This page is LIST-ONLY (`list_delegation_grants` + open); issuing/suspending/revoking a grant is the
//    grant editor's job (P-ACC-12) — no mutation action is offered here.
//
// The rows/states/labels live in `delegation-seed.ts`, shared with the P-ACC-12 editor (one seed, no drift).
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, Share2 } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { StatusChip } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { formatDate } from "@/frontend/components/format";
import { GRANTS, STATUS_META, type GrantStatus } from "./delegation-seed";

const STATUS_OPTIONS: Array<GrantStatus | "all"> = [
  "all",
  "draft",
  "active",
  "suspended",
  "revoked",
  "expired",
];

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Ref({ value }: { value: string }) {
  return <span className="font-mono text-xs text-muted-foreground">{value}</span>;
}

export function DelegationView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<GrantStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GRANTS.filter((g) => {
      if (status !== "all" && g.status !== status) return false;
      if (
        q &&
        !g.controllingOrgRef.toLowerCase().includes(q) &&
        !g.representativeOrgRef.toLowerCase().includes(q) &&
        !g.vendorProfileRef.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [query, status]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Grants are shown by their organization and profile references. Display names aren’t part of
        this list.
      </p>

      {/* Toolbar — search + status filter. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference"
            aria-label="Search grants by reference"
            className="pl-9"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="filter-status">
            Filter by status
          </label>
          <select
            id="filter-status"
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as GrantStatus | "all")}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Share2 aria-hidden="true" />}
          title="No delegation grants"
          description="Issue a grant to let another organization act on a vendor profile on your behalf."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] border-collapse text-sm">
              <caption className="sr-only">Delegation grants</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Delegator (controlling org)
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Delegatee (representative org)
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Scope (vendor profile)
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Expiry
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr
                    key={g.grantId}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <Ref value={g.controllingOrgRef} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Ref value={g.representativeOrgRef} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Ref value={g.vendorProfileRef} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip
                        label={STATUS_META[g.status].label}
                        tone={STATUS_META[g.status].tone}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {/* `valid_to` is nullable — an open-ended grant has no expiry to show. */}
                      {g.validTo === null ? "—" : formatDate(g.validTo)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/account/delegation/${g.grantId}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Open
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PaginationControl hasMore={false} hasPrevious={false} />
    </div>
  );
}
