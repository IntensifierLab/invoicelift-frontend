/**
 * Deployed contract IDs, one per `invoicelift-contract` crate this app calls
 * into. All are env-driven since the actual deployment addresses differ per
 * network and aren't known at build time. `undefined` means "not deployed /
 * not configured yet" — callers should treat that as the action being
 * unavailable rather than guessing an address.
 */
export const CONTRACT_IDS = {
  poolManager: process.env.NEXT_PUBLIC_POOL_MANAGER_CONTRACT_ID,
  invoiceRegistry: process.env.NEXT_PUBLIC_INVOICE_REGISTRY_CONTRACT_ID,
  repaymentWaterfall: process.env.NEXT_PUBLIC_REPAYMENT_WATERFALL_CONTRACT_ID,
} as const;

export type ContractName = keyof typeof CONTRACT_IDS;

export function requireContractId(name: ContractName): string {
  const id = CONTRACT_IDS[name];
  if (!id) {
    throw new Error(
      `No contract id configured for "${name}" (set NEXT_PUBLIC_${name
        .replace(/([A-Z])/g, "_$1")
        .toUpperCase()}_CONTRACT_ID).`,
    );
  }
  return id;
}
