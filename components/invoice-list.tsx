"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { StatusBadge } from "@/components/status-badge";
import {
  type InvoiceStatus,
  queryInvoices,
  uniqueBuyers,
} from "@/lib/invoices/mock-data";

const PAGE_SIZE = 10;
const STATUSES: InvoiceStatus[] = ["pending", "financed", "repaid", "overdue"];

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: "Pending",
  financed: "Financed",
  repaid: "Repaid",
  overdue: "Overdue",
};

/**
 * Paginated, filterable, searchable invoice list (issue #20). Filter state
 * lives entirely in the URL query string so a filtered view is shareable/
 * bookmarkable and survives a refresh; there is no local component state.
 */
export function InvoiceList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyers = useMemo(() => uniqueBuyers(), []);

  const q = searchParams.get("q") ?? "";
  const status = (searchParams.get("status") as InvoiceStatus | null) ?? undefined;
  const buyer = searchParams.get("buyer") ?? undefined;
  const minAmount = searchParams.get("min") ? Number(searchParams.get("min")) : undefined;
  const maxAmount = searchParams.get("max") ? Number(searchParams.get("max")) : undefined;
  const dueAfter = searchParams.get("from") ?? undefined;
  const dueBefore = searchParams.get("to") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const result = useMemo(
    () =>
      queryInvoices({
        q: q || undefined,
        status,
        buyer,
        minAmount,
        maxAmount,
        dueAfter,
        dueBefore,
        page,
        pageSize: PAGE_SIZE,
      }),
    [q, status, buyer, minAmount, maxAmount, dueAfter, dueBefore, page]
  );

  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  function updateParams(updates: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    router.push(`/invoices?${next.toString()}`);
  }

  return (
    <div className="invoice-list">
      <aside className="invoice-filters" aria-label="Filters">
        <label className="invoice-filter-field">
          <span>Status</span>
          <select
            value={status ?? ""}
            onChange={(e) => updateParams({ status: e.target.value || undefined })}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="invoice-filter-field">
          <span>Buyer</span>
          <select
            value={buyer ?? ""}
            onChange={(e) => updateParams({ buyer: e.target.value || undefined })}
          >
            <option value="">All</option>
            {buyers.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <div className="invoice-filter-field">
          <span>Amount (USDC)</span>
          <div className="invoice-filter-range">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Min"
              aria-label="Minimum amount"
              defaultValue={minAmount ?? ""}
              onBlur={(e) => updateParams({ min: e.target.value || undefined })}
            />
            <input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Max"
              aria-label="Maximum amount"
              defaultValue={maxAmount ?? ""}
              onBlur={(e) => updateParams({ max: e.target.value || undefined })}
            />
          </div>
        </div>

        <label className="invoice-filter-field">
          <span>Due after</span>
          <input
            type="date"
            defaultValue={dueAfter ?? ""}
            onBlur={(e) => updateParams({ from: e.target.value || undefined })}
          />
        </label>

        <label className="invoice-filter-field">
          <span>Due before</span>
          <input
            type="date"
            defaultValue={dueBefore ?? ""}
            onBlur={(e) => updateParams({ to: e.target.value || undefined })}
          />
        </label>
      </aside>

      <div className="invoice-main">
        <input
          type="search"
          className="invoice-search"
          placeholder="Search by invoice ID or SME name…"
          aria-label="Search invoices"
          defaultValue={q}
          onChange={(e) => updateParams({ q: e.target.value || undefined })}
        />

        <p className="invoice-result-count">
          {result.total} invoice{result.total === 1 ? "" : "s"}
        </p>

        <table className="invoice-table">
          <thead>
            <tr>
              <th scope="col">Invoice ID</th>
              <th scope="col">SME</th>
              <th scope="col">Buyer</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Due date</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.smeName}</td>
                <td>{inv.buyer}</td>
                <td>
                  {inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {inv.currency}
                </td>
                <td>
                  <StatusBadge status={inv.status} />
                </td>
                <td>{inv.dueDate}</td>
              </tr>
            ))}
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={6} className="invoice-empty-row">
                  No invoices match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <nav className="invoice-pagination" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) }, false)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) }, false)}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
}
