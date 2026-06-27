#!/usr/bin/env node
// 10-schema probe (Board ruling R-a on ESC-W0-MIGRATE-SCHEMAS) — asserts the 10 FROZEN module
// schema namespaces exist after `prisma migrate deploy`. Realizes the Wave-0 Exit-Gate clause
// "10 schemas migrate clean". Requires DATABASE_URL (CI postgres service / local docker-compose).
// Exit 1 if any of the 10 namespaces is missing.

import { execSync } from "node:child_process";

const SQL = `
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM information_schema.schemata
  WHERE schema_name IN
    ('core','identity','marketplace','rfq','operations','trust','communication','billing','admin','ai');
  IF n <> 10 THEN
    RAISE EXCEPTION 'expected 10 frozen module schemas, found %', n;
  END IF;
  RAISE NOTICE '10 frozen module schemas present.';
END $$;
`;

try {
  execSync("npx prisma db execute --schema prisma/schema.prisma --stdin", {
    input: SQL,
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log("schema check: all 10 frozen module schemas present.");
} catch {
  console.error("SCHEMA CHECK FAILED — not all 10 frozen module schemas exist after migrate.");
  process.exit(1);
}
