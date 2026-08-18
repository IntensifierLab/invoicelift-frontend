"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLenderDashboardData,
  type BuyerExposure,
  type Pool,
  type SystemicAlert,
} from "@/lib/api/lenderDashboard";
import { computePoolCorrelationMatrix, deriveGovernanceActions } from "@/lib/admin/systemic-risk";
import { GovernanceActions } from "@/components/admin/governance-actions";
import { MetricTile } from "@/components/lender/metric-tile";
import { PoolCorrelationMatrix } from "@/components/admin/pool-correlation-matrix";
import { SmeExposureTable } from "@/components/lender/sme-exposure-table";
import { RouteGuard } from "@/components/route-guard";

// Same pragmatic stand-in for a push channel as the lender dashboard: no
// websocket/SSE from invoicelift-backend yet, so a short poll interval
// carries the "real-time" requirement.
const REFRESH_INTERVAL_MS = 30_000;

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function totalExposure(buyerExposure: BuyerExposure[]): number {
  return buyerExposure.reduce((sum, b) => sum + b.totalExposure, 0);
}

function maxCorrelation(pools: Pool[], buyerExposure: BuyerExposure[]): number {
  const correlations = computePoolCorrelationMatrix(pools, buyerExposure);
  return correlations.reduce((max, c) => Math.max(max, c.score), 0);
}

export default function SystemicRiskDashboardPage() {
  return (
    <RouteGuard allow={["admin"]}>
      <SystemicRiskDashboardContent />
    </RouteGuard>
  );
}

function SystemicRiskDashboardContent() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [buyerExposure, setBuyerExposure] = useState<BuyerExposure[]>([]);
  const [alerts, setAlerts] = useState<SystemicAlert[]>([]);
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

  const correlations = computePoolCorrelationMatrix(pools, buyerExposure);
  const governanceActions = deriveGovernanceActions(alerts, correlations);
  const peakCorrelation = maxCorrelation(pools, buyerExposure);

  return (
    <section className="section">
      <span className="tag">Admin &middot; Systemic risk</span>
      <div className="lender-header-row">
        <h2>Protocol-wide systemic risk</h2>
        <div className="lender-header-actions">
          {lastUpdated && <span className="lender-updated-at">Updated {lastUpdated.toLocaleTimeString()}</span>}
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
        <p className="lender-empty">Loading systemic risk data…</p>
      ) : (
        <>
          <div className="grid lender-metrics">
            <MetricTile label="Pools monitored" value={String(pools.length)} />
            <MetricTile
              label="Total buyer exposure"
              value={formatCurrency(totalExposure(buyerExposure))}
              sub={`${buyerExposure.length} buyer${buyerExposure.length === 1 ? "" : "s"}`}
              tooltip="Total outstanding receivables owed by each buyer (concentration limit input) — how much a single buyer's default could impact the system."
            />
            <MetricTile
              label="Peak pool correlation"
              value={formatPercent(peakCorrelation)}
              tone={peakCorrelation >= 0.6 ? "warning" : "default"}
              tooltip="Highest cosine similarity of shared buyer exposure between any two pools — high correlation means one buyer default can hit multiple pools at once."
            />
            <MetricTile
              label="Active systemic alerts"
              value={String(alerts.length)}
              tone={alerts.length > 0 ? "warning" : "default"}
            />
          </div>

          <div className="section">
            <h3>Cross-pool exposure by buyer</h3>
            <SmeExposureTable rows={buyerExposure} />
          </div>

          <div className="section">
            <h3>Pool correlation matrix</h3>
            <p style={{ color: "var(--muted)" }}>
              Cosine similarity of shared buyer exposure between pools — higher means a single buyer
              default is more likely to hit both pools at once.
            </p>
            <PoolCorrelationMatrix pools={pools} correlations={correlations} />
          </div>

          <div className="section">
            <h3>Recommended governance actions</h3>
            <GovernanceActions actions={governanceActions} />
          </div>
        </>
      )}
    </section>
  );
}
