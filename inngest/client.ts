import { Inngest } from "inngest";

// Inngest client (REPOSITORY_STRUCTURE §7; CLAUDE.md §2 — async jobs).
// Async job functions consume the M0 transactional outbox (core.outbox_events) once it
// lands (Doc-6B, Wave 2). At Wave 0 the client is wired but registers no functions.
// Event/signing keys are read from env at runtime (INNGEST_EVENT_KEY / INNGEST_SIGNING_KEY);
// never hardcoded (CLAUDE.md §2).
export const inngest = new Inngest({ id: "ivendorz" });
