import type { BuyerExposure, DelinquencyRecordSummary, Pool, SystemicAlert } from "./lenderDashboard";

/** One month's worth of delinquency activity, derived from real records. */
export type MonthlyDelinquencyPoint = {
  /** "YYYY-MM" */
  month: string;
  newRecords: number;
  lossRecognised: number;
};

/**
 * Buckets delinquency records by the month they were created and how many
 * of each month's records ended in `loss_recognised`. There's no
 * historical-snapshot endpoint yet (invoicelift-backend only exposes
 * current-state delinquency records), so this derives a real time series
 * from the `createdAt` timestamps already on each record rather than
 * inventing separate mock history.
 */
export function monthlyDelinquencyTrend(records: DelinquencyRecordSummary[]): MonthlyDelinquencyPoint[] {
  const byMonth = new Map<string, MonthlyDelinquencyPoint>();

  for (const record of records) {
    const month = record.createdAt.slice(0, 7); // "YYYY-MM"
    const point = byMonth.get(month) ?? { month, newRecords: 0, lossRecognised: 0 };
    point.newRecords += 1;
    if (record.status === "loss_recognised") point.lossRecognised += 1;
    byMonth.set(month, point);
  }

  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
}

/** Buyer exposure rows restricted to a single pool's share of each buyer's total. */
export function exposureForPool(rows: BuyerExposure[], poolId: string): BuyerExposure[] {
  return rows
    .map((row) => {
      const byPool = row.byPool.filter((p) => p.poolId === poolId);
      const totalExposure = byPool.reduce((sum, p) => sum + p.exposure, 0);
      return { ...row, byPool, totalExposure };
    })
    .filter((row) => row.byPool.length > 0);
}

/** Delinquency records restricted to a single pool. */
export function delinquenciesForPool(
  records: DelinquencyRecordSummary[],
  poolId: string,
): DelinquencyRecordSummary[] {
  return records.filter((r) => r.poolId === poolId);
}

/** Distinct pool IDs across whichever data sources are loaded, for the drill-down selector. */
export function poolOptions(pools: Pool[], alerts: SystemicAlert[]): string[] {
  const ids = new Set<string>();
  for (const p of pools) ids.add(p.poolId);
  for (const a of alerts) {
    if (a.type === "POOL_UTILISATION") ids.add(a.poolId);
  }
  return [...ids].sort();
}
