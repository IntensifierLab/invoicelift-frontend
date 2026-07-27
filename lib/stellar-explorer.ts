import { STELLAR_NETWORK_LABEL } from "@/lib/wallet/config";

function explorerNetworkSegment(): string {
  return STELLAR_NETWORK_LABEL === "Mainnet" ? "public" : "testnet";
}

/** Builds a stellar.expert link for a transaction hash, pointed at whichever
 * network this deployment is configured for (see `STELLAR_NETWORK_LABEL`). */
export function stellarExplorerTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/${explorerNetworkSegment()}/tx/${txHash}`;
}

/** Builds a stellar.expert link for an account/contract address. */
export function stellarExplorerAddressUrl(address: string): string {
  return `https://stellar.expert/explorer/${explorerNetworkSegment()}/account/${address}`;
}
