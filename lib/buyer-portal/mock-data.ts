/**
 * Invoices awaiting a buyer's acknowledgement (issue #25). There is no
 * `GET /invoices?status=pending_buyer_signature` endpoint yet — the list
 * views this frontend already ships (see lib/invoices/mock-data.ts) are
 * similarly mock-data-driven pending a real fetch, so this follows the same
 * convention. The confirm action itself (`confirmInvoiceAsBuyer` in
 * lib/api/buyerConfirmation.ts) is wired to the real, documented
 * `/invoices/:id/buyer-signature` endpoint — only the list is a stand-in.
 */

export type PendingConfirmation = {
  invoiceId: string;
  smeName: string;
  amount: number;
  currency: string;
  dueDate: string; // ISO date
  poolId: string;
};

const PENDING_CONFIRMATIONS: PendingConfirmation[] = [
  {
    invoiceId: "INV-1042",
    smeName: "Lagos Textiles Co",
    amount: 18_500,
    currency: "USDC",
    dueDate: "2026-09-12",
    poolId: "pool-senior-usdc",
  },
  {
    invoiceId: "INV-1057",
    smeName: "Accra Metalworks",
    amount: 9_200,
    currency: "USDC",
    dueDate: "2026-09-20",
    poolId: "pool-mezz-usdc",
  },
  {
    invoiceId: "INV-1063",
    smeName: "Nairobi Coffee Traders",
    amount: 32_750,
    currency: "USDC",
    dueDate: "2026-10-01",
    poolId: "pool-senior-usdc",
  },
];

/** All invoices currently awaiting this buyer's acknowledgement. */
export function listPendingConfirmations(): PendingConfirmation[] {
  return PENDING_CONFIRMATIONS;
}
