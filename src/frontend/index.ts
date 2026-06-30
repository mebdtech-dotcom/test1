// iVendorz Design System & Component Kit (Doc-7B) — the kit's public surface.
// `src/frontend/` is reserved for Doc-7 (REPOSITORY_STRUCTURE §Review Panel). The kit is
// PRESENTATION-ONLY: it receives content by props and owns no data, fetch, or authoritative
// state (BR4/BR10). Cross-module coupling is forbidden by the eslint `frontend` boundary —
// the kit may import only other kit code + framework `shared` (never a module's `contracts/`).
export * from "./primitives";
export * from "./components";
export * from "./embedded";
export * from "./brand";
export { cn } from "./lib/cn";
