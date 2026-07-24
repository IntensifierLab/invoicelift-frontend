import type { Pool } from "@/lib/api/lenderDashboard";

function utilisationRatio(pool: Pool): number {
  return pool.totalCapital === 0 ? 0 : pool.utilisedCapital / pool.totalCapital;
}

function toneForRatio(ratio: number): "ok" | "warn" | "critical" {
  if (ratio >= 0.9) return "critical";
  if (ratio >= 0.7) return "warn";
  return "ok";
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * One horizontal bar per pool, length = utilisation ratio, colour-coded by
 * how close the pool is to fully financed (a plain SVG/CSS bar rather than a
 * charting library — this dashboard has no other chart-scale needs yet).
 */
export function PoolHealthChart({ pools }: { pools: Pool[] }) {
  if (pools.length === 0) {
    return <p className="lender-empty">No pools reported yet.</p>;
  }

  return (
    <div className="pool-health-chart" role="table" aria-label="Pool utilisation">
      {pools.map((pool) => {
        const ratio = utilisationRatio(pool);
        const tone = toneForRatio(ratio);
        return (
          <div className="pool-health-row" role="row" key={pool.poolId}>
            <div className="pool-health-label" role="cell">
              <span className="pool-health-id">{pool.poolId}</span>
              <span className="pool-health-amounts">
                {formatCurrency(pool.utilisedCapital)} / {formatCurrency(pool.totalCapital)}
              </span>
            </div>
            <div className="pool-health-bar-track" role="cell">
              <div
                className={`pool-health-bar-fill pool-health-bar-${tone}`}
                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
            </div>
            <span className="pool-health-pct" role="cell">
              {(ratio * 100).toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
