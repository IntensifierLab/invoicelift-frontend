import type { Pool } from "@/lib/api/lenderDashboard";
import { CORRELATION_ALERT_THRESHOLD, type PoolCorrelation } from "@/lib/admin/systemic-risk";

function scoreFor(correlations: PoolCorrelation[], a: string, b: string): number {
  if (a === b) return 1;
  const hit = correlations.find(
    (c) => (c.poolIdA === a && c.poolIdB === b) || (c.poolIdA === b && c.poolIdB === a),
  );
  return hit?.score ?? 0;
}

function toneForScore(score: number, isDiagonal: boolean): string {
  if (isDiagonal) return "correlation-cell-diagonal";
  if (score >= CORRELATION_ALERT_THRESHOLD) return "correlation-cell-high";
  if (score >= 0.3) return "correlation-cell-medium";
  return "correlation-cell-low";
}

/**
 * NxN matrix of pairwise pool correlation (issue #36's "correlation matrix
 * of pool exposures"). Cells above the threshold used by
 * `deriveGovernanceActions` are colour-flagged so the contagion channel is
 * visible before reading the recommendation text below.
 */
export function PoolCorrelationMatrix({
  pools,
  correlations,
}: {
  pools: Pool[];
  correlations: PoolCorrelation[];
}) {
  if (pools.length < 2) {
    return <p className="lender-empty">Need at least two pools to compute correlations.</p>;
  }

  return (
    <div className="correlation-matrix-wrap">
      <table className="correlation-matrix" role="table" aria-label="Pool exposure correlation matrix">
        <thead>
          <tr>
            <th aria-label="Pool" />
            {pools.map((pool) => (
              <th key={pool.poolId}>{pool.poolId}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pools.map((rowPool) => (
            <tr key={rowPool.poolId}>
              <th scope="row">{rowPool.poolId}</th>
              {pools.map((colPool) => {
                const isDiagonal = rowPool.poolId === colPool.poolId;
                const score = scoreFor(correlations, rowPool.poolId, colPool.poolId);
                return (
                  <td
                    key={colPool.poolId}
                    className={`correlation-cell ${toneForScore(score, isDiagonal)}`}
                    title={`${rowPool.poolId} × ${colPool.poolId}: ${(score * 100).toFixed(0)}%`}
                  >
                    {(score * 100).toFixed(0)}%
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
