import { rpc } from "@stellar/stellar-sdk";
import { STELLAR_NETWORK } from "./config";

/**
 * Soroban RPC endpoint. Testnet has a stable public default; mainnet has no
 * safe public default (rate limits / availability vary by provider), so it
 * must be supplied explicitly in production.
 */
const DEFAULT_TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";

function resolveRpcUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL;
  if (configured) return configured;

  if (process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC") {
    throw new Error(
      "NEXT_PUBLIC_SOROBAN_RPC_URL must be set when NEXT_PUBLIC_STELLAR_NETWORK=PUBLIC " +
        "— there is no safe public default Soroban RPC endpoint for mainnet.",
    );
  }
  return DEFAULT_TESTNET_RPC_URL;
}

let serverPromise: rpc.Server | undefined;

/** Lazily-constructed Soroban RPC client, reused across calls. Browser-only
 * (like `getWalletKit`), since it's only ever needed alongside a connected
 * wallet. */
export function getRpcServer(): rpc.Server {
  if (typeof window === "undefined") {
    throw new Error("The Soroban RPC client is only available in the browser.");
  }
  if (!serverPromise) {
    serverPromise = new rpc.Server(resolveRpcUrl());
  }
  return serverPromise;
}

export { STELLAR_NETWORK };
