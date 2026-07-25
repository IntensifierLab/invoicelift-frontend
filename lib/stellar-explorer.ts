import { STELLAR_NETWORK_LABEL } from "@/lib/wallet/config";

/** Builds a stellar.expert link for a transaction hash, pointed at whichever
 * network this deployment is configured for (see `STELLAR_NETWORK_LABEL`). */
export function stellarExplorerTxUrl(txHash: string): string {
  const network = STELLAR_NETWORK_LABEL === "Mainnet" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}
