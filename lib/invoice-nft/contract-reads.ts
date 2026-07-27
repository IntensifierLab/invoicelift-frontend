import { Account, BASE_FEE, Contract, Keypair, TransactionBuilder, nativeToScVal, rpc, scValToNative } from "@stellar/stellar-sdk";
import { CONTRACT_IDS } from "@/lib/wallet/contracts";
import { getRpcServer, STELLAR_NETWORK } from "@/lib/wallet/rpc";

export type InvoiceNftTransfer = {
  from: string;
  to: string;
  timestamp: string; // ISO 8601, from the ledger close time
  txHash: string;
};

export type InvoiceNftFinancingEvent = {
  kind: string;
  amount: number;
  timestamp: string;
  txHash: string;
};

export type InvoiceNftMetadata = {
  invoiceId: string;
  tokenId: string;
  mintDate: string;
  currentHolder: string;
  transferHistory: InvoiceNftTransfer[];
  financingEvents: InvoiceNftFinancingEvent[];
};

/** Raised whenever a genuine on-chain read isn't possible — no contract
 * configured yet, or the RPC simulation itself failed — so callers can fall
 * back to a stand-in data source instead of crashing the viewer. */
export class InvoiceNftUnavailableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "InvoiceNftUnavailableError";
  }
}

/**
 * Reads invoice NFT metadata straight from the `invoice-nft` contract's
 * storage via a simulated (read-only) `nft_metadata` invocation — this is a
 * real Soroban RPC call, not a mock. No signing or submission is required
 * since simulation doesn't mutate ledger state, so a throwaway keypair
 * stands in for a funded source account (simulation never checks its
 * sequence number against the network).
 */
export async function fetchInvoiceNftFromContract(invoiceId: string): Promise<InvoiceNftMetadata> {
  const contractId = CONTRACT_IDS.invoiceNft;
  if (!contractId) {
    throw new InvoiceNftUnavailableError(
      "No invoice-NFT contract configured (set NEXT_PUBLIC_INVOICE_NFT_CONTRACT_ID).",
    );
  }

  const server = getRpcServer();
  const simulationSource = new Account(Keypair.random().publicKey(), "0");
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(simulationSource, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK,
  })
    .addOperation(contract.call("nft_metadata", nativeToScVal(invoiceId, { type: "string" })))
    .setTimeout(30)
    .build();

  let sim;
  try {
    sim = await server.simulateTransaction(tx);
  } catch (err) {
    throw new InvoiceNftUnavailableError(
      `Couldn't reach the invoice-NFT contract to read metadata for "${invoiceId}".`,
      err,
    );
  }

  if (rpc.Api.isSimulationError(sim)) {
    throw new InvoiceNftUnavailableError(`Contract rejected the "nft_metadata" read: ${sim.error}`);
  }

  const retval = sim.result?.retval;
  if (!retval) {
    throw new InvoiceNftUnavailableError(`No NFT is recorded on-chain for invoice "${invoiceId}".`);
  }

  return scValToNative(retval) as InvoiceNftMetadata;
}
