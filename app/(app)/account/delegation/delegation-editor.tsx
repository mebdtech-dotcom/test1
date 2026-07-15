"use client";

// Delegation grant editor — P-ACC-12 (Doc-7E · T-SETTINGS · TB-NONE · SK-DETAIL). Client Component holding
// only ephemeral form state (Doc-7C §2.3). PRESENTATION-ONLY: create/suspend/reinstate/revoke all show
// honest interims and change nothing — M1 owns delegation grants.
//
// GATE PROVENANCE: this page carried a `⛔ ESC-IDN-DELEG-EXPIRY` page-gate (FE WBS · execution-board #4).
// That ESC was RESOLVED + REALIZED on 2026-07-09 — owner ruling `Doc-2_Patch_v1.0.7`, landed in W2-IDN-6.5
// (`c9e257f`: machine edge + sweep extension + real reinstate + no-resurrection tests; backend tracker
// §"[ESC-IDN-DELEG-EXPIRY]"). The spec's own carve-out is conditional — screen_specifications P-ACC-12
// reads "**Future:** `ESC-IDN-DELEG-EXPIRY` (reinstate action on resolution)" — so on resolution the
// reinstate leg is SANCTIONED, not coined. Built on the owner's ruling (2026-07-15) that the stale WBS ⛔
// no longer reflects the resolved gate. The FE WBS entry still needs the owner's flip.
//
// FIELD DISCIPLINE (invent nothing):
//  • Create → frozen `identity.create_delegation_grant.v1` (`representative_organization_id`,
//    `vendor_profile_id`, `permission_set`, `valid_from`, `valid_to`); lifecycle →
//    `identity.suspend_delegation_grant.v1` / `identity.reinstate_delegation_grant.v1` /
//    `identity.revoke_delegation_grant.v1` (Doc-4C §C9). No field here is outside that set.
//  • Scopes are chosen by FROZEN SLUG (Doc-2 §7 catalog), never a name-string (Invariant #10).
//  • The three frozen issue guards are MIRRORED, never re-decided (the server is authoritative —
//    `identity/domain/policies/delegation-grant.policy.ts`): `permission_set` is non-empty, ⊆ the
//    controlling org's held tenant slugs, never staff-space, never ownership-class. This UI simply does not
//    OFFER an undelegable scope; it grants nothing by showing it.
//  • Window sanity mirrors the Doc-6C §3.9 CHECK (`valid_to IS NULL OR valid_to > valid_from`) so a bad
//    window is a clean inline VALIDATION, not a DB constraint violation.
//  • Parties are OPAQUE IDS — the contract projects no display name and there is no sanctioned resolution
//    read, so this editor shows/accepts bare refs (the P-ACC-11 discipline).
//  • Lifecycle edges are the frozen §5.10 machine ONLY: `active → suspended`, `suspended → active`,
//    `{active,suspended} → revoked`. `revoked`/`expired` are TERMINAL — no resurrection (that is exactly
//    what W2-IDN-6.5's no-resurrection tests lock), so neither state offers an action.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Info, Lock } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { StatusChip } from "@/frontend/components/status-chip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/primitives/dialog";
import { DELEGABLE_PERMISSIONS, STATUS_META, type Grant } from "./delegation-seed";

type Props = { mode: "create" } | { mode: "edit"; grant: Grant };

/** Terminal §5.10 states — no edge leaves them (no resurrection). */
const TERMINAL: ReadonlyArray<Grant["status"]> = ["revoked", "expired"];

/**
 * Why the ownership class is absent from the picker (Doc-2 §5.10 guard). Phrased from the Doc-2 §7
 * Owner-only row itself ("Ownership transfer / org delete / verification submission") — the same anchor
 * `OWNERSHIP_CLASS_SLUGS` binds to — rather than stitched together from the catalog's `description`
 * sentences, which are per-permission copy and do not read as a list.
 */
const OWNERSHIP_CLASS_COPY = "Ownership transfer, organization delete, and verification submission";

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export function DelegationEditor(props: Props) {
  const router = useRouter();
  const isCreate = props.mode === "create";
  const grant = props.mode === "edit" ? props.grant : null;
  const isTerminal = grant !== null && TERMINAL.includes(grant.status);

  const initialRepresentative = grant?.representativeOrgRef ?? "";
  const initialProfile = grant?.vendorProfileRef ?? "";
  const initialFrom = grant?.validFrom ?? "";
  const initialTo = grant?.validTo ?? "";
  const initialSlugs = useMemo(() => new Set(grant?.permissionSet ?? []), [grant]);

  const [representative, setRepresentative] = useState(initialRepresentative);
  const [profile, setProfile] = useState(initialProfile);
  const [validFrom, setValidFrom] = useState(initialFrom);
  const [validTo, setValidTo] = useState(initialTo);
  const [slugs, setSlugs] = useState<Set<string>>(() => new Set(initialSlugs));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [interim, setInterim] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | "suspend" | "revoke">(null);

  const dirty =
    !isTerminal &&
    (representative !== initialRepresentative ||
      profile !== initialProfile ||
      validFrom !== initialFrom ||
      validTo !== initialTo ||
      !sameSet(slugs, initialSlugs));

  function toggle(slug: string) {
    setSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setInterim(null);
  }

  /** Mirrors the frozen create Validation Matrix (Doc-4C §C9) — the server re-validates regardless. */
  function validate(): boolean {
    const next: Record<string, string | undefined> = {};
    if (representative.trim().length === 0) {
      next["grant-representative"] = "Enter the representative organization's reference.";
    }
    if (profile.trim().length === 0) {
      next["grant-profile"] = "Enter the vendor profile's reference.";
    }
    if (validFrom.trim().length === 0) {
      next["grant-valid-from"] = "Choose the date this grant starts.";
    }
    // Doc-6C §3.9 `delegation_grants_validity_chk` — an open-ended window (no `valid_to`) is sane.
    if (validFrom && validTo && !(new Date(validTo).getTime() > new Date(validFrom).getTime())) {
      next["grant-valid-to"] = "The end date must be after the start date.";
    }
    // `permission_set` is required and non-empty (Doc-4C §C9).
    if (slugs.size === 0) {
      next["grant-scope"] = "Choose at least one permission to delegate.";
    }
    setErrors(next);
    return Object.values(next).every((v) => v === undefined);
  }

  function onSave() {
    if (!validate()) return;
    // Presentation-only: nothing is written (M1 owns grants) — honest interim.
    setInterim(
      isCreate
        ? "Issuing a grant isn’t wired in this preview — nothing was created."
        : "Grant changes aren’t wired in this preview — nothing was saved.",
    );
  }

  function onReset() {
    setRepresentative(initialRepresentative);
    setProfile(initialProfile);
    setValidFrom(initialFrom);
    setValidTo(initialTo);
    setSlugs(new Set(initialSlugs));
    setErrors({});
    setInterim(null);
  }

  function onLifecycle(action: "suspend" | "reinstate" | "revoke") {
    // Presentation-only: nothing transitions — honest interim.
    setInterim(`${LIFECYCLE_COPY[action].done} isn’t wired in this preview — nothing happened.`);
    setConfirm(null);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {interim ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{interim}</p>
        </div>
      ) : null}

      {isTerminal && grant ? (
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            This grant is {STATUS_META[grant.status].label.toLowerCase()} and can’t be changed or
            reinstated. Issue a new grant to delegate this authority again.
          </p>
        </div>
      ) : null}

      {/* Parties — opaque refs only (the contract projects no display name). */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="grant-representative"
            label="Representative organization"
            required
            description="The organization acting on your behalf, by its reference."
            error={errors["grant-representative"]}
          >
            <Input
              name="representative_organization_id"
              type="text"
              value={representative}
              onChange={(e) => {
                setRepresentative(e.target.value);
                setInterim(null);
              }}
              placeholder="0192f0a1-7c3d-7e21-…"
              className="font-mono text-xs"
              disabled={isTerminal}
              readOnly={isTerminal}
            />
          </FormField>
          <FormField
            id="grant-profile"
            label="Vendor profile"
            required
            description="The vendor profile this grant covers, by its reference."
            error={errors["grant-profile"]}
          >
            <Input
              name="vendor_profile_id"
              type="text"
              value={profile}
              onChange={(e) => {
                setProfile(e.target.value);
                setInterim(null);
              }}
              placeholder="0192f0a1-7c3d-7e21-…"
              className="font-mono text-xs"
              disabled={isTerminal}
              readOnly={isTerminal}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Scope — frozen slugs, ownership class never offered (Doc-2 §5.10 guard). */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Scope
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <fieldset disabled={isTerminal}>
            <legend className="sr-only">Permissions this grant delegates</legend>
            <ul className="divide-y divide-border">
              {DELEGABLE_PERMISSIONS.map((p) => {
                const id = `scope-${p.slug}`;
                return (
                  <li key={p.slug} className="flex items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      id={id}
                      checked={slugs.has(p.slug)}
                      onChange={() => toggle(p.slug)}
                      disabled={isTerminal}
                      className="mt-0.5 size-4 shrink-0 accent-iv-brand-500"
                    />
                    <label htmlFor={id} className="min-w-0 cursor-pointer">
                      <span className="block text-sm font-medium text-foreground">
                        {p.description}
                      </span>
                      <span className="block font-mono text-xs text-muted-foreground">
                        {p.slug}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          {errors["grant-scope"] ? (
            <p className="text-sm text-destructive">{errors["grant-scope"]}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            A grant delegates authority you already hold — it never creates it, so you can only
            delegate permissions your organization holds. {OWNERSHIP_CLASS_COPY} can never be
            delegated.
          </p>
        </CardContent>
      </Card>

      {/* Validity window. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Validity
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="grant-valid-from"
            label="Starts"
            required
            error={errors["grant-valid-from"]}
          >
            <Input
              name="valid_from"
              type="date"
              value={validFrom}
              onChange={(e) => {
                setValidFrom(e.target.value);
                setInterim(null);
              }}
              disabled={isTerminal}
              readOnly={isTerminal}
            />
          </FormField>
          <FormField
            id="grant-valid-to"
            label="Ends"
            description="Leave empty for an open-ended grant."
            error={errors["grant-valid-to"]}
          >
            <Input
              name="valid_to"
              type="date"
              value={validTo}
              onChange={(e) => {
                setValidTo(e.target.value);
                setInterim(null);
              }}
              disabled={isTerminal}
              readOnly={isTerminal}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Lifecycle — the frozen §5.10 edges only, per current state. */}
      {!isCreate && grant && !isTerminal ? (
        <Card className={grant.status === "suspended" ? undefined : "bg-iv-danger-subtle"}>
          <CardHeader>
            <CardTitle as="h2" className="flex items-center gap-2 text-base">
              <AlertTriangle aria-hidden="true" className="size-4 text-iv-danger-muted" />
              Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Current state</span>
              <StatusChip
                label={STATUS_META[grant.status].label}
                tone={STATUS_META[grant.status].tone}
              />
            </div>

            {/* `active → suspended` — reversible, so no irreversible warning. */}
            {grant.status === "active" ? (
              <LifecycleRow
                title="Suspend grant"
                detail="Pauses the delegated authority. You can reinstate it later."
                action={
                  <Button type="button" variant="outline" onClick={() => setConfirm("suspend")}>
                    Suspend
                  </Button>
                }
              />
            ) : null}

            {/* `suspended → active` — sanctioned by ESC-IDN-DELEG-EXPIRY's resolution (see header). */}
            {grant.status === "suspended" ? (
              <LifecycleRow
                title="Reinstate grant"
                detail="Restores the delegated authority to active."
                action={
                  <Button type="button" onClick={() => onLifecycle("reinstate")}>
                    Reinstate
                  </Button>
                }
              />
            ) : null}

            {/* `{active,suspended} → revoked` — TERMINAL, so it is irreversible-warned. */}
            <LifecycleRow
              title="Revoke grant"
              detail="Ends the delegated authority for good. A revoked grant can’t be reinstated."
              action={
                <Button type="button" variant="destructive" onClick={() => setConfirm("revoke")}>
                  Revoke
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Save bar. Create always shows a save; edit shows it when dirty. */}
      {!isTerminal && (isCreate || dirty) ? (
        <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            {isCreate
              ? "Set the parties, scope and dates, then issue the grant."
              : "You have unsaved changes."}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={isCreate ? () => router.push("/account/delegation") : onReset}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSave}>
              {isCreate ? "Issue grant" : "Save changes"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Terminal grant: no save bar — offer a way back. */}
      {isTerminal ? (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/account/delegation")}
          >
            Back to delegation
          </Button>
        </div>
      ) : null}

      {/* Suspend / revoke confirm (UX §2 — destructive actions confirm explicitly). */}
      <Dialog open={confirm !== null} onOpenChange={(open) => (open ? null : setConfirm(null))}>
        <DialogContent>
          {confirm ? (
            <>
              <DialogHeader>
                <DialogTitle>{LIFECYCLE_COPY[confirm].title}</DialogTitle>
                <DialogDescription>{LIFECYCLE_COPY[confirm].body}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setConfirm(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={confirm === "revoke" ? "destructive" : "primary"}
                  onClick={() => onLifecycle(confirm)}
                >
                  {LIFECYCLE_COPY[confirm].cta}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const LIFECYCLE_COPY = {
  suspend: {
    title: "Suspend this grant?",
    body: "The delegated authority pauses immediately. You can reinstate the grant later.",
    cta: "Suspend grant",
    done: "Suspending a grant",
  },
  reinstate: {
    title: "Reinstate this grant?",
    body: "The delegated authority becomes active again.",
    cta: "Reinstate grant",
    done: "Reinstating a grant",
  },
  revoke: {
    title: "Revoke this grant?",
    body: "The delegated authority ends for good. A revoked grant can’t be reinstated — issue a new grant instead. This can’t be undone.",
    cta: "Revoke grant",
    done: "Revoking a grant",
  },
} as const;

function LifecycleRow({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
      <div className="sm:shrink-0">{action}</div>
    </div>
  );
}
