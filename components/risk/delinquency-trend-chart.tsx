import type { MonthlyDelinquencyPoint } from "@/lib/api/riskAnalytics";

/**
 * Monthly delinquency trend, one bar per month, split into total new
 * records vs. the loss-recognised subset. Plain CSS bars, matching the
 * approach in components/lender/pool-health-chart.tsx — no chart library
 * dependency for this app's chart-scale needs.
 */
export function DelinquencyTrendChart({ points }: { points: MonthlyDelinquencyPoint[] }) {
  if (points.length === 0) {
    return <p className="lender-empty">No delinquency history to chart yet.</p>;
  }

  const max = Math.max(...points.map((p) => p.newRecords), 1);

  return (
    <div className="risk-trend-chart" role="table" aria-label="Monthly delinquency trend">
      {points.map((point) => (
        <div className="risk-trend-row" role="row" key={point.month}>
          <span className="risk-trend-month" role="cell">
            {point.month}
          </span>
          <div className="risk-trend-bar-track" role="cell">
            <div className="risk-trend-bar-fill" style={{ width: `${(point.newRecords / max) * 100}%` }}>
              {point.lossRecognised > 0 && (
                <div
                  className="risk-trend-bar-loss"
                  style={{ width: `${(point.lossRecognised / point.newRecords) * 100}%` }}
                />
              )}
            </div>
          </div>
          <span className="risk-trend-counts" role="cell">
            {point.newRecords} tracked{point.lossRecognised > 0 ? `, ${point.lossRecognised} lost` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
