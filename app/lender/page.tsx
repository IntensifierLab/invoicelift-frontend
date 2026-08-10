"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LenderDashboardSkeleton } from "@/components/lender/lender-dashboard-skeleton";
import {
  fetchLenderDashboardData,
  type BuyerExposure,
  type DelinquencyRecordSummary,
  type Pool,
  type SystemicAlert,
} from "@/lib/api/lenderDashboard";
import { MetricTile } from "@/components/lender/metric-tile";
import { PoolHealthChart } from "@/components/lender/pool-health-chart";
import { SmeExposureTable } from "@/components/lender/sme-exposure-table";
import { RouteGuard } from "@/components/route-guard";

// Poll interval for the "real-time" pool metrics. There's no push channel
// (websocket/SSE) from invoicelift-backend yet, so this is the pragmatic
// stand-in — short enough to feel live, long enough not to hammer the API.
const REFRESH_INTERVAL_MS = 30_000;

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function summarize(pools: Pool[]) {
  const tvl = pools.reduce((sum, p) => sum + p.totalCapital, 0);
  const utilised = pools.reduce((sum, p) => sum + p.utilisedCapital, 0);
  return { tvl, utilised, utilisationRatio: tvl === 0 ? 0 : utilised / tvl };
}

function defaultRate(records: DelinquencyRecordSummary[]): number | undefined {
  if (records.length === 0) return undefined;
  const defaulted = records.filter((r) => r.status === "loss_recognised").length;
  return defaulted / records.length;
}

function alertLabel(alert: SystemicAlert): string {
  if (alert.type === "POOL_UTILISATION") {
    return `Pool ${alert.poolId} at ${formatPercent(alert.utilisationRatio)} utilisation (threshold ${formatPercent(alert.threshold)})`;
  }
  return `Buyer ${alert.buyerAddress.slice(0, 8)}… is ${formatPercent(alert.shareOfSystemCapital)} of system capital (threshold ${formatPercent(alert.threshold)})`;
}

export default function LenderDashboardPage() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
      <LenderDashboardContent />
    </RouteGuard>
  );
}

function LenderDashboardContent() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [buyerExposure, setBuyerExposure] = useState<BuyerExposure[]>([]);
  const [alerts, setAlerts] = useState<SystemicAlert[]>([]);
  const [delinquencies, setDelinquencies] = useState<DelinquencyRecordSummary[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const { data, errors: fetchErrors } = await fetchLenderDashboardData();
      if (data.pools) setPools(data.pools);
      if (data.buyerExposure) setBuyerExposure(data.buyerExposure);
      if (data.alerts) setAlerts(data.alerts);
      if (data.delinquencies) setDelinquencies(data.delinquencies);
      setErrors(fetchErrors);
      setLastUpdated(new Date());
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const { tvl, utilised, utilisationRatio } = summarize(pools);
  const rate = defaultRate(delinquencies);

  return (
    <section className="section">
      <span className="tag">Lenders</span>
      <div className="lender-header-row">
        <h2>Pool underwriting dashboard</h2>
        <div className="lender-header-actions">
          {lastUpdated && (
            <span className="lender-updated-at">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button type="button" className="cta-secondary" onClick={() => void load()} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="lender-errors" role="alert">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {loading && pools.length === 0 && errors.length === 0 ? (
              <LenderDashboardSkeleton />
            ) : (
        <>
          <div className="grid lender-metrics">
            <MetricTile label="Total value locked" value={formatCurrency(tvl)} sub={`${pools.length} pool${pools.length === 1 ? "" : "s"}`} />
            <MetricTile
              label="Utilisation"
              value={formatPercent(utilisationRatio)}
              sub={`${formatCurrency(utilised)} financed`}
              tone={utilisationRatio >= 0.9 ? "warning" : "default"}
            />
            <MetricTile
              label="Default rate"
              value={rate === undefined ? "N/A" : formatPercent(rate)}
              sub={`${delinquencies.length} tracked receivable${delinquencies.length === 1 ? "" : "s"}`}
              tone={rate !== undefined && rate > 0.05 ? "warning" : "default"}
            />
            <MetricTile
              label="Active risk alerts"
              value={String(alerts.length)}
              tone={alerts.length > 0 ? "warning" : "default"}
            />
          </div>

          <div className="section">
            <h3>Portfolio health by pool</h3>
            <PoolHealthChart pools={pools} />
          </div>

          {alerts.length > 0 && (
            <div className="section">
              <h3>Risk alerts</h3>
              <ul className="list lender-alerts-list">
                {alerts.map((alert, i) => (
                  <li key={i}>{alertLabel(alert)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="section">
            <h3>SME / buyer exposure</h3>
            <SmeExposureTable rows={buyerExposure} />
          </div>
        </>
      )}
    </section>
  );
}
