// Event names + versioned payload types emitted by module "communication" (Doc-2 §8 / Doc-4J catalog).
//
// BC-COMM-4 (Support Communications) emits NO Doc-2 §8 domain event and consumes none (Doc-4H §H7 /
// Doc-5H R11 — single-authorship intact; support-ticket activity is not a domain event). The audited
// write is `business write + audit append` in ONE transaction with NO outbox/event leg. This stub stays
// empty deliberately — no event is coined. (Other M6 BCs' consumed events land with their own waves.)
export {};
