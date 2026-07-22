// M5 domain (PRIVATE) — the `fraud_signal_state` transition matrix for the Fraud Signal aggregate. SINGLE
// authority for which fraud-signal lifecycle edges are legal; the write-service
// (`application/services/fraud-signal.service.ts`) MUST consult this and NEVER hand-roll a transition. Pure
// functions (no DB) — reused by the service; no state is owned here.
//
// The legal edges are transcribed from the frozen Doc-4G §H.5 / §G7.2 (bound by pointer; Doc-2 §3.6/§10.6):
//   create:  (absence) ───────────────▶ open       (§G7.1 — entry `open`; not a transition, guarded elsewhere)
//   review:  open ────────────────────▶ reviewed   (§G7.2 — the corpus investigation/acknowledgement step)
//   action:  reviewed ────────────────▶ actioned   (§G7.2 — TERMINAL)
//   dismiss: reviewed ────────────────▶ dismissed  (§G7.2 — TERMINAL)
//
// Forbidden (Doc-4G §G7.2 State Machine Enforcement): any transition from a wrong or TERMINAL source is
// illegal → STATE. `actioned`/`dismissed` are terminal — never reopen. The corpus defines NO
// freeze/reactivate/acknowledge state for fraud signals — NONE is authored; `reviewed` IS the investigation
// step (§H.5). No edge added or modified; no state invented.

/** The `trust.fraud_signal_state` value set (Doc-2 §10.6 / Doc-6G §3.4). Entry `open`; `actioned`/`dismissed`
 *  terminal (Doc-4G §H.5). Do not extend. */
export type FraudSignalState = "open" | "reviewed" | "actioned" | "dismissed";

/** The three triage operations (Doc-4G §G7.2). Create is not a triage op (it establishes the entry `open`). */
export type FraudSignalTriageOperation = "review" | "action" | "dismiss";

/** The two non-terminal states — the create-dedup key's liveness gate (Doc-4G §H.8; a duplicate indicator is
 *  suppressed only while a NON-terminal signal exists for the detection key). Mirrors the partial
 *  `fraud_signals_open_idx` predicate. */
export const FRAUD_SIGNAL_NON_TERMINAL_STATES: ReadonlyArray<FraudSignalState> = [
  "open",
  "reviewed",
];

/** Is `state` non-terminal (`open`/`reviewed`)? A fresh detection dedups against a non-terminal signal;
 *  once the prior signal is terminal (`actioned`/`dismissed`) a new signal MAY open (Doc-4G §H.8 / §G7.1). */
export function isFraudSignalNonTerminal(state: FraudSignalState): boolean {
  return state === "open" || state === "reviewed";
}

/** The target state each triage operation drives to (Doc-4G §G7.2). */
export function fraudSignalTargetState(operation: FraudSignalTriageOperation): FraudSignalState {
  switch (operation) {
    case "review":
      return "reviewed";
    case "action":
      return "actioned";
    case "dismiss":
      return "dismissed";
  }
}

/** The single legal source state each triage operation requires (Doc-4G §G7.2): review←`open`;
 *  action←`reviewed`; dismiss←`reviewed`. */
export function fraudSignalSourceState(operation: FraudSignalTriageOperation): FraudSignalState {
  switch (operation) {
    case "review":
      return "open";
    case "action":
    case "dismiss":
      return "reviewed";
  }
}

/**
 * Is `operation` legal from `currentState`? (Doc-4G §G7.2 State Machine Enforcement.) A wrong or terminal
 * source is illegal → STATE. `review` requires `open`; `action`/`dismiss` require `reviewed`.
 */
export function isFraudSignalSourceLegal(
  operation: FraudSignalTriageOperation,
  currentState: FraudSignalState,
): boolean {
  return currentState === fraudSignalSourceState(operation);
}

/** Thrown when the write-service attempts an edge the machine forbids — mapped to the `STATE` error class
 *  (Doc-4G §G7.2). Carries the rejected operation + source for diagnostics. */
export class IllegalFraudSignalTransitionError extends Error {
  readonly operation: FraudSignalTriageOperation;
  readonly from: FraudSignalState;

  constructor(operation: FraudSignalTriageOperation, from: FraudSignalState) {
    super(`Illegal fraud-signal transition: ${operation} from ${from} (Doc-4G §G7.2).`);
    this.name = "IllegalFraudSignalTransitionError";
    this.operation = operation;
    this.from = from;
  }
}

/**
 * Assert `operation` is legal from `currentState` (fail-closed defense-in-depth); throw
 * `IllegalFraudSignalTransitionError` otherwise. The write-service calls this BEFORE the in-band UPDATE — an
 * illegal edge never reaches the DB.
 */
export function assertFraudSignalTransition(
  operation: FraudSignalTriageOperation,
  currentState: FraudSignalState,
): void {
  if (!isFraudSignalSourceLegal(operation, currentState)) {
    throw new IllegalFraudSignalTransitionError(operation, currentState);
  }
}
