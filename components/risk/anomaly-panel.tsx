import type { SystemicAlert } from "@/lib/api/lenderDashboard";

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function describe(alert: SystemicAlert): { title: string; detail: string } {
  if (alert.type === "POOL_UTILISATION") {
    return {
      title: `Pool ${alert.poolId} over-utilised`,
      detail: `${formatPercent(alert.utilisationRatio)} utilisation, above the ${formatPercent(alert.threshold)} threshold.`,
    };
  }
  return {
    title: "Buyer concentration risk",
    detail: `${alert.buyerAddress.slice(0, 8)}… holds ${formatPercent(alert.shareOfSystemCapital)} of system capital, above the ${formatPercent(alert.threshold)} threshold.`,
  };
}

/**
 * Surfaces invoicelift-backend's systemic-risk alerts as anomaly highlights
 * (issue #30's "anomaly detection" criterion). The detection itself already
 * happens server-side (riskAnalyticsService); this renders the result
 * prominently instead of the buried list the lender dashboard already has.
 */
export function AnomalyPanel({ alerts }: { alerts: SystemicAlert[] }) {
  if (alerts.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No anomalies detected against current thresholds.</p>;
  }

  return (
    <ul className="risk-anomaly-list">
      {alerts.map((alert, i) => {
        const { title, detail } = describe(alert);
        return (
          <li key={i} className="risk-anomaly-item">
            <span className="risk-anomaly-title">{title}</span>
            <span style={{ color: "var(--muted)" }}>{detail}</span>
          </li>
        );
      })}
    </ul>
  );
}
