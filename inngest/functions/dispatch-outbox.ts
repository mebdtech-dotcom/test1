import { archiveDispatchedEvents, dispatchOutboxEvents } from "@/modules/core/contracts";
import { inngest } from "../client";

// M0 transactional-outbox event pump (REPOSITORY_STRUCTURE §7; Doc-4B §B6 — M0 owns the outbox).
// THIN by design: the worker mechanics live in M0 infrastructure
// (`src/modules/core/infrastructure/events`) and are consumed here ONLY through M0's public contract
// surface (`@/modules/core/contracts`) — strictly contracts/-only cross-module access (no M0 internal
// import; the One-Module rule is intact).
//
// This job realizes the two Doc-4B §B6 System/Phase-2 workers as DISTINCT durable steps:
//   1. `core.phase2_dispatch_outbox_events.v1`    — `pending → dispatched` (+ retry/backoff, dead-
//                                                    letter park, reconciliation; all POLICY-bounded).
//   2. `core.phase2_archive_dispatched_events.v1` — `dispatched → archived` (retention-bounded).
// Distinct steps ⇒ dispatch and archival are distinctly observed (Doc-8B §7.2). Each step is a single
// durable, retriable Inngest step; the workers are idempotent + forward-only, so overlapping ticks and
// step retries advance nothing twice.
//
// TRANSPORT ONLY (§B6 Events-Produced: none): this job pumps the outbox lifecycle; it COINS NO domain
// event (Doc-2 §8 / Doc-4J / Doc-4L untouched). EMITTER-AGNOSTIC (R-a / ESC-W1-OUTBOX): it drains
// whatever `pending` rows exist — test-seeded now, real write-plus-emit rows in Wave 2 — identically.
//
// The [D-5] outbox-audit-granularity leg is BOARD-PENDING and is NOT wired here (dispatch mechanics
// only). The dead-letter (`deadLettered`) and reconciliation (`reconciledStuck`) counts returned by
// the dispatch step are the ops-telemetry alert surface (§B6 "never silently drop") — surfaced via the
// durable step output; parked rows are retained, never dropped.
//
// Triggers:
//   - a cron tick (steady-state polling of the outbox), and
//   - an internal fan-in event `core/outbox.drain.requested` (an immediate drain nudge — NOT a domain
//     event; an infrastructure control signal local to the dispatcher, carrying no business payload).

/** Internal infrastructure control signal (NOT a Doc-2 §8 domain event) — an immediate-drain nudge. */
export const OUTBOX_DRAIN_REQUESTED = "core/outbox.drain.requested" as const;

/** Steady-state poll cadence for the outbox pump. Mechanical infra cadence, not a business rule. */
const OUTBOX_DISPATCH_CRON = "* * * * *" as const; // every minute

export const dispatchOutbox = inngest.createFunction(
  { id: "core-dispatch-outbox", name: "M0 outbox event pump (dispatch + archive)" },
  [{ cron: OUTBOX_DISPATCH_CRON }, { event: OUTBOX_DRAIN_REQUESTED }],
  async ({ step }) => {
    // Step 1 — the §B6 dispatch worker (pending → dispatched, POLICY-bounded retry/backoff/DLQ + recon).
    const dispatch = await step.run("dispatch-outbox-events", () => dispatchOutboxEvents());

    // Step 2 — the §B6 archival worker (dispatched → archived, retention-bounded). DISTINCT step so the
    // two legs are separately durable and separately observed (Doc-8B §7.2).
    const archive = await step.run("archive-dispatched-events", () => archiveDispatchedEvents());

    return { dispatch, archive };
  },
);
