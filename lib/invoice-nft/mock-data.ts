/**
 * Deterministic stand-in for the invoice-NFT contract's storage (issue #35).
 * There is no `invoice-nft` contract deployed yet (see `CONTRACT_IDS.invoiceNft`
 * in `lib/wallet/contracts.ts`), so — same convention as
 * `lib/invoice-registry/mock-data.ts` — this derives a plausible metadata
 * record from the invoice-registry's own mock history instead of inventing
 * unrelated data. Once a contract is deployed, `getInvoiceNftMetadata` in
 * `./index.ts` is the one place that needs to change: this module and its
 * shape can be deleted outright.
 */

import { MOCK_REGISTRY_RECORDS, type InvoiceRegistryRecord } from "@/lib/invoice-registry/mock-data";
import type { InvoiceNftFinancingEvent, InvoiceNftMetadata, InvoiceNftTransfer } from "./contract-reads";

const FINANCIER = "GDFINANCIER3QXHZ4RSOOAOYA6CBFZMR6QMH2HXQVICEQSQ4CBS7Q3XT";
const REPAY_ESCROW = "GDREPAYESCROW4RSOOAOYA6CBFZMR6QMH2HXQVICEQSQ4CBS7Q3XTUOW";

/** Synthesizes a stable, address-shaped "minter" holder for an SME so the
 * viewer always has a real-looking G... address to truncate/link, rather
 * than rendering the SME's display name where an address is expected. */
function syntheticMinterAddress(invoiceId: string): string {
  let seed = 0;
  for (let i = 0; i < invoiceId.length; i++) seed = (seed * 31 + invoiceId.charCodeAt(i)) >>> 0;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let suffix = "";
  for (let i = 0; i < 55; i++) {
    // Multiplicative LCG mixed with the loop index so nearby seeds don't
    // collapse into repeated runs once the multiplication loses precision
    // past Number.MAX_SAFE_INTEGER.
    seed = (Math.imul(seed, 1103515245) + 12345 + i) >>> 0;
    suffix += alphabet[seed % alphabet.length];
  }
  return `G${suffix}`;
}

function deriveTransferHistory(record: InvoiceRegistryRecord): InvoiceNftTransfer[] {
  const transfers: InvoiceNftTransfer[] = [];
  let holder = syntheticMinterAddress(record.invoiceId);

  for (const event of record.history) {
    let to: string | undefined;
    if (event.state === "Verified") to = record.buyerAddress;
    else if (event.state === "Financed") to = FINANCIER;
    else if (event.state === "Repaid") to = REPAY_ESCROW;
    if (!to) continue;

    transfers.push({ from: holder, to, timestamp: event.timestamp, txHash: event.txHash });
    holder = to;
  }

  return transfers;
}

function deriveFinancingEvents(record: InvoiceRegistryRecord): InvoiceNftFinancingEvent[] {
  return record.history
    .filter((event) => event.state === "Financed" || event.state === "Repaid")
    .map((event) => ({
      kind: event.state === "Financed" ? "financed" : "repaid",
      amount: record.amount,
      timestamp: event.timestamp,
      txHash: event.txHash,
    }));
}

function toNftMetadata(record: InvoiceRegistryRecord): InvoiceNftMetadata {
  const transferHistory = deriveTransferHistory(record);
  const currentHolder =
    transferHistory.length > 0 ? transferHistory[transferHistory.length - 1].to : syntheticMinterAddress(record.invoiceId);

  return {
    invoiceId: record.invoiceId,
    tokenId: record.invoiceId,
    mintDate: record.history[0].timestamp,
    currentHolder,
    transferHistory,
    financingEvents: deriveFinancingEvents(record),
  };
}

/** Every mock NFT record, keyed by invoice ID for O(1) lookup. */
export const MOCK_INVOICE_NFTS: Record<string, InvoiceNftMetadata> = Object.fromEntries(
  MOCK_REGISTRY_RECORDS.map((record) => [record.invoiceId, toNftMetadata(record)]),
);

export function findMockInvoiceNft(invoiceId: string): InvoiceNftMetadata | undefined {
  return MOCK_INVOICE_NFTS[invoiceId];
}
