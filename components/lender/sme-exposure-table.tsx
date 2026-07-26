"use client";

import { Fragment, useState } from "react";
import type { BuyerExposure } from "@/lib/api/lenderDashboard";
import { downloadCsv, toCsv } from "@/lib/csv";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function truncate(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

function buildCsv(rows: BuyerExposure[]): string {
  const headers = ["buyerAddress", "totalExposure", "poolId", "poolExposure"];
  const lines = rows.flatMap((row) =>
    row.byPool.length > 0
      ? row.byPool.map((p) => [row.buyerAddress, row.totalExposure, p.poolId, p.exposure])
      : [[row.buyerAddress, row.totalExposure, "", ""]],
  );
  return toCsv(headers, lines);
}

/**
 * Per-buyer (SME counterparty) exposure, sorted highest-first by the caller
 * (invoicelift-backend's `getBuyerExposure` already does this). Each row
 * expands to a per-pool breakdown; "Export CSV" downloads the full,
 * unexpanded dataset regardless of which rows are open.
 */
export function SmeExposureTable({ rows }: { rows: BuyerExposure[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (rows.length === 0) {
    return <p className="lender-empty">No verified receivables exposure yet.</p>;
  }

  const toggle = (buyerAddress: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(buyerAddress)) next.delete(buyerAddress);
      else next.add(buyerAddress);
      return next;
    });
  };

  return (
    <div>
      <div className="lender-table-toolbar">
        <button
          type="button"
          className="cta-secondary lender-export-btn"
          onClick={() => downloadCsv(`sme-exposure-${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(rows))}
        >
          Export CSV
        </button>
      </div>
      <table className="lender-table">
        <thead>
          <tr>
            <th>SME / Buyer</th>
            <th>Total exposure</th>
            <th>Pools financed in</th>
            <th aria-label="Expand" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isOpen = expanded.has(row.buyerAddress);
            return (
              <Fragment key={row.buyerAddress}>
                <tr>
                  <td title={row.buyerAddress}>{truncate(row.buyerAddress)}</td>
                  <td>{formatCurrency(row.totalExposure)}</td>
                  <td>{row.byPool.length}</td>
                  <td>
                    <button
                      type="button"
                      className="lender-drilldown-toggle"
                      aria-expanded={isOpen}
                      onClick={() => toggle(row.buyerAddress)}
                    >
                      {isOpen ? "Hide" : "Details"}
                    </button>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="lender-drilldown-row">
                    <td colSpan={4}>
                      {row.byPool.length === 0 ? (
                        <span className="lender-empty">No per-pool breakdown available.</span>
                      ) : (
                        <ul className="lender-drilldown-list">
                          {row.byPool.map((p) => (
                            <li key={p.poolId}>
                              <span>{p.poolId}</span>
                              <span>{formatCurrency(p.exposure)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
