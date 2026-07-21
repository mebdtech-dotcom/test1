// Event names + versioned payload types emitted by module "identity" — M1's FIRST two Doc-2 §8
// events (`Doc-2_Patch_v1.0.10` §4; authoritative catalog `Doc-4J_GrowthEvent_Patch_v1.0.1`; flow
// `Doc-4L_GrowthFlow_Patch_v1.0.1`; producing contracts Doc-4C v1.0.3 §C13 + §PROV-EXT — the
// §C12.7 FLIP: `core.write_outbox_event.v1` is now CONSUMED). Declarations bound BY POINTER —
// nothing coined here.
//
// TRANSPORT: the M0 transactional outbox ONLY (business write + event insert in one txn — Doc-6A
// §7.1); NO Doc-5C wire/webhook surface exists for these (the R6 effective reading, Doc-5C v1.0.1
// §4). The envelope fields `event_id` / `occurred_at` are stamped by `core.write_outbox_event.v1`
// and are NOT part of the thin payload types below.
//
// GI-3 (binding): NO raw token and NO `recipient_identifier` ever rides an event payload (§16.5
// thin-payload rule) — M6 fetches delivery material via the internal-service
// `identity.resolve_invitation_delivery_payload.v1` read, never from the persisted envelope.
//
// WIRE CASING: event payloads are wire FACTS — snake_case field names (the M1 casing ruling:
// requests/envelope/enums/identifiers snake_case; only RESULT payloads are camelCase).

/** `InvitationIssued` v1 (Doc-2 v1.0.10 §4 / Doc-4J v1.0.1) — emitted by
 *  `identity.create_invitation.v1` iff `recipient_type` is TARGETED (email/sms/whatsapp);
 *  open link/qr invites emit none (Doc-4C v1.0.3 §C13). Sole consumer: M6 delivery. */
export const INVITATION_ISSUED_EVENT = { name: "InvitationIssued", version: 1 } as const;

/** Thin `InvitationIssued` payload (§16.5) — IDs only; the recipient/token stay OFF the envelope
 *  (GI-3). `delivery_reference_id` keys the M6 delivery-payload resolve. (A type alias, not an
 *  interface, so it satisfies the producer's `Record<string, unknown>` payload surface.) */
export type InvitationIssuedPayload = {
  growth_invitation_id: string;
  /** The closed Doc-2 v1.0.10 §1 recipient-type set (wire enum — snake_case values). */
  recipient_type: "email" | "sms" | "whatsapp" | "link" | "qr";
  delivery_reference_id: string;
};

/** `InvitationConverted` v1 (Doc-2 v1.0.10 §4 / Doc-4J v1.0.1) — emitted by the `provisionIdentity`
 *  attribution extension (Doc-4C v1.0.3 §PROV-EXT) on a successful GI-1 bind. Consumer: the M7
 *  System referral-create branch (Doc-4I v1.0.1). */
export const INVITATION_CONVERTED_EVENT = { name: "InvitationConverted", version: 1 } as const;

/** Thin `InvitationConverted` payload (§16.5) — the six declared fields (Doc-4J v1.0.1);
 *  `campaign_key`/`recipient_type` are the ONE sanctioned denormalized snapshot (Doc-6C v1.0.4 §3
 *  note). No token, no recipient identifier (GI-3). */
export type InvitationConvertedPayload = {
  conversion_id: string;
  growth_invitation_id: string;
  campaign_key: string;
  /** The closed Doc-2 v1.0.10 §1 recipient-type set (wire enum — snake_case values). */
  recipient_type: "email" | "sms" | "whatsapp" | "link" | "qr";
  referrer_organization_id: string;
  referred_organization_id: string;
};
