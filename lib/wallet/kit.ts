import type { StellarWalletsKit as StellarWalletsKitClass } from "@creit.tech/stellar-wallets-kit";
import { STELLAR_NETWORK } from "./config";

let kitPromise: Promise<typeof StellarWalletsKitClass> | undefined;

async function loadAndInitKit(): Promise<typeof StellarWalletsKitClass> {
  const [{ StellarWalletsKit }, { FreighterModule }, { xBullModule }] = await Promise.all([
    import("@creit.tech/stellar-wallets-kit"),
    import("@creit.tech/stellar-wallets-kit/modules/freighter"),
    import("@creit.tech/stellar-wallets-kit/modules/xbull"),
  ]);
  // `selectedWalletId` is intentionally omitted — the kit's `selectedModuleId`/
  // `activeAddress` signals hydrate from localStorage as soon as this module
  // loads, and passing a default here would overwrite a persisted xBull
  // session with Freighter on every reload.
  StellarWalletsKit.init({
    network: STELLAR_NETWORK,
    modules: [new FreighterModule(), new xBullModule()],
  });
  return StellarWalletsKit;
}

/**
 * Lazily loads and initializes the wallet kit, caching the result. Must only
 * be called from browser-side code (an effect or an event handler) — the
 * package cannot be imported during Next.js's server-side prerender because
 * it touches `localStorage` at module-evaluation time.
 */
export function getWalletKit(): Promise<typeof StellarWalletsKitClass> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("The wallet kit is only available in the browser."));
  }
  if (!kitPromise) {
    kitPromise = loadAndInitKit();
  }
  return kitPromise;
}
