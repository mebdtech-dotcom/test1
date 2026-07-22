// M6 application (PRIVATE) — the BC-COMM-4 Support-Ticket read queries (Doc-4H §HB-4.5; Doc-5H §7.4).
// Orchestration only; owns NO state. Reads are UNAUDITED (Doc-4A §17.1), side-effect-free, emit no
// event. Scope is enforced by RLS on the caller's tx (User own-org / Staff all) — an out-of-scope get
// resolves to `null` ⇒ NOT_FOUND (R10 non-disclosure, byte-identical to a genuine absence); list never
// enumerates out-of-scope tickets.

import { prisma, type DbExecutor } from "@/shared/db";
import { configValueQuery, type ConfigValueQuery } from "@/modules/core/contracts";
import {
  getTicketWithMessages,
  listTicketsPage,
} from "../../infrastructure/data/support-ticket.repository";
import { policyIntegerValue } from "../../domain/value-objects/policy-duration";
import type { SupportTicketStatusValue } from "../../domain/state-machines/support-ticket.state-machine";
import type {
  GetTicketResult,
  ListTicketsInput,
  ListTicketsOutcome,
  TicketListItem,
} from "../../contracts/types";

// The full Doc-4A §18.2 reference form for the page-size bound (Doc-3 v1.5; read via M0, never a literal).
const LIST_PAGE_SIZE_MAX_KEY =
  "core.system_configuration.communication.list_page_size_max" as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TICKET_STATUSES: ReadonlySet<string> = new Set(["open", "in_progress", "resolved", "closed"]);

/** `comm.get_ticket.v1` (Doc-4H §HB-4.5) — the single-ticket read (+ messages), scoped in the APP LAYER
 *  (`scopeOrgId` = User own-org / `null` = Staff all). Absent / out-of-scope ⇒ `found: false` (the wire
 *  `404` collapse, indistinguishable from genuine absence — R10). */
export async function getTicket(
  ticketId: string,
  scopeOrgId: string | null,
  db: DbExecutor = prisma,
): Promise<GetTicketResult> {
  // SYNTAX-invalid id can never resolve to a live ticket ⇒ the same non-disclosure `found: false`.
  if (typeof ticketId !== "string" || !UUID_PATTERN.test(ticketId)) {
    return { found: false };
  }
  const ticket = await getTicketWithMessages(ticketId, scopeOrgId, db);
  if (ticket === null) return { found: false };
  return { found: true, ticket };
}

interface CursorPayload {
  id: string;
}

/** Opaque keyset cursor [realization convention]: base64url of `{ id }` — the exact `id` keyset position
 *  (UUIDv7 total order). A client MUST NOT construct/decode one (Doc-5A §8.2). */
function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.id !== "string" || !UUID_PATTERN.test(record.id)) return null;
  return record.id;
}

/** Injectable POLICY reader (the M0 config service) — defaults to the concrete; injectable for tests. */
export interface ListTicketsDeps {
  configValueQuery: ConfigValueQuery;
}

/**
 * `comm.list_tickets.v1` (Doc-4H §HB-4.5) — the RLS-scoped keyset-paginated ticket read. `status` is the
 * allowlisted filter (§8.3); `page_size` is bounded by `communication.list_page_size_max` (read via M0,
 * never a literal — Doc-5A §8.5; over-max ⇒ SYNTAX 400, never clamped). Keyset "fetch N+1, trim" so
 * `has_more` is computed from the SAME scoped set that produces `items` (Doc-5A §8.7).
 */
export async function listTickets(
  input: ListTicketsInput,
  scopeOrgId: string | null,
  db: DbExecutor = prisma,
  deps: ListTicketsDeps = { configValueQuery },
): Promise<ListTicketsOutcome> {
  // SYNTAX — `status` allowlist (Doc-4A §9.6).
  if (input.status !== undefined && !TICKET_STATUSES.has(input.status)) {
    return { invalidInput: true };
  }

  // page_size bound — the `communication.list_page_size_max` POLICY value (read via M0, never a literal).
  const cfg = await deps.configValueQuery({ key: LIST_PAGE_SIZE_MAX_KEY }, db);
  const pageSizeMax = policyIntegerValue(cfg.value, "communication.list_page_size_max POLICY");

  const pageSize = input.pageSize ?? pageSizeMax;
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > pageSizeMax) {
    return { invalidInput: true }; // over-max is a SYNTAX 400, never clamped (Doc-5A §8.5).
  }

  // cursor — opaque keyset token (Doc-5A §8.1/§8.2); malformed ⇒ SYNTAX 400 (never guessed/repaired).
  let afterId: string | null = null;
  if (input.cursor !== undefined) {
    afterId = decodeCursor(input.cursor);
    if (afterId === null) {
      return { invalidInput: true };
    }
  }

  // Fetch pageSize + 1 (the standard keyset "fetch N+1, trim" trick). Scoped in the app layer.
  const rows = await listTicketsPage(
    { ...(input.status !== undefined ? { status: input.status } : {}), afterId, scopeOrgId },
    pageSize + 1,
    db,
  );

  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  const items: TicketListItem[] = page.map((r) => ({
    ticketId: r.id,
    organizationId: r.organizationId,
    status: r.status as SupportTicketStatusValue,
    subject: r.subject,
    priority: r.priority,
    createdAt: r.createdAt,
  }));

  const last = page[page.length - 1];
  const pageInfo =
    hasMore && last !== undefined
      ? { hasMore: true, nextCursor: encodeCursor({ id: last.id }) }
      : { hasMore: false };

  return { items, pageInfo };
}
