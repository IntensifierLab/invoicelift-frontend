"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInvoiceNftMetadata, type InvoiceNftMetadata } from "@/lib/invoice-nft";
import { stellarExplorerAddressUrl, stellarExplorerTxUrl } from "@/lib/stellar-explorer";
import { TransferHistoryChart } from "./transfer-history-chart";

function truncate(value: string): string {
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * On-chain invoice NFT viewer (issue #35): metadata, current holder, transfer
 * history, and financing events for one invoice's tokenized representation.
 * Reads through `getInvoiceNftMetadata`, which prefers a real Soroban
 * contract-storage read and falls back to the mock dataset while no
 * `invoice-nft` contract is deployed (see `lib/invoice-nft/index.ts`).
 */
export function InvoiceNftViewer({ invoiceId }: { invoiceId: string }) {
  const [data, setData] = useState<InvoiceNftMetadata | undefined>(undefined);
  const [source, setSource] = useState<"chain" | "mock" | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getInvoiceNftMetadata(invoiceId).then((result) => {
      if (cancelled) return;
      setData(result.data);
      setSource(result.source);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  if (loading) {
    return <p style={{ color: "var(--muted)" }}>Loading on-chain NFT data…</p>;
  }

  if (!data) {
    return (
      <div className="empty-state">
        <p className="empty-state-heading">Nothing to show</p>
        <p className="empty-state-copy">{error ?? `No NFT is recorded for invoice "${invoiceId}".`}</p>
      </div>
    );
  }

  return (
    <div>
      {source === "mock" && (
        <p className="nft-source-note">
          Showing simulated data — no <code>invoice-nft</code> contract is configured on this deployment yet.
        </p>
      )}
      {source === "chain" && error && (
        <p className="nft-source-note" role="alert">
          {error}
        </p>
      )}

      <div className="grid">
        <div className="card">
          <h3>Token</h3>
          <p>{data.tokenId}</p>
        </div>
        <div className="card">
          <h3>Mint date</h3>
          <p>{new Date(data.mintDate).toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Current holder</h3>
          <p>
            <a href={stellarExplorerAddressUrl(data.currentHolder)} target="_blank" rel="noreferrer" title={data.currentHolder}>
              {truncate(data.currentHolder)}
            </a>
          </p>
        </div>
      </div>

      <div className="section">
        <h3>Ownership timeline</h3>
        <TransferHistoryChart mintDate={data.mintDate} transfers={data.transferHistory} />
      </div>

      <div className="section">
        <h3>Transfer history</h3>
        {data.transferHistory.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No transfers yet.</p>
        ) : (
          <ul className="list nft-transfer-list">
            {data.transferHistory.map((transfer) => (
              <li key={transfer.txHash}>
                <span title={transfer.from}>{truncate(transfer.from)}</span> &rarr;{" "}
                <span title={transfer.to}>{truncate(transfer.to)}</span> &middot;{" "}
                {new Date(transfer.timestamp).toLocaleString()} &middot;{" "}
                <a href={stellarExplorerTxUrl(transfer.txHash)} target="_blank" rel="noreferrer" title={transfer.txHash}>
                  {truncate(transfer.txHash)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h3>Financing events</h3>
        {data.financingEvents.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No financing events yet.</p>
        ) : (
          <ul className="list nft-financing-list">
            {data.financingEvents.map((event) => (
              <li key={event.txHash}>
                <strong>{event.kind}</strong> &middot; {formatCurrency(event.amount)} &middot;{" "}
                {new Date(event.timestamp).toLocaleString()} &middot;{" "}
                <a href={stellarExplorerTxUrl(event.txHash)} target="_blank" rel="noreferrer" title={event.txHash}>
                  {truncate(event.txHash)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p>
        <Link href={`/registry?q=${encodeURIComponent(invoiceId)}`} className="cta-secondary">
          &larr; Back to registry
        </Link>
      </p>
    </div>
  );
}
