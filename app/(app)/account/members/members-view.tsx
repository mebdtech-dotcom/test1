"use client";

// Members list + management — P-ACC-06 (Doc-7E · T-LISTING). Client Component holding only ephemeral
// filter/dialog state (Doc-7C §2.3). PRESENTATION-ONLY: suspending, reinstating and removing all show
// honest interims and change nothing — the server owns the §5.2 membership state machine.
//
// FIELD DISCIPLINE (invent nothing):
//  • Suspend / reinstate map to the frozen `identity.set_membership_status.v1` (Doc-4C §C6,
//    `can_manage_users`): `target_status ∈ {suspended, active}`; state `active ⇄ suspended` (Doc-2 §5.2).
//  • Remove maps to `identity.remove_member.v1` (Doc-4C §C6): `active|suspended → removed` (terminal).
//  • Membership states + Org Roles are the frozen sets (Doc-2 §5.2 / §7; Invariant #2 — Org Role is a
//    distinct dimension from Platform Participation). Invited members are managed from the Invite page
//    (revoke_invitation, P-ACC-07) — not this page's contracts.
//  • LAST OWNER PROTECTION (Architecture §5.5): the sole active Owner cannot be suspended or removed —
//    those row actions are disabled here (the server also enforces it).
//  • Management is gated by a WIRED role read (`can_manage_users`); hiding an action is convenience only.
import { useMemo, useState } from "react";
import { Info, MoreHorizontal, Search, Users } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/primitives/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";

type MemberStatus = "active" | "suspended" | "invited";
type OrgRole = "Owner" | "Director" | "Manager" | "Officer";

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: OrgRole;
  status: MemberStatus;
  joined: string;
  /** The sole active Owner — protected from suspend/remove (Last Owner Protection). */
  soleOwner?: boolean;
}

// Presentation seed (a wired build resolves these from `list_members`).
const MEMBERS: Member[] = [
  {
    id: "m1",
    name: "Anisur Rahman",
    email: "anisur@padmavalve.com.bd",
    initials: "AR",
    role: "Owner",
    status: "active",
    joined: "15 Jan 2024",
    soleOwner: true,
  },
  {
    id: "m2",
    name: "Farhana Akter",
    email: "farhana@padmavalve.com.bd",
    initials: "FA",
    role: "Director",
    status: "active",
    joined: "02 Mar 2024",
  },
  {
    id: "m3",
    name: "Kamal Hossain",
    email: "kamal@padmavalve.com.bd",
    initials: "KH",
    role: "Manager",
    status: "active",
    joined: "20 Jun 2024",
  },
  {
    id: "m4",
    name: "Nasrin Sultana",
    email: "nasrin@padmavalve.com.bd",
    initials: "NS",
    role: "Officer",
    status: "suspended",
    joined: "11 Feb 2025",
  },
  {
    id: "m5",
    name: "Tania Islam",
    email: "tania@padmavalve.com.bd",
    initials: "TI",
    role: "Officer",
    status: "invited",
    joined: "28 Jun 2026",
  },
];

const STATUS_META: Record<MemberStatus, { label: string; tone: StatusTone }> = {
  active: { label: "Active", tone: "success" },
  suspended: { label: "Suspended", tone: "warning" },
  invited: { label: "Invited", tone: "info" },
};

const ROLE_OPTIONS: Array<OrgRole | "all"> = ["all", "Owner", "Director", "Manager", "Officer"];
const STATUS_OPTIONS: Array<MemberStatus | "all"> = ["all", "active", "suspended", "invited"];

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function MembersView() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<OrgRole | "all">("all");
  const [status, setStatus] = useState<MemberStatus | "all">("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [removeReason, setRemoveReason] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMBERS.filter((m) => {
      if (role !== "all" && m.role !== role) return false;
      if (status !== "all" && m.status !== status) return false;
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [query, role, status]);

  function act(message: string) {
    // Presentation-only: nothing is written — honest interim.
    setNotice(message);
  }

  function confirmRemove() {
    if (removeTarget)
      act(`Removing “${removeTarget.name}” isn’t wired in this preview — nothing happened.`);
    setRemoveTarget(null);
    setRemoveReason("");
  }

  return (
    <div className="space-y-4">
      {notice ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{notice}</p>
        </div>
      ) : null}

      {/* Toolbar — search + role/status filters. */}
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
            placeholder="Search members"
            aria-label="Search members"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="filter-role">
            Filter by role
          </label>
          <select
            id="filter-role"
            className={selectClass}
            value={role}
            onChange={(e) => setRole(e.target.value as OrgRole | "all")}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All roles" : r}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="filter-status">
            Filter by status
          </label>
          <select
            id="filter-status"
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as MemberStatus | "all")}
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
          icon={<Users aria-hidden="true" />}
          title="No members match your filters"
          description="Try clearing the search or changing the role and status filters."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <caption className="sr-only">Organization members</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Member
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Joined
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs">{m.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{m.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{m.role}</td>
                    <td className="px-4 py-3">
                      <StatusChip
                        label={STATUS_META[m.status].label}
                        tone={STATUS_META[m.status].tone}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {m.joined}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MemberActions member={m} onAct={act} onRemove={() => setRemoveTarget(m)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PaginationControl hasMore={false} hasPrevious={false} />

      {/* Remove-member confirm (Doc-7E dialog; destructive). */}
      <Dialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this member?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{removeTarget?.name}</span> will lose
              access to this organization. Their history is retained and they can be invited back.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <label htmlFor="remove-reason" className="block text-sm font-medium text-foreground">
              Reason <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="remove-reason"
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="e.g. Left the company"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmRemove}>
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberActions({
  member,
  onAct,
  onRemove,
}: {
  member: Member;
  onAct: (message: string) => void;
  onRemove: () => void;
}) {
  // Invited members are managed from the Invite page (revoke_invitation) — not this page's contracts.
  if (member.status === "invited") {
    return <span className="text-xs text-muted-foreground">Awaiting acceptance</span>;
  }

  const protectedOwner = member.soleOwner === true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${member.name}`}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {member.status === "active" ? (
          <DropdownMenuItem
            disabled={protectedOwner}
            onSelect={() =>
              onAct(`Suspending “${member.name}” isn’t wired in this preview — nothing happened.`)
            }
          >
            Suspend
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() =>
              onAct(`Reinstating “${member.name}” isn’t wired in this preview — nothing happened.`)
            }
          >
            Reinstate
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          disabled={protectedOwner}
          className={cn(!protectedOwner && "text-iv-danger-muted focus:text-iv-danger-muted")}
          onSelect={onRemove}
        >
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
