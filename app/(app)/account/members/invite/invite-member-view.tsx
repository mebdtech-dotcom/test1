"use client";

// Invite member — P-ACC-07 (Doc-7E · T-SETTINGS). Client Component holding only ephemeral form/dialog
// state (Doc-7C §2.3). PRESENTATION-ONLY: inviting and revoking both show honest interims and change
// nothing — the server owns the §5.2 membership state machine.
//
// FIELD DISCIPLINE (invent nothing):
//  • Invite maps to the frozen `identity.invite_member.v1` (Doc-4C §C6, `can_manage_users`): request
//    `email` (required) · `role_id` (required, REF → identity.roles, same org) · `department` (optional);
//    state `→ invited` (Doc-2 §5.2). ORG MEMBERS ONLY — never vendor invitations (engine-only, IA §4.9).
//  • Revoke maps to `identity.revoke_invitation.v1` (Doc-4C §C6): `membership_id` (+ `updated_at`);
//    `invited → removed`; valid only on a not-yet-accepted invite.
//  • Roles are frozen Org-Role bundles (Doc-2 §7; Owner is assigned via succession/`transfer_ownership`,
//    not minted through an invite — so it is not an invitable role here). `role_id` is a server REF; the
//    seed ids stand in for `list_roles`.
//  • Seats are a NUMERIC entitlement (Invariant #10 — never a plan-name); a real QUOTA error links to
//    Billing.
import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Info, Mail, Trash2 } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";

// Invitable roles — seed stand-ins for `list_roles` (role_id is a server REF). Owner excluded (succession
// only). A wired build resolves the org's roles, including any custom ones.
const INVITE_ROLES = [
  { id: "role_director", name: "Director" },
  { id: "role_manager", name: "Manager" },
  { id: "role_officer", name: "Officer" },
];

const SEATS = { used: 8, total: 25 }; // numeric entitlement (Inv #10) — presentation seed

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invited: string;
}

const PENDING_SEED: PendingInvite[] = [
  { id: "inv1", email: "rafiq@padmavalve.com.bd", role: "Officer", invited: "28 Jun 2026" },
  { id: "inv2", email: "sadia@padmavalve.com.bd", role: "Manager", invited: "30 Jun 2026" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InviteMemberView() {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState<{ email?: string; role?: string }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<PendingInvite | null>(null);

  // Pending invites are seed-only; revoking removes nothing (presentation) but we reflect the request
  // by hiding the row so the interaction reads truthfully in the preview.
  const [revokedIds, setRevokedIds] = useState<string[]>([]);
  const pending = useMemo(
    () => PENDING_SEED.filter((p) => !revokedIds.includes(p.id)),
    [revokedIds],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: { email?: string; role?: string } = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (roleId === "") next.role = "Choose a role for this member.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // Presentation-only: nothing is sent (the server owns the invite) — honest interim.
    setNotice(`Inviting ${email.trim()} isn’t wired in this preview — no invitation was sent.`);
  }

  function confirmRevoke() {
    if (revokeTarget) {
      setRevokedIds((prev) => [...prev, revokeTarget.id]);
      setNotice(
        `Revoking the invitation for ${revokeTarget.email} isn’t wired in this preview — nothing was sent.`,
      );
    }
    setRevokeTarget(null);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {notice ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{notice}</p>
        </div>
      ) : null}

      {/* Invite form. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="flex items-center gap-2 text-base">
            <Mail aria-hidden="true" className="size-4 text-iv-navy-700" />
            Invite a member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <FormField
              id="invite-email"
              label="Email address"
              required
              description="We’ll email an invitation to join your organization."
              error={errors.email}
            >
              <Input
                name="email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </FormField>

            <FormField
              id="invite-role"
              label="Role"
              required
              description="Sets what this member can do. Ownership is transferred separately."
              error={errors.role}
            >
              <select
                id="invite-role"
                name="role"
                className={selectClass}
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="" disabled>
                  Select a role…
                </option>
                {INVITE_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="invite-department"
              label="Department"
              description="Optional — helps organize larger teams."
            >
              <Input
                name="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Procurement"
              />
            </FormField>

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {SEATS.used} of {SEATS.total} seats used ·{" "}
                <Link
                  href="/account/billing"
                  className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Manage seats
                </Link>
              </p>
              <Button type="submit">Send invitation</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pending invitations. */}
      <section aria-labelledby="pending-heading" className="space-y-3">
        <h2 id="pending-heading" className="text-base font-semibold text-foreground">
          Pending invitations
        </h2>
        {pending.length === 0 ? (
          <EmptyState
            icon={<Mail aria-hidden="true" />}
            title="No pending invitations"
            description="Invitations you send will appear here until they’re accepted."
          />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <caption className="sr-only">Pending invitations</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Role
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Invited
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{p.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-foreground">{p.role}</td>
                      <td className="px-4 py-3">
                        <StatusChip label={`Invited · ${p.invited}`} tone="info" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-iv-danger-muted hover:text-iv-danger-muted"
                          onClick={() => setRevokeTarget(p)}
                        >
                          <Trash2 aria-hidden="true" />
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* Revoke-invitation confirm. */}
      <Dialog open={revokeTarget !== null} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke this invitation?</DialogTitle>
            <DialogDescription>
              The invitation for{" "}
              <span className="font-semibold text-foreground">{revokeTarget?.email}</span> will be
              cancelled. You can invite them again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRevokeTarget(null)}>
              Keep invitation
            </Button>
            <Button type="button" variant="destructive" onClick={confirmRevoke}>
              Revoke invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
