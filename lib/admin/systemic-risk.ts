/**
 * Systemic-risk analytics for the protocol-admin dashboard (issue #36).
 * Cross-pool exposure and threshold alerts already come straight from
 * invoicelift-backend (see `lib/api/lenderDashboard.ts`); the pool
 * correlation matrix and governance recommendations below are derived
 * client-side from that same data, since there is no backend endpoint for
 * either yet.
 */

import type { BuyerExposure, Pool, SystemicAlert } from "@/lib/api/lenderDashboard";

export type PoolCorrelation = {
  poolIdA: string;
  poolIdB: string;
  /** Cosine similarity, in [0, 1], between the two pools' per-buyer exposure
   * vectors. 0 = the pools share no buyers; 1 = every buyer is exposed to
   * both pools in the same proportion. */
  score: number;
};

/**
 * Correlates pools by shared buyer exposure: two pools are "correlated" to
 * the extent the same buyers owe both of them, because a single buyer
 * default would hit both simultaneously — the contagion channel a
 * per-pool view can't reveal. Computed as the cosine similarity between
 * each pool's buyer-address -> exposure-amount vector.
 */
export function computePoolCorrelationMatrix(
  pools: Pool[],
  buyerExposure: BuyerExposure[],
): PoolCorrelation[] {
  const poolIds = pools.map((p) => p.poolId);

  const exposureByPool = new Map<string, Map<string, number>>();
  for (const poolId of poolIds) exposureByPool.set(poolId, new Map());
  for (const buyer of buyerExposure) {
    for (const { poolId, exposure } of buyer.byPool) {
      exposureByPool.get(poolId)?.set(buyer.buyerAddress, exposure);
    }
  }

  const norm = (poolId: string): number => {
    let sumSq = 0;
    for (const v of exposureByPool.get(poolId)?.values() ?? []) sumSq += v * v;
    return Math.sqrt(sumSq);
  };

  const dot = (poolIdA: string, poolIdB: string): number => {
    const a = exposureByPool.get(poolIdA);
    const b = exposureByPool.get(poolIdB);
    if (!a || !b) return 0;
    let sum = 0;
    for (const [buyerAddress, exposureA] of a) {
      const exposureB = b.get(buyerAddress);
      if (exposureB !== undefined) sum += exposureA * exposureB;
    }
    return sum;
  };

  const correlations: PoolCorrelation[] = [];
  for (let i = 0; i < poolIds.length; i++) {
    for (let j = i + 1; j < poolIds.length; j++) {
      const poolIdA = poolIds[i];
      const poolIdB = poolIds[j];
      const normA = norm(poolIdA);
      const normB = norm(poolIdB);
      const score = normA === 0 || normB === 0 ? 0 : dot(poolIdA, poolIdB) / (normA * normB);
      correlations.push({ poolIdA, poolIdB, score });
    }
  }
  return correlations;
}

/** Pairs whose correlation meets/exceeds this are flagged as a contagion
 * channel worth a governance recommendation. */
export const CORRELATION_ALERT_THRESHOLD = 0.6;

export type GovernanceAction = {
  severity: "high" | "medium";
  action: string;
};

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Turns raw systemic alerts and pool correlations into concrete, surfaced
 * recommendations for protocol governance — the last acceptance criterion
 * for issue #36. Alerts map to their standard mitigation; a correlated pair
 * of pools (both above the threshold) gets a diversification
 * recommendation, since that's the contagion risk a correlation alone
 * doesn't act on.
 */
export function deriveGovernanceActions(
  alerts: SystemicAlert[],
  correlations: PoolCorrelation[],
): GovernanceAction[] {
  const actions: GovernanceAction[] = [];

  for (const alert of alerts) {
    if (alert.type === "POOL_UTILISATION") {
      actions.push({
        severity: "high",
        action: `Pool ${alert.poolId} is at ${formatPercent(alert.utilisationRatio)} utilisation (threshold ${formatPercent(alert.threshold)}) — raise its capital cap or pause new financing until utilisation eases.`,
      });
    } else {
      actions.push({
        severity: "high",
        action: `Buyer ${alert.buyerAddress.slice(0, 8)}… holds ${formatPercent(alert.shareOfSystemCapital)} of system capital (threshold ${formatPercent(alert.threshold)}) — impose a per-buyer concentration cap across all pools.`,
      });
    }
  }

  for (const correlation of correlations) {
    if (correlation.score >= CORRELATION_ALERT_THRESHOLD) {
      actions.push({
        severity: "medium",
        action: `Pools ${correlation.poolIdA} and ${correlation.poolIdB} share ${formatPercent(correlation.score)} correlated buyer exposure — a shared buyer default would hit both at once; diversify underwriting between them.`,
      });
    }
  }

  return actions;
}
