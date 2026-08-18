"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { POOLS, filterPools, utilisationRatio, type PoolFilters } from "@/lib/lender/pools-catalog";
import styles from "./pool-participation.module.css";

function pct(bpsOrRatio: number, isBps = true): string {
  const ratio = isBps ? bpsOrRatio / 10_000 : bpsOrRatio;
  return `${(ratio * 100).toFixed(1)}%`;
}

/** Pool browser with concentration-limit, yield, and utilisation filters (issue #19). */
export function PoolBrowser() {
  const [minApy, setMinApy] = useState("");
  const [maxConcentration, setMaxConcentration] = useState("");
  const [maxUtilisation, setMaxUtilisation] = useState("");

  const filters: PoolFilters = useMemo(
    () => ({
      minApyBps: minApy ? Number(minApy) * 100 : undefined,
      maxConcentrationLimitBps: maxConcentration ? Number(maxConcentration) * 100 : undefined,
      maxUtilisation: maxUtilisation ? Number(maxUtilisation) / 100 : undefined,
    }),
    [minApy, maxConcentration, maxUtilisation]
  );

  const pools = useMemo(() => filterPools(POOLS, filters), [filters]);

  return (
    <div>
      <div className={styles.filters} aria-label="Pool filters">
        <label className={styles.filterField}>
          <span>Min APY (%)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={minApy}
            onChange={(e) => setMinApy(e.target.value)}
          />
        </label>
        <label className={styles.filterField}>
          <span>Max concentration limit (%)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={maxConcentration}
            onChange={(e) => setMaxConcentration(e.target.value)}
          />
        </label>
        <label className={styles.filterField}>
          <span>Max utilisation (%)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            value={maxUtilisation}
            onChange={(e) => setMaxUtilisation(e.target.value)}
          />
        </label>
      </div>

      <p>
        {pools.length} pool{pools.length === 1 ? "" : "s"} match
      </p>

      <div className={styles.grid}>
        {pools.map((pool) => (
          <Link key={pool.id} href={`/lender/pools/${pool.id}`} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{pool.name}</h3>
              <span className={styles.apy}>{pct(pool.apyBps)}</span>
            </div>
            <p>{pool.description}</p>
            <div className={styles.metricsRow}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Utilisation</span>
                <span className={styles.metricValue}>{pct(utilisationRatio(pool), false)}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Concentration limit</span>
                <span className={styles.metricValue}>{pct(pool.concentrationLimitBps)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
