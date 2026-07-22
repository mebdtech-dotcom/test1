// Composition root for module "communication" — wires the module and exposes contracts only
// (REPOSITORY_STRUCTURE §3). W3-COMM-1 realizes the BC-COMM-4 Support Communications surface (Doc-4H
// Pass-B Part-4; Doc-5H §7): the four audited Support-Ticket mutations + the two reads. Other modules
// consume `communicationServices`, never the application/infrastructure layers directly.

import {
  addTicketMessage,
  closeTicket,
  createTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "./contracts/services";

/** The M6 caller-facing Support-Ticket surface realized so far (BC-COMM-4). */
export const communicationServices = {
  createTicket,
  updateTicket,
  addTicketMessage,
  closeTicket,
  getTicket,
  listTickets,
};
