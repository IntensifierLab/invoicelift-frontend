import type { Networks } from "@creit.tech/stellar-wallets-kit";

/**
 * Network passphrase literals, duplicated from `Networks` rather than imported
 * as a value. Importing anything (even a type-adjacent enum) from the package's
 * top-level entry eagerly evaluates its whole module graph, including code that
 * reads `localStorage` at import time — which crashes Next.js's server-side
 * prerender (no `localStorage` in Node). `import type` is erased at compile
 * time, so it's safe; the runtime values below must stay in sync with it.
 *
 * Set NEXT_PUBLIC_STELLAR_NETWORK="PUBLIC" to point at mainnet. Any other
 * value (or unset) defaults to testnet.
 */
export const STELLAR_NETWORK: Networks = (
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015"
) as Networks;

export const STELLAR_NETWORK_LABEL = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? "Mainnet" : "Testnet";
