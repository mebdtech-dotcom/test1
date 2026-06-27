import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { functions } from "../../../inngest/functions";

// Inngest serve endpoint — thin App-Router entry (REPOSITORY_STRUCTURE §8).
// Registers zero functions at Wave 0 (see inngest/functions); the handler is wired so the
// async-jobs spine exists end-to-end. inngest/ is at the repo root, imported relatively
// (the `@/*` alias maps to src/* only).
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
