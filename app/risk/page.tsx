"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchLenderDashboardData,
  type BuyerExposure,
  type DelinquencyRecordSummary,
  type Pool,
  type SystemicAlert,
} from "@/lib/api/lenderDashboard";
import {
  delinquenciesForPool,
  exposureForPool,
  monthlyDelinquencyTrend,
  poolOptions,
} from "@/lib/api/riskAnalytics";
import { MetricTile } from "@/components/lender/metric-tile";
import { SmeExposureTable } from "@/components/lender/sme-exposure-table";
import { AnomalyPanel } from "@/components/risk/anomaly-panel";
import { DelinquencyTrendChart } from "@/components/risk/delinquency-trend-chart";
import { RouteGuard } from "@/components/route-guard";

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function defaultRate(records: DelinquencyRecordSummary[]): number | undefined {
  if (records.length === 0) return undefined;
  const defaulted = records.filter((r) => r.status === "loss_recognised").length;
  return defaulted / records.length;
}

export default function Page() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
      <RiskAnalyticsContent />
    </RouteGuard>
  );
}

/**
 * Portfolio-level risk analytics dashboard (issue #30). Reuses
 * invoicelift-backend's existing risk/delinquency endpoints (same data
 * lib/api/lenderDashboard.ts already fetches for the lender dashboard) —
 * the drill-down, trend chart, and anomaly panel are all derived views over
 * that same real data, in lib/api/riskAnalytics.ts.
 *
 * Scope note: "exportable as PDF report" is scoped down to a print
 * stylesheet (window.print(), any browser can "Save as PDF" from there)
 * rather than a server-rendered PDF pipeline — see print:hidden below and
 * the PR description for why.
 */
function RiskAnalyticsContent() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [buyerExposure, setBuyerExposure] = useState<BuyerExposure[]>([]);
  const [alerts, setAlerts] = useState<SystemicAlert[]>([]);
  const [delinquencies, setDelinquencies] = useState<DelinquencyRecordSummary[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [poolFilter, setPoolFilter] = useState<string>("all");
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
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pools_ = useMemo(() => poolOptions(pools, alerts), [pools, alerts]);

  const scopedExposure = useMemo(
    () => (poolFilter === "all" ? buyerExposure : exposureForPool(buyerExposure, poolFilter)),
    [buyerExposure, poolFilter],
  );
  const scopedDelinquencies = useMemo(
    () => (poolFilter === "all" ? delinquencies : delinquenciesForPool(delinquencies, poolFilter)),
    [delinquencies, poolFilter],
  );
  const scopedAlerts = useMemo(
    () =>
      poolFilter === "all"
        ? alerts
        : alerts.filter((a) => a.type !== "POOL_UTILISATION" || a.poolId === poolFilter),
    [alerts, poolFilter],
  );

  const trend = useMemo(() => monthlyDelinquencyTrend(scopedDelinquencies), [scopedDelinquencies]);
  const rate = defaultRate(scopedDelinquencies);
  const totalExposure = scopedExposure.reduce((sum, r) => sum + r.totalExposure, 0);

  return (
    <section className="section">
      <div className="lender-header-row print-hidden">
        <div>
          <span className="tag">Risk</span>
          <h2>Portfolio risk analytics</h2>
        </div>
        <div className="lender-header-actions">
          <label className="risk-pool-filter">
            <span>Pool</span>
            <select value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)}>
              <option value="all">All pools</option>
              {pools_.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="cta-secondary" onClick={() => window.print()}>
            Export as PDF
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="lender-errors print-hidden" role="alert">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {loading && pools.length === 0 && errors.length === 0 ? (
        <p className="lender-empty">Loading risk data…</p>
      ) : (
        <>
          <div className="grid lender-metrics">
            <MetricTile label="Buyer/SME exposure" value={`$${totalExposure.toLocaleString("en-US")}`} sub={`${scopedExposure.length} counterpart${scopedExposure.length === 1 ? "y" : "ies"}`} />
            <MetricTile
              label="Default rate"
              value={rate === undefined ? "N/A" : formatPercent(rate)}
              sub={`${scopedDelinquencies.length} tracked receivable${scopedDelinquencies.length === 1 ? "" : "s"}`}
              tone={rate !== undefined && rate > 0.05 ? "warning" : "default"}
            />
            <MetricTile
              label="Anomalies"
              value={String(scopedAlerts.length)}
              tone={scopedAlerts.length > 0 ? "warning" : "default"}
            />
          </div>

          <div className="section">
            <h3>Anomaly detection</h3>
            <AnomalyPanel alerts={scopedAlerts} />
          </div>

          <div className="section">
            <h3>Delinquency trend</h3>
            <DelinquencyTrendChart points={trend} />
          </div>

          <div className="section">
            <h3>Exposure by buyer / SME{poolFilter !== "all" ? ` — ${poolFilter}` : ""}</h3>
            <SmeExposureTable rows={scopedExposure} />
          </div>
        </>
      )}
    </section>
  );
}
