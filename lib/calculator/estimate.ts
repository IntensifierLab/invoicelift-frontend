import { getPoolPerformance } from "./pool-performance";

export type YieldEstimateInput = {
  depositAmount: number;
  poolId: string;
  holdingPeriodDays: number;
};

export type YieldEstimateResult = {
  poolId: string;
  poolLabel: string;
  /** Gross interest before any defaults, pro-rated for the holding period. */
  grossReturn: number;
  /** Expected loss to defaults over the holding period, at the pool's historical default rate. */
  expectedLoss: number;
  /** grossReturn - expectedLoss: the headline number shown to the user. */
  expectedYield: number;
  expectedApyBps: number;
  worstCase: {
    /**
     * Stress default rate applied for the worst-case scenario: 3x the pool's
     * historical rate, capped at 100%. There's no VaR/Monte-Carlo model
     * behind this yet — it's a simple, clearly-labelled stress multiplier
     * standing in for one, same spirit as the rest of this repo's
     * placeholder-but-real data (see lib/calculator/pool-performance.ts).
     */
    stressDefaultRate: number;
    expectedLoss: number;
    expectedYield: number;
  };
};

const STRESS_MULTIPLIER = 3;
const DAYS_PER_YEAR = 365;

/**
 * Estimates the yield a lender would earn depositing `depositAmount` into
 * `poolId` for `holdingPeriodDays`, using the pool's historical APY and
 * default rate (see pool-performance.ts). Returns `undefined` if the pool
 * or inputs are invalid so the caller can render a clear error instead of
 * a nonsensical number.
 */
export function estimateYield(input: YieldEstimateInput): YieldEstimateResult | undefined {
  const { depositAmount, poolId, holdingPeriodDays } = input;
  if (!Number.isFinite(depositAmount) || depositAmount <= 0) return undefined;
  if (!Number.isFinite(holdingPeriodDays) || holdingPeriodDays <= 0) return undefined;

  const pool = getPoolPerformance(poolId);
  if (!pool) return undefined;

  const periodFraction = holdingPeriodDays / DAYS_PER_YEAR;
  const grossReturn = depositAmount * (pool.historicalApyBps / 10_000) * periodFraction;
  const expectedLoss = depositAmount * pool.historicalDefaultRate * periodFraction;
  const expectedYield = grossReturn - expectedLoss;

  const stressDefaultRate = Math.min(pool.historicalDefaultRate * STRESS_MULTIPLIER, 1);
  const worstCaseLoss = depositAmount * stressDefaultRate * periodFraction;
  const worstCaseYield = grossReturn - worstCaseLoss;

  return {
    poolId: pool.poolId,
    poolLabel: pool.label,
    grossReturn,
    expectedLoss,
    expectedYield,
    expectedApyBps: pool.historicalApyBps,
    worstCase: {
      stressDefaultRate,
      expectedLoss: worstCaseLoss,
      expectedYield: worstCaseYield,
    },
  };
}
