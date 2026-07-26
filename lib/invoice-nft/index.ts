import { CONTRACT_IDS } from "@/lib/wallet/contracts";
import { fetchInvoiceNftFromContract, InvoiceNftUnavailableError, type InvoiceNftMetadata } from "./contract-reads";
import { findMockInvoiceNft } from "./mock-data";

export type {
  InvoiceNftFinancingEvent,
  InvoiceNftMetadata,
  InvoiceNftTransfer,
} from "./contract-reads";

export type InvoiceNftResult = {
  data: InvoiceNftMetadata | undefined;
  /** "chain" once a real `invoice-nft` contract is configured and answers
   * the read; "mock" while there's nothing deployed yet. */
  source: "chain" | "mock";
  error: string | undefined;
};

/**
 * Fetches on-chain invoice NFT metadata, preferring a real Soroban contract
 * read (`fetchInvoiceNftFromContract`) whenever `NEXT_PUBLIC_INVOICE_NFT_CONTRACT_ID`
 * is configured. With no contract deployed yet — the current state of every
 * environment this app runs in today — it falls back to the deterministic
 * mock dataset so the viewer is still fully testable; this mirrors the same
 * "swap later" convention already used by `lib/invoice-registry/mock-data.ts`.
 */
export async function getInvoiceNftMetadata(invoiceId: string): Promise<InvoiceNftResult> {
  if (CONTRACT_IDS.invoiceNft) {
    try {
      const data = await fetchInvoiceNftFromContract(invoiceId);
      return { data, source: "chain", error: undefined };
    } catch (err) {
      const message = err instanceof InvoiceNftUnavailableError ? err.message : "Couldn't read the invoice-NFT contract.";
      return { data: undefined, source: "chain", error: message };
    }
  }

  const data = findMockInvoiceNft(invoiceId);
  return {
    data,
    source: "mock",
    error: data ? undefined : `No invoice found for "${invoiceId}".`,
  };
}
