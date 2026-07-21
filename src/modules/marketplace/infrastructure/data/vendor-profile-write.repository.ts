// M2 infrastructure (PRIVATE) — the `marketplace.vendor_profiles` WRITE repository (W3-MKT-3).
// This is M2 writing its OWN schema (allowed); other modules reach these writes only via the M2
// contracts surface, never by importing infrastructure (REPOSITORY_STRUCTURE §3).
//
// TENANCY (Invariant #5, belt-and-braces): every statement is BOTH (a) RLS-scoped — it must run on
// the executor whose `app.active_org` GUC was server-set by `withActiveOrgContext` (the
// `vendor_profiles_org_write/org_modify` policies re-verify `controlling_organization_id =
// app.active_org`) — AND (b) explicitly filtered by the SERVER-RESOLVED `activeOrgId` in the WHERE/
// data clauses. The explicit filter is the app-layer authorization the platform treats as primary
// (CLAUDE.md §2: authz in the app layer; RLS = defense-in-depth backstop); the org id is the
// server-validated context, NEVER client input.
//
// D7 division of labour: this repository OWNS the SQL and returns DATA (created/updated rows +
// old/new audited field sets). It knows NOTHING of audit policy, event policy, or slug/authz policy —
// the command decides those (REFERENCE_Audited_Write_Pattern_v1.0 rules 2/3).

import { Prisma, prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type {
  OwnVendorProfileView,
  VendorCapabilityFlags,
  VendorGeography,
} from "../../contracts/types";

/** The audited vendor-profile field set (Doc-2 §10.3 mutable attributes) — the audit `old/new` shape. */
export interface VendorProfileFieldSet {
  name: string;
  slug: string;
  capabilityFlags: VendorCapabilityFlags;
  geography: VendorGeography;
  vendorTypePreset: string | null;
}

type VendorProfileRow = {
  id: string;
  humanRef: string;
  controllingOrganizationId: string;
  name: string;
  slug: string;
  canSupply: boolean;
  canService: boolean;
  canFabricate: boolean;
  canConsult: boolean;
  vendorTypePreset: string | null;
  country: string | null;
  division: string | null;
  district: string | null;
  industrialZone: string | null;
  claimState: string;
  status: string;
  updatedAt: Date;
};

function fieldSetOf(row: VendorProfileRow): VendorProfileFieldSet {
  return {
    name: row.name,
    slug: row.slug,
    capabilityFlags: {
      canSupply: row.canSupply,
      canService: row.canService,
      canFabricate: row.canFabricate,
      canConsult: row.canConsult,
    },
    geography: {
      country: row.country,
      division: row.division,
      district: row.district,
      industrialZone: row.industrialZone,
    },
    vendorTypePreset: row.vendorTypePreset,
  };
}

function ownViewOf(row: VendorProfileRow): OwnVendorProfileView {
  return {
    vendorProfileId: row.id,
    humanRef: row.humanRef,
    name: row.name,
    slug: row.slug,
    capabilityFlags: {
      canSupply: row.canSupply,
      canService: row.canService,
      canFabricate: row.canFabricate,
      canConsult: row.canConsult,
    },
    geography: {
      country: row.country,
      division: row.division,
      district: row.district,
      industrialZone: row.industrialZone,
    },
    vendorTypePreset: row.vendorTypePreset,
    claimState: row.claimState,
    status: row.status,
    controllingOrganizationId: row.controllingOrganizationId,
    updatedAt: row.updatedAt,
  };
}

/** Input to the create INSERT (the command has already validated/authorized/derived these). */
export interface CreateVendorProfileWriteInput {
  humanRef: string;
  name: string;
  slug: string;
  capabilityFlags: VendorCapabilityFlags;
  geography: VendorGeography;
  vendorTypePreset: string | null;
}

/**
 * Outcome of the create INSERT. `org_conflict` = the active org already controls a live profile
 * (`vendor_profiles_org_live_uq` — Doc-2 §10.3 one-profile-per-org, mapped by the command to the
 * frozen `marketplace_vendor_already_exists` CONFLICT). `slug_conflict` = the derived slug lost a
 * uniqueness race (`vendor_profiles_slug_live_uq`) — the command retries with a fresh suffix.
 */
export type CreateVendorProfileWrite =
  | { outcome: "created"; id: string; updatedAt: Date; newValue: VendorProfileFieldSet }
  | { outcome: "org_conflict" }
  | { outcome: "slug_conflict" };

/**
 * INSERT one `vendor_profiles` row for the ACTIVE org (direct registration — Doc-2 §5.3: enters
 * `claim_state='claimed'`, `status='active'`, `visibility='public'`; Doc-5D Pass-2 BR-M-02: never
 * `seeded`). `activeOrgId`/`actorUserId` are the SERVER-RESOLVED context; the RLS `WITH CHECK`
 * re-verifies the org on the same executor.
 */
export async function insertVendorProfile(
  activeOrgId: string,
  actorUserId: string,
  input: CreateVendorProfileWriteInput,
  db: DbExecutor = prisma,
): Promise<CreateVendorProfileWrite> {
  const id = uuidv7();
  try {
    const row = await db.vendorProfile.create({
      data: {
        id,
        humanRef: input.humanRef,
        controllingOrganizationId: activeOrgId, // server-resolved; RLS WITH CHECK re-verifies
        name: input.name,
        slug: input.slug,
        canSupply: input.capabilityFlags.canSupply,
        canService: input.capabilityFlags.canService,
        canFabricate: input.capabilityFlags.canFabricate,
        canConsult: input.capabilityFlags.canConsult,
        vendorTypePreset: input.vendorTypePreset,
        country: input.geography.country,
        division: input.geography.division,
        district: input.geography.district,
        industrialZone: input.geography.industrialZone,
        claimState: "claimed", // Doc-2 §5.3 direct registration (BR-M-02)
        status: "active",
        visibility: "public",
        createdBy: actorUserId,
        updatedBy: actorUserId,
      },
    });
    return { outcome: "created", id: row.id, updatedAt: row.updatedAt, newValue: fieldSetOf(row) };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Which partial-unique lost the race? Prisma cannot name a raw-SQL partial index reliably, so
      // re-probe: if the active org already controls a live profile it is the one-per-org conflict;
      // otherwise the slug race. Same-transaction reads — no TOCTOU widening.
      const orgRow = await db.vendorProfile.findFirst({
        where: { controllingOrganizationId: activeOrgId, deletedAt: null },
        select: { id: true },
      });
      if (orgRow !== null) return { outcome: "org_conflict" };
      return { outcome: "slug_conflict" };
    }
    throw e;
  }
}

/** True iff the ACTIVE org already controls a live vendor profile (Doc-2 §10.3 one-per-org guard). */
export async function activeOrgHasVendorProfile(
  activeOrgId: string,
  db: DbExecutor = prisma,
): Promise<boolean> {
  const row = await db.vendorProfile.findFirst({
    where: { controllingOrganizationId: activeOrgId, deletedAt: null },
    select: { id: true },
  });
  return row !== null;
}

/** True iff `slug` is already held live (issuance pre-check; the partial-unique is the real gate). */
export async function isVendorSlugTaken(slug: string, db: DbExecutor = prisma): Promise<boolean> {
  const live = await db.vendorProfile.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true },
  });
  if (live !== null) return true;
  // Never-reuse (Doc-2 v1.0.5 D2-04.5 / Invariant 8): a migrated-away slug is permanently reserved.
  const retired = await db.vendorSlugHistory.findFirst({
    where: { oldSlug: slug },
    select: { id: true },
  });
  return retired !== null;
}

/** Writable columns for the update (partial — an omitted key leaves the column unchanged). */
export interface UpdateVendorProfileWriteInput {
  name?: string;
  capabilityFlags?: Partial<VendorCapabilityFlags>;
  geography?: Partial<VendorGeography>;
  vendorTypePreset?: string | null;
  /** Optimistic-concurrency token (the prior `updated_at`); compared in-app (D7 idiom). */
  expectedUpdatedAt: Date;
}

/** Outcome of the update WRITE (attribute edit — Doc-4D §D4: not a §5.3 transition, slug untouched). */
export type UpdateVendorProfileWrite =
  | {
      outcome: "updated";
      id: string;
      updatedAt: Date;
      oldValue: VendorProfileFieldSet;
      newValue: VendorProfileFieldSet;
    }
  | { outcome: "not_found" }
  | { outcome: "conflict" };

/**
 * Partial-update the ACTIVE org's `vendor_profiles` row `{id}` with optimistic concurrency on
 * `updated_at` (Doc-5D §4.5). The explicit `controllingOrganizationId = activeOrgId` filter makes a
 * cross-tenant `{id}` indistinguishable from an absent one (`not_found` — the §3.6/R9 collapse);
 * RLS backstops the same predicate.
 */
export async function updateVendorProfileById(
  vendorProfileId: string,
  activeOrgId: string,
  actorUserId: string,
  input: UpdateVendorProfileWriteInput,
  db: DbExecutor = prisma,
): Promise<UpdateVendorProfileWrite> {
  const existing = await db.vendorProfile.findFirst({
    where: { id: vendorProfileId, controllingOrganizationId: activeOrgId, deletedAt: null },
  });
  if (existing === null) return { outcome: "not_found" };

  if (existing.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()) {
    return { outcome: "conflict" };
  }

  const oldValue = fieldSetOf(existing);
  const row = await db.vendorProfile.update({
    where: { id: existing.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.capabilityFlags?.canSupply !== undefined
        ? { canSupply: input.capabilityFlags.canSupply }
        : {}),
      ...(input.capabilityFlags?.canService !== undefined
        ? { canService: input.capabilityFlags.canService }
        : {}),
      ...(input.capabilityFlags?.canFabricate !== undefined
        ? { canFabricate: input.capabilityFlags.canFabricate }
        : {}),
      ...(input.capabilityFlags?.canConsult !== undefined
        ? { canConsult: input.capabilityFlags.canConsult }
        : {}),
      ...(input.geography?.country !== undefined ? { country: input.geography.country } : {}),
      ...(input.geography?.division !== undefined ? { division: input.geography.division } : {}),
      ...(input.geography?.district !== undefined ? { district: input.geography.district } : {}),
      ...(input.geography?.industrialZone !== undefined
        ? { industrialZone: input.geography.industrialZone }
        : {}),
      ...(input.vendorTypePreset !== undefined ? { vendorTypePreset: input.vendorTypePreset } : {}),
      updatedBy: actorUserId,
    },
  });
  return {
    outcome: "updated",
    id: row.id,
    updatedAt: row.updatedAt,
    oldValue,
    newValue: fieldSetOf(row),
  };
}

/**
 * The CONTROLLING-ORG single read (`get_vendor_profile.v1` User leg — Doc-5D Pass-2 §4.4). Lookup by
 * `id` XOR `humanRef` (the command validates exactly-one). Absent / cross-tenant / soft-deleted all
 * return `null` — the uniform non-disclosure collapse.
 */
export async function findOwnVendorProfile(
  key: { vendorProfileId?: string; humanRef?: string },
  activeOrgId: string,
  db: DbExecutor = prisma,
): Promise<OwnVendorProfileView | null> {
  const row = await db.vendorProfile.findFirst({
    where: {
      ...(key.vendorProfileId !== undefined ? { id: key.vendorProfileId } : {}),
      ...(key.humanRef !== undefined ? { humanRef: key.humanRef } : {}),
      controllingOrganizationId: activeOrgId,
      deletedAt: null,
    },
  });
  return row === null ? null : ownViewOf(row);
}
