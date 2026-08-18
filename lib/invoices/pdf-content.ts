import { CONTRACT_IDS } from "@/lib/wallet/contracts";
import type { Invoice } from "./mock-data";

/**
 * Assembles the fields the invoice PDF document needs (issue #32) beyond
 * what's already on `Invoice`. There is no per-invoice pool assignment or
 * contract reference in the mock dataset, so:
 * - `poolName` is derived deterministically from the invoice id, drawn from
 *   the same pool-naming convention `lib/repayment-waterfall/mock-data.ts`
 *   already uses ("Lagos Textiles Pool" etc.) rather than inventing a new one.
 * - `contractAddress` is the *real*, env-configured invoice-registry
 *   contract id (`CONTRACT_IDS.invoiceRegistry`) — not a placeholder — and
 *   is `undefined` when the app isn't configured with one, which the view
 *   renders honestly as "not yet deployed" rather than a fake address.
 */

const POOLS = [
  { poolId: "pool-1", poolName: "Lagos Textiles Pool" },
  { poolId: "pool-2", poolName: "Kampala Fresh Farms Pool" },
  { poolId: "pool-3", poolName: "Accra Metalworks Pool" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export type InvoicePdfWaterfallRule = {
  label: string;
  detail: string;
};

/**
 * The waterfall policy text (issue #32's "waterfall rules" field). Mirrors
 * the actual split logic in lib/repayment-waterfall/mock-data.ts's
 * `splitAmount` (2% protocol fee, 5% reserve off the top, remainder split
 * between principal recovery and lender yield) as static policy terms
 * appropriate for a document, rather than a live per-repayment computation.
 */
export const WATERFALL_RULES: InvoicePdfWaterfallRule[] = [
  { label: "Protocol fee", detail: "2% of each repayment, taken first." },
  { label: "Reserve", detail: "5% of each repayment, taken second." },
  { label: "Principal & lender yield", detail: "The remainder, split by pool terms." },
];

export type InvoicePdfData = {
  poolId: string;
  poolName: string;
  contractAddress: string | undefined;
  waterfallRules: InvoicePdfWaterfallRule[];
};

export function invoicePdfData(invoice: Invoice): InvoicePdfData {
  const pool = POOLS[hashString(invoice.id) % POOLS.length];
  return {
    poolId: pool.poolId,
    poolName: pool.poolName,
    contractAddress: CONTRACT_IDS.invoiceRegistry,
    waterfallRules: WATERFALL_RULES,
  };
}
