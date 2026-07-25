"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import {
  listRepaymentWaterfallEntries,
  uniquePools,
  type RepaymentWaterfallEntry,
} from "@/lib/repayment-waterfall/mock-data";
import { stellarExplorerTxUrl } from "@/lib/stellar-explorer";
import { RepaymentWaterfallChart } from "./waterfall-chart";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function truncate(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

/**
 * Historical repayment log with pool/date filters (issue #18). Filter state
 * lives in the URL query string (same convention as the invoice list), and
 * each row expands to its waterfall chart and a Stellar Explorer link for
 * the settling transaction.
 */
export function RepaymentLog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pools = useMemo(() => uniquePools(), []);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const poolId = searchParams.get("pool") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const entries = useMemo(
    () => listRepaymentWaterfallEntries({ poolId, from, to }),
    [poolId, from, to],
  );

  const setFilter = (key: "pool" | "from" | "to", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/waterfall?${params.toString()}`);
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="lender-table-toolbar">
        <select
          className="waterfall-filter-input"
          value={poolId ?? ""}
          onChange={(e) => setFilter("pool", e.target.value)}
          aria-label="Filter by pool"
        >
          <option value="">All pools</option>
          {pools.map((pool) => (
            <option key={pool.poolId} value={pool.poolId}>
              {pool.poolName}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from ?? ""}
          onChange={(e) => setFilter("from", e.target.value)}
          aria-label="From date"
        />
        <input
          type="date"
          value={to ?? ""}
          onChange={(e) => setFilter("to", e.target.value)}
          aria-label="To date"
        />
      </div>

      {entries.length === 0 ? (
        <p className="lender-empty">No repayments match these filters.</p>
      ) : (
        <table className="lender-table">
          <thead>
            <tr>
              <th>Repayment</th>
              <th>Pool</th>
              <th>Total</th>
              <th>Date</th>
              <th>Explorer</th>
              <th aria-label="Expand" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry: RepaymentWaterfallEntry) => {
              const isOpen = expanded.has(entry.id);
              return (
                <Fragment key={entry.id}>
                  <tr>
                    <td>{entry.id}</td>
                    <td>{entry.poolName}</td>
                    <td>{formatCurrency(entry.totalAmount)}</td>
                    <td>{new Date(entry.timestamp).toLocaleDateString()}</td>
                    <td>
                      <a href={stellarExplorerTxUrl(entry.txHash)} target="_blank" rel="noreferrer">
                        {truncate(entry.txHash)}
                      </a>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="lender-drilldown-toggle"
                        aria-expanded={isOpen}
                        onClick={() => toggle(entry.id)}
                      >
                        {isOpen ? "Hide" : "Waterfall"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="lender-drilldown-row">
                      <td colSpan={6}>
                        <RepaymentWaterfallChart entry={entry} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
