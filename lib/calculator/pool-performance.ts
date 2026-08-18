/**
 * Historical pool performance stand-in for the yield calculator (issue #23).
 *
 * There is no analytics endpoint yet exposing trailing APY/default-rate
 * history per pool, so this mirrors the deterministic-mock-dataset pattern
 * used elsewhere in this repo (see lib/invoices/mock-data.ts) rather than
 * inventing a fake network call. Swapping this for a real fetch later is a
 * one-function change — every caller only depends on `listPoolPerformance`
 * and `PoolPerformance`.
 */

export type PoolPerformance = {
  poolId: string;
  label: string;
  /** Nominal annualised yield the pool has paid out historically, in basis points. */
  historicalApyBps: number;
  /** Trailing 12-month default rate as a fraction of financed capital (0-1). */
  historicalDefaultRate: number;
};

const POOLS: PoolPerformance[] = [
  { poolId: "pool-senior-usdc", label: "Senior USDC Pool", historicalApyBps: 850, historicalDefaultRate: 0.006 },
  { poolId: "pool-mezz-usdc", label: "Mezzanine USDC Pool", historicalApyBps: 1350, historicalDefaultRate: 0.021 },
  { poolId: "pool-growth-usdc", label: "Growth USDC Pool", historicalApyBps: 1900, historicalDefaultRate: 0.045 },
];

export function listPoolPerformance(): PoolPerformance[] {
  return POOLS;
}

export function getPoolPerformance(poolId: string): PoolPerformance | undefined {
  return POOLS.find((p) => p.poolId === poolId);
}
