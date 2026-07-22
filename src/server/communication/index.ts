// App-layer composition for M6 caller-facing HTTP surfaces (REPOSITORY_STRUCTURE §5/§8). The thin
// Next.js route entries (`app/api/communication/**`) delegate here; the composition wires Supabase Auth ↔
// active-org / staff context ↔ M6 contracts. Authentication/active-org/staff context are app-layer; RLS
// is the backstop. W3-COMM-1 — the BC-COMM-4 Support Communications surface (Doc-5H §7).

export {
  handleAddTicketMessage,
  handleCloseTicket,
  handleCreateTicket,
  handleGetTicket,
  handleListTickets,
  handleUpdateTicket,
  type ResolveSession,
  type StaffSupportAuthorityCheck,
  type SupportTicketMutationDeps,
  type SupportTicketReadDeps,
} from "./support-ticket.route-handler";
