"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@/components/wallet-provider";
import { confirmInvoiceAsBuyer } from "@/lib/api/buyerConfirmation";
import { listPendingConfirmations, type PendingConfirmation } from "@/lib/buyer-portal/mock-data";

function formatCurrency(amount: number, currency: string): string {
  return amount.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
}

type RowState = "idle" | "confirming" | "confirmed" | "error";

/**
 * Pending-acknowledgement list with one-click confirm (issue #25). Each row
 * signs its own confirmation message independently, so one invoice failing
 * or being mid-flight doesn't block the others.
 */
export function PendingConfirmations() {
  const { address } = useWallet();
  const invoices = useMemo(() => listPendingConfirmations(), []);
  const [states, setStates] = useState<Record<string, RowState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const confirm = async (invoice: PendingConfirmation) => {
    if (!address) return;
    setStates((s) => ({ ...s, [invoice.invoiceId]: "confirming" }));
    setErrors((e) => ({ ...e, [invoice.invoiceId]: "" }));
    try {
      await confirmInvoiceAsBuyer(invoice.invoiceId, address);
      setStates((s) => ({ ...s, [invoice.invoiceId]: "confirmed" }));
    } catch (err) {
      setStates((s) => ({ ...s, [invoice.invoiceId]: "error" }));
      setErrors((e) => ({
        ...e,
        [invoice.invoiceId]: err instanceof Error ? err.message : "Confirmation failed.",
      }));
    }
  };

  const pending = invoices.filter((inv) => states[inv.invoiceId] !== "confirmed");

  if (pending.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No invoices are waiting on your acknowledgement.</p>;
  }

  return (
    <ul className="buyer-portal-list">
      {pending.map((invoice) => {
        const state = states[invoice.invoiceId] ?? "idle";
        return (
          <li key={invoice.invoiceId} className="buyer-portal-row">
            <div className="buyer-portal-row-details">
              <span className="buyer-portal-row-id">{invoice.invoiceId}</span>
              <span style={{ color: "var(--muted)" }}>{invoice.smeName}</span>
              <span style={{ color: "var(--muted)" }}>
                {formatCurrency(invoice.amount, invoice.currency)} · due {invoice.dueDate}
              </span>
            </div>
            <div className="buyer-portal-row-action">
              {state === "error" && <span className="buyer-portal-row-error">{errors[invoice.invoiceId]}</span>}
              <button
                type="button"
                className="cta-secondary"
                disabled={state === "confirming" || !address}
                onClick={() => void confirm(invoice)}
              >
                {state === "confirming" ? "Signing…" : "Confirm"}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
