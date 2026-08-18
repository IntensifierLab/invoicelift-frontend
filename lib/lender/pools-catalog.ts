// Pool catalog for the lender participation flow (issue #19). Distinct from
// `lib/api/lenderDashboard.ts`'s `Pool` (the live underwriting-dashboard
// summary) — this is the richer, browsable listing shape a prospective
// lender needs before depositing: yield, concentration limit, terms.
export interface PoolListing {
  id: string;
  name: string;
  asset: string;
  apyBps: number; // basis points, e.g. 850 = 8.50%
  concentrationLimitBps: number; // max share of pool capital any single buyer may represent
  totalCapital: number;
  utilisedCapital: number;
  minDepositUsdc: number;
  lockupDays: number;
  description: string;
}

export const POOLS: PoolListing[] = [
  {
    id: "pool-lagos-trade",
    name: "Lagos Trade Finance Pool",
    asset: "USDC",
    apyBps: 1150,
    concentrationLimitBps: 2000,
    totalCapital: 2_400_000,
    utilisedCapital: 1_840_000,
    minDepositUsdc: 500,
    lockupDays: 30,
    description: "Short-tenor invoice financing for SMEs supplying Lagos-area retail buyers.",
  },
  {
    id: "pool-accra-fmcg",
    name: "Accra FMCG Pool",
    asset: "USDC",
    apyBps: 950,
    concentrationLimitBps: 1500,
    totalCapital: 1_100_000,
    utilisedCapital: 690_000,
    minDepositUsdc: 250,
    lockupDays: 14,
    description: "Fast-moving consumer goods receivables from Accra-based distributors.",
  },
  {
    id: "pool-abidjan-export",
    name: "Abidjan Export Pool",
    asset: "USDC",
    apyBps: 1340,
    concentrationLimitBps: 2500,
    totalCapital: 640_000,
    utilisedCapital: 610_000,
    minDepositUsdc: 1_000,
    lockupDays: 45,
    description: "Higher-yield, higher-utilisation pool financing cross-border export invoices.",
  },
];

export function utilisationRatio(pool: PoolListing): number {
  return pool.totalCapital === 0 ? 0 : pool.utilisedCapital / pool.totalCapital;
}

export function findPool(id: string): PoolListing | undefined {
  return POOLS.find((p) => p.id === id);
}

export interface PoolFilters {
  minApyBps?: number;
  maxConcentrationLimitBps?: number;
  maxUtilisation?: number;
}

export function filterPools(pools: PoolListing[], filters: PoolFilters): PoolListing[] {
  return pools.filter((p) => {
    if (filters.minApyBps !== undefined && p.apyBps < filters.minApyBps) return false;
    if (
      filters.maxConcentrationLimitBps !== undefined &&
      p.concentrationLimitBps > filters.maxConcentrationLimitBps
    )
      return false;
    if (filters.maxUtilisation !== undefined && utilisationRatio(p) > filters.maxUtilisation) return false;
    return true;
  });
}
