"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  findInvoiceRegistryRecords,
  REGISTRY_STATES,
  type InvoiceRegistryRecord,
  type InvoiceRegistryState,
} from "@/lib/invoice-registry/mock-data";

function truncate(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Draft → Verified → Financed → Repaid, with reached steps and the current
 * step visually distinguished from ones not yet reached. */
function StateMachineStepper({ currentState }: { currentState: InvoiceRegistryState }) {
  const currentIndex = REGISTRY_STATES.indexOf(currentState);

  return (
    <ol className="registry-stepper" aria-label="Invoice state">
      {REGISTRY_STATES.map((state, i) => (
        <li
          key={state}
          className={`registry-step${i < currentIndex ? " registry-step-done" : ""}${
            i === currentIndex ? " registry-step-current" : ""
          }`}
          aria-current={i === currentIndex ? "step" : undefined}
        >
          {state}
        </li>
      ))}
    </ol>
  );
}

function RegistryRecordCard({ record }: { record: InvoiceRegistryRecord }) {
  return (
    <div className="card registry-record">
      <div className="registry-record-header">
        <h3>{record.invoiceId}</h3>
        <span className="tag">{formatCurrency(record.amount)}</span>
      </div>
      <p style={{ color: "var(--muted)" }}>
        {record.smeName} &middot; buyer <span title={record.buyerAddress}>{truncate(record.buyerAddress)}</span>
      </p>

      <StateMachineStepper currentState={record.currentState} />

      <ul className="list registry-history">
        {record.history.map((event) => (
          <li key={event.txHash}>
            <strong>{event.state}</strong> &middot;{" "}
            {new Date(event.timestamp).toLocaleString()} &middot;{" "}
            <span title={event.txHash}>{truncate(event.txHash)}</span>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 12 }}>
        <Link href={`/registry/${encodeURIComponent(record.invoiceId)}/nft`} className="cta-secondary">
          View NFT &rarr;
        </Link>
      </p>
    </div>
  );
}

/**
 * Public, read-only invoice-registry status viewer (issue #17). Search state
 * lives in the URL query string (same convention as the invoice list) so a
 * search is shareable/bookmarkable. Deliberately rendered outside
 * `RouteGuard` — no wallet connection or role is required to look up an
 * invoice's on-chain state.
 */
export function InvoiceRegistryStatusViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  const results = useMemo(() => findInvoiceRegistryRecords(q), [q]);

  const setQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.replace(`/registry?${params.toString()}`);
  };

  return (
    <div>
      <div className="registry-search-row">
        <input
          type="search"
          className="registry-search-input"
          placeholder="Search by invoice ID or buyer address…"
          defaultValue={q}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search invoice registry"
        />
      </div>

      {q === "" ? (
        <p className="lender-empty">Enter an invoice ID (e.g. INV-1001) or a buyer address to look up its status.</p>
      ) : results.length === 0 ? (
        <p className="lender-empty">No invoices match &ldquo;{q}&rdquo;.</p>
      ) : (
        <div className="registry-results">
          {results.map((record) => (
            <RegistryRecordCard key={record.invoiceId} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
