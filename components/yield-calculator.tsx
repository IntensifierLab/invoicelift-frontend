"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { estimateYield } from "@/lib/calculator/estimate";
import { listPoolPerformance } from "@/lib/calculator/pool-performance";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

const HOLDING_PERIOD_PRESETS = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "180 days", days: 180 },
  { label: "365 days", days: 365 },
];

/**
 * Interactive yield estimator (issue #23). Pure client-side computation —
 * `estimateYield` runs on every keystroke, no network round-trip, so the
 * numbers below update live as the lender adjusts inputs.
 */
export function YieldCalculator() {
  const pools = useMemo(() => listPoolPerformance(), []);
  const [depositAmount, setDepositAmount] = useState(10_000);
  const [poolId, setPoolId] = useState(pools[0]?.poolId ?? "");
  const [holdingPeriodDays, setHoldingPeriodDays] = useState(90);

  const result = useMemo(
    () => estimateYield({ depositAmount, poolId, holdingPeriodDays }),
    [depositAmount, poolId, holdingPeriodDays],
  );

  const depositParams = new URLSearchParams({
    amount: String(depositAmount),
    pool: poolId,
  }).toString();

  return (
    <div className="yield-calculator">
      <div className="yield-calculator-inputs">
        <label className="yield-calculator-field">
          <span>Deposit amount</span>
          <input
            type="number"
            min={1}
            step={100}
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
          />
        </label>

        <label className="yield-calculator-field">
          <span>Pool</span>
          <select value={poolId} onChange={(e) => setPoolId(e.target.value)}>
            {pools.map((pool) => (
              <option key={pool.poolId} value={pool.poolId}>
                {pool.label} ({formatPercent(pool.historicalApyBps)} APY)
              </option>
            ))}
          </select>
        </label>

        <label className="yield-calculator-field">
          <span>Holding period</span>
          <select
            value={holdingPeriodDays}
            onChange={(e) => setHoldingPeriodDays(Number(e.target.value))}
          >
            {HOLDING_PERIOD_PRESETS.map((preset) => (
              <option key={preset.days} value={preset.days}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result ? (
        <div className="yield-calculator-results">
          <div className="metric-tile">
            <span className="metric-tile-label">Expected yield</span>
            <span className="metric-tile-value">{formatCurrency(result.expectedYield)}</span>
            <span className="metric-tile-sub">
              {formatPercent(result.expectedApyBps)} APY, net of {formatCurrency(result.expectedLoss)}{" "}
              expected losses
            </span>
          </div>
          <div className="metric-tile metric-tile-warning">
            <span className="metric-tile-label">Worst-case scenario</span>
            <span className="metric-tile-value">{formatCurrency(result.worstCase.expectedYield)}</span>
            <span className="metric-tile-sub">
              Stress default rate {(result.worstCase.stressDefaultRate * 100).toFixed(1)}% (3x historical)
            </span>
          </div>

          <p style={{ color: "var(--muted)" }}>
            Based on {result.poolLabel}&apos;s trailing 12-month performance. Past performance does not
            guarantee future results.
          </p>

          <Link href={`/liquidity?${depositParams}`} className="cta">
            Deposit {formatCurrency(depositAmount)} into {result.poolLabel}
          </Link>
        </div>
      ) : (
        <p style={{ color: "var(--muted)" }}>Enter a deposit amount to see an estimate.</p>
      )}
    </div>
  );
}
