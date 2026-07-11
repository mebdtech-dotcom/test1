// Framework-level shared code ("ids") — NOT a domain module (REPOSITORY_STRUCTURE section 5).
//
// UUIDv7 machine-identifier generation (Doc-4B §8 / Architecture §17.2): the only canonical
// machine identifier is a time-ordered UUIDv7, generated algorithmically in-process. This is
// the platform-wide ID generator; raw UUIDs are never minted in application code (Coding Rules).
// Human references (TYPE-YEAR-XXXXX) are a SEPARATE mechanism owned by M0's id_sequences
// (Doc-6B §3.3 — core.allocate_human_ref), not produced here (CR6).

import { randomBytes } from "node:crypto";

/**
 * Generate a time-ordered UUIDv7 (RFC 9562 §5.7): 48-bit big-endian Unix-millisecond timestamp,
 * 4-bit version (0b0111), 12-bit random, 2-bit variant (0b10), 62-bit random. Lexicographic
 * order tracks creation time — required for the time-ordered `core.audit_records.audit_id` PK
 * (Doc-6B §3.1 / CR3) and the outbox `id` ordering.
 */
export function uuidv7(): string {
  const bytes = randomBytes(16);

  // 48-bit millisecond timestamp into bytes 0..5 (big-endian).
  const ms = Date.now();
  bytes[0] = (ms / 0x10000000000) & 0xff;
  bytes[1] = (ms / 0x100000000) & 0xff;
  bytes[2] = (ms / 0x1000000) & 0xff;
  bytes[3] = (ms / 0x10000) & 0xff;
  bytes[4] = (ms / 0x100) & 0xff;
  bytes[5] = ms & 0xff;

  // Version 7 in the high nibble of byte 6.
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // RFC 4122 variant (0b10) in the high bits of byte 8.
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return (
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-` +
    `${hex.slice(16, 20)}-${hex.slice(20, 32)}`
  );
}

/** Canonical UUID syntax matcher (any version) — the platform-wide SYNTAX gate for a machine id on an
 *  API surface (Doc-4A §9). Format only (a well-formed UUID string); never a UUIDv7-version assertion. */
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
